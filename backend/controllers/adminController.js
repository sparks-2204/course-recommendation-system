const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate('enrolledCourses.courseId', 'courseCode title credits')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new course
// @route   POST /api/admin/courses
// @access  Private (Admin)
const createCourse = async (req, res) => {
  try {
    const {
      courseCode,
      title,
      description,
      credits,
      department,
      instructor,
      schedule,
      semester,
      year,
      maxCapacity,
      prerequisites,
      category,
      level
    } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ courseCode, semester, year });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course with this code already exists for this semester' });
    }

    const course = await Course.create({
      courseCode,
      title,
      description,
      credits,
      department,
      instructor,
      schedule,
      semester,
      year,
      maxCapacity,
      prerequisites: prerequisites || [],
      category: category || 'elective',
      level: level || 'undergraduate'
    });

    res.status(201).json({
      success: true,
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update course
// @route   PUT /api/admin/courses/:id
// @access  Private (Admin)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      course: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete course
// @route   DELETE /api/admin/courses/:id
// @access  Private (Admin)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Soft delete - mark as inactive
    course.isActive = false;
    await course.save();

    res.json({
      success: true,
      message: 'Course deactivated successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalCourses = await Course.countDocuments({ isActive: true });
    const totalEnrollments = await User.aggregate([
      { $unwind: '$enrolledCourses' },
      { $match: { 'enrolledCourses.status': 'enrolled' } },
      { $count: 'total' }
    ]);

    // Popular courses
    const popularCourses = await Course.find({ isActive: true })
      .sort({ currentEnrollment: -1 })
      .limit(5)
      .select('courseCode title currentEnrollment maxCapacity');

    // Recent registrations
    const recentRegistrations = await User.aggregate([
      { $unwind: '$enrolledCourses' },
      { $match: { 'enrolledCourses.status': 'enrolled' } },
      { $sort: { 'enrolledCourses.enrolledAt': -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'courses',
          localField: 'enrolledCourses.courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $project: {
          studentName: '$name',
          studentId: '$studentId',
          courseCode: { $arrayElemAt: ['$course.courseCode', 0] },
          courseTitle: { $arrayElemAt: ['$course.title', 0] },
          enrolledAt: '$enrolledCourses.enrolledAt'
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalCourses,
        totalEnrollments: totalEnrollments[0]?.total || 0,
        popularCourses,
        recentRegistrations
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Assign course to student
// @route   POST /api/admin/users/:userId/assign-course
// @access  Private (Admin)
const assignCourseToStudent = async (req, res) => {
  try {
    const { userId } = req.params;
    const { courseId } = req.body;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || user.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const alreadyEnrolled = user.enrolledCourses.some(
      enrollment => enrollment.courseId.toString() === courseId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Student already enrolled in this course' });
    }

    // Check capacity
    if (course.enrolledStudents.length >= course.maxCapacity) {
      return res.status(400).json({ message: 'Course is at full capacity' });
    }

    // Add to user's enrolled courses
    user.enrolledCourses.push({
      courseId: courseId,
      status: 'enrolled'
    });

    // Add to course's enrolled students
    course.enrolledStudents.push({
      studentId: userId
    });

    await user.save();
    await course.save();

    res.json({
      success: true,
      message: 'Course assigned successfully'
    });
  } catch (error) {
    console.error('Assign course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove course from student
// @route   DELETE /api/admin/users/:userId/remove-course/:courseId
// @access  Private (Admin)
const removeCourseFromStudent = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || user.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Remove from user's enrolled courses
    user.enrolledCourses = user.enrolledCourses.filter(
      enrollment => enrollment.courseId.toString() !== courseId
    );

    // Remove from course's enrolled students
    course.enrolledStudents = course.enrolledStudents.filter(
      enrollment => enrollment.studentId.toString() !== userId
    );

    await user.save();
    await course.save();

    res.json({
      success: true,
      message: 'Course removed successfully'
    });
  } catch (error) {
    console.error('Remove course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  createCourse,
  updateCourse,
  deleteCourse,
  getSystemStats,
  updateUserRole,
  assignCourseToStudent,
  removeCourseFromStudent
};
