import React, { useState } from 'react';
import { EvaluationDay } from '../types';
import {
  Scale,
  ShieldCheck,
  FileText,
  BookOpen,
  ClipboardCheck,
  CalendarDays,
  Search,
  Award,
  CheckCircle2,
  GraduationCap,
  Building2,
  Copy,
  Check,
  ExternalLink,
  Share2,
} from 'lucide-react';

interface DailyEvaluationSectionProps {
  days: EvaluationDay[];
  userSubmissions: Record<string, boolean>;
  onSelectDay: (dayId: string) => void;
}

// Visual themes for each day: Distinct, refined, eye-catching, not garish
const DAY_THEMES: Record<
  string,
  {
    bgIcon: string;
    textColor: string;
    borderColor: string;
    cardBorderHover: string;
    icon: React.ReactNode;
    tagBg: string;
  }
> = {
  'day-1': {
    bgIcon: 'bg-emerald-50 text-emerald-700',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-200',
    cardBorderHover: 'hover:border-emerald-400 hover:shadow-emerald-100',
    icon: <Scale className="w-6 h-6 text-emerald-600" />,
    tagBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  'day-2': {
    bgIcon: 'bg-indigo-50 text-indigo-700',
    textColor: 'text-indigo-800',
    borderColor: 'border-indigo-200',
    cardBorderHover: 'hover:border-indigo-400 hover:shadow-indigo-100',
    icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
    tagBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  'day-3': {
    bgIcon: 'bg-sky-50 text-sky-700',
    textColor: 'text-sky-800',
    borderColor: 'border-sky-200',
    cardBorderHover: 'hover:border-sky-400 hover:shadow-sky-100',
    icon: <FileText className="w-6 h-6 text-sky-600" />,
    tagBg: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  'day-4': {
    bgIcon: 'bg-violet-50 text-violet-700',
    textColor: 'text-violet-800',
    borderColor: 'border-violet-200',
    cardBorderHover: 'hover:border-violet-400 hover:shadow-violet-100',
    icon: <BookOpen className="w-6 h-6 text-violet-600" />,
    tagBg: 'bg-violet-100 text-violet-800 border-violet-300',
  },
  'day-5': {
    bgIcon: 'bg-amber-50 text-amber-700',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
    cardBorderHover: 'hover:border-amber-400 hover:shadow-amber-100',
    icon: <ClipboardCheck className="w-6 h-6 text-amber-600" />,
    tagBg: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  'day-6': {
    bgIcon: 'bg-teal-50 text-teal-700',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-200',
    cardBorderHover: 'hover:border-teal-400 hover:shadow-teal-100',
    icon: <CalendarDays className="w-6 h-6 text-teal-600" />,
    tagBg: 'bg-teal-100 text-teal-800 border-teal-300',
  },
  'day-7': {
    bgIcon: 'bg-blue-50 text-blue-700',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    cardBorderHover: 'hover:border-blue-400 hover:shadow-blue-100',
    icon: <Search className="w-6 h-6 text-blue-600" />,
    tagBg: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  'day-8': {
    bgIcon: 'bg-rose-50 text-rose-700',
    textColor: 'text-rose-800',
    borderColor: 'border-rose-200',
    cardBorderHover: 'hover:border-rose-400 hover:shadow-rose-100',
    icon: <Award className="w-6 h-6 text-rose-600" />,
    tagBg: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  'day-9': {
    bgIcon: 'bg-orange-50 text-orange-700',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200',
    cardBorderHover: 'hover:border-orange-400 hover:shadow-orange-100',
    icon: <CheckCircle2 className="w-6 h-6 text-orange-600" />,
    tagBg: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  'day-10': {
    bgIcon: 'bg-yellow-50 text-yellow-800',
    textColor: 'text-yellow-900',
    borderColor: 'border-yellow-200',
    cardBorderHover: 'hover:border-yellow-400 hover:shadow-yellow-100',
    icon: <GraduationCap className="w-6 h-6 text-yellow-700" />,
    tagBg: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  },
  'day-special': {
    bgIcon: 'bg-fuchsia-50 text-fuchsia-800',
    textColor: 'text-fuchsia-900',
    borderColor: 'border-fuchsia-200',
    cardBorderHover: 'hover:border-fuchsia-400 hover:shadow-fuchsia-100',
    icon: <Building2 className="w-6 h-6 text-fuchsia-600" />,
    tagBg: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300',
  },
};

export const DailyEvaluationSection: React.FC<DailyEvaluationSectionProps> = ({
  days,
  userSubmissions,
  onSelectDay,
}) => {
  const regularDays = days.filter((d) => !d.isSpecial);
  const specialDay = days.find((d) => d.isSpecial);

  const [copied, setCopied] = useState(false);
  const publicShareUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-f3qnml6gd5e7z6unjomdkv-934646194632.asia-southeast1.run.app';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(publicShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <section id="daily-eval" className="mb-14 scroll-mt-24 space-y-6">
      {/* Public Distribution Link Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 rounded-2xl p-5 sm:p-6 text-white border-b-4 border-lime shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-lime" />
              <span className="text-xs font-kanit font-semibold text-lime uppercase tracking-wider">
                ลิงก์เผยแพร่สำหรับผู้เข้าร่วมอบรม
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-kanit font-bold text-white">
              ลิงก์สำหรับส่งให้ผู้เข้าอบรมตอบแบบสอบถาม
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-sarabun">
              สามารถคัดลอกลิงก์นี้ส่งเข้ากลุ่ม LINE, จดหมายอิเล็กทรอนิกส์ หรือเปิดบนหน้าจอโปรเจกเตอร์ในการอบรม
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <div className="bg-navy-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-lime truncate max-w-xs sm:max-w-sm select-all">
              {publicShareUrl}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-lime hover:bg-lime-dark text-navy-900 rounded-xl text-xs sm:text-sm font-kanit font-bold transition-all shadow-md cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-navy-900" />
                  <span>คัดลอกแล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-navy-900" />
                  <span>คัดลอกลิงก์</span>
                </>
              )}
            </button>

            <a
              href={publicShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-2.5 bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl transition-colors cursor-pointer"
              title="เปิดดูหน้าแบบสอบถาม"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-kanit font-bold text-navy-900">
            เลือกแบบประเมินผลรายวัน
          </h2>
          <p className="text-gray-500 mt-1 font-sarabun text-sm sm:text-base">
            กรุณาเลือกแบบประเมินผลรายวันให้ตรงกับวันที่ท่านเข้ารับการอบรม (16 - 27 พ.ย. 2569)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-kanit font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
            ระบบเปิดรับคำตอบตามกำหนดการอบรม
          </span>
        </div>
      </div>

      {/* Two-column Grid for Daily Evaluations with Distinctive Icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
        {regularDays.map((d) => {
          const isDone = !!userSubmissions[d.id];
          const isOpen = d.status === 'open';
          const isClosed = d.status === 'closed';
          const isWaiting = d.status === 'waiting';

          const theme = DAY_THEMES[d.id] || {
            bgIcon: 'bg-slate-50 text-slate-700',
            textColor: 'text-slate-800',
            borderColor: 'border-slate-200',
            cardBorderHover: 'hover:border-slate-300',
            icon: <CalendarDays className="w-6 h-6 text-slate-600" />,
            tagBg: 'bg-slate-100 text-slate-800 border-slate-300',
          };

          return (
            <div
              key={d.id}
              className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 bg-white shadow-xs ${
                isOpen
                  ? `border-slate-200 ${theme.cardBorderHover} hover:shadow-md`
                  : isClosed
                  ? 'border-rose-200 bg-rose-50/10'
                  : 'border-slate-200 bg-slate-50/50 opacity-90'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Distinctive, Eye-catching Icon Badge */}
                <div
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${theme.bgIcon} ${theme.borderColor} shadow-2xs`}
                >
                  {theme.icon}
                  <span className="text-[10px] font-kanit font-bold leading-none mt-1 opacity-80">
                    วัน {d.dayNumber}
                  </span>
                </div>

                {/* Day Details */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-kanit font-bold px-2 py-0.5 rounded border ${theme.tagBg}`}
                    >
                      {d.dayLabel} · {d.dateStr}
                    </span>

                    {/* Status Badges */}
                    {isOpen && (
                      <span className="text-[11px] font-kanit font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        เปิดรับคำตอบ
                      </span>
                    )}
                    {isClosed && (
                      <span className="text-[11px] font-kanit font-semibold text-rose-700 bg-rose-100 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        ปิดรับคำตอบ
                      </span>
                    )}
                    {isWaiting && (
                      <span className="text-[11px] font-kanit font-semibold text-slate-600 bg-slate-200/70 border border-slate-300 px-2.5 py-0.5 rounded-full">
                        รอข้อมูลแบบสอบถาม
                      </span>
                    )}

                    {isDone && (
                      <span className="text-[11px] font-kanit font-semibold text-teal-700 bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-full">
                        ประเมินแล้ว
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-kanit font-bold text-navy-900 leading-snug">
                    {d.title}
                  </h3>

                  {isWaiting && (
                    <p className="text-xs text-slate-400 font-sarabun">
                      อยู่ระหว่างจัดเตรียมแบบสอบถามตามเนื้อหาวิชาประจำวัน
                    </p>
                  )}
                  {isOpen && (
                    <p className="text-xs text-emerald-700 font-sarabun font-medium">
                      พร้อมรับข้อมูลแบบสอบถามวัดผล Reaction และ Learning
                    </p>
                  )}
                  {isClosed && (
                    <p className="text-xs text-rose-600 font-sarabun">
                      ปิดรับคำตอบสำหรับการอบรมในรอบวันนี้แล้ว
                    </p>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    {isOpen ? (
                      <button
                        type="button"
                        onClick={() => onSelectDay(d.id)}
                        className={`text-xs font-kanit font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs ${
                          isDone
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                            : 'bg-lime text-navy-900 hover:bg-lime-dark hover:text-white'
                        }`}
                      >
                        {isDone ? 'แก้ไขแบบประเมิน' : 'ทำแบบประเมิน'}
                      </button>
                    ) : isClosed ? (
                      <button
                        type="button"
                        disabled
                        className="text-xs font-kanit font-medium px-4 py-2 rounded-xl bg-rose-100 text-rose-600 border border-rose-200 cursor-not-allowed"
                      >
                        ปิดรับคำตอบ
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="text-xs font-kanit font-medium px-4 py-2 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      >
                        รอข้อมูลแบบสอบถาม
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Special Field Trip Card with Distinctive Icon */}
      {specialDay && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-fuchsia-300 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200 shadow-2xs">
              <Building2 className="w-6 h-6 text-fuchsia-600" />
              <span className="text-[10px] font-kanit font-bold leading-none mt-1 text-fuchsia-700">
                พิเศษ
              </span>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-kanit font-bold px-2 py-0.5 rounded border bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300">
                  กิจกรรมพิเศษ
                </span>
                <span className="text-[11px] font-kanit font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                  รอข้อมูลแบบสอบถาม
                </span>
                <span className="text-[11px] font-kanit font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  ยังไม่ได้กำหนดสถานที่
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-kanit font-bold text-navy-900">
                ประเมินผลการศึกษาดูงาน
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-sarabun">
                การศึกษาดูงานหน่วยงานภายนอกเพื่อเสริมสร้างประสบการณ์การตรวจสอบ (จะเปิดรับคำตอบเมื่อกำหนดสถานที่และกำหนดการเสร็จสิ้น)
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  disabled
                  className="text-xs font-kanit font-medium px-4 py-2 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                >
                  รอข้อมูลแบบสอบถาม
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
