import express, { Request, Response, Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router: Router = express.Router();


// GET /api/documents - Get all documents
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    // Get current user's household
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { householdId: true },
    });

    if (!currentUser?.householdId) {
      res.status(400).json({ error: 'You must be in a household to view documents' });
      return;
    }

    const documents = await prisma.document.findMany({
      where: { householdId: currentUser.householdId },
      include: {
        uploadedByUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
});

// POST /api/documents - Upload document (metadata only)
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    // Get current user's household
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { householdId: true },
    });

    if (!currentUser?.householdId) {
      res.status(400).json({ error: 'You must be in a household to upload documents' });
      return;
    }

    const { name, fileUrl, size } = req.body as { name: string; fileUrl?: string; size?: string };

    if (!name) {
      res.status(400).json({ error: 'Document name is required' });
      return;
    }

    const document = await prisma.document.create({
      data: {
        name,
        fileUrl,
        size,
        uploadedByUserId: userId,
        householdId: currentUser.householdId,
      },
      include: {
        uploadedByUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// PUT /api/documents/:id - Update document
router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body as { name?: string };

    const document = await prisma.document.update({
      where: { id: parseInt(req.params.id as string) },
      data: {
        ...(name && { name }),
      },
      include: {
        uploadedByUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    res.json(document);
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// DELETE /api/documents/:id - Delete document
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.document.delete({
      where: { id: parseInt(req.params.id as string) },
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
