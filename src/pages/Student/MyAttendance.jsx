import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { ref, onValue } from "firebase/database";

const MyAttendance = () => {
  const { userData } = useAuth();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({}); // Dữ liệu thống kê theo lớp
  const [classesMap, setClassesMap] = useState({}); // Map id -> tên lớp

  useEffect(() => {
    // 1. Lấy danh sách lớp để hiển thị tên
    onValue(ref(db, 'classes'), (snap) => {
      const data = snap.val();
      if (data) {
        setClassesMap(data); // Lưu toàn bộ object classes để tra cứu nhanh
      }
    });

    // 2. Lấy dữ liệu điểm danh
    onValue(ref(db, 'attendance'), (snap) => {
      const data = snap.val();
      if (data && userData) {
        let myHistory = [];
        let myStats = {};

        // Duyệt qua từng lớp
        Object.keys(data).forEach(classId => {
           // Khởi tạo thống kê cho lớp này nếu chưa có
           if (!myStats[classId]) {
             myStats[classId] = { present: 0, late: 0, excused: 0, absent: 0 };
           }

           // Duyệt qua từng ngày trong lớp
           Object.keys(data[classId]).forEach(date => {
              const status = data[classId][date][userData.uid];
              if (status) {
                 // Thêm vào lịch sử chi tiết
                 myHistory.push({ date, status, classId });
                 
                 // Cộng dồn vào thống kê
                 if (myStats[classId][status] !== undefined) {
                   myStats[classId][status]++;
                 }
              }
           });
        });

        // Sắp xếp ngày mới nhất lên đầu cho bảng chi tiết
        myHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setHistory(myHistory);
        setStats(myStats);
      }
    });
  }, [userData]);

  const getStatusLabel = (s) => {
    switch(s) {
      case 'present': return <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-green-100"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Đúng giờ</span>;
      case 'late': return <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-orange-100"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Đi trễ</span>;
      case 'excused': return <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-100"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> Có phép</span>;
      case 'absent': return <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-red-100"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> Vắng</span>;
      default: return s;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Mức độ chuyên cần (Thống kê theo lớp) */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-[#003366] flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
           Mức độ Chuyên cần
        </h2>
        
        {Object.keys(stats).length === 0 ? (
          <p className="text-slate-400 italic text-sm">Chưa có dữ liệu thống kê.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(stats).map(([classId, count]) => (
              <div key={classId} className="border-t border-slate-50 pt-4 first:pt-0 first:border-0">
                <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#003366]"></span>
                  Lớp: {classesMap[classId]?.name || "Đang tải..."}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex flex-col items-center">
                    <span className="text-2xl font-bold text-green-700">{count.present}</span>
                    <span className="text-[10px] uppercase font-bold text-green-600">Đúng giờ</span>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex flex-col items-center">
                    <span className="text-2xl font-bold text-orange-700">{count.late}</span>
                    <span className="text-[10px] uppercase font-bold text-orange-600">Đi trễ</span>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex flex-col items-center">
                    <span className="text-2xl font-bold text-blue-700">{count.excused}</span>
                    <span className="text-[10px] uppercase font-bold text-blue-600">Có phép</span>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex flex-col items-center">
                    <span className="text-2xl font-bold text-red-700">{count.absent}</span>
                    <span className="text-[10px] uppercase font-bold text-red-600">Không phép</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Lịch sử chi tiết */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-[#003366] flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
             <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
           </svg>
           Nhật ký Điểm danh
        </h2>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
               <tr>
                 <th className="p-4">Ngày</th>
                 <th className="p-4">Lớp</th>
                 <th className="p-4">Trạng thái</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((h, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-700">{new Date(h.date).toLocaleDateString('vi-VN')}</td>
                  <td className="p-4 text-xs text-slate-500">{classesMap[h.classId]?.name || h.classId}</td>
                  <td className="p-4">{getStatusLabel(h.status)}</td>
                </tr>
              ))}
              {history.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-slate-400 italic">Chưa có dữ liệu điểm danh.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default MyAttendance;