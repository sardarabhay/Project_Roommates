import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult, ValidationChain } from 'express-validator';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router: Router = express.Router();

// Initialize Google OAuth client for token verification
// The client ID is used to verify the token was issued for our app
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Validation middleware
const validateSignup: ValidationChain[] = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const validateLogin: ValidationChain[] = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Generate JWT token
const generateToken = (user: { id: number; email: string; name: string }): string => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

// POST /api/auth/signup
router.post('/signup', validateSignup, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, email, password } = req.body as { name: string; email: string; password: string };

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate avatar URL
    const initial = name.charAt(0).toUpperCase();
    const avatarUrl = `https://placehold.co/100x100/A8D5BA/004643?text=${initial}`;

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatarUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User created successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body as { email: string; password: string };

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    if (!user.password) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        householdId: user.householdId,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// POST /api/auth/google - Google OAuth (SECURE)
// This endpoint receives a Google ID token and verifies it server-side
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body as { idToken: string };

    if (!idToken) {
      res.status(400).json({ error: 'Google ID token is required' });
      return;
    }

    // Verify the ID token with Google
    // This is the CRITICAL security step - we ask Google "is this token real?"
    // Google checks: 1) Token signature is valid 2) Token is not expired 3) Token was issued for our app
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID, // Must match our app's client ID
    });

    // Get the user info from the verified token
    // This data comes directly from Google, not from the client - so it's trustworthy
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      res.status(400).json({ error: 'Invalid Google token payload' });
      return;
    }

    const { email, name, picture: avatarUrl, sub: googleId } = payload;

    // Find existing user by email OR googleId
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { googleId },
        ],
      },
    });

    if (!user) {
      // Create new user - no password since they're using Google
      const initial = (name || email).charAt(0).toUpperCase();
      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0], // Use email prefix if no name
          email,
          googleId,
          avatarUrl: avatarUrl || `https://placehold.co/100x100/A8D5BA/004643?text=${initial}`,
        },
      });
      console.log(`✨ New user created via Google: ${email}`);
    } else if (!user.googleId) {
      // Link Google account to existing email account
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
      console.log(`🔗 Linked Google account to existing user: ${email}`);
    }

    // Generate our app's JWT token
    const token = generateToken(user);

    res.json({
      message: 'Google login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        householdId: user.householdId,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Google login error:', error);
    // Don't expose internal error details to client
    res.status(401).json({ error: 'Google authentication failed. Please try again.' });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        householdId: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
