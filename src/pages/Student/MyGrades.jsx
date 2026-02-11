import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { ref, onValue } from 'firebase/database';

const MyGrades = () => {
  const { currentUser } = useAuth();
  const [gradeData, setGradeData] = useState({});
  const [loading, setLoading] = useState(true);

  // Cấu trúc mặc định
  const INITIAL_STATE = {
    bonus: [],
    assignment: [],
    formative: [],
    summative: []
  };

  useEffect(() => {
    if (!currentUser) return;

    // Lắng nghe toàn bộ node scores
    const scoresRef = ref(db, 'scores');

    const unsubscribe = onValue(scoresRef, (snapshot) => {
      const data = snapshot.val();
      const result = JSON.parse(JSON.stringify(INITIAL_STATE)); // Deep copy

      if (data) {
        // Cấu trúc DB: scores / ClassID / StudentID / Category / PushID
        
        // Duyệt qua tất cả các lớp
        Object.keys(data).forEach(classId => {
            const classData = data[classId];
            
            // Tìm dữ liệu của học viên hiện tại trong lớp này
            const studentData = classData[currentUser.id];
            
            if (studentData) {
                // Duyệt qua 4 category: bonus, assignment...
                Object.keys(studentData).forEach(category => {
                    const records = studentData[category]; // Object chứa các pushId
                    
                    if (records && result[category]) {
                        // Chuyển object records thành array để hiển thị
                        const list = Object.entries(records).map(([pushId, val]) => ({
                            id: pushId,
                            classId: classId, // Lưu lại ID lớp để tham chiếu nếu cần
                            ...val
                        }));
                        
                        // Gộp vào kết quả chung
                        result[category] = [...result[category], ...list];
                    }
                });
            }
        });

        // Sắp xếp theo ngày giảm dần (Mới nhất lên đầu)
        Object.keys(result).forEach(cat => {
            result[cat].sort((a, b) => new Date(b.date) - new Date(a.date));
        });
      }

      setGradeData(result);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Helper render bảng điểm chi tiết
  const renderTable = (category, title, icon, colorClass) => {
      const list = gradeData[category] || [];
      
      return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className={`p-4 border-b border-slate-100 flex items-center gap-2 ${colorClass}`}>
                <span className="text-xl">{icon}</span>
                <h3 className="font-bold text-lg">{title}</h3>
                <span className="ml-auto text-xs font-bold bg-white/80 px-2 py-1 rounded text-slate-600 shadow-sm">
                    {list.length} mục
                </span>
            </div>
            
            {list.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-3 w-24">Ngày</th>
                                <th className="p-3">Nội dung ghi nhận</th>
                                {category === 'summative' && <th className="p-3 w-20">Kỳ thi</th>}
                                <th className="p-3 w-24 text-center">Điểm</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {list.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-3 text-slate-500 font-mono text-xs">{item.date}</td>
                                    <td className="p-3 font-medium text-slate-700">{item.content}</td>
                                    {category === 'summative' && (
                                        <td className="p-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                                item.examType === 'EOMT' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}>
                                                {item.examType || 'MMT'}
                                            </span>
                                        </td>
                                    )}
                                    <td className="p-3 text-center">
                                        <span className="font-bold text-[#003366] bg-blue-50 px-3 py-1 rounded-lg">
                                            {item.score}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-6 text-center text-slate-400 italic text-sm">Chưa có dữ liệu ghi nhận.</div>
            )}
        </div>
      );
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Đang tải dữ liệu điểm...</div>;

  return (
    <div className="space-y-2 pb-10">
       <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-[#003366]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
            </div>
            <div>
                <h2 className="text-xl font-bold text-[#003366]">Sổ Theo Dõi Học Tập</h2>
                <p className="text-xs text-slate-400 font-medium">Cập nhật chi tiết quá trình học tập</p>
            </div>
      </div>

      {renderTable('bonus', '1. Điểm Bonus', '🌟', 'bg-yellow-50 text-yellow-800')}
      {renderTable('assignment', '2. Assignment (Bài tập)', '📚', 'bg-green-50 text-green-800')}
      {renderTable('formative', '3. Formative Assessment', '📝', 'bg-blue-50 text-blue-800')}
      {renderTable('summative', '4. Summative Assessment', '🏆', 'bg-purple-50 text-purple-800')}
      
    </div>
  );
};

export default MyGrades;