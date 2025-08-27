import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI, courseAPI } from '../utils/api';
import { BarChart, PieChart, StatCard } from '../components/SimpleChart';
import AdminPanel from './AdminPanel';
import AdminAnalytics from '../components/AdminAnalytics';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseCode: '',
    title: '',
    description: '',
    credits: 3,
    department: '',
    instructor: '',
    schedule: {
      days: [],
      startTime: '',
      endTime: '',
      room: ''
    },
    semester: 'Fall',
    year: new Date().getFullYear(),
    maxCapacity: 30,
    prerequisites: [],
    category: 'elective',
    level: 'undergraduate'
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, coursesRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        courseAPI.getCourses()
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setCourses(coursesRes.data.courses);
    } catch (error) {
      setError('Failed to load admin data');
      console.error('Admin dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createCourse(newCourse);
      setShowCreateCourse(false);
      setNewCourse({
        courseCode: '',
        title: '',
        description: '',
        credits: 3,
        department: '',
        instructor: '',
        schedule: {
          days: [],
          startTime: '',
          endTime: '',
          room: ''
        },
        semester: 'Fall',
        year: new Date().getFullYear(),
        maxCapacity: 30,
        prerequisites: [],
        category: 'elective',
        level: 'undergraduate'
      });
      fetchAdminData();
    } catch (error) {
      setError('Failed to create course');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      fetchAdminData();
    } catch (error) {
      setError('Failed to update user role');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await adminAPI.deleteCourse(courseId);
      fetchAdminData(); // Refresh data
    } catch (error) {
      setError('Failed to delete course');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      // Add delete user API call when available
      console.log('Delete user:', userId);
      fetchAdminData(); // Refresh data
    } catch (error) {
      setError('Failed to delete user');
    }
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
        <h1 className="text-3xl font-bold text-secondary-900">Admin Dashboard</h1>
        <p className="text-secondary-600 mt-2">
          Manage users, courses, and monitor system activity
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
              <p className="text-sm font-medium text-secondary-600">Total Users</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalUsers || 0}</p>
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
              <p className="text-2xl font-bold text-secondary-900">{stats.totalCourses || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Enrollments</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalEnrollments || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Students</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalStudents || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <div className="flex space-x-1 bg-secondary-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'courses'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => setActiveTab('panel')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'panel'
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              Admin Panel
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'analytics'
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              AI Analytics
            </button>
          </div>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Courses */}
          <div className="card">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Popular Courses</h2>
            <div className="space-y-3">
              {stats.popularCourses?.slice(0, 5).map(course => (
                <div key={course._id} className="flex justify-between items-center p-3 bg-secondary-50 rounded">
                  <div>
                    <p className="font-medium text-secondary-900">{course.courseCode}</p>
                    <p className="text-sm text-secondary-600">{course.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{course.currentEnrollment}/{course.maxCapacity}</p>
                    <p className="text-xs text-secondary-500">
                      {((course.currentEnrollment / course.maxCapacity) * 100).toFixed(0)}% full
                    </p>
                  </div>
                </div>
              )) || <p className="text-secondary-500">No data available</p>}
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="card">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Recent Registrations</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.recentRegistrations?.map((registration, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-secondary-50 rounded">
                  <div>
                    <p className="font-medium text-secondary-900">{registration.studentName}</p>
                    <p className="text-sm text-secondary-600">{registration.courseCode}</p>
                  </div>
                  <p className="text-xs text-secondary-500">
                    {new Date(registration.enrolledAt).toLocaleDateString()}
                  </p>
                </div>
              )) || <p className="text-secondary-500">No recent registrations</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-secondary-900">User Management</h2>
            <span className="text-sm text-secondary-500">{users.length} total users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {users.map(user => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-secondary-900">{user.name}</div>
                          <div className="text-sm text-secondary-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                        className="text-sm border-secondary-300 rounded-md"
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {user.role === 'student' && (
                        <div>
                          <p>{user.studentId}</p>
                          <p>{user.major} - {user.year}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-500 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-secondary-900">Course Management</h2>
            <button
              onClick={() => setShowCreateCourse(true)}
              className="btn-primary"
            >
              Create Course
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <div key={course._id} className="border border-secondary-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-secondary-900">{course.courseCode}</h3>
                  <button
                    onClick={() => handleDeleteCourse(course._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-secondary-600 mb-2">{course.title}</p>
                <p className="text-xs text-secondary-500">
                  {course.currentEnrollment}/{course.maxCapacity} enrolled
                </p>
                <p className="text-xs text-secondary-500">
                  {course.instructor} • {course.credits} credits
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Panel Tab */}
      {activeTab === 'panel' && (
        <AdminPanel />
      )}

      {activeTab === 'analytics' && (
        <AdminAnalytics />
      )}

      {/* Create Course Modal */}
      {showCreateCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-secondary-900">Create New Course</h3>
              <button
                onClick={() => setShowCreateCourse(false)}
                className="text-secondary-400 hover:text-secondary-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700">Course Code</label>
                  <input
                    type="text"
                    required
                    className="input-field mt-1"
                    value={newCourse.courseCode}
                    onChange={(e) => setNewCourse({...newCourse, courseCode: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    required
                    className="input-field mt-1"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({...newCourse, credits: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700">Title</label>
                <input
                  type="text"
                  required
                  className="input-field mt-1"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700">Description</label>
                <textarea
                  required
                  rows="3"
                  className="input-field mt-1"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700">Department</label>
                  <input
                    type="text"
                    required
                    className="input-field mt-1"
                    value={newCourse.department}
                    onChange={(e) => setNewCourse({...newCourse, department: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700">Instructor</label>
                  <input
                    type="text"
                    required
                    className="input-field mt-1"
                    value={newCourse.instructor}
                    onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateCourse(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
