import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';

const Icons = {
  Dashboard: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#64748b"} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  Attendance: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#64748b"} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  Scores: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#64748b"} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  Notifications: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#64748b"} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  )
};

const StudentLayout = () => {
  const { userData, currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) return <Navigate to="/login" />;
  const isActive = (path) => location.pathname.includes(path);

  const sidebarLinkClass = (path) => `
    flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
    ${isActive(path) 
      ? 'bg-blue-50 text-[#003366]' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-[#003366]'}
  `;

  const mobileLinkClass = (path) => `
    flex flex-col items-center justify-center w-full h-full space-y-1
    ${isActive(path) ? 'text-[#003366]' : 'text-slate-400'}
  `;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 border-r border-slate-200 flex-col fixed h-full z-50 bg-white">
        <div className="p-6 flex items-center gap-3">
          <img src="/BA LOGO.png" alt="Logo" className="w-8 h-8 object-contain" />
          <div>
            <h1 className="text-[#003366] font-bold text-base">Be Able VN</h1>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Student Area</span>
          </div>
        </div>

        <div className="px-6 pb-6">
           <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center text-xs font-bold">{userData?.name?.charAt(0)}</div>
              <div className="overflow-hidden">
                 <div className="text-sm font-bold text-slate-700 truncate">{userData?.name}</div>
                 <div className="text-[10px] text-slate-400 font-mono font-medium">{userData?.studentCode}</div>
              </div>
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <Link to="/student/dashboard" className={sidebarLinkClass('dashboard')}><Icons.Dashboard active={isActive('dashboard')} /> <span>Tổng quan</span></Link>
          <Link to="/student/attendance" className={sidebarLinkClass('attendance')}><Icons.Attendance active={isActive('attendance')} /> <span>Điểm danh</span></Link>
          <Link to="/student/scores" className={sidebarLinkClass('scores')}><Icons.Scores active={isActive('scores')} /> <span>Kết quả</span></Link>
          <Link to="/student/notifications" className={sidebarLinkClass('notifications')}><Icons.Notifications active={isActive('notifications')} /> <span>Bảng tin</span></Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={() => auth.signOut()} className="w-full flex items-center justify-center gap-2 p-2.5 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium">
            <Icons.Logout /> <span>Thoát</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/BA LOGO.png" alt="Logo" className="w-7 h-7 object-contain" />
          <span className="text-[#003366] font-bold text-sm">Student Area</span>
        </div>
        <button onClick={() => auth.signOut()} className="p-2 text-slate-400 hover:text-red-500"><Icons.Logout /></button>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 overflow-auto">
        <div className="max-w-5xl mx-auto"><Outlet /></div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex justify-around items-center z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Link to="/student/dashboard" className={mobileLinkClass('dashboard')}><Icons.Dashboard active={isActive('dashboard')} /><span className="text-[10px] font-medium">Tổng quan</span></Link>
        <Link to="/student/attendance" className={mobileLinkClass('attendance')}><Icons.Attendance active={isActive('attendance')} /><span className="text-[10px] font-medium">Đ.Danh</span></Link>
        <Link to="/student/scores" className={mobileLinkClass('scores')}><Icons.Scores active={isActive('scores')} /><span className="text-[10px] font-medium">Kết quả</span></Link>
        <Link to="/student/notifications" className={mobileLinkClass('notifications')}><Icons.Notifications active={isActive('notifications')} /><span className="text-[10px] font-medium">Bảng tin</span></Link>
      </nav>
    </div>
  );
};

export default StudentLayout;