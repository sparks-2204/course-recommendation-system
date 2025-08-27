const AIRecommendationService = require('../services/aiRecommendationService');
const AnomalyDetectionService = require('../services/anomalyDetectionService');
const ChatbotAnalyticsService = require('../services/chatbotAnalyticsService');
const User = require('../models/User');
const Course = require('../models/Course');

// @desc    Get AI-powered personalized course recommendations
// @route   GET /api/ai/recommendations
// @access  Private (Student)
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;

    const recommendations = await AIRecommendationService.getPersonalizedRecommendations(userId, limit);

    res.json({
      success: true,
      count: recommendations.length,
      recommendations: recommendations.map(rec => ({
        ...rec,
        aiScore: rec.score,
        aiReasons: rec.reasons
      }))
    });

  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get personalized recommendations' 
    });
  }
};

// @desc    Get schedule optimization analysis
// @route   POST /api/ai/schedule-optimization
// @access  Private (Student)
const analyzeScheduleOptimization = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseIds } = req.body;

    if (!courseIds || !Array.isArray(courseIds)) {
      return res.status(400).json({
        success: false,
        message: 'Course IDs array is required'
      });
    }

    // Get course details
    const courses = await Course.find({ _id: { $in: courseIds } });
    
    const optimization = await AIRecommendationService.analyzeScheduleOptimization(userId, courses);

    res.json({
      success: true,
      optimization
    });

  } catch (error) {
    console.error('Error analyzing schedule optimization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze schedule optimization'
    });
  }
};

// @desc    Get student load analysis for faculty
// @route   GET /api/ai/student-load-analysis/:studentId
// @access  Private (Faculty/Admin)
const analyzeStudentLoad = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await User.findById(studentId).populate('enrolledCourses.courseId');
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const analysis = await calculateStudentLoadAnalysis(student);

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Error analyzing student load:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze student load'
    });
  }
};

// @desc    Get course demand forecasting
// @route   GET /api/ai/demand-forecast
// @access  Private (Admin)
const getCourseDemandForecast = async (req, res) => {
  try {
    const forecast = await calculateDemandForecast();

    res.json({
      success: true,
      forecast
    });

  } catch (error) {
    console.error('Error generating demand forecast:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate demand forecast'
    });
  }
};

// @desc    Get catalog health check
// @route   GET /api/ai/catalog-health
// @access  Private (Admin)
const getCatalogHealthCheck = async (req, res) => {
  try {
    const healthCheck = await calculateCatalogHealth();

    res.json({
      success: true,
      healthCheck
    });

  } catch (error) {
    console.error('Error analyzing catalog health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze catalog health'
    });
  }
};

// Helper function to analyze student load
const calculateStudentLoadAnalysis = async (student) => {
  const enrolledCourses = student.enrolledCourses.filter(
    enrollment => enrollment.status === 'enrolled'
  );

  const totalCredits = enrolledCourses.reduce((sum, enrollment) => 
    sum + (enrollment.courseId.credits || 3), 0
  );

  const courseCount = enrolledCourses.length;
  const gpa = student.gpa || 0;

  let loadStatus = 'Normal';
  let recommendations = [];

  // Analyze load based on credits and GPA
  if (totalCredits > 18) {
    loadStatus = 'Overloaded';
    recommendations.push('Consider dropping a course to maintain academic performance');
    if (gpa < 3.0) {
      recommendations.push('Heavy course load may be impacting GPA - recommend academic advising');
    }
  } else if (totalCredits < 12) {
    loadStatus = 'Underloaded';
    recommendations.push('Consider adding courses to maintain full-time status');
  } else if (totalCredits >= 15 && gpa < 2.5) {
    loadStatus = 'At Risk';
    recommendations.push('Current course load may be challenging given GPA - consider reducing load');
  }

  // Check for difficult course combinations
  const advancedCourses = enrolledCourses.filter(enrollment => 
    enrollment.courseId.difficulty === 'Advanced'
  ).length;

  if (advancedCourses > 2) {
    recommendations.push('Multiple advanced courses detected - monitor student progress closely');
  }

  return {
    studentId: student._id,
    studentName: student.name,
    totalCredits,
    courseCount,
    gpa,
    loadStatus,
    recommendations,
    courses: enrolledCourses.map(enrollment => ({
      courseCode: enrollment.courseId.courseCode,
      title: enrollment.courseId.title,
      credits: enrollment.courseId.credits,
      difficulty: enrollment.courseId.difficulty
    }))
  };
};

