import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';

const StaffLayout = () => {
  const { userData } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname.includes(path) ? "bg-blue-100 text-blue-800 font-bold" : "text-gray-600 hover:bg-gray-50";

  return (
    <div className="flex h-screen bg-white">
      <aside className="w-64 border-r border-gray-200 flex flex-col">
        <div className="p-6 text-xl font-bold text-blue-900">Be Able Staff</div>
        <nav className="flex-1 p-4 space-y-1">
          <Link to="/staff/classes" className={`block p-3 rounded ${isActive('classes')}`}>Thẻ Lớp (Học viên)</Link>
          <Link to="/staff/attendance" className={`block p-3 rounded ${isActive('attendance')}`}>Thẻ Điểm danh</Link>
          <Link to="/staff/scores" className={`block p-3 rounded ${isActive('scores')}`}>Thẻ Kết quả học tập</Link>
          <Link to="/staff/notifications" className={`block p-3 rounded ${isActive('notifications')}`}>Thẻ Thông báo</Link>
        </nav>
        <div className="p-4 border-t">
          <div className="text-sm font-bold">{userData?.name}</div>
          <button onClick={() => auth.signOut()} className="text-red-500 text-xs mt-1">Đăng xuất</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 bg-gray-50"><Outlet /></main>
    </div>
  );
};
export default StaffLayout;