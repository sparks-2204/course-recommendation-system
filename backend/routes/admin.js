const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const {
  getAllUsers,
  createCourse,
  updateCourse,
  deleteCourse,
  getSystemStats,
  updateUserRole,
  assignCourseToStudent,
  removeCourseFromStudent
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require admin authorization
router.use(auth, authorize('admin'));

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', getAllUsers);

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin)
router.put('/users/:id/role', updateUserRole);

// @route   POST /api/admin/courses
// @desc    Create new course
// @access  Private (Admin)
router.post('/courses', createCourse);

// @route   PUT /api/admin/courses/:id
// @desc    Update course
// @access  Private (Admin)
router.put('/courses/:id', updateCourse);

// @route   DELETE /api/admin/courses/:id
// @desc    Delete course
// @access  Private (Admin)
router.delete('/courses/:id', deleteCourse);

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Private (Admin)
router.get('/stats', getSystemStats);

// @route   POST /api/admin/users/:userId/assign-course
// @desc    Assign course to student
// @access  Private (Admin)
router.post('/users/:userId/assign-course', assignCourseToStudent);

// @route   DELETE /api/admin/users/:userId/remove-course/:courseId
// @desc    Remove course from student
// @access  Private (Admin)
router.delete('/users/:userId/remove-course/:courseId', removeCourseFromStudent);

module.exports = router;
