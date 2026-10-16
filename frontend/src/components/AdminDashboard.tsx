import React, { useEffect, useState } from 'react';
import { Language, Resource } from '../types';

interface BookingItem {
  id: number;
  resourceId: number;
  resourceType?: string;
  resourceNameTh?: string;
  resourceNameEn?: string;
  studentName: string;
  studentId: string;
  status: string;
  bookingDate: string;
  endTime: string;
  createdAt: string;
}

interface AdminDashboardProps {
  lang: Language;
  apiUrl: string;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang, apiUrl }) => {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, resourcesRes] = await Promise.all([
        fetch(`${apiUrl}/bookings`),
        fetch(`${apiUrl}/resources`)
      ]);
      const bookingsData = await bookingsRes.json();
      const resourcesData = await resourcesRes.json();

      if (Array.isArray(bookingsData)) setBookings(bookingsData);
      if (Array.isArray(resourcesData)) setResources(resourcesData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiUrl]);

  const handleUpdateStatus = async (id: number, newStatus: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`${apiUrl}/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
      } else {
        alert(result.error || 'ไม่สามารถอัปเดตสถานะได้');
      }
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  const getResourceDetails = (resourceId: number | string) => {
    return resources.find((r) => String(r.id) === String(resourceId));
  };

  // เช็กว่าห้องหมดเวลาใช้งานไปแล้วหรือยัง
  const isRoomExpired = (booking: BookingItem, resource: Resource | undefined) => {
    if (!resource || resource.type !== 'room') return false;
    const bookingDateStr = booking.bookingDate;
    if (!bookingDateStr) return false;

    const bookingDate = new Date(bookingDateStr);
    const now = new Date();
    return bookingDate < now;
  };

  // ✅ กรองซ่อนรายการที่คืนแล้ว (returned) หรือห้องที่หมดเวลาแล้ว ออกจากหน้าจัดการหลัก
  const activeDashboardBookings = bookings.filter((b) => {
    const res = getResourceDetails(b.resourceId);
    
    // ถ้าอุปกรณ์คืนแล้ว ซ่อนทันที
    if (res && res.type === 'equipment' && b.status === 'returned') {
      return false;
    }
    
    // ถ้าเป็นห้อง และผ่านเวลาใช้งานไปแล้ว ซ่อนทันที
    if (res && res.type === 'room' && (b.status === 'approved' || b.status === 'returned') && isRoomExpired(b, res)) {
      return false;
    }

    return true;
  });

  const filteredBookings = activeDashboardBookings.filter(b => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* แถบกรองสถานะ */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', th: 'ทั้งหมด' },
          { key: 'pending', th: 'รออนุมัติ' },
          { key: 'approved', th: 'อนุมัติแล้ว' },
          { key: 'rejected', th: 'ปฏิเสธ' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilterStatus(item.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition cursor-pointer ${
              filterStatus === item.key
                ? 'bg-[#1A237E] text-white shadow'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {item.th}
          </button>
        ))}
      </div>

      {/* ตารางแสดงรายการจอง */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            กำลังโหลดข้อมูล...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            ไม่พบรายการจองในสถานะนี้
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">ID</th>
                  <th className="p-4">ผู้จอง / รหัสนักศึกษา</th>
                  <th className="p-4">ชื่อทรัพยากร</th>
                  <th className="p-4">วันที่และเวลา</th>
                  <th className="p-4">สถานะ</th>
                  <th className="p-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBookings.map((b) => {
                  const dateObj = new Date(b.bookingDate);
                  const dateStr = dateObj.toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  const res = getResourceDetails(b.resourceId);
                  const isEquipment = res?.type === 'equipment' || b.endTime === 'Pickup at Counter';

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-semibold text-slate-700">#{b.id}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{b.studentName}</div>
                        <div className="text-xs text-slate-400">{b.studentId}</div>
                      </td>
                      <td className="p-4 text-slate-700 font-semibold">
                        {res ? res.nameTh : `ทรัพยากร #${b.resourceId}`}
                      </td>
                      <td className="p-4 text-slate-600">
                        <div>{dateStr}</div>
                        {!isEquipment && (
                          <div className="text-xs text-slate-400">
                            เวลา {dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })} น. - {b.endTime} น.
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          b.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          b.status === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {b.status === 'approved' && 'อนุมัติแล้ว'}
                          {b.status === 'rejected' && 'ปฏิเสธ'}
                          {b.status === 'pending' && 'รออนุมัติ'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {b.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'approved')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
                            >
                              อนุมัติ
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'rejected')}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
                            >
                              ปฏิเสธ
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            {b.status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};