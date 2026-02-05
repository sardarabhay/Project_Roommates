import express, { Request, Response, Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router: Router = express.Router();

// GET /api/users - Get all users (roommates in same household)
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    // Get current user's household
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { householdId: true },
    });

    if (!currentUser?.householdId) {
      res.json([]); // No household, no roommates
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        householdId: currentUser.householdId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        householdId: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id as string) },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    // Users can only update their own profile
    if (req.user!.id !== parseInt(req.params.id as string)) {
      res.status(403).json({ error: 'Not authorized to update this user' });
      return;
    }

    const { name, avatarUrl } = req.body as { name?: string; avatarUrl?: string };

    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id as string) },
      data: {
        ...(name && { name }),
        ...(avatarUrl && { avatarUrl }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
