import api from './api';

export const studentPortalService = {
  getDashboard: async (studentId) => {
    const res = await api.get('/student/portal/dashboard', {
      params: studentId ? { studentId } : {},
    });
    return res.data;
  },

  getProfile: async (studentId) => {
    const res = await api.get('/student/portal/profile', {
      params: studentId ? { studentId } : {},
    });
    return res.data;
  },

  updateProfile: async (data, studentId) => {
    const res = await api.put('/student/portal/profile', data, {
      params: studentId ? { studentId } : {},
    });
    return res.data;
  },

  getAttendance: async (studentId) => {
    const res = await api.get('/student/portal/attendance', {
      params: studentId ? { studentId } : {},
    });
    return res.data;
  },

  getMarks: async (studentId) => {
    const res = await api.get('/student/portal/marks', {
      params: studentId ? { studentId } : {},
    });
    return res.data;
  },

  getSubjects: async (studentId) => {
    const res = await api.get('/student/portal/subjects', {
      params: studentId ? { studentId } : {},
    });
    return res.data;
  },
};

export default studentPortalService;
