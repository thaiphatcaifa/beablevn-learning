import React, { useState } from 'react';
import { db } from '../../firebase';
import { ref, push } from "firebase/database";

const Notifications = () => {
  const [mode, setMode] = useState('text'); // 'text' (Nội dung) | 'link' (Hyperlink)
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [label, setLabel] = useState('homework'); // 'homework' | 'important' | 'event'

  const handlePost = () => {
    if (mode === 'text' && !content) return alert("Vui lòng nhập nội dung!");
    if (mode === 'link' && !linkUrl) return alert("Vui lòng nhập đường dẫn!");

    push(ref(db, 'notifications'), {
      mode, // Lưu chế độ để bên Student hiển thị đúng
      content: mode === 'text' ? content : linkUrl, // Nếu là link thì lưu URL vào content
      label: mode === 'text' ? label : 'link', // Nếu là text thì lưu nhãn, link thì là 'link'
      date: new Date().toLocaleDateString('vi-VN'),
      author: 'Giáo viên/CCO',
      timestamp: Date.now()
    });

    setContent('');
    setLinkUrl('');
    alert('Đã đăng thông báo!');
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#003366" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.996.912 2.164 1.661 2.868C12.72 18.261 13.9 18 14.5 18c.6 0 1.78-.261 2.5-.952.749-.704 1.408-1.872 1.661-2.868m-7.821-7.42a6 6 0 00-1.2-.533m8.91 9.963a6.002 6.002 0 01-1.2.533m-7.71-10.496a3.504 3.504 0 011.05-1.928m6.72 1.928a3.504 3.504 0 00-1.05-1.928" /></svg>
         <h2 className="text-xl font-bold text-[#003366]">Đăng Thông Báo Mới</h2>
      </div>

      {/* Chọn loại thông báo */}
      <div className="flex gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="postMode" className="accent-[#003366]" checked={mode === 'text'} onChange={() => setMode('text')} />
          <span className="text-sm font-bold text-slate-700">Nội dung & Nhãn</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="postMode" className="accent-[#003366]" checked={mode === 'link'} onChange={() => setMode('link')} />
          <span className="text-sm font-bold text-slate-700">Đăng Hyperlink</span>
        </label>
      </div>

      {/* Form cho TEXT (Có nhãn) */}
      {mode === 'text' && (
        <div className="space-y-4 animate-fade-in-up">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Chọn Nhãn dán:</span>
            <div className="flex gap-2">
              <button onClick={() => setLabel('homework')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${label === 'homework' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50'}`}>Báo bài</button>
              <button onClick={() => setLabel('important')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${label === 'important' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 border-red-100 hover:bg-red-50'}`}>Quan trọng</button>
              <button onClick={() => setLabel('event')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${label === 'event' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-yellow-600 border-yellow-100 hover:bg-yellow-50'}`}>Sự kiện</button>
            </div>
          </div>
          <div className="relative">
            <textarea 
                className="w-full border border-slate-200 p-4 rounded-xl h-40 focus:ring-2 focus:ring-blue-50 focus:border-[#003366] outline-none resize-none text-sm leading-relaxed"
                placeholder="Nhập nội dung thông báo..."
                value={content}
                onChange={e => setContent(e.target.value)}
            />
            <div className="absolute bottom-4 right-4 text-xs text-slate-400">{content.length} ký tự</div>
          </div>
        </div>
      )}

      {/* Form cho LINK */}
      {mode === 'link' && (
        <div className="animate-fade-in-up mb-6">
           <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Đường dẫn Website:</label>
           <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-50 focus-within:border-[#003366]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#94a3b8" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
              <input 
                className="w-full outline-none text-sm text-[#003366]"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
              />
           </div>
           <p className="text-xs text-slate-400 mt-2 italic">*Học viên sẽ thấy nút bấm để mở trực tiếp trang web này.</p>
        </div>
      )}

      <div className="flex justify-end mt-4">
         <button onClick={handlePost} className="bg-[#003366] text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-[#002244] hover:shadow-lg transition-all flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
            Đăng bài
         </button>
      </div>
    </div>
  );
};
export default Notifications;