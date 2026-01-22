// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Get stored token
const getToken = () => localStorage.getItem('token');

// Store token
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Store user
export const setUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

// Get stored user
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Clear auth data
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Base fetch with auth
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
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

  return data;
};

// === AUTH API ===
export const authApi = {
  login: async (email, password) => {
    const data = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    return data;
  },

  signup: async (name, email, password) => {
    const data = await fetchWithAuth('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    return data;
  },

  googleLogin: async (email, name, avatarUrl) => {
    const data = await fetchWithAuth('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ email, name, avatarUrl }),
    });
    setToken(data.token);
    setUser(data.user);
    return data;
  },

  getCurrentUser: async () => {
    return fetchWithAuth('/auth/me');
  },

  logout: () => {
    clearAuth();
  },
};

// === USERS API ===
export const usersApi = {
  getAll: async () => {
    return fetchWithAuth('/users');
  },

  getById: async (id) => {
    return fetchWithAuth(`/users/${id}`);
  },

  update: async (id, data) => {
    return fetchWithAuth(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// === EXPENSES API ===
export const expensesApi = {
  getAll: async () => {
    return fetchWithAuth('/expenses');
  },

  getBalances: async () => {
    return fetchWithAuth('/expenses/balances');
  },

  create: async (data) => {
    return fetchWithAuth('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return fetchWithAuth(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return fetchWithAuth(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  settleSplit: async (splitId) => {
    return fetchWithAuth(`/expenses/splits/${splitId}/settle`, {
      method: 'PUT',
    });
  },

  settleWithUser: async (userId) => {
    return fetchWithAuth(`/expenses/settle-with/${userId}`, {
      method: 'PUT',
    });
  },
};

// === CHORES API ===
export const choresApi = {
  getAll: async () => {
    return fetchWithAuth('/chores');
  },

  getList: async () => {
    return fetchWithAuth('/chores/list');
  },

  create: async (data) => {
    return fetchWithAuth('/chores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return fetchWithAuth(`/chores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (id, status) => {
    return fetchWithAuth(`/chores/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  claim: async (id) => {
    return fetchWithAuth(`/chores/${id}/claim`, {
      method: 'PUT',
    });
  },

  delete: async (id) => {
    return fetchWithAuth(`/chores/${id}`, {
      method: 'DELETE',
    });
  },
};

// === EVENTS API ===
export const eventsApi = {
  getAll: async () => {
    return fetchWithAuth('/events');
  },

  getById: async (id) => {
    return fetchWithAuth(`/events/${id}`);
  },

  create: async (data) => {
    return fetchWithAuth('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return fetchWithAuth(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return fetchWithAuth(`/events/${id}`, {
      method: 'DELETE',
    });
  },

  rsvp: async (id, status) => {
    return fetchWithAuth(`/events/${id}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },
};

// === ISSUES API ===
export const issuesApi = {
  getAll: async () => {
    return fetchWithAuth('/issues');
  },

  create: async (data) => {
    return fetchWithAuth('/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return fetchWithAuth(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (id, status) => {
    return fetchWithAuth(`/issues/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  delete: async (id) => {
    return fetchWithAuth(`/issues/${id}`, {
      method: 'DELETE',
    });
  },
};

// === DOCUMENTS API ===
export const documentsApi = {
  getAll: async () => {
    return fetchWithAuth('/documents');
  },

  create: async (data) => {
    return fetchWithAuth('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return fetchWithAuth(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return fetchWithAuth(`/documents/${id}`, {
      method: 'DELETE',
    });
  },
};

// === LANDLORD API ===
export const landlordApi = {
  get: async () => {
    return fetchWithAuth('/landlord');
  },

  save: async (data) => {
    return fetchWithAuth('/landlord', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return fetchWithAuth(`/landlord/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// === COMMUNICATION API ===
export const communicationApi = {
  // House Rules
  getRules: async () => {
    return fetchWithAuth('/communication/rules');
  },

  createRule: async (content) => {
    return fetchWithAuth('/communication/rules', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  updateRule: async (id, data) => {
    return fetchWithAuth(`/communication/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteRule: async (id) => {
    return fetchWithAuth(`/communication/rules/${id}`, {
      method: 'DELETE',
    });
  },

  // Bulletin Board
  getBulletin: async () => {
    return fetchWithAuth('/communication/bulletin');
  },

  createPost: async (content) => {
    return fetchWithAuth('/communication/bulletin', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  deletePost: async (id) => {
    return fetchWithAuth(`/communication/bulletin/${id}`, {
      method: 'DELETE',
    });
  },
};

// === DASHBOARD API ===
export const dashboardApi = {
  get: async () => {
    return fetchWithAuth('/dashboard');
  },
};
