import React, { useState, useEffect } from 'react';
import { db, firebaseConfig } from '../../firebase';
import { ref, set, onValue, remove, update } from "firebase/database";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

const StaffManager = () => {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', subRole: 'teacher', assignedClasses: [] 
  });
  const [staffList, setStaffList] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  // State cho việc điều chỉnh lớp
  const [editingStaff, setEditingStaff] = useState(null);

  useEffect(() => {
    onValue(ref(db, 'classes'), (snap) => setAvailableClasses(snap.val() ? Object.entries(snap.val()).map(([id, val]) => ({ id, ...val })) : []));
    onValue(ref(db, 'users'), (snap) => {
      const data = snap.val();
      if(data) setStaffList(Object.entries(data).map(([id, val]) => ({ id, ...val })).filter(u => u.role === 'staff'));
    });
  }, []);

  const handleClassToggle = (classId) => {
    const current = editingStaff ? (editingStaff.assignedClasses || []) : formData.assignedClasses;
    const newClasses = current.includes(classId) ? current.filter(id => id !== classId) : [...current, classId];
    
    if (editingStaff) {
      setEditingStaff({ ...editingStaff, assignedClasses: newClasses });
    } else {
      setFormData({ ...formData, assignedClasses: newClasses });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return alert("Thiếu thông tin!");
    
    // Giữ nguyên logic tạo Secondary App để tạo user
    const secondaryApp = initializeApp(firebaseConfig, "StaffApp-" + Date.now());
    try {
      const auth = getAuth(secondaryApp);
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await set(ref(db, 'users/' + cred.user.uid), { ...formData, role: 'staff', createdAt: new Date().toISOString() });
      await signOut(auth);
      alert(`Đã tạo nhân sự: ${formData.email}`);
      setFormData({ name: '', email: '', password: '', subRole: 'teacher', assignedClasses: [] });
    } catch (error) { alert("Lỗi: " + error.message); }
    finally { deleteApp(secondaryApp); }
  };

  const handleUpdateClasses = () => {
    if (!editingStaff) return;
    update(ref(db, `users/${editingStaff.id}`), { assignedClasses: editingStaff.assignedClasses });
    setEditingStaff(null);
    alert("Đã cập nhật lớp phụ trách!");
  };

  const handleDelete = async (staffId) => {
    // Cảnh báo vấn đề Email đã tồn tại
    if (window.confirm("LƯU Ý QUAN TRỌNG: Hành động này chỉ xóa dữ liệu trong Danh sách. Tài khoản đăng nhập (Email) vẫn tồn tại trên hệ thống Google/Firebase. Bạn sẽ KHÔNG THỂ tạo lại nhân sự mới với email này trừ khi liên hệ Admin hệ thống để xóa Auth. Bạn có chắc chắn?")) {
      await remove(ref(db, `users/${staffId}`));
    }
  };

  const getClassNames = (ids) => (!ids || !ids.length) ? <span className="text-gray-400 italic">Chưa gán</span> : ids.map(id => availableClasses.find(c => c.id === id)?.name || id).join(", ");

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-[#003366] border-b border-gray-50 pb-4 flex items-center gap-2">
          <span className="text-2xl">👤</span> Tạo Tài khoản Nhân sự
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <input className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] outline-none" placeholder="Họ và Tên" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
             <div className="grid grid-cols-2 gap-3">
               <input className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] outline-none" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
               <input className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] outline-none" placeholder="Mật khẩu" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
             </div>
             <select className="w-full border p-3 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#003366] outline-none" value={formData.subRole} onChange={e => setFormData({...formData, subRole: e.target.value})}>
                <option value="teacher">Giáo viên</option>
                <option value="cco">CCO</option>
                <option value="cca">CCA</option> {/* Thêm CCA */}
             </select>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
             <label className="block text-xs font-bold mb-3 text-[#003366] uppercase tracking-wide">Gán lớp (Tạo mới):</label>
             <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                {availableClasses.map((cls) => (
                  <label key={cls.id} className="flex items-center space-x-3 p-2 bg-white rounded border border-gray-100 hover:border-blue-200 cursor-pointer transition-colors">
                    <input type="checkbox" className="accent-[#003366] w-4 h-4" checked={formData.assignedClasses.includes(cls.id)} onChange={() => handleClassToggle(cls.id)} />
                    <span className="text-sm text-gray-700">{cls.name}</span>
                  </label>
                ))}
             </div>
          </div>
          <button className="md:col-span-2 bg-[#003366] text-white font-bold py-3 rounded-xl hover:bg-[#002244] shadow-md transition-all">
            + Khởi tạo Tài khoản
          </button>
        </form>
      </div>

      {/* Modal Điều chỉnh */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl animate-fade-in-up">
            <h3 className="font-bold text-lg mb-4 text-[#003366] border-b pb-2">Điều chỉnh lớp: {editingStaff.name}</h3>
            <div className="max-h-60 overflow-y-auto space-y-2 mb-6 bg-gray-50 p-3 rounded border border-gray-200">
               {availableClasses.map((cls) => (
                  <label key={cls.id} className="flex items-center space-x-3 p-2 bg-white rounded border border-gray-100 cursor-pointer hover:bg-blue-50">
                    <input type="checkbox" className="accent-[#003366] w-4 h-4" checked={(editingStaff.assignedClasses || []).includes(cls.id)} onChange={() => handleClassToggle(cls.id)} />
                    <span className="text-sm font-medium">{cls.name}</span>
                  </label>
                ))}
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingStaff(null)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">Hủy</button>
              <button onClick={handleUpdateClasses} className="px-4 py-2 text-white bg-[#003366] rounded-lg hover:bg-[#002244] font-medium shadow-sm">Lưu Thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <h2 className="text-xl font-bold mb-6 text-[#003366] flex items-center gap-2">
            <span className="text-2xl">📋</span> Danh sách Nhân sự
         </h2>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-[#f0f9ff] text-[#003366] uppercase font-bold text-xs">
                   <tr>
                      <th className="p-4">Họ tên</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Chức vụ</th>
                      <th className="p-4">Lớp Phụ Trách</th>
                      <th className="p-4 text-right">Hành động</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {staffList.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                         <td className="p-4 font-bold text-gray-800">{s.name}</td>
                         <td className="p-4 text-gray-600">{s.email}</td>
                         <td className="p-4"><span className="uppercase text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">{s.subRole}</span></td>
                         <td className="p-4">
                            <div className="flex items-center justify-between gap-2">
                               <span className="truncate max-w-[200px] text-gray-600" title={getClassNames(s.assignedClasses)}>{getClassNames(s.assignedClasses)}</span>
                               <button onClick={() => setEditingStaff(s)} className="text-[#003366] border border-[#003366] text-[10px] font-bold px-2 py-1 rounded hover:bg-[#003366] hover:text-white transition-all whitespace-nowrap">Điều chỉnh</button>
                            </div>
                         </td>
                         <td className="p-4 text-right">
                            <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 font-bold text-xs px-2 py-1 hover:bg-red-50 rounded transition-colors">Xóa</button>
                         </td>
                      </tr>
                   ))}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};
export default StaffManager;