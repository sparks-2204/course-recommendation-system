import React, { useState, useEffect } from 'react';
import { aiAPI } from '../utils/api';
import { useNotification } from './NotificationSystem';
import AnomalyDetection from './AnomalyDetection';
import ChatbotAnalytics from './ChatbotAnalytics';

const AdminAnalytics = () => {
  const [demandForecast, setDemandForecast] = useState([]);
  const [catalogHealth, setCatalogHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('demand');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [demandResponse, healthResponse] = await Promise.all([
        aiAPI.getCourseDemandForecast(),
        aiAPI.getCatalogHealthCheck()
      ]);
      
      setDemandForecast(demandResponse.data.forecast);
      setCatalogHealth(healthResponse.data.healthCheck);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showNotification('Failed to load analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getDemandColor = (level) => {
    switch (level) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'Good': return 'text-green-600 bg-green-100';
      case 'Fair': return 'text-yellow-600 bg-yellow-100';
      case 'Needs Attention': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('demand')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'demand'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📈 Demand Forecast
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'health'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏥 Catalog Health
            </button>
            <button
              onClick={() => setActiveTab('anomalies')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'anomalies'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🚨 Anomaly Detection
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chatbot'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🤖 Chatbot Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'demand' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Course Demand Forecasting</h3>
                <button
                  onClick={fetchAnalytics}
                  className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                >
                  Refresh Data
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {demandForecast.map((course, index) => (
                  <div key={course.courseId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {course.courseCode} - {course.title}
                        </h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDemandColor(course.demandLevel)}`}>
                            {course.demandLevel} Demand
                          </span>
                          <span className="text-sm text-gray-600">
                            {course.enrollmentRatio}% capacity
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary-600">
                          {course.currentEnrollment}
                        </div>
                        <div className="text-xs text-gray-600">Current</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {course.projectedEnrollment}
                        </div>
                        <div className="text-xs text-gray-600">Projected</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {course.maxCapacity}
                        </div>
                        <div className="text-xs text-gray-600">Capacity</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${Math.min(course.enrollmentRatio, 100)}%` }}
                      ></div>
                    </div>

                    {/* Recommendations */}
                    {course.recommendations && course.recommendations.length > 0 && (
                      <div className="bg-blue-50 rounded p-3">
                        <h6 className="text-sm font-medium text-blue-900 mb-1">AI Recommendations:</h6>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {course.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {demandForecast.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">📊</span>
                  <p>No demand forecast data available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'health' && catalogHealth && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Catalog Health Analysis</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(catalogHealth.overallHealth)}`}>
                  {catalogHealth.overallHealth}
                </span>
              </div>

              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{catalogHealth.totalCourses}</div>
                  <div className="text-sm text-blue-800">Total Courses</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{catalogHealth.levelStats.beginner}</div>
                  <div className="text-sm text-green-800">Beginner</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{catalogHealth.levelStats.intermediate}</div>
                  <div className="text-sm text-yellow-800">Intermediate</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{catalogHealth.levelStats.advanced}</div>
                  <div className="text-sm text-red-800">Advanced</div>
                </div>
              </div>

              {/* Department Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Department Statistics</h4>
                  <div className="space-y-3">
                    {Object.entries(catalogHealth.departmentStats).map(([dept, stats]) => (
                      <div key={dept} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">{dept}</div>
                          <div className="text-sm text-gray-600">{stats.totalCourses} courses</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {stats.avgCapacityUsed}% avg capacity
                          </div>
                          <div className="text-sm text-gray-600">
                            {stats.totalEnrollment} total enrolled
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Student Distribution</h4>
                  <div className="space-y-3">
                    {Object.entries(catalogHealth.studentsByMajor).map(([major, count]) => (
                      <div key={major} className="flex justify-between items-center">
                        <div className="font-medium text-gray-900">{major}</div>
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 mr-2">{count}</div>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{
                                width: `${(count / Math.max(...Object.values(catalogHealth.studentsByMajor))) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Issues and Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {catalogHealth.issues && catalogHealth.issues.length > 0 && (
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                      <span className="mr-2">⚠️</span>
                      Identified Issues
                    </h4>
                    <ul className="space-y-2">
                      {catalogHealth.issues.map((issue, index) => (
                        <li key={index} className="flex items-start text-red-800">
                          <span className="mr-2 mt-1">•</span>
                          <span className="text-sm">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {catalogHealth.recommendations && catalogHealth.recommendations.length > 0 && (
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <span className="mr-2">💡</span>
                      AI Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {catalogHealth.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start text-blue-800">
                          <span className="mr-2 mt-1">•</span>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {catalogHealth.issues.length === 0 && catalogHealth.recommendations.length === 0 && (
                <div className="text-center py-8 text-green-600">
                  <span className="text-4xl mb-4 block">✅</span>
                  <p className="font-medium">Catalog is in good health!</p>
                  <p className="text-sm text-gray-600">No major issues detected</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'anomalies' && (
            <AnomalyDetection />
          )}

          {activeTab === 'chatbot' && (
            <ChatbotAnalytics />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
