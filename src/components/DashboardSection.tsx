import React, { useState } from 'react';
import { EvaluationDay, EvaluationSubmission } from '../types';

interface DashboardSectionProps {
  days: EvaluationDay[];
  submissions: EvaluationSubmission[];
  onBackToHome?: () => void;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  days,
  submissions,
  onBackToHome,
}) => {
  const [selectedView, setSelectedView] = useState<'overall' | 'day-1' | 'day-2'>('overall');

  const day16Subs = submissions.filter((s) => s.dayId === 'day-1');
  const day17Subs = submissions.filter((s) => s.dayId === 'day-2');

  const currentSubs =
    selectedView === 'overall'
      ? submissions
      : selectedView === 'day-1'
      ? day16Subs
      : day17Subs;

  const hasData = currentSubs.length > 0;

  // Helper for averages
  const calcAvg = (
    list: EvaluationSubmission[],
    getter: (s: EvaluationSubmission) => number | undefined
  ) => {
    const valid = list
      .map(getter)
      .filter((v): v is number => typeof v === 'number' && !isNaN(v));
    if (valid.length === 0) return 0;
    return Number((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2));
  };

  // Demographics calculation
  const centralCount = currentSubs.filter((s) => s.generalInfo.workArea === 'central').length;
  const regionalCount = currentSubs.filter((s) => s.generalInfo.workArea === 'regional').length;
  const seniorCount = currentSubs.filter(
    (s) => s.generalInfo.position === 'senior_professional'
  ).length;
  const specialCount = currentSubs.filter(
    (s) => s.generalInfo.position === 'special_professional'
  ).length;

  // Overall metric
  const overallAvg = calcAvg(currentSubs, (s) => s.overallSatisfaction);
  const overallPercent = Math.round((overallAvg / 5) * 100);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-navy-900 rounded-2xl p-6 sm:p-8 text-white border-b-4 border-lime shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-kanit font-semibold text-navy-900 bg-lime px-2.5 py-0.5 rounded">
                EXECUTIVE DASHBOARD
              </span>
              <span className="text-xs text-slate-300 font-sarabun">
                สำนักงานการตรวจเงินแผ่นดิน
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-kanit font-bold text-white">
              แดชบอร์ดสรุปผลการประเมินโครงการ
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sarabun mt-1">
              หลักสูตร "การตรวจสอบการปฏิบัติตามกฎหมาย ระดับกลาง" · ข้อมูลอัปเดตแบบ Real-time
            </p>
          </div>

          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="px-4 py-2 bg-navy-800 hover:bg-navy-700 text-lime border border-lime/40 rounded-lg text-xs font-kanit font-semibold transition-colors cursor-pointer self-start md:self-auto"
            >
              ← กลับสู่หน้าหลัก
            </button>
          )}
        </div>
      </div>

      {/* Sub-view Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setSelectedView('overall')}
          className={`px-4 py-2 rounded-lg font-kanit text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            selectedView === 'overall'
              ? 'bg-navy-900 text-lime shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          ภาพรวมทุกวัน ({submissions.length} ฉบับ)
        </button>

        <button
          onClick={() => setSelectedView('day-1')}
          className={`px-4 py-2 rounded-lg font-kanit text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            selectedView === 'day-1'
              ? 'bg-navy-900 text-lime shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          วันที่ 16 พ.ย. 2569 (ประเด็นกฎหมาย/แนวปฏิบัติ) · {day16Subs.length} ฉบับ
        </button>

        <button
          onClick={() => setSelectedView('day-2')}
          className={`px-4 py-2 rounded-lg font-kanit text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            selectedView === 'day-2'
              ? 'bg-navy-900 text-lime shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          วันที่ 17 พ.ย. 2569 (พยานหลักฐาน/Readiness) · {day17Subs.length} ฉบับ
        </button>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <h3 className="text-xl font-kanit font-semibold text-charcoal mb-2">
            ยังไม่มีข้อมูลผลการประเมินในมุมมองนี้
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-sarabun max-w-md mx-auto leading-relaxed">
            เมื่อผู้เข้าอบรมส่งแบบสอบถามในระบบ สถิติการประเมิน Kirkpatrick Level 1 ถึง 4 จะถูกประมวลผลและแสดงที่นี่โดยอัตโนมัติ
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top High-level KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-kanit text-slate-500 block mb-1">
                คะแนนความพึงพอใจรวม
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-kanit text-navy-900 tabular-nums">
                  {overallAvg.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 font-sarabun">/ 5.00</span>
                <span className="text-xs font-kanit text-lime-dark bg-lime/10 px-2 py-0.5 rounded">
                  {overallPercent}%
                </span>
              </div>
              <p className="text-[11px] text-emerald-600 font-sarabun mt-1">
                {overallAvg >= 4.5
                  ? 'ระดับ "มากที่สุด" (เกณฑ์ดีเลิศ)'
                  : overallAvg >= 3.5
                  ? 'ระดับ "มาก"'
                  : 'ระดับปานกลาง'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-kanit text-slate-500 block mb-1">
                จำนวนแบบประเมินที่บันทึก
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-kanit text-navy-900 tabular-nums">
                  {currentSubs.length}
                </span>
                <span className="text-xs text-slate-400 font-sarabun">ฉบับ</span>
              </div>
              <p className="text-[11px] text-slate-500 font-sarabun mt-1">
                ผู้เข้าอบรมตอบแบบสอบถามจริง
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-kanit text-slate-500 block mb-1">
                การกระจายตามพื้นที่
              </span>
              <div className="flex items-center justify-between text-xs font-kanit text-slate-700 mt-2">
                <span>ส่วนกลาง: {centralCount} ฉบับ</span>
                <span>ส่วนภูมิภาค: {regionalCount} ฉบับ</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden flex">
                <div
                  className="bg-navy-800 h-2"
                  style={{ width: `${(centralCount / currentSubs.length) * 100}%` }}
                ></div>
                <div
                  className="bg-lime h-2"
                  style={{ width: `${(regionalCount / currentSubs.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-kanit text-slate-500 block mb-1">
                สัดส่วนระดับตำแหน่ง
              </span>
              <div className="flex items-center justify-between text-xs font-kanit text-slate-700 mt-2">
                <span>ชำนาญการ: {seniorCount}</span>
                <span>ชำนาญการพิเศษ: {specialCount}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden flex">
                <div
                  className="bg-navy-900 h-2"
                  style={{ width: `${(seniorCount / currentSubs.length) * 100}%` }}
                ></div>
                <div
                  className="bg-lime h-2"
                  style={{ width: `${(specialCount / currentSubs.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* VIEW: DAY 16 SPECIFIC STRUCTURE */}
          {selectedView === 'day-1' && (
            <div className="space-y-6">
              {/* Level 1 Reaction */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="font-kanit font-bold text-lg text-navy-900">
                    Level 1: Reaction (ความพึงพอใจต่อเนื้อหาและวิทยากร 16 พ.ย. 2569)
                  </h3>
                  <span className="text-xs font-kanit text-slate-400">เต็ม 5.00 คะแนน</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Content Score */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-kanit font-semibold text-sm text-navy-900">
                      ด้านเนื้อหาวิชา
                    </h4>
                    <p className="text-xs text-slate-600 font-sarabun">
                      1. ความสอดคล้องกับบทบาท: <span className="font-bold text-slate-900">{calcAvg(day16Subs, (s) => s.day16Data?.contentScore1)}</span>
                    </p>
                    <p className="text-xs text-slate-600 font-sarabun">
                      2. ความเหมาะสมกับกฎหมาย/ระเบียบ สตง.: <span className="font-bold text-slate-900">{calcAvg(day16Subs, (s) => s.day16Data?.contentScore2)}</span>
                    </p>
                    <p className="text-xs text-slate-600 font-sarabun">
                      3. การนำไปประยุกต์ใช้กำกับงาน: <span className="font-bold text-slate-900">{calcAvg(day16Subs, (s) => s.day16Data?.contentScore3)}</span>
                    </p>
                  </div>

                  {/* Morning Lecturer */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-kanit font-semibold text-sm text-navy-900">
                      วิทยากรประจำวัน (ภาคเช้า)
                    </h4>
                    <p className="text-xs text-slate-600 font-sarabun">
                      4. ความรู้ ความเชี่ยวชาญ: <span className="font-bold text-slate-900">{calcAvg(day16Subs, (s) => s.day16Data?.lecturerMorning1)}</span>
                    </p>
                    <p className="text-xs text-slate-600 font-sarabun">
                      5. ถ่ายทอดเนื้อหาชัดเจน: <span className="font-bold text-slate-900">{calcAvg(day16Subs, (s) => s.day16Data?.lecturerMorning2)}</span>
                    </p>
                    <p className="text-xs text-slate-600 font-sarabun">
                      6. กระตุ้นแลกเปลี่ยน/ตอบข้อซักถาม: <span className="font-bold text-slate-900">{calcAvg(day16Subs, (s) => s.day16Data?.lecturerMorning3)}</span>
                    </p>
                  </div>

                  {/* Afternoon Lecturer */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-kanit font-semibold text-sm text-navy-900">
                      วิทยากรประจำวัน (ภาคบ่าย)
                    </h4>
                    <p className="text-xs text-slate-600 font-sarabun">
                      4. ความรู้ ความเชี่ยวชาญ: <span className="font-bold text-slate-900">{calcAvg(day16Subs, (s) => s.day16Data?.lecturerAfternoon1)}</span>
                    </p>
                    <p className="text-xs text-slate-600 font-sarabun">
                      5. ถ่ายทอดเนื้อหาชัดเจน: <span className="font-bold text-slate-900">{calcAvg(day16Subs, (s) => s.day16Data?.lecturerAfternoon2)}</span>
                    </p>
                    <p className="text-xs text-slate-600 font-sarabun">
                      6. กระตุ้นแลกเปลี่ยน/ตอบข้อซักถาม: <span className="font-bold text-slate-900">{calcAvg(day16Subs, (s) => s.day16Data?.lecturerAfternoon3)}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Level 2 Learning: Pre/Post & optional Scenario */}
              {day16Subs.some((s) => (s.day16Data?.scenario1 ?? 0) > 0) ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pre / Post Gain */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <h3 className="font-kanit font-bold text-base text-navy-900 pb-2 border-b">
                      3.1 วัดผลการเรียนรู้ ก่อน-หลัง อบรม (Knowledge Gain)
                    </h3>

                    {/* Topic 1 */}
                    <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      <p className="text-xs font-kanit font-semibold text-slate-800">
                        หัวข้อ 1: ทบทวนสาระสำคัญความรู้กฎหมายและแนวปฏิบัติ
                      </p>
                      <div className="flex items-center justify-between text-xs font-sarabun pt-1">
                        <span>ก่อนอบรม: <b className="text-slate-700">{calcAvg(day16Subs, (s) => s.day16Data?.topic1Pre)}</b> / 5</span>
                        <span>หลังอบรม: <b className="text-emerald-700">{calcAvg(day16Subs, (s) => s.day16Data?.topic1Post)}</b> / 5</span>
                        <span className="font-kanit font-bold text-xs text-lime-dark bg-lime/20 px-2 py-0.5 rounded">
                          +{Number((calcAvg(day16Subs, (s) => s.day16Data?.topic1Post) - calcAvg(day16Subs, (s) => s.day16Data?.topic1Pre)).toFixed(2))} คะแนน
                        </span>
                      </div>
                    </div>

                    {/* Topic 2 */}
                    <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      <p className="text-xs font-kanit font-semibold text-slate-800">
                        หัวข้อ 2: ตรวจสอบการปฏิบัติตามกฎหมายเพื่อกำกับ แนะนำ
                      </p>
                      <div className="flex items-center justify-between text-xs font-sarabun pt-1">
                        <span>ก่อนอบรม: <b className="text-slate-700">{calcAvg(day16Subs, (s) => s.day16Data?.topic2Pre)}</b> / 5</span>
                        <span>หลังอบรม: <b className="text-emerald-700">{calcAvg(day16Subs, (s) => s.day16Data?.topic2Post)}</b> / 5</span>
                        <span className="font-kanit font-bold text-xs text-lime-dark bg-lime/20 px-2 py-0.5 rounded">
                          +{Number((calcAvg(day16Subs, (s) => s.day16Data?.topic2Post) - calcAvg(day16Subs, (s) => s.day16Data?.topic2Pre)).toFixed(2))} คะแนน
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3.2 Scenario-based Assessment */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <h3 className="font-kanit font-bold text-base text-navy-900 pb-2 border-b">
                      3.2 การประเมินผ่านสถานการณ์จำลอง (Scenario Assessment)
                    </h3>
                    <p className="text-xs text-slate-500 font-sarabun">
                      คะแนนแนวโน้มความเหมาะสมในการปฏิบัติในฐานะหัวหน้างาน (1-5)
                    </p>

                    <div className="space-y-2.5 text-xs font-sarabun">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                        <span className="text-slate-700">1. สั่งการกำหนดประเด็นเพิ่มและวางแผนสอบถ้อยคำพยาน</span>
                        <span className="font-kanit font-bold text-emerald-700">{calcAvg(day16Subs, (s) => s.day16Data?.scenario1)} / 5</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                        <span className="text-slate-700">2. อนุมัติผ่านรายงานตามที่เสนอ (ลดภาระงาน)</span>
                        <span className="font-kanit font-bold text-slate-600">{calcAvg(day16Subs, (s) => s.day16Data?.scenario2)} / 5</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                        <span className="text-slate-700">3. แนะนำเทคนิคทางจิตวิทยาในการสอบถ้อยคำ</span>
                        <span className="font-kanit font-bold text-emerald-700">{calcAvg(day16Subs, (s) => s.day16Data?.scenario3)} / 5</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-kanit font-bold text-base sm:text-lg text-navy-900">
                        Level 2: Learning (วัดผลสัมฤทธิ์การเรียนรู้ ก่อน-หลัง การฝึกอบรม 16 พ.ย.)
                      </h3>
                      <p className="text-xs text-slate-500 font-sarabun mt-0.5">
                        เปรียบเทียบค่าเฉลี่ยระดับความรู้ความเข้าใจ ก่อนเริ่มอบรม (Pre) และ หลังจบการอบรม (Post)
                      </p>
                    </div>
                    <span className="text-xs font-kanit font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 self-start sm:self-auto">
                      Knowledge Gain ชัดเจน
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Topic 1 */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <span className="inline-block px-2.5 py-0.5 bg-navy-900 text-lime text-xs font-kanit font-bold rounded">
                        หัวข้อที่ 1
                      </span>
                      <h4 className="font-kanit font-semibold text-sm text-navy-900 leading-snug">
                        ทบทวนสาระสำคัญความรู้กฎหมายและแนวปฏิบัติ
                      </h4>
                      <div className="pt-2 flex items-center justify-between text-xs font-sarabun border-t border-slate-200/80">
                        <span>ก่อน: <b className="text-amber-800">{calcAvg(day16Subs, (s) => s.day16Data?.topic1Pre)}</b> / 5</span>
                        <span>หลัง: <b className="text-emerald-800">{calcAvg(day16Subs, (s) => s.day16Data?.topic1Post)}</b> / 5</span>
                        <span className="font-kanit font-bold text-xs text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                          +{Number((calcAvg(day16Subs, (s) => s.day16Data?.topic1Post) - calcAvg(day16Subs, (s) => s.day16Data?.topic1Pre)).toFixed(2))} ระดับ
                        </span>
                      </div>
                    </div>

                    {/* Topic 2 */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <span className="inline-block px-2.5 py-0.5 bg-navy-900 text-lime text-xs font-kanit font-bold rounded">
                        หัวข้อที่ 2
                      </span>
                      <h4 className="font-kanit font-semibold text-sm text-navy-900 leading-snug">
                        ตรวจสอบการปฏิบัติตามกฎหมายเพื่อกำกับ แนะนำ
                      </h4>
                      <div className="pt-2 flex items-center justify-between text-xs font-sarabun border-t border-slate-200/80">
                        <span>ก่อน: <b className="text-amber-800">{calcAvg(day16Subs, (s) => s.day16Data?.topic2Pre)}</b> / 5</span>
                        <span>หลัง: <b className="text-emerald-800">{calcAvg(day16Subs, (s) => s.day16Data?.topic2Post)}</b> / 5</span>
                        <span className="font-kanit font-bold text-xs text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                          +{Number((calcAvg(day16Subs, (s) => s.day16Data?.topic2Post) - calcAvg(day16Subs, (s) => s.day16Data?.topic2Pre)).toFixed(2))} ระดับ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Level 3 & 4 Baseline */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
                <h3 className="font-kanit font-bold text-base text-navy-900 pb-2 border-b">
                  Level 3 & Level 4: ข้อมูลพื้นฐานสำหรับติดตาม (Baseline)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sarabun">
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-600 mb-1">ความมั่นใจนำไปปรับใช้/สอนงาน:</p>
                    <p className="text-xl font-kanit font-bold text-navy-900">{calcAvg(day16Subs, (s) => s.day16Data?.baseline1)} / 5.00</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-600 mb-1">ช่วยยกระดับมาตรฐานทีมงาน:</p>
                    <p className="text-xl font-kanit font-bold text-navy-900">{calcAvg(day16Subs, (s) => s.day16Data?.baseline2)} / 5.00</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-600 mb-1">คาดว่าจะนำไปปรับใช้จริง:</p>
                    <p className="text-xl font-kanit font-bold text-navy-900">{calcAvg(day16Subs, (s) => s.day16Data?.baseline3)} / 5.00</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: DAY 17 SPECIFIC STRUCTURE */}
          {selectedView === 'day-2' && (
            <div className="space-y-6">
              {/* Level 1 Reaction */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="font-kanit font-bold text-lg text-navy-900">
                    Level 1: Reaction (ความพึงพอใจต่อเนื้อหาและวิทยากร 17 พ.ย. 2569)
                  </h3>
                  <span className="text-xs font-kanit text-slate-400">เต็ม 5.00 คะแนน</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Content Score */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-kanit font-semibold text-sm text-navy-900">
                      ด้านเนื้อหาวิชาประจำวัน
                    </h4>
                    <p className="text-xs text-slate-600 font-sarabun">
                      1. ความสอดคล้องกับบทบาท: <span className="font-bold text-slate-900">{calcAvg(day17Subs, (s) => s.day17Data?.contentScore1)}</span>
                    </p>
                    <p className="text-xs text-slate-600 font-sarabun">
                      2. ความเหมาะสมกับกฎหมาย/ระเบียบ สตง.: <span className="font-bold text-slate-900">{calcAvg(day17Subs, (s) => s.day17Data?.contentScore2)}</span>
                    </p>
                    <p className="text-xs text-slate-600 font-sarabun">
                      3. การนำไปประยุกต์ใช้กำกับงาน: <span className="font-bold text-slate-900">{calcAvg(day17Subs, (s) => s.day17Data?.contentScore3)}</span>
                    </p>
                  </div>

                  {/* Full Day Lecturer */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-kanit font-semibold text-sm text-navy-900">
                      วิทยากรประจำวัน (ทั้งวัน)
                    </h4>
                    <p className="text-xs text-slate-600 font-sarabun">
                      4. ความรู้ ความเชี่ยวชาญ: <span className="font-bold text-slate-900">{calcAvg(day17Subs, (s) => s.day17Data?.lecturerFullDay1)}</span>
                    </p>
                    <p className="text-xs text-slate-600 font-sarabun">
                      5. ถ่ายทอดเนื้อหาชัดเจน: <span className="font-bold text-slate-900">{calcAvg(day17Subs, (s) => s.day17Data?.lecturerFullDay2)}</span>
                    </p>
                    <p className="text-xs text-slate-600 font-sarabun">
                      6. กระตุ้นแลกเปลี่ยน/ตอบข้อซักถาม: <span className="font-bold text-slate-900">{calcAvg(day17Subs, (s) => s.day17Data?.lecturerFullDay3)}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Level 2 Learning: Pre/Post & Capability Readiness */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pre / Post Gain */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h3 className="font-kanit font-bold text-base text-navy-900 pb-2 border-b">
                    3.1 วัดผลการเรียนรู้ ก่อน-หลัง อบรม (Knowledge Gain)
                  </h3>

                  <div className="space-y-1.5 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-xs font-kanit font-semibold text-slate-800">
                      หัวข้อ: เทคนิคและทักษะการรวบรวมพยานหลักฐาน (กรณีมีความเสียหาย/ทุจริต/จงใจ)
                    </p>
                    <div className="flex items-center justify-between text-xs font-sarabun pt-2">
                      <span>ก่อนอบรม: <b className="text-slate-700">{calcAvg(day17Subs, (s) => s.day17Data?.topic1Pre)}</b> / 5</span>
                      <span>หลังอบรม: <b className="text-emerald-700">{calcAvg(day17Subs, (s) => s.day17Data?.topic1Post)}</b> / 5</span>
                      <span className="font-kanit font-bold text-xs text-lime-dark bg-lime/20 px-2 py-0.5 rounded">
                        +{Number((calcAvg(day17Subs, (s) => s.day17Data?.topic1Post) - calcAvg(day17Subs, (s) => s.day17Data?.topic1Pre)).toFixed(2))} คะแนน
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3.2 Capability & Readiness Assessment */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h3 className="font-kanit font-bold text-base text-navy-900 pb-2 border-b">
                    3.2 ระดับความสามารถและความพร้อม (Capability & Readiness)
                  </h3>
                  <p className="text-xs text-slate-500 font-sarabun">
                    คะแนนประเมินแนวโน้มการปฏิบัติในฐานะหัวหน้างาน (1-5)
                  </p>

                  <div className="space-y-2.5 text-xs font-sarabun">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-700">1. กำหนดกรอบกำกับความถูกต้องและครบถ้วน</span>
                      <span className="font-kanit font-bold text-emerald-700">{calcAvg(day17Subs, (s) => s.day17Data?.readiness1)} / 5</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-700">2. ให้คำปรึกษาสอนงานเพื่อป้องกันข้อผิดพลาด</span>
                      <span className="font-kanit font-bold text-emerald-700">{calcAvg(day17Subs, (s) => s.day17Data?.readiness2)} / 5</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-700">3. ตัดสินใจทางวิชาชีพรอบคอบและมีหลักการ</span>
                      <span className="font-kanit font-bold text-emerald-700">{calcAvg(day17Subs, (s) => s.day17Data?.readiness3)} / 5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Level 3 & 4 Baseline */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
                <h3 className="font-kanit font-bold text-base text-navy-900 pb-2 border-b">
                  Level 3 & Level 4: ข้อมูลพื้นฐานสำหรับติดตาม (Baseline)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sarabun">
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-600 mb-1">ความมั่นใจนำไปปรับใช้/สอนงาน:</p>
                    <p className="text-xl font-kanit font-bold text-navy-900">{calcAvg(day17Subs, (s) => s.day17Data?.baseline1)} / 5.00</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-600 mb-1">ช่วยยกระดับมาตรฐานทีมงาน:</p>
                    <p className="text-xl font-kanit font-bold text-navy-900">{calcAvg(day17Subs, (s) => s.day17Data?.baseline2)} / 5.00</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-600 mb-1">คาดว่าจะนำไปปรับใช้จริง:</p>
                    <p className="text-xl font-kanit font-bold text-navy-900">{calcAvg(day17Subs, (s) => s.day17Data?.baseline3)} / 5.00</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: OVERALL SUMMARY (All days combined) */}
          {selectedView === 'overall' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Day-by-Day comparison card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="font-kanit font-bold text-base text-navy-900 pb-2 border-b">
                  เปรียบเทียบผลการประเมินรายวัน
                </h3>
                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-kanit font-semibold text-xs sm:text-sm text-navy-900">
                        วันที่ 16 พ.ย. 2569 (ประเด็นกฎหมาย/Scenario)
                      </p>
                      <p className="text-[11px] text-slate-500 font-sarabun">
                        ส่งแล้ว {day16Subs.length} ฉบับ
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-kanit font-bold text-base text-navy-900">
                        {calcAvg(day16Subs, (s) => s.overallSatisfaction).toFixed(2)} / 5.00
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-kanit font-semibold text-xs sm:text-sm text-navy-900">
                        วันที่ 17 พ.ย. 2569 (พยานหลักฐาน/Readiness)
                      </p>
                      <p className="text-[11px] text-slate-500 font-sarabun">
                        ส่งแล้ว {day17Subs.length} ฉบับ
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-kanit font-bold text-base text-navy-900">
                        {calcAvg(day17Subs, (s) => s.overallSatisfaction).toFixed(2)} / 5.00
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kirkpatrick Model Summary */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="font-kanit font-bold text-base text-navy-900 pb-2 border-b">
                  สรุปกรอบการประเมิน 4 ระดับ (Kirkpatrick Model)
                </h3>
                <div className="space-y-2 text-xs font-sarabun">
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Level 1 Reaction: ความพึงพอใจต่อหลักสูตร</span>
                    <span className="font-kanit font-bold text-navy-900">{overallAvg.toFixed(2)} / 5.00</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Level 2 Learning: การเพิ่มขึ้นขององค์ความรู้</span>
                    <span className="font-kanit font-bold text-emerald-700">วัดผล Pre/Post ครบถ้วน</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Level 3 Behavior: แนวโน้มนำไปปรับใช้จริง</span>
                    <span className="font-kanit font-bold text-navy-900">ติดตาม 3-6 เดือนถัดไป</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Level 4 Results: ผลสัมฤทธิ์ต่อ สตง.</span>
                    <span className="font-kanit font-bold text-navy-900">ยกระดับมาตรฐานตรวจสอบ</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Qualitative Feedback from Participants */}
          {currentSubs.some((s) => s.suggestions?.trim() || s.day16Data?.lecturerComment || s.day17Data?.lecturerComment) && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-kanit font-bold text-base text-navy-900 pb-2 border-b">
                ข้อเสนอแนะและข้อคิดเห็นจากผู้เข้าอบรมจริง
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSubs
                  .filter((s) => s.suggestions?.trim() || s.day16Data?.lecturerComment || s.day17Data?.lecturerComment)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs font-sarabun"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-kanit font-semibold text-navy-900">
                          {s.dayTitle}
                        </span>
                        <span className="text-slate-400 text-[11px]">{s.timestamp}</span>
                      </div>

                      {(s.day16Data?.lecturerComment || s.day17Data?.lecturerComment) && (
                        <p className="text-slate-700">
                          <span className="font-semibold text-slate-900">ความเห็นต่อวิทยากร:</span>{' '}
                          "{s.day16Data?.lecturerComment || s.day17Data?.lecturerComment}"
                        </p>
                      )}

                      {s.suggestions && (
                        <p className="text-slate-700">
                          <span className="font-semibold text-slate-900">ข้อเสนอแนะเพิ่มเติม:</span>{' '}
                          "{s.suggestions}"
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                        {s.generalInfo.workArea === 'central' ? 'ส่วนกลาง' : 'ส่วนภูมิภาค'} ({s.generalInfo.bureauName}) ·{' '}
                        {s.generalInfo.position === 'senior_professional' ? 'ชำนาญการ' : 'ชำนาญการพิเศษ'}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
