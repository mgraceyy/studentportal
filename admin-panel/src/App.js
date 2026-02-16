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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/schedules" element={<Schedules />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/enrollments" element={<Enrollments />} />
        <Route path="/enrollment-settings" element={<EnrollmentSettings />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
