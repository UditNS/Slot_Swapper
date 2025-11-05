
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true ,
    headers: {
    'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
      error.message = 'Network error. Please check your connection.';
    }

    return Promise.reject(error);
  }
);

// ========================================
// AUTH API
// ========================================
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  verifyToken: () => api.post('/auth/verify-token'),
};

// ========================================
// EVENT API
// ========================================
export const eventAPI = {
  getAll: (params) => api.get('/events', { params }),
  getOne: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  toggleSwappable: (id) => api.patch(`/events/${id}/toggle-swappable`),
  getStats: () => api.get('/events/stats/upcoming'),
};

// ========================================
// SWAP API
// ========================================
export const swapAPI = {
  getSwappableSlots: (params) => api.get('/swaps/swappable-slots', { params }),
  createSwapRequest: (data) => api.post('/swaps/swap-request', data),
  respondToSwap: (requestId, accepted) => 
    api.post(`/swaps/swap-response/${requestId}`, { accepted }),
  getMyRequests: (params) => api.get('/swaps/my-requests', { params }),
  getRequest: (requestId) => api.get(`/swaps/request/${requestId}`),
  cancelSwapRequest: (requestId) => api.delete(`/swaps/cancel/${requestId}`),
  getStats: () => api.get('/swaps/stats'),
};

export default api;