// Helper function to generate demand forecast
const calculateDemandForecast = async () => {
  const courses = await Course.find({ isActive: true });
  const users = await User.find({ role: 'student' });

  const forecast = courses.map(course => {
    const enrollmentRatio = course.currentEnrollment / course.maxCapacity;
    const departmentStudents = users.filter(user => user.major === course.department).length;
    
    let demandLevel = 'Low';
    let projectedEnrollment = course.currentEnrollment;

    if (enrollmentRatio > 0.8) {
      demandLevel = 'High';
      projectedEnrollment = Math.min(course.maxCapacity, course.currentEnrollment * 1.2);
    } else if (enrollmentRatio > 0.5) {
      demandLevel = 'Medium';
      projectedEnrollment = Math.min(course.maxCapacity, course.currentEnrollment * 1.1);
    }

    // Factor in department size
    if (departmentStudents > 50 && course.courseCode.includes('101')) {
      demandLevel = 'High';
    }

    return {
      courseId: course._id,
      courseCode: course.courseCode,
      title: course.title,
      currentEnrollment: course.currentEnrollment,
      maxCapacity: course.maxCapacity,
      enrollmentRatio: Math.round(enrollmentRatio * 100),
      demandLevel,
      projectedEnrollment: Math.round(projectedEnrollment),
      departmentStudents,
      recommendations: getDemandRecommendations(demandLevel, enrollmentRatio, course)
    };
  });

  return forecast.sort((a, b) => b.enrollmentRatio - a.enrollmentRatio);
};

// Helper function to get demand recommendations
const getDemandRecommendations = (demandLevel, enrollmentRatio, course) => {
  const recommendations = [];

  if (demandLevel === 'High' && enrollmentRatio > 0.9) {
    recommendations.push('Consider increasing capacity or adding another section');
  } else if (demandLevel === 'Low' && enrollmentRatio < 0.3) {
    recommendations.push('Low enrollment - consider marketing or schedule adjustment');
  }

  if (course.courseCode.includes('101') && demandLevel === 'High') {
    recommendations.push('High demand for introductory course - ensure adequate capacity');
  }

  return recommendations;
};

// Helper function to analyze catalog health
const calculateCatalogHealth = async () => {
  const courses = await Course.find({ isActive: true });
  const users = await User.find({ role: 'student' });

  const departmentStats = {};
  const levelStats = { beginner: 0, intermediate: 0, advanced: 0 };

  courses.forEach(course => {
    // Department analysis
    if (!departmentStats[course.department]) {
      departmentStats[course.department] = {
        totalCourses: 0,
        totalEnrollment: 0,
        avgCapacityUsed: 0
      };
    }
    departmentStats[course.department].totalCourses++;
    departmentStats[course.department].totalEnrollment += course.currentEnrollment;

    // Level analysis
    if (course.difficulty) {
      levelStats[course.difficulty.toLowerCase()]++;
    }
  });

  // Calculate averages
  Object.keys(departmentStats).forEach(dept => {
    const stats = departmentStats[dept];
    stats.avgCapacityUsed = Math.round(
      (stats.totalEnrollment / (stats.totalCourses * 30)) * 100
    ); // Assuming avg capacity of 30
  });

  const issues = [];
  const recommendations = [];

  // Identify issues
  const totalCourses = courses.length;
  if (levelStats.beginner / totalCourses < 0.3) {
    issues.push('Insufficient beginner-level courses');
    recommendations.push('Add more introductory courses for new students');
  }

  if (levelStats.advanced / totalCourses > 0.4) {
    issues.push('Too many advanced courses relative to enrollment capacity');
    recommendations.push('Balance course levels - consider more intermediate options');
  }

  // Check department balance
  const studentsByMajor = {};
  users.forEach(user => {
    if (user.major) {
      studentsByMajor[user.major] = (studentsByMajor[user.major] || 0) + 1;
    }
  });

  Object.keys(studentsByMajor).forEach(major => {
    const studentCount = studentsByMajor[major];
    const courseCount = departmentStats[major]?.totalCourses || 0;
    const ratio = courseCount / studentCount;

    if (ratio < 0.1) {
      issues.push(`${major} department may have insufficient course offerings`);
      recommendations.push(`Consider expanding ${major} course catalog`);
    }
  });

  return {
    totalCourses,
    departmentStats,
    levelStats,
    studentsByMajor,
    issues,
    recommendations,
    overallHealth: issues.length === 0 ? 'Good' : issues.length < 3 ? 'Fair' : 'Needs Attention'
  };
};

// @desc    Detect registration anomalies
// @route   GET /api/ai/anomaly-detection
// @access  Admin only
const detectAnomalies = async (req, res) => {
  try {
    const { timeframe = 'weekly' } = req.query;
    
    const anomalies = await AnomalyDetectionService.detectRegistrationAnomalies(timeframe);
    
    res.json({
      success: true,
      data: anomalies
    });

  } catch (error) {
    console.error('Error detecting anomalies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to detect anomalies'
    });
  }
};

// @desc    Get chatbot usage analytics
// @route   GET /api/ai/chatbot-analytics
// @access  Admin only
const getChatbotAnalytics = async (req, res) => {
  try {
    const { timeframe = 'weekly' } = req.query;
    
    const analytics = await ChatbotAnalyticsService.getChatbotAnalytics(timeframe);
    
    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error getting chatbot analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chatbot analytics'
    });
  }
};

module.exports = {
  getPersonalizedRecommendations,
  analyzeScheduleOptimization,
  analyzeStudentLoad,
  getCourseDemandForecast,
  getCatalogHealthCheck,
  detectAnomalies,
  getChatbotAnalytics
};
