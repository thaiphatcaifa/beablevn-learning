// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './components/Layouts/AdminLayout';
import StaffLayout from './components/Layouts/StaffLayout';
import StudentLayout from './components/Layouts/StudentLayout';

// Pages (Bạn cần tạo file cho các trang chưa có, hoặc dùng code mẫu ở trên)
import StaffManager from './pages/Admin/StaffManager';
import Attendance from './pages/Staff/Attendance';
import StudentDashboard from './pages/Student/Dashboard';
import Login from './pages/Login'; // Bạn cần tạo trang Login

// Component bảo vệ Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <div>Bạn không có quyền truy cập trang này!</div>;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* --- ADMIN ROUTES --- */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="staff" element={<StaffManager />} />
            {/* Thêm các route admin khác: students, data */}
          </Route>

          {/* --- STAFF (BE ABLE) ROUTES --- */}
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <StaffLayout />
            </ProtectedRoute>
          }>
            <Route path="attendance" element={<Attendance />} />
            {/* Thêm các route staff khác: classes, scores, notifications */}
          </Route>

          {/* --- STUDENT ROUTES --- */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<StudentDashboard />} />
            {/* Thêm các route student khác: attendance, scores, notifications */}
          </Route>

          {/* Redirect mặc định */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;