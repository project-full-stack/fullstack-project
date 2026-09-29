import React, { useState, useEffect } from 'react';
import { Resource, Language } from './types';
import { i18n } from './data/i18n';

export default function App() {
  const API_URL = 'http://localhost:8000';
  
  // States
  const [lang, setLang] = useState<Language>('th');
  const [filter, setFilter] = useState<string>('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // States สำหรับการจอง (Booking Modal)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const t = i18n[lang];

  // 1. เช็กสถานะ Backend / Health Check
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setIsOnline(data.ok))
      .catch(() => setIsOnline(false));
  }, []);

  // 2. ดึงข้อมูลทรัพยากร (ห้อง / อุปกรณ์)
  useEffect(() => {
    setLoading(true);
    const url = filter ? `${API_URL}/resources?type=${filter}` : `${API_URL}/resources`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setResources(data);
        setLoading(false);
      })
      .catch(() => {
        setResources([]);
        setLoading(false);
      });
  }, [filter]);

  // 3. ฟังก์ชันส่งข้อมูลจองไปที่ Backend
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: selectedResource.id,
          studentName,
          studentId,
          bookingDate: bookingDate ? new Date(bookingDate).toISOString() : new Date().toISOString(),
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert(lang === 'th' ? 'จองสำเร็จเรียบร้อย!' : 'Booking successful!');
        setSelectedResource(null); // ปิด Modal
        setStudentName('');
        setStudentId('');
        setBookingDate('');
      } else {
        alert((lang === 'th' ? 'การจองไม่สำเร็จ: ' : 'Booking failed: ') + (result.error || 'กรุณาลองใหม่อีกครั้ง'));
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'th' ? 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' : 'Server connection error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-linear-to-r from-purple-900 to-purple-600 text-white px-10 py-5 flex justify-between items-center shadow-lg">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          {t.title}
        </h2>
        <div className="flex items-center gap-4">
          <span className={`px-4 py-1.5 rounded-full text-sm font-medium shadow-sm ${
            isOnline === null 
              ? 'bg-slate-200 text-slate-600' 
              : isOnline 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isOnline === null ? t.loading : isOnline ? t.online : t.offline}
          </span>
          
          {/* Lang Toggle */}
          <div className="bg-white/20 p-1 rounded-full flex gap-1">
            <button 
              onClick={() => setLang('th')} 
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${lang === 'th' ? 'bg-white text-purple-900 shadow' : 'text-white'}`}
            >
              TH
            </button>
            <button 
              onClick={() => setLang('en')} 
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${lang === 'en' ? 'bg-white text-purple-900 shadow' : 'text-white'}`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Filter Controls */}
      <div className="bg-white px-10 py-4 border-b border-slate-200 flex gap-3 shadow-sm">
        <button 
          onClick={() => setFilter('')} 
          className={`px-6 py-2 rounded-full border-2 font-medium transition ${filter === '' ? 'bg-purple-600 border-purple-600 text-white shadow-md' : 'border-slate-200 text-slate-600 hover:border-purple-400'}`}
        >
          {t.btnAll}
        </button>
        <button 
          onClick={() => setFilter('room')} 
          className={`px-6 py-2 rounded-full border-2 font-medium transition ${filter === 'room' ? 'bg-purple-600 border-purple-600 text-white shadow-md' : 'border-slate-200 text-slate-600 hover:border-purple-400'}`}
        >
          {t.btnRoom}
        </button>
        <button 
          onClick={() => setFilter('equipment')} 
          className={`px-6 py-2 rounded-full border-2 font-medium transition ${filter === 'equipment' ? 'bg-purple-600 border-purple-600 text-white shadow-md' : 'border-slate-200 text-slate-600 hover:border-purple-400'}`}
        >
          {t.btnEquip}
        </button>
      </div>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto p-10">
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm text-slate-500 text-lg">
            {t.loading}
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm text-slate-500 text-lg">
            {t.empty}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {resources.map((item) => {
              const isRoom = item.type?.toLowerCase() === 'room';
              const icon = isRoom ? '🚪' : '💻';
              const displayType = isRoom ? t.room : t.equipment;

              return (
                <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden hover:shadow-lg transition transform hover:-translate-y-1 flex flex-col justify-between">
                  <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-purple-800 to-purple-400"></div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 flex items-center gap-2">
                      {icon} {item.name || `Resource #${item.id}`}
                    </h3>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">{t.type}:</span>
                        <span className="text-slate-700 font-semibold capitalize">{displayType}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">{t.status}:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.isActive ? t.available : t.unavailable}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ปุ่มกดจองใช้งาน */}
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs text-slate-400">ID: {item.id}</span>
                    <button
                      onClick={() => setSelectedResource(item)}
                      disabled={!item.isActive}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold shadow transition ${
                        item.isActive 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {lang === 'th' ? 'จองใช้งาน' : 'Book Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal ฟอร์มกรอกข้อมูลการจอง */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <h3 className="text-lg font-bold mb-2 text-purple-900">
              {lang === 'th' ? 'ยืนยันการจอง: ' : 'Confirm Booking: '} {selectedResource.name}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {lang === 'th' ? 'กรุณากรอกข้อมูลของคุณเพื่อดำเนินการจอง' : 'Please enter your details to proceed.'}
            </p>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {lang === 'th' ? 'ชื่อ-นามสกุล' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="เช่น Papop"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {lang === 'th' ? 'รหัสนักศึกษา' : 'Student ID'}
                </label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="เช่น 660615026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {lang === 'th' ? 'วันที่และเวลาที่ต้องการจอง' : 'Booking Date & Time'}
                </label>
                <input
                  type="datetime-local"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedResource(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow transition"
                >
                  {submitting ? (lang === 'th' ? 'กำลังบันทึก...' : 'Submitting...') : (lang === 'th' ? 'ยืนยันการจอง' : 'Confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}