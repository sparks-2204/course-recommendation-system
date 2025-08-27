import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Course API calls
export const courseAPI = {
  getCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  getMyCourses: () => api.get('/courses/my-courses'),
  getRecommendations: () => api.get('/courses/recommendations'),
  registerForCourse: (id) => api.post(`/courses/${id}/register`),
  dropCourse: (id) => api.delete(`/courses/${id}/drop`),
};

// Chatbot API calls
export const chatbotAPI = {
  sendMessage: (message) => api.post('/chatbot/query', { message }),
  getChatHistory: () => api.get('/chatbot/history'),
};

// Admin API calls
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  createCourse: (courseData) => api.post('/admin/courses', courseData),
  updateCourse: (courseId, courseData) => api.put(`/admin/courses/${courseId}`, courseData),
  deleteCourse: (courseId) => api.delete(`/admin/courses/${courseId}`),
  getStats: () => api.get('/admin/stats'),
  assignCourseToStudent: (userId, data) => api.post(`/admin/users/${userId}/assign-course`, data),
  removeCourseFromStudent: (userId, courseId) => api.delete(`/admin/users/${userId}/remove-course/${courseId}`)
};

// Faculty API calls
export const facultyAPI = {
  getStudents: () => api.get('/faculty/students'),
  getCourses: () => api.get('/faculty/courses'),
};

// AI API calls
export const aiAPI = {
  getPersonalizedRecommendations: (limit = 5) => api.get(`/ai/recommendations?limit=${limit}`),
  getScheduleOptimization: (courseIds) => api.post('/ai/schedule-optimization', { courseIds }),
  getStudentLoadAnalysis: (studentId) => api.get(`/ai/student-load-analysis/${studentId}`),
  getCourseDemandForecast: () => api.get('/ai/demand-forecast'),
  getCatalogHealthCheck: () => api.get('/ai/catalog-health'),

  // Get anomaly detection (for admin)
  getAnomalyDetection: (timeframe = 'weekly') =>
    api.get(`/ai/anomaly-detection?timeframe=${timeframe}`),

  // Get chatbot analytics (for admin)
  getChatbotAnalytics: (timeframe = 'weekly') =>
    api.get(`/ai/chatbot-analytics?timeframe=${timeframe}`),
};

export default api;
