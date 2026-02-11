import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';

const Notifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const LABELS = {
      'báo bài': 'bg-blue-100 text-blue-800',
      'quan trọng': 'bg-red-100 text-red-800',
      'sự kiện': 'bg-yellow-100 text-yellow-800'
  };

  useEffect(() => {
    if (!currentUser) return;

    const notiRef = ref(db, 'notifications');
    const unsubscribe = onValue(notiRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Lấy danh sách ID lớp của học viên
        const myClassIds = Array.isArray(currentUser.classIds) 
            ? currentUser.classIds 
            : Object.values(currentUser.classIds || {});

        const notiList = Object.entries(data)
            .map(([id, val]) => ({ id, ...val }))
            // --- LOGIC LỌC THÔNG BÁO CHO HỌC VIÊN ---
            .filter(n => n.scope === 'all' || myClassIds.includes(n.scope))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
            
        setNotifications(notiList);
      } else {
        setNotifications([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg text-[#003366]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
        </div>
        <div>
            <h2 className="text-xl font-bold text-[#003366]">Bảng Tin & Sự Kiện</h2>
            <p className="text-xs text-slate-400 font-medium">Cập nhật tin tức mới nhất từ BE ABLE</p>
        </div>
      </div>

      {loading ? <p className="text-slate-400 text-center py-10">Đang tải...</p> : (
        <div className="space-y-4">
          {notifications.length > 0 ? notifications.map((noti) => (
            <div key={noti.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-4">
              {/* ICON */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  noti.type === 'link' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-[#003366]'
              }`}>
                  {noti.type === 'link' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                  ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
                  )}
              </div>

              {/* CONTENT */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        {noti.type === 'content' && noti.label && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${LABELS[noti.label] || 'bg-gray-100'}`}>
                                {noti.label}
                            </span>
                        )}
                        <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded font-medium">
                            {new Date(noti.date).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                </div>
                
                <h3 className="font-bold text-slate-800 text-md mb-2">{noti.title}</h3>
                
                {/* HIỂN THỊ DỰA TRÊN LOẠI */}
                {noti.type === 'link' ? (
                    <a 
                        href={noti.linkUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#002244] transition-all shadow-md shadow-blue-900/10"
                    >
                        <span>Mở {noti.title}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                    </a>
                ) : (
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{noti.content}</p>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">Hiện chưa có thông báo nào dành cho bạn.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;