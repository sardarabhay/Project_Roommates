import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation
const validateChore = [
  body('title').trim().notEmpty().withMessage('Title is required'),
];

// GET /api/chores - Get all chores grouped by status
router.get('/', authenticateToken, async (req, res) => {
  try {
    const chores = await prisma.chore.findMany({
      where: {
        isArchived: false, // Only show non-archived chores
      },
      include: {
        assignedToUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by status
    const grouped = {
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
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const chores = await prisma.chore.findMany({
      where: {
        isArchived: false, // Only show non-archived chores
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
router.post('/', authenticateToken, validateChore, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, assignedToUserId, points, dueDate, status, isRecurring, recurringPattern } = req.body;

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
        createdByUserId: req.user.id,
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
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, assignedToUserId, points, dueDate, status, isRecurring, recurringPattern } = req.body;

    const existingChore = await prisma.chore.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!existingChore) {
      return res.status(404).json({ error: 'Chore not found' });
    }

    // Permission check: Only creator or assignee can edit
    const isCreator = existingChore.createdByUserId === req.user.id;
    const isAssignee = existingChore.assignedToUserId === req.user.id;

    if (!isCreator && !isAssignee) {
      return res.status(403).json({ error: 'Only the creator or assignee can edit this chore' });
    }

    // Check if task is locked (done for more than 24 hours)
    if (existingChore.status === 'done' && existingChore.completedAt) {
      const hoursSinceCompletion = (Date.now() - new Date(existingChore.completedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceCompletion > 24) {
        return res.status(403).json({ error: 'Cannot modify task - locked after 24 hours of completion' });
      }
    }

    const chore = await prisma.chore.update({
      where: { id: parseInt(req.params.id) },
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
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['todo', 'in_progress', 'done'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const existingChore = await prisma.chore.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!existingChore) {
      return res.status(404).json({ error: 'Chore not found' });
    }

    // Permission check: Only assignee can update status
    if (existingChore.assignedToUserId !== req.user.id) {
      return res.status(403).json({ error: 'Only the assignee can update the status' });
    }

    // Check if task is locked (done for more than 24 hours)
    if (existingChore.status === 'done' && existingChore.completedAt) {
      const hoursSinceCompletion = (Date.now() - new Date(existingChore.completedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceCompletion > 24) {
        return res.status(403).json({ error: 'Cannot modify task - locked after 24 hours of completion' });
      }
    }

    // Update the chore status and set completedAt if status is done
    const chore = await prisma.chore.update({
      where: { id: parseInt(req.params.id) },
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
function calculateNextDueDate(currentDueDate, pattern) {
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
router.put('/:id/claim', authenticateToken, async (req, res) => {
  try {
    const existingChore = await prisma.chore.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!existingChore) {
      return res.status(404).json({ error: 'Chore not found' });
    }

    if (existingChore.assignedToUserId !== null) {
      return res.status(400).json({ error: 'Chore is already assigned' });
    }

    const chore = await prisma.chore.update({
      where: { id: parseInt(req.params.id) },
      data: {
        assignedToUserId: req.user.id,
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
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const existingChore = await prisma.chore.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!existingChore) {
      return res.status(404).json({ error: 'Chore not found' });
    }

    // Permission check: Only creator or assignee can delete
    const isCreator = existingChore.createdByUserId === req.user.id;
    const isAssignee = existingChore.assignedToUserId === req.user.id;

    if (!isCreator && !isAssignee) {
      return res.status(403).json({ error: 'Only the creator or assignee can delete this chore' });
    }

    // Check if task is locked (done for more than 24 hours)
    if (existingChore.status === 'done' && existingChore.completedAt) {
      const hoursSinceCompletion = (Date.now() - new Date(existingChore.completedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceCompletion > 24) {
        return res.status(403).json({ error: 'Cannot delete task - locked after 24 hours of completion' });
      }
    }

    await prisma.chore.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ message: 'Chore deleted successfully' });
  } catch (error) {
    console.error('Delete chore error:', error);
    res.status(500).json({ error: 'Failed to delete chore' });
  }
});

// POST /api/chores/archive-old - Archive done tasks older than 7 days
router.post('/archive-old', authenticateToken, async (req, res) => {
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
