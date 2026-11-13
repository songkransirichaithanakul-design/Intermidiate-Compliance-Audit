import React, { useState } from 'react';
import { EvaluationDay, EvaluationSubmission } from '../types';
import {
  QUESTIONNAIRE_CONFIGS,
  OVERALL_PROJECT_QUESTIONS,
  READINESS_QUESTIONS,
  CONTENT_QUESTIONS,
  BASELINE_QUESTIONS,
  normalizeSubmissionDailyData,
} from '../data/questionnaireConfigs';

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
  const [selectedView, setSelectedView] = useState<string>('overall');

  const preparedDays = days.filter((d) => !!QUESTIONNAIRE_CONFIGS[d.id]);

  const currentSubs =
    selectedView === 'overall'
      ? submissions
      : submissions.filter((s) => s.dayId === selectedView);

  const hasData = currentSubs.length > 0;
  const activeConfig = selectedView !== 'overall' ? QUESTIONNAIRE_CONFIGS[selectedView] : undefined;

  const calcAvg = (
    list: EvaluationSubmission[],
    getter: (s: EvaluationSubmission) => number | undefined
  ) => {
    const valid = list
      .map(getter)
      .filter((v): v is number => typeof v === 'number' && !isNaN(v) && v > 0);
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

  // Cross-day Knowledge Gain & Baseline summary for overall tab
  const allNormalized = currentSubs
    .map((s) => ({ sub: s, data: normalizeSubmissionDailyData(s) }))
    .filter((x): x is { sub: EvaluationSubmission; data: NonNullable<ReturnType<typeof normalizeSubmissionDailyData>> } => !!x.data);

  const overallGainAvg = (() => {
    const gains: number[] = [];
    for (const item of allNormalized) {
      for (const topic of Object.values(item.data.learningTopics || {})) {
        if (topic.pre > 0 && topic.post > 0) {
          gains.push(topic.post - topic.pre);
        }
      }
    }
    if (gains.length === 0) return 0;
    return Number((gains.reduce((a, b) => a + b, 0) / gains.length).toFixed(2));
  })();

  const overallBaselineAvg = calcAvg(currentSubs, (s) => {
    const d = normalizeSubmissionDailyData(s);
    if (!d) return undefined;
    return (d.baseline1 + d.baseline2 + d.baseline3) / 3;
  });

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
              หลักสูตร &quot;การตรวจสอบการปฏิบัติตามกฎหมาย ระดับกลาง&quot; · ข้อมูลอัปเดตแบบ Real-time
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

      {/* Sub-view Selector Tabs (All Prepared Days) */}
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

        {preparedDays.map((d) => {
          const dayCount = submissions.filter((s) => s.dayId === d.id).length;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedView(d.id)}
              className={`px-3.5 py-2 rounded-lg font-kanit text-xs font-semibold transition-all cursor-pointer ${
                selectedView === d.id
                  ? 'bg-navy-900 text-lime shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {d.dateStr} ({dayCount})
            </button>
          );
        })}
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

          {/* VIEW: DYNAMIC PER-DAY VIEW (Any of the 9 prepared days) */}
          {activeConfig && (
            <div className="space-y-6">
              {/* Level 1 Reaction */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-kanit font-bold text-lg text-navy-900">
                      Level 1: Reaction (ความพึงพอใจต่อเนื้อหาและวิทยากร · {activeConfig.dateFullLabel})
                    </h3>
                    <p className="text-xs text-slate-500 font-sarabun">
                      หัวข้อวิชา: {activeConfig.shortTopic}
                    </p>
                  </div>
                  <span className="text-xs font-kanit text-slate-400">เต็ม 5.00 คะแนน</span>
                </div>

                <div
                  className={`grid grid-cols-1 ${
                    activeConfig.lecturerSessions.length > 1 ? 'md:grid-cols-3' : 'md:grid-cols-2'
                  } gap-4`}
                >
                  {/* Content Score */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-kanit font-semibold text-sm text-navy-900">
                      ด้านเนื้อหาวิชาประจำวัน
                    </h4>
                    <p className="text-xs text-slate-600 font-sarabun">
                      1. ความสอดคล้องกับบทบาท:{' '}
                      <span className="font-bold text-slate-900">
                        {calcAvg(currentSubs, (s) => normalizeSubmissionDailyData(s)?.contentScore1)}
                      </span>
                    </p>
                    <p className="text-xs text-slate-600 font-sarabun">
                      2. ความเหมาะสมกับกฎหมาย/ระเบียบ สตง.:{' '}
                      <span className="font-bold text-slate-900">
                        {calcAvg(currentSubs, (s) => normalizeSubmissionDailyData(s)?.contentScore2)}
                      </span>
                    </p>
                    <p className="text-xs text-slate-600 font-sarabun">
                      3. การนำไปประยุกต์ใช้กำกับงาน:{' '}
                      <span className="font-bold text-slate-900">
                        {calcAvg(currentSubs, (s) => normalizeSubmissionDailyData(s)?.contentScore3)}
                      </span>
                    </p>
                  </div>

                  {/* Lecturer Sessions */}
                  {activeConfig.lecturerSessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2"
                    >
                      <div>
                        <h4 className="font-kanit font-semibold text-sm text-navy-900">
                          ด้านวิทยากร ({session.sessionLabel})
                        </h4>
                        {session.speakerName && (
                          <p className="text-[11px] font-sarabun text-emerald-700 font-semibold">
                            {session.speakerName}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-sarabun">
                        4. ความรู้ ความเชี่ยวชาญ:{' '}
                        <span className="font-bold text-slate-900">
                          {calcAvg(
                            currentSubs,
                            (s) => normalizeSubmissionDailyData(s)?.lecturerScores[session.id]?.q4
                          )}
                        </span>
                      </p>
                      <p className="text-xs text-slate-600 font-sarabun">
                        5. ถ่ายทอดเนื้อหาชัดเจน:{' '}
                        <span className="font-bold text-slate-900">
                          {calcAvg(
                            currentSubs,
                            (s) => normalizeSubmissionDailyData(s)?.lecturerScores[session.id]?.q5
                          )}
                        </span>
                      </p>
                      <p className="text-xs text-slate-600 font-sarabun">
                        6. กระตุ้นแลกเปลี่ยน/ตอบข้อซักถาม:{' '}
                        <span className="font-bold text-slate-900">
                          {calcAvg(
                            currentSubs,
                            (s) => normalizeSubmissionDailyData(s)?.lecturerScores[session.id]?.q6
                          )}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day 27 Only: Overall Project Evaluation (Items 8-15) */}
              {activeConfig.hasOverallProjectEval && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <h3 className="font-kanit font-bold text-lg text-navy-900">
                      ความพึงพอใจต่อโครงการฝึกอบรมในภาพรวม (ข้อ 8–15)
                    </h3>
                    <span className="text-xs font-kanit font-semibold text-navy-900 bg-lime/25 px-2.5 py-0.5 rounded">
                      ประเมินสรุปจบโครงการ
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <h4 className="font-kanit font-semibold text-sm text-navy-900">
                        ด้านเนื้อหาสาระทั้งโครงการ (ข้อ 8–11)
                      </h4>
                      {OVERALL_PROJECT_QUESTIONS.filter((q) => q.category === 'content').map((q) => (
                        <div key={q.key} className="flex items-start justify-between gap-2 text-xs font-sarabun">
                          <span className="text-slate-600">{q.label}</span>
                          <span className="font-kanit font-bold text-navy-900 shrink-0">
                            {calcAvg(
                              currentSubs,
                              (s) => normalizeSubmissionDailyData(s)?.overallProject?.[q.key]
                            ).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <h4 className="font-kanit font-semibold text-sm text-navy-900">
                        ด้านการบริหารจัดการโครงการ (ข้อ 12–15)
                      </h4>
                      {OVERALL_PROJECT_QUESTIONS.filter((q) => q.category === 'management').map((q) => (
                        <div key={q.key} className="flex items-start justify-between gap-2 text-xs font-sarabun">
                          <span className="text-slate-600">{q.label}</span>
                          <span className="font-kanit font-bold text-navy-900 shrink-0">
                            {calcAvg(
                              currentSubs,
                              (s) => normalizeSubmissionDailyData(s)?.overallProject?.[q.key]
                            ).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Level 2 Learning: 3.1 Pre/Post + 3.2 Readiness */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div
                  className={`bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 ${
                    !activeConfig.hasReadiness ? 'lg:col-span-2' : ''
                  }`}
                >
                  <h3 className="font-kanit font-bold text-base text-navy-900 pb-2 border-b">
                    3.1 วัดผลการเรียนรู้ ก่อน-หลัง อบรม (Knowledge Gain)
                  </h3>

                  <div
                    className={`grid grid-cols-1 ${
                      !activeConfig.hasReadiness && activeConfig.learningTopics.length > 1
                        ? 'md:grid-cols-2'
                        : ''
                    } gap-3`}
                  >
                    {activeConfig.learningTopics.map((topic, idx) => {
                      const preAvg = calcAvg(
                        currentSubs,
                        (s) => normalizeSubmissionDailyData(s)?.learningTopics[topic.id]?.pre
                      );
                      const postAvg = calcAvg(
                        currentSubs,
                        (s) => normalizeSubmissionDailyData(s)?.learningTopics[topic.id]?.post
                      );
                      const diff = Number((postAvg - preAvg).toFixed(2));
                      return (
                        <div
                          key={topic.id}
                          className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200"
                        >
                          <p className="text-xs font-kanit font-semibold text-slate-800 leading-snug">
                            หัวข้อ {idx + 1}: {topic.title}
                          </p>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-sarabun pt-1.5 border-t border-slate-200/80">
                            <span>
                              ก่อนอบรม: <b className="text-amber-800">{preAvg}</b> / 5
                            </span>
                            <span>
                              หลังอบรม: <b className="text-emerald-700">{postAvg}</b> / 5
                            </span>
                            <span className="font-kanit font-bold text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                              {diff >= 0 ? `+${diff}` : diff} คะแนน
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {activeConfig.hasReadiness && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <h3 className="font-kanit font-bold text-base text-navy-900 pb-2 border-b">
                      3.2 ระดับความสามารถและความพร้อม (Capability &amp; Readiness)
                    </h3>
                    <p className="text-xs text-slate-500 font-sarabun">
                      คะแนนประเมินแนวโน้มการปฏิบัติในฐานะหัวหน้างาน (1-5)
                    </p>

                    <div className="space-y-2.5 text-xs font-sarabun">
                      {READINESS_QUESTIONS.map((rq) => (
                        <div
                          key={rq.key}
                          className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3"
                        >
                          <span className="text-slate-700 leading-snug">{rq.label}</span>
                          <span className="font-kanit font-bold text-emerald-700 shrink-0">
                            {calcAvg(
                              currentSubs,
                              (s) => normalizeSubmissionDailyData(s)?.readiness?.[rq.key]
                            )}{' '}
                            / 5
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Level 3 & 4 Baseline */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
                <h3 className="font-kanit font-bold text-base text-navy-900 pb-2 border-b">
                  Level 3 &amp; Level 4: ข้อมูลพื้นฐานสำหรับติดตาม (Baseline)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sarabun">
                  {BASELINE_QUESTIONS.map((bq) => (
                    <div key={bq.key} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-slate-600 mb-1 leading-snug">{bq.label}</p>
                      <p className="text-xl font-kanit font-bold text-navy-900">
                        {calcAvg(currentSubs, (s) => normalizeSubmissionDailyData(s)?.[bq.key])} / 5.00
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: OVERALL SUMMARY (All days combined) */}
          {selectedView === 'overall' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="font-kanit font-bold text-base text-navy-900 pb-2 border-b">
                  เปรียบเทียบผลการประเมินรายวัน (ตลอดหลักสูตร)
                </h3>
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {preparedDays.map((d) => {
                    const daySubs = submissions.filter((s) => s.dayId === d.id);
                    const cfg = QUESTIONNAIRE_CONFIGS[d.id];
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setSelectedView(d.id)}
                        className="w-full text-left p-3.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                      >
                        <div className="min-w-0">
                          <p className="font-kanit font-semibold text-xs sm:text-sm text-navy-900 truncate">
                            {d.dateStr} ({cfg?.shortTopic})
                          </p>
                          <p className="text-[11px] text-slate-500 font-sarabun">
                            ส่งแล้ว {daySubs.length} ฉบับ
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-kanit font-bold text-base text-navy-900">
                            {daySubs.length > 0
                              ? `${calcAvg(daySubs, (s) => s.overallSatisfaction).toFixed(2)} / 5.00`
                              : '—'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="font-kanit font-bold text-base text-navy-900 pb-2 border-b">
                  สรุปกรอบการประเมิน 4 ระดับ (Kirkpatrick Model)
                </h3>
                <div className="space-y-2.5 text-xs font-sarabun">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">
                      Level 1 Reaction: ความพึงพอใจต่อเนื้อหาและวิทยากร
                    </span>
                    <span className="font-kanit font-bold text-navy-900">
                      {overallAvg.toFixed(2)} / 5.00
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">
                      Level 2 Learning: ค่าเฉลี่ยความรู้ที่เพิ่มขึ้น (Gain)
                    </span>
                    <span className="font-kanit font-bold text-emerald-700">
                      {overallGainAvg >= 0 ? `+${overallGainAvg.toFixed(2)}` : overallGainAvg.toFixed(2)}{' '}
                      คะแนน
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">
                      Level 3 Behavior: ความคาดหวังนำไปปฏิบัติ (Baseline)
                    </span>
                    <span className="font-kanit font-bold text-navy-900">
                      {overallBaselineAvg.toFixed(2)} / 5.00
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">
                      Level 4 Results: ผลสัมฤทธิ์ต่อ สตง. (ติดตาม 3–6 เดือน)
                    </span>
                    <span className="font-kanit font-bold text-navy-900">
                      {CONTENT_QUESTIONS.length > 0 ? 'พร้อมฐานข้อมูลอ้างอิง' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Qualitative Feedback from Participants */}
          {currentSubs.some((s) => {
            const d = normalizeSubmissionDailyData(s);
            return !!(s.suggestions?.trim() || d?.lecturerComment || d?.suggestions);
          }) && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-kanit font-bold text-base text-navy-900 pb-2 border-b">
                ข้อเสนอแนะและข้อคิดเห็นจากผู้เข้าอบรมจริง
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSubs
                  .filter((s) => {
                    const d = normalizeSubmissionDailyData(s);
                    return !!(s.suggestions?.trim() || d?.lecturerComment || d?.suggestions);
                  })
                  .map((s) => {
                    const d = normalizeSubmissionDailyData(s);
                    const sug = s.suggestions || d?.suggestions;
                    return (
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

                        {d?.lecturerComment && (
                          <p className="text-slate-700">
                            <span className="font-semibold text-slate-900">ความเห็นต่อวิทยากร:</span>{' '}
                            &quot;{d.lecturerComment}&quot;
                          </p>
                        )}

                        {sug && (
                          <p className="text-slate-700">
                            <span className="font-semibold text-slate-900">ข้อเสนอแนะเพิ่มเติม:</span>{' '}
                            &quot;{sug}&quot;
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                          {s.generalInfo.workArea === 'central' ? 'ส่วนกลาง' : 'ส่วนภูมิภาค'} (
                          {s.generalInfo.bureauName}) ·{' '}
                          {s.generalInfo.position === 'senior_professional'
                            ? 'ชำนาญการ'
                            : 'ชำนาญการพิเศษ'}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
