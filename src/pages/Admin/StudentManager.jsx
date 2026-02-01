import React, { useState, useEffect } from 'react';
import { db, firebaseConfig } from '../../firebase';
import { ref, set, onValue, update, remove } from "firebase/database";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

const StudentManager = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  
  // ClassId1, 2, 3 riêng biệt
  const [formData, setFormData] = useState({ name: '', email: '', password: '', studentCode: '', classId1: '', classId2: '', classId3: '', role: 'student' });
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    onValue(ref(db, 'classes'), (snap) => setClasses(snap.val() ? Object.entries(snap.val()).map(([id, val]) => ({ id, ...val })) : []));
    onValue(ref(db, 'users'), (snap) => { if(snap.val()) setStudents(Object.entries(snap.val()).map(([id, val]) => ({ id, ...val })).filter(u => u.role === 'student')); });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.studentCode) return alert("Thiếu thông tin!");
    const classIds = [formData.classId1, formData.classId2, formData.classId3].filter(Boolean);
    
    const secondaryApp = initializeApp(firebaseConfig, "StudentApp-" + Date.now());
    try {
      const auth = getAuth(secondaryApp);
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await set(ref(db, 'users/' + cred.user.uid), { ...formData, classIds, createdAt: new Date().toISOString() });
      await signOut(auth);
      alert("Đã tạo tài khoản học viên!");
      setFormData({ name: '', email: '', password: '', studentCode: '', classId1: '', classId2: '', classId3: '', role: 'student' });
    } catch (error) { alert("Lỗi: " + error.message); }
    finally { deleteApp(secondaryApp); }
  };

  const handleUpdate = () => {
    if (!editingStudent) return;
    const classIds = [editingStudent.classId1, editingStudent.classId2, editingStudent.classId3].filter(Boolean);
    update(ref(db, `users/${editingStudent.id}`), { 
        name: editingStudent.name, 
        studentCode: editingStudent.studentCode, 
        classIds 
    });
    setEditingStudent(null);
    alert("Đã cập nhật thông tin!");
  };

  const getClassNames = (ids) => (!ids || !ids.length) ? "---" : ids.map(id => classes.find(c => c.id === id)?.name || id).join(", ");

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex gap-6 mb-8 border-b border-gray-100">
        <button onClick={() => setActiveTab('create')} className={`pb-3 font-bold text-sm uppercase tracking-wide transition-all ${activeTab === 'create' ? 'text-[#003366] border-b-2 border-[#003366]' : 'text-gray-400 hover:text-gray-600'}`}>
           ➕ Thẻ Quản lý (Tạo mới)
        </button>
        <button onClick={() => setActiveTab('list')} className={`pb-3 font-bold text-sm uppercase tracking-wide transition-all ${activeTab === 'list' ? 'text-[#003366] border-b-2 border-[#003366]' : 'text-gray-400 hover:text-gray-600'}`}>
           📋 Danh sách Học viên
        </button>
      </div>

      {activeTab === 'create' && (
        <form onSubmit={handleCreate} className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
          <div className="grid grid-cols-2 gap-5">
            <input className="border p-3 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Họ và Tên" required />
            <input className="border p-3 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] outline-none" value={formData.studentCode} onChange={e => setFormData({...formData, studentCode: e.target.value})} placeholder="Mã HV (VD: BA001)" required />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <input className="border p-3 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email đăng nhập" type="email" required />
            <input className="border p-3 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Mật khẩu" required />
          </div>
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
             <p className="text-sm font-bold text-[#003366] mb-3 uppercase tracking-wide">Phân lớp học (Tối đa 3):</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
               {[1,2,3].map(i => (
                 <select key={i} className="border p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#003366] outline-none" value={formData[`classId${i}`]} onChange={e => setFormData({...formData, [`classId${i}`]: e.target.value})}>
                   <option value="">-- Lớp {i} --</option>
                   {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
               ))}
             </div>
          </div>
          <button className="w-full bg-[#16a34a] text-white py-3.5 rounded-xl font-bold hover:bg-[#15803d] shadow-md transition-all flex items-center justify-center gap-2">
             <span>+</span> Khởi tạo Tài khoản
          </button>
        </form>
      )}

      {activeTab === 'list' && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 animate-fade-in-up">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f0f9ff] text-[#003366] uppercase font-bold text-xs">
                <tr>
                    <th className="p-4">Mã HV</th>
                    <th className="p-4">Tên</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Các lớp</th>
                    <th className="p-4 text-right">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map(st => (
                <tr key={st.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-gray-600">{st.studentCode}</td>
                  <td className="p-4 font-medium text-gray-800">{st.name}</td>
                  <td className="p-4 text-gray-500">{st.email}</td>
                  <td className="p-4"><span className="text-gray-700">{getClassNames(st.classIds)}</span></td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => setEditingStudent({ ...st, classId1: st.classIds?.[0]||'', classId2: st.classIds?.[1]||'', classId3: st.classIds?.[2]||'' })} className="text-[#003366] font-bold text-xs border border-[#003366] px-2 py-1 rounded hover:bg-[#003366] hover:text-white transition-all">Sửa</button>
                    <button onClick={() => { if(window.confirm("Xóa dữ liệu học viên?")) remove(ref(db, `users/${st.id}`)); }} className="text-red-500 hover:text-red-700 font-bold text-xs px-2">Xóa</button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">Chưa có học viên nào.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Sửa */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl animate-fade-in-up">
            <h3 className="font-bold text-lg mb-6 text-[#003366] border-b pb-2">Điều chỉnh thông tin: {editingStudent.name}</h3>
            <div className="space-y-4">
              <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Họ tên</label>
                  <input className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none" value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} />
              </div>
              <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Mã Học viên</label>
                  <input className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none" value={editingStudent.studentCode} onChange={e => setEditingStudent({...editingStudent, studentCode: e.target.value})} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                 <p className="text-xs font-bold text-[#003366] mb-2 uppercase">Cập nhật lớp học:</p>
                 <div className="grid grid-cols-1 gap-2">
                    {[1,2,3].map(i => (
                    <select key={i} className="border p-2 rounded-lg text-sm w-full bg-white" value={editingStudent[`classId${i}`]} onChange={e => setEditingStudent({...editingStudent, [`classId${i}`]: e.target.value})}>
                        <option value="">-- Lớp {i} --</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    ))}
                 </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setEditingStudent(null)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium">Hủy</button>
              <button onClick={handleUpdate} className="px-5 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] font-bold shadow-sm">Lưu Thay đổi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentManager;