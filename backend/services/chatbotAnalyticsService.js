const ChatbotLog = require('../models/ChatbotLog');
const User = require('../models/User');

class ChatbotAnalyticsService {
  
  /**
   * Get comprehensive chatbot usage analytics
   * @param {string} timeframe - 'daily', 'weekly', 'monthly'
   * @returns {Object} Analytics data
   */
  static async getChatbotAnalytics(timeframe = 'weekly') {
    try {
      const timeRanges = this.getTimeRange(timeframe);
      
      const analytics = {
        overview: await this.getOverviewStats(timeRanges),
        intentAnalysis: await this.getIntentAnalysis(timeRanges),
        userEngagement: await this.getUserEngagement(timeRanges),
        performanceMetrics: await this.getPerformanceMetrics(timeRanges),
        satisfactionRatings: await this.getSatisfactionRatings(timeRanges),
        popularQueries: await this.getPopularQueries(timeRanges),
        timeDistribution: await this.getTimeDistribution(timeRanges),
        userSegmentation: await this.getUserSegmentation(timeRanges)
      };

      return {
        success: true,
        timeframe,
        period: {
          start: timeRanges.start,
          end: timeRanges.end
        },
        analytics
      };

    } catch (error) {
      console.error('Error generating chatbot analytics:', error);
      throw error;
    }
  }

  /**
   * Get overview statistics
   */
  static async getOverviewStats(timeRanges) {
    try {
      const totalInteractions = await ChatbotLog.countDocuments({
        createdAt: { $gte: timeRanges.start, $lte: timeRanges.end }
      });

      const uniqueUsers = await ChatbotLog.distinct('userId', {
        createdAt: { $gte: timeRanges.start, $lte: timeRanges.end }
      });

      const uniqueSessions = await ChatbotLog.distinct('sessionId', {
        createdAt: { $gte: timeRanges.start, $lte: timeRanges.end }
      });

      const avgResponseTime = await ChatbotLog.aggregate([
        { $match: { createdAt: { $gte: timeRanges.start, $lte: timeRanges.end } } },
        { $group: { _id: null, avgTime: { $avg: '$responseTime' } } }
      ]);

      const previousPeriod = this.getPreviousPeriod(timeRanges);
      const previousInteractions = await ChatbotLog.countDocuments({
        createdAt: { $gte: previousPeriod.start, $lte: previousPeriod.end }
      });

      const growthRate = previousInteractions > 0 
        ? ((totalInteractions - previousInteractions) / previousInteractions * 100).toFixed(1)
        : 0;

      return {
        totalInteractions,
        uniqueUsers: uniqueUsers.length,
        uniqueSessions: uniqueSessions.length,
        avgResponseTime: avgResponseTime[0]?.avgTime || 0,
        growthRate: parseFloat(growthRate),
        avgInteractionsPerUser: uniqueUsers.length > 0 ? (totalInteractions / uniqueUsers.length).toFixed(1) : 0,
        avgInteractionsPerSession: uniqueSessions.length > 0 ? (totalInteractions / uniqueSessions.length).toFixed(1) : 0
      };

    } catch (error) {
      console.error('Error getting overview stats:', error);
      return {};
    }
  }

  /**
   * Analyze intent distribution
   */
  static async getIntentAnalysis(timeRanges) {
    try {
      const intentStats = await ChatbotLog.aggregate([
        { $match: { createdAt: { $gte: timeRanges.start, $lte: timeRanges.end } } },
        { 
          $group: { 
            _id: '$intent', 
            count: { $sum: 1 },
            avgConfidence: { $avg: '$confidence' },
            avgResponseTime: { $avg: '$responseTime' }
          } 
        },
        { $sort: { count: -1 } }
      ]);

      const totalInteractions = intentStats.reduce((sum, intent) => sum + intent.count, 0);

      return intentStats.map(intent => ({
        intent: intent._id,
        count: intent.count,
        percentage: totalInteractions > 0 ? ((intent.count / totalInteractions) * 100).toFixed(1) : 0,
        avgConfidence: intent.avgConfidence?.toFixed(2) || 0,
        avgResponseTime: intent.avgResponseTime?.toFixed(0) || 0
      }));

    } catch (error) {
      console.error('Error analyzing intents:', error);
      return [];
    }
  }

