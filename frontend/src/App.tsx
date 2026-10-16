import React, { useState, useEffect } from 'react';
import { Resource, Language } from './types';
import { i18n } from './data/i18n';
import { Navbar } from './components/Navbar';
import { ResourceCard } from './components/ResourceCard';
import { BookingModal } from './components/BookingModal';
import { QRCodeModal } from './components/QRCodeModal';
import { MyBookings } from './components/MyBookings';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { TrackingDashboard } from './components/TrackingDashboard'; 
import { HistoryView } from './components/HistoryView';

export default function App() {
  // 🔗 API Endpoint สำหรับกลุ่ม 3: ปรับให้วิ่งตรงไปที่พอร์ต Backend ของกลุ่ม 3 อัตโนมัติ (เช่น พอร์ต 8003 หรือปรับตามจริง)
  const API_URL = '/api';
  
  // 🌐 จัดการภาษาของแอปพลิเคชัน (รองรับ TH / EN)
  const [lang, setLang] = useState<Language>(() => {
    const savedLang = localStorage.getItem('app_lang');
    return (savedLang === 'en' || savedLang === 'th') ? savedLang : 'th';
  });

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  // 🏷️ ตัวกรองประเภททรัพยากร ('', 'room', 'equipment')
  const [filter, setFilter] = useState<string>('');
  
  // 📑 แท็บการใช้งานปัจจุบัน
  const [activeTab, setActiveTab] = useState<'resources' | 'myBookings' | 'admin' | 'tracking' | 'history'>(() => {
    const savedTab = localStorage.getItem('app_activeTab');
    return (savedTab === 'resources' || savedTab === 'myBookings' || savedTab === 'admin' || savedTab === 'tracking' || savedTab === 'history') ? savedTab : 'resources';
  });

  useEffect(() => {
    localStorage.setItem('app_activeTab', activeTab);
  }, [activeTab]);

  // 🔐 สถานะการเข้าสู่ระบบของแอดมิน
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('app_isAdminLoggedIn') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('app_isAdminLoggedIn', String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);

  // 📦 ข้อมูลทรัพยากรและการจอง
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 🪟 State สำหรับ Modal และ Sidebar แสดงสถานะ
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedQRResource, setSelectedQRResource] = useState<Resource | null>(null);
  const [statusDrawerResource, setStatusDrawerResource] = useState<Resource | null>(null);

  const t = i18n[lang];

  // 🩺 ตรวจสอบสถานะการเชื่อมต่อ Backend (Health Check)
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setIsOnline(data.ok))
      .catch(() => setIsOnline(false));
  }, [API_URL]);

  // ⚡ จัดการ Action พิเศษผ่าน URL Query (เช่น การสแกน QR เพื่อรับอุปกรณ์)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const bookingId = params.get('query') || params.get('bookingId');
    const days = params.get('days') || '3';

    if (action === 'pickup' && bookingId) {
      fetch(`${API_URL}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'borrowed', borrowDays: Number(days) }),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            fetchResources();
            fetchBookings();
            alert(lang === 'th' ? `✓ ยืนยันการยืมอุปกรณ์สำเร็จ (กำหนด ${days} วัน)!` : `✓ Equipment pickup confirmed (${days} days)!`);
          } else {
            alert(result.error || (lang === 'th' ? 'ไม่สามารถอัปเดตสถานะได้' : 'Failed to update status'));
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((err) => {
          console.error(err);
          alert(lang === 'th' ? 'เกิดข้อผิดพลาดในการเชื่อมต่อ' : 'Connection error');
        });
    }
  }, [API_URL, lang]);

  // 📥 ฟังก์ชันดึงข้อมูลทรัพยากรจาก Backend
  const fetchResources = () => {
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
  };

  // 📥 ฟังก์ชันดึงข้อมูลการจองทั้งหมดจาก Backend
  const fetchBookings = () => {
    fetch(`${API_URL}/bookings`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBookings(data);
        }
      })
      .catch((err) => console.error(err));
  };

  // 🔄 โหลดข้อมูลใหม่เมื่อเปลี่ยนแท็บหรือตัวกรอง
  useEffect(() => {
    if (activeTab === 'resources') {
      fetchResources();
      fetchBookings();
    }
  }, [filter, activeTab]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Navbar ด้านบน */}
      <Navbar 
        lang={lang} 
        setLang={setLang} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOnline={isOnline} 
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={() => {
          setIsAdminLoggedIn(false);
          setActiveTab('resources');
        }}
      />

      {/* เนื้อหาหลักตามแท็บที่เลือก */}
      {activeTab === 'resources' ? (
        <>
          {/* แถบตัวกรองประเภททรัพยากร */}
          <div className="bg-white px-6 md:px-10 py-4 border-b border-slate-200 flex gap-3 shadow-xs">
            <button 
              type="button"
              onClick={() => setFilter('')} 
              className={`px-6 py-2 rounded-full border-2 font-medium transition text-sm cursor-pointer ${
                filter === '' 
                  ? 'bg-[#1A237E] border-[#1A237E] text-white shadow-sm' 
                  : 'border-slate-200 text-slate-600 hover:border-[#1A237E]'
              }`}
            >
              {t.btnAll}
            </button>
            <button 
              type="button"
              onClick={() => setFilter('room')} 
              className={`px-6 py-2 rounded-full border-2 font-medium transition text-sm cursor-pointer ${
                filter === 'room' 
                  ? 'bg-[#1A237E] border-[#1A237E] text-white shadow-sm' 
                  : 'border-slate-200 text-slate-600 hover:border-[#1A237E]'
              }`}
            >
              {t.btnRoom}
            </button>
            <button 
              type="button"
              onClick={() => setFilter('equipment')} 
              className={`px-6 py-2 rounded-full border-2 font-medium transition text-sm cursor-pointer ${
                filter === 'equipment' 
                  ? 'bg-[#1A237E] border-[#1A237E] text-white shadow-sm' 
                  : 'border-slate-200 text-slate-600 hover:border-[#1A237E]'
              }`}
            >
              {t.btnEquip}
            </button>
          </div>

          {/* แสดงการ์ดรายการทรัพยากร */}
          <main className="max-w-7xl mx-auto p-6 md:p-10">
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
                  const isBooked = bookings.some(
                    (b) => b.resourceId === item.id && (b.status === 'pending' || b.status === 'approved' || b.status === 'borrowed')
                  );

                  return (
                    <ResourceCard 
                      key={item.id} 
                      resource={item} 
                      lang={lang} 
                      isAdminLoggedIn={isAdminLoggedIn}
                      isBooked={isBooked}
                      onGenerateQR={(res) => setSelectedQRResource(res)}
                      onBookClick={!isAdminLoggedIn ? (res) => setSelectedResource(res) : undefined}
                      onViewStatus={(res) => setStatusDrawerResource(res)}
                    />
                  );
                })}
              </div>
            )}
          </main>
        </>
      ) : activeTab === 'myBookings' ? (
        <MyBookings lang={lang} apiUrl={API_URL} />
      ) : activeTab === 'tracking' ? (
        <TrackingDashboard lang={lang} apiUrl={API_URL} />
      ) : activeTab === 'history' ? (
        <HistoryView lang={lang} apiUrl={API_URL} />
      ) : (
        isAdminLoggedIn ? (
          <AdminDashboard 
            lang={lang} 
            apiUrl={API_URL} 
            onLogout={() => {
              setIsAdminLoggedIn(false);
              setActiveTab('resources');
            }} 
          />
        ) : (
          <AdminLogin 
            lang={lang} 
            apiUrl={API_URL} 
            onLoginSuccess={() => {
              setIsAdminLoggedIn(true);
              setActiveTab('admin');
            }} 
            onBackToUser={() => setActiveTab('resources')} 
          />
        )
      )}

      {/* 📊 Sidebar Drawer สำหรับดูสถานะการจองแบบ Real-time ของแต่ละทรัพยากร */}
      {statusDrawerResource && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300 overflow-hidden">
            
            {/* ส่วนหัว Sidebar */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'th' ? 'สถานะการจอง: ' : 'Booking Status: '}
                  <span className="text-[#1A237E]">{lang === 'th' ? statusDrawerResource.nameTh : statusDrawerResource.nameEn}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'th' ? 'รายการจองทั้งหมดแบบเรียลไทม์' : 'Real-time active bookings'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStatusDrawerResource(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* ส่วนเนื้อหาภายใน */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {bookings.filter(b => String(b.resourceId) === String(statusDrawerResource.id) && b.status !== 'returned' && b.status !== 'rejected').length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  {lang === 'th' ? 'ไม่มีรายการจองค้างในขณะนี้ (ว่าง)' : 'No active bookings currently.'}
                </div>
              ) : (
                bookings
                  .filter(b => String(b.resourceId) === String(statusDrawerResource.id) && b.status !== 'returned' && b.status !== 'rejected')
                  .map((b) => {
                    const dateObj = new Date(b.bookingDate);
                    const dateStr = dateObj.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <div key={b.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-500">#{b.id} - {b.studentName}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            b.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            b.status === 'borrowed' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {b.status === 'approved' && (lang === 'th' ? 'อนุมัติแล้ว' : 'Approved')}
                            {b.status === 'borrowed' && (lang === 'th' ? 'กำลังยืมอยู่' : 'Borrowed')}
                            {b.status === 'pending' && (lang === 'th' ? 'รออนุมัติ' : 'Pending')}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 space-y-0.5">
                          <div>{lang === 'th' ? 'วันที่ใช้งาน: ' : 'Date: '}{dateStr}</div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

          </div>
        </div>
      )}

      {/* Modal ฟอร์มสำหรับผู้ใช้ทั่วไปกดจอง */}
      <BookingModal 
        selectedResource={selectedResource} 
        lang={lang} 
        apiUrl={API_URL} 
        onClose={() => setSelectedResource(null)} 
        onSuccess={() => {
          fetchResources();
          fetchBookings();
        }} 
      />

      {/* Modal QR Code สำหรับแอดมิน */}
      <QRCodeModal
        isOpen={!!selectedQRResource}
        onClose={() => setSelectedQRResource(null)}
        resource={selectedQRResource}
        lang={lang}
        apiUrl={API_URL}
        onStatusUpdated={() => {
          fetchResources();
          fetchBookings();
        }}
      />
    </div>
  );
}