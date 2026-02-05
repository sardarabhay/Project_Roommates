// User types
export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  householdId: number | null;
  role: 'admin' | 'member' | null;
  createdAt?: string;
}

// Household types
export interface Household {
  id: number;
  name: string;
  inviteCode: string;
  createdByUserId: number;
  createdAt: string;
  members?: HouseholdMember[];
}

export interface HouseholdMember {
  id: number;
  name: string;
  avatarUrl: string | null;
  role: 'admin' | 'member';
}

export interface RemovalRequest {
  id: number;
  targetUser: { id: number; name: string; avatarUrl: string | null };
  requestedBy: { id: number; name: string };
  reason: string | null;
  votes: RemovalVote[];
  myVote: 'approve' | 'reject' | null;
  createdAt: string;
}

export interface RemovalVote {
  userId: number;
  vote: 'approve' | 'reject';
}

// Expense types
export interface ExpenseSplit {
  id: number;
  amount: number;
  status: 'pending' | 'settled';
  owedByUser: User;
}

export interface Expense {
  id: number;
  description: string;
  totalAmount: number;
  category: string;
  date: string;
  paidByUser: User;
  createdByUser: User | null;
  splits: ExpenseSplit[];
}

export interface Balances {
  youOwe: number;
  youAreOwed: number;
  debts: Record<number, number>;
  credits: Record<number, number>;
}

// Use balances hook return type
export interface UseBalancesReturn extends Balances {
  loading: boolean;
  refreshBalances: () => void;
}

// Chore types
export interface Chore {
  id: number;
  title: string;
  description: string | null;
  points: number;
  status: 'todo' | 'in_progress' | 'done';
  dueDate: string | null;
  isRecurring: boolean;
  recurringPattern: string | null;
  isArchived: boolean;
  completedAt: string | null;
  assignedToUser: User | null;
  createdByUserId: number | null;
}

// Extended Chore type with computed assignedTo field for display
export interface ChoreTask extends Omit<Chore, 'status'> {
  status: string; // Allow any string status for flexibility
  assignedTo: string; // Computed display name
}

export interface ChoresGrouped {
  todo: Chore[];
  in_progress: Chore[];
  done: Chore[];
}

// Event types
export interface EventRsvps {
  going: User[];
  maybe: User[];
  notGoing: User[];
}

export interface HouseEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  createdByUser: User;
  rsvps: EventRsvps;
}

// Issue types
export interface Issue {
  id: number;
  title: string;
  description: string | null;
  status: 'Reported' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  reportedByUser: User;
  createdAt: string;
  updatedAt: string;
}

// Landlord types
export interface Landlord {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
}

// Communication types
export interface HouseRule {
  id: number;
  content: string;
  orderNum: number;
}

export interface BulletinPost {
  id: number;
  content: string;
  postedByUserId: number;
  postedByUser: User;
  createdAt: string;
}

// Document types
export interface Document {
  id: number;
  name: string;
  fileUrl: string | null;
  size: string | null;
  uploadedByUser: User;
  createdAt: string;
}

// Dashboard types
export interface LeaderboardEntry {
  id: number;
  name: string;
  avatarUrl: string | null;
  totalPoints: number;
  completedCount: number;
}

export interface DashboardData {
  financial: {
    youOwe: number;
    youAreOwed: number;
  };
  nextChore: Chore | null;
  upcomingEvent: HouseEvent | null;
  recentActivity: {
    expenses: Expense[];
    chores: Chore[];
  };
  roommates: User[];
  leaderboard: LeaderboardEntry[];
}

// Auth types
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// Form props types
export interface FormCloseProps {
  onClose: () => void;
}

export interface FormSuccessProps {
  onSuccess?: () => void;
}

// Modal types
export type ModalType = 
  | 'addExpense' 
  | 'editExpense' 
  | 'addTask' 
  | 'reportIssue' 
  | 'createEvent' 
  | 'settleUp'
  | 'householdSettings' 
  | null;

// Module types
export type ModuleType = 
  | 'dashboard' 
  | 'finance' 
  | 'chores' 
  | 'communication' 
  | 'landlord' 
  | 'events';

// Auth state types
export type AuthState = 'loading' | 'login' | 'signup-success' | 'needs-household' | 'logged-in';
