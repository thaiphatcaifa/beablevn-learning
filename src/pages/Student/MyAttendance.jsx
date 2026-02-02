import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { ref, onValue } from "firebase/database";

const MyAttendance = () => {
  const { userData } = useAuth();
  const [stats, setStats] = useState({}); // Dữ liệu thống kê theo lớp
  const [classesMap, setClassesMap] = useState({}); // Map id -> tên lớp

  useEffect(() => {
    // 1. Lấy danh sách lớp để hiển thị tên
    onValue(ref(db, 'classes'), (snap) => {
      const data = snap.val();
      if (data) {
        setClassesMap(data);
      }
    });

    // 2. Lấy dữ liệu điểm danh và tính toán thống kê
    onValue(ref(db, 'attendance'), (snap) => {
      const data = snap.val();
      if (data && userData) {
        let myStats = {};

        // Duyệt qua từng lớp có trong dữ liệu điểm danh
        Object.keys(data).forEach(classId => {
           // Khởi tạo bộ đếm cho lớp nếu chưa có
           if (!myStats[classId]) {
             myStats[classId] = { present: 0, late: 0, excused: 0, absent: 0 };
           }

           // Duyệt qua từng ngày của lớp đó
           Object.keys(data[classId]).forEach(date => {
              // Kiểm tra xem user hiện tại có trạng thái trong ngày đó không
              const status = data[classId][date][userData.uid];
              if (status) {
                 // Cộng dồn vào thống kê
                 if (myStats[classId][status] !== undefined) {
                   myStats[classId][status]++;
                 }
              }
           });
        });
        
        setStats(myStats);
      }
    });
  }, [userData]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-[#003366] flex items-center gap-2">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
         </svg>
         Mức độ Chuyên cần
      </h2>
      
      {Object.keys(stats).length === 0 ? (
        <div className="text-center py-8">
           <div className="text-4xl mb-2 grayscale opacity-30">📊</div>
           <p className="text-slate-400 italic text-sm">Chưa có dữ liệu điểm danh.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(stats).map(([classId, count]) => (
            <div key={classId} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
              <h3 className="font-bold text-[#003366] mb-4 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="w-2 h-2 rounded-full bg-[#003366]"></span>
                Lớp: {classesMap[classId]?.name || "Đang tải..."}
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Đúng giờ */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center hover:border-green-200 transition-colors">
                  <span className="text-3xl font-extrabold text-green-600 mb-1">{count.present}</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Đúng giờ
                  </div>
                </div>

                {/* Đi trễ */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center hover:border-orange-200 transition-colors">
                  <span className="text-3xl font-extrabold text-orange-500 mb-1">{count.late}</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full uppercase">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Đi trễ
                  </div>
                </div>

                {/* Có phép */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center hover:border-blue-200 transition-colors">
                  <span className="text-3xl font-extrabold text-blue-600 mb-1">{count.excused}</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Có phép
                  </div>
                </div>

                {/* Không phép */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center hover:border-red-200 transition-colors">
                  <span className="text-3xl font-extrabold text-red-600 mb-1">{count.absent}</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full uppercase">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Không phép
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAttendance;