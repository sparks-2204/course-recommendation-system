import React, { useState, useEffect } from 'react';
import { adminAPI, courseAPI } from '../utils/api';
import { useNotification } from '../components/NotificationSystem';

const AdminPanel = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, coursesRes] = await Promise.all([
        adminAPI.getUsers({ role: 'student' }),
        courseAPI.getCourses()
      ]);
      setStudents(studentsRes.data.users);
      setCourses(coursesRes.data.courses);
    } catch (error) {
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCourse = async (courseId) => {
    if (!selectedStudent) return;

    try {
      setAssignLoading(true);
      await adminAPI.assignCourseToStudent(selectedStudent._id, { courseId });
      showSuccess('Course assigned successfully!');
      fetchData(); // Refresh data
      setShowAssignModal(false);
      setSelectedStudent(null);
    } catch (error) {
      showError(error.response?.data?.message || 'Assignment failed');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveCourse = async (studentId, courseId) => {
    if (!window.confirm('Are you sure you want to remove this course?')) return;

    try {
      await adminAPI.removeCourseFromStudent(studentId, courseId);
      showSuccess('Course removed successfully!');
      fetchData(); // Refresh data
    } catch (error) {
      showError(error.response?.data?.message || 'Removal failed');
    }
  };

  const getAvailableCoursesForStudent = (student) => {
    const enrolledCourseIds = student.enrolledCourses?.map(e => e.courseId._id) || [];
    return courses.filter(course => !enrolledCourseIds.includes(course._id));
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Admin Panel</h1>
        <p className="text-secondary-600 mt-2">Manage student course assignments</p>
      </div>

      {/* Students List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-secondary-900">Students & Course Assignments</h2>
          <div className="text-sm text-secondary-600">
            Total Students: {students.length}
          </div>
        </div>

        <div className="space-y-6">
          {students.map(student => (
            <div key={student._id} className="border border-secondary-200 rounded-lg p-6">
              {/* Student Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">{student.name}</h3>
                  <p className="text-sm text-secondary-600">{student.email}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-secondary-500">ID: {student.studentId || 'N/A'}</span>
                    <span className="text-xs text-secondary-500">GPA: {student.gpa || 'N/A'}</span>
                    <span className="text-xs text-secondary-500">
                      Enrolled: {student.enrolledCourses?.length || 0} courses
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedStudent(student);
                    setShowAssignModal(true);
                  }}
                  className="btn-primary text-sm"
                >
                  Assign Course
                </button>
              </div>

              {/* Enrolled Courses */}
              <div>
                <h4 className="text-sm font-medium text-secondary-700 mb-3">Enrolled Courses:</h4>
                {student.enrolledCourses?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {student.enrolledCourses.map(enrollment => (
                      <div key={enrollment.courseId._id} className="bg-primary-50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-primary-900 text-sm">
                              {enrollment.courseId.courseCode}
                            </p>
                            <p className="text-xs text-primary-700">{enrollment.courseId.title}</p>
                            <p className="text-xs text-primary-600 mt-1">
                              {enrollment.courseId.credits} credits
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveCourse(student._id, enrollment.courseId._id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                            title="Remove course"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-secondary-500 italic">No courses enrolled</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Course Modal */}
      {showAssignModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-secondary-900">
                Assign Course to {selectedStudent.name}
              </h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedStudent(null);
                }}
                className="text-secondary-400 hover:text-secondary-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {getAvailableCoursesForStudent(selectedStudent).length > 0 ? (
                getAvailableCoursesForStudent(selectedStudent).map(course => (
                  <div key={course._id} className="border border-secondary-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-secondary-900">
                          {course.courseCode} - {course.title}
                        </h4>
                        <p className="text-sm text-secondary-600">
                          {course.instructor} • {course.credits} credits
                        </p>
                        <p className="text-xs text-secondary-500 mt-1">
                          {course.enrolledStudents?.length || 0}/{course.maxCapacity} enrolled
                        </p>
                      </div>
                      <button
                        onClick={() => handleAssignCourse(course._id)}
                        disabled={assignLoading || course.enrolledStudents?.length >= course.maxCapacity}
                        className={`text-sm px-4 py-2 rounded ${
                          course.enrolledStudents?.length >= course.maxCapacity
                            ? 'bg-secondary-300 text-secondary-500 cursor-not-allowed'
                            : 'btn-primary'
                        }`}
                      >
                        {assignLoading ? 'Assigning...' : 
                         course.enrolledStudents?.length >= course.maxCapacity ? 'Full' : 'Assign'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-secondary-500 py-8">
                  No available courses for this student
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
