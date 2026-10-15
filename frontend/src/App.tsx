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

export default function App() {
  const API_URL = 'http://localhost:8000';
  
  const [lang, setLang] = useState<Language>(() => {
    const savedLang = localStorage.getItem('app_lang');
    return (savedLang === 'en' || savedLang === 'th') ? savedLang : 'th';
  });

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const [filter, setFilter] = useState<string>('');
  
  const [activeTab, setActiveTab] = useState<'resources' | 'myBookings' | 'admin' | 'tracking'>(() => {
    const savedTab = localStorage.getItem('app_activeTab');
    return (savedTab === 'resources' || savedTab === 'myBookings' || savedTab === 'admin' || savedTab === 'tracking') ? savedTab : 'resources';
  });

  useEffect(() => {
    localStorage.setItem('app_activeTab', activeTab);
  }, [activeTab]);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('app_isAdminLoggedIn') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('app_isAdminLoggedIn', String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);

  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedQRResource, setSelectedQRResource] = useState<Resource | null>(null);

  const t = i18n[lang];

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setIsOnline(data.ok))
      .catch(() => setIsOnline(false));
  }, []);

  // ✅ ตรวจสอบ URL พารามิเตอร์เมื่อมีการสแกน QR Code เข้ามา พร้อมรับค่าจำนวนวัน (days) และอัปเดตอัตโนมัติ
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
  }, []);

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

  useEffect(() => {
    if (activeTab === 'resources') {
      fetchResources();
      fetchBookings();
    }
  }, [filter, activeTab]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
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

      {activeTab === 'resources' ? (
        <>
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
                      {...(!isAdminLoggedIn && { onBookClick: (res) => setSelectedResource(res) })}
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

      {/* Modal จองสำหรับผู้ใช้ทั่วไป */}
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

      {/* Modal QR Code สำหรับแอดมินกดรับ/คืนอุปกรณ์ */}
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