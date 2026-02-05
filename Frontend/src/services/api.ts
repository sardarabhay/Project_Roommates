import type { 
  User, 
  Expense, 
  Balances, 
  ChoresGrouped, 
  Chore, 
  HouseEvent, 
  Issue, 
  Landlord, 
  HouseRule, 
  BulletinPost, 
  Document as HouseDocument,
  DashboardData,
  AuthResponse 
} from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Get stored token
const getToken = (): string | null => localStorage.getItem('token');

// Store token
export const setToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Store user
export const setUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

// Get stored user
export const getUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Clear auth data
export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Base fetch with auth
const fetchWithAuth = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    clearAuth();
    window.location.reload();
    throw new Error('Session expired. Please login again.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Something went wrong');
  }

  return data as T;
};

// === AUTH API ===
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const data = await fetchWithAuth<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    return data;
  },

  signup: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const data = await fetchWithAuth<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    return data;
  },

  googleLogin: async (email: string, name: string, avatarUrl?: string): Promise<AuthResponse> => {
    const data = await fetchWithAuth<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ email, name, avatarUrl }),
    });
    setToken(data.token);
    setUser(data.user);
    return data;
  },

  getCurrentUser: async (): Promise<User> => {
    return fetchWithAuth<User>('/auth/me');
  },

  logout: (): void => {
    clearAuth();
  },
};

