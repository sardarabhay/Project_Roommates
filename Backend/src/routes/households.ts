import express, { Request, Response, RequestHandler } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { emitToHousehold, SocketEvents } from '../lib/socket.js';
import { sendNotificationToHousehold, NotificationTemplates } from '../lib/notifications.js';

const router = express.Router();

// Generate a random invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'HH-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create a new household
const createHousehold: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Household name is required' });
      return;
    }

    // Check if user is already in a household
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { householdId: true },
    });

    if (existingUser?.householdId) {
      res.status(400).json({ error: 'You are already in a household. Leave your current household first.' });
      return;
    }

    // Create household with unique invite code
    let inviteCode = generateInviteCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.household.findUnique({
        where: { inviteCode },
      });
      if (!existing) break;
      inviteCode = generateInviteCode();
      attempts++;
    }

    const household = await prisma.household.create({
      data: {
        name,
        inviteCode,
        createdByUserId: userId,
      },
    });

    // Update user to be admin of this household
    await prisma.user.update({
      where: { id: userId },
      data: {
        householdId: household.id,
        role: 'admin',
      },
    });

    res.status(201).json({
      id: household.id,
      name: household.name,
      inviteCode: household.inviteCode,
      role: 'admin',
    });
  } catch (error) {
    console.error('Error creating household:', error);
    res.status(500).json({ error: 'Failed to create household' });
  }
};

// Get current user's household
const getCurrentHousehold: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        household: {
          include: {
            members: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!user?.household) {
      res.json({ household: null });
      return;
    }

    res.json({
      household: {
        id: user.household.id,
        name: user.household.name,
        inviteCode: user.household.inviteCode,
        createdByUserId: user.household.createdByUserId,
        members: user.household.members,
        myRole: user.role,
      },
    });
  } catch (error) {
    console.error('Error fetching household:', error);
    res.status(500).json({ error: 'Failed to fetch household' });
  }
};

// Join a household with invite code
const joinHousehold: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { inviteCode } = req.body;

    if (!inviteCode) {
      res.status(400).json({ error: 'Invite code is required' });
      return;
    }

    // Check if user is already in a household
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { householdId: true },
    });

    if (existingUser?.householdId) {
      res.status(400).json({ error: 'You are already in a household. Leave your current household first.' });
      return;
    }

    // Find household by invite code
    const household = await prisma.household.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
    });

    if (!household) {
      res.status(404).json({ error: 'Invalid invite code' });
      return;
    }

    // Add user to household
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        householdId: household.id,
        role: 'member',
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
      },
    });

    // Emit socket event to existing household members
    emitToHousehold(household.id, SocketEvents.MEMBER_JOINED, updatedUser);

    // Send push notification to household
    await sendNotificationToHousehold(
      household.id,
      NotificationTemplates.memberJoined(updatedUser.name),
      userId
    );

    res.json({
      message: 'Successfully joined household',
      household: {
        id: household.id,
        name: household.name,
      },
    });
  } catch (error) {
    console.error('Error joining household:', error);
    res.status(500).json({ error: 'Failed to join household' });
  }
};

// Leave household
const leaveHousehold: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        household: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!user?.household) {
      res.status(400).json({ error: 'You are not in a household' });
      return;
    }

    // If user is admin and there are other members, they can't leave
    if (user.role === 'admin' && user.household.members.length > 1) {
      res.status(400).json({ 
        error: 'As admin, you must transfer admin role to another member or remove all members before leaving' 
      });
      return;
    }

    // If user is the only member, delete the household
    if (user.household.members.length === 1) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          householdId: null,
          role: 'member',
        },
      });

      await prisma.household.delete({
        where: { id: user.household.id },
      });

      res.json({ message: 'Left and deleted household (you were the only member)' });
      return;
    }

    // Regular member leaving
    await prisma.user.update({
      where: { id: userId },
      data: {
        householdId: null,
        role: 'member',
      },
    });

    res.json({ message: 'Successfully left household' });
  } catch (error) {
    console.error('Error leaving household:', error);
    res.status(500).json({ error: 'Failed to leave household' });
  }
};

