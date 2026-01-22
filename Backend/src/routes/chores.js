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

    const { title, assignedToUserId, points, dueDate, status } = req.body;

    const chore = await prisma.chore.create({
      data: {
        title,
        assignedToUserId: assignedToUserId || null,
        points: points || 0,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || 'todo',
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
    const { title, assignedToUserId, points, dueDate, status } = req.body;

    const chore = await prisma.chore.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title && { title }),
        ...(assignedToUserId !== undefined && { assignedToUserId }),
        ...(points !== undefined && { points }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(status && { status }),
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

    const chore = await prisma.chore.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      include: {
        assignedToUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    res.json(chore);
  } catch (error) {
    console.error('Update chore status error:', error);
    res.status(500).json({ error: 'Failed to update chore status' });
  }
});

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
    await prisma.chore.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ message: 'Chore deleted successfully' });
  } catch (error) {
    console.error('Delete chore error:', error);
    res.status(500).json({ error: 'Failed to delete chore' });
  }
});

export default router;
