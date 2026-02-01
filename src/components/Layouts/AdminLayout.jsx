import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';

// --- BỘ ICON ---
const Icons = {
  Staff: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Student: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.516 50.552 50.552 0 00-2.658.813m-15.482 0A50.55 50.55 0 0112 13.489a50.55 50.55 0 016.744-3.342" />
    </svg>
  ),
  Data: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  )
};

const AdminLayout = () => {
  const { userData, currentUser } = useAuth();
  const location = useLocation();
  
  if (!currentUser) return <Navigate to="/login" />;

  const isActive = (path) => location.pathname.includes(path);

  // Style Sidebar Desktop
  const sidebarLinkClass = (path) => `
    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
    ${isActive(path) 
      ? 'bg-[#e0f2fe] text-[#003366] font-bold shadow-sm' 
      : 'text-gray-500 hover:bg-gray-50 hover:text-[#003366] font-medium'}
  `;

  // Style Bottom Nav Mobile
  const mobileLinkClass = (path) => `
    flex flex-col items-center justify-center w-full h-full space-y-1
    ${isActive(path) 
      ? 'text-[#003366]' 
      : 'text-gray-400 hover:text-gray-600'}
  `;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f3f4f6] font-sans">
      
      {/* --- DESKTOP SIDEBAR (Ẩn trên Mobile) --- */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col fixed h-full z-50 shadow-sm">
        {/* Header Sidebar */}
        <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img src="/BA LOGO.png" alt="Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-[#003366] font-extrabold text-lg leading-none">BAVN Admin</h1>
              <span className="text-xs text-gray-400 font-medium tracking-wide">System Manager</span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-xs">
              {userData?.name?.charAt(0) || "A"}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-gray-700 truncate">{userData?.name || "Admin"}</div>
              <div className="text-[10px] text-gray-400 truncate">Administrator</div>
            </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link to="/admin/staff" className={sidebarLinkClass('staff')}>
            <Icons.Staff active={isActive('staff')} /> <span>Nhân sự</span>
          </Link>
          <Link to="/admin/students" className={sidebarLinkClass('students')}>
            <Icons.Student active={isActive('students')} /> <span>Học viên</span>
          </Link>
          <Link to="/admin/data" className={sidebarLinkClass('data')}>
            <Icons.Data active={isActive('data')} /> <span>Cấu trúc Dữ liệu</span>
          </Link>
        </nav>

        {/* Desktop Footer */}
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => auth.signOut()} className="w-full flex items-center justify-center gap-2 p-3 text-red-600 rounded-xl hover:bg-red-50 transition-all font-semibold text-sm group">
            <Icons.Logout /> <span className="group-hover:translate-x-1 transition-transform">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* --- MOBILE HEADER (Chỉ hiện trên Mobile) --- */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/BA LOGO.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="text-[#003366] font-extrabold text-lg">BAVN Admin</span>
        </div>
        <button onClick={() => auth.signOut()} className="text-sm font-medium text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">
          Thoát
        </button>
      </header>

      {/* --- MAIN CONTENT (Tự động padding để tránh Header/Footer Mobile) --- */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* --- MOBILE BOTTOM NAVIGATION (Chỉ hiện trên Mobile) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex justify-around items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
        <Link to="/admin/staff" className={mobileLinkClass('staff')}>
          <Icons.Staff active={isActive('staff')} />
          <span className="text-[10px] font-medium">Nhân sự</span>
        </Link>
        <Link to="/admin/students" className={mobileLinkClass('students')}>
          <Icons.Student active={isActive('students')} />
          <span className="text-[10px] font-medium">Học viên</span>
        </Link>
        <Link to="/admin/data" className={mobileLinkClass('data')}>
          <Icons.Data active={isActive('data')} />
          <span className="text-[10px] font-medium">Dữ liệu</span>
        </Link>
      </nav>

    </div>
  );
};

export default AdminLayout;