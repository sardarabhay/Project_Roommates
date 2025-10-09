
export const mockUser = {
  id: 0,
  name: 'Abhay',
  avatarUrl: 'https://placehold.co/100x100/A8D5BA/004643?text=A'
};

export const mockRoommates = [
  { id: 1, name: 'Bilal', avatarUrl: 'https://placehold.co/100x100/F0A692/FFFFFF?text=B' },
  { id: 2, name: 'Chatur', avatarUrl: 'https://placehold.co/100x100/F6D9C2/000000?text=C' },
  { id: 3, name: 'Deepak', avatarUrl: 'https://placehold.co/100x100/004643/FFFFFF?text=D' },
];

export const allUsers = [mockUser, ...mockRoommates];

export const mockExpenses = [
    { id: 1, description: 'Groceries', total_amount: 500, paid_by_user_id: 1, date: '2025-09-18' },
    { id: 2, description: 'Wi-Fi Bill', total_amount: 800, paid_by_user_id: 2, date: '2025-09-15' },
    { id: 3, description: 'Movie Night Pizza', total_amount: 1000, paid_by_user_id: 0, date: '2025-09-12' },
];

export const mockExpenseSplits = [
    { expense_id: 1, owed_by_user_id: 0, amount: 200, status: 'pending' },
    { expense_id: 1, owed_by_user_id: 2, amount: 200, status: 'pending' },
    { expense_id: 1, owed_by_user_id: 3, amount: 200, status: 'pending' },
    { expense_id: 2, owed_by_user_id: 0, amount: 300, status: 'pending' },
    { expense_id: 3, owed_by_user_id: 1, amount: 250, status: 'pending' },
    { expense_id: 3, owed_by_user_id: 3, amount: 250, status: 'pending' },
];

export const initialChores = {
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

export const mockEvents = [
    { id: 1, title: 'Board Game Night', date: '2025-09-20T19:00:00', location: 'Living Room', createdBy: 'Chatur' },
    { id: 2, title: 'Weekend Hiking Trip', date: '2025-09-27T08:00:00', location: 'Meet at entrance', createdBy: 'Deepak' }
];

export const mockLandlord = { name: 'Mr. Rajesh Sharma', phone: '+91 98765 43210', email: 'rajesh.sharma@gmail.com' };

export const mockIssues = [
    { id: 1, title: 'Leaky Faucet in Kitchen', status: 'Reported', reportedBy: 'Abhay' },
    { id: 2, title: 'Balcony door lock is stiff', status: 'Resolved', reportedBy: 'Bilal' }
];