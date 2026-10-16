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
  endTime: string; // รองรับเวลาสิ้นสุด
}

export const MyBookings: React.FC<MyBookingsProps> = ({ lang, apiUrl }) => {
  const [searchId, setSearchId] = useState('');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 🔍 ฟังก์ชันค้นหาประวัติการจองด้วยรหัสนักศึกษา
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedId = searchId.trim();

    // ตรวจสอบความยาวรหัสนักศึกษาต้องเป็นตัวเลข 9 หลัก
    if (trimmedId.length !== 9 || !/^\d+$/.test(trimmedId)) {
      setErrorMsg(
        lang === 'th' 
          ? 'โปรดกรอกรหัสนักศึกษาให้ถูกต้อง (ต้องเป็นตัวเลข 9 หลัก)' 
          : 'Please enter a valid Student ID (must be exactly 9 digits)'
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/bookings/student/${trimmedId}`);
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
      
      {/* 📋 กล่องฟอร์มค้นหาประวัติการจอง */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2.5">
          <img src="/images/search.png" alt="Search" className="w-5 h-5 object-contain" />
          {lang === 'th' ? 'ค้นหาประวัติการจองของฉัน' : 'Search My Bookings'}
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          {lang === 'th' ? 'กรอกรหัสนักศึกษาของคุณเพื่อตรวจสอบรายการที่เคยจองไว้' : 'Enter your student ID to check your booking history.'}
        </p>

        <form onSubmit={handleSearch} className="flex flex-col gap-2">
          <div className="flex gap-3">
            <input
              type="text"
              maxLength={9}
              placeholder={lang === 'th' ? 'กรอกรหัสนักศึกษา 9 หลัก เช่น 660610000' : 'Enter 9-digit Student ID e.g. 660610000'}
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A237E] text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#1A237E] hover:bg-[#303F9F] text-white px-6 py-3 rounded-2xl font-medium transition-colors shadow-sm text-sm cursor-pointer"
            >
              {loading ? (lang === 'th' ? 'กำลังค้นหา...' : 'Searching...') : (lang === 'th' ? 'ค้นหา' : 'Search')}
            </button>
          </div>
          
          {/* ข้อความแจ้งเตือน Error เมื่อกรอกรหัสไม่ถูกต้อง */}
          {errorMsg && (
            <p className="text-rose-500 text-xs font-medium mt-1 px-1 flex items-center gap-1.5">
              <img src="/images/warning.png" alt="Warning" className="w-4 h-4 object-contain" />
              {errorMsg}
            </p>
          )}
        </form>
      </div>

      {/* 📊 ส่วนแสดงผลลัพธ์การค้นหา */}
      {searched && !errorMsg && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2.5">
            <img src="/images/results.png" alt="Results" className="w-5 h-5 object-contain" />
            {lang === 'th' ? `ผลการค้นหาสำหรับรหัส: ${searchId}` : `Search results for ID: ${searchId}`}
          </h3>
          
          {bookings.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              {lang === 'th' ? 'ไม่พบประวัติการจองสำหรับรหัสนักศึกษานี้' : 'No bookings found for this student ID.'}
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((item) => {
                const dateObj = new Date(item.bookingDate);
                const dateStr = dateObj.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div key={item.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">{item.resourceName}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {lang === 'th' ? 'ผู้จอง:' : 'Booked by:'} <span className="font-medium text-slate-700">{item.studentName}</span> | {lang === 'th' ? 'วันที่:' : 'Date:'} <span className="font-medium text-slate-700">{dateStr}</span> | {lang === 'th' ? 'เวลาใช้งาน:' : 'Time:'} <span className="font-medium text-slate-700">
                          {lang === 'th' ? (
                            <>เวลา {dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })} น. - {item.endTime} น.</>
                          ) : (
                            (() => {
                              const startTimeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                              const [endH, endM] = item.endTime ? item.endTime.split(':').map(Number) : [0, 0];
                              const endHour12 = endH % 12 === 0 ? 12 : endH % 12;
                              const endAmPm = endH >= 12 ? 'PM' : 'AM';
                              const formattedEndTime = `${String(endHour12).padStart(2, '0')}:${String(endM).padStart(2, '0')} ${endAmPm}`;

                              return <>Time {startTimeStr} - {formattedEndTime}</>;
                            })()
                          )}
                        </span>
                      </p>
                    </div>

                    {/* ป้ายแสดงสถานะการจอง */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      item.status === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                      'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {item.status === 'approved' && (lang === 'th' ? 'อนุมัติแล้ว' : 'Approved')}
                      {item.status === 'rejected' && (lang === 'th' ? 'ปฏิเสธ' : 'Rejected')}
                      {item.status === 'pending' && (lang === 'th' ? 'รออนุมัติ' : 'Pending')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};