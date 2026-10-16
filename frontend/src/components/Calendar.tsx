import React, { useState } from 'react';
import { Language } from '../types';
import { TimePickerModal } from './TimePickerModal';

interface CalendarProps {
  lang: Language;
  value: string;
  onChange: (val: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  startTime: string;
  endTime: string;
  setStartTime: (t: string) => void;
  setEndTime: (t: string) => void;
  isTimeSelected: boolean;
  setIsTimeSelected: (val: boolean) => void;
  isConfirmed: boolean;
  hideTimePicker?: boolean;
}

export const Calendar: React.FC<CalendarProps> = ({ 
  lang, 
  value, 
  isOpen, 
  setIsOpen, 
  startTime, 
  endTime, 
  setStartTime, 
  setEndTime,
  isTimeSelected,
  setIsTimeSelected,
  isConfirmed,
  hideTimePicker
}) => {
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

  return (
    <div className="space-y-2.5">
      {/* 📅 ปุ่มเปิด/ปิดช่องเลือกวันที่ */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[#1A237E]"
        >
          <span className={value ? 'text-slate-800 font-medium' : 'text-slate-400'}>
            {value || (lang === 'th' ? (hideTimePicker ? 'เลือกวันที่ต้องการยืม' : 'เลือกวันที่และเวลาใช้งาน') : (hideTimePicker ? 'Select Date' : 'Select Date & Time'))}
          </span>
          <img src="/images/calendar.png" alt="Calendar" className="w-4 h-4 object-contain" />
        </button>
      </div>

      {/* ⏰ แถบแสดงเวลาที่เลือกแล้ว (แสดงเมื่อยืนยันแล้วและไม่ได้ซ่อนตัวเลือกเวลา) */}
      {!hideTimePicker && isConfirmed && !isOpen && (
        <div>
          <button
            type="button"
            onClick={() => setIsTimeModalOpen(true)}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 flex justify-between items-center hover:bg-slate-100 transition cursor-pointer shadow-2xs"
          >
            <span className="font-medium text-slate-600 flex items-center gap-1.5">
              <img src="/images/clock.png" alt="Clock" className="w-3.5 h-3.5 object-contain" />
              {lang === 'th' ? `เวลา: ${startTime} - ${endTime} น.` : `Time: ${startTime} - ${endTime}`}
            </span>
            <span className="text-[#1A237E] font-semibold">
              {lang === 'th' ? 'เปลี่ยนเวลา' : 'Change Time'}
            </span>
          </button>
        </div>
      )}

      {/* Modal เลือกช่วงเวลา */}
      <TimePickerModal
        lang={lang}
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        onConfirm={() => {
          setIsTimeModalOpen(false);
          setIsTimeSelected(true);
        }}
        startTime={startTime}
        endTime={endTime}
        setStartTime={setStartTime}
        setEndTime={setEndTime}
      />
    </div>
  );
};

export const CalendarContent = ({ 
  lang, 
  viewYear, 
  viewMonth, 
  selectedDay, 
  startTime,
  endTime,
  setViewYear, 
  setViewMonth, 
  handleSelectDay, 
  months, 
  daysHeader, 
  firstDayIndex, 
  totalDays, 
  onClose,
  onOpenTimeModal,
  isTimeSelected,
  hideTimePicker
}: any) => {
  // 🗓️ ฟังก์ชันคำนวณวันหยุดนักขัตฤกษ์ตามปี
  const getHolidaysForYear = (year: number) => {
    const fixedHolidays = [
      `${year}-01-01`,
      `${year}-04-06`,
      `${year}-04-13`,
      `${year}-04-14`,
      `${year}-04-15`,
      `${year}-05-01`,
      `${year}-05-04`,
      `${year}-06-03`,
      `${year}-07-28`,
      `${year}-08-12`,
      `${year}-10-13`,
      `${year}-10-23`,
      `${year}-12-05`,
      `${year}-12-10`,
      `${year}-12-31`
    ];

    const religiousHolidays: { [key: number]: string[] } = {
      2026: [
        '2026-03-03',
        '2026-05-31',
        '2026-07-28',
        '2026-07-29'
      ],
      2027: [
        '2027-02-22',
        '2027-05-20',
        '2027-07-17',
        '2027-07-18'
      ]
    };

    const dynamicHolidays = religiousHolidays[year] || [];
    return [...fixedHolidays, ...dynamicHolidays];
  };

  const publicHolidays = getHolidaysForYear(viewYear);

  return (
    <div>
      {/* ◀️ หัวข้อเดือนและปุ่มเลื่อนเดือนก่อนหน้า/ถัดไป ▶️ */}
      <div className="flex justify-between items-center mb-3">
        <button
          type="button"
          onClick={() => {
            if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
            else { setViewMonth(viewMonth - 1); }
          }}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition cursor-pointer flex items-center justify-center"
        >
          <img src="/images/arrow-left.png" alt="Previous" className="w-4 h-4 object-contain" />
        </button>

        <span className="text-sm font-bold text-[#1A237E]">
          {months[viewMonth]} {viewYear + (lang === 'th' ? 543 : 0)}
        </span>

        <button
          type="button"
          onClick={() => {
            if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
            else { setViewMonth(viewMonth + 1); }
          }}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition cursor-pointer flex items-center justify-center"
        >
          <img src="/images/arrow-right.png" alt="Next" className="w-4 h-4 object-contain" />
        </button>
      </div>

      {/* 📅 หัวตารางแสดงวันในสัปดาห์ */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
        {daysHeader.map((d: string, i: number) => (<span key={i}>{d}</span>))}
      </div>

      {/* 🔢 ช่องแสดงตัวเลขวันในเดือน */}
      <div className="grid grid-cols-7 gap-1 text-center mb-4">
        {Array.from({ length: firstDayIndex }).map((_, i) => (<div key={`empty-${i}`} />))}
        {Array.from({ length: totalDays }).map((_, i) => {
          const dayNum = i + 1;
          const currentLoopDate = new Date(viewYear, viewMonth, dayNum);
          const dayOfWeek = currentLoopDate.getDay();
          
          const pad = (n: number) => String(n).padStart(2, '0');
          const dateString = `${viewYear}-${pad(viewMonth + 1)}-${pad(dayNum)}`;

          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const isHoliday = publicHolidays.includes(dateString);
          const isDisabled = isWeekend || isHoliday; // ปิดการเลือกวันเสาร์-อาทิตย์และวันหยุด
          const isSelected = dayNum === selectedDay;

          return (
            <button
              key={dayNum}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && handleSelectDay(dayNum)}
              className={`py-1.5 rounded-xl text-xs font-medium transition ${
                isDisabled 
                  ? 'text-slate-300 cursor-not-allowed bg-transparent' 
                  : isSelected 
                    ? 'bg-[#1A237E] text-white shadow-sm font-bold cursor-pointer' 
                    : 'hover:bg-slate-100 text-slate-700 cursor-pointer'
              }`}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      {/* ⏰ ปุ่มเลือกเวลาด้านล่างปฏิทิน */}
      {!hideTimePicker && (
        <div className="border-t border-slate-100 pt-3 mb-4">
          <button
            type="button"
            onClick={onOpenTimeModal}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 flex justify-between items-center hover:bg-slate-100 transition cursor-pointer"
          >
            <span className="font-medium text-slate-600 flex items-center gap-1.5">
              <img src="/images/clock.png" alt="Clock" className="w-3.5 h-3.5 object-contain" /> 
              {isTimeSelected 
                ? (lang === 'th' ? `เวลา: ${startTime} - ${endTime} น.` : `Time: ${startTime} - ${endTime}`)
                : (lang === 'th' ? 'กรุณาเลือกเวลา' : 'Please select time')}
            </span>
            <span className="text-[#1A237E] font-semibold">
              {isTimeSelected ? (lang === 'th' ? 'เปลี่ยนเวลา' : 'Change Time') : (lang === 'th' ? 'เลือกเวลา' : 'Select Time')}
            </span>
          </button>
        </div>
      )}

      {/* ✓ ปุ่มตกลงยืนยันการเลือก */}
      <div className="pt-3 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 bg-[#1A237E] text-white text-xs font-semibold rounded-xl hover:bg-[#303F9F] shadow transition cursor-pointer"
        >
          {lang === 'th' ? 'ตกลง' : 'Done'}
        </button>
      </div>
    </div>
  );
};