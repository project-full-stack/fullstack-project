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

  // 📥 ฟังก์ชันดึงข้อมูลการจองและทรัพยากรทั้งหมด
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

  // 🔄 ฟังก์ชันอัปเดตสถานะการจอง (อนุมัติ / ปฏิเสธ)
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
        alert(result.error || (lang === 'th' ? 'ไม่สามารถอัปเดตสถานะได้' : 'Failed to update status'));
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'th' ? 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' : 'Server connection error');
    }
  };

  // 🔍 ค้นหารายละเอียดทรัพยากรตาม ID
  const getResourceDetails = (resourceId: number | string) => {
    return resources.find((r) => String(r.id) === String(resourceId));
  };

  // ⏳ ตรวจสอบว่าห้องที่จองหมดเวลาใช้งานไปแล้วหรือยัง
  const isRoomExpired = (booking: BookingItem, resource: Resource | undefined) => {
    if (!resource || resource.type !== 'room') return false;
    const bookingDateStr = booking.bookingDate;
    if (!bookingDateStr) return false;

    const bookingDate = new Date(bookingDateStr);
    const now = new Date();
    return bookingDate < now;
  };

  // 🛡️ กรองซ่อนรายการที่คืนแล้ว (returned) หรือห้องที่หมดเวลาแล้ว ออกจากหน้าจัดการหลัก
  const activeDashboardBookings = bookings.filter((b) => {
    const res = getResourceDetails(b.resourceId);
    
    if (res && res.type === 'equipment' && b.status === 'returned') {
      return false;
    }
    
    if (res && res.type === 'room' && (b.status === 'approved' || b.status === 'returned') && isRoomExpired(b, res)) {
      return false;
    }

    return true;
  });

  // 🏷️ กรองรายการตามสถานะที่เลือกบนแถบ Filter
  const filteredBookings = activeDashboardBookings.filter(b => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* 🎛️ แถบปุ่มกรองสถานะการจอง (All, Pending, Approved, Rejected) */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', th: 'ทั้งหมด', en: 'All' },
          { key: 'pending', th: 'รออนุมัติ', en: 'Pending' },
          { key: 'approved', th: 'อนุมัติแล้ว', en: 'Approved' },
          { key: 'rejected', th: 'ปฏิเสธ', en: 'Rejected' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilterStatus(item.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition cursor-pointer ${
              filterStatus === item.key
                ? 'bg-[#1A237E] text-white shadow'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {lang === 'th' ? item.th : item.en}
          </button>
        ))}
      </div>

      {/* 📋 ตารางแสดงรายการจองสำหรับผู้ดูแลระบบ */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            {lang === 'th' ? 'กำลังโหลดข้อมูล...' : 'Loading bookings...'}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            {lang === 'th' ? 'ไม่พบรายการจองในสถานะนี้' : 'No bookings found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">ID</th>
                  <th className="p-4">{lang === 'th' ? 'ผู้จอง / รหัสนักศึกษา' : 'User / Student ID'}</th>
                  <th className="p-4">{lang === 'th' ? 'ชื่อทรัพยากร' : 'Resource Name'}</th>
                  <th className="p-4">{lang === 'th' ? 'วันที่และเวลา' : 'Date & Time'}</th>
                  <th className="p-4">{lang === 'th' ? 'สถานะ' : 'Status'}</th>
                  <th className="p-4 text-center">{lang === 'th' ? 'จัดการ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBookings.map((b) => {
                  const dateObj = new Date(b.bookingDate);
                  const dateStr = dateObj.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
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
                        {res ? (lang === 'th' ? res.nameTh : res.nameEn) : `Resource #${b.resourceId}`}
                      </td>
                      <td className="p-4 text-slate-600">
                        {b.status === 'pending' ? (
                          <div>
                            <div className="font-medium text-slate-500 text-xs">
                              {lang === 'th' ? 'กดจองเมื่อ: ' : 'Booked at: '} 
                              {b.createdAt ? new Date(b.createdAt).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: lang === 'en',
                              }) : '-'} {lang === 'th' && 'น.'}
                            </div>
                            <div className="text-slate-400 mt-0.5 text-xs">
                              {lang === 'th' ? (
                                <>ใช้งาน: {dateStr} (เวลา {dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })} น. - {b.endTime} น.)</>
                              ) : (
                                (() => {
                                  const startTimeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                  const [endH, endM] = b.endTime.split(':').map(Number);
                                  const endHour12 = endH % 12 === 0 ? 12 : endH % 12;
                                  const endAmPm = endH >= 12 ? 'PM' : 'AM';
                                  const formattedEndTime = `${String(endHour12).padStart(2, '0')}:${String(endM).padStart(2, '0')} ${endAmPm}`;
                                  return <>Usage: {dateStr} ({startTimeStr} - {formattedEndTime})</>;
                                })()
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div>{dateStr}</div>
                            {!isEquipment && (
                              <div className="text-xs text-slate-400">
                                {lang === 'th' ? (
                                  <>เวลา {dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })} น. - {b.endTime} น.</>
                                ) : (
                                  (() => {
                                    const startTimeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                    const [endH, endM] = b.endTime.split(':').map(Number);
                                    const endHour12 = endH % 12 === 0 ? 12 : endH % 12;
                                    const endAmPm = endH >= 12 ? 'PM' : 'AM';
                                    const formattedEndTime = `${String(endHour12).padStart(2, '0')}:${String(endM).padStart(2, '0')} ${endAmPm}`;
                                    return <>Time {startTimeStr} - {formattedEndTime}</>;
                                  })()
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          b.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          b.status === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {b.status === 'approved' && (lang === 'th' ? 'อนุมัติแล้ว' : 'Approved')}
                          {b.status === 'rejected' && (lang === 'th' ? 'ปฏิเสธ' : 'Rejected')}
                          {b.status === 'pending' && (lang === 'th' ? 'รออนุมัติ' : 'Pending')}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {b.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(b.id, 'approved')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
                            >
                              {lang === 'th' ? 'อนุมัติ' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(b.id, 'rejected')}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
                            >
                              {lang === 'th' ? 'ปฏิเสธ' : 'Reject'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            {b.status === 'approved' 
                              ? (lang === 'th' ? 'อนุมัติแล้ว' : 'Approved') 
                              : (lang === 'th' ? 'ปฏิเสธแล้ว' : 'Rejected')}
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