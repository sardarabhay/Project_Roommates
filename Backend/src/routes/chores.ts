import express, { Request, Response, Router } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import type { ChoresGrouped } from '../types/index.js';

const router: Router = express.Router();


// Validation
const validateChore: ValidationChain[] = [
  body('title').trim().notEmpty().withMessage('Title is required'),
];

// GET /api/chores - Get all chores grouped by status
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    // Get current user's household
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { householdId: true },
    });

    if (!currentUser?.householdId) {
      res.json({ todo: [], in_progress: [], done: [] });
      return;
    }

    const chores = await prisma.chore.findMany({
      where: {
        isArchived: false,
        householdId: currentUser.householdId,
      },
      include: {
        assignedToUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by status
    const grouped: ChoresGrouped = {
      todo: chores.filter((c) => c.status === 'todo'),
      in_progress: chores.filter((c) => c.status === 'in_progress'),
      done: chores.filter((c) => c.status === 'done'),
    };

    res.json(grouped);
  } catch (error) {
    console.error('Get chores error:', error);
    res.status(500).json({ error: 'Failed to get chores' });
  }
});

// GET /api/chores/list - Get all chores as flat list
router.get('/list', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    // Get current user's household
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { householdId: true },
    });

    if (!currentUser?.householdId) {
      res.json([]);
      return;
    }

    const chores = await prisma.chore.findMany({
      where: {
        isArchived: false,
        householdId: currentUser.householdId,
      },
      include: {
        assignedToUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(chores);
  } catch (error) {
    console.error('Get chores list error:', error);
    res.status(500).json({ error: 'Failed to get chores' });
  }
});

