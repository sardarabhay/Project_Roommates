import express, { Request, Response, Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import type { LeaderboardEntry } from '../types/index.js';

const router: Router = express.Router();

// GET /api/dashboard - Get dashboard summary
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get financial summary
    const splits = await prisma.expenseSplit.findMany({
      where: { status: 'pending' },
      include: {
        expense: true,
      },
    });

    let youOwe = 0;
    let youAreOwed = 0;

    splits.forEach((split) => {
      if (split.owedByUserId === userId && split.expense.paidByUserId !== userId) {
        youOwe += split.amount;
      }
      if (split.expense.paidByUserId === userId && split.owedByUserId !== userId) {
        youAreOwed += split.amount;
      }
    });

    // Get user's next chore
    const nextChore = await prisma.chore.findFirst({
      where: {
        OR: [{ assignedToUserId: userId }, { assignedToUserId: null }],
        status: { in: ['todo', 'in_progress'] },
      },
      include: {
        assignedToUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
    });

    // Get upcoming event
    const upcomingEvent = await prisma.event.findFirst({
      where: {
        date: { gte: new Date() },
      },
      include: {
        createdByUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    // Get recent activity (recent expenses)
    const recentExpenses = await prisma.expense.findMany({
      take: 5,
      include: {
        paidByUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get recent completed chores
    const recentChores = await prisma.chore.findMany({
      where: { status: 'done' },
      take: 5,
      include: {
        assignedToUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Get all roommates
    const roommates = await prisma.user.findMany({
      where: { id: { not: userId } },
      select: { id: true, name: true, avatarUrl: true },
    });

    // Get leaderboard data
    const users = await prisma.user.findMany({
      select: { id: true, name: true, avatarUrl: true },
    });

    const leaderboard: LeaderboardEntry[] = await Promise.all(
      users.map(async (user) => {
        const completedChores = await prisma.chore.findMany({
          where: {
            assignedToUserId: user.id,
            status: 'done',
          },
        });

        const totalPoints = completedChores.reduce((sum, chore) => sum + chore.points, 0);
        const completedCount = completedChores.length;

        return {
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          completedChores: completedCount,
          totalPoints,
        };
      })
    );

    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

    res.json({
      financial: {
        youOwe,
        youAreOwed,
      },
      nextChore,
      upcomingEvent,
      recentActivity: {
        expenses: recentExpenses,
        chores: recentChores,
      },
      roommates,
      leaderboard,
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

export default router;
