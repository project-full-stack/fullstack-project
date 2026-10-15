import React from 'react';
import { Resource, Language } from '../types';
import { i18n } from '../data/i18n';

interface ResourceCardProps {
  resource: Resource;
  lang: Language;
  onBookClick?: (resource: Resource) => void;
  isAdminLoggedIn?: boolean;
  isBooked?: boolean; // ✅ เพิ่ม prop เช็กว่าอุปกรณ์ชิ้นนี้ถูกจองไปแล้วหรือยัง
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, lang, onBookClick, isAdminLoggedIn, isBooked }) => {
  const t = i18n[lang];
  const isRoom = resource.type?.toLowerCase() === 'room';
  
  // 🖼️ ฟังก์ชันเลือกไฟล์ภาพ .png ให้ถูกต้องตามชื่อทรัพยากรปัจจุบัน
  const getResourceImage = () => {
    const name = resource.nameTh;
    if (isRoom) {
      if (name.includes('LAB')) return '/images/room-lab.png';
      if (name.includes('เล็ก')) return '/images/room-small.png';
      return '/images/room-large.png';
    } else {
      if (name.includes('ไอแพด') || name.includes('iPad') || name.includes('แท็บเล็ต')) return '/images/ipad.png';
      if (name.includes('ไมโครโฟน')) return '/images/microphone.png';
      if (name.includes('ลำโพง')) return '/images/speaker.png';
      if (name.includes('ปลั๊ก')) return '/images/power-plug.png';
      return '/images/laptop.png';
    }
  };

  const displayType = isRoom ? t.room : t.equipment;
  const displayName = lang === 'th' ? resource.nameTh : resource.nameEn;

  // เงื่อนไขสถานะ: ถ้าเป็นอุปกรณ์และถูกจองแล้ว
  const showAsBooked = !isRoom && isBooked;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* ส่วนหัวข้อ: จัดรูปภาพให้อยู่หน้าข้อความและกึ่งกลางแนวตั้ง */}
        <div className="flex items-center gap-3 mb-4">
          <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-slate-100 rounded-xl p-1.5">
            <img 
              src={getResourceImage()} 
              alt={displayName}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/laptop.png'; 
              }}
            />
          </div>
          <h3 className="text-sm md:text-base font-bold text-slate-900 leading-snug line-clamp-2 flex-1">
            {displayName || `Resource #${resource.id}`}
          </h3>
        </div>

        {/* รายละเอียดประเภท */}
        <div className="space-y-2.5 text-xs md:text-sm mb-4 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">{t.type}:</span>
            <span className="text-slate-700 font-semibold">{displayType}</span>
          </div>
        </div>
      </div>

      {/* ส่วนสถานะและปุ่มจอง */}
      <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          showAsBooked 
            ? 'bg-amber-100 text-amber-700' 
            : resource.isActive 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-slate-200 text-slate-500'
        }`}>
          {showAsBooked 
            ? (lang === 'th' ? 'ถูกจองแล้ว' : 'Booked') 
            : (resource.isActive ? t.available : t.unavailable)}
        </span>

        {/* ✅ ถ้าเป็นแอดมิน จะไม่แสดงปุ่มจอง แต่ถ้าเป็นผู้ใช้ทั่วไปจะแสดงปุ่มจองปกติ (และปิดการกดถ้าถูกจองไปแล้ว) */}
        {!isAdminLoggedIn && (
          <button
            onClick={() => onBookClick && onBookClick(resource)}
            disabled={!resource.isActive || showAsBooked}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all ${
              resource.isActive && !showAsBooked
                ? 'bg-[#1A237E] text-white hover:bg-[#303F9F] active:scale-95 cursor-pointer' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {showAsBooked 
              ? (lang === 'th' ? 'ไม่ว่าง' : 'Unavailable') 
              : (lang === 'th' ? 'จองใช้งาน' : 'Book Now')}
          </button>
        )}
      </div>
    </div>
  );
};