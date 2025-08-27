import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './components/NotificationSystem';
import { DarkModeProvider } from './components/DarkModeToggle';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetails from './pages/CourseDetails';
import MyCourses from './pages/MyCourses';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'faculty':
      return <FacultyDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <DarkModeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Navbar />
                    <DashboardRouter />
                    <Chatbot />
                  </ProtectedRoute>
                } />
                
                <Route path="/courses" element={
                  <ProtectedRoute>
                    <Navbar />
                    <CourseCatalog />
                    <Chatbot />
                  </ProtectedRoute>
                } />
                
                <Route path="/courses/:id" element={
                  <ProtectedRoute>
                    <Navbar />
                    <CourseDetails />
                    <Chatbot />
                  </ProtectedRoute>
                } />
                
                <Route path="/my-courses" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Navbar />
                    <MyCourses />
                    <Chatbot />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Navbar />
                    <AdminDashboard />
                    <Chatbot />
                  </ProtectedRoute>
                } />
                
                <Route path="/faculty" element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <Navbar />
                    <FacultyDashboard />
                    <Chatbot />
                  </ProtectedRoute>
                } />
                
                {/* Unauthorized Route */}
                <Route path="/unauthorized" element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-error-600 mb-4">Access Denied</h1>
                      <p className="text-secondary-600 dark:text-secondary-400">You don't have permission to access this page.</p>
                    </div>
                  </div>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </DarkModeProvider>
  );
}

export default App;
