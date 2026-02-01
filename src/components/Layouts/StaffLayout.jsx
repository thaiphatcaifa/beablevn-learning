import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';

const Icons = {
  Class: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#64748b"} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  Attendance: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#64748b"} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Scores: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#64748b"} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
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

const StaffLayout = () => {
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
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Staff Portal</span>
          </div>
        </div>

        <div className="px-6 pb-6">
           <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center text-xs font-bold">{userData?.name?.charAt(0)}</div>
              <div className="overflow-hidden">
                 <div className="text-sm font-bold text-slate-700 truncate">{userData?.name}</div>
                 <div className="text-[10px] text-slate-400 uppercase font-semibold">{userData?.role}</div>
              </div>
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <Link to="/staff/classes" className={sidebarLinkClass('classes')}><Icons.Class active={isActive('classes')} /> <span>Lớp học</span></Link>
          <Link to="/staff/attendance" className={sidebarLinkClass('attendance')}><Icons.Attendance active={isActive('attendance')} /> <span>Điểm danh</span></Link>
          <Link to="/staff/scores" className={sidebarLinkClass('scores')}><Icons.Scores active={isActive('scores')} /> <span>Kết quả</span></Link>
          <Link to="/staff/notifications" className={sidebarLinkClass('notifications')}><Icons.Notifications active={isActive('notifications')} /> <span>Thông báo</span></Link>
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
          <span className="text-[#003366] font-bold text-sm">Staff Portal</span>
        </div>
        <button onClick={() => auth.signOut()} className="p-2 text-slate-400 hover:text-red-500"><Icons.Logout /></button>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 overflow-auto">
        <div className="max-w-5xl mx-auto"><Outlet /></div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex justify-around items-center z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Link to="/staff/classes" className={mobileLinkClass('classes')}><Icons.Class active={isActive('classes')} /><span className="text-[10px] font-medium">Lớp</span></Link>
        <Link to="/staff/attendance" className={mobileLinkClass('attendance')}><Icons.Attendance active={isActive('attendance')} /><span className="text-[10px] font-medium">Đ.Danh</span></Link>
        <Link to="/staff/scores" className={mobileLinkClass('scores')}><Icons.Scores active={isActive('scores')} /><span className="text-[10px] font-medium">Điểm</span></Link>
        <Link to="/staff/notifications" className={mobileLinkClass('notifications')}><Icons.Notifications active={isActive('notifications')} /><span className="text-[10px] font-medium">Tin</span></Link>
      </nav>
    </div>
  );
};

export default StaffLayout;