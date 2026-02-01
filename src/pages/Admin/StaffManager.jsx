import React, { useState, useEffect } from 'react';
import { db, firebaseConfig } from '../../firebase';
import { ref, set, onValue, remove } from "firebase/database";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// Icon "User Plus" cho phần Tạo tài khoản
const AddUserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#003366" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3.75 15a2.25 2.25 0 012.25-2.25h2.93a2.625 2.625 0 011.603.543c.47.372.673.855.567 1.348l-.053.25c-.29.988-1.2 1.609-2.227 1.609H6.262c-1.026 0-1.936-.621-2.226-1.61l-.054-.25a1.884 1.884 0 01.568-1.348z" />
  </svg>
);

const StaffManager = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    subRole: 'teacher', 
    assignedClasses: [] 
  });

  const [staffList, setStaffList] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);

  useEffect(() => {
    // Load danh sách lớp
    const unsubClasses = onValue(ref(db, 'classes'), (snapshot) => {
      const data = snapshot.val();
      setAvailableClasses(data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : []);
    });

    // Load danh sách nhân sự
    const unsubUsers = onValue(ref(db, 'users'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStaffList(Object.entries(data).map(([id, val]) => ({ id, ...val })).filter(u => u.role === 'staff'));
      } else {
        setStaffList([]);
      }
    });

    return () => {
      unsubClasses();
      unsubUsers();
    };
  }, []);

  const handleClassToggle = (classId) => {
    setFormData(prev => {
      const current = prev.assignedClasses || [];
      return current.includes(classId) 
        ? { ...prev, assignedClasses: current.filter(id => id !== classId) }
        : { ...prev, assignedClasses: [...current, classId] };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return alert("Vui lòng nhập đủ tên, email và mật khẩu!");
    if (formData.password.length < 6) return alert("Mật khẩu phải có ít nhất 6 ký tự!");

    const secondaryAppName = "SecondaryApp-" + Date.now();
    let secondaryApp;
    
    try {
      // 1. Khởi tạo app phụ
      secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);

      // 2. Tạo User trên Authentication
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
      const newUid = userCredential.user.uid;

      // 3. Lưu thông tin vào Realtime Database
      await set(ref(db, 'users/' + newUid), {
        name: formData.name,
        email: formData.email,
        subRole: formData.subRole,
        assignedClasses: formData.assignedClasses,
        role: 'staff',
        createdAt: new Date().toISOString()
      });

      // 4. Đăng xuất khỏi app phụ
      await signOut(secondaryAuth);
      
      alert(`Đã tạo nhân sự thành công!\nEmail: ${formData.email}`);
      setFormData({ name: '', email: '', password: '', subRole: 'teacher', assignedClasses: [] });

    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') alert("Email này đã được sử dụng!");
      else alert("Lỗi: " + error.message);
    } finally {
      // 5. Xóa app phụ
      if (secondaryApp) await deleteApp(secondaryApp);
    }
  };

  const handleDelete = async (staffId) => {
    if (window.confirm("Lưu ý: Hành động này chỉ xóa dữ liệu trong danh sách, không xóa tài khoản đăng nhập (Auth). Bạn có chắc chắn xóa?")) {
      await remove(ref(db, `users/${staffId}`));
    }
  };

  const getClassNames = (classIds) => {
    if (!classIds || !Array.isArray(classIds)) return "Chưa phân công";
    return classIds.map(id => availableClasses.find(c => c.id === id)?.name || id).join(", ");
  };

  return (
    <div className="space-y-6">
      {/* Form Tạo Tài khoản */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-[#003366] flex items-center gap-2 border-b border-gray-50 pb-4">
          <AddUserIcon /> 
          Tạo Tài khoản Nhân sự
        </h2>
        
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Họ và Tên</label>
              <input className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all" placeholder="Nguyen Van A" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Email đăng nhập</label>
                <input type="email" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all" placeholder="email@bavn.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Mật khẩu</label>
                <input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all" placeholder="Min 6 chars" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Chức vụ</label>
              <select className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none" value={formData.subRole} onChange={e => setFormData({...formData, subRole: e.target.value})}>
                <option value="teacher">Giáo viên</option>
                <option value="cco">CCO</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="block text-sm font-bold mb-3 text-[#003366]">Phân quyền Lớp học:</label>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {availableClasses.map((cls) => (
                <label key={cls.id} className="flex items-center space-x-3 p-2 bg-white rounded border border-gray-100 hover:border-blue-200 cursor-pointer transition-colors">
                  <input type="checkbox" className="accent-[#003366] w-4 h-4" checked={formData.assignedClasses.includes(cls.id)} onChange={() => handleClassToggle(cls.id)} />
                  <span className="text-sm text-gray-700">{cls.name} <span className="text-gray-400 text-xs">({cls.room})</span></span>
                </label>
              ))}
              {availableClasses.length === 0 && <p className="text-sm text-gray-400 italic">Chưa có lớp học nào trong hệ thống.</p>}
            </div>
          </div>

          <button type="submit" className="md:col-span-2 bg-[#003366] text-white font-bold py-3 rounded-xl hover:bg-[#002244] transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2">
            <span></span> Tạo Tài khoản & Cấp quyền
          </button>
        </form>
      </div>

      {/* Danh sách */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-[#003366]">Danh sách Nhân sự</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <tr>
                <th className="p-4 rounded-tl-lg">Họ tên</th>
                <th className="p-4">Email</th>
                <th className="p-4">Chức vụ</th>
                <th className="p-4">Lớp phụ trách</th>
                <th className="p-4 rounded-tr-lg">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staffList.map(staff => (
                <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{staff.name}</td>
                  <td className="p-4 text-gray-600">{staff.email}</td>
                  <td className="p-4">
                    <span className="uppercase text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                      {staff.subRole}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500 max-w-xs truncate" title={getClassNames(staff.assignedClasses)}>
                    {getClassNames(staff.assignedClasses)}
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(staff.id)} className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors">
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {staffList.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400 italic">Chưa có nhân sự nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffManager;