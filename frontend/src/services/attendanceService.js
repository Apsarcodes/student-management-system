import api from './api';

export const attendanceService = {
  getAttendance: async (subjectId, date) => {
    const response = await api.get('/attendance', {
      params: { subjectId, date }
    });
    return response.data;
  },

  recordAttendance: async (payload) => {
    const response = await api.post('/attendance', payload);
    return response.data;
  },

  getStudentAttendance: async (studentId) => {
    const response = await api.get(`/attendance/student/${studentId}`);
    return response.data;
  },

  getLowAttendance: async (threshold = 75.0) => {
    const response = await api.get('/attendance/low', {
      params: { threshold }
    });
    return response.data;
  },
};
