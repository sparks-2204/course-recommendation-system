// This file is deprecated - facultyAPI is now exported from api.js
// Remove this file and use: import { facultyAPI } from '../utils/api';
import api from './api';

export const facultyAPI = {
  getStudents: () => api.get('/faculty/students'),
  getCourses: () => api.get('/faculty/courses'),
  getStats: () => api.get('/faculty/stats')
};