// Request to remove a member (admin only, requires voting)
const requestRemoveMember: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { targetUserId, reason } = req.body;

    if (!targetUserId) {
      res.status(400).json({ error: 'Target user ID is required' });
      return;
    }

    const requester = await prisma.user.findUnique({
      where: { id: userId },
      include: { household: { include: { members: true } } },
    });

    if (!requester?.household || !requester.householdId) {
      res.status(400).json({ error: 'You are not in a household' });
      return;
    }

    const householdId = requester.householdId;

    if (requester.role !== 'admin') {
      res.status(403).json({ error: 'Only admin can request member removal' });
      return;
    }

    // Check if target is in the same household
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser || targetUser.householdId !== requester.householdId) {
      res.status(400).json({ error: 'Target user is not in your household' });
      return;
    }

    if (targetUserId === userId) {
      res.status(400).json({ error: 'You cannot request to remove yourself' });
      return;
    }

    // Check if there's already a pending removal request for this user
    const existingRequest = await prisma.removalRequest.findFirst({
      where: {
        targetUserId,
        householdId: householdId,
        status: 'pending',
      },
    });

    if (existingRequest) {
      res.status(400).json({ error: 'There is already a pending removal request for this member' });
      return;
    }

    // Create removal request
    const removalRequest = await prisma.removalRequest.create({
      data: {
        householdId: householdId,
        targetUserId,
        requestedByUserId: userId,
        reason,
      },
      include: {
        targetUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // If there are only 2 members (admin and target), auto-approve
    if (requester.household.members.length === 2) {
      await prisma.removalRequest.update({
        where: { id: removalRequest.id },
        data: { status: 'approved' },
      });

      await prisma.user.update({
        where: { id: targetUserId },
        data: { householdId: null, role: 'member' },
      });

      res.json({ 
        message: 'Member removed (auto-approved as there are only 2 members)',
        status: 'approved',
      });
      return;
    }

    res.status(201).json({
      message: 'Removal request created. Waiting for other members to vote.',
      removalRequest: {
        id: removalRequest.id,
        targetUser: removalRequest.targetUser,
        reason,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error('Error requesting member removal:', error);
    res.status(500).json({ error: 'Failed to request member removal' });
  }
};

// Vote on a removal request
const voteOnRemoval: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const removalRequestId = parseInt(req.params.id as string);
    const { vote } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(vote)) {
      res.status(400).json({ error: 'Vote must be "approve" or "reject"' });
      return;
    }

    const removalRequest = await prisma.removalRequest.findUnique({
      where: { id: removalRequestId },
      include: {
        household: { include: { members: true } },
        votes: true,
      },
    });

    if (!removalRequest || removalRequest.status !== 'pending') {
      res.status(404).json({ error: 'Removal request not found or already resolved' });
      return;
    }

    // Check if voter is in the same household
    const voter = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!voter || voter.householdId !== removalRequest.householdId) {
      res.status(403).json({ error: 'You are not in this household' });
      return;
    }

    // Can't vote on own removal
    if (removalRequest.targetUserId === userId) {
      res.status(400).json({ error: 'You cannot vote on your own removal' });
      return;
    }

    // Check if already voted
    const existingVote = await prisma.removalVote.findUnique({
      where: {
        removalRequestId_userId: {
          removalRequestId,
          userId,
        },
      },
    });

    if (existingVote) {
      res.status(400).json({ error: 'You have already voted' });
      return;
    }

    // Record vote
    await prisma.removalVote.create({
      data: {
        removalRequestId,
        userId,
        vote,
      },
    });

    // Check if we have enough votes to decide
    const allVotes = await prisma.removalVote.findMany({
      where: { removalRequestId },
    });

    const approveVotes = allVotes.filter((v: { vote: string }) => v.vote === 'approve').length;
    const rejectVotes = allVotes.filter((v: { vote: string }) => v.vote === 'reject').length;
    
    // Eligible voters: all members except the target
    const eligibleVoters = removalRequest.household.members.length - 1;
    const majorityNeeded = Math.ceil(eligibleVoters / 2);

    let result: 'pending' | 'approved' | 'rejected' = 'pending';

    if (approveVotes >= majorityNeeded) {
      result = 'approved';
      await prisma.removalRequest.update({
        where: { id: removalRequestId },
        data: { status: 'approved' },
      });

      // Remove user from household
      await prisma.user.update({
        where: { id: removalRequest.targetUserId },
        data: { householdId: null, role: 'member' },
      });
    } else if (rejectVotes >= majorityNeeded) {
      result = 'rejected';
      await prisma.removalRequest.update({
        where: { id: removalRequestId },
        data: { status: 'rejected' },
      });
    }

    res.json({
      message: 'Vote recorded',
      approveVotes,
      rejectVotes,
      totalEligible: eligibleVoters,
      result,
    });
  } catch (error) {
    console.error('Error voting on removal:', error);
    res.status(500).json({ error: 'Failed to vote on removal' });
  }
};

// Get pending removal requests
const getPendingRemovals: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.householdId) {
      res.json({ removalRequests: [] });
      return;
    }

    const removalRequests = await prisma.removalRequest.findMany({
      where: {
        householdId: user.householdId,
        status: 'pending',
      },
      include: {
        targetUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
        requestedByUser: {
          select: { id: true, name: true },
        },
        votes: {
          select: {
            userId: true,
            vote: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      removalRequests: removalRequests.map((rr: typeof removalRequests[number]) => ({
        id: rr.id,
        targetUser: rr.targetUser,
        requestedBy: rr.requestedByUser,
        reason: rr.reason,
        votes: rr.votes,
        myVote: rr.votes.find((v: { userId: number; vote: string }) => v.userId === userId)?.vote || null,
        createdAt: rr.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching removal requests:', error);
    res.status(500).json({ error: 'Failed to fetch removal requests' });
  }
};

// Regenerate invite code (admin only)
const regenerateInviteCode: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.householdId) {
      res.status(400).json({ error: 'You are not in a household' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({ error: 'Only admin can regenerate invite code' });
      return;
    }

    // Generate new unique code
    let newCode = generateInviteCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.household.findUnique({
        where: { inviteCode: newCode },
      });
      if (!existing) break;
      newCode = generateInviteCode();
      attempts++;
    }

    await prisma.household.update({
      where: { id: user.householdId },
      data: { inviteCode: newCode },
    });

    res.json({ inviteCode: newCode });
  } catch (error) {
    console.error('Error regenerating invite code:', error);
    res.status(500).json({ error: 'Failed to regenerate invite code' });
  }
};

// Apply authentication to all routes
router.use(authenticateToken as RequestHandler);

router.post('/', createHousehold);
router.get('/current', getCurrentHousehold);
router.post('/join', joinHousehold);
router.post('/leave', leaveHousehold);
router.post('/removal-request', requestRemoveMember);
router.post('/removal-request/:id/vote', voteOnRemoval);
router.get('/removal-requests', getPendingRemovals);
router.post('/regenerate-code', regenerateInviteCode);

export default router;
