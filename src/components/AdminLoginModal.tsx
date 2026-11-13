import React, { useState } from 'react';
import { DataService } from '../services/dataService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const res = await DataService.adminLogin(email, password);
    setIsSubmitting(false);

    if (res.success) {
      setErrorMessage('');
      onSuccess();
    } else {
      setErrorMessage(res.error || 'รหัสผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-navy-900 text-white p-5 border-b-4 border-lime flex items-center justify-between">
          <div>
            <span className="text-xs font-kanit font-medium text-lime uppercase tracking-wider block">
              ระบบบริหารจัดการ
            </span>
            <h3 className="text-xl font-kanit font-bold text-white">
              เข้าสู่ระบบ Admin Page
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white px-2.5 py-1 rounded text-xs font-kanit border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
          >
            ปิด
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-500 font-sarabun leading-relaxed">
            กรุณาระบุบัญชีผู้ดูแลระบบเพื่อเข้าจัดการสถานะแบบประเมินรายวัน และติดตามผลการตอบแบบประเมิน
          </p>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-kanit">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-kanit font-medium text-slate-700 mb-1">
              Admin ID (อีเมล)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="songkran.sirichaithanakul@gmail.com"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-kanit font-medium text-slate-700 mb-1">
              รหัสผ่าน (Password)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ระบุรหัสผ่าน"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime focus:bg-white transition-colors"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 text-xs font-kanit text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 text-xs font-kanit font-semibold text-navy-900 bg-lime hover:bg-lime-dark rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
