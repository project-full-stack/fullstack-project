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
  const [activeTab, setActiveTab] = useState<'resources' | 'myBookings' | 'admin'>('resources');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  const [resources, setResources] = useState<Resource[]>([]);
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

  useEffect(() => {
    if (activeTab === 'resources') {
      fetchResources();
    }
  }, [filter, activeTab]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Navbar Component */}
      <Navbar 
        lang={lang} 
        setLang={setLang} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOnline={isOnline} 
      />

      {activeTab === 'resources' ? (
        <>
          {/* แถบตัวกรองทรัพยากรแบบคลีนๆ ด้านล่าง */}
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

          {/* Main Content Grid */}
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
                {resources.map((item) => (
                  <ResourceCard 
                    key={item.id} 
                    resource={item} 
                    lang={lang} 
                    onBookClick={(res) => setSelectedResource(res)} 
                  />
                ))}
              </div>
            )}
          </main>
        </>
      ) : activeTab === 'myBookings' ? (
        /* MyBookings Component */
        <MyBookings lang={lang} apiUrl={API_URL} />
      ) : (
        /* Admin Section */
        isAdminLoggedIn ? (
          <AdminDashboard 
            lang={lang} 
            apiUrl={API_URL} 
            onLogout={() => setIsAdminLoggedIn(false)} 
          />
        ) : (
          <AdminLogin 
            lang={lang} 
            apiUrl={API_URL} 
            onLoginSuccess={() => setIsAdminLoggedIn(true)} 
            onBackToUser={() => setActiveTab('resources')} 
          />
        )
      )}

      {/* Booking Modal Component */}
      <BookingModal 
        selectedResource={selectedResource} 
        lang={lang} 
        apiUrl={API_URL} 
        onClose={() => setSelectedResource(null)} 
        onSuccess={() => {
          fetchResources();
        }} 
      />
    </div>
  );
}