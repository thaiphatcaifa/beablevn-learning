import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';

const AdminLayout = () => {
  const { userData } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname.includes(path) ? "bg-slate-800 text-white" : "hover:bg-slate-800/50";

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-gray-300 flex flex-col">
        <div className="p-6 text-2xl font-bold text-white border-b border-slate-700">BAVN Admin</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/staff" className={`block p-3 rounded ${isActive('staff')}`}>Quản lý Nhân sự</Link>
          <Link to="/admin/students" className={`block p-3 rounded ${isActive('students')}`}>Quản lý Học viên</Link>
          <Link to="/admin/data" className={`block p-3 rounded ${isActive('data')}`}>Cấu trúc Dữ liệu</Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={() => auth.signOut()} className="text-red-400 hover:text-white text-sm">Đăng xuất</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8"><Outlet /></main>
    </div>
  );
};
export default AdminLayout;