// === USERS API ===
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    return fetchWithAuth<User[]>('/users');
  },

  getById: async (id: number): Promise<User> => {
    return fetchWithAuth<User>(`/users/${id}`);
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    return fetchWithAuth<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// === EXPENSES API ===
interface CreateExpenseData {
  description: string;
  totalAmount: number;
  paidByUserId?: number;
  date?: string;
  category?: string;
  splits?: Array<{ owedByUserId: number; amount: number }>;
}

export const expensesApi = {
  getAll: async (): Promise<Expense[]> => {
    return fetchWithAuth<Expense[]>('/expenses');
  },

  getBalances: async (): Promise<Balances> => {
    return fetchWithAuth<Balances>('/expenses/balances');
  },

  create: async (data: CreateExpenseData): Promise<Expense> => {
    return fetchWithAuth<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<CreateExpenseData>): Promise<Expense> => {
    return fetchWithAuth<Expense>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<{ message: string }> => {
    return fetchWithAuth<{ message: string }>(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  settleSplit: async (splitId: number): Promise<void> => {
    return fetchWithAuth<void>(`/expenses/splits/${splitId}/settle`, {
      method: 'PUT',
    });
  },

  settleWithUser: async (userId: number): Promise<{ message: string; settledCount: number }> => {
    return fetchWithAuth<{ message: string; settledCount: number }>(`/expenses/settle-with/${userId}`, {
      method: 'PUT',
    });
  },
};

// === CHORES API ===
interface CreateChoreData {
  title: string;
  description?: string;
  assignedToUserId?: number;
  points?: number;
  dueDate?: string;
  status?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
}

export const choresApi = {
  getAll: async (): Promise<ChoresGrouped> => {
    return fetchWithAuth<ChoresGrouped>('/chores');
  },

  getList: async (): Promise<Chore[]> => {
    return fetchWithAuth<Chore[]>('/chores/list');
  },

  create: async (data: CreateChoreData): Promise<Chore> => {
    return fetchWithAuth<Chore>('/chores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<CreateChoreData>): Promise<Chore> => {
    return fetchWithAuth<Chore>(`/chores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (id: number, status: string): Promise<Chore> => {
    return fetchWithAuth<Chore>(`/chores/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  claim: async (id: number): Promise<Chore> => {
    return fetchWithAuth<Chore>(`/chores/${id}/claim`, {
      method: 'PUT',
    });
  },

  delete: async (id: number): Promise<{ message: string }> => {
    return fetchWithAuth<{ message: string }>(`/chores/${id}`, {
      method: 'DELETE',
    });
  },
};

// === EVENTS API ===
interface CreateEventData {
  title: string;
  location: string;
  date: string;
}

export const eventsApi = {
  getAll: async (): Promise<HouseEvent[]> => {
    return fetchWithAuth<HouseEvent[]>('/events');
  },

  getById: async (id: number): Promise<HouseEvent> => {
    return fetchWithAuth<HouseEvent>(`/events/${id}`);
  },

  create: async (data: CreateEventData): Promise<HouseEvent> => {
    return fetchWithAuth<HouseEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<CreateEventData>): Promise<HouseEvent> => {
    return fetchWithAuth<HouseEvent>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<{ message: string }> => {
    return fetchWithAuth<{ message: string }>(`/events/${id}`, {
      method: 'DELETE',
    });
  },

  rsvp: async (id: number, status: 'going' | 'maybe' | 'not-going'): Promise<HouseEvent> => {
    return fetchWithAuth<HouseEvent>(`/events/${id}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },
};

// === ISSUES API ===
interface CreateIssueData {
  title: string;
  description?: string;
}

export const issuesApi = {
  getAll: async (): Promise<Issue[]> => {
    return fetchWithAuth<Issue[]>('/issues');
  },

  create: async (data: CreateIssueData): Promise<Issue> => {
    return fetchWithAuth<Issue>('/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<CreateIssueData>): Promise<Issue> => {
    return fetchWithAuth<Issue>(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (id: number, status: string): Promise<Issue> => {
    return fetchWithAuth<Issue>(`/issues/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  delete: async (id: number): Promise<{ message: string }> => {
    return fetchWithAuth<{ message: string }>(`/issues/${id}`, {
      method: 'DELETE',
    });
  },
};

// === DOCUMENTS API ===
interface CreateDocumentData {
  name: string;
  fileUrl?: string;
  size?: string;
}

export const documentsApi = {
  getAll: async (): Promise<HouseDocument[]> => {
    return fetchWithAuth<HouseDocument[]>('/documents');
  },

  create: async (data: CreateDocumentData): Promise<HouseDocument> => {
    return fetchWithAuth<HouseDocument>('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<CreateDocumentData>): Promise<HouseDocument> => {
    return fetchWithAuth<HouseDocument>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<{ message: string }> => {
    return fetchWithAuth<{ message: string }>(`/documents/${id}`, {
      method: 'DELETE',
    });
  },
};

// === LANDLORD API ===
interface LandlordData {
  name: string;
  phone?: string;
  email?: string;
}

export const landlordApi = {
  get: async (): Promise<Landlord | null> => {
    return fetchWithAuth<Landlord | null>('/landlord');
  },

  save: async (data: LandlordData): Promise<Landlord> => {
    return fetchWithAuth<Landlord>('/landlord', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<LandlordData>): Promise<Landlord> => {
    return fetchWithAuth<Landlord>(`/landlord/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// === COMMUNICATION API ===
export const communicationApi = {
  // House Rules
  getRules: async (): Promise<HouseRule[]> => {
    return fetchWithAuth<HouseRule[]>('/communication/rules');
  },

  createRule: async (content: string): Promise<HouseRule> => {
    return fetchWithAuth<HouseRule>('/communication/rules', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  updateRule: async (id: number, data: Partial<HouseRule>): Promise<HouseRule> => {
    return fetchWithAuth<HouseRule>(`/communication/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteRule: async (id: number): Promise<{ message: string }> => {
    return fetchWithAuth<{ message: string }>(`/communication/rules/${id}`, {
      method: 'DELETE',
    });
  },

  // Bulletin Board
  getBulletin: async (): Promise<BulletinPost[]> => {
    return fetchWithAuth<BulletinPost[]>('/communication/bulletin');
  },

  createPost: async (content: string): Promise<BulletinPost> => {
    return fetchWithAuth<BulletinPost>('/communication/bulletin', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  deletePost: async (id: number): Promise<{ message: string }> => {
    return fetchWithAuth<{ message: string }>(`/communication/bulletin/${id}`, {
      method: 'DELETE',
    });
  },
};

// === DASHBOARD API ===
export const dashboardApi = {
  get: async (): Promise<DashboardData> => {
    return fetchWithAuth<DashboardData>('/dashboard');
  },
};
