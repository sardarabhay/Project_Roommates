import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured } from '../lib/cloudinary.js';

const router: Router = express.Router();

// Configure multer for memory storage (we'll upload to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, Images, Word, Excel, Text'));
    }
  },
});


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

// POST /api/documents - Upload document with file
router.post('/', authenticateToken, upload.single('file'), async (req: Request, res: Response): Promise<void> => {
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

    const { name } = req.body as { name?: string };
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Use original filename if no name provided
    const documentName = name || file.originalname;

    let fileUrl: string;
    let fileSize: string;
    let cloudinaryId: string | null = null;

    // Upload to Cloudinary if configured, otherwise use base64 (not recommended for production)
    if (isCloudinaryConfigured()) {
      const uploadResult = await uploadToCloudinary(file.buffer, file.originalname, 'harmony-homes/documents');
      fileUrl = uploadResult.url;
      fileSize = formatFileSize(uploadResult.size);
      cloudinaryId = uploadResult.publicId;
    } else {
      // Fallback: Store as base64 data URL (only for development/testing)
      console.warn('⚠️ Cloudinary not configured - storing file as base64 (not recommended for production)');
      const base64 = file.buffer.toString('base64');
      fileUrl = `data:${file.mimetype};base64,${base64}`;
      fileSize = formatFileSize(file.size);
    }

    const document = await prisma.document.create({
      data: {
        name: documentName,
        fileUrl,
        size: fileSize,
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
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

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
