import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, push, onValue, remove, update } from "firebase/database";

const DataManager = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [formData, setFormData] = useState({ name: '', room: '', subject: '', schedule: '', startTime: '', endTime: '' });
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ room: '', schedule: '' });

  useEffect(() => {
    onValue(ref(db, 'classes'), (snapshot) => {
      const data = snapshot.val();
      let list = data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : [];
      list.sort((a, b) => a.name.localeCompare(b.name));
      setClasses(list);
      setFilteredClasses(list);
    });
  }, []);

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
      alert("Đã cập nhật!");
    } else {
      push(ref(db, 'classes'), formData);
      alert("Đã thêm mới!");
    }
    setFormData({ name: '', room: '', subject: '', schedule: '', startTime: '', endTime: '' });
  };

  const handleEdit = (cls) => {
    setEditingId(cls.id);
    setFormData({ name: cls.name, room: cls.room, subject: cls.subject, schedule: cls.schedule, startTime: cls.startTime || '', endTime: cls.endTime || '' });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#003366" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
        <h2 className="text-lg font-bold text-[#003366]">Dữ liệu Lớp học</h2>
      </div>
      
      <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 mb-6">
        <h3 className="font-bold text-[#003366] text-xs uppercase mb-3 tracking-wide">{editingId ? "Chỉnh sửa thông tin" : "Tạo lớp mới"}</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <input className="border border-slate-200 p-2.5 rounded-lg text-sm focus:border-[#003366] outline-none" placeholder="Tên lớp" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input className="border border-slate-200 p-2.5 rounded-lg text-sm focus:border-[#003366] outline-none" placeholder="Phòng" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} />
          <input className="border border-slate-200 p-2.5 rounded-lg text-sm focus:border-[#003366] outline-none md:col-span-2" placeholder="Môn học" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
          <input className="border border-slate-200 p-2.5 rounded-lg text-sm focus:border-[#003366] outline-none" placeholder="Lịch (T2-T4)" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} />
          <div className="flex gap-1 md:col-span-1">
             <input type="time" className="border border-slate-200 p-2 rounded-lg text-xs w-1/2 focus:border-[#003366] outline-none" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
             <input type="time" className="border border-slate-200 p-2 rounded-lg text-xs w-1/2 focus:border-[#003366] outline-none" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
           {editingId && <button onClick={() => { setEditingId(null); setFormData({ name: '', room: '', subject: '', schedule: '', startTime: '', endTime: '' }); }} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all">Hủy</button>}
           <button onClick={handleSubmit} className="px-5 py-2 bg-[#003366] text-white rounded-lg text-sm font-bold hover:bg-[#002244] shadow-sm transition-all">{editingId ? "Lưu thay đổi" : "Thêm lớp"}</button>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <input className="border border-slate-200 p-2.5 rounded-lg text-sm w-40 focus:border-[#003366] outline-none" placeholder="Lọc theo Phòng..." value={filters.room} onChange={e => setFilters({...filters, room: e.target.value})} />
        <input className="border border-slate-200 p-2.5 rounded-lg text-sm w-40 focus:border-[#003366] outline-none" placeholder="Lọc theo Lịch..." value={filters.schedule} onChange={e => setFilters({...filters, schedule: e.target.value})} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 text-xs uppercase">
            <tr>
              <th className="p-4">Tên lớp</th>
              <th className="p-4">Phòng</th>
              <th className="p-4">Môn học</th>
              <th className="p-4">Lịch</th>
              <th className="p-4">Giờ</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClasses.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-[#003366]">{c.name}</td>
                <td className="p-4">{c.room}</td>
                <td className="p-4 text-slate-600">{c.subject}</td>
                <td className="p-4"><span className="text-[10px] font-bold bg-blue-50 text-[#003366] px-2 py-1 rounded border border-blue-100">{c.schedule}</span></td>
                <td className="p-4 text-xs text-slate-500">{c.startTime} - {c.endTime}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEdit(c)} className="text-[#003366] text-xs font-bold border border-[#003366] px-3 py-1 rounded-lg hover:bg-[#003366] hover:text-white transition-all">Sửa</button>
                  <button onClick={() => { if(window.confirm('Xóa lớp này?')) remove(ref(db, `classes/${c.id}`)); }} className="text-red-500 text-xs font-bold hover:underline px-2">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default DataManager;