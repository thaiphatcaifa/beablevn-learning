// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './components/Layouts/AdminLayout';
import StaffLayout from './components/Layouts/StaffLayout';
import StudentLayout from './components/Layouts/StudentLayout';

// Pages - Auth
import Login from './pages/Login';

// Pages - Admin
import StaffManager from './pages/Admin/StaffManager';
import StudentManager from './pages/Admin/StudentManager'; // Mới
import DataManager from './pages/Admin/DataManager';       // Mới

// Pages - Staff (Be Able)
import ClassList from './pages/Staff/ClassList';           // Mới
import Attendance from './pages/Staff/Attendance';
import ScoreInput from './pages/Staff/ScoreInput';         // Mới
import StaffNotifications from './pages/Staff/Notifications'; // Mới

// Pages - Student
import StudentDashboard from './pages/Student/Dashboard';
import MyAttendance from './pages/Student/MyAttendance';   // Mới
import MyGrades from './pages/Student/MyGrades';           // Mới
import StudentNotifications from './pages/Student/Notifications'; // Mới

const RedirectBasedOnRole = () => {
  const { currentUser, userRole, loading } = useAuth();
  if (loading) return <div className="p-10 text-center">Đang tải...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  if (userRole === 'admin') return <Navigate to="/admin/staff" />;
  if (userRole === 'staff') return <Navigate to="/staff/classes" />;
  if (userRole === 'student') return <Navigate to="/student/dashboard" />;
  return <div className="p-10 text-center">Tài khoản chưa được phân quyền.</div>;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();
  if (loading) return <div>Checking...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* --- ADMIN --- */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route path="staff" element={<StaffManager />} />       {/* QL Nhân sự */}
            <Route path="students" element={<StudentManager />} />  {/* QL Học viên */}
            <Route path="data" element={<DataManager />} />         {/* Cấu trúc dữ liệu */}
          </Route>

          {/* --- STAFF (BE ABLE) --- */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffLayout /></ProtectedRoute>}>
            <Route path="classes" element={<ClassList />} />            {/* Thẻ Lớp */}
            <Route path="attendance" element={<Attendance />} />        {/* Thẻ Điểm danh */}
            <Route path="scores" element={<ScoreInput />} />            {/* Thẻ Kết quả */}
            <Route path="notifications" element={<StaffNotifications />} /> {/* Thẻ Thông báo */}
          </Route>

          {/* --- STUDENT --- */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<StudentDashboard />} />      {/* Thẻ Thông tin */}
            <Route path="attendance" element={<MyAttendance />} />         {/* Thẻ Quá trình */}
            <Route path="scores" element={<MyGrades />} />                 {/* Thẻ Kết quả */}
            <Route path="notifications" element={<StudentNotifications />} /> {/* Thẻ Sự kiện */}
          </Route>

          <Route path="/" element={<RedirectBasedOnRole />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;