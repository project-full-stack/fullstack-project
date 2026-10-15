import React, { useState, useEffect } from 'react';
import { Language, Resource } from '../types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
  lang: Language;
  apiUrl: string;
  onStatusUpdated: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  resource,
  lang,
  apiUrl,
  onStatusUpdated
}) => {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [borrowDays, setBorrowDays] = useState<string>('3');

  useEffect(() => {
    if (isOpen && resource) {
      setLoading(true);
      fetch(`${apiUrl}/bookings`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const target = data.find(
              (b) => b.resourceId === resource.id && (b.status === 'pending' || b.status === 'approved' || b.status === 'borrowed')
            );
            setBooking(target || null);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, resource, apiUrl]);

  if (!isOpen || !resource) return null;

  const handleUpdateStatus = async (newStatus: 'borrowed' | 'returned') => {
    if (!booking) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${apiUrl}/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          borrowDays: newStatus === 'borrowed' ? Number(borrowDays) : undefined 
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        onStatusUpdated();
        onClose();
      } else {
        alert(result.error || (lang === 'th' ? 'ไม่สามารถอัปเดตสถานะได้' : 'Failed to update status'));
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'th' ? 'เกิดข้อผิดพลาดในการเชื่อมต่อ' : 'Connection error');
    } finally {
      setActionLoading(false);
    }
  };

  const displayName = lang === 'th' ? resource.nameTh : resource.nameEn;

  const qrDataUrl = booking 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BOOKING_ID_${booking.id}_RES_${resource.id}`
    : '';

  const bookingDateStr = booking?.bookingDate 
    ? new Date(booking.bookingDate).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  // แปลงสถานะเป็นภาษาไทยหรืออังกฤษตามการตั้งค่า
  const getStatusText = (status: string) => {
    if (lang === 'th') {
      if (status === 'approved') return 'อนุมัติแล้ว';
      if (status === 'pending') return 'รออนุมัติ';
      if (status === 'borrowed') return 'กำลังยืม';
      if (status === 'returned') return 'คืนแล้ว';
      return status;
    }
    return status.toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-150">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-[#1A237E]">
            {lang === 'th' ? 'คิวอาร์โค้ดรับอุปกรณ์' : 'Equipment QR Code'}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-slate-400 text-sm">
            {lang === 'th' ? 'กำลังโหลดข้อมูลการจอง...' : 'Loading booking info...'}
          </div>
        ) : !booking ? (
          <div className="py-8 text-slate-500 text-sm">
            {lang === 'th' ? 'ไม่พบข้อมูลการจองสำหรับอุปกรณ์นี้' : 'No active booking found for this resource.'}
          </div>
        ) : (
          <div className="space-y-4">
            {/* รายละเอียดการจอง */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left text-xs space-y-1.5">
              <div className="font-bold text-slate-800 text-sm">{displayName}</div>
              <div className="text-slate-600">
                <span className="font-semibold">{lang === 'th' ? 'ผู้จอง:' : 'User:'}</span> {booking.studentName} ({booking.studentId})
              </div>
              <div className="text-slate-600">
                <span className="font-semibold">{lang === 'th' ? 'วันที่มาติดต่อ:' : 'Date:'}</span> {bookingDateStr}
              </div>
              <div className="text-slate-600">
                <span className="font-semibold">{lang === 'th' ? 'สถานะ:' : 'Status:'}</span>{' '}
                <span className="font-bold text-indigo-600">{getStatusText(booking.status)}</span>
              </div>
            </div>

            {/* แสดง QR Code */}
            <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-slate-200 inline-block shadow-2xs">
              <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto object-contain" />
            </div>

            {/* ช่องกรอกจำนวนวันที่ต้องการยืมจริง (แสดงเฉพาะตอนยังไม่ได้รับของ) */}
            {booking.status !== 'borrowed' && (
              <div className="text-left bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {lang === 'th' ? 'กำหนดจำนวนวันที่ยืม (วัน):' : 'Borrow Duration (Days):'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={borrowDays}
                  onChange={(e) => setBorrowDays(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1A237E] bg-white"
                />
              </div>
            )}

            <p className="text-xs text-slate-400">
              {lang === 'th' 
                ? 'ตกลงวันยืมกับนักศึกษา แล้วกดปุ่มยืนยันการรับอุปกรณ์' 
                : 'Confirm borrow duration and click confirm below.'}
            </p>

            {/* ปุ่มกดเปลี่ยนสถานะ (ตัดปุ่ม "ปิดหน้าต่าง" ด้านล่างออกแล้ว) */}
            <div className="pt-2 flex flex-col gap-2">
              {booking.status !== 'borrowed' ? (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus('borrowed')}
                  className="w-full py-2.5 bg-[#1A237E] text-white rounded-xl text-xs font-semibold hover:bg-[#303F9F] shadow transition cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'กำลังบันทึก...' : (lang === 'th' ? '✓ ยืนยันการรับอุปกรณ์ (กำลังยืม)' : 'Confirm Pickup')}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus('returned')}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow transition cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'กำลังบันทึก...' : (lang === 'th' ? '✓ ยืนยันการคืนอุปกรณ์ (เสร็จสิ้น)' : 'Confirm Return')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};