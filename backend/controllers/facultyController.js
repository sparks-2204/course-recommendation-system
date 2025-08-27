const User = require('../models/User');
const Course = require('../models/Course');

// @desc    Get students for faculty view
// @route   GET /api/faculty/students
// @access  Private (Faculty)
const getFacultyStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .populate('enrolledCourses.courseId', 'courseCode title credits')
      .select('-password')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: students.length,
      users: students
    });
  } catch (error) {
    console.error('Get faculty students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get courses for faculty
// @route   GET /api/faculty/courses
// @access  Private (Faculty)
const getFacultyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true })
      .populate('enrolledStudents.studentId', 'name studentId')
      .sort({ courseCode: 1 });

    res.json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error('Get faculty courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get faculty statistics
// @route   GET /api/faculty/stats
// @access  Private (Faculty)
const getFacultyStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments({ isActive: true });
    
    const enrollmentData = await Course.aggregate([
      { $match: { isActive: true } },
      { $project: { courseCode: 1, enrollmentCount: { $size: '$enrolledStudents' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        enrollmentData
      }
    });
  } catch (error) {
    console.error('Get faculty stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getFacultyStudents,
  getFacultyCourses,
  getFacultyStats
};
