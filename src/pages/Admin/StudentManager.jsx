import React, { useState } from 'react';
import { db } from '../../firebase';
import { ref, set } from "firebase/database";

const StudentManager = () => {
  const [formData, setFormData] = useState({ 
    name: '', email: '', studentCode: '', classId: '', role: 'student' 
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.studentCode) return alert("Vui lòng nhập đủ thông tin!");

    // Demo: Tạo ID từ thời gian (Thực tế nên dùng Authentication UID)
    const fakeUid = 'student_' + Date.now(); 
    
    try {
      await set(ref(db, 'users/' + fakeUid), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      alert("Đã tạo hồ sơ Học viên: " + formData.name);
      setFormData({ name: '', email: '', studentCode: '', classId: '', role: 'student' });
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-2xl">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Quản lý Học viên</h2>
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Họ và Tên</label>
            <input className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Mã Học viên</label>
            <input className="w-full border p-2 rounded" value={formData.studentCode} onChange={e => setFormData({...formData, studentCode: e.target.value})} required placeholder="VD: BA2301" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Email đăng nhập</label>
          <input type="email" className="w-full border p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Lớp học (Mã lớp)</label>
          <input className="w-full border p-2 rounded" value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} placeholder="VD: IELTS-K12" />
        </div>
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Tạo Học viên</button>
      </form>
    </div>
  );
};
export default StudentManager;