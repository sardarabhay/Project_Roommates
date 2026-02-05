import express, { Request, Response, Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router: Router = express.Router();


// GET /api/landlord - Get landlord info
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    // Get current user's household
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { householdId: true },
    });

    if (!currentUser?.householdId) {
      res.status(400).json({ error: 'You must be in a household to view landlord info' });
      return;
    }

    const landlord = await prisma.landlord.findFirst({
      where: { householdId: currentUser.householdId },
    });

    if (!landlord) {
      res.json(null);
      return;
    }

    res.json(landlord);
  } catch (error) {
    console.error('Get landlord error:', error);
    res.status(500).json({ error: 'Failed to get landlord info' });
  }
});

// POST /api/landlord - Create/Update landlord info
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    // Get current user's household
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { householdId: true },
    });

    if (!currentUser?.householdId) {
      res.status(400).json({ error: 'You must be in a household to save landlord info' });
      return;
    }

    const { name, phone, email } = req.body as { name: string; phone?: string; email?: string };

    if (!name) {
      res.status(400).json({ error: 'Landlord name is required' });
      return;
    }

    // Check if landlord exists for this household
    const existingLandlord = await prisma.landlord.findFirst({
      where: { householdId: currentUser.householdId },
    });

    let landlord;
    if (existingLandlord) {
      landlord = await prisma.landlord.update({
        where: { id: existingLandlord.id },
        data: { name, phone, email },
      });
    } else {
      landlord = await prisma.landlord.create({
        data: { name, phone, email, householdId: currentUser.householdId },
      });
    }

    res.json(landlord);
  } catch (error) {
    console.error('Create/Update landlord error:', error);
    res.status(500).json({ error: 'Failed to save landlord info' });
  }
});

// PUT /api/landlord/:id - Update landlord
router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email } = req.body as { name?: string; phone?: string; email?: string };

    const landlord = await prisma.landlord.update({
      where: { id: parseInt(req.params.id as string) },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
      },
    });

    res.json(landlord);
  } catch (error) {
    console.error('Update landlord error:', error);
    res.status(500).json({ error: 'Failed to update landlord info' });
  }
});

export default router;
