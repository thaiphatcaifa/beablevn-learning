import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, push, onValue, remove, update } from "firebase/database";

const DataManager = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  
  // Form state: Thêm StartTime, EndTime
  const [formData, setFormData] = useState({ 
    name: '', room: '', subject: '', schedule: '', 
    startTime: '', endTime: '' 
  });
  
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ room: '', schedule: '' });

  useEffect(() => {
    onValue(ref(db, 'classes'), (snapshot) => {
      const data = snapshot.val();
      let list = data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : [];
      
      // Sắp xếp A-Z theo tên lớp
      list.sort((a, b) => a.name.localeCompare(b.name));
      
      setClasses(list);
      setFilteredClasses(list);
    });
  }, []);

  // Logic Lọc
  useEffect(() => {
    let result = classes;
    if (filters.room) result = result.filter(c => c.room.toLowerCase().includes(filters.room.toLowerCase()));
    if (filters.schedule) result = result.filter(c => c.schedule.toLowerCase().includes(filters.schedule.toLowerCase()));
    setFilteredClasses(result);
  }, [filters, classes]);

  const handleSubmit = () => {
    if (!formData.name) return alert("Vui lòng nhập tên lớp");
    
    if (editingId) {
      update(ref(db, `classes/${editingId}`), formData);
      setEditingId(null);
      alert("Đã cập nhật thông tin lớp!");
    } else {
      push(ref(db, 'classes'), formData);
      alert("Đã thêm lớp mới!");
    }
    setFormData({ name: '', room: '', subject: '', schedule: '', startTime: '', endTime: '' });
  };

  const handleEdit = (cls) => {
    setEditingId(cls.id);
    setFormData({
      name: cls.name, room: cls.room, subject: cls.subject, schedule: cls.schedule,
      startTime: cls.startTime || '', endTime: cls.endTime || ''
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6 text-[#003366] border-b border-gray-50 pb-4 flex items-center gap-2">
        <span className="text-2xl">🗄️</span> Cấu trúc Dữ liệu (Lớp học)
      </h2>
      
      {/* Form Nhập/Sửa */}
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-8 shadow-inner">
        <h3 className="font-bold text-[#003366] mb-3 text-sm uppercase tracking-wide">
          {editingId ? "🔧 Đang điều chỉnh lớp" : "➕ Thêm lớp mới"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-gray-500 mb-1 block">Tên lớp</label>
            <input className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] outline-none" placeholder="VD: IE0201" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Phòng</label>
            <input className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] outline-none" placeholder="VD: P01" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-gray-500 mb-1 block">Môn học</label>
            <input className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] outline-none" placeholder="Tên môn" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
          </div>
          <div>
             <label className="text-xs font-bold text-gray-500 mb-1 block">Lịch học</label>
             <input className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] outline-none" placeholder="VD: T2-T4" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} />
          </div>
          <div>
             <label className="text-xs font-bold text-gray-500 mb-1 block">Bắt đầu</label>
             <input type="time" className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] outline-none" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
          </div>
          <div>
             <label className="text-xs font-bold text-gray-500 mb-1 block">Kết thúc</label>
             <input type="time" className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] outline-none" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
          </div>
        </div>
        <div className="mt-4 flex gap-3 justify-end">
           {editingId && <button onClick={() => { setEditingId(null); setFormData({ name: '', room: '', subject: '', schedule: '', startTime: '', endTime: '' }); }} className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-300 transition-colors">Hủy</button>}
           <button onClick={handleSubmit} className="bg-[#003366] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#002244] shadow-md transition-all flex items-center gap-2">
             {editingId ? <span>💾 Lưu thay đổi</span> : <span>➕ Thêm mới</span>}
           </button>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="flex gap-4 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100 items-center">
        <span className="text-sm font-bold text-[#003366]">🔍 Bộ lọc:</span>
        <input className="border border-blue-200 p-2 rounded-lg text-sm w-40 focus:outline-none focus:border-[#003366]" placeholder="Theo Phòng..." value={filters.room} onChange={e => setFilters({...filters, room: e.target.value})} />
        <input className="border border-blue-200 p-2 rounded-lg text-sm w-40 focus:outline-none focus:border-[#003366]" placeholder="Theo Lịch..." value={filters.schedule} onChange={e => setFilters({...filters, schedule: e.target.value})} />
      </div>

      {/* Danh sách */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f0f9ff] text-[#003366] uppercase font-bold text-xs">
            <tr>
              <th className="p-4">Tên lớp</th>
              <th className="p-4">Phòng</th>
              <th className="p-4">Môn học</th>
              <th className="p-4">Lịch học</th>
              <th className="p-4">Giờ học</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredClasses.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                <td className="p-4 font-bold text-gray-800">{c.name}</td>
                <td className="p-4 text-gray-600">{c.room}</td>
                <td className="p-4 text-gray-600">{c.subject}</td>
                <td className="p-4"><span className="bg-blue-100 text-[#003366] px-2 py-1 rounded text-xs font-bold">{c.schedule}</span></td>
                <td className="p-4 text-gray-600 font-medium">{c.startTime} - {c.endTime}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEdit(c)} className="text-[#003366] border border-[#003366] px-3 py-1 rounded text-xs font-bold hover:bg-[#003366] hover:text-white transition-all">Điều chỉnh</button>
                  <button onClick={() => { if(window.confirm('Xóa lớp này?')) remove(ref(db, `classes/${c.id}`)); }} className="text-red-500 hover:text-red-700 text-xs font-bold px-2">Xóa</button>
                </td>
              </tr>
            ))}
            {filteredClasses.length === 0 && <tr><td colSpan="6" className="p-6 text-center text-gray-400 italic">Không tìm thấy lớp học nào.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default DataManager;