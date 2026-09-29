import React, { useState } from 'react';
import { Language } from '../types';

interface MyBookingsProps {
  lang: Language;
  apiUrl: string;
}

interface BookingItem {
  id: number;
  resourceName: string;
  resourceType: string;
  studentName: string;
  studentId: string;
  status: string;
  bookingDate: string;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ lang, apiUrl }) => {
  const [searchId, setSearchId] = useState('');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/bookings/student/${searchId.trim()}`);
      const data = await response.json();
      if (response.ok) {
        setBookings(data);
        setSearched(true);
      } else {
        alert(lang === 'th' ? 'ไม่สามารถดึงข้อมูลประวัติการจองได้' : 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'th' ? 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' : 'Server connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          {lang === 'th' ? '🔍 ค้นหาประวัติการจองของฉัน' : '🔍 Search My Bookings'}
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          {lang === 'th' ? 'กรอกรหัสนักศึกษาของคุณเพื่อตรวจสอบรายการที่เคยจองไว้' : 'Enter your student ID to check your booking history.'}
        </p>

        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            placeholder={lang === 'th' ? 'กรอกรหัสนักศึกษา เช่น 660615026' : 'Enter Student ID e.g. 660615026'}
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-medium transition-colors shadow-sm text-sm"
          >
            {loading ? (lang === 'th' ? 'กำลังค้นหา...' : 'Searching...') : (lang === 'th' ? 'ค้นหา' : 'Search')}
          </button>
        </form>
      </div>

      {searched && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {lang === 'th' ? `📋 ผลการค้นหาสำหรับรหัส: ${searchId}` : `📋 Search results for ID: ${searchId}`}
          </h3>
          
          {bookings.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              {lang === 'th' ? 'ไม่พบประวัติการจองสำหรับรหัสนักศึกษานี้' : 'No bookings found for this student ID.'}
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{item.resourceName}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === 'th' ? 'ผู้จอง:' : 'Booked by:'} <span className="font-medium text-slate-700">{item.studentName}</span> | {lang === 'th' ? 'เวลาใช้งาน:' : 'Time:'} <span className="font-medium text-slate-700">{new Date(item.bookingDate).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US')}</span>
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
                    {lang === 'th' ? 'สถานะ: ' : 'Status: '}{item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};