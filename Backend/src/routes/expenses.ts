import express, { Request, Response, Router } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { emitToHousehold, SocketEvents } from '../lib/socket.js';
import { sendNotificationToUser, NotificationTemplates } from '../lib/notifications.js';
import type { ExpenseSplitInput, BalancesResponse } from '../types/index.js';

const router: Router = express.Router();



// Validation
const validateExpense: ValidationChain[] = [
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('totalAmount').isFloat({ gt: 0 }).withMessage('Amount must be positive'),
];

// GET /api/expenses - Get all expenses
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
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

    const expenses = await prisma.expense.findMany({
      where: {
        householdId: currentUser.householdId,
      },
      include: {
        paidByUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
        createdByUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
        splits: {
          include: {
            owedByUser: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to get expenses' });
  }
});

// GET /api/expenses/balances - Get user balances
router.get('/balances', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get all pending splits
    const splits = await prisma.expenseSplit.findMany({
      where: { status: 'pending' },
      include: {
        expense: {
          include: {
            paidByUser: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        owedByUser: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    let youOwe = 0;
    let youAreOwed = 0;
    const debts: Record<number, number> = {};
    const credits: Record<number, number> = {};

    splits.forEach((split) => {
      const paidByUserId = split.expense.paidByUserId;
      const owedByUserId = split.owedByUserId;

      // User owes someone else
      if (owedByUserId === userId && paidByUserId !== userId) {
        youOwe += split.amount;
        debts[paidByUserId] = (debts[paidByUserId] || 0) + split.amount;
      }

      // Someone owes user
      if (paidByUserId === userId && owedByUserId !== userId) {
        youAreOwed += split.amount;
        credits[owedByUserId] = (credits[owedByUserId] || 0) + split.amount;
      }
    });

    const response: BalancesResponse = { youOwe, youAreOwed, debts, credits };
    res.json(response);
  } catch (error) {
    console.error('Get balances error:', error);
    res.status(500).json({ error: 'Failed to get balances' });
  }
});

// POST /api/expenses - Create expense
router.post('/', authenticateToken, validateExpense, async (req: Request, res: Response): Promise<void> => {
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
      res.status(400).json({ error: 'You must be in a household to create expenses' });
      return;
    }

    const { description, totalAmount, paidByUserId, date, splits, category } = req.body as {
      description: string;
      totalAmount: number;
      paidByUserId?: number;
      date?: string;
      splits?: ExpenseSplitInput[];
      category?: string;
    };

    // Get all users in household if splitting equally
    let splitData = splits;
    if (!splits || splits.length === 0) {
      const users = await prisma.user.findMany({
        where: { householdId: currentUser.householdId },
      });
      const splitAmount = totalAmount / users.length;
      splitData = users
        .filter((u) => u.id !== (paidByUserId || userId))
        .map((u) => ({
          owedByUserId: u.id,
          amount: splitAmount,
        }));
    }

    const expense = await prisma.expense.create({
      data: {
        description,
        totalAmount,
        category: category || 'other',
        paidByUserId: paidByUserId || userId,
        createdByUserId: userId,
        householdId: currentUser.householdId,
        date: date ? new Date(date) : new Date(),
        splits: {
          create: splitData,
        },
      },
      include: {
        paidByUser: { select: { id: true, name: true, avatarUrl: true } },
        createdByUser: { select: { id: true, name: true, avatarUrl: true } },
        splits: {
          include: {
            owedByUser: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    // Emit socket event to household
    emitToHousehold(currentUser.householdId, SocketEvents.EXPENSE_CREATED, expense);

    // Send push notifications to users who owe money
    for (const split of expense.splits) {
      if (split.owedByUserId !== userId) {
        await sendNotificationToUser(
          split.owedByUserId,
          NotificationTemplates.expenseOwed(expense.description, split.amount)
        );
      }
    }

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// PUT /api/expenses/:id - Update expense
router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { description, totalAmount, date, category } = req.body as {
      description?: string;
      totalAmount?: number;
      date?: string;
      category?: string;
    };

    const expense = await prisma.expense.update({
      where: { id: parseInt(req.params.id as string) },
      data: {
        ...(description && { description }),
        ...(totalAmount && { totalAmount }),
        ...(date && { date: new Date(date) }),
        ...(category && { category }),
      },
      include: {
        paidByUser: { select: { id: true, name: true, avatarUrl: true } },
        createdByUser: { select: { id: true, name: true, avatarUrl: true } },
        splits: {
          include: {
            owedByUser: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    res.json(expense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.expense.delete({
      where: { id: parseInt(req.params.id as string) },
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// PUT /api/expenses/splits/:id/settle - Settle a split
router.put('/splits/:id/settle', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const split = await prisma.expenseSplit.update({
      where: { id: parseInt(req.params.id as string) },
      data: { status: 'settled' },
      include: {
        expense: true,
        owedByUser: { select: { id: true, name: true } },
      },
    });

    res.json(split);
  } catch (error) {
    console.error('Settle split error:', error);
    res.status(500).json({ error: 'Failed to settle split' });
  }
});

// PUT /api/expenses/settle-with/:userId - Settle all splits with a specific user
router.put('/settle-with/:userId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user!.id;
    const otherUserId = parseInt(req.params.userId as string);

    // Settle splits where current user owes the other user
    const settledSplits = await prisma.expenseSplit.updateMany({
      where: {
        owedByUserId: currentUserId,
        status: 'pending',
        expense: {
          paidByUserId: otherUserId,
        },
      },
      data: { status: 'settled' },
    });

    res.json({
      message: 'Settled successfully',
      settledCount: settledSplits.count,
    });
  } catch (error) {
    console.error('Settle with user error:', error);
    res.status(500).json({ error: 'Failed to settle' });
  }
});

export default router;
