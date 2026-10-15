import React, { useState, useEffect } from 'react';
import { Language, Resource } from '../types';

interface TrackingDashboardProps {
  lang: Language;
  apiUrl: string;
}

export const TrackingDashboard: React.FC<TrackingDashboardProps> = ({ lang, apiUrl }) => {
  const [subTab, setSubTab] = useState<'rooms' | 'equipment'>('rooms');
  const [bookings, setBookings] = useState<any[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resBookings, resResources] = await Promise.all([
        fetch(`${apiUrl}/bookings`).then((r) => r.json()),
        fetch(`${apiUrl}/resources`).then((r) => r.json()),
      ]);

      if (Array.isArray(resBookings)) setBookings(resBookings);
      if (Array.isArray(resResources)) setResources(resResources);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiUrl]);

  // ฟังก์ชันส่งอีเมลทวงคืน
  const handleSendReminder = async (bookingId: number) => {
    setActionLoadingId(bookingId);
    try {
      const res = await fetch(`${apiUrl}/bookings/${bookingId}/remind`, {
        method: 'POST',
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert(lang === 'th' ? 'ส่งอีเมลเตือนให้มาคืนเรียบร้อยแล้ว' : 'Reminder email sent successfully.');
      } else {
        alert(result.error || (lang === 'th' ? 'ไม่สามารถส่งอีเมลได้' : 'Failed to send email.'));
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'th' ? 'เกิดข้อผิดพลาดในการเชื่อมต่อ' : 'Connection error.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const resourceMap = new Map(resources.map((r) => [r.id, r]));

  const activeBookings = bookings.filter(
    (b) => b.status === 'approved' || b.status === 'borrowed'
  );

  const roomBookings = activeBookings.filter((b) => {
    const res = resourceMap.get(b.resourceId);
    return res?.type === 'room';
  });

  const equipmentBookings = activeBookings.filter((b) => {
    const res = resourceMap.get(b.resourceId);
    return res?.type === 'equipment';
  });

  const currentList = subTab === 'rooms' ? roomBookings : equipmentBookings;

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-10">
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-[#1A237E]">
              {lang === 'th' ? 'ติดตามการยืม-คืน และการใช้งาน' : 'Borrowing & Usage Tracking'}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'th' 
                ? 'ตรวจสอบรายการใช้ห้องและอุปกรณ์ที่ได้รับการอนุมัติหรือกำลังใช้งานอยู่' 
                : 'Monitor active room reservations and borrowed equipment.'}
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setSubTab('rooms')}
              className={`px-5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                subTab === 'rooms'
                  ? 'bg-[#1A237E] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'th' ? 'รายการใช้ห้อง' : 'Room Usage'} ({roomBookings.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('equipment')}
              className={`px-5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                subTab === 'equipment'
                  ? 'bg-[#1A237E] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'th' ? 'รายการยืมอุปกรณ์' : 'Equipment Borrowing'} ({equipmentBookings.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            {lang === 'th' ? 'กำลังโหลดข้อมูล...' : 'Loading tracking data...'}
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            {lang === 'th' ? 'ไม่มีรายการในขณะนี้' : 'No active items found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">{lang === 'th' ? 'ผู้จอง / รหัสนักศึกษา' : 'User / Student ID'}</th>
                  <th className="py-3 px-4">{lang === 'th' ? 'ชื่อทรัพยากร' : 'Resource Name'}</th>
                  <th className="py-3 px-4">{lang === 'th' ? 'วันที่ / เวลาใช้งาน' : 'Date & Time'}</th>
                  <th className="py-3 px-4">{lang === 'th' ? 'สถานะ' : 'Status'}</th>
                  {subTab === 'equipment' && (
                    <th className="py-3 px-4 text-center">{lang === 'th' ? 'จัดการ' : 'Action'}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {currentList.map((b) => {
                  const resource = resourceMap.get(b.resourceId);
                  const resName = resource ? (lang === 'th' ? resource.nameTh : resource.nameEn) : 'Unknown';
                  const startDate = new Date(b.bookingDate);
                  
                  const dateStr = startDate.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  const startTimeStr = startDate.toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  });

                  const isEquipment = resource?.type === 'equipment';

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-500">#{b.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{b.studentName}</div>
                        <div className="text-slate-400 text-[11px]">{b.studentId}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1A237E]">{resName}</td>
                      <td className="py-3.5 px-4">
                        <div>{dateStr}</div>
                        <div className="text-slate-400 text-[11px]">
                          {isEquipment ? (
                            b.borrowDays 
                              ? (lang === 'th' ? `ยืมจำนวน ${b.borrowDays} วัน` : `Borrow for ${b.borrowDays} days`)
                              : (lang === 'th' ? 'รอรับอุปกรณ์' : 'Ready for pickup')
                          ) : (
                            lang === 'th' 
                              ? `เวลา ${startTimeStr} - ${b.endTime} น.` 
                              : `${startTimeStr} - ${b.endTime}`
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-3 py-1 rounded-full font-semibold inline-block text-[11px] uppercase ${
                          b.status === 'borrowed' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {lang === 'th' 
                            ? (b.status === 'borrowed' ? 'กำลังยืม' : 'อนุมัติแล้ว') 
                            : b.status}
                        </span>
                      </td>
                      {subTab === 'equipment' && (
                        <td className="py-3.5 px-4 text-center">
                          {b.status === 'borrowed' ? (
                            <button
                              type="button"
                              disabled={actionLoadingId === b.id}
                              onClick={() => handleSendReminder(b.id)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-semibold text-[11px] transition cursor-pointer border border-rose-200 disabled:opacity-50"
                            >
                              {actionLoadingId === b.id 
                                ? (lang === 'th' ? 'กำลังส่ง...' : 'Sending...') 
                                : (lang === 'th' ? '✉️ ส่งเมลทวงคืน' : 'Send Reminder')}
                            </button>
                          ) : (
                            <span className="text-slate-300 text-[11px]">-</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};