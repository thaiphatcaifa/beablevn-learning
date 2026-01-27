import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue, update } from "firebase/database";

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState({}); // { studentId: 'present' }

  useEffect(() => {
    // 1. Lấy danh sách học viên
    onValue(ref(db, 'users'), (snap) => {
      const data = snap.val();
      if(data) {
        // Lọc học viên và thêm ID vào object
        const list = Object.entries(data)
          .map(([id, val]) => ({ id, ...val }))
          .filter(u => u.role === 'student');
        setStudents(list);
      }
    });
  }, []);

  const handleSave = () => {
    const updates = {};
    Object.keys(status).forEach(studentId => {
      // Lưu vào: attendance/CLASS_ID/DATE/STUDENT_ID
      // Demo: Lưu chung vào attendance/DATE/STUDENT_ID
      updates[`attendance/${date}/${studentId}`] = status[studentId];
    });
    update(ref(db), updates);
    alert('Đã lưu điểm danh!');
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-bold">Điểm danh ngày: <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border p-1 rounded"/></h2>
        <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">Lưu dữ liệu</button>
      </div>
      
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Học viên</th>
            <th className="p-3">Có mặt</th>
            <th className="p-3">Vắng (Phép)</th>
            <th className="p-3">Vắng (K.Phép)</th>
            <th className="p-3">Đi trễ</th>
          </tr>
        </thead>
        <tbody>
          {students.map(st => (
            <tr key={st.id} className="border-b">
              <td className="p-3 font-medium">{st.name} <br/><span className="text-xs text-gray-500">{st.studentCode}</span></td>
              {['present', 'excused', 'absent', 'late'].map(type => (
                <td key={type} className="p-3 text-center">
                  <input 
                    type="radio" 
                    name={`att-${st.id}`} 
                    checked={status[st.id] === type}
                    onChange={() => setStatus({...status, [st.id]: type})}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Attendance;