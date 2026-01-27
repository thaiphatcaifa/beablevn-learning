import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';

const AdminLayout = () => {
  const { userData } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-700">BAVN Admin</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/staff" className="block p-3 rounded hover:bg-slate-800">Quản lý Nhân sự</Link>
          <Link to="/admin/students" className="block p-3 rounded hover:bg-slate-800">Quản lý Học viên</Link>
          <Link to="/admin/data" className="block p-3 rounded hover:bg-slate-800">Cấu trúc Dữ liệu</Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="mb-2 text-sm text-gray-400">Admin: {userData?.name}</div>
          <button onClick={() => auth.signOut()} className="text-red-400 hover:text-white text-sm">Đăng xuất</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};
export default AdminLayout;