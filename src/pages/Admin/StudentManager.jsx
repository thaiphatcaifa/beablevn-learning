import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, set, onValue, update, remove, push } from "firebase/database";
import bcrypt from 'bcryptjs';

const StudentManager = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  // CẬP NHẬT: password mặc định là 'BAVNbavn'
  const [formData, setFormData] = useState({ name: '', password: 'BAVNbavn', studentCode: '', classId1: '', classId2: '', classId3: '', role: 'student' });
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    onValue(ref(db, 'classes'), (snap) => setClasses(snap.val() ? Object.entries(snap.val()).map(([id, val]) => ({ id, ...val })) : []));
    onValue(ref(db, 'users'), (snap) => { if(snap.val()) setStudents(Object.entries(snap.val()).map(([id, val]) => ({ id, ...val })).filter(u => u.role === 'student')); });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.password || !formData.studentCode) return alert("Thiếu thông tin!");
    
    const classIds = [formData.classId1, formData.classId2, formData.classId3].filter(id => id);
    const loginEmail = `${formData.studentCode.trim()}@beable.vn`;

    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(formData.password, salt);

      const newUserRef = push(ref(db, 'users'));
      await set(newUserRef, {
        name: formData.name,
        loginId: formData.studentCode,
        studentCode: formData.studentCode,
        username: formData.studentCode,
        password: hashedPassword,
        email: loginEmail,
        role: 'student',
        classIds: classIds,
        createdAt: new Date().toISOString()
      });

      alert(`Đã thêm học viên: ${formData.name}\nMật khẩu: ${formData.password}`);
      // Reset form nhưng vẫn giữ pass BAVNbavn
      setFormData({ name: '', password: 'BAVNbavn', studentCode: '', classId1: '', classId2: '', classId3: '', role: 'student' });
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  const handleUpdate = async () => {
    if(!editingStudent) return;
    try {
      await update(ref(db, `users/${editingStudent.id}`), {
        name: editingStudent.name,
        studentCode: editingStudent.studentCode,
        classIds: [editingStudent.classId1, editingStudent.classId2, editingStudent.classId3].filter(Boolean)
      });
      setEditingStudent(null);
    } catch (e) { alert("Lỗi update: " + e.message); }
  };

  const handleResetPassword = async (student) => {
    const newPass = prompt(`Nhập mật khẩu mới cho HV ${student.name}:`, "BAVNbavn");
    if (!newPass) return;
    if (newPass.length < 6) return alert("Mật khẩu phải từ 6 ký tự trở lên!");

    try {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(newPass, salt);

        await update(ref(db, `users/${student.id}`), {
            password: hashedPassword
        });

        alert("Đã cập nhật mật khẩu mới thành công!");
    } catch (error) {
        alert("Lỗi: " + error.message);
    }
  };

  const handleDelete = async (id) => { if(window.confirm("Xóa học viên này?")) await remove(ref(db, `users/${id}`)); };

  const getClassNames = (ids) => {
    if (!ids || !ids.length) return "--";
    return ids.map(id => classes.find(c => c.id === id)?.name || id).join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-slate-200">
        <button onClick={() => setActiveTab('create')} className={`pb-3 px-2 text-sm font-bold transition-all ${activeTab === 'create' ? 'text-[#003366] border-b-2 border-[#003366]' : 'text-slate-400 hover:text-slate-600'}`}>+ Thêm Học Viên</button>
        <button onClick={() => setActiveTab('list')} className={`pb-3 px-2 text-sm font-bold transition-all ${activeTab === 'list' ? 'text-[#003366] border-b-2 border-[#003366]' : 'text-slate-400 hover:text-slate-600'}`}>Danh sách</button>
      </div>

      {activeTab === 'create' && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-fade-in-up">
          <h2 className="text-lg font-bold text-[#003366] mb-4">Thông tin Học viên mới</h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">Họ và Tên</label>
                 <input className="w-full border p-3 rounded-lg outline-none focus:border-[#003366] text-sm" placeholder="Nguyễn Văn A" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">Mã HV (Login ID)</label>
                 <input className="w-full border p-3 rounded-lg outline-none focus:border-[#003366] text-sm" placeholder="HV001" value={formData.studentCode} onChange={e => setFormData({...formData, studentCode: e.target.value})} />
               </div>
            </div>
            <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">Mật khẩu</label>
                 <input className="w-full border p-3 rounded-lg outline-none focus:border-[#003366] text-sm" type="password" placeholder="••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">Chọn Lớp (Tối đa 3)</label>
                 <div className="grid grid-cols-3 gap-2">
                    {[1,2,3].map(i => (
                        <select key={i} className="border p-3 rounded-lg text-sm outline-none focus:border-[#003366] bg-white" value={formData[`classId${i}`]} onChange={e => setFormData({...formData, [`classId${i}`]: e.target.value})}>
                            <option value="">-- Lớp {i} --</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    ))}
                 </div>
            </div>
            <button className="bg-[#003366] text-white py-3 px-6 rounded-lg font-bold shadow-lg shadow-blue-900/20 hover:bg-[#002244] transition-all">Lưu Học Viên</button>
          </form>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                 <tr><th className="p-3">Mã HV</th><th className="p-3">Tên</th><th className="p-3">Lớp đang học</th><th className="p-3 text-right">Thao tác</th></tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {students.map(st => (
                   <tr key={st.id} className="hover:bg-slate-50">
                     <td className="p-3 font-bold text-[#003366]">{st.studentCode}</td>
                     <td className="p-3 font-medium">{st.name}</td>
                     <td className="p-3 text-slate-600">{getClassNames(st.classIds)}</td>
                     <td className="p-3 text-right flex justify-end gap-2">
                        <button 
                            onClick={() => setEditingStudent({...st, classId1: st.classIds?.[0]||'', classId2: st.classIds?.[1]||'', classId3: st.classIds?.[2]||''})} 
                            className="text-[#003366] border border-[#003366] px-2 py-1 rounded text-xs font-bold hover:bg-[#003366] hover:text-white transition-all"
                        >
                            Sửa
                        </button>
                        <button 
                            onClick={() => handleResetPassword(st)}
                            className="text-yellow-600 border border-yellow-600 px-2 py-1 rounded text-xs font-bold hover:bg-yellow-600 hover:text-white transition-colors"
                        >
                            Pass
                        </button>
                        <button onClick={() => handleDelete(st.id)} className="text-red-500 hover:text-red-700 font-bold text-xs px-2">Xóa</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {editingStudent && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl animate-fade-in-up">
            <h3 className="font-bold text-lg mb-4 text-[#003366]">Chỉnh sửa Học viên</h3>
            <div className="space-y-3">
              <input className="w-full border p-2.5 rounded-lg outline-none focus:border-[#003366]" value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} placeholder="Tên" />
              <input className="w-full border p-2.5 rounded-lg outline-none focus:border-[#003366]" value={editingStudent.studentCode} onChange={e => setEditingStudent({...editingStudent, studentCode: e.target.value})} placeholder="Mã HV" />
              <div className="grid grid-cols-1 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                 {[1,2,3].map(i => (
                   <select key={i} className="border p-2 rounded text-sm w-full bg-white outline-none focus:border-[#003366]" value={editingStudent[`classId${i}`]} onChange={e => setEditingStudent({...editingStudent, [`classId${i}`]: e.target.value})}>
                     <option value="">Lớp {i}</option>
                     {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                 ))}
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setEditingStudent(null)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 font-medium">Hủy</button>
              <button onClick={handleUpdate} className="px-5 py-2 bg-[#003366] text-white rounded-lg text-sm font-bold hover:bg-[#002244] shadow-sm">Lưu Thay Đổi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManager;