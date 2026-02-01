import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { ref, onValue } from "firebase/database";

const StudentDashboard = () => {
  const { userData } = useAuth();
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    onValue(ref(db, 'classes'), (snap) => {
      const data = snap.val();
      if (data) {
        const allClasses = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        const myClasses = allClasses.filter(c => (userData.classIds && userData.classIds.includes(c.id)) || userData.classId === c.id);
        setClasses(myClasses);
      }
    });
  }, [userData]);

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#e0f2fe] rounded-full translate-x-1/3 -translate-y-1/3 opacity-50"></div>
        <div className="w-20 h-20 bg-white border-4 border-[#e0f2fe] rounded-full flex items-center justify-center text-4xl shadow-sm z-10">
            🎓
        </div>
        <div className="z-10">
          <h1 className="text-2xl font-extrabold text-gray-800">Chào, {userData?.name}</h1>
          <p className="text-gray-500 mt-1">Mã Học viên: <span className="font-mono font-bold text-[#003366] bg-blue-50 px-2 py-0.5 rounded">{userData?.studentCode}</span></p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#003366]">
          <span className="text-xl">📅</span> Lớp học & Lịch trình
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.length > 0 ? classes.map(c => (
            <div key={c.id} className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-3">
                 <div>
                    <div className="text-lg font-bold text-[#003366] group-hover:text-blue-700 transition-colors">{c.name}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{c.subject}</div>
                 </div>
                 <span className="text-xs bg-[#003366] text-white px-2 py-1 rounded font-bold">{c.room}</span>
              </div>
              <div className="space-y-2 pt-3 border-t border-gray-200 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                    <span>🗓️</span> <span className="font-medium">{c.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                    <span>⏰</span> <span className="font-bold">{c.startTime} - {c.endTime}</span>
                </div>
              </div>
            </div>
          )) : <p className="text-gray-400 italic text-center col-span-2 py-8">Bạn chưa được xếp lớp.</p>}
        </div>
      </div>
    </div>
  );
};
export default StudentDashboard;