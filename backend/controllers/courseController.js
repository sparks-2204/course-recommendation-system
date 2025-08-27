const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res) => {
  try {
    const { department, semester, year, search } = req.query;
    let query = { isActive: true };

    if (department) query.department = department;
    if (semester) query.semester = semester;
    if (year) query.year = parseInt(year);
    if (search) {
      query.$or = [
        { courseCode: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } }
      ];
    }

    let courses = await Course.find(query)
      .populate('enrolledStudents.studentId', 'name studentId')
      .sort({ courseCode: 1 });

    // If no courses found, create sample courses
    if (courses.length === 0) {
      const sampleCourses = [
        {
          courseCode: 'CS101',
          title: 'Introduction to Computer Science',
          description: 'Fundamental concepts of computer science including programming basics, algorithms, and data structures.',
          credits: 3,
          department: 'Computer Science',
          instructor: 'Dr. Smith',
          schedule: {
            days: ['Monday', 'Wednesday', 'Friday'],
            startTime: '09:00',
            endTime: '10:00',
            room: 'CS-101'
          },
          semester: 'Fall',
          year: 2024,
          maxCapacity: 30,
          prerequisites: [],
          category: 'core',
          level: 'undergraduate',
          isActive: true,
          enrolledStudents: []
        },
        {
          courseCode: 'CS201',
          title: 'Data Structures and Algorithms',
          description: 'Advanced study of data structures, algorithm design, and complexity analysis.',
          credits: 4,
          department: 'Computer Science',
          instructor: 'Dr. Johnson',
          schedule: {
            days: ['Tuesday', 'Thursday'],
            startTime: '11:00',
            endTime: '12:30',
            room: 'CS-201'
          },
          semester: 'Fall',
          year: 2024,
          maxCapacity: 25,
          prerequisites: ['CS101'],
          category: 'major',
          level: 'undergraduate',
          isActive: true,
          enrolledStudents: []
        },
        {
          courseCode: 'MATH101',
          title: 'Calculus I',
          description: 'Introduction to differential and integral calculus with applications.',
          credits: 4,
          department: 'Mathematics',
          instructor: 'Prof. Davis',
          schedule: {
            days: ['Monday', 'Wednesday', 'Friday'],
            startTime: '10:00',
            endTime: '11:00',
            room: 'MATH-101'
          },
          semester: 'Fall',
          year: 2024,
          maxCapacity: 40,
          prerequisites: [],
          category: 'core',
          level: 'undergraduate',
          isActive: true,
          enrolledStudents: []
        },
        {
          courseCode: 'ENG101',
          title: 'English Composition',
          description: 'Development of writing skills through practice in various forms of composition.',
          credits: 3,
          department: 'English',
          instructor: 'Prof. Wilson',
          schedule: {
            days: ['Monday', 'Wednesday'],
            startTime: '13:00',
            endTime: '14:30',
            room: 'ENG-101'
          },
          semester: 'Fall',
          year: 2024,
          maxCapacity: 25,
          prerequisites: [],
          category: 'general_education',
          level: 'undergraduate',
          isActive: true,
          enrolledStudents: []
        },
        {
          courseCode: 'PHYS101',
          title: 'General Physics I',
          description: 'Mechanics, thermodynamics, and wave motion with laboratory component.',
          credits: 4,
          department: 'Physics',
          instructor: 'Dr. Brown',
          schedule: {
            days: ['Tuesday', 'Thursday'],
            startTime: '14:00',
            endTime: '15:30',
            room: 'PHYS-101'
          },
          semester: 'Fall',
          year: 2024,
          maxCapacity: 35,
          prerequisites: ['MATH101'],
          category: 'core',
          level: 'undergraduate',
          isActive: true,
          enrolledStudents: []
        }
      ];

      // Create the sample courses in database
      courses = await Course.insertMany(sampleCourses);
      console.log('Created sample courses automatically');
    }

    res.json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enrolledStudents.studentId', 'name studentId email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      success: true,
      course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register for course
// @route   POST /api/courses/:id/register
// @access  Private (Student)
const registerForCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.user.id).populate('enrolledCourses.courseId');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const alreadyEnrolled = user.enrolledCourses.some(
      enrollment => enrollment.courseId._id.toString() === course._id.toString() && 
      enrollment.status === 'enrolled'
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Check capacity
    if (course.isFull()) {
      return res.status(400).json({ message: 'Course is full' });
    }

    // Check for schedule conflicts
    const enrolledCourses = user.enrolledCourses
      .filter(enrollment => enrollment.status === 'enrolled')
      .map(enrollment => enrollment.courseId);

    const hasConflict = enrolledCourses.some(enrolledCourse => 
      course.hasScheduleConflict(enrolledCourse)
    );

    if (hasConflict) {
      return res.status(400).json({ message: 'Schedule conflict with enrolled courses' });
    }

    // Check prerequisites (simplified check)
    if (course.prerequisites.length > 0) {
      const completedCourses = user.completedCourses.map(comp => comp.courseId.toString());
      const hasPrereqs = course.prerequisites.every(prereq => {
        // This is a simplified check - in reality, you'd match course codes
        return completedCourses.includes(prereq);
      });

      if (!hasPrereqs) {
        return res.status(400).json({ message: 'Prerequisites not met' });
      }
    }

    // Register student
    course.enrolledStudents.push({
      studentId: user._id,
      enrolledAt: new Date()
    });
    course.currentEnrollment += 1;

    user.enrolledCourses.push({
      courseId: course._id,
      enrolledAt: new Date(),
      status: 'enrolled'
    });

    await Promise.all([course.save(), user.save()]);

    res.json({
      success: true,
      message: 'Successfully registered for course',
      course: {
        id: course._id,
        courseCode: course.courseCode,
        title: course.title,
        credits: course.credits
      }
    });
  } catch (error) {
    console.error('Course registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Drop course
// @route   DELETE /api/courses/:id/drop
// @access  Private (Student)
const dropCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if enrolled
    const enrollmentIndex = user.enrolledCourses.findIndex(
      enrollment => enrollment.courseId.toString() === course._id.toString() && 
      enrollment.status === 'enrolled'
    );

    if (enrollmentIndex === -1) {
      return res.status(400).json({ message: 'Not enrolled in this course' });
    }

    // Remove from course
    course.enrolledStudents = course.enrolledStudents.filter(
      student => student.studentId.toString() !== user._id.toString()
    );
    course.currentEnrollment = Math.max(0, course.currentEnrollment - 1);

    // Update user enrollment status
    user.enrolledCourses[enrollmentIndex].status = 'dropped';

    await Promise.all([course.save(), user.save()]);

    res.json({
      success: true,
      message: 'Successfully dropped course'
    });
  } catch (error) {
    console.error('Course drop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get student's enrolled courses
// @route   GET /api/courses/my-courses
// @access  Private (Student)
const getMyCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'enrolledCourses.courseId',
        match: { isActive: true }
      });

    const enrolledCourses = user.enrolledCourses
      .filter(enrollment => enrollment.status === 'enrolled' && enrollment.courseId)
      .map(enrollment => ({
        ...enrollment.courseId.toObject(),
        enrolledAt: enrollment.enrolledAt
      }));

    res.json({
      success: true,
      courses: enrolledCourses
    });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get course recommendations
// @route   GET /api/courses/recommendations
// @access  Private (Student)
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('enrolledCourses.courseId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let allCourses = await Course.find({ isActive: true });
    
    // If no courses found, create sample courses
    if (allCourses.length === 0) {
      const sampleCourses = [
        {
          courseCode: 'CS101',
          title: 'Introduction to Computer Science',
          description: 'Fundamental concepts of computer science including programming basics, algorithms, and problem-solving techniques.',
          instructor: 'Dr. Sarah Johnson',
          credits: 3,
          maxCapacity: 30,
          currentEnrollment: 0,
          schedule: 'Mon/Wed/Fri 10:00-11:00 AM',
          department: 'Computer Science',
          semester: 'Fall 2024',
          prerequisites: [],
          isActive: true,
          difficulty: 'Beginner'
        },
        {
          courseCode: 'MATH101',
          title: 'Calculus I',
          description: 'Introduction to differential and integral calculus with applications.',
          instructor: 'Prof. Michael Chen',
          credits: 4,
          maxCapacity: 35,
          currentEnrollment: 0,
          schedule: 'Tue/Thu 2:00-3:30 PM',
          department: 'Mathematics',
          semester: 'Fall 2024',
          prerequisites: [],
          isActive: true,
          difficulty: 'Intermediate'
        },
        {
          courseCode: 'ENG101',
          title: 'English Composition',
          description: 'Development of writing skills through various forms of composition.',
          instructor: 'Dr. Emily Rodriguez',
          credits: 3,
          maxCapacity: 25,
          currentEnrollment: 0,
          schedule: 'Mon/Wed 1:00-2:30 PM',
          department: 'English',
          semester: 'Fall 2024',
          prerequisites: [],
          isActive: true,
          difficulty: 'Beginner'
        },
        {
          courseCode: 'PHYS101',
          title: 'General Physics I',
          description: 'Introduction to mechanics, heat, and wave motion.',
          instructor: 'Dr. Robert Kim',
          credits: 4,
          maxCapacity: 40,
          currentEnrollment: 0,
          schedule: 'Tue/Thu 10:00-11:30 AM',
          department: 'Physics',
          semester: 'Fall 2024',
          prerequisites: ['MATH101'],
          isActive: true,
          difficulty: 'Intermediate'
        },
        {
          courseCode: 'CS201',
          title: 'Data Structures and Algorithms',
          description: 'Study of fundamental data structures and algorithms with implementation in programming languages.',
          instructor: 'Prof. Lisa Wang',
          credits: 3,
          maxCapacity: 28,
          currentEnrollment: 0,
          schedule: 'Mon/Wed/Fri 2:00-3:00 PM',
          department: 'Computer Science',
          semester: 'Fall 2024',
          prerequisites: ['CS101'],
          isActive: true,
          difficulty: 'Advanced'
        }
      ];

      allCourses = await Course.insertMany(sampleCourses);
      console.log('Created sample courses for recommendations');
    }

    // Get enrolled course IDs
    const enrolledCourseIds = user.enrolledCourses
      .filter(enrollment => enrollment.status === 'enrolled')
      .map(enrollment => enrollment.courseId._id.toString());

    // Filter out already enrolled courses
    const availableCourses = allCourses.filter(
      course => !enrolledCourseIds.includes(course._id.toString())
    );

    // Simple recommendation logic based on major and year
    let recommendations = availableCourses.filter(course => {
      // Prioritize courses matching student's major
      if (course.department === user.major) return true;
      
      // Include foundational courses for all students
      if (['ENG101', 'MATH101'].includes(course.courseCode)) return true;
      
      // Include beginner courses for freshmen
      if (user.year === 'Freshman' && course.courseCode.includes('101')) return true;
      
      return false;
    });

    // If no major-specific recommendations, include some general courses
    if (recommendations.length === 0) {
      recommendations = availableCourses.slice(0, 3);
    }

    // Limit to 5 recommendations
    recommendations = recommendations.slice(0, 5);

    res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCourses,
  getCourse,
  registerForCourse,
  dropCourse,
  getMyCourses,
  getRecommendations
};
