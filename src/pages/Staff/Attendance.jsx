import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue, update } from "firebase/database";
import { useAuth } from '../../context/AuthContext'; // 1. Import Auth

const Attendance = () => {
  const { userData } = useAuth(); // 2. Lấy user hiện tại
  const [tab, setTab] = useState('take'); 
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState({}); 
  const [allAttendance, setAllAttendance] = useState({}); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Lấy Classes và Lọc
    onValue(ref(db, 'classes'), (snap) => {
      const data = snap.val();
      if (data) {
         const allClasses = Object.entries(data).map(([id, val]) => ({ id, ...val }));
         
         // 3. Lọc: Chỉ lấy lớp được phân công
         const myClassIds = userData?.assignedClasses || [];
         const myClasses = allClasses.filter(c => myClassIds.includes(c.id));
         
         setClasses(myClasses);
      } else {
         setClasses([]);
      }
    });

    onValue(ref(db, 'users'), (snap) => { if(snap.val()) setStudents(Object.entries(snap.val()).map(([id, val]) => ({ id, ...val })).filter(u => u.role === 'student')); });
    onValue(ref(db, 'attendance'), (snap) => setAllAttendance(snap.val() || {}));
  }, [userData]); // Chạy lại khi userData load xong

  const filteredStudents = selectedClass ? students.filter(s => (s.classIds || []).includes(selectedClass) || s.classId === selectedClass) : [];

  const handleSave = () => {
    const updates = {};
    filteredStudents.forEach(st => {
      if (status[st.id]) updates[`attendance/${selectedClass}/${date}/${st.id}`] = status[st.id];
    });
    update(ref(db), updates);
    alert("Đã lưu!");
  };

  const getSummary = (sid) => {
    const classData = allAttendance[selectedClass] || {};
    let counts = { present: 0, late: 0, absent: 0, excused: 0 };
    Object.keys(classData).forEach(d => {
      if ((!startDate || d >= startDate) && (!endDate || d <= endDate)) {
        const s = classData[d][sid];
        if (s) counts[s] = (counts[s] || 0) + 1;
      }
    });
    return counts;
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex gap-6 mb-6 border-b border-slate-100">
         <button onClick={() => setTab('take')} className={`pb-3 text-sm font-bold uppercase tracking-wide transition-all ${tab==='take'?'text-[#003366] border-b-2 border-[#003366]':'text-slate-400 hover:text-slate-600'}`}>Điểm danh</button>
         <button onClick={() => setTab('summary')} className={`pb-3 text-sm font-bold uppercase tracking-wide transition-all ${tab==='summary'?'text-[#003366] border-b-2 border-[#003366]':'text-slate-400 hover:text-slate-600'}`}>Tổng kết</button>
      </div>

      <div className="mb-6">
         <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Chọn Lớp học (Được phân công)</label>
         <select className="border border-slate-200 p-2.5 rounded-lg w-full md:w-1/3 text-sm outline-none focus:border-[#003366] font-medium" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            <option value="">-- Chọn Lớp --</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
         </select>
         {classes.length === 0 && <p className="text-xs text-red-500 mt-1 italic">Bạn chưa được phân công lớp nào.</p>}
      </div>

      {tab === 'take' && selectedClass && (
        <div className="animate-fade-in-up">
          <input type="date" className="border border-slate-200 p-2.5 rounded-lg mb-4 text-sm font-medium outline-none focus:border-[#003366]" value={date} onChange={e => setDate(e.target.value)} />
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase"><tr><th className="p-4">Học viên</th><th className="p-4 text-center text-green-600">Có mặt</th><th className="p-4 text-center text-orange-500">Trễ</th><th className="p-4 text-center text-red-500">K.Phép</th><th className="p-4 text-center text-blue-500">Có Phép</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{st.name}<br/><span className="text-[10px] text-slate-400 font-mono">{st.studentCode}</span></td>
                    {['present', 'late', 'absent', 'excused'].map(t => (
                      <td key={t} className="p-4 text-center"><input type="radio" className="w-5 h-5 accent-[#003366] cursor-pointer" name={`att-${st.id}`} checked={status[st.id] === t} onChange={() => setStatus({...status, [st.id]: t})} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleSave} className="mt-6 w-full bg-[#003366] text-white py-3 rounded-lg font-bold shadow-md hover:bg-[#002244] transition-all">Lưu Dữ Liệu</button>
        </div>
      )}

      {tab === 'summary' && selectedClass && (
        <div className="animate-fade-in-up">
          <div className="flex gap-3 mb-6 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
             <div className="flex-1"><label className="text-[10px] font-bold text-[#003366] uppercase mb-1 block tracking-wide">Từ ngày</label><input type="date" className="w-full border border-slate-200 p-2 rounded-lg text-sm bg-white outline-none focus:border-[#003366]" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
             <div className="flex-1"><label className="text-[10px] font-bold text-[#003366] uppercase mb-1 block tracking-wide">Đến ngày</label><input type="date" className="w-full border border-slate-200 p-2 rounded-lg text-sm bg-white outline-none focus:border-[#003366]" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase"><tr><th className="p-4">Học viên</th><th className="p-4 text-center">✅</th><th className="p-4 text-center">⚠️</th><th className="p-4 text-center">❌</th><th className="p-4 text-center">📩</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(st => {
                  const s = getSummary(st.id);
                  return <tr key={st.id} className="hover:bg-slate-50"><td className="p-4 font-medium text-[#003366]">{st.name}</td><td className="p-4 text-center font-bold text-green-600 bg-green-50/50">{s.present}</td><td className="p-4 text-center font-bold text-orange-500 bg-orange-50/50">{s.late}</td><td className="p-4 text-center font-bold text-red-500 bg-red-50/50">{s.absent}</td><td className="p-4 text-center font-bold text-blue-500 bg-blue-50/50">{s.excused}</td></tr>
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default Attendance;