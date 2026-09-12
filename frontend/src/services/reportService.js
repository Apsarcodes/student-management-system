import api from './api';

export const reportService = {
  getAcademicReport: async (departmentId = null, courseId = null) => {
    const params = {};
    if (departmentId) params.departmentId = departmentId;
    if (courseId) params.courseId = courseId;
    const response = await api.get('/reports/academic', { params });
    return response.data;
  },
};
