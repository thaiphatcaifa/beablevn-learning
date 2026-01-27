import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, push, onValue, remove } from "firebase/database";

const DataManager = () => {
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({ name: '', room: '' });

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'classes'), (snapshot) => {
      const data = snapshot.val();
      setClasses(data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : []);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = () => {
    if (!newClass.name) return;
    push(ref(db, 'classes'), newClass);
    setNewClass({ name: '', room: '' });
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Cấu trúc Dữ liệu (Lớp học)</h2>
      <div className="flex gap-2 mb-6">
        <input className="border p-2 rounded w-1/3" placeholder="Tên lớp (VD: Giao tiếp K1)" value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} />
        <input className="border p-2 rounded w-1/4" placeholder="Phòng" value={newClass.room} onChange={e => setNewClass({...newClass, room: e.target.value})} />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 rounded">Thêm</button>
      </div>
      <ul className="divide-y">
        {classes.map(c => (
          <li key={c.id} className="py-2 flex justify-between">
            <span><b>{c.name}</b> - Phòng {c.room}</span>
            <button onClick={() => remove(ref(db, `classes/${c.id}`))} className="text-red-500 text-sm">Xóa</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default DataManager;