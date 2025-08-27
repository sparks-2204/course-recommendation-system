import React, { useState, useEffect } from 'react';
import { aiAPI } from '../utils/api';
import { useNotification } from './NotificationSystem';

const AIRecommendations = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleOptimization, setScheduleOptimization] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchAIRecommendations();
  }, [userId]);

  const fetchAIRecommendations = async () => {
    try {
      setLoading(true);
      const response = await aiAPI.getPersonalizedRecommendations();
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      showNotification('Failed to load AI recommendations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const analyzeScheduleOptimization = async (courseIds) => {
    try {
      const response = await aiAPI.getScheduleOptimization(courseIds);
      setScheduleOptimization(response.data.optimization);
      showNotification('Schedule analysis complete!', 'success');
    } catch (error) {
      console.error('Error analyzing schedule:', error);
      showNotification('Failed to analyze schedule', 'error');
    }
  };

  const handleCourseSelection = (courseId) => {
    setSelectedCourses(prev => {
      const newSelection = prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId];
      
      if (newSelection.length > 0) {
        analyzeScheduleOptimization(newSelection);
      } else {
        setScheduleOptimization(null);
      }
      
      return newSelection;
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getWorkloadColor = (impact) => {
    switch (impact) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <span className="mr-2">🤖</span>
            AI-Powered Course Recommendations
          </h3>
          <button
            onClick={fetchAIRecommendations}
            className="text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {recommendations.map((course, index) => (
            <div
              key={course._id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                selectedCourses.includes(course._id)
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course._id)}
                      onChange={() => handleCourseSelection(course._id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <h4 className="font-semibold text-gray-900">
                      {course.courseCode} - {course.title}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(course.aiScore)}`}>
                      {course.aiScore}% Match
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>👨‍🏫 {course.instructor}</span>
                    <span>📅 {course.schedule && course.schedule.days ? 
                      `${course.schedule.days.join(', ')} ${course.schedule.startTime}-${course.schedule.endTime}` : 
                      'Schedule TBD'
                    }</span>
                    <span>📚 {course.credits} credits</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      course.difficulty === 'Advanced' ? 'bg-red-100 text-red-700' :
                      course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {course.difficulty}
                    </span>
                  </div>

                  {/* AI Reasons */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">
                      🎯 Why this course is recommended:
                    </h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {course.aiReasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="ml-4 text-right">
                  <div className="text-sm text-gray-500">
                    {course.currentEnrollment}/{course.maxCapacity} enrolled
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{
                        width: `${(course.currentEnrollment / course.maxCapacity) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-4 block">🤖</span>
            <p>No AI recommendations available at the moment.</p>
            <p className="text-sm">Complete more courses to get better recommendations!</p>
          </div>
        )}
      </div>

      {/* Schedule Optimization Analysis */}
      {scheduleOptimization && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">📊</span>
            Schedule Optimization Analysis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scheduleOptimization.map((course, index) => (
              <div
                key={course._id}
                className={`border rounded-lg p-4 ${
                  course.hasConflicts ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">
                    {course.courseCode} - {course.title}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.optimizationScore >= 80 ? 'bg-green-100 text-green-700' :
                    course.optimizationScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {course.optimizationScore}% Optimal
                  </span>
                </div>

                {/* Conflicts */}
                {course.hasConflicts && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-red-700 mb-1">⚠️ Schedule Conflicts:</h5>
                    <ul className="text-sm text-red-600 space-y-1">
                      {course.conflicts.map((conflict, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          {conflict}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Workload Impact */}
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">📚 Workload Impact:</h5>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getWorkloadColor(course.workloadImpact.impact)}`}>
                      {course.workloadImpact.impact} Impact
                    </span>
                    <span className="text-sm text-gray-600">
                      {course.workloadImpact.newTotalCredits} total credits
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {course.workloadImpact.recommendation}
                  </p>
                </div>

                <div className="text-sm text-gray-500">
                  📅 {course.schedule && course.schedule.days ? 
                    `${course.schedule.days.join(', ')} ${course.schedule.startTime}-${course.schedule.endTime}` : 
                    'Schedule TBD'
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Overall Recommendations */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">💡 AI Recommendations:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              {scheduleOptimization.some(course => course.hasConflicts) && (
                <li>• Resolve schedule conflicts before registering</li>
              )}
              {scheduleOptimization.some(course => course.workloadImpact.impact === 'High') && (
                <li>• Consider reducing course load to maintain academic performance</li>
              )}
              {scheduleOptimization.every(course => !course.hasConflicts) && (
                <li>• ✅ No schedule conflicts detected - good to go!</li>
              )}
              <li>• Optimal study schedule: Balance morning and afternoon classes</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
