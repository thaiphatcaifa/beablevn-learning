import React from 'react';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { userData } = useAuth();
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold text-blue-800">Xin chào, {userData?.name || 'Học viên'}!</h2>
        <p className="text-gray-600">Mã học viên: {userData?.studentCode || 'Đang cập nhật'}</p>
      </div>
      <div className="bg-blue-50 p-4 rounded border border-blue-200">
        <h3 className="font-bold text-blue-900">Lịch học hôm nay</h3>
        <p className="text-sm text-blue-700">Chưa có lịch học.</p>
      </div>
    </div>
  );
};
export default StudentDashboard;