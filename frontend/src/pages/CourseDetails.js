import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationSystem';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const response = await courseAPI.getCourse(id);
      setCourse(response.data.course);
    } catch (error) {
      showNotification('Failed to load course details', 'error');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      await courseAPI.registerForCourse(id);
      showNotification('Successfully registered for course!', 'success');
      fetchCourseDetails(); // Refresh course data
    } catch (error) {
      showNotification(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setRegistering(false);
    }
  };

  const handleDrop = async () => {
    try {
      setRegistering(true);
      await courseAPI.dropCourse(id);
      showNotification('Successfully dropped course!', 'success');
      fetchCourseDetails(); // Refresh course data
    } catch (error) {
      showNotification(error.response?.data?.message || 'Drop failed', 'error');
    } finally {
      setRegistering(false);
    }
  };

  const isEnrolled = () => {
    return course?.enrolledStudents?.some(
      enrollment => enrollment.studentId._id === user?.id
    );
  };

  const canRegister = () => {
    return user?.role === 'student' && 
           !isEnrolled() && 
           course?.enrolledStudents?.length < course?.maxCapacity;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900">Course not found</h2>
          <button 
            onClick={() => navigate('/courses')}
            className="btn-primary mt-4"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/courses')}
          className="text-primary-600 hover:text-primary-500 mb-4 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Course Catalog
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              {course.courseCode} - {course.title}
            </h1>
            <p className="text-lg text-secondary-600 mt-2">{course.instructor}</p>
          </div>
          
          {user?.role === 'student' && (
            <div className="ml-4">
              {isEnrolled() ? (
                <button
                  onClick={handleDrop}
                  disabled={registering}
                  className="btn-secondary bg-red-100 text-red-700 hover:bg-red-200"
                >
                  {registering ? 'Processing...' : 'Drop Course'}
                </button>
              ) : canRegister() ? (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="btn-primary"
                >
                  {registering ? 'Registering...' : 'Register'}
                </button>
              ) : (
                <button disabled className="btn-secondary opacity-50">
                  {course.enrolledStudents?.length >= course.maxCapacity ? 'Course Full' : 'Cannot Register'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Course Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Course Description</h2>
            <p className="text-secondary-700 leading-relaxed">{course.description}</p>
          </div>

          {/* Schedule */}
          <div className="card">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Schedule</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Days:</span> {course.schedule && course.schedule.days ? course.schedule.days.join(', ') : 'TBD'}</p>
              <p><span className="font-medium">Time:</span> {course.schedule && course.schedule.startTime ? `${course.schedule.startTime} - ${course.schedule.endTime}` : 'TBD'}</p>
              <p><span className="font-medium">Room:</span> {course.schedule && course.schedule.room ? course.schedule.room : 'TBD'}</p>
            </div>
          </div>

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold text-secondary-900 mb-4">Prerequisites</h2>
              <div className="flex flex-wrap gap-2">
                {course.prerequisites.map(prereq => (
                  <span key={prereq} className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm">
                    {prereq}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Details */}
          <div className="card">
            <h3 className="text-lg font-bold text-secondary-900 mb-4">Course Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-secondary-600">Credits</span>
                <p className="text-lg font-bold text-primary-600">{course.credits}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-secondary-600">Department</span>
                <p className="text-secondary-900">{course.department}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-secondary-600">Level</span>
                <p className="text-secondary-900 capitalize">{course.level}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-secondary-600">Category</span>
                <p className="text-secondary-900 capitalize">{course.category?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Enrollment Info */}
          <div className="card">
            <h3 className="text-lg font-bold text-secondary-900 mb-4">Enrollment</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Enrolled Students</span>
                  <span>{course.enrolledStudents?.length || 0}/{course.maxCapacity}</span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ 
                      width: `${((course.enrolledStudents?.length || 0) / course.maxCapacity) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-secondary-600">Semester:</span>
                <span className="ml-2 text-secondary-900">{course.semester} {course.year}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          {user?.role === 'student' && (
            <div className="card">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">Status</h3>
              {isEnrolled() ? (
                <div className="flex items-center text-green-600">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Enrolled</span>
                </div>
              ) : (
                <div className="flex items-center text-secondary-600">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Not Enrolled</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
