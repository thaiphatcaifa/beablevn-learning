import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, push, set, onValue, remove } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';

const Notifications = () => {
  const { currentUser } = useAuth();
  
  // State quản lý form
  const [postMode, setPostMode] = useState('content'); // 'content' | 'link'
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // State cho Hyperlink
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('Link bài tập'); // Default

  // State cho Nội dung
  const [selectedLabel, setSelectedLabel] = useState('báo bài'); // 'báo bài', 'quan trọng', 'sự kiện'

  const [scope, setScope] = useState('all'); // 'all' hoặc ID lớp
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notiList, setNotiList] = useState([]); // Danh sách thông báo đã đăng

  const LINK_TITLES = ["Link điểm danh", "Link sự kiện", "Link bài tập", "Link kiểm tra"];
  const LABELS = [
      { id: 'báo bài', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      { id: 'quan trọng', color: 'bg-red-100 text-red-800 border-red-200' },
      { id: 'sự kiện', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
  ];

  // 1. Lấy danh sách lớp (đã lọc) và danh sách thông báo
  useEffect(() => {
    // Lấy Classes
    onValue(ref(db, 'classes'), (snap) => {
      const data = snap.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        const assigned = currentUser.assignedClasses || [];
        const filtered = currentUser.role === 'admin' ? list : list.filter(c => assigned.includes(c.id));
        setClasses(filtered);
      }
    });

    // Lấy Notifications
    onValue(ref(db, 'notifications'), (snap) => {
        const data = snap.val();
        if (data) {
            const list = Object.entries(data)
                .map(([id, val]) => ({ id, ...val }))
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            setNotiList(list);
        } else {
            setNotiList([]);
        }
    });
  }, [currentUser]);

  const handlePost = async () => {
    // Validate
    if (postMode === 'content' && (!title || !content)) return alert("Vui lòng nhập tiêu đề và nội dung.");
    if (postMode === 'link' && (!linkUrl)) return alert("Vui lòng nhập đường dẫn (URL).");

    setLoading(true);
    try {
      const newNotiRef = push(ref(db, 'notifications'));
      
      const payload = {
        date: new Date().toISOString(), // Dùng full ISO để sort
        scope: scope,
        author: currentUser.name,
        type: postMode // 'content' hoặc 'link'
      };

      if (postMode === 'content') {
          payload.title = title;
          payload.content = content;
          payload.label = selectedLabel;
      } else {
          payload.title = linkTitle; // Tiêu đề là loại link
          payload.content = "Nhấn nút bên dưới để truy cập liên kết."; // Nội dung phụ
          payload.linkUrl = linkUrl;
      }

      await set(newNotiRef, payload);
      
      alert("Đăng thông báo thành công!");
      // Reset form
      setTitle('');
      setContent('');
      setLinkUrl('');
    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
      if(window.confirm("Bạn chắc chắn muốn xóa thông báo này?")) {
          await remove(ref(db, `notifications/${id}`));
      }
  }

  // Helper hiển thị tên lớp
  const getScopeName = (scopeId) => {
      if(scopeId === 'all') return "Toàn bộ hệ thống";
      const cls = classes.find(c => c.id === scopeId);
      return cls ? `Lớp ${cls.name}` : "Lớp đã xóa";
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
         <div className="p-2 bg-blue-50 rounded-lg text-[#003366]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.795c0 1.94-.254 3.82-.734 5.622m-4.731.213a23.87 23.87 0 005.932 2.535m0 0A23.753 23.753 0 0122.5 6" /></svg>
         </div>
         <h2 className="text-xl font-bold text-[#003366]">Đăng Thông Báo Mới</h2>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl">
        
        {/* TÙY CHỌN LOẠI ĐĂNG */}
        <div className="flex gap-4 mb-6">
            <button 
                onClick={() => setPostMode('content')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all border ${postMode === 'content' ? 'bg-[#003366] text-white border-[#003366]' : 'bg-white text-slate-500 border-slate-200'}`}
            >
                📝 Đăng Nội dung
            </button>
            <button 
                onClick={() => setPostMode('link')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all border ${postMode === 'link' ? 'bg-[#003366] text-white border-[#003366]' : 'bg-white text-slate-500 border-slate-200'}`}
            >
                🔗 Đăng Hyperlink
            </button>
        </div>

        {/* PHẠM VI HIỂN THỊ */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phạm vi hiển thị</label>
          <select 
            className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-[#003366]"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          >
            <option value="all">Toàn bộ hệ thống</option>
            {classes.map(c => <option key={c.id} value={c.id}>Lớp: {c.name}</option>)}
          </select>
        </div>

        {/* FORM NHẬP LIỆU */}
        {postMode === 'content' ? (
            <>
                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nhãn dán (Label)</label>
                    <div className="flex gap-2">
                        {LABELS.map(lbl => (
                            <button
                                key={lbl.id}
                                onClick={() => setSelectedLabel(lbl.id)}
                                className={`px-3 py-1 rounded text-xs font-bold border transition-all ${selectedLabel === lbl.id ? lbl.color + ' ring-2 ring-offset-1 ring-blue-300' : 'bg-white text-slate-400 border-slate-200'}`}
                            >
                                {lbl.id.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tiêu đề</label>
                    <input 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-[#003366]" 
                        placeholder="VD: Thông báo nghỉ lễ..." 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nội dung chi tiết</label>
                    <textarea 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-[#003366] h-32" 
                        placeholder="Nhập nội dung..." 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
            </>
        ) : (
            <>
                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tiêu đề liên kết</label>
                    <select 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-[#003366] font-bold text-[#003366]"
                        value={linkTitle}
                        onChange={(e) => setLinkTitle(e.target.value)}
                    >
                        {LINK_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Đường dẫn (URL)</label>
                    <input 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-[#003366] font-mono text-sm text-blue-600" 
                        placeholder="https://..." 
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                    />
                </div>
            </>
        )}

        <button 
          onClick={handlePost} 
          disabled={loading}
          className="w-full bg-[#003366] text-white py-3 rounded-lg font-bold hover:bg-[#002244] transition-all shadow-lg shadow-blue-900/10"
        >
          {loading ? "Đang xử lý..." : "Đăng Thông Báo"}
        </button>
      </div>

      {/* DANH SÁCH THÔNG BÁO ĐÃ TẠO */}
      <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-bold text-slate-700 mb-4">Danh sách Thông báo đã tạo</h3>
          <div className="space-y-3">
              {notiList.map(noti => (
                  <div key={noti.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center group hover:border-[#003366] transition-all">
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                              {noti.type === 'link' ? (
                                  <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-200">LINK</span>
                              ) : (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                      LABELS.find(l => l.id === noti.label)?.color || 'bg-gray-100 text-gray-600'
                                  }`}>
                                      {noti.label?.toUpperCase()}
                                  </span>
                              )}
                              <span className="text-xs text-slate-400 font-medium">{new Date(noti.date).toLocaleDateString('vi-VN')}</span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs font-bold text-[#003366]">{getScopeName(noti.scope)}</span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm">{noti.title}</h4>
                          <p className="text-xs text-slate-500 truncate max-w-md">{noti.type==='link' ? noti.linkUrl : noti.content}</p>
                      </div>
                      <button 
                          onClick={() => handleDelete(noti.id)}
                          className="text-red-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Xóa thông báo"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                  </div>
              ))}
              {notiList.length === 0 && <p className="text-slate-400 text-sm italic text-center">Chưa có thông báo nào.</p>}
          </div>
      </div>
    </div>
  );
};

export default Notifications;