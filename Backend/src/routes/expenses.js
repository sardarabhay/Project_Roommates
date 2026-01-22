import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation
const validateExpense = [
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('totalAmount').isFloat({ gt: 0 }).withMessage('Amount must be positive'),
];

// GET /api/expenses - Get all expenses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        paidByUser: {
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
router.get('/balances', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

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
    const debts = {};
    const credits = {};

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

    res.json({ youOwe, youAreOwed, debts, credits });
  } catch (error) {
    console.error('Get balances error:', error);
    res.status(500).json({ error: 'Failed to get balances' });
  }
});

// POST /api/expenses - Create expense
router.post('/', authenticateToken, validateExpense, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description, totalAmount, paidByUserId, date, splits } = req.body;

    // Get all users if splitting equally
    let splitData = splits;
    if (!splits || splits.length === 0) {
      const users = await prisma.user.findMany();
      const splitAmount = totalAmount / users.length;
      splitData = users
        .filter((u) => u.id !== (paidByUserId || req.user.id))
        .map((u) => ({
          owedByUserId: u.id,
          amount: splitAmount,
        }));
    }

    const expense = await prisma.expense.create({
      data: {
        description,
        totalAmount,
        paidByUserId: paidByUserId || req.user.id,
        date: date ? new Date(date) : new Date(),
        splits: {
          create: splitData,
        },
      },
      include: {
        paidByUser: { select: { id: true, name: true, avatarUrl: true } },
        splits: {
          include: {
            owedByUser: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// PUT /api/expenses/:id - Update expense
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { description, totalAmount, date } = req.body;

    const expense = await prisma.expense.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(description && { description }),
        ...(totalAmount && { totalAmount }),
        ...(date && { date: new Date(date) }),
      },
      include: {
        paidByUser: { select: { id: true, name: true, avatarUrl: true } },
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
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.expense.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// PUT /api/expenses/splits/:id/settle - Settle a split
router.put('/splits/:id/settle', authenticateToken, async (req, res) => {
  try {
    const split = await prisma.expenseSplit.update({
      where: { id: parseInt(req.params.id) },
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

export default router;
