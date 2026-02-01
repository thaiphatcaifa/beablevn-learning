import React, { useState, useEffect } from 'react';
import { db, firebaseConfig } from '../../firebase';
import { ref, set, onValue } from "firebase/database";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// Icon "Academic Cap" cho tiêu đề
const StudentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#003366" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.516 50.552 50.552 0 00-2.658.813m-15.482 0A50.55 50.55 0 0112 13.489a50.55 50.55 0 016.744-3.342" />
  </svg>
);

const StudentManager = () => {
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', studentCode: '', classId: '', role: 'student' 
  });

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'classes'), (snapshot) => {
      const data = snapshot.val();
      setClasses(data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : []);
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.studentCode) return alert("Thiếu thông tin!");
    if (formData.password.length < 6) return alert("Mật khẩu tối thiểu 6 ký tự!");

    const secondaryAppName = "SecondaryApp-Student-" + Date.now();
    let secondaryApp;

    try {
      secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);

      // Tạo User Auth
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
      const newUid = userCredential.user.uid;

      // Lưu Database
      await set(ref(db, 'users/' + newUid), {
        name: formData.name,
        email: formData.email,
        studentCode: formData.studentCode,
        classId: formData.classId,
        role: 'student',
        createdAt: new Date().toISOString()
      });

      await signOut(secondaryAuth);
      alert(`Đã tạo học viên: ${formData.name}\nTài khoản: ${formData.email}`);
      setFormData({ name: '', email: '', password: '', studentCode: '', classId: '', role: 'student' });

    } catch (error) {
      if(error.code === 'auth/email-already-in-use') alert("Email đã tồn tại!");
      else alert("Lỗi: " + error.message);
    } finally {
      if (secondaryApp) await deleteApp(secondaryApp);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-8 text-[#003366] flex items-center gap-2 border-b border-gray-50 pb-4">
        <StudentIcon /> 
        Quản lý Học viên
      </h2>

      <form onSubmit={handleCreate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Họ và Tên</label>
            <input className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Mã Học viên</label>
            <input className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all font-mono" value={formData.studentCode} onChange={e => setFormData({...formData, studentCode: e.target.value})} required placeholder="VD: BA001" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
            <input type="email" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="student@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Mật khẩu</label>
            <input type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required placeholder="Tối thiểu 6 ký tự" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-700">Lớp học</label>
          <select className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none transition-all bg-white" value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} required>
            <option value="">-- Chọn Lớp --</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.room}) - {c.subject}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="md:col-span-2 bg-[#003366] text-white font-bold py-3 rounded-xl hover:bg-[#002244] transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2">
          <span></span> Khởi tạo Tài khoản Học viên
        </button>
      </form>
    </div>
  );
};

export default StudentManager;