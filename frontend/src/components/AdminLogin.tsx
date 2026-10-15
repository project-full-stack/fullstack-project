import React, { useState } from 'react';
import { Language } from '../types';

interface AdminLoginProps {
  lang: Language;
  apiUrl: string;
  onLoginSuccess: () => void;
  onBackToUser: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ apiUrl, onLoginSuccess, onBackToUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onLoginSuccess();
      } else {
        setErrorMsg(result.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-3 p-2">
            <img src="/images/key.png" alt="Admin Key" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A237E]">
            เข้าสู่ระบบผู้ดูแลระบบ
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            กรุณาเข้าสู่ระบบเพื่อจัดการการจองห้องและอุปกรณ์
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              ชื่อผู้ใช้งาน
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A237E]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              รหัสผ่าน
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A237E]"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1A237E] text-white rounded-xl text-sm font-semibold hover:bg-[#303F9F] shadow transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </button>
            <button
              type="button"
              onClick={onBackToUser}
              className="w-full py-2.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition cursor-pointer"
            >
              ← กลับหน้าหลักผู้ใช้งาน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};