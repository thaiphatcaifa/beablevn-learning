import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { ref, onValue } from "firebase/database";

const StudentDashboard = () => {
  const { userData } = useAuth();
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    onValue(ref(db, 'classes'), (snap) => {
      const data = snap.val();
      if (data) {
        const allClasses = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        const myClasses = allClasses.filter(c => (userData.classIds && userData.classIds.includes(c.id)) || userData.classId === c.id);
        setClasses(myClasses);
      }
    });
  }, [userData]);

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-10 -translate-y-10"></div>
        <div className="w-16 h-16 bg-[#003366] rounded-full flex items-center justify-center text-white shadow-md z-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.516 50.552 50.552 0 00-2.658.813m-15.482 0A50.55 50.55 0 0112 13.489a50.55 50.55 0 016.744-3.342" />
            </svg>
        </div>
        <div className="z-10">
          <h1 className="text-2xl font-bold text-[#003366]">Chào, {userData?.name}</h1>
          <p className="text-slate-500 mt-1 text-sm">Mã Học viên: <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{userData?.studentCode}</span></p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#003366]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          Lịch học của bạn
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.length > 0 ? classes.map(c => (
            <div key={c.id} className="bg-slate-50 p-5 rounded-xl border border-slate-100 hover:border-[#003366] transition-colors group">
              <div className="flex justify-between items-start mb-3">
                 <div>
                    <div className="text-lg font-bold text-[#003366] group-hover:text-blue-700 transition-colors">{c.name}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{c.subject}</div>
                 </div>
                 <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded font-medium">{c.room}</span>
              </div>
              <div className="space-y-2 pt-3 border-t border-slate-200 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#003366]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    <span className="font-medium">{c.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{c.startTime} - {c.endTime}</span>
                </div>
              </div>
            </div>
          )) : <p className="text-slate-400 italic text-center col-span-2 py-8">Bạn chưa được xếp lớp.</p>}
        </div>
      </div>
    </div>
  );
};
export default StudentDashboard;