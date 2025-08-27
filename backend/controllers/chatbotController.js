const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Handle chatbot queries
// @route   POST /api/chatbot/query
// @access  Private
const handleChatbotQuery = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;
    const startTime = Date.now();

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Use enhanced natural language processing
    const EnhancedChatbotService = require('../services/enhancedChatbotService');
    const response = await EnhancedChatbotService.processNaturalLanguageQuery(message, userId);

    const responseTime = Date.now() - startTime;

    // Log interaction for analytics
    await EnhancedChatbotService.logInteraction(
      userId, 
      message, 
      response, 
      { type: response.type || 'general', confidence: 0.8 },
      sessionId,
      responseTime,
      {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    );

    res.json({
      success: true,
      response: response.response,
      type: response.type,
      suggestions: response.suggestions || []
    });

  } catch (error) {
    console.error('Chatbot query error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get chatbot conversation history (placeholder)
// @route   GET /api/chatbot/history
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    // In a real implementation, you'd store chat history in the database
    res.json({
      success: true,
      history: [
        {
          id: 1,
          message: "Hello! How can I help you today?",
          type: "bot",
          timestamp: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  handleChatbotQuery,
  getChatHistory
};
