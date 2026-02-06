import express, { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router: Router = express.Router();

// POST /api/notifications/fcm-token - Register FCM token
router.post(
  '/fcm-token',
  authenticateToken,
  [body('token').trim().notEmpty().withMessage('FCM token is required')],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = req.user!.id;
      const { token } = req.body as { token: string };

      await prisma.user.update({
        where: { id: userId },
        data: { fcmToken: token },
      });

      res.json({ message: 'FCM token registered successfully' });
    } catch (error) {
      console.error('Register FCM token error:', error);
      res.status(500).json({ error: 'Failed to register FCM token' });
    }
  }
);

// DELETE /api/notifications/fcm-token - Remove FCM token (logout)
router.delete('/fcm-token', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    await prisma.user.update({
      where: { id: userId },
      data: { fcmToken: null },
    });

    res.json({ message: 'FCM token removed successfully' });
  } catch (error) {
    console.error('Remove FCM token error:', error);
    res.status(500).json({ error: 'Failed to remove FCM token' });
  }
});

export default router;
