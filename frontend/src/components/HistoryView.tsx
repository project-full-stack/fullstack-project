import React, { useState, useEffect } from 'react';
import { Language, Resource } from '../types';

interface HistoryViewProps {
  lang: Language;
  apiUrl: string;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ lang, apiUrl }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, resourcesRes] = await Promise.all([
          fetch(`${apiUrl}/bookings`),
          fetch(`${apiUrl}/resources`)
        ]);
        const bookingsData = await bookingsRes.json();
        const resourcesData = await resourcesRes.json();

        if (Array.isArray(bookingsData)) setBookings(bookingsData);
        if (Array.isArray(resourcesData)) setResources(resourcesData);
      } catch (err) {
        console.error('Error fetching history data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  const getResourceDetails = (resourceId: string | number) => {
    return resources.find((r) => String(r.id) === String(resourceId));
  };

  const isRoomExpired = (booking: any, resource: Resource | undefined) => {
    if (!resource || resource.type !== 'room') return false;
    
    const bookingDateStr = booking.bookingDate || booking.date;
    if (!bookingDateStr) return false;

    const bookingDate = new Date(bookingDateStr);
    const now = new Date();

    return bookingDate < now;
  };

  const returnedEquipmentBookings = bookings.filter((b) => {
    const res = getResourceDetails(b.resourceId);
    return res && res.type === 'equipment' && b.status === 'returned';
  });

  const expiredRoomBookings = bookings.filter((b) => {
    const res = getResourceDetails(b.resourceId);
    return res && res.type === 'room' && (b.status === 'approved' || b.status === 'returned') && isRoomExpired(b, res);
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-400 text-sm">
        กำลังโหลดข้อมูลประวัติการใช้งาน...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      {/* ส่วนที่ 1: ประวัติการคืนอุปกรณ์ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            ประวัติการคืนอุปกรณ์
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
            {returnedEquipmentBookings.length} รายการ
          </span>
        </div>

        {returnedEquipmentBookings.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            ยังไม่มีประวัติการคืนอุปกรณ์
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="py-3 px-6">รหัสการจอง</th>
                  <th className="py-3 px-6">ผู้จอง</th>
                  <th className="py-3 px-6">อุปกรณ์</th>
                  <th className="py-3 px-6">วันที่ยืม-คืน</th>
                  <th className="py-3 px-6 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {returnedEquipmentBookings.map((b, idx) => {
                  const res = getResourceDetails(b.resourceId);
                  return (
                    <tr key={b.id || idx} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-6 font-semibold text-slate-500">#{b.id}</td>
                      <td className="py-3 px-6">
                        <div className="font-bold text-slate-800">{b.studentName}</div>
                        <div className="text-slate-400 text-[11px]">{b.studentId}</div>
                      </td>
                      <td className="py-3 px-6 font-medium text-slate-700">
                        {lang === 'th' ? res?.nameTh : res?.nameEn}
                      </td>
                      <td className="py-3 px-6 text-slate-500">
                        {new Date(b.bookingDate || b.date).toLocaleDateString('th-TH')}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold rounded-full text-[11px]">
                          คืนแล้ว
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ส่วนที่ 2: ประวัติการใช้ห้อง (หมดเวลาใช้งาน) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            ประวัติการใช้ห้องที่ผ่านมา
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            {expiredRoomBookings.length} รายการ
          </span>
        </div>

        {expiredRoomBookings.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            ยังไม่มีประวัติการใช้ห้องที่หมดเวลา
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="py-3 px-6">รหัสการจอง</th>
                  <th className="py-3 px-6">ผู้จอง</th>
                  <th className="py-3 px-6">ห้องประชุม / พื้นที่</th>
                  <th className="py-3 px-6">วันที่ใช้งาน</th>
                  <th className="py-3 px-6 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {expiredRoomBookings.map((b, idx) => {
                  const res = getResourceDetails(b.resourceId);
                  return (
                    <tr key={b.id || idx} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-6 font-semibold text-slate-500">#{b.id}</td>
                      <td className="py-3 px-6">
                        <div className="font-bold text-slate-800">{b.studentName}</div>
                        <div className="text-slate-400 text-[11px]">{b.studentId}</div>
                      </td>
                      <td className="py-3 px-6 font-medium text-slate-700">
                        {lang === 'th' ? res?.nameTh : res?.nameEn}
                      </td>
                      <td className="py-3 px-6 text-slate-500">
                        {new Date(b.bookingDate || b.date).toLocaleDateString('th-TH')}
                        {b.timeSlot && <span className="block text-slate-400 text-[11px]">{b.timeSlot}</span>}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-full text-[11px]">
                          ใช้งานแล้ว (เสร็จสิ้น)
                        </span>
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