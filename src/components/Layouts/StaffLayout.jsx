import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';

const StaffLayout = () => {
  const { userData } = useAuth();

  return (
    <div className="flex h-screen bg-blue-50">
      <aside className="w-64 bg-white border-r border-blue-100 flex flex-col shadow-sm">
        <div className="p-6 text-xl font-bold text-blue-900">Be Able Staff</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/staff/classes" className="block p-3 rounded text-gray-700 hover:bg-blue-50 hover:text-blue-700">Lớp & Học viên</Link>
          <Link to="/staff/attendance" className="block p-3 rounded text-gray-700 hover:bg-blue-50 hover:text-blue-700">Điểm danh</Link>
          <Link to="/staff/scores" className="block p-3 rounded text-gray-700 hover:bg-blue-50 hover:text-blue-700">Kết quả</Link>
          <Link to="/staff/notifications" className="block p-3 rounded text-gray-700 hover:bg-blue-50 hover:text-blue-700">Thông báo</Link>
        </nav>
        <div className="p-4 border-t">
            <div className="mb-2 text-sm text-gray-600">GV: {userData?.name}</div>
            <button onClick={() => auth.signOut()} className="text-red-500 text-sm font-medium">Đăng xuất</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};
export default StaffLayout;