import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue } from "firebase/database";

const ClassList = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'users'), (snapshot) => {
      const data = snapshot.val();
      if(data) {
        const list = Object.values(data).filter(u => u.role === 'student');
        setStudents(list);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#003366" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
         <h2 className="text-xl font-bold text-[#003366]">Danh sách Học viên</h2>
      </div>
      <div className="grid gap-3">
        {students.length === 0 && <p className="text-slate-400 text-center py-8 italic">Chưa có học viên nào.</p>}
        {students.map((st, idx) => (
          <div key={idx} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl hover:shadow-md hover:border-blue-100 transition-all bg-white group">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center font-bold text-[#003366]">{st.name.charAt(0)}</div>
               <div>
                  <div className="font-bold text-gray-800">{st.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{st.studentCode} | {st.email}</div>
               </div>
            </div>
            <div className="bg-blue-50 text-[#003366] px-3 py-1 rounded-full text-xs font-bold border border-blue-100 group-hover:bg-[#003366] group-hover:text-white transition-colors">
               Student
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ClassList;