import React from 'react';
import { Language } from '../types';

interface TimePickerModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  startTime: string;
  endTime: string;
  setStartTime: (t: string) => void;
  setEndTime: (t: string) => void;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  lang,
  isOpen,
  onClose,
  onConfirm,
  startTime,
  endTime,
  setStartTime,
  setEndTime,
}) => {
  // 🚪 หาก modal ยังไม่เปิด ให้ซ่อนคอมโพเนนต์
  if (!isOpen) return null;

  // ⏰ รายการช่วงเวลาที่เปิดให้เลือกจอง (ตั้งแต่ 08:00 ถึง 17:00)
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', 
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  return (
    <div className="fixed inset-0 bg-black/25 flex justify-center items-center p-4 z-50 backdrop-blur-[2px]">
      <div className="bg-white rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in transition-all duration-300 ease-in-out w-full md:max-w-185">
        
        {/* ส่วนหัว Modal (ชื่อหัวข้อและปุ่มปิด) */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-[#1A237E] flex items-center gap-2">
            <img src="/images/clock.png" alt="Clock" className="w-4 h-4 object-contain" />
            {lang === 'th' ? 'เลือกช่วงเวลาการใช้งาน' : 'Select Time Range'}
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer flex items-center justify-center"
          >
            {/* ✕ ปุ่มปิดด้วยไอคอน close.png ขนาดเล็ก */}
            <img src="/images/close.png" alt="Close" className="w-3 h-3 object-contain" />
          </button>
        </div>

        {/* 📅 ส่วนเลือกเวลาแบบ 2 คอลัมน์ (ซ้าย: เวลาเริ่มต้น / ขวา: เวลาสิ้นสุด) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* ฝั่งซ้าย: เวลาเริ่มต้น (Start Time) */}
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-600 mb-3">
              {lang === 'th' ? 'เวลาเริ่มต้น' : 'Start Time'}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => {
                const isSelected = time === startTime;
                return (
                  <button
                    key={`start-${time}`}
                    type="button"
                    onClick={() => {
                      setStartTime(time);
                      // หากเวลาสิ้นสุดน้อยกว่าหรือเท่ากับเวลาเริ่มต้นใหม่ ให้ขยับเวลาสิ้นสุดอัตโนมัติ
                      if (endTime <= time) {
                        const idx = timeSlots.indexOf(time);
                        if (idx < timeSlots.length - 1) setEndTime(timeSlots[idx + 1]);
                      }
                    }}
                    className={`py-2 rounded-xl text-xs font-medium transition cursor-pointer border ${
                      isSelected 
                        ? 'bg-[#1A237E] text-white shadow-sm font-bold border-[#1A237E]' 
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ฝั่งขวา: เวลาสิ้นสุด (End Time) */}
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-600 mb-3">
              {lang === 'th' ? 'เวลาสิ้นสุด' : 'End Time'}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => {
                const isSelected = time === endTime;
                // ปิดการใช้งานปุ่มเวลาสิ้นสุดที่น้อยกว่าหรือเท่ากับเวลาเริ่มต้น
                const isDisabled = time <= startTime;
                return (
                  <button
                    key={`end-${time}`}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setEndTime(time)}
                    className={`py-2 rounded-xl text-xs font-medium transition border ${
                      isDisabled 
                        ? 'opacity-30 bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed' 
                        : isSelected 
                          ? 'bg-[#1A237E] text-white shadow-sm font-bold border-[#1A237E] cursor-pointer' 
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 cursor-pointer'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ส่วนปุ่มยืนยันเวลาด้านล่าง */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-2 bg-[#1A237E] text-white text-xs font-semibold rounded-xl hover:bg-[#303F9F] shadow transition cursor-pointer"
          >
            {lang === 'th' ? 'ยืนยันเวลา' : 'Confirm Time'}
          </button>
        </div>
      </div>
    </div>
  );
};