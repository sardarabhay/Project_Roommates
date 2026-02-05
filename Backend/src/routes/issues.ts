import express, { Request, Response, Router } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router: Router = express.Router();


// Validation
const validateIssue: ValidationChain[] = [
  body('title').trim().notEmpty().withMessage('Title is required'),
];

// GET /api/issues - Get all issues
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    // Get current user's household
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { householdId: true },
    });

    if (!currentUser?.householdId) {
      res.status(400).json({ error: 'You must be in a household to view issues' });
      return;
    }

    const issues = await prisma.issue.findMany({
      where: { householdId: currentUser.householdId },
      include: {
        reportedByUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(issues);
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Failed to get issues' });
  }
});

// POST /api/issues - Report new issue
router.post('/', authenticateToken, validateIssue, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user!.id;
    
    // Get current user's household
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { householdId: true },
    });

    if (!currentUser?.householdId) {
      res.status(400).json({ error: 'You must be in a household to report issues' });
      return;
    }

    const { title, description } = req.body as { title: string; description?: string };

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        reportedByUserId: userId,
        householdId: currentUser.householdId,
      },
      include: {
        reportedByUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    res.status(201).json(issue);
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

// PUT /api/issues/:id - Update issue
router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, status } = req.body as { 
      title?: string; 
      description?: string; 
      status?: string 
    };

    const issue = await prisma.issue.update({
      where: { id: parseInt(req.params.id as string) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
      },
      include: {
        reportedByUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    res.json(issue);
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ error: 'Failed to update issue' });
  }
});

// PUT /api/issues/:id/status - Update issue status
router.put('/:id/status', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body as { status: string };

    if (!['Reported', 'In Progress', 'Resolved'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const issue = await prisma.issue.update({
      where: { id: parseInt(req.params.id as string) },
      data: { status },
      include: {
        reportedByUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    res.json(issue);
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({ error: 'Failed to update issue status' });
  }
});

// DELETE /api/issues/:id - Delete issue
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.issue.delete({
      where: { id: parseInt(req.params.id as string) },
    });

    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ error: 'Failed to delete issue' });
  }
});

export default router;
