import React from 'react';
import { Language } from '../types';
import { i18n } from '../data/i18n';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  activeTab: 'resources' | 'myBookings';
  setActiveTab: (tab: 'resources' | 'myBookings') => void;
  isOnline: boolean | null;
}

export const Navbar: React.FC<NavbarProps> = ({ lang, setLang, activeTab, setActiveTab, isOnline }) => {
  const t = i18n[lang];

  return (
    <header className="bg-linear-to-r from-purple-900 to-purple-600 text-white px-6 md:px-10 py-5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg sticky top-0 z-40">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        {t.title}
      </h2>

      {/* เมนูสลับหน้า (Tabs) */}
      <div className="flex bg-white/10 p-1 rounded-full gap-1">
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-5 py-1.5 rounded-full text-sm font-medium transition ${
            activeTab === 'resources' ? 'bg-white text-purple-900 shadow' : 'text-white hover:bg-white/10'
          }`}
        >
          {lang === 'th' ? '📋 ทรัพยากรทั้งหมด' : '📋 All Resources'}
        </button>
        <button
          onClick={() => setActiveTab('myBookings')}
          className={`px-5 py-1.5 rounded-full text-sm font-medium transition ${
            activeTab === 'myBookings' ? 'bg-white text-purple-900 shadow' : 'text-white hover:bg-white/10'
          }`}
        >
          {lang === 'th' ? '👤 ประวัติการจองของฉัน' : '👤 My Bookings'}
        </button>
      </div>

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
  );
};