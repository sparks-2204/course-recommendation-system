const mongoose = require('mongoose');

const chatbotLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  query: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  intent: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    default: 0
  },
  responseTime: {
    type: Number, // milliseconds
    required: true
  },
  satisfied: {
    type: Boolean,
    default: null // null = not rated, true = satisfied, false = unsatisfied
  },
  feedback: {
    type: String,
    default: ''
  },
  sessionId: {
    type: String,
    required: true
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index for analytics queries
chatbotLogSchema.index({ userId: 1, createdAt: -1 });
chatbotLogSchema.index({ intent: 1, createdAt: -1 });
chatbotLogSchema.index({ sessionId: 1, createdAt: -1 });
chatbotLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ChatbotLog', chatbotLogSchema);
