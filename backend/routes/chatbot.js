const express = require('express');
const { auth } = require('../middleware/auth');
const {
  handleChatbotQuery,
  getChatHistory
} = require('../controllers/chatbotController');

const router = express.Router();

// @route   POST /api/chatbot/query
// @desc    Handle chatbot queries
// @access  Private
router.post('/query', auth, handleChatbotQuery);

// @route   GET /api/chatbot/history
// @desc    Get chat history
// @access  Private
router.get('/history', auth, getChatHistory);

module.exports = router;
