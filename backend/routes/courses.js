const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const {
  getCourses,
  getCourse,
  registerForCourse,
  dropCourse,
  getMyCourses,
  getRecommendations
} = require('../controllers/courseController');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses
// @access  Private
router.get('/', auth, getCourses);

// @route   GET /api/courses/my-courses
// @desc    Get student's enrolled courses
// @access  Private (Student)
router.get('/my-courses', auth, authorize('student'), getMyCourses);

// @route   GET /api/courses/recommendations
// @desc    Get course recommendations
// @access  Private (Student)
router.get('/recommendations', auth, authorize('student'), getRecommendations);

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Private
router.get('/:id', auth, getCourse);

// @route   POST /api/courses/:id/register
// @desc    Register for course
// @access  Private (Student)
router.post('/:id/register', auth, authorize('student'), registerForCourse);

// @route   DELETE /api/courses/:id/drop
// @desc    Drop course
// @access  Private (Student)
router.delete('/:id/drop', auth, authorize('student'), dropCourse);

module.exports = router;
