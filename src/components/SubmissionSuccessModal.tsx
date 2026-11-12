import React from 'react';
import { EvaluationDay, EvaluationSubmission } from '../types';

interface SubmissionSuccessModalProps {
  day: EvaluationDay;
  submission: EvaluationSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onReturnHome: () => void;
  onViewDashboard?: () => void;
}

export const SubmissionSuccessModal: React.FC<SubmissionSuccessModalProps> = ({
  day,
  submission,
  isOpen,
  onClose,
  onReturnHome,
  onViewDashboard,
}) => {
  if (!isOpen || !submission) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header - No icons */}
        <div className="bg-navy-900 text-white p-6 text-center relative border-b-4 border-lime">
          <button
            onClick={onReturnHome}
            className="absolute top-4 right-4 text-slate-400 hover:text-white px-2.5 py-1 rounded text-xs font-kanit border border-slate-700"
          >
            ปิด
          </button>

          <div className="inline-block px-3 py-1 bg-lime/20 text-lime font-kanit text-xs font-semibold rounded-full border border-lime/30 mb-2">
            บันทึกสำเร็จเรียบร้อย
          </div>

          <h3 className="text-2xl sm:text-3xl font-kanit font-bold text-white mb-1">
            ส่งแบบประเมินแล้ว
          </h3>
          <p className="text-xs sm:text-sm text-lime font-kanit font-medium">
            ระบบได้บันทึกการประเมินโครงการของท่านเข้าสู่ฐานข้อมูลเรียบร้อยสมบูรณ์
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-sarabun text-sm space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-kanit text-xs">รหัสอ้างอิงการส่ง:</span>
              <span className="font-mono font-bold text-navy-900 text-xs tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                {submission.referenceCode}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-slate-500 text-xs font-kanit">หลักสูตร:</span>
              <span className="font-medium text-slate-800 text-right text-xs max-w-[240px]">
                การตรวจสอบการปฏิบัติตามกฎหมาย ระดับกลาง
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-slate-500 text-xs font-kanit">แบบประเมิน:</span>
              <span className="font-medium text-slate-800 text-right text-xs">
                {day.title}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-slate-500 text-xs font-kanit">ผู้ประเมิน:</span>
              <span className="text-slate-700 text-xs">{submission.participantName}</span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-slate-500 text-xs font-kanit">เวลาที่บันทึกส่ง:</span>
              <span className="text-slate-600 text-xs tabular-nums">{submission.timestamp}</span>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 font-sarabun">
            สถาบันพัฒนาการตรวจเงินแผ่นดิน · สำนักงานการตรวจเงินแผ่นดิน
            <br />
            ขอขอบคุณสำหรับข้อคิดเห็นอันเป็นประโยชน์ต่อการพัฒนาหลักสูตร
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            {/* Primary Action: กลับสู่หน้าแรก */}
            <button
              onClick={onReturnHome}
              className="w-full py-3 bg-lime hover:bg-lime-dark text-navy-900 rounded-xl text-sm font-kanit font-bold flex items-center justify-center cursor-pointer transition-colors shadow-md hover:shadow-lime/30"
            >
              กลับสู่หน้าแรก
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePrint}
                className="py-2 px-3 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-kanit text-center cursor-pointer transition-colors"
              >
                พิมพ์หลักฐาน
              </button>

              {onViewDashboard && (
                <button
                  onClick={onViewDashboard}
                  className="py-2 px-3 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-kanit text-center cursor-pointer transition-colors"
                >
                  ดูแดชบอร์ดสรุปผล
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
