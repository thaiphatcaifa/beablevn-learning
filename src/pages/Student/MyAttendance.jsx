import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { ref, onValue } from 'firebase/database';

const MyAttendance = () => {
  const { currentUser } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // 1. Lấy dữ liệu classes để biết tên lớp
    onValue(ref(db, 'classes'), (classSnap) => {
      const classes = classSnap.val() || {};
      
      // 2. Lấy dữ liệu attendance
      onValue(ref(db, 'attendance'), (attSnap) => {
        const attRecord = attSnap.val() || {};
        const result = [];
        
        // Lấy danh sách ID lớp của học viên
        const studentClassIds = Array.isArray(currentUser.classIds) 
            ? currentUser.classIds 
            : Object.values(currentUser.classIds || {});

        // Duyệt qua từng lớp học viên tham gia
        studentClassIds.forEach(classId => {
            const classInfo = classes[classId];
            if (!classInfo) return;

            // Lấy dữ liệu điểm danh của lớp đó
            const classAtt = attRecord[classId] || {};
            
            let totalSessions = 0;
            let presentCount = 0;
            let lateCount = 0;
            let absentCount = 0;
            const history = [];

            // Duyệt qua từng ngày điểm danh
            Object.entries(classAtt).forEach(([date, sessionData]) => {
                // sessionData là object: { studentId: status, ... }
                if (sessionData && sessionData[currentUser.id]) {
                    totalSessions++;
                    const status = sessionData[currentUser.id];
                    
                    if (status === 'present') presentCount++;
                    else if (status === 'late') lateCount++;
                    else absentCount++;

                    history.push({ date, status });
                }
            });

            // Sắp xếp lịch sử theo ngày giảm dần
            history.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Tính % chuyên cần
            const diligence = totalSessions > 0 
                ? Math.round(((presentCount + lateCount * 0.5) / totalSessions) * 100) 
                : 100;

            result.push({
                classId,
                className: classInfo.name,
                diligence,
                totalSessions,
                presentCount,
                lateCount,
                absentCount,
                history
            });
        });

        setAttendanceData(result);
        setLoading(false);
      });
    });
  }, [currentUser]);

  // Helper render badge trạng thái
  const renderStatus = (status) => {
      switch(status) {
          case 'present': return <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">Có mặt</span>;
          case 'late': return <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded">Đi muộn</span>;
          default: return <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded">Vắng</span>;
      }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#003366]">Theo dõi Chuyên cần</h2>
      
      {loading ? <p className="text-slate-400">Đang tải dữ liệu...</p> : (
        attendanceData.length > 0 ? (
            attendanceData.map(item => (
                <div key={item.classId} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Header Lớp */}
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-[#003366]">{item.className}</h3>
                            <p className="text-xs text-slate-500">Tổng số buổi đã học: {item.totalSessions}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-[#003366]">{item.diligence}%</div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Mức độ chuyên cần</p>
                        </div>
                    </div>

                    {/* Chi tiết thống kê */}
                    <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                        <div className="p-3 text-center">
                            <div className="text-green-600 font-bold">{item.presentCount}</div>
                            <div className="text-[10px] text-slate-400">Có mặt</div>
                        </div>
                        <div className="p-3 text-center">
                            <div className="text-yellow-600 font-bold">{item.lateCount}</div>
                            <div className="text-[10px] text-slate-400">Đi muộn</div>
                        </div>
                        <div className="p-3 text-center">
                            <div className="text-red-500 font-bold">{item.absentCount}</div>
                            <div className="text-[10px] text-slate-400">Vắng</div>
                        </div>
                    </div>

                    {/* Lịch sử chi tiết (Cuộn nếu dài) */}
                    <div className="max-h-48 overflow-y-auto p-4">
                        <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Lịch sử điểm danh</p>
                        {item.history.length > 0 ? (
                            <div className="space-y-2">
                                {item.history.map((record, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                        <span className="text-slate-600 font-medium">{record.date}</span>
                                        {renderStatus(record.status)}
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-slate-400 italic">Chưa có dữ liệu điểm danh.</p>}
                    </div>
                </div>
            ))
        ) : <p className="text-slate-500 italic">Bạn chưa tham gia lớp học nào.</p>
      )}
    </div>
  );
};

export default MyAttendance;