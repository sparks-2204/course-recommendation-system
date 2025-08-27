import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { facultyAPI } from '../utils/api';
import StudentLoadAnalysis from '../components/StudentLoadAnalysis';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      const [studentsRes, coursesRes] = await Promise.all([
        facultyAPI.getStudents(),
        facultyAPI.getCourses()
      ]);

      setStudents(studentsRes.data.users);
      setCourses(coursesRes.data.courses);
    } catch (error) {
      setError('Failed to load faculty data');
      console.error('Faculty dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentCourseLoad = (student) => {
    const enrolledCourses = student.enrolledCourses?.filter(
      enrollment => enrollment.status === 'enrolled'
    ) || [];
    return enrolledCourses.length;
  };

  const getStudentCredits = (student) => {
    const enrolledCourses = student.enrolledCourses?.filter(
      enrollment => enrollment.status === 'enrolled'
    ) || [];
    return enrolledCourses.reduce((sum, enrollment) => {
      const course = courses.find(c => c._id === enrollment.courseId?._id);
      return sum + (course?.credits || 0);
    }, 0);
  };

  const getStudentCourseDetails = (student) => {
    const enrolledCourses = student.enrolledCourses?.filter(
      enrollment => enrollment.status === 'enrolled'
    ) || [];
    return enrolledCourses.map(enrollment => {
      const course = courses.find(c => c._id === enrollment.courseId?._id);
      return course ? {
        courseCode: course.courseCode,
        title: course.title,
        credits: course.credits,
        instructor: course.instructor
      } : null;
    }).filter(Boolean);
  };

  const getCourseEnrollmentStats = () => {
    return courses.map(course => ({
      ...course,
      enrollmentPercentage: (course.currentEnrollment / course.maxCapacity) * 100
    })).sort((a, b) => b.enrollmentPercentage - a.enrollmentPercentage);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Faculty Dashboard</h1>
        <p className="text-secondary-600 mt-2">
          Monitor student progress and course enrollment
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
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Students</p>
              <p className="text-2xl font-bold text-secondary-900">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Active Courses</p>
              <p className="text-2xl font-bold text-secondary-900">{courses.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Avg Course Load</p>
              <p className="text-2xl font-bold text-secondary-900">
                {students.length > 0 
                  ? (students.reduce((sum, student) => sum + getStudentCourseLoad(student), 0) / students.length).toFixed(1)
                  : '0'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Avg GPA</p>
              <p className="text-2xl font-bold text-secondary-900">
                {students.length > 0 
                  ? (students.reduce((sum, student) => sum + (student.gpa || 0), 0) / students.length).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Student List */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary-900">Student Overview</h2>
            <span className="text-sm text-secondary-500">{students.length} students</span>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {students.map(student => (
              <div
                key={student._id}
                className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 cursor-pointer transition-colors"
                onClick={() => setSelectedStudent(student)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">{student.name}</p>
                    <p className="text-sm text-secondary-600">{student.studentId} • {student.major}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-secondary-900">
                    {getStudentCourseLoad(student)} courses
                  </p>
                  <p className="text-sm text-secondary-600">
                    {getStudentCredits(student)} credits
                  </p>
                </div>
              </div>
            ))}
          </div>
          {selectedStudent && (
            <div className="mt-4 pt-4 border-t border-secondary-200">
              <StudentLoadAnalysis 
                studentId={selectedStudent} 
                studentName={students.find(student => student._id === selectedStudent).name}
              />
            </div>
          )}
        </div>

        {/* Course Enrollment Stats */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary-900">Course Enrollment</h2>
            <span className="text-sm text-secondary-500">Most Popular</span>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {getCourseEnrollmentStats().slice(0, 10).map(course => (
              <div key={course._id} className="p-4 bg-secondary-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-secondary-900">
                    {course.courseCode} - {course.title}
                  </h3>
                  <span className="text-sm text-secondary-600">
                    {course.currentEnrollment}/{course.maxCapacity}
                  </span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      course.enrollmentPercentage >= 90 ? 'bg-red-500' :
                      course.enrollmentPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(course.enrollmentPercentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-secondary-600 mt-1">
                  {course.enrollmentPercentage.toFixed(1)}% capacity • {course.instructor}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
