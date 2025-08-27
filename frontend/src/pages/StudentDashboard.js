import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { courseAPI } from '../utils/api';
import CourseCard from '../components/CourseCard';
import AIRecommendations from '../components/AIRecommendations';
import { useNotification } from '../components/NotificationSystem';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [myCoursesRes, recommendationsRes] = await Promise.all([
        courseAPI.getMyCourses(),
        courseAPI.getRecommendations()
      ]);

      setMyCourses(myCoursesRes.data.courses);
      setRecommendations(recommendationsRes.data.recommendations);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSchedule = () => {
    const timeSlots = [
      '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', 
      '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
    ];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    const schedule = {};
    days.forEach(day => {
      schedule[day] = {};
    });

    myCourses.forEach(course => {
      if (course.schedule && course.schedule.days) {
        course.schedule.days.forEach(day => {
          const startTime = course.schedule.startTime;
          if (schedule[day]) {
            schedule[day][startTime] = course;
          }
        });
      }
    });

    return { schedule, timeSlots, days };
  };

  const { schedule, timeSlots, days } = generateSchedule();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-secondary-600 mt-2">
          Here's your academic overview for {user?.major} - {user?.year}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Enrolled Courses</p>
              <p className="text-2xl font-bold text-secondary-900">{myCourses.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Credits</p>
              <p className="text-2xl font-bold text-secondary-900">
                {myCourses.reduce((sum, course) => sum + (course.credits || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Current GPA</p>
              <p className="text-2xl font-bold text-secondary-900">{user?.gpa?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Student ID</p>
              <p className="text-lg font-bold text-secondary-900">{user?.studentId}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Schedule */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-secondary-900">Weekly Schedule</h2>
              <Link to="/my-courses" className="btn-secondary text-sm">
                View All Courses
              </Link>
            </div>

            {myCourses.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-secondary-900">No courses enrolled</h3>
                <p className="mt-1 text-sm text-secondary-500">Get started by browsing the course catalog.</p>
                <div className="mt-6">
                  <Link to="/courses" className="btn-primary">
                    Browse Courses
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-secondary-500 uppercase">Time</th>
                      {days.map(day => (
                        <th key={day} className="px-3 py-2 text-left text-xs font-medium text-secondary-500 uppercase">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200">
                    {timeSlots.map(time => (
                      <tr key={time}>
                        <td className="px-3 py-2 text-sm font-medium text-secondary-900">{time}</td>
                        {days.map(day => (
                          <td key={`${day}-${time}`} className="px-3 py-2">
                            {schedule[day][time] ? (
                              <div className="bg-primary-100 text-primary-800 p-2 rounded text-xs">
                                <div className="font-medium">{schedule[day][time].courseCode}</div>
                                <div className="text-primary-600">
                                  {schedule[day][time].schedule && schedule[day][time].schedule.room ? 
                                    schedule[day][time].schedule.room : 'Room TBD'
                                  }
                                </div>
                              </div>
                            ) : (
                              <div className="h-12"></div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* AI-Powered Recommendations */}
        <AIRecommendations userId={user.id} />

        <div>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-secondary-900">Recommended Courses</h2>
              <Link to="/courses" className="btn-secondary text-sm">
                View All
              </Link>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-secondary-500">No recommendations available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.slice(0, 3).map(course => (
                  <div key={course._id} className="border border-secondary-200 rounded-lg p-4">
                    <h3 className="font-medium text-secondary-900 mb-1">
                      {course.courseCode} - {course.title}
                    </h3>
                    <p className="text-sm text-secondary-600 mb-2">
                      {course.credits} Credits • {course.instructor}
                    </p>
                    <p className="text-xs text-primary-600 mb-3">
                      {course.reason}
                    </p>
                    <Link
                      to={`/courses/${course._id}`}
                      className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card mt-6">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/courses'}
                className="flex items-center p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors w-full text-left"
              >
                <svg className="w-5 h-5 text-primary-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm font-medium text-primary-700">Browse Course Catalog</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/my-courses'}
                className="flex items-center p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors w-full text-left"
              >
                <svg className="w-5 h-5 text-secondary-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm font-medium text-secondary-700">Manage My Courses</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
