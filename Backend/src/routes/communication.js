import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// === HOUSE RULES ===

// GET /api/communication/rules - Get all house rules
router.get('/rules', authenticateToken, async (req, res) => {
  try {
    const rules = await prisma.houseRule.findMany({
      orderBy: { orderNum: 'asc' },
    });

    res.json(rules);
  } catch (error) {
    console.error('Get rules error:', error);
    res.status(500).json({ error: 'Failed to get house rules' });
  }
});

// POST /api/communication/rules - Create house rule
router.post('/rules', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Rule content is required' });
    }

    // Get max order number
    const maxOrder = await prisma.houseRule.findFirst({
      orderBy: { orderNum: 'desc' },
    });

    const rule = await prisma.houseRule.create({
      data: {
        content,
        orderNum: (maxOrder?.orderNum || 0) + 1,
      },
    });

    res.status(201).json(rule);
  } catch (error) {
    console.error('Create rule error:', error);
    res.status(500).json({ error: 'Failed to create house rule' });
  }
});

// PUT /api/communication/rules/:id - Update house rule
router.put('/rules/:id', authenticateToken, async (req, res) => {
  try {
    const { content, orderNum } = req.body;

    const rule = await prisma.houseRule.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(content && { content }),
        ...(orderNum !== undefined && { orderNum }),
      },
    });

    res.json(rule);
  } catch (error) {
    console.error('Update rule error:', error);
    res.status(500).json({ error: 'Failed to update house rule' });
  }
});

// DELETE /api/communication/rules/:id - Delete house rule
router.delete('/rules/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.houseRule.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ message: 'House rule deleted successfully' });
  } catch (error) {
    console.error('Delete rule error:', error);
    res.status(500).json({ error: 'Failed to delete house rule' });
  }
});

// === BULLETIN BOARD ===

// GET /api/communication/bulletin - Get all bulletin posts
router.get('/bulletin', authenticateToken, async (req, res) => {
  try {
    const posts = await prisma.bulletinPost.findMany({
      include: {
        postedByUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(posts);
  } catch (error) {
    console.error('Get bulletin posts error:', error);
    res.status(500).json({ error: 'Failed to get bulletin posts' });
  }
});

// POST /api/communication/bulletin - Create bulletin post
router.post('/bulletin', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Post content is required' });
    }

    const post = await prisma.bulletinPost.create({
      data: {
        content,
        postedByUserId: req.user.id,
      },
      include: {
        postedByUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create bulletin post' });
  }
});

// DELETE /api/communication/bulletin/:id - Delete bulletin post
router.delete('/bulletin/:id', authenticateToken, async (req, res) => {
  try {
    const post = await prisma.bulletinPost.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only allow deletion by the original poster
    if (post.postedByUserId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await prisma.bulletinPost.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ message: 'Bulletin post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete bulletin post' });
  }
});

export default router;
