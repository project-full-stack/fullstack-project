import React, { useState } from 'react';
import { Resource, Language } from '../types';

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

  if (!selectedResource) return null;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: selectedResource.id,
          studentName,
          studentId,
          bookingDate: bookingDate ? new Date(bookingDate).toISOString() : new Date().toISOString(),
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert(lang === 'th' ? 'จองสำเร็จเรียบร้อย!' : 'Booking successful!');
        onSuccess();
        onClose();
      } else {
        alert((lang === 'th' ? 'การจองไม่สำเร็จ: ' : 'Booking failed: ') + (result.error || 'กรุณาลองใหม่อีกครั้ง'));
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'th' ? 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' : 'Server connection error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-bold mb-2 text-purple-900">
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
              placeholder="เช่น Papop"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {lang === 'th' ? 'รหัสนักศึกษา' : 'Student ID'}
            </label>
            <input
              type="text"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="เช่น 660615026"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {lang === 'th' ? 'วันที่และเวลาที่ต้องการจอง' : 'Booking Date & Time'}
            </label>
            <input
              type="datetime-local"
              required
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow transition"
            >
              {submitting ? (lang === 'th' ? 'กำลังบันทึก...' : 'Submitting...') : (lang === 'th' ? 'ยืนยันการจอง' : 'Confirm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};