// POST /api/chores - Create chore
router.post('/', authenticateToken, validateChore, async (req: Request, res: Response): Promise<void> => {
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
      res.status(400).json({ error: 'You must be in a household to create chores' });
      return;
    }

    const { title, description, assignedToUserId, points, dueDate, status, isRecurring, recurringPattern } = req.body as {
      title: string;
      description?: string;
      assignedToUserId?: number;
      points?: number;
      dueDate?: string;
      status?: string;
      isRecurring?: boolean;
      recurringPattern?: string;
    };

    const chore = await prisma.chore.create({
      data: {
        title,
        description: description || null,
        assignedToUserId: assignedToUserId || null,
        points: points || 0,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || 'todo',
        isRecurring: isRecurring || false,
        recurringPattern: recurringPattern || null,
        createdByUserId: userId,
        householdId: currentUser.householdId,
      },
      include: {
        assignedToUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    res.status(201).json(chore);
  } catch (error) {
    console.error('Create chore error:', error);
    res.status(500).json({ error: 'Failed to create chore' });
  }
});

// PUT /api/chores/:id - Update chore
router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, assignedToUserId, points, dueDate, status, isRecurring, recurringPattern } = req.body as {
      title?: string;
      description?: string;
      assignedToUserId?: number | null;
      points?: number;
      dueDate?: string | null;
      status?: string;
      isRecurring?: boolean;
      recurringPattern?: string;
    };

    const existingChore = await prisma.chore.findUnique({
      where: { id: parseInt(req.params.id as string) },
    });

    if (!existingChore) {
      res.status(404).json({ error: 'Chore not found' });
      return;
    }

    // Permission check: Only creator or assignee can edit
    const isCreator = existingChore.createdByUserId === req.user!.id;
    const isAssignee = existingChore.assignedToUserId === req.user!.id;

    if (!isCreator && !isAssignee) {
      res.status(403).json({ error: 'Only the creator or assignee can edit this chore' });
      return;
    }

    // Check if task is locked (done for more than 24 hours)
    if (existingChore.status === 'done' && existingChore.completedAt) {
      const hoursSinceCompletion = (Date.now() - new Date(existingChore.completedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceCompletion > 24) {
        res.status(403).json({ error: 'Cannot modify task - locked after 24 hours of completion' });
        return;
      }
    }

    const chore = await prisma.chore.update({
      where: { id: parseInt(req.params.id as string) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(assignedToUserId !== undefined && { assignedToUserId }),
        ...(points !== undefined && { points }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(status && { status }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(recurringPattern !== undefined && { recurringPattern }),
      },
      include: {
        assignedToUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    res.json(chore);
  } catch (error) {
    console.error('Update chore error:', error);
    res.status(500).json({ error: 'Failed to update chore' });
  }
});

// PUT /api/chores/:id/status - Update chore status
router.put('/:id/status', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body as { status: string };

    if (!['todo', 'in_progress', 'done'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const existingChore = await prisma.chore.findUnique({
      where: { id: parseInt(req.params.id as string) },
    });

    if (!existingChore) {
      res.status(404).json({ error: 'Chore not found' });
      return;
    }

    // Permission check: Only assignee can update status
    if (existingChore.assignedToUserId !== req.user!.id) {
      res.status(403).json({ error: 'Only the assignee can update the status' });
      return;
    }

    // Check if task is locked (done for more than 24 hours)
    if (existingChore.status === 'done' && existingChore.completedAt) {
      const hoursSinceCompletion = (Date.now() - new Date(existingChore.completedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceCompletion > 24) {
        res.status(403).json({ error: 'Cannot modify task - locked after 24 hours of completion' });
        return;
      }
    }

    // Update the chore status and set completedAt if status is done
    const chore = await prisma.chore.update({
      where: { id: parseInt(req.params.id as string) },
      data: {
        status,
        completedAt: status === 'done' ? new Date() : null,
      },
      include: {
        assignedToUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // If completing a recurring chore, create a new instance
    if (status === 'done' && existingChore.isRecurring && existingChore.recurringPattern) {
      const nextDueDate = calculateNextDueDate(existingChore.dueDate, existingChore.recurringPattern);

      await prisma.chore.create({
        data: {
          title: existingChore.title,
          description: existingChore.description,
          points: existingChore.points,
          dueDate: nextDueDate,
          assignedToUserId: existingChore.assignedToUserId,
          createdByUserId: existingChore.createdByUserId,
          isRecurring: true,
          recurringPattern: existingChore.recurringPattern,
          status: 'todo',
        },
      });
    }

    res.json(chore);
  } catch (error) {
    console.error('Update chore status error:', error);
    res.status(500).json({ error: 'Failed to update chore status' });
  }
});

// Helper function to calculate next due date
function calculateNextDueDate(currentDueDate: Date | null, pattern: string): Date | null {
  if (!currentDueDate) return null;

  const date = new Date(currentDueDate);

  switch (pattern) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      return null;
  }

  return date;
}

// PUT /api/chores/:id/claim - Claim unassigned chore
router.put('/:id/claim', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const existingChore = await prisma.chore.findUnique({
      where: { id: parseInt(req.params.id as string) },
    });

    if (!existingChore) {
      res.status(404).json({ error: 'Chore not found' });
      return;
    }

    if (existingChore.assignedToUserId !== null) {
      res.status(400).json({ error: 'Chore is already assigned' });
      return;
    }

    const chore = await prisma.chore.update({
      where: { id: parseInt(req.params.id as string) },
      data: {
        assignedToUserId: req.user!.id,
        status: 'in_progress',
      },
      include: {
        assignedToUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    res.json(chore);
  } catch (error) {
    console.error('Claim chore error:', error);
    res.status(500).json({ error: 'Failed to claim chore' });
  }
});

// DELETE /api/chores/:id - Delete chore
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const existingChore = await prisma.chore.findUnique({
      where: { id: parseInt(req.params.id as string) },
    });

    if (!existingChore) {
      res.status(404).json({ error: 'Chore not found' });
      return;
    }

    // Permission check: Only creator or assignee can delete
    const isCreator = existingChore.createdByUserId === req.user!.id;
    const isAssignee = existingChore.assignedToUserId === req.user!.id;

    if (!isCreator && !isAssignee) {
      res.status(403).json({ error: 'Only the creator or assignee can delete this chore' });
      return;
    }

    // Check if task is locked (done for more than 24 hours)
    if (existingChore.status === 'done' && existingChore.completedAt) {
      const hoursSinceCompletion = (Date.now() - new Date(existingChore.completedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceCompletion > 24) {
        res.status(403).json({ error: 'Cannot delete task - locked after 24 hours of completion' });
        return;
      }
    }

    await prisma.chore.delete({
      where: { id: parseInt(req.params.id as string) },
    });

    res.json({ message: 'Chore deleted successfully' });
  } catch (error) {
    console.error('Delete chore error:', error);
    res.status(500).json({ error: 'Failed to delete chore' });
  }
});

// POST /api/chores/archive-old - Archive done tasks older than 7 days
router.post('/archive-old', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await prisma.chore.updateMany({
      where: {
        status: 'done',
        completedAt: {
          lt: sevenDaysAgo,
        },
        isArchived: false,
      },
      data: {
        isArchived: true,
      },
    });

    res.json({ message: 'Old tasks archived successfully', count: result.count });
  } catch (error) {
    console.error('Archive old chores error:', error);
    res.status(500).json({ error: 'Failed to archive old chores' });
  }
});

export default router;
