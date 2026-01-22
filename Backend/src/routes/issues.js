import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation
const validateIssue = [
  body('title').trim().notEmpty().withMessage('Title is required'),
];

// GET /api/issues - Get all issues
router.get('/', authenticateToken, async (req, res) => {
  try {
    const issues = await prisma.issue.findMany({
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
router.post('/', authenticateToken, validateIssue, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        reportedByUserId: req.user.id,
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
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const issue = await prisma.issue.update({
      where: { id: parseInt(req.params.id) },
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
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Reported', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const issue = await prisma.issue.update({
      where: { id: parseInt(req.params.id) },
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
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.issue.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ error: 'Failed to delete issue' });
  }
});

export default router;
