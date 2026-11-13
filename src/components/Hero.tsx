import React from 'react';
import { KirkpatrickPyramid } from './KirkpatrickPyramid';
import { Clock, ShieldCheck, Sparkles, ArrowRight, FileCheck, Lock } from 'lucide-react';
import { EvaluationDay } from '../types';

interface HeroProps {
  days: EvaluationDay[];
  onSelectDay?: (dayId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ days, onSelectDay }) => {
  // Automatic Day Detection based on current date — STRICTLY filtered to Admin-opened days ONLY
  const now = new Date();
  const currentDayOfMonth = now.getDate();

  const openDays = days.filter((d) => d.status === 'open');

  // If today's calendar day is OPEN by Admin, prioritize it; otherwise pick the first OPEN day.
  // NEVER auto-open a closed or waiting day!
  const todayOpenDay = openDays.find((d) => {
    const m = d.dateStr.match(/^(\d+)/);
    return m ? parseInt(m[1], 10) === currentDayOfMonth : false;
  });

  const activeDay = todayOpenDay || openDays[0] || null;

  // Other open days for quick switching
  const otherOpenDays = openDays.filter((d) => d.id !== activeDay?.id);

  return (
    <header className="bg-navy-900 relative border-b-4 border-lime overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-10 pointer-events-none text-slate-400">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="hero-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40L40 0H20L0 20M40 40V20L20 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid-pattern)"></rect>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-14 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Title, Official Notice (First), then Evaluation Action Box (Below) */}
          <div className="lg:col-span-7 text-left">
            <div className="inline-flex items-center gap-2 py-1 px-3.5 rounded-full bg-navy-800 text-lime font-kanit text-xs md:text-sm font-medium mb-3 border border-lime/30">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              รอบประเมินผล พฤศจิกายน 2569 · ระยะเวลาอบรม 16 - 27 พ.ย. 2569
            </div>

            {/* Heading: การประเมินผลโครงการฝึกอบรม */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-kanit font-bold text-white leading-tight mb-3 text-balance">
              การประเมินผลโครงการฝึกอบรม
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-5 font-light font-sarabun leading-relaxed">
              หลักสูตร <span className="text-white font-medium">"การตรวจสอบการปฏิบัติตามกฎหมาย ระดับกลาง"</span>
              <br />
              สำหรับข้าราชการระดับชำนาญการและชำนาญการพิเศษ สำนักงานการตรวจเงินแผ่นดิน
            </p>

            {/* 1. คำชี้แจง (Official Notice) - แสดงก่อนเพื่อให้ผู้เข้าอบรมอ่านคำชี้แจงก่อนทำแบบประเมิน */}
            <div className="bg-navy-800/85 border border-slate-700/80 rounded-2xl p-4 sm:p-5 mb-5 text-left shadow-md">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700/60">
                <FileCheck className="w-4 h-4 text-lime" />
                <h2 className="text-lime font-kanit font-semibold text-base sm:text-lg">
                  คำชี้แจง (โปรดอ่านคำชี้แจงก่อนทำแบบประเมิน)
                </h2>
              </div>

              <ol className="space-y-2.5 text-xs sm:text-sm font-sarabun text-slate-200 leading-relaxed list-none">
                <li className="flex items-start gap-2.5">
                  <span className="font-kanit font-semibold text-lime shrink-0 pt-0.5">1.</span>
                  <span>
                    แบบสอบถามนี้จัดทำขึ้นเพื่อประเมินผลความพึงพอใจและวัดผลการเรียนรู้รายวัน (Reaction and Learning Evaluation) เพื่อรวบรวมและวิเคราะห์สรุปรายงานผลการดำเนินโครงการภายหลังเสร็จสิ้นการดำเนินโครงการในวันสุดท้าย เสนอผู้บังคับบัญชาตามระเบียบต่อไป
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-kanit font-semibold text-lime shrink-0 pt-0.5">2.</span>
                  <span>
                    รายงานฉบับนี้จะเป็นข้อมูลสำหรับติดตามประเมินผลการนำความรู้ไปใช้ปฏิบัติงานจริงภายหลังเสร็จสิ้นการฝึกอบรมไม่น้อยกว่า 3 – 6 เดือน ต่อไป (Behavior and Result Evaluation)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-kanit font-semibold text-lime shrink-0 pt-0.5">3.</span>
                  <span>
                    การให้ข้อมูลตามความเป็นจริงของท่านเป็นหัวใจสำคัญที่จะช่วยให้ได้ข้อมูลที่ถูกต้อง นำไปสู่การพัฒนาหลักสูตรและระบบสนับสนุนการทำงานที่ตรงจุดอย่างแท้จริง
                  </span>
                </li>
              </ol>
            </div>

            {/* 2. แบบประเมิน (Evaluation Box) - วางอยู่ใต้คำชี้แจง เมื่ออ่านคำชี้แจงแล้วจึงเข้าทำแบบประเมิน */}
            <div
              className={`bg-gradient-to-r from-navy-800/95 via-navy-800 to-navy-950 border-2 rounded-2xl p-4 sm:p-5 mb-5 shadow-xl ${
                activeDay ? 'border-lime/80' : 'border-slate-600/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`p-1 rounded-md ${activeDay ? 'bg-lime/20 text-lime' : 'bg-slate-700 text-slate-300'}`}>
                    {activeDay ? <Sparkles className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-kanit font-bold text-white">
                      แบบประเมินผลการฝึกอบรมประจำวัน
                    </h3>
                    <p className={`text-[11px] sm:text-xs font-sarabun ${activeDay ? 'text-lime' : 'text-slate-300'}`}>
                      {activeDay
                        ? 'เมื่ออ่านคำชี้แจงเรียบร้อยแล้ว สามารถกดทำแบบประเมินประจำวันได้ทันที'
                        : 'สิทธิการเปิด-ปิดรับคำตอบควบคุมโดยผู้ดูแลระบบ (Admin)'}
                    </p>
                  </div>
                </div>

                {activeDay && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-300 font-sarabun shrink-0">
                    <span className="inline-flex items-center gap-1 bg-navy-900/80 px-2.5 py-1 rounded-md border border-slate-700">
                      <Clock className="w-3.5 h-3.5 text-lime" />
                      ใช้เวลาเพียง 2–3 นาที
                    </span>
                  </div>
                )}
              </div>

              {/* Primary Open Day Button OR Closed Status Banner */}
              {activeDay ? (
                <button
                  type="button"
                  onClick={() => onSelectDay?.(activeDay.id)}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-lime hover:bg-lime-dark text-navy-950 font-kanit font-bold text-sm sm:text-base transition-all shadow-lg group cursor-pointer active:scale-98"
                >
                  <div className="text-left">
                    <div className="text-[11px] text-navy-900/80 font-medium">
                      {activeDay.dayLabel} · {activeDay.dateStr}
                    </div>
                    <div className="text-base sm:text-lg font-bold text-navy-950 flex items-center gap-2">
                      <span>เข้าทำแบบประเมิน ({activeDay.dateStr})</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-900 animate-ping" />
                    </div>
                  </div>
                  <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-navy-950/15 flex items-center justify-center group-hover:translate-x-1.5 transition-transform shrink-0">
                    <ArrowRight className="w-5 h-5 text-navy-950" />
                  </span>
                </button>
              ) : (
                <div className="w-full flex items-center gap-3 p-3.5 sm:p-4 rounded-xl bg-navy-950/80 border border-slate-700 text-slate-300">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-600 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-kanit font-bold text-white">
                      ขณะนี้ยังไม่มีรอบแบบประเมินที่เปิดรับคำตอบ
                    </div>
                    <div className="text-xs text-slate-400 font-sarabun mt-0.5">
                      กรุณารอผู้ดูแลระบบ (Admin) เปิดรับคำตอบตามกำหนดการฝึกอบรม
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Other Open Days (if any) */}
              {otherOpenDays.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center gap-2 flex-wrap text-xs font-sarabun text-slate-300">
                  <span className="text-[11px] text-slate-400">หรือเลือกทำแบบประเมินวันอื่น:</span>
                  {otherOpenDays.map((od) => (
                    <button
                      key={od.id}
                      type="button"
                      onClick={() => onSelectDay?.(od.id)}
                      className="px-2.5 py-1 rounded-lg bg-navy-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-lime/40 text-xs font-kanit font-medium transition-all cursor-pointer"
                    >
                      {od.dayLabel} ({od.dateStr})
                    </button>
                  ))}
                </div>
              )}

              {/* Quick links & Privacy Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-2.5 border-t border-slate-700/60 text-[11px] text-slate-300 font-sarabun">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime shrink-0" />
                  ข้อมูลเก็บเป็นความลับตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
                </span>
                <div className="flex items-center gap-3">
                  <a
                    href="#daily-eval"
                    className="text-lime hover:underline font-kanit font-medium inline-flex items-center gap-0.5"
                  >
                    ดูทุกวันอบรม ↓
                  </a>
                  <a
                    href="#kirkpatrick-model"
                    className="text-slate-300 hover:text-white hover:underline font-kanit font-medium inline-flex items-center gap-0.5"
                  >
                    โมเดล Kirkpatrick ↓
                  </a>
                </div>
              </div>
            </div>

            {/* Institutional Trust markers */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 text-[11px] sm:text-xs text-slate-400 font-sarabun">
              <span>มาตรฐานวิชาชีพการตรวจเงินแผ่นดิน (ISSAI)</span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span>บันทึกชั่วโมงการพัฒนาความรู้ต่อเนื่อง (CPD) 48 ชั่วโมง</span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span>ความลับข้อมูลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)</span>
            </div>
          </div>

          {/* Right Column: Kirkpatrick 4 Levels Pyramid (Shown on desktop, moved to bottom on mobile) */}
          <div className="hidden lg:block lg:col-span-5 w-full sticky top-24">
            <KirkpatrickPyramid />
          </div>
        </div>
      </div>
    </header>
  );
};
