import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';

const StudentLayout = () => {
  const { userData } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname.includes(path) ? "text-blue-600" : "text-gray-500";

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <header className="bg-white shadow px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="font-bold text-lg text-blue-800">BAVN Learning</div>
        <button onClick={() => auth.signOut()} className="text-sm text-red-500">Thoát</button>
      </header>

      <main className="p-4 md:p-8 max-w-4xl mx-auto"><Outlet /></main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 md:hidden z-50">
        <Link to="/student/dashboard" className={`flex flex-col items-center text-xs ${isActive('dashboard')}`}>
          <span className="text-xl">👤</span> <span>Thông tin</span>
        </Link>
        <Link to="/student/attendance" className={`flex flex-col items-center text-xs ${isActive('attendance')}`}>
           <span className="text-xl">📅</span> <span>Quá trình</span>
        </Link>
        <Link to="/student/notifications" className={`flex flex-col items-center text-xs ${isActive('notifications')}`}>
           <span className="text-xl">🔔</span> <span>Sự kiện</span>
        </Link>
        <Link to="/student/scores" className={`flex flex-col items-center text-xs ${isActive('scores')}`}>
           <span className="text-xl">📊</span> <span>Kết quả</span>
        </Link>
      </nav>
    </div>
  );
};
export default StudentLayout;