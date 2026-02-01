import React, { useState } from 'react';
import { db } from '../../firebase';
import { ref, push } from "firebase/database";

const Notifications = () => {
  const [content, setContent] = useState('');

  const handlePost = () => {
    if(!content) return;
    push(ref(db, 'notifications'), {
      content,
      date: new Date().toLocaleDateString('vi-VN'),
      type: 'general',
      author: 'Giáo viên'
    });
    setContent('');
    alert('Đã đăng thông báo!');
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#003366" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.996.912 2.164 1.661 2.868C12.72 18.261 13.9 18 14.5 18c.6 0 1.78-.261 2.5-.952.749-.704 1.408-1.872 1.661-2.868m-7.821-7.42a6 6 0 00-1.2-.533m8.91 9.963a6.002 6.002 0 01-1.2.533m-7.71-10.496a3.504 3.504 0 011.05-1.928m6.72 1.928a3.504 3.504 0 00-1.05-1.928" /></svg>
         <h2 className="text-xl font-bold text-[#003366]">Đăng Thông Báo Mới</h2>
      </div>
      <div className="relative">
        <textarea 
            className="w-full border border-slate-200 p-4 rounded-xl h-40 mb-4 focus:ring-2 focus:ring-blue-50 focus:border-[#003366] outline-none resize-none text-sm leading-relaxed"
            placeholder="Nhập nội dung thông báo cho học viên..."
            value={content}
            onChange={e => setContent(e.target.value)}
        />
        <div className="absolute bottom-6 right-2 text-xs text-slate-400 pointer-events-none">{content.length} ký tự</div>
      </div>
      <div className="flex justify-end">
         <button onClick={handlePost} className="bg-[#003366] text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-[#002244] hover:shadow-lg transition-all flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
            Đăng bài
         </button>
      </div>
    </div>
  );
};
export default Notifications;