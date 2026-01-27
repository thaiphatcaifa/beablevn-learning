import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';

const StudentLayout = () => {
  const { userData } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="font-bold text-lg text-blue-800">BAVN Learning</div>
        <div className="flex items-center gap-4">
          <span className="text-sm hidden md:block text-gray-600">{userData?.name}</span>
          <button onClick={() => auth.signOut()} className="text-sm text-red-500 border border-red-200 px-2 py-1 rounded">Thoát</button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-5xl mx-auto">
        <Outlet />
      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 md:hidden z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <Link to="/student/dashboard" className="flex flex-col items-center text-xs text-gray-600">
          <span className="text-xl">🏠</span> <span>Thông tin</span>
        </Link>
        <Link to="/student/attendance" className="flex flex-col items-center text-xs text-gray-600">
           <span className="text-xl">📅</span> <span>Điểm danh</span>
        </Link>
        <Link to="/student/scores" className="flex flex-col items-center text-xs text-gray-600">
           <span className="text-xl">📊</span> <span>Kết quả</span>
        </Link>
      </nav>
    </div>
  );
};
export default StudentLayout;