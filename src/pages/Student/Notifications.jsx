import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue } from "firebase/database";

const StudentNotifications = () => {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    onValue(ref(db, 'notifications'), (snap) => {
      const data = snap.val();
      setNotifs(data ? Object.values(data).reverse() : []);
    });
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[#003366] mb-6 flex items-center gap-2">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
           <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
         </svg>
         Bảng Tin & Sự Kiện
      </h2>
      {notifs.map((n, i) => (
        <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#003366] group-hover:w-2 transition-all"></div>
          <div className="flex justify-between items-start mb-3 pl-2">
             <span className="bg-blue-50 text-[#003366] text-[10px] font-extrabold px-2 py-1 rounded uppercase tracking-wide border border-blue-100">
               {n.type || 'Thông báo chung'}
             </span>
             <span className="text-xs text-slate-400 font-medium">{n.date}</span>
          </div>
          <p className="text-slate-800 font-medium leading-relaxed pl-2 text-sm">{n.content}</p>
          <div className="mt-4 pt-3 border-t border-slate-50 text-xs text-slate-500 pl-2 flex items-center gap-1">
             <span className="font-bold text-[#003366]">Đăng bởi:</span> {n.author || 'Ban quản lý'}
          </div>
        </div>
      ))}
      {notifs.length === 0 && (
         <div className="text-center py-12 bg-white rounded-xl border border-slate-100 text-slate-300">
             <div className="flex justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
             </div>
             Không có thông báo mới.
         </div>
      )}
    </div>
  );
};
export default StudentNotifications;