import React, { useState } from 'react';
import { Award, Briefcase, BookOpen, Smile, CheckCircle2, ChevronRight, Layers, Sparkles } from 'lucide-react';

interface KirkpatrickLevel {
  level: number;
  englishTitle: string;
  thaiTitle: string;
  description: string;
  timing: string;
  isDailyActive: boolean;
  colorHex: string;
  gradientClass: string;
  borderClass: string;
  textClass: string;
  badgeBg: string;
  icon: React.ReactNode;
}

export const KirkpatrickPyramid: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const levels: KirkpatrickLevel[] = [
    {
      level: 4,
      englishTitle: 'Results',
      thaiTitle: 'ผลลัพธ์ / ผลสัมฤทธิ์',
      description: 'ผลลัพธ์ต่อพันธกิจ สตง. ยกระดับการตรวจสอบตามกฎหมายให้มีประสิทธิภาพ โปร่งใส คุ้มค่าเงินแผ่นดิน (Value for Money)',
      timing: 'ติดตามระยะยาว (Baseline)',
      isDailyActive: false,
      colorHex: '#F59E0B',
      gradientClass: 'from-amber-500/25 via-amber-500/15 to-amber-950/40',
      borderClass: 'border-amber-400/60 hover:border-amber-300',
      textClass: 'text-amber-300',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      icon: <Award className="w-4 h-4 text-amber-300 shrink-0" />
    },
    {
      level: 3,
      englishTitle: 'Behavior',
      thaiTitle: 'พฤติกรรม / การนำไปใช้',
      description: 'การนำความรู้ ข้อกฎหมาย และระเบียบไปปรับใช้ในการปฏิบัติงานตรวจสอบจริง และถ่ายทอดสอนงานในกลุ่มงาน',
      timing: 'ติดตามหลัง 3 – 6 เดือน',
      isDailyActive: false,
      colorHex: '#818CF8',
      gradientClass: 'from-indigo-500/25 via-indigo-500/15 to-indigo-950/40',
      borderClass: 'border-indigo-400/60 hover:border-indigo-300',
      textClass: 'text-indigo-300',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
      icon: <Briefcase className="w-4 h-4 text-indigo-300 shrink-0" />
    },
    {
      level: 2,
      englishTitle: 'Learning',
      thaiTitle: 'การเรียนรู้ / องค์ความรู้',
      description: 'การวัดผลสัมฤทธิ์ความรู้ ทักษะ และความเข้าใจกฎหมาย ก่อน-หลัง การอบรม (Pre-test & Post-test รายวัน)',
      timing: 'ประเมินรายวัน (Daily)',
      isDailyActive: true,
      colorHex: '#34D399',
      gradientClass: 'from-emerald-500/25 via-emerald-500/15 to-emerald-950/40',
      borderClass: 'border-emerald-400/70 hover:border-emerald-300 ring-1 ring-emerald-400/30',
      textClass: 'text-emerald-300',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      icon: <BookOpen className="w-4 h-4 text-emerald-300 shrink-0" />
    },
    {
      level: 1,
      englishTitle: 'Reaction',
      thaiTitle: 'ปฏิกิริยา / ความพึงพอใจ',
      description: 'ความพึงพอใจของผู้เข้าอบรมต่อวิทยากร เนื้อหาเอกสาร การจัดกิจกรรม และความพร้อมของสถานที่/ระบบ',
      timing: 'ประเมินรายวัน (Daily)',
      isDailyActive: true,
      colorHex: '#A3E635',
      gradientClass: 'from-lime/25 via-lime/15 to-lime-950/40',
      borderClass: 'border-lime/70 hover:border-lime-light ring-1 ring-lime/30',
      textClass: 'text-lime',
      badgeBg: 'bg-lime/20 text-lime border-lime/40',
      icon: <Smile className="w-4 h-4 text-lime shrink-0" />
    }
  ];

  return (
    <div className="bg-navy-900/95 border border-slate-700/80 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-2xl backdrop-blur-md relative overflow-hidden text-left">
      {/* Decorative gradient corner glow */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-lime/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-kanit font-medium bg-slate-800 text-lime border border-lime/30 uppercase tracking-wide">
              <Layers className="w-3 h-3 text-lime" />
              Kirkpatrick Model
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-sarabun text-slate-300 bg-slate-800/80 border border-slate-700">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              มาตรฐานการประเมิน 4 ระดับ
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-kanit font-semibold text-white tracking-tight">
            การติดตามประเมินผลตามทฤษฎี Donald Kirkpatrick
          </h3>
          <p className="text-xs font-sarabun text-slate-300">
            กรอบโครงสร้างการวัดผลโครงการฝึกอบรมหลักสูตร สตง.
          </p>
        </div>
      </div>

      {/* SVG Pyramid Visualization */}
      <div className="relative my-3 p-2 bg-navy-950/80 rounded-xl border border-slate-800/90 shadow-inner">
        <svg
          viewBox="0 0 460 220"
          className="w-full h-auto max-h-[175px] drop-shadow-md select-none mx-auto"
          aria-label="Kirkpatrick's Four Levels of Training Evaluation Pyramid"
        >
          <defs>
            {/* Gradients for each pyramid tier */}
            <linearGradient id="pyr-lvl-4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="pyr-lvl-3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#4338ca" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="pyr-lvl-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="pyr-lvl-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#84cc16" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#4d7c0f" stopOpacity="0.95" />
            </linearGradient>

            <filter id="glow-lvl-active" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Tier 4: Top Triangle (Results) */}
          <g
            className="cursor-pointer transition-transform duration-200 hover:opacity-95"
            onClick={() => setSelectedLevel(selectedLevel === 4 ? null : 4)}
          >
            {/* Apex triangle */}
            <polygon
              points="230,12 185,58 275,58"
              fill="url(#pyr-lvl-4)"
              stroke="#fbbf24"
              strokeWidth={selectedLevel === 4 ? "2.5" : "1"}
            />
            <text x="230" y="38" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="Kanit, sans-serif">
              L4: Results
            </text>
            <text x="230" y="52" textAnchor="middle" fill="#fef3c7" fontSize="9" fontFamily="Sarabun, sans-serif">
              ผลลัพธ์องค์กร สตง.
            </text>
          </g>

          {/* Tier 3: Trapezoid (Behavior) */}
          <g
            className="cursor-pointer transition-transform duration-200 hover:opacity-95"
            onClick={() => setSelectedLevel(selectedLevel === 3 ? null : 3)}
          >
            <polygon
              points="182,62 278,62 322,108 138,108"
              fill="url(#pyr-lvl-3)"
              stroke="#a5b4fc"
              strokeWidth={selectedLevel === 3 ? "2.5" : "1"}
            />
            <text x="230" y="86" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="Kanit, sans-serif">
              L3: Behavior
            </text>
            <text x="230" y="101" textAnchor="middle" fill="#e0e7ff" fontSize="9.5" fontFamily="Sarabun, sans-serif">
              พฤติกรรมการปฏิบัติงานจริง (3-6 เดือน)
            </text>
          </g>

          {/* Tier 2: Trapezoid (Learning) - Active in this system */}
          <g
            className="cursor-pointer transition-transform duration-200 hover:opacity-95"
            onClick={() => setSelectedLevel(selectedLevel === 2 ? null : 2)}
          >
            <polygon
              points="135,112 325,112 370,158 90,158"
              fill="url(#pyr-lvl-2)"
              stroke="#6ee7b7"
              strokeWidth={selectedLevel === 2 ? "2.5" : "1.5"}
            />
            <text x="230" y="136" textAnchor="middle" fill="#ffffff" fontSize="12.5" fontWeight="bold" fontFamily="Kanit, sans-serif">
              L2: Learning (การเรียนรู้) ★
            </text>
            <text x="230" y="151" textAnchor="middle" fill="#d1fae5" fontSize="10" fontFamily="Sarabun, sans-serif">
              วัดผลความรู้ Pre-test / Post-test รายวัน
            </text>
          </g>

          {/* Tier 1: Base Trapezoid (Reaction) - Active in this system */}
          <g
            className="cursor-pointer transition-transform duration-200 hover:opacity-95"
            onClick={() => setSelectedLevel(selectedLevel === 1 ? null : 1)}
          >
            <polygon
              points="87,162 373,162 418,208 42,208"
              fill="url(#pyr-lvl-1)"
              stroke="#bef264"
              strokeWidth={selectedLevel === 1 ? "2.5" : "1.5"}
            />
            <text x="230" y="186" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="Kanit, sans-serif">
              L1: Reaction (ความพึงพอใจ) ★
            </text>
            <text x="230" y="201" textAnchor="middle" fill="#ecfccb" fontSize="10" fontFamily="Sarabun, sans-serif">
              ความพึงพอใจต่อวิทยากรและเนื้อหาหลักสูตรรายวัน
            </text>
          </g>
        </svg>

        {/* Small hint */}
        <div className="flex items-center justify-between px-2 pt-1 text-[10px] text-slate-400 font-sarabun border-t border-slate-800/80 mt-1">
          <span className="flex items-center gap-1 text-lime font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
            ★ กำลังประเมินผลในระบบนี้: Level 1 &amp; 2
          </span>
          <span className="text-slate-400">คลิกที่ชั้นเพื่อดูคำอธิบาย</span>
        </div>
      </div>

      {/* 4 Interactive Tier Cards */}
      <div className="space-y-2 mt-3">
        {levels.map((lvl) => {
          const isSelected = selectedLevel === lvl.level;

          return (
            <div
              key={lvl.level}
              onClick={() => setSelectedLevel(isSelected ? null : lvl.level)}
              className={`group transition-all duration-200 cursor-pointer rounded-xl border p-2.5 sm:p-3 bg-gradient-to-r ${lvl.gradientClass} ${lvl.borderClass} ${
                isSelected ? 'ring-2 ring-lime/60 shadow-lg' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-navy-900/90 border border-slate-700/80 flex items-center justify-center shrink-0">
                    {lvl.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-kanit font-bold text-white tracking-wide">
                        ระดับ {lvl.level}: {lvl.englishTitle}
                      </span>
                      <span className={`text-xs font-sarabun font-medium ${lvl.textClass}`}>
                        ({lvl.thaiTitle})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {lvl.isDailyActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-kanit font-semibold bg-lime text-navy-950 shadow-sm animate-pulse">
                      <CheckCircle2 className="w-3 h-3" />
                      เปิดรับประเมิน
                    </span>
                  ) : (
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-sarabun border ${lvl.badgeBg}`}>
                      {lvl.timing}
                    </span>
                  )}
                  <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isSelected ? 'rotate-90 text-lime' : 'group-hover:translate-x-0.5'}`} />
                </div>
              </div>

              {/* Collapsible detail or always visible compact detail */}
              <p className={`text-xs font-sarabun text-slate-200 mt-1.5 leading-relaxed pl-8.5 ${isSelected ? 'block font-medium text-white' : 'line-clamp-1 sm:line-clamp-none opacity-90'}`}>
                {lvl.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Integration with official notice badge */}
      <div className="mt-3.5 pt-3 border-t border-slate-800 text-[11px] font-sarabun text-slate-300 flex items-center gap-2 bg-navy-950/60 p-2.5 rounded-lg">
        <div className="w-2 h-2 rounded-full bg-lime shrink-0" />
        <span className="leading-snug">
          สอดคล้องกับ <strong className="text-white font-medium">คำชี้แจงข้อ 1 และ 2</strong>: รายงานฉบับนี้ประเมินความพึงพอใจและเรียนรู้รายวัน และสร้างฐานข้อมูลติดตามผล 3–6 เดือนตามระเบียบ
        </span>
      </div>
    </div>
  );
};
