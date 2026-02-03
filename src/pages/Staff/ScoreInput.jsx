import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue, push, set } from "firebase/database";
import { useAuth } from '../../context/AuthContext'; // 1. Import Auth

const ScoreInput = () => {
  const { userData } = useAuth(); // 2. Lấy thông tin user hiện tại
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [activeTab, setActiveTab] = useState('bonus'); 
  const [inputData, setInputData] = useState({ content: '', score: '' });
  const [scoreHistory, setScoreHistory] = useState({});

  useEffect(() => {
    // 3. Lấy và Lọc danh sách lớp theo assignedClasses
    onValue(ref(db, 'classes'), (snap) => {
      const data = snap.val();
      if (data) {
        const allClasses = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        
        // Chỉ lấy các lớp được phân công
        const myClassIds = userData?.assignedClasses || [];
        const myClasses = allClasses.filter(c => myClassIds.includes(c.id));
        
        setClasses(myClasses);
      } else {
        setClasses([]);
      }
    });

    // Lấy danh sách học viên
    onValue(ref(db, 'users'), (snap) => { 
      if(snap.val()) {
        setStudents(Object.entries(snap.val()).map(([id, val]) => ({ id, ...val })).filter(u => u.role === 'student')); 
      }
    });

    // Lấy lịch sử điểm
    onValue(ref(db, 'scores'), (snap) => setScoreHistory(snap.val() || {}));
  }, [userData]); // Chạy lại khi userData thay đổi

  const filteredStudents = selectedClass ? students.filter(s => (s.classIds || []).includes(selectedClass) || s.classId === selectedClass) : [];

  const handleSave = (studentId) => {
    if (!inputData.score || !inputData.content) return alert("Nhập đủ thông tin!");
    push(ref(db, `scores/${studentId}/${activeTab}`), {
      value: Number(inputData.score),
      content: inputData.content,
      date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN')
    });
    alert("Đã lưu!");
    setInputData({ content: '', score: '' });
  };

  const getHistory = (sid) => Object.entries(scoreHistory[sid]?.[activeTab] || {}).map(([k,v]) => ({id:k, ...v}));
  const calcTotal = (hist) => {
    if(!hist.length) return 0;
    const sum = hist.reduce((a, b) => a + (b.value || 0), 0);
    return activeTab === 'bonus' ? sum : (sum / hist.length).toFixed(1);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-6">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#003366" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
         <h2 className="text-xl font-bold text-[#003366]">Nhập Kết quả Học tập</h2>
      </div>
      
      <div className="mb-6">
        <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Chọn Lớp học (Được phân công)</label>
        <select className="border border-slate-200 p-2.5 rounded-lg w-full md:w-1/3 text-sm outline-none focus:border-[#003366] font-medium" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
           <option value="">-- Chọn Lớp --</option>
           {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {classes.length === 0 && <p className="text-xs text-red-500 mt-1 italic">Bạn chưa được phân công lớp nào.</p>}
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto pb-2 border-b border-slate-100">
        {[ {id:'bonus',l:'Điểm Cộng'}, {id:'homework',l:'BTVN'}, {id:'test',l:'Kiểm tra'} ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-5 py-2 rounded-t-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-[#003366] text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{t.l}</button>
        ))}
      </div>
      
      {selectedClass && (
         <div className="bg-slate-50 p-5 rounded-xl mb-8 border border-slate-100 flex flex-col md:flex-row gap-4 items-end shadow-inner">
            <div className="flex-1 w-full"><label className="text-[10px] font-bold text-[#003366] uppercase mb-1 block tracking-wide">Nội dung đánh giá</label><input className="w-full border border-slate-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#003366] bg-white shadow-sm" placeholder="..." value={inputData.content} onChange={e => setInputData({...inputData, content: e.target.value})} /></div>
            <div className="w-24"><label className="text-[10px] font-bold text-[#003366] uppercase mb-1 block tracking-wide">Điểm</label><input type="number" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#003366] bg-white text-center font-bold shadow-sm" placeholder="10" value={inputData.score} onChange={e => setInputData({...inputData, score: e.target.value})} /></div>
         </div>
      )}

      <div className="space-y-4">
        {filteredStudents.map((st, idx) => {
          const hist = getHistory(st.id);
          return (
            <div key={st.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
               <div className="bg-white p-4 flex justify-between items-center border-b border-slate-50">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-100 text-[#003366] flex items-center justify-center font-bold text-xs">{idx+1}</div>
                     <div><div className="font-bold text-[#003366] text-sm">{st.name}</div><div className="text-xs text-slate-400 font-mono">{st.studentCode}</div></div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="text-right"><span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">{activeTab==='bonus'?'Tổng':'TB'}</span><span className="text-xl font-extrabold text-emerald-600">{calcTotal(hist)}</span></div>
                     <button onClick={() => handleSave(st.id)} className="bg-[#003366] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#002244] transition-all shadow-sm flex items-center gap-1"><span>💾</span> Lưu</button>
                  </div>
               </div>
               {hist.length > 0 && (
                 <table className="w-full text-xs text-left bg-slate-50/50">
                    <thead className="text-slate-500 font-semibold border-b border-slate-100"><tr><th className="p-3 text-center w-12">#</th><th className="p-3">Nội dung</th><th className="p-3">Ngày</th><th className="p-3 text-center">Điểm</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">{hist.map((h,i) => (<tr key={h.id} className="hover:bg-blue-50/30"><td className="p-3 text-center text-slate-400">{i+1}</td><td className="p-3 font-medium text-slate-700">{h.content}</td><td className="p-3 text-slate-500">{h.date}</td><td className="p-3 text-center font-bold text-[#003366]">{h.value}</td></tr>))}</tbody>
                 </table>
               )}
            </div>
          );
        })}
        {selectedClass && filteredStudents.length === 0 && <p className="text-center text-slate-400 italic py-8">Lớp này chưa có học viên nào.</p>}
      </div>
    </div>
  );
};
export default ScoreInput;