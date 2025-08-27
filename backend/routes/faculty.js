const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const {
  getFacultyStudents,
  getFacultyCourses,
  getFacultyStats
} = require('../controllers/facultyController');

const router = express.Router();

// All faculty routes require faculty authorization
router.use(auth, authorize('faculty'));

// @route   GET /api/faculty/students
// @desc    Get students for faculty view
// @access  Private (Faculty)
router.get('/students', getFacultyStudents);

// @route   GET /api/faculty/courses
// @desc    Get courses for faculty
// @access  Private (Faculty)
router.get('/courses', getFacultyCourses);

// @route   GET /api/faculty/stats
// @desc    Get faculty statistics
// @access  Private (Faculty)
router.get('/stats', getFacultyStats);

module.exports = router;
