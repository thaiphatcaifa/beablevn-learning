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
      case 'present': return <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded text-xs font-bold border border-green-200">✅ Đi học đúng giờ</span>;
      case 'late': return <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-50 px-2 py-1 rounded text-xs font-bold border border-orange-200">⚠️ Đi học trễ</span>;
      case 'excused': return <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs font-bold border border-blue-200">📩 Vắng có phép</span>;
      case 'absent': return <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-bold border border-red-200">❌ Vắng không phép</span>;
      default: return s;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6 text-[#003366] flex items-center gap-2">
         <span className="text-2xl">📅</span> Lịch sử Chuyên cần
      </h2>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f0f9ff] text-[#003366] uppercase font-bold text-xs">
             <tr><th className="p-4">Ngày</th><th className="p-4">Trạng thái</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history.map((h, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-800">{new Date(h.date).toLocaleDateString('vi-VN')}</td>
                <td className="p-4">{getStatusLabel(h.status)}</td>
              </tr>
            ))}
            {history.length === 0 && <tr><td colSpan="2" className="p-8 text-center text-gray-400 italic">Chưa có dữ liệu điểm danh.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default MyAttendance;