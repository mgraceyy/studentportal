import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Grades from './pages/Grades';
import Announcements from './pages/Announcements';
import Schedules from './pages/Schedules';
import Messages from './pages/Messages';
import Subjects from './pages/Subjects';
import Enrollments from './pages/Enrollments';
import EnrollmentSettings from './pages/EnrollmentSettings';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function AdminRoute({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/students" element={<AdminRoute><Students /></AdminRoute>} />
        <Route path="/grades" element={<AdminRoute><Grades /></AdminRoute>} />
        <Route path="/announcements" element={<AdminRoute><Announcements /></AdminRoute>} />
        <Route path="/schedules" element={<AdminRoute><Schedules /></AdminRoute>} />
        <Route path="/messages" element={<AdminRoute><Messages /></AdminRoute>} />
        <Route path="/subjects" element={<AdminRoute><Subjects /></AdminRoute>} />
        <Route path="/enrollments" element={<AdminRoute><Enrollments /></AdminRoute>} />
        <Route path="/enrollment-settings" element={<AdminRoute><EnrollmentSettings /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
