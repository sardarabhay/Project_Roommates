import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Request with ID parameter
export interface RequestWithId extends Request {
  params: {
    id: string;
  };
}

// Request with userId parameter
export interface RequestWithUserId extends Request {
  params: {
    userId: string;
  };
}

export interface JwtPayload {
  id: number;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface ApiError {
  error: string;
  message?: string;
  errors?: Array<{ msg: string; param: string }>;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  token: string;
}

export interface UserPublic {
  id: number;
  name: string;
  email?: string;
  avatarUrl: string | null;
}

export interface ExpenseSplitInput {
  owedByUserId: number;
  amount: number;
}

export interface BalancesResponse {
  youOwe: number;
  youAreOwed: number;
  debts: Record<number, number>;
  credits: Record<number, number>;
}

export interface ChoresGrouped {
  todo: ChoreWithUser[];
  in_progress: ChoreWithUser[];
  done: ChoreWithUser[];
}

export interface ChoreWithUser {
  id: number;
  title: string;
  description: string | null;
  points: number;
  status: string;
  dueDate: Date | null;
  isRecurring: boolean;
  recurringPattern: string | null;
  isArchived: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignedToUserId: number | null;
  createdByUserId: number | null;
  assignedToUser: UserPublic | null;
}

export interface EventRsvps {
  going: UserPublic[];
  maybe: UserPublic[];
  notGoing: UserPublic[];
}

export interface DashboardResponse {
  youOwe: number;
  youAreOwed: number;
  nextChore: ChoreWithUser | null;
  upcomingEvent: unknown | null;
  recentExpenses: unknown[];
  recentChores: ChoreWithUser[];
  roommates: UserPublic[];
  leaderboard: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  avatarUrl: string | null;
  completedChores: number;
  totalPoints: number;
}
