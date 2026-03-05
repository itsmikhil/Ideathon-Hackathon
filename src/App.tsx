import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DomainSelect from './pages/student/DomainSelect';
import TopicList from './pages/student/TopicList';
import Forum from './pages/community/Forum';
import TeacherDashboard from './pages/teacher/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import TopicManager from './pages/admin/TopicManager';

const PrivateRoute = ({ children, roles }: { children: React.ReactNode, roles: string[] }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Routes */}
            <Route path="/student/domains" element={
              <PrivateRoute roles={['student']}>
                <DomainSelect />
              </PrivateRoute>
            } />
            <Route path="/student/domains/:id/topics" element={
              <PrivateRoute roles={['student']}>
                <TopicList />
              </PrivateRoute>
            } />

            {/* Community Routes */}
            <Route path="/community" element={
              <PrivateRoute roles={['student', 'teacher', 'admin']}>
                <Forum />
              </PrivateRoute>
            } />

            {/* Teacher Routes */}
            <Route path="/teacher/dashboard" element={
              <PrivateRoute roles={['teacher']}>
                <TeacherDashboard />
              </PrivateRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <PrivateRoute roles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/admin/topics" element={
              <PrivateRoute roles={['admin']}>
                <TopicManager />
              </PrivateRoute>
            } />

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}
