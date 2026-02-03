import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { ref, onValue } from "firebase/database";

const MyGrades = () => {
  const { currentUser } = useAuth();
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (currentUser) {
      const scoreRef = ref(db, `scores/${currentUser.uid}`);
      const unsubscribe = onValue(scoreRef, (snap) => {
        setScore(snap.val());
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  // Logic tính toán
  const calculateTotal = (data, type) => {
    if (!data) return 0;
    const values = Object.values(data).map(item => Number(item.value) || 0);
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    
    if (type === 'bonus') return sum;
    return (sum / values.length).toFixed(1);
  };

  if (!score) return (
    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-center text-slate-400 italic">
       <div className="text-4xl mb-2 grayscale opacity-30">📊</div>
       Chưa có dữ liệu điểm.
    </div>
  );

  // Card Component: Icon màu #003366, Nền nhạt tùy loại
  const Card = ({ title, value, icon, bgClass }) => (
    <div className={`p-6 rounded-xl border border-slate-100 ${bgClass} flex items-center justify-between shadow-sm hover:shadow-md transition-all`}>
      <div>
        <div className="text-3xl font-extrabold mb-1 text-[#003366]">{value}</div>
        <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">{title}</div>
      </div>
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm text-[#003366]">
        {icon}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold mb-6 text-[#003366] flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        Bảng Tổng hợp Điểm
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Điểm Cộng (Bonus) - Icon Star */}
        <Card 
          title="Điểm Cộng" 
          value={`+${calculateTotal(score?.bonus, 'bonus')}`} 
          bgClass="bg-yellow-50"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          }
        />
        
        {/* Bài Tập (Homework) - Icon Document */}
        <Card 
          title="Bài Tập (TB)" 
          value={calculateTotal(score?.homework, 'homework')} 
          bgClass="bg-blue-50"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
        />
        
        {/* Kiểm Tra (Test) - Icon Clipboard Check */}
        <Card 
          title="Kiểm Tra (TB)" 
          value={calculateTotal(score?.test, 'test')} 
          bgClass="bg-purple-50"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>
    </div>
  );
};

export default MyGrades;