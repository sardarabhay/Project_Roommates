import type { User } from '../types';

interface MockUser {
  id: number;
  name: string;
  avatarUrl: string;
}

interface MockExpense {
  id: number;
  description: string;
  total_amount: number;
  paid_by_user_id: number;
  date: string;
}

interface MockExpenseSplit {
  expense_id: number;
  owed_by_user_id: number;
  amount: number;
  status: string;
}

interface MockChore {
  id: number;
  title: string;
  assignedTo: string;
  points: number;
}

interface MockChores {
  todo: MockChore[];
  in_progress: MockChore[];
  done: MockChore[];
}

interface MockLandlord {
  name: string;
  phone: string;
  email: string;
}

interface MockIssue {
  id: number;
  title: string;
  status: string;
  reportedBy: string;
}

interface MockEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  createdBy: string;
  rsvps: {
    going: number[];
    maybe: number[];
    notGoing: number[];
  };
}

export const mockUser: MockUser = {
  id: 0,
  name: 'Abhay',
  avatarUrl: 'https://placehold.co/100x100/A8D5BA/004643?text=A'
};

export const mockRoommates: MockUser[] = [
  { id: 1, name: 'Bilal', avatarUrl: 'https://placehold.co/100x100/F0A692/FFFFFF?text=B' },
  { id: 2, name: 'Chatur', avatarUrl: 'https://placehold.co/100x100/F6D9C2/000000?text=C' },
  { id: 3, name: 'Deepak', avatarUrl: 'https://placehold.co/100x100/004643/FFFFFF?text=D' },
];

export const allUsers: MockUser[] = [mockUser, ...mockRoommates];

export const mockExpenses: MockExpense[] = [
    { id: 1, description: 'Groceries', total_amount: 500, paid_by_user_id: 1, date: '2025-09-18' },
    { id: 2, description: 'Wi-Fi Bill', total_amount: 800, paid_by_user_id: 2, date: '2025-09-15' },
    { id: 3, description: 'Movie Night Pizza', total_amount: 1000, paid_by_user_id: 0, date: '2025-09-12' },
];

export const mockExpenseSplits: MockExpenseSplit[] = [
    { expense_id: 1, owed_by_user_id: 0, amount: 200, status: 'pending' },
    { expense_id: 1, owed_by_user_id: 2, amount: 200, status: 'pending' },
    { expense_id: 1, owed_by_user_id: 3, amount: 200, status: 'pending' },
    { expense_id: 2, owed_by_user_id: 0, amount: 300, status: 'pending' },
    { expense_id: 3, owed_by_user_id: 1, amount: 250, status: 'pending' },
    { expense_id: 3, owed_by_user_id: 3, amount: 250, status: 'pending' },
];

export const initialChores: MockChores = {
    'todo': [
        { id: 1, title: 'Clean Kitchen', assignedTo: 'Abhay', points: 20 },
        { id: 5, title: 'Buy Tissue Paper', assignedTo: 'Unassigned', points: 5 }
    ],
    'in_progress': [
        { id: 2, title: 'Take out recycling', assignedTo: 'Deepak', points: 10 }
    ],
    'done': [
        { id: 3, title: 'Bathroom Deep Clean', assignedTo: 'Chatur', points: 30 },
        { id: 4, title: 'Wipe down kitchen counter', assignedTo: 'Bilal', points: 5 },
    ]
};


export const mockLandlord: MockLandlord = { name: 'Mr. Rajesh Sharma', phone: '+91 98765 43210', email: 'rajesh.sharma@gmail.com' };

export const mockIssues: MockIssue[] = [
    { id: 1, title: 'Leaky Faucet in Kitchen', status: 'Reported', reportedBy: 'Abhay' },
    { id: 2, title: 'Balcony door lock is stiff', status: 'Resolved', reportedBy: 'Bilal' }
];

export const mockEvents: MockEvent[] = [
  { 
    id: 1, 
    title: 'Board Game Night', 
    date: '2025-09-20T19:00:00', 
    location: 'Living Room', 
    createdBy: 'Chatur',
    rsvps: {
      going: [],
      maybe: [],
      notGoing: []
    }
  },
  { 
    id: 2, 
    title: 'Weekend Hiking Trip', 
    date: '2025-09-27T08:00:00', 
    location: 'Meet at entrance', 
    createdBy: 'Deepak',
    rsvps: {
      going: [],
      maybe: [],
      notGoing: []
    }
  }
];