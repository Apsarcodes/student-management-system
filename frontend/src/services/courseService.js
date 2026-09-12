import api from './api';

export const courseService = {
  getAllCourses: async (departmentId = null) => {
    const params = departmentId ? { departmentId } : {};
    const response = await api.get('/courses', { params });
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  createCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  updateCourse: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
};
