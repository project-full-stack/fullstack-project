import React, { useState, useEffect } from 'react';
import { Resource, Language } from './types';
import { i18n } from './data/i18n';
import { Navbar } from './components/Navbar';
import { ResourceCard } from './components/ResourceCard';
import { BookingModal } from './components/BookingModal';
import { MyBookings } from './components/MyBookings';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';

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
  
  const [activeTab, setActiveTab] = useState<'resources' | 'myBookings' | 'admin'>(() => {
    const savedTab = localStorage.getItem('app_activeTab');
    return (savedTab === 'resources' || savedTab === 'myBookings' || savedTab === 'admin') ? savedTab : 'resources';
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
  const [bookings, setBookings] = useState<any[]>([]); // ✅ เพิ่ม state เก็บรายการจองทั้งหมด
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const t = i18n[lang];

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setIsOnline(data.ok))
      .catch(() => setIsOnline(false));
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

  // ✅ ฟังก์ชันดึงข้อมูลการจองทั้งหมดเพื่อนำมาเช็กสถานะอุปกรณ์
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
      fetchBookings(); // ✅ เรียกดึงข้อมูลการจองเมื่ออยู่หน้าทรัพยากร
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
              onClick={() => setFilter('')} 
              className={`px-6 py-2 rounded-full border-2 font-medium transition text-sm ${
                filter === '' 
                  ? 'bg-[#1A237E] border-[#1A237E] text-white shadow-sm' 
                  : 'border-slate-200 text-slate-600 hover:border-[#1A237E]'
              }`}
            >
              {t.btnAll}
            </button>
            <button 
              onClick={() => setFilter('room')} 
              className={`px-6 py-2 rounded-full border-2 font-medium transition text-sm ${
                filter === 'room' 
                  ? 'bg-[#1A237E] border-[#1A237E] text-white shadow-sm' 
                  : 'border-slate-200 text-slate-600 hover:border-[#1A237E]'
              }`}
            >
              {t.btnRoom}
            </button>
            <button 
              onClick={() => setFilter('equipment')} 
              className={`px-6 py-2 rounded-full border-2 font-medium transition text-sm ${
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
                  // ✅ เช็กว่าอุปกรณ์ชิ้นนี้ถูกจองไปแล้วหรือยัง (สถานะเป็น pending หรือ approved)
                  const isBooked = bookings.some(
                    (b) => b.resourceId === item.id && (b.status === 'pending' || b.status === 'approved')
                  );

                  return (
                    <ResourceCard 
                      key={item.id} 
                      resource={item} 
                      lang={lang} 
                      isAdminLoggedIn={isAdminLoggedIn}
                      isBooked={isBooked} // ✅ ส่งค่า isBooked เข้าไปที่การ์ด
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

      <BookingModal 
        selectedResource={selectedResource} 
        lang={lang} 
        apiUrl={API_URL} 
        onClose={() => setSelectedResource(null)} 
        onSuccess={() => {
          fetchResources();
          fetchBookings(); // ✅ โหลดข้อมูลการจองใหม่หลังจองสำเร็จ
        }} 
      />
    </div>
  );
}