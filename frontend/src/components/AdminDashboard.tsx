import React, { useEffect, useState } from 'react';
import { Language } from '../types';

interface BookingItem {
  id: number;
  resourceId: number;
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

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang, apiUrl, onLogout }) => {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/bookings`);
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
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
        // อัปเดต state ในหน้าจอทันที
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
      } else {
        alert(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error(error);
      alert('Error updating status');
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header แดชบอร์ด */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A237E]">
            {lang === 'th' ? '🛠️ ระบบจัดการการจอง (Admin Dashboard)' : '🛠️ Admin Dashboard'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'th' ? 'ตรวจสอบและจัดการสถานะคำขอจองห้องและอุปกรณ์ทั้งหมดในระบบ' : 'Review and manage all resource booking requests'}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-sm font-semibold transition cursor-pointer"
        >
          {lang === 'th' ? 'ออกจากระบบ' : 'Sign Out'}
        </button>
      </div>

      {/* แถบกรองสถานะ */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition cursor-pointer ${
              filterStatus === status
                ? 'bg-[#1A237E] text-white shadow'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {status === 'all' && (lang === 'th' ? 'ทั้งหมด' : 'All')}
            {status === 'pending' && (lang === 'th' ? 'รออนุมัติ (Pending)' : 'Pending')}
            {status === 'approved' && (lang === 'th' ? 'อนุมัติแล้ว (Approved)' : 'Approved')}
            {status === 'rejected' && (lang === 'th' ? 'ปฏิเสธ (Rejected)' : 'Rejected')}
          </button>
        ))}
      </div>

      {/* ตารางแสดงรายการจอง */}
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
                  <th className="p-4">{lang === 'th' ? 'ผู้จอง / รหัสนักศึกษา' : 'Student'}</th>
                  <th className="p-4">{lang === 'th' ? 'รหัสทรัพยากร' : 'Resource ID'}</th>
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

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-semibold text-slate-700">#{b.id}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{b.studentName}</div>
                        <div className="text-xs text-slate-400">{b.studentId}</div>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">Room/Eq ID: {b.resourceId}</td>
                      <td className="p-4 text-slate-600">
                        <div>{dateStr}</div>
                        <div className="text-xs text-slate-400">เวลา {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {b.endTime} น.</div>
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
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'approved')}
                            disabled={b.status === 'approved'}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
                          >
                            {lang === 'th' ? 'อนุมัติ' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'rejected')}
                            disabled={b.status === 'rejected'}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-30 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
                          >
                            {lang === 'th' ? 'ปฏิเสธ' : 'Reject'}
                          </button>
                        </div>
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