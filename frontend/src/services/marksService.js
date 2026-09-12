import api from './api';

export const marksService = {
  getMarks: async (subjectId) => {
    const response = await api.get('/marks', {
      params: { subjectId }
    });
    return response.data;
  },

  recordMarks: async (payload) => {
    const response = await api.post('/marks', payload);
    return response.data;
  },

  getStudentMarks: async (studentId) => {
    const response = await api.get(`/marks/student/${studentId}`);
    return response.data;
  },

  getGradeDistribution: async () => {
    const response = await api.get('/marks/grades');
    return response.data;
  },
};
