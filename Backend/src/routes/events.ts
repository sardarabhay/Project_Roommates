import express, { Request, Response, Router } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import type { EventRsvps, UserPublic } from '../types/index.js';

const router: Router = express.Router();


// Validation
const validateEvent: ValidationChain[] = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('date').notEmpty().withMessage('Date is required'),
];

// Helper to transform RSVPs
interface RsvpWithUser {
  status: string;
  user: UserPublic;
}

const transformRsvps = (rsvps: RsvpWithUser[]): EventRsvps => {
  return {
    going: rsvps.filter((r) => r.status === 'going').map((r) => r.user),
    maybe: rsvps.filter((r) => r.status === 'maybe').map((r) => r.user),
    notGoing: rsvps.filter((r) => r.status === 'not-going').map((r) => r.user),
  };
};

// GET /api/events - Get all events
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      include: {
        createdByUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
        rsvps: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    // Transform RSVPs into grouped format
    const eventsWithGroupedRsvps = events.map((event) => ({
      ...event,
      rsvps: transformRsvps(event.rsvps),
    }));

    res.json(eventsWithGroupedRsvps);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

// GET /api/events/:id - Get single event
router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id as string) },
      include: {
        createdByUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
        rsvps: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    res.json({
      ...event,
      rsvps: transformRsvps(event.rsvps),
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to get event' });
  }
});

// POST /api/events - Create event
router.post('/', authenticateToken, validateEvent, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { title, location, date } = req.body as { title: string; location: string; date: string };

    const event = await prisma.event.create({
      data: {
        title,
        location,
        date: new Date(date),
        createdByUserId: req.user!.id,
      },
      include: {
        createdByUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    res.status(201).json({
      ...event,
      rsvps: { going: [], maybe: [], notGoing: [] },
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id - Update event
router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, location, date } = req.body as { title?: string; location?: string; date?: string };

    const event = await prisma.event.update({
      where: { id: parseInt(req.params.id as string) },
      data: {
        ...(title && { title }),
        ...(location && { location }),
        ...(date && { date: new Date(date) }),
      },
      include: {
        createdByUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
        rsvps: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    res.json({
      ...event,
      rsvps: transformRsvps(event.rsvps),
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.event.delete({
      where: { id: parseInt(req.params.id as string) },
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// POST /api/events/:id/rsvp - RSVP to event
router.post('/:id/rsvp', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body as { status: string };

    if (!['going', 'maybe', 'not-going'].includes(status)) {
      res.status(400).json({ error: 'Invalid RSVP status' });
      return;
    }

    const eventId = parseInt(req.params.id as string);
    const userId = req.user!.id;

    // Upsert the RSVP
    await prisma.eventRsvp.upsert({
      where: {
        eventId_userId: { eventId, userId },
      },
      update: { status },
      create: { eventId, userId, status },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Return updated event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        createdByUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
        rsvps: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    res.json({
      ...event,
      rsvps: transformRsvps(event.rsvps),
    });
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({ error: 'Failed to RSVP' });
  }
});

export default router;
