import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue, push, set } from "firebase/database";
import { useAuth } from '../../context/AuthContext';

const ScoreInput = () => {
  const { currentUser } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  
  const TABS = [
    { id: 'bonus', label: '1. Điểm Bonus' },
    { id: 'assignment', label: '2. Assignment' },
    { id: 'formative', label: '3. Formative Assessment' },
    { id: 'summative', label: '4. Summative Assessment' }
  ];
  const [activeTab, setActiveTab] = useState('bonus');

  const [commonInput, setCommonInput] = useState({
    date: new Date().toISOString().split('T')[0],
    content: '',
    examType: 'MMT'
  });

  const [studentScores, setStudentScores] = useState({});
  const [loading, setLoading] = useState(false);

  // 1. Lấy và LỌC danh sách lớp theo phân công
  useEffect(() => {
    if (!currentUser) return;

    onValue(ref(db, 'classes'), (snap) => {
      const data = snap.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        
        // --- LOGIC LỌC LỚP ---
        // Nếu là admin thì thấy hết, nếu là staff thì chỉ thấy lớp được gán
        const assigned = currentUser.assignedClasses || [];
        const filteredList = currentUser.role === 'admin' 
            ? list 
            : list.filter(c => assigned.includes(c.id));
            
        setClasses(filteredList);
      }
    });
  }, [currentUser]);

  // 2. Lấy danh sách học viên
  useEffect(() => {
    if (!selectedClass) return;
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list = Object.entries(data)
          .map(([id, val]) => ({ id, ...val }))
          .filter(u => u.role === 'student' && u.classIds && u.classIds.includes(selectedClass));
        setStudents(list);
      }
    });
    setStudentScores({});
  }, [selectedClass]);

  const handleScoreChange = (studentId, value) => {
    setStudentScores(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSave = async (student) => {
    const scoreVal = studentScores[student.id];
    if (!scoreVal) return alert(`Chưa nhập điểm cho ${student.name}`);
    if (!commonInput.content) return alert("Vui lòng nhập 'Nội dung ghi nhận'");

    if (!window.confirm(`Xác nhận lưu điểm cho ${student.name}?`)) return;

    setLoading(true);
    try {
      const newScoreRef = push(ref(db, `scores/${selectedClass}/${student.id}/${activeTab}`));
      
      const payload = {
        score: scoreVal,
        date: commonInput.date,
        content: commonInput.content,
        timestamp: new Date().toISOString()
      };

      if (activeTab === 'summative') {
        payload.examType = commonInput.examType;
      }

      await set(newScoreRef, payload);
      alert(`✅ Đã lưu thành công cho ${student.name}!`);
      
      setStudentScores(prev => {
        const newState = { ...prev };
        delete newState[student.id];
        return newState;
      });

    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
         <div className="p-2 bg-blue-50 rounded-lg text-[#003366]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
         </div>
         <h2 className="text-xl font-bold text-[#003366]">Nhập Điểm Chi Tiết</h2>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Chọn Lớp học (Được phân công)</label>
          <select 
              className="w-full md:w-1/2 p-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#003366] font-medium"
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
          >
              <option value="">-- Chọn lớp --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {classes.length === 0 && <p className="text-xs text-red-500 mt-2">Bạn chưa được phân công lớp nào.</p>}
      </div>

      {selectedClass && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all ${
                            activeTab === tab.id 
                            ? 'bg-white text-[#003366] border-t-2 border-t-[#003366]' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-5 bg-blue-50/50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngày ghi nhận</label>
                    <input 
                        type="date" 
                        className="w-full p-2 border border-slate-300 rounded outline-none focus:border-[#003366]"
                        value={commonInput.date}
                        onChange={e => setCommonInput({...commonInput, date: e.target.value})}
                    />
                </div>
                
                {activeTab === 'summative' && (
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kỳ thi</label>
                        <select 
                            className="w-full p-2 border border-slate-300 rounded outline-none focus:border-[#003366] font-bold text-[#003366]"
                            value={commonInput.examType}
                            onChange={e => setCommonInput({...commonInput, examType: e.target.value})}
                        >
                            <option value="MMT">MMT</option>
                            <option value="EOMT">EOMT</option>
                        </select>
                    </div>
                )}

                <div className={activeTab === 'summative' ? "md:col-span-7" : "md:col-span-9"}>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nội dung ghi nhận (Bắt buộc)</label>
                    <input 
                        type="text" 
                        placeholder="VD: Làm bài tập về nhà đầy đủ..."
                        className="w-full p-2 border border-slate-300 rounded outline-none focus:border-[#003366]"
                        value={commonInput.content}
                        onChange={e => setCommonInput({...commonInput, content: e.target.value})}
                    />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                        <tr>
                            <th className="p-4 w-10">#</th>
                            <th className="p-4">Học Viên</th>
                            <th className="p-4 w-32 text-center">Điểm số</th>
                            <th className="p-4 w-32 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {students.map((st, index) => (
                            <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 text-slate-400">{index + 1}</td>
                                <td className="p-4">
                                    <div className="font-bold text-[#003366]">{st.name}</div>
                                    <div className="text-xs text-slate-400">{st.studentCode}</div>
                                </td>
                                <td className="p-4">
                                    <input 
                                        type="number" 
                                        className="w-full text-center p-2 border border-slate-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none font-bold text-lg"
                                        placeholder="0-10"
                                        value={studentScores[st.id] || ''}
                                        onChange={(e) => handleScoreChange(st.id, e.target.value)}
                                    />
                                </td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => handleSave(st)}
                                        disabled={loading || !studentScores[st.id]}
                                        className={`px-4 py-2 rounded text-xs font-bold transition-all shadow-sm ${
                                            studentScores[st.id] 
                                            ? 'bg-[#003366] text-white hover:bg-[#002244]' 
                                            : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                        }`}
                                    >
                                        Lưu
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr><td colSpan="4" className="p-8 text-center text-slate-400 italic">Lớp này chưa có học viên nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default ScoreInput;