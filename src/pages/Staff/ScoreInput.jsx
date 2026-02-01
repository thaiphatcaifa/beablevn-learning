import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue, push, set } from "firebase/database";

const ScoreInput = () => {
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [activeTab, setActiveTab] = useState('bonus'); 
  const [inputData, setInputData] = useState({ content: '', score: '' });
  const [scoreHistory, setScoreHistory] = useState({});

  useEffect(() => {
    onValue(ref(db, 'classes'), (snap) => setClasses(snap.val() ? Object.entries(snap.val()).map(([id, val]) => ({ id, ...val })) : []));
    onValue(ref(db, 'users'), (snap) => { if(snap.val()) setStudents(Object.entries(snap.val()).map(([id, val]) => ({ id, ...val })).filter(u => u.role === 'student')); });
    onValue(ref(db, 'scores'), (snap) => setScoreHistory(snap.val() || {}));
  }, []);

  const filteredStudents = selectedClass ? students.filter(s => (s.classIds || []).includes(selectedClass) || s.classId === selectedClass) : [];

  const handleSave = (studentId) => {
    if (!inputData.score || !inputData.content) return alert("Vui lòng nhập nội dung và điểm!");
    push(ref(db, `scores/${studentId}/${activeTab}`), {
      value: Number(inputData.score),
      content: inputData.content,
      date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN')
    });
    alert("Đã lưu điểm thành công!");
    setInputData({ content: '', score: '' });
  };

  const getHistory = (sid) => Object.entries(scoreHistory[sid]?.[activeTab] || {}).map(([k,v]) => ({id:k, ...v}));
  
  const calcTotal = (hist) => {
    if(!hist.length) return 0;
    const sum = hist.reduce((a, b) => a + (b.value || 0), 0);
    return activeTab === 'bonus' ? sum : (sum / hist.length).toFixed(1);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6 text-[#003366] flex items-center gap-2">
         <span className="text-2xl">📊</span> Thẻ Kết quả học tập
      </h2>
      
      {/* Chọn Lớp */}
      <div className="mb-6">
        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Chọn lớp học:</label>
        <select className="border-2 border-blue-100 p-2.5 rounded-lg w-full md:w-1/3 text-sm focus:border-[#003366] outline-none font-medium" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
           <option value="">-- Vui lòng chọn lớp --</option>
           {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-gray-100">
        {[ 
           {id:'bonus',l:'Điểm Cộng'}, 
           {id:'homework',l:'Bài tập về nhà'}, 
           {id:'test',l:'Kiểm tra định kỳ'} 
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-5 py-2.5 rounded-t-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-[#003366] text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{t.l}</button>
        ))}
      </div>
      
      {/* Input Nhanh */}
      {selectedClass && (
         <div className="bg-blue-50 p-5 rounded-xl mb-8 border border-blue-100 shadow-inner flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
                <label className="text-[10px] font-bold text-[#003366] uppercase mb-1 block">Nội dung đánh giá</label>
                <input className="w-full border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] outline-none bg-white" placeholder="VD: Bài tập Unit 1..." value={inputData.content} onChange={e => setInputData({...inputData, content: e.target.value})} />
            </div>
            <div className="w-full md:w-32">
                <label className="text-[10px] font-bold text-[#003366] uppercase mb-1 block">Điểm số</label>
                <input type="number" className="w-full border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] outline-none bg-white font-bold text-center" placeholder="10" value={inputData.score} onChange={e => setInputData({...inputData, score: e.target.value})} />
            </div>
         </div>
      )}

      {/* Danh sách */}
      <div className="space-y-6">
        {filteredStudents.map((st, idx) => {
          const hist = getHistory(st.id);
          return (
            <div key={st.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
               <div className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-xs">{idx+1}</div>
                    <div>
                        <div className="font-bold text-gray-800 text-sm">{st.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{st.studentCode}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="text-right">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">{activeTab==='bonus'?'Tổng Điểm':'Trung Bình'}</span>
                        <span className="text-xl font-extrabold text-emerald-600">{calcTotal(hist)}</span>
                     </div>
                     <button onClick={() => handleSave(st.id)} className="bg-[#003366] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#002244] transition-colors flex items-center gap-1">
                        <span>💾</span> Lưu
                     </button>
                  </div>
               </div>
               
               {/* Bảng History */}
               {hist.length > 0 ? (
                 <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left bg-white">
                        <thead className="bg-[#f8fafc] text-gray-500 border-b">
                            <tr>
                                <th className="p-3 w-12 text-center">STT</th>
                                <th className="p-3">Nội dung</th>
                                <th className="p-3 w-32">Ngày giờ</th>
                                <th className="p-3 w-16 text-center">Điểm</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {hist.map((h,i) => (
                                <tr key={h.id} className="hover:bg-blue-50/50">
                                    <td className="p-3 text-center text-gray-400">{i+1}</td>
                                    <td className="p-3 font-medium text-gray-700">{h.content}</td>
                                    <td className="p-3 text-gray-500">{h.date}</td>
                                    <td className="p-3 text-center font-bold text-[#003366] bg-blue-50/30">{h.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
               ) : (
                 <div className="p-4 text-center text-xs text-gray-400 italic bg-white">Chưa có dữ liệu điểm.</div>
               )}
            </div>
          );
        })}
        {selectedClass && filteredStudents.length === 0 && <p className="text-center text-gray-500 py-8 italic">Lớp này chưa có học viên nào.</p>}
      </div>
    </div>
  );
};
export default ScoreInput;