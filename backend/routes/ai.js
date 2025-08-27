const express = require('express');
const router = express.Router();
const {
  getPersonalizedRecommendations,
  analyzeScheduleOptimization,
  analyzeStudentLoad,
  getCourseDemandForecast,
  getCatalogHealthCheck,
  detectAnomalies,
  getChatbotAnalytics
} = require('../controllers/aiController');

const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/ai/recommendations
// @desc    Get AI-powered personalized course recommendations
// @access  Private (Student)
router.get('/recommendations', auth, authorize('student'), getPersonalizedRecommendations);

// @route   POST /api/ai/schedule-optimization
// @desc    Get schedule optimization analysis
// @access  Private (Student)
router.post('/schedule-optimization', auth, authorize('student'), analyzeScheduleOptimization);

// @route   GET /api/ai/student-load-analysis/:studentId
// @desc    Get student load analysis for faculty
// @access  Private (Faculty/Admin)
router.get('/student-load-analysis/:studentId', auth, authorize('faculty', 'admin'), analyzeStudentLoad);

// @route   GET /api/ai/demand-forecast
// @desc    Get course demand forecasting
// @access  Private (Admin)
router.get('/demand-forecast', auth, authorize('admin'), getCourseDemandForecast);

// @route   GET /api/ai/catalog-health
// @desc    Get catalog health check analysis
// @access  Private (Admin)
router.get('/catalog-health', auth, authorize('admin'), getCatalogHealthCheck);

// @route   GET /api/ai/anomaly-detection
// @desc    Detect registration anomalies
// @access  Private (Admin)
router.get('/anomaly-detection', auth, authorize('admin'), detectAnomalies);

// @route   GET /api/ai/chatbot-analytics
// @desc    Get chatbot usage analytics
// @access  Private (Admin)
router.get('/chatbot-analytics', auth, authorize('admin'), getChatbotAnalytics);

module.exports = router;