  /**
   * Get user engagement metrics
   */
  static async getUserEngagement(timeRanges) {
    try {
      const engagementStats = await ChatbotLog.aggregate([
        { $match: { createdAt: { $gte: timeRanges.start, $lte: timeRanges.end } } },
        {
          $group: {
            _id: '$userId',
            interactionCount: { $sum: 1 },
            sessionCount: { $addToSet: '$sessionId' },
            avgResponseTime: { $avg: '$responseTime' },
            firstInteraction: { $min: '$createdAt' },
            lastInteraction: { $max: '$createdAt' }
          }
        },
        {
          $project: {
            userId: '$_id',
            interactionCount: 1,
            sessionCount: { $size: '$sessionCount' },
            avgResponseTime: 1,
            engagementDuration: { 
              $divide: [{ $subtract: ['$lastInteraction', '$firstInteraction'] }, 1000 * 60] // minutes
            }
          }
        }
      ]);

      // Categorize users by engagement level
      const highEngagement = engagementStats.filter(user => user.interactionCount >= 10).length;
      const mediumEngagement = engagementStats.filter(user => user.interactionCount >= 3 && user.interactionCount < 10).length;
      const lowEngagement = engagementStats.filter(user => user.interactionCount < 3).length;

      const avgInteractionsPerUser = engagementStats.length > 0 
        ? (engagementStats.reduce((sum, user) => sum + user.interactionCount, 0) / engagementStats.length).toFixed(1)
        : 0;

      return {
        totalUsers: engagementStats.length,
        highEngagement,
        mediumEngagement,
        lowEngagement,
        avgInteractionsPerUser: parseFloat(avgInteractionsPerUser),
        engagementDistribution: {
          high: highEngagement,
          medium: mediumEngagement,
          low: lowEngagement
        }
      };

    } catch (error) {
      console.error('Error analyzing user engagement:', error);
      return {};
    }
  }

  /**
   * Get performance metrics
   */
  static async getPerformanceMetrics(timeRanges) {
    try {
      const performanceStats = await ChatbotLog.aggregate([
        { $match: { createdAt: { $gte: timeRanges.start, $lte: timeRanges.end } } },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTime' },
            minResponseTime: { $min: '$responseTime' },
            maxResponseTime: { $max: '$responseTime' },
            avgConfidence: { $avg: '$confidence' },
            totalInteractions: { $sum: 1 }
          }
        }
      ]);

      const stats = performanceStats[0] || {};

      // Response time categories
      const responseTimeCategories = await ChatbotLog.aggregate([
        { $match: { createdAt: { $gte: timeRanges.start, $lte: timeRanges.end } } },
        {
          $bucket: {
            groupBy: '$responseTime',
            boundaries: [0, 500, 1000, 2000, 5000, Infinity],
            default: 'other',
            output: { count: { $sum: 1 } }
          }
        }
      ]);

