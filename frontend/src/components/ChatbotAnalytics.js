import React, { useState, useEffect } from 'react';
import { aiAPI } from '../utils/api';
import { useNotification } from './NotificationSystem';

const ChatbotAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('weekly');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getChatbotAnalytics(timeframe);
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching chatbot analytics:', error);
      showNotification('Failed to fetch chatbot analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num?.toString() || '0';
  };

  const formatTime = (ms) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getEngagementColor = (level) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🤖 Chatbot Usage Analytics
          </h2>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="daily">Last 24 Hours</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
          </select>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatNumber(analytics.overview.totalInteractions)}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Total Interactions</div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.overview.growthRate > 0 ? '↗' : '↘'} {Math.abs(analytics.overview.growthRate)}%
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {analytics.overview.uniqueUsers}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Active Users</div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.overview.avgInteractionsPerUser} avg/user
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {analytics.overview.uniqueSessions}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">Sessions</div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.overview.avgInteractionsPerSession} avg/session
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatTime(analytics.overview.avgResponseTime)}
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400">Avg Response Time</div>
            <div className="text-xs text-gray-500 mt-1">Performance metric</div>
          </div>
        </div>
      </div>

      {/* Intent Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📊 Intent Distribution
        </h3>
        <div className="space-y-3">
          {analytics.intentAnalysis.slice(0, 8).map((intent, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white capitalize">
                    {intent.intent}
                  </div>
                  <div className="text-sm text-gray-500">
                    {intent.count} queries • {formatTime(intent.avgResponseTime)} avg
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {intent.percentage}%
                </div>
                <div className="text-sm text-gray-500">
                  {intent.avgConfidence} confidence
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Engagement */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          👥 User Engagement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${getEngagementColor('high')}`}>
            <div className="text-2xl font-bold">{analytics.userEngagement.highEngagement}</div>
            <div className="text-sm">High Engagement</div>
            <div className="text-xs opacity-75">10+ interactions</div>
          </div>
          <div className={`p-4 rounded-lg ${getEngagementColor('medium')}`}>
            <div className="text-2xl font-bold">{analytics.userEngagement.mediumEngagement}</div>
            <div className="text-sm">Medium Engagement</div>
            <div className="text-xs opacity-75">3-9 interactions</div>
          </div>
          <div className={`p-4 rounded-lg ${getEngagementColor('low')}`}>
            <div className="text-2xl font-bold">{analytics.userEngagement.lowEngagement}</div>
            <div className="text-sm">Low Engagement</div>
            <div className="text-xs opacity-75">1-2 interactions</div>
          </div>
        </div>
        <div className="text-center text-gray-600 dark:text-gray-300">
          Average: {analytics.userEngagement.avgInteractionsPerUser} interactions per user
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          ⚡ Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Response Times</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Average:</span>
                <span className="font-medium">{formatTime(analytics.performanceMetrics.avgResponseTime)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Fastest:</span>
                <span className="font-medium">{formatTime(analytics.performanceMetrics.minResponseTime)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Slowest:</span>
                <span className="font-medium">{formatTime(analytics.performanceMetrics.maxResponseTime)}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Response Distribution</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(analytics.performanceMetrics.responseTimeDistribution || {}).map(([range, count]) => (
                <div key={range} className="flex justify-between">
                  <span>{range}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Queries */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🔥 Popular Queries
        </h3>
        <div className="space-y-3">
          {analytics.popularQueries.slice(0, 10).map((query, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    "{query.query.length > 50 ? query.query.substring(0, 50) + '...' : query.query}"
                  </div>
                  <div className="text-sm text-gray-500">
                    {query.intent} • {formatTime(query.avgResponseTime)} avg
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {query.count}
                </div>
                <div className="text-sm text-gray-500">times</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          ⏰ Usage Patterns
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Daily Distribution</h4>
            <div className="space-y-2">
              {analytics.timeDistribution.daily?.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{day.day}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(day.count / Math.max(...analytics.timeDistribution.daily.map(d => d.count))) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">{day.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Peak Hours</h4>
            <div className="space-y-2">
              {analytics.timeDistribution.hourly?.slice(0, 6).map((hour, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{hour.hour}:00 - {hour.hour + 1}:00</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(hour.count / Math.max(...analytics.timeDistribution.hourly.map(h => h.count))) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">{hour.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Segmentation */}
      {analytics.userSegmentation && analytics.userSegmentation.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            👤 User Segmentation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.userSegmentation.map((segment, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {segment.role}s
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {segment.uniqueUsers}
                </div>
                <div className="text-sm text-gray-500">
                  {segment.interactions} total interactions
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Satisfaction Ratings */}
      {analytics.satisfactionRatings && analytics.satisfactionRatings.totalRated > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            😊 User Satisfaction
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {analytics.satisfactionRatings.satisfactionRate}%
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Satisfaction Rate</div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {analytics.satisfactionRatings.satisfied}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Satisfied Users</div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {analytics.satisfactionRatings.unsatisfied}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">Unsatisfied Users</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotAnalytics;
