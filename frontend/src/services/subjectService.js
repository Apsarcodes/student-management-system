import api from './api';

export const subjectService = {
  getAllSubjects: async (courseId = null, semester = null) => {
    const params = {};
    if (courseId) params.courseId = courseId;
    if (semester) params.semester = semester;
    const response = await api.get('/subjects', { params });
    return response.data;
  },

  getSubjectById: async (id) => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  createSubject: async (subjectData) => {
    const response = await api.post('/subjects', subjectData);
    return response.data;
  },

  updateSubject: async (id, subjectData) => {
    const response = await api.put(`/subjects/${id}`, subjectData);
    return response.data;
  },

  deleteSubject: async (id) => {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  },
};