      return {
        avgResponseTime: stats.avgResponseTime?.toFixed(0) || 0,
        minResponseTime: stats.minResponseTime || 0,
        maxResponseTime: stats.maxResponseTime || 0,
        avgConfidence: stats.avgConfidence?.toFixed(2) || 0,
        responseTimeDistribution: responseTimeCategories.reduce((acc, bucket) => {
          const key = bucket._id === 'other' ? '5000+' : 
                     bucket._id === 0 ? '0-500ms' :
                     bucket._id === 500 ? '500ms-1s' :
                     bucket._id === 1000 ? '1-2s' :
                     bucket._id === 2000 ? '2-5s' : '5s+';
          acc[key] = bucket.count;
          return acc;
        }, {})
      };

    } catch (error) {
      console.error('Error analyzing performance metrics:', error);
      return {};
    }
  }

  /**
   * Get satisfaction ratings
   */
  static async getSatisfactionRatings(timeRanges) {
    try {
      const satisfactionStats = await ChatbotLog.aggregate([
        { 
          $match: { 
            createdAt: { $gte: timeRanges.start, $lte: timeRanges.end },
            satisfied: { $ne: null }
          } 
        },
        {
          $group: {
            _id: '$satisfied',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalRated = satisfactionStats.reduce((sum, rating) => sum + rating.count, 0);
      const satisfied = satisfactionStats.find(s => s._id === true)?.count || 0;
      const unsatisfied = satisfactionStats.find(s => s._id === false)?.count || 0;

      return {
        totalRated,
        satisfied,
        unsatisfied,
        satisfactionRate: totalRated > 0 ? ((satisfied / totalRated) * 100).toFixed(1) : 0,
        responseRate: totalRated // Could calculate against total interactions if needed
      };

    } catch (error) {
      console.error('Error analyzing satisfaction ratings:', error);
      return {};
    }
  }

  /**
   * Get popular queries
   */
  static async getPopularQueries(timeRanges) {
    try {
      const popularQueries = await ChatbotLog.aggregate([
        { $match: { createdAt: { $gte: timeRanges.start, $lte: timeRanges.end } } },
        {
          $group: {
            _id: { $toLower: '$query' },
            count: { $sum: 1 },
            avgResponseTime: { $avg: '$responseTime' },
            intent: { $first: '$intent' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]);

      return popularQueries.map(query => ({
        query: query._id,
        count: query.count,
        avgResponseTime: query.avgResponseTime?.toFixed(0) || 0,
        intent: query.intent
      }));

    } catch (error) {
      console.error('Error analyzing popular queries:', error);
      return [];
    }
  }

  /**
   * Get time distribution of interactions
   */
  static async getTimeDistribution(timeRanges) {
    try {
      const hourlyDistribution = await ChatbotLog.aggregate([
        { $match: { createdAt: { $gte: timeRanges.start, $lte: timeRanges.end } } },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      const dailyDistribution = await ChatbotLog.aggregate([
        { $match: { createdAt: { $gte: timeRanges.start, $lte: timeRanges.end } } },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      return {
        hourly: hourlyDistribution.map(h => ({ hour: h._id, count: h.count })),
        daily: dailyDistribution.map(d => ({ 
          day: dayNames[d._id - 1], 
          dayNumber: d._id,
          count: d.count 
        }))
      };

    } catch (error) {
      console.error('Error analyzing time distribution:', error);
      return {};
    }
  }

  /**
   * Get user segmentation data
   */
  static async getUserSegmentation(timeRanges) {
    try {
      const userSegmentation = await ChatbotLog.aggregate([
        { $match: { createdAt: { $gte: timeRanges.start, $lte: timeRanges.end } } },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $group: {
            _id: '$user.role',
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' }
          }
        }
      ]);

      return userSegmentation.map(segment => ({
        role: segment._id,
        interactions: segment.count,
        uniqueUsers: segment.uniqueUsers.length
      }));

    } catch (error) {
      console.error('Error analyzing user segmentation:', error);
      return [];
    }
  }

  /**
   * Helper method to get time range
   */
  static getTimeRange(timeframe) {
    const now = new Date();
    let start;

    switch (timeframe) {
      case 'daily':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return { start, end: now };
  }

  /**
   * Get previous period for comparison
   */
  static getPreviousPeriod(timeRanges) {
    const duration = timeRanges.end - timeRanges.start;
    return {
      start: new Date(timeRanges.start.getTime() - duration),
      end: timeRanges.start
    };
  }
}

module.exports = ChatbotAnalyticsService;
