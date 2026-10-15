import React from 'react';
import { Language } from '../types';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  activeTab: 'resources' | 'myBookings' | 'admin';
  setActiveTab: (tab: 'resources' | 'myBookings' | 'admin') => void;
  isOnline: boolean | null;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ lang, setLang, activeTab, setActiveTab, isOnline, isAdminLoggedIn, onLogout }) => {
  return (
    <header className="bg-[#1A237E] text-white px-6 md:px-10 py-4 flex flex-col lg:flex-row justify-between items-center gap-4 shadow-md sticky top-0 z-40">
      {/* ชื่อระบบ */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg md:text-xl font-bold tracking-wide whitespace-nowrap">
          {lang === 'th' ? 'ระบบจองห้องและอุปกรณ์' : 'Room & Equipment Booking'}
        </h2>
      </div>

      {/* เมนูสลับหน้า (Tabs) */}
      <div className="flex bg-white/10 p-1 rounded-full gap-1">
        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs md:text-sm font-medium transition ${
            activeTab === 'resources' ? 'bg-white text-[#1A237E] shadow-sm font-semibold' : 'text-white hover:bg-white/10'
          }`}
        >
          <img 
            src="/images/resources.png" 
            alt="Resources" 
            className={`w-4 h-4 object-contain ${activeTab === 'resources' ? '' : 'brightness-0 invert'}`}
          />
          {lang === 'th' ? 'ทรัพยากรทั้งหมด' : 'All Resources'}
        </button>

        {/* ถ้าแอดมินล็อกอินอยู่ ปุ่มที่สองจะเป็น "ระบบจัดการการจอง" พร้อมไอคอน admin.png */}
        {isAdminLoggedIn ? (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs md:text-sm font-medium transition ${
              activeTab === 'admin' ? 'bg-white text-[#1A237E] shadow-sm font-semibold' : 'text-white hover:bg-white/10'
            }`}
          >
            <img 
              src="/images/admin.png" 
              alt="Admin Dashboard" 
              className={`w-4 h-4 object-contain ${activeTab === 'admin' ? '' : 'brightness-0 invert'}`}
            />
            {lang === 'th' ? 'ระบบจัดการการจอง' : 'Admin Dashboard'}
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('myBookings')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs md:text-sm font-medium transition ${
              activeTab === 'myBookings' ? 'bg-white text-[#1A237E] shadow-sm font-semibold' : 'text-white hover:bg-white/10'
            }`}
          >
            <img 
              src="/images/history.png" 
              alt="My Bookings" 
              className={`w-4 h-4 object-contain ${activeTab === 'myBookings' ? '' : 'brightness-0 invert'}`}
            />
            {lang === 'th' ? 'ประวัติการจองของฉัน' : 'My Bookings'}
          </button>
        )}
      </div>

      {/* ฝั่งขวา: สถานะออนไลน์, ปุ่ม Admin / Sign Out และเปลี่ยนภาษา */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <span className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm flex items-center gap-2 ${
          isOnline === null 
            ? 'bg-slate-200 text-slate-600' 
            : isOnline 
            ? 'bg-emerald-100 text-emerald-800' 
            : 'bg-rose-100 text-rose-800'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
          {isOnline === null 
            ? (lang === 'th' ? 'กำลังโหลด...' : 'Loading...') 
            : isOnline 
            ? (lang === 'th' ? 'ออนไลน์' : 'Online') 
            : (lang === 'th' ? 'ออฟไลน์' : 'Offline')}
        </span>

        {/* ถ้ายังไม่ล็อกอิน แสดงปุ่มเข้าสู่ระบบแอดมิน */}
        {!isAdminLoggedIn && (
          <button
            onClick={() => setActiveTab('admin')}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer bg-white/20 text-white hover:bg-white/30"
          >
            <img src="/images/key.png" alt="Admin Key" className="w-3.5 h-3.5 object-contain brightness-0 invert" /> 
            {lang === 'th' ? 'ผู้ดูแลระบบ' : 'Admin'}
          </button>
        )}

        {/* ถ้าล็อกอินเป็นแอดมินแล้ว แสดงปุ่ม "ออกจากระบบ" พร้อมไอคอน signout.png */}
        {isAdminLoggedIn && (
          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer bg-rose-500 text-white hover:bg-rose-600"
          >
            <img src="/images/signout.png" alt="Sign Out" className="w-3.5 h-3.5 object-contain brightness-0 invert" /> 
            {lang === 'th' ? 'ออกจากระบบ' : 'Sign Out'}
          </button>
        )}
        
        <div className="bg-white/20 p-1 rounded-full flex gap-1">
          <button 
            onClick={() => setLang('th')} 
            className={`px-3 py-1 rounded-full text-xs font-bold transition ${lang === 'th' ? 'bg-white text-[#1A237E] shadow' : 'text-white hover:bg-white/10'}`}
          >
            TH
          </button>
          <button 
            onClick={() => setLang('en')} 
            className={`px-3 py-1 rounded-full text-xs font-bold transition ${lang === 'en' ? 'bg-white text-[#1A237E] shadow' : 'text-white hover:bg-white/10'}`}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
};