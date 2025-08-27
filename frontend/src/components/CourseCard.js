import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { courseAPI } from '../utils/api';

const CourseCard = ({ course, onUpdate, showActions = true, enrolled = false }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await courseAPI.registerForCourse(course._id);
      setMessage('Successfully registered for course!');
      if (onUpdate) onUpdate();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async () => {
    if (!window.confirm('Are you sure you want to drop this course?')) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      await courseAPI.dropCourse(course._id);
      setMessage('Successfully dropped course!');
      if (onUpdate) onUpdate();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Drop failed');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getCapacityColor = () => {
    const percentage = (course.currentEnrollment / course.maxCapacity) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const isEnrolled = enrolled || user?.enrolledCourses?.some(
    enrollment => enrollment.courseId === course._id && enrollment.status === 'enrolled'
  );

  const isFull = course.currentEnrollment >= course.maxCapacity;

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      {/* Course Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-secondary-800 mb-1">
            {course.courseCode} - {course.title}
          </h3>
          <p className="text-sm text-secondary-600">
            {course.department} • {course.credits} Credits • {course.level}
          </p>
        </div>
        <div className="text-right">
          <span className={`text-sm font-medium ${getCapacityColor()}`}>
            {course.currentEnrollment}/{course.maxCapacity}
          </span>
          <p className="text-xs text-secondary-500">Enrolled</p>
        </div>
      </div>

      {/* Course Description */}
      <p className="text-secondary-700 text-sm mb-4 line-clamp-2">
        {course.description}
      </p>

      {/* Course Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-secondary-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Instructor: {course.instructor}</span>
        </div>
        
        <div className="flex items-center text-sm text-secondary-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {course.schedule && course.schedule.days ? 
              `${course.schedule.days.join(', ')} • ${formatTime(course.schedule.startTime)} - ${formatTime(course.schedule.endTime)}` :
              'Schedule TBD'
            }
          </span>
        </div>
        
        <div className="flex items-center text-sm text-secondary-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Room: {course.schedule && course.schedule.room ? course.schedule.room : 'TBD'}</span>
        </div>

        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="flex items-start text-sm text-secondary-600">
            <svg className="w-4 h-4 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Prerequisites: {course.prerequisites.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Course Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
          {course.category}
        </span>
        <span className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full">
          {course.semester} {course.year}
        </span>
        {isFull && (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
            Full
          </span>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && user?.role === 'student' && (
        <div className="flex gap-2">
          {!isEnrolled ? (
            <button
              onClick={handleRegister}
              disabled={loading || isFull}
              className={`flex-1 ${
                isFull 
                  ? 'bg-secondary-300 text-secondary-500 cursor-not-allowed' 
                  : 'btn-primary'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Registering...
                </div>
              ) : isFull ? (
                'Course Full'
              ) : (
                'Register'
              )}
            </button>
          ) : (
            <button
              onClick={handleDrop}
              disabled={loading}
              className={`flex-1 btn-danger ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Dropping...
                </div>
              ) : (
                'Drop Course'
              )}
            </button>
          )}
        </div>
      )}

      {/* Status Message */}
      {message && (
        <div className={`mt-3 p-2 rounded text-sm ${
          message.includes('Success') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default CourseCard;
