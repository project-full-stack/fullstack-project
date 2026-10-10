import React, { useState } from 'react';
import { Resource, Language } from '../types';
import { Calendar, CalendarContent } from './Calendar';
import { TimePickerModal } from './TimePickerModal';

interface BookingModalProps {
  selectedResource: Resource | null;
  lang: Language;
  apiUrl: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ selectedResource, lang, apiUrl, onClose, onSuccess }) => {
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  
  const [isTimeSelected, setIsTimeSelected] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const currentDate = new Date();
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());
  
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const monthsTh = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const months = lang === 'th' ? monthsTh : monthsEn;
  const daysHeader = lang === 'th' ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handleResetAndClose = () => {
    setStudentName('');
    setStudentId('');
    setBookingDate('');
    setIsCalendarOpen(false);
    setIsTimeModalOpen(false);
    setIsTimeSelected(false);
    setIsConfirmed(false);
    setStartTime('09:00');
    setEndTime('10:00');
    setErrorMsg('');
    onClose();
  };

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    updateDateTime(viewYear, viewMonth, day, startTime, endTime);
  };

  const updateDateTime = (year: number, month: number, day: number, start: string, end: string) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const thaiYear = year + (lang === 'th' ? 543 : 0);
    const formattedDisplay = `${pad(day)} ${months[month]} ${thaiYear} เวลา ${start} - ${end} น.`;
    setBookingDate(formattedDisplay);
  };

  React.useEffect(() => {
    if (isConfirmed) {
      updateDateTime(viewYear, viewMonth, selectedDay, startTime, endTime);
    }
  }, [startTime, endTime, selectedDay, viewYear, viewMonth, isConfirmed]);

  if (!selectedResource) return null;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = studentName.trim();
    const trimmedId = studentId.trim();

    if (!trimmedName) {
      setErrorMsg(
        lang === 'th' 
          ? 'โปรดกรอกชื่อ-นามสกุล' 
          : 'Please enter your Full Name'
      );
      return;
    }

    if (trimmedId.length !== 9 || !/^\d+$/.test(trimmedId)) {
      setErrorMsg(
        lang === 'th' 
          ? 'โปรดกรอกรหัสนักศึกษาให้ถูกต้อง (ต้องเป็นตัวเลข 9 หลัก)' 
          : 'Please enter a valid Student ID (must be exactly 9 digits)'
      );
      return;
    }

    if (!isConfirmed || !bookingDate) {
      setErrorMsg(
        lang === 'th' 
          ? 'กรุณาเลือกวันที่และเวลาที่ต้องการจอง' 
          : 'Please select booking date and time'
      );
      return;
    }

    const [hours, minutes] = startTime.split(':').map(Number);
    const selectedDateTime = new Date(viewYear, viewMonth, selectedDay, hours, minutes);
    const now = new Date();

    if (selectedDateTime < now) {
      setErrorMsg(
        lang === 'th' 
          ? 'ไม่สามารถเลือกวันที่หรือเวลาที่ผ่านไปแล้วได้' 
          : 'Cannot select past date or time'
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: selectedResource.id,
          studentName: trimmedName,
          studentId: trimmedId,
          bookingDate: selectedDateTime.toISOString(),
          endTime: endTime,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert(lang === 'th' ? 'จองสำเร็จเรียบร้อย!' : 'Booking successful!');
        onSuccess();
        handleResetAndClose();
      } else {
        setErrorMsg(
          (lang === 'th' ? 'การจองไม่สำเร็จ: ' : 'Booking failed: ') + 
          (result.error || (lang === 'th' ? 'ช่วงเวลานี้ถูกจองไปแล้วในระบบ' : 'This time slot is already booked'))
        );
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'th' ? 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' : 'Server connection error');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormIncomplete = !studentName.trim() || studentId.trim().length !== 9 || !isConfirmed;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
      <div className={`bg-white rounded-3xl p-6 shadow-xl relative animate-in fade-in zoom-in transition-all duration-300 ease-in-out flex flex-col md:flex-row items-start gap-6 ${isCalendarOpen ? 'md:max-w-185 w-full' : 'w-full max-w-100'}`}>
        
        {/* ฝั่งซ้าย: ฟอร์มกรอกข้อมูล */}
        <div className="w-full md:w-87.5 shrink-0">
          <h3 className="text-lg font-bold mb-2 text-[#1A237E]">
            {lang === 'th' ? 'ยืนยันการจอง: ' : 'Confirm Booking: '} {lang === 'th' ? selectedResource.nameTh : selectedResource.nameEn}
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
                placeholder={lang === 'th' ? 'เช่น กัน เกรียงไกร' : 'e.g. John Walker'}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A237E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {lang === 'th' ? 'รหัสนักศึกษา' : 'Student ID'}
              </label>
              <input
                type="text"
                required
                maxLength={9}
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="660610000"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A237E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {lang === 'th' ? 'วันที่และเวลาที่ต้องการจอง' : 'Booking Date & Time'}
              </label>
              <Calendar 
                lang={lang} 
                value={bookingDate} 
                onChange={setBookingDate} 
                isOpen={isCalendarOpen}
                setIsOpen={setIsCalendarOpen}
                startTime={startTime}
                endTime={endTime}
                setStartTime={setStartTime}
                setEndTime={setEndTime}
                isTimeSelected={isTimeSelected}
                setIsTimeSelected={setIsTimeSelected}
                isConfirmed={isConfirmed}
              />
            </div>

            {errorMsg && (
              <p className="text-rose-500 text-xs font-medium mt-1 flex items-center gap-1.5">
                <img src="/images/warning.png" alt="Warning" className="w-4 h-4 object-contain" />
                {errorMsg}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting || isFormIncomplete}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
                  submitting || isFormIncomplete
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-[#1A237E] text-white hover:bg-[#303F9F] shadow cursor-pointer'
                }`}
              >
                {submitting ? (lang === 'th' ? 'กำลังบันทึก...' : 'Submitting...') : (lang === 'th' ? 'ยืนยันการจอง' : 'Confirm')}
              </button>
            </div>
          </form>
        </div>

        {/* ฝั่งขวา: ปฏิทินและปุ่มเลือกเวลา */}
        {isCalendarOpen && (
          <div className="w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 animate-in fade-in zoom-in duration-150">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {lang === 'th' ? 'ปฏิทินและเวลา' : 'Calendar & Time'}
            </h4>
            <CalendarContent 
              lang={lang} 
              viewYear={viewYear} 
              viewMonth={viewMonth} 
              selectedDay={selectedDay} 
              startTime={startTime}
              endTime={endTime}
              setViewYear={setViewYear} 
              setViewMonth={setViewMonth} 
              handleSelectDay={handleSelectDay} 
              months={months} 
              daysHeader={daysHeader} 
              firstDayIndex={firstDayIndex} 
              totalDays={totalDays} 
              onClose={() => {
                if (!isTimeSelected) {
                  alert(lang === 'th' ? 'กรุณาเลือกเวลาก่อนกดตกลง' : 'Please select time before confirming');
                  return;
                }

                const [hours, minutes] = startTime.split(':').map(Number);
                const selectedDateTime = new Date(viewYear, viewMonth, selectedDay, hours, minutes);
                const now = new Date();

                if (selectedDateTime < now) {
                  alert(lang === 'th' ? 'ไม่สามารถเลือกวันที่หรือเวลาที่ผ่านไปแล้วได้' : 'Cannot select past date or time');
                  return;
                }

                updateDateTime(viewYear, viewMonth, selectedDay, startTime, endTime);
                setIsConfirmed(true);
                setIsCalendarOpen(false);
              }}
              onOpenTimeModal={() => setIsTimeModalOpen(true)}
              isTimeSelected={isTimeSelected}
            />
          </div>
        )}

      </div>

      {/* Popup Modal เลือกเวลา */}
      <TimePickerModal
        lang={lang}
        isOpen={isTimeModalOpen}
        onClose={() => {
          setIsTimeModalOpen(false);
        }}
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