import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { ref, onValue } from "firebase/database";

const MyAttendance = () => {
  const { userData } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    onValue(ref(db, 'attendance'), (snap) => {
      const data = snap.val();
      if (data && userData) {
        let myHistory = [];
        Object.keys(data).forEach(classId => {
           Object.keys(data[classId]).forEach(date => {
              const status = data[classId][date][userData.uid];
              if (status) myHistory.push({ date, status });
           });
        });
        myHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistory(myHistory);
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
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-[#003366] flex items-center gap-2">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
           <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
         </svg>
         Lịch sử Chuyên cần
      </h2>
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
             <tr><th className="p-4">Ngày</th><th className="p-4">Trạng thái</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.map((h, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-slate-700">{new Date(h.date).toLocaleDateString('vi-VN')}</td>
                <td className="p-4">{getStatusLabel(h.status)}</td>
              </tr>
            ))}
            {history.length === 0 && <tr><td colSpan="2" className="p-8 text-center text-slate-400 italic">Chưa có dữ liệu điểm danh.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default MyAttendance;