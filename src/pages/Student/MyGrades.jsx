import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { ref, onValue } from "firebase/database";

const MyGrades = () => {
  const { currentUser } = useAuth();
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (currentUser) {
      onValue(ref(db, `scores/${currentUser.uid}`), (snap) => {
        setScore(snap.val());
      });
    }
  }, [currentUser]);

  if (!score) return <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-center text-slate-400 italic">Chưa có dữ liệu điểm.</div>;

  const Card = ({ title, value, icon, bgClass, textClass, borderClass }) => (
    <div className={`p-6 rounded-xl border ${bgClass} ${borderClass} flex items-center justify-between`}>
      <div>
        <div className={`text-3xl font-extrabold mb-1 ${textClass}`}>{value}</div>
        <div className={`text-sm font-bold opacity-80 ${textClass}`}>{title}</div>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white/80 shadow-sm ${textClass}`}>
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
        <Card 
          title="Điểm Cộng" 
          value={`+${score.bonus || 0}`} 
          bgClass="bg-green-50" 
          borderClass="border-green-100" 
          textClass="text-green-700"
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>}
        />
        <Card 
          title="Bài Tập" 
          value={score.homework || 0} 
          bgClass="bg-blue-50" 
          borderClass="border-blue-100" 
          textClass="text-[#003366]"
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>}
        />
        <Card 
          title="Kiểm Tra" 
          value={score.test || 0} 
          bgClass="bg-purple-50" 
          borderClass="border-purple-100" 
          textClass="text-purple-700"
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>}
        />
      </div>
    </div>
  );
};
export default MyGrades;