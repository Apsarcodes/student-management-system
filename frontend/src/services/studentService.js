import api from './api';

export const studentService = {
  getStudents: async (params = {}) => {
    const response = await api.get('/students', { params });
    return response.data;
  },

  getStudentById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  getStudentProfile: async (id) => {
    const response = await api.get(`/students/${id}/profile`);
    return response.data;
  },

  getStudentsByClass: async (courseId, semester) => {
    const response = await api.get('/students/by-class', {
      params: { courseId, semester }
    });
    return response.data;
  },

  createStudent: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  updateStudent: async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  deleteStudent: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
};
