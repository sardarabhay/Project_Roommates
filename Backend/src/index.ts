import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import Socket.io and Firebase
import { initializeSocket } from './lib/socket.js';
import { initializeFirebase } from './lib/notifications.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import expenseRoutes from './routes/expenses.js';
import choreRoutes from './routes/chores.js';
import eventRoutes from './routes/events.js';
import issueRoutes from './routes/issues.js';
import documentRoutes from './routes/documents.js';
import landlordRoutes from './routes/landlord.js';
import communicationRoutes from './routes/communication.js';
import dashboardRoutes from './routes/dashboard.js';
import householdRoutes from './routes/households.js';
import notificationRoutes from './routes/notifications.js';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3001', 'http://127.0.0.1:3001'];

// Initialize Socket.io
initializeSocket(server, allowedOrigins);

// Initialize Firebase (for push notifications)
initializeFirebase();

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

// Health check route
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'HarmonyHomes API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/chores', choreRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/landlord', landlordRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🔌 Socket.io ready for real-time connections`);
});
