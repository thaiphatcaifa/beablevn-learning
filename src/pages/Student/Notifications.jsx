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
         <span className="text-2xl">🔔</span> Bảng Tin & Sự Kiện
      </h2>
      {notifs.map((n, i) => (
        <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#003366] group-hover:w-2 transition-all"></div>
          <div className="flex justify-between items-start mb-3 pl-2">
             <span className="bg-blue-100 text-[#003366] text-[10px] font-extrabold px-2 py-1 rounded uppercase tracking-wide">
               {n.type || 'Thông báo chung'}
             </span>
             <span className="text-xs text-gray-400 font-medium">{n.date}</span>
          </div>
          <p className="text-gray-800 font-medium leading-relaxed pl-2 text-sm">{n.content}</p>
          <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-500 pl-2 flex items-center gap-1">
             <span className="font-bold text-[#003366]">Người đăng:</span> {n.author || 'Ban quản lý'}
          </div>
        </div>
      ))}
      {notifs.length === 0 && (
         <div className="text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-400">
             <div className="text-4xl mb-2">📭</div>
             Không có thông báo mới.
         </div>
      )}
    </div>
  );
};
export default StudentNotifications;