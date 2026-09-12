import api from './api';

export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  getPendingStudents: async () => {
    const response = await api.get('/users/pending-students');
    return response.data;
  },

  getUnlinkedStudents: async (departmentId = null) => {
    const params = departmentId ? { departmentId } : {};
    const response = await api.get('/users/unlinked-students', { params });
    return response.data;
  },

  linkStudent: async (userId, studentId) => {
    const response = await api.post(`/users/${userId}/link-student/${studentId}`);
    return response.data;
  },

  approveAndCreateStudent: async (userId, studentData) => {
    const response = await api.post(`/users/${userId}/approve-and-create-student`, studentData);
    return response.data;
  },

  quickApproveStudent: async (userId) => {
    const response = await api.post(`/users/${userId}/quick-approve`);
    return response.data;
  },
};
