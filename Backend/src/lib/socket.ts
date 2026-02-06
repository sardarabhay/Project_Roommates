import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: Server | null = null;

interface JwtPayload {
  id: number;
  email: string;
  name: string;
}

interface UserSocket extends Socket {
  userId?: number;
  householdId?: number;
}

// Map of userId to socket id for direct messaging
const userSockets = new Map<number, string>();
// Map of householdId to set of socket ids for room-based messaging
const householdRooms = new Map<number, Set<string>>();

export function initializeSocket(server: HttpServer, allowedOrigins: string[] = ['http://localhost:3001', 'http://127.0.0.1:3001']): Server {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket: UserSocket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: UserSocket) => {
    console.log(`🔌 User ${socket.userId} connected via Socket.io`);

    if (socket.userId) {
      userSockets.set(socket.userId, socket.id);
    }

    // Join household room
    socket.on('join-household', (householdId: number) => {
      if (householdId && socket.userId) {
        socket.join(`household-${householdId}`);
        socket.householdId = householdId;
        
        if (!householdRooms.has(householdId)) {
          householdRooms.set(householdId, new Set());
        }
        householdRooms.get(householdId)!.add(socket.id);
        
        console.log(`🏠 User ${socket.userId} joined household ${householdId}`);
      }
    });

    // Leave household room
    socket.on('leave-household', (householdId: number) => {
      if (householdId) {
        socket.leave(`household-${householdId}`);
        householdRooms.get(householdId)?.delete(socket.id);
        console.log(`🚪 User ${socket.userId} left household ${householdId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ User ${socket.userId} disconnected`);
      
      if (socket.userId) {
        userSockets.delete(socket.userId);
      }
      
      if (socket.householdId) {
        householdRooms.get(socket.householdId)?.delete(socket.id);
      }
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

// Emit to all members of a household
export function emitToHousehold(householdId: number, event: string, data: unknown): void {
  if (io) {
    console.log(`📤 Emitting ${event} to household-${householdId}`);
    io.to(`household-${householdId}`).emit(event, data);
  } else {
    console.log('⚠️ Socket.io not initialized, cannot emit');
  }
}

// Emit to a specific user
export function emitToUser(userId: number, event: string, data: unknown): void {
  const socketId = userSockets.get(userId);
  if (io && socketId) {
    io.to(socketId).emit(event, data);
  }
}

// Socket event types for type safety
export const SocketEvents = {
  // Chores
  CHORE_CREATED: 'chore:created',
  CHORE_UPDATED: 'chore:updated',
  CHORE_DELETED: 'chore:deleted',
  CHORE_CLAIMED: 'chore:claimed',
  CHORE_COMPLETED: 'chore:completed',
  
  // Expenses
  EXPENSE_CREATED: 'expense:created',
  EXPENSE_UPDATED: 'expense:updated',
  EXPENSE_DELETED: 'expense:deleted',
  EXPENSE_SETTLED: 'expense:settled',
  
  // Events
  EVENT_CREATED: 'event:created',
  EVENT_UPDATED: 'event:updated',
  EVENT_DELETED: 'event:deleted',
  EVENT_RSVP: 'event:rsvp',
  
  // Issues
  ISSUE_CREATED: 'issue:created',
  ISSUE_UPDATED: 'issue:updated',
  
  // Communication
  BULLETIN_CREATED: 'bulletin:created',
  HOUSE_RULE_CREATED: 'house-rule:created',
  
  // Household
  MEMBER_JOINED: 'household:member-joined',
  MEMBER_LEFT: 'household:member-left',
  REMOVAL_REQUEST: 'household:removal-request',
  
  // General
  NOTIFICATION: 'notification',
} as const;
