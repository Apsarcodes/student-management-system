import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resendOtp: async (email, purpose) => {
    const response = await api.post(`/auth/resend-otp?purpose=${encodeURIComponent(purpose)}`, { email });
    return response.data;
  },

  verifyOtp: async (email, otp, purpose) => {
    const response = await api.post('/auth/verify-otp', { email, otp, purpose });
    return response.data;
  },

  resetPassword: async (email, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, newPassword });
    return response.data;
  },

  getPublicDepartments: async () => {
    const response = await api.get('/auth/departments');
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  },
};
