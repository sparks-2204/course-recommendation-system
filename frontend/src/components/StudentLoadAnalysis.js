import React, { useState, useEffect } from 'react';
import { aiAPI } from '../utils/api';

const StudentLoadAnalysis = ({ studentId, studentName }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentId) {
      fetchStudentLoadAnalysis();
    }
  }, [studentId]);

  const fetchStudentLoadAnalysis = async () => {
    try {
      setLoading(true);
      const response = await aiAPI.getStudentLoadAnalysis(studentId);
      setAnalysis(response.data.analysis);
      setError('');
    } catch (error) {
      console.error('Error fetching student load analysis:', error);
      setError('Failed to load student analysis');
    } finally {
      setLoading(false);
    }
  };

  const getLoadStatusColor = (status) => {
    switch (status) {
      case 'Overloaded':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'At Risk':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'Normal':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'Underloaded':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Advanced':
        return 'text-red-600 bg-red-100';
      case 'Intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'Beginner':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <span className="text-2xl mb-2 block">⚠️</span>
          <p>{error}</p>
          <button
            onClick={fetchStudentLoadAnalysis}
            className="mt-2 text-sm text-primary-600 hover:text-primary-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <span className="text-2xl mb-2 block">📊</span>
          <p>No analysis data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="mr-2">📊</span>
          Student Load Analysis
        </h3>
        <button
          onClick={fetchStudentLoadAnalysis}
          className="text-primary-600 hover:text-primary-500 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Student Info */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-2">{analysis.studentName}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{analysis.courseCount}</div>
            <div className="text-sm text-gray-600">Courses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analysis.totalCredits}</div>
            <div className="text-sm text-gray-600">Credits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analysis.gpa.toFixed(2)}</div>
            <div className="text-sm text-gray-600">GPA</div>
          </div>
          <div className="text-center">
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getLoadStatusColor(analysis.loadStatus)}`}>
              {analysis.loadStatus}
            </div>
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="mb-6">
        <h5 className="font-medium text-gray-900 mb-3">Enrolled Courses</h5>
        <div className="space-y-2">
          {analysis.courses.map((course, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {course.courseCode} - {course.title}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">{course.credits} credits</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {analysis.courses.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <span className="text-2xl mb-2 block">📚</span>
            <p>No courses enrolled</p>
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-3 flex items-center">
            <span className="mr-2">🤖</span>
            AI Recommendations for Faculty
          </h5>
          <ul className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start text-blue-800">
                <span className="mr-2 mt-1">•</span>
                <span className="text-sm">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Load Status Indicators */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h6 className="font-medium text-gray-900 mb-2">Credit Load Guidelines</h6>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Underloaded:</span>
              <span className="text-blue-600">&lt; 12 credits</span>
            </div>
            <div className="flex justify-between">
              <span>Normal:</span>
              <span className="text-green-600">12-15 credits</span>
            </div>
            <div className="flex justify-between">
              <span>Heavy:</span>
              <span className="text-orange-600">16-18 credits</span>
            </div>
            <div className="flex justify-between">
              <span>Overloaded:</span>
              <span className="text-red-600">&gt; 18 credits</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h6 className="font-medium text-gray-900 mb-2">Performance Indicators</h6>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>GPA:</span>
              <span className={analysis.gpa >= 3.5 ? 'text-green-600' : analysis.gpa >= 2.5 ? 'text-yellow-600' : 'text-red-600'}>
                {analysis.gpa.toFixed(2)} / 4.0
              </span>
            </div>
            <div className="flex justify-between">
              <span>Course Load:</span>
              <span className={`${getLoadStatusColor(analysis.loadStatus).split(' ')[0]}`}>
                {analysis.loadStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Advanced Courses:</span>
              <span className="text-gray-600">
                {analysis.courses.filter(c => c.difficulty === 'Advanced').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLoadAnalysis;
