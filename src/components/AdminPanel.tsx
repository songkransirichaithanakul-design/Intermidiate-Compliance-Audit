import React, { useState } from 'react';
import { EvaluationDay, EvaluationSubmission, ParticipantRecord } from '../types';
import { TrackingSection } from './TrackingSection';

interface AdminPanelProps {
  days: EvaluationDay[];
  submissions: EvaluationSubmission[];
  participants: ParticipantRecord[];
  onClearAllData: () => void;
  onSimulateTestSubmission: (dayId: string) => void;
  onToggleDayStatus: (dayId: string) => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  days,
  submissions,
  participants,
  onClearAllData,
  onSimulateTestSubmission,
  onToggleDayStatus,
  onLogout,
}) => {
  const [adminTab, setAdminTab] = useState<'days' | 'tracking' | 'submissions'>('days');
  const [confirmClear, setConfirmClear] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<EvaluationSubmission | null>(null);

  return (
    <div className="space-y-8">
      {/* Admin Top Header */}
      <div className="bg-navy-900 rounded-2xl p-6 sm:p-8 text-white border-b-4 border-lime shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-kanit font-semibold text-navy-900 bg-lime px-2.5 py-0.5 rounded">
              ADMINISTRATOR
            </span>
            <span className="text-xs text-slate-300 font-sarabun">
              สำนักงานการตรวจเงินแผ่นดิน
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-kanit font-bold text-white">
            ระบบบริหารจัดการการประเมินผลโครงการ
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-sarabun mt-1">
            ผู้ดูแลระบบ: songkran.sirichaithanakul@gmail.com
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (navigator.clipboard) {
                const url = window.location.origin;
                navigator.clipboard.writeText(url);
                alert('คัดลอกลิงก์เผยแพร่สำหรับผู้เข้าอบรมแล้ว: ' + url);
              }
            }}
            className="px-3.5 py-2 bg-lime hover:bg-lime-dark text-navy-900 rounded-lg text-xs font-kanit font-bold transition-colors cursor-pointer shadow-xs"
          >
            คัดลอกลิงก์เผยแพร่
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-navy-800 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-500/40 rounded-lg text-xs font-kanit font-semibold transition-colors cursor-pointer"
          >
            ออกจากระบบ Admin
          </button>
        </div>
      </div>

      {/* Admin Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setAdminTab('days')}
          className={`px-4 py-2 rounded-lg font-kanit text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            adminTab === 'days'
              ? 'bg-navy-900 text-lime shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          จัดการสถานะเปิด-ปิดรับคำตอบรายวัน
        </button>

        <button
          onClick={() => setAdminTab('tracking')}
          className={`px-4 py-2 rounded-lg font-kanit text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            adminTab === 'tracking'
              ? 'bg-navy-900 text-lime shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          ติดตามผลการตอบแบบประเมินรายบุคคล ({participants.length})
        </button>

        <button
          onClick={() => setAdminTab('submissions')}
          className={`px-4 py-2 rounded-lg font-kanit text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            adminTab === 'submissions'
              ? 'bg-navy-900 text-lime shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          แบบประเมินที่ส่งแล้ว ({submissions.length} ฉบับ)
        </button>
      </div>

      {/* Tab 1: Day Status Management */}
      {adminTab === 'days' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Days list */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="font-kanit font-bold text-lg text-navy-900">
                    ควบคุมสถานะเปิดรับ-ปิดรับคำตอบรายวัน
                  </h3>
                  <p className="text-xs text-slate-500 font-sarabun">
                    สลับสถานะเปิดรับคำตอบ (Open) หรือ ปิดรับคำตอบ (Closed) ได้ทันที
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {days.map((d) => (
                  <div key={d.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-kanit font-semibold text-slate-800">
                          {d.dayLabel} · {d.dateStr}
                        </span>
                        {d.status === 'open' && (
                          <span className="text-[11px] font-kanit font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                            เปิดรับคำตอบ
                          </span>
                        )}
                        {d.status === 'closed' && (
                          <span className="text-[11px] font-kanit font-semibold text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full">
                            ปิดรับคำตอบ
                          </span>
                        )}
                        {d.status === 'waiting' && (
                          <span className="text-[11px] font-kanit font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                            รอข้อมูลแบบสอบถาม
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-sarabun">{d.title}</p>
                      <p className="text-[11px] text-slate-400 font-sarabun">
                        ส่งแล้ว {d.totalSubmitted} ฉบับ {d.averageScore > 0 ? `· เฉลี่ย ${d.averageScore.toFixed(2)} / 5.00` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onToggleDayStatus(d.id)}
                        className={`text-xs font-kanit font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          d.status === 'open'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {d.status === 'open' ? 'ปิดรับคำตอบ' : 'เปิดรับคำตอบ'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tools Box */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="font-kanit font-bold text-base text-navy-900 pb-2 border-b border-slate-100">
                  เครื่องมือสำหรับผู้ดูแล
                </h3>

                <div className="space-y-2">
                  <p className="text-xs font-kanit font-semibold text-slate-700">
                    ทดสอบส่งแบบประเมินตัวอย่าง (Real Schema)
                  </p>
                  <p className="text-xs text-slate-500 font-sarabun">
                    สร้างข้อมูลทดสอบตามแบบสอบถามจริง เพื่อตรวจสอบการแสดงผลบนแดชบอร์ด
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSimulateTestSubmission('day-1')}
                      className="py-2 px-2 text-center bg-navy-800 hover:bg-navy-900 text-white font-kanit text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      + ตัวอย่างวันที่ 16
                    </button>
                    <button
                      onClick={() => onSimulateTestSubmission('day-2')}
                      className="py-2 px-2 text-center bg-navy-800 hover:bg-navy-900 text-white font-kanit text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      + ตัวอย่างวันที่ 17
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-kanit font-semibold text-slate-700 mb-1">
                    สำรองและส่งออกฐานข้อมูล (File Base / Database)
                  </p>
                  <p className="text-xs text-slate-500 font-sarabun mb-2">
                    ดาวน์โหลดไฟล์ฐานข้อมูล (.json) ที่บันทึกอยู่บนเซิร์ฟเวอร์แบบเรียลไทม์
                  </p>
                  <a
                    href="/api/database/export"
                    download="AuditEval_Database.json"
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-navy-900 border border-slate-300 font-kanit text-xs font-semibold rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                  >
                    ดาวน์โหลดไฟล์ฐานข้อมูล (.json)
                  </a>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <p className="text-xs font-kanit font-semibold text-slate-700">
                    ล้างข้อมูลระบบทั้งหมด (Reset to 0)
                  </p>
                  <p className="text-xs text-slate-500 font-sarabun">
                    ลบข้อมูลผลการตอบแบบสอบถามและรายชื่อทั้งหมด เพื่อเริ่มต้นเก็บข้อมูลจริง
                  </p>

                  {!confirmClear ? (
                    <button
                      onClick={() => setConfirmClear(true)}
                      className="w-full py-2 border border-red-300 text-red-600 hover:bg-red-50 font-kanit text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      ล้างข้อมูลทั้งหมดเป็น 0
                    </button>
                  ) : (
                    <div className="space-y-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-700 font-kanit font-semibold text-center">
                        ยืนยันการล้างข้อมูลทั้งหมดหรือไม่?
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            onClearAllData();
                            setConfirmClear(false);
                          }}
                          className="py-1.5 bg-red-600 text-white font-kanit text-xs rounded hover:bg-red-700"
                        >
                          ยืนยันล้างข้อมูล
                        </button>
                        <button
                          onClick={() => setConfirmClear(false)}
                          className="py-1.5 bg-slate-200 text-slate-700 font-kanit text-xs rounded hover:bg-slate-300"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-sarabun">
                เกณฑ์การประเมินเป็นไปตามระเบียบกระทรวงการคลัง พ.ศ. 2549
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Participant Tracking (Requirement 4) */}
      {adminTab === 'tracking' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <TrackingSection participants={participants} days={days} />
        </div>
      )}

      {/* Tab 3: Detailed Submissions */}
      {adminTab === 'submissions' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-kanit font-bold text-lg text-navy-900">
                รายการแบบประเมินที่ส่งแล้วทั้งหมด
              </h3>
              <p className="text-xs text-slate-500 font-sarabun">
                ข้อมูลการตอบแบบสอบถามแยกตามรายฉบับ
              </p>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-sarabun">
              <p className="font-kanit text-slate-600 text-base mb-1">
                ยังไม่มีข้อมูลแบบประเมินที่ส่งเข้ามา
              </p>
              <p className="text-xs text-slate-400">
                เมื่อผู้เข้าอบรมส่งแบบสอบถาม จะแสดงรายละเอียดทุกข้อที่นี่
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {submissions.map((s) => (
                <div
                  key={s.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-lg transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {s.referenceCode}
                      </span>
                      <span className="text-xs font-kanit font-semibold text-navy-900">
                        {s.dayTitle}
                      </span>
                      <span className="text-[11px] font-kanit text-lime-dark bg-lime/10 px-2 py-0.5 rounded border border-lime/30">
                        คะแนนเฉลี่ย: {s.overallSatisfaction.toFixed(2)} / 5
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-sarabun">
                      พื้นที่: {s.generalInfo.workArea === 'central' ? 'ส่วนกลาง' : 'ส่วนภูมิภาค'} ({s.generalInfo.bureauName}) · ระดับ:{' '}
                      {s.generalInfo.position === 'senior_professional' ? 'ชำนาญการ' : 'ชำนาญการพิเศษ'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-sarabun">
                      ส่งเมื่อ: {s.timestamp}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={() => setSelectedSubmission(s)}
                      className="px-3 py-1.5 text-xs font-kanit font-medium text-navy-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 cursor-pointer transition-colors"
                    >
                      ดูคำตอบฉบับเต็ม
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="bg-navy-900 text-white p-5 border-b-4 border-lime flex items-center justify-between">
              <div>
                <span className="text-xs text-lime font-mono">
                  {selectedSubmission.referenceCode}
                </span>
                <h3 className="text-lg font-kanit font-bold text-white">
                  รายละเอียดการตอบแบบประเมิน ({selectedSubmission.dayTitle})
                </h3>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded text-xs font-kanit border border-slate-700"
              >
                ปิด
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4 text-xs sm:text-sm font-sarabun text-slate-700">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                <p className="font-kanit font-semibold text-navy-900">ข้อมูลผู้ตอบ:</p>
                <p>พื้นที่: {selectedSubmission.generalInfo.workArea === 'central' ? 'ส่วนกลาง' : 'ส่วนภูมิภาค'} (ชื่อย่อสำนัก: {selectedSubmission.generalInfo.bureauName})</p>
                <p>ระดับ: {selectedSubmission.generalInfo.position === 'senior_professional' ? 'ชำนาญการ' : 'ชำนาญการพิเศษ'}</p>
                <p>บทบาทหน้าที่: {selectedSubmission.generalInfo.roles.join(', ')}</p>
                <p className="text-slate-500 text-xs">เวลาที่บันทึก: {selectedSubmission.timestamp}</p>
              </div>

              {selectedSubmission.day16Data && (
                <div className="space-y-3">
                  <h4 className="font-kanit font-bold text-navy-900 text-sm">Level 1 Reaction</h4>
                  <p>เนื้อหา: {selectedSubmission.day16Data.contentScore1}, {selectedSubmission.day16Data.contentScore2}, {selectedSubmission.day16Data.contentScore3}</p>
                  <p>วิทยากรเช้า: {selectedSubmission.day16Data.lecturerMorning1}, {selectedSubmission.day16Data.lecturerMorning2}, {selectedSubmission.day16Data.lecturerMorning3}</p>
                  <p>วิทยากรบ่าย: {selectedSubmission.day16Data.lecturerAfternoon1}, {selectedSubmission.day16Data.lecturerAfternoon2}, {selectedSubmission.day16Data.lecturerAfternoon3}</p>
                  {selectedSubmission.day16Data.lecturerComment && (
                    <p className="italic text-slate-600">ความเห็นต่อวิทยากร: "{selectedSubmission.day16Data.lecturerComment}"</p>
                  )}

                  <h4 className="font-kanit font-bold text-navy-900 text-sm pt-2 border-t">Level 2 Learning</h4>
                  <p>หัวข้อ 1: ก่อน {selectedSubmission.day16Data.topic1Pre} / หลัง {selectedSubmission.day16Data.topic1Post}</p>
                  <p>หัวข้อ 2: ก่อน {selectedSubmission.day16Data.topic2Pre} / หลัง {selectedSubmission.day16Data.topic2Post}</p>
                  <p>Scenario Assessment: ข้อ 1 = {selectedSubmission.day16Data.scenario1}, ข้อ 2 = {selectedSubmission.day16Data.scenario2}, ข้อ 3 = {selectedSubmission.day16Data.scenario3}</p>

                  <h4 className="font-kanit font-bold text-navy-900 text-sm pt-2 border-t">Level 3 & 4 Baseline</h4>
                  <p>ความคาดหวังนำไปใช้: {selectedSubmission.day16Data.baseline1}, {selectedSubmission.day16Data.baseline2}, {selectedSubmission.day16Data.baseline3}</p>

                  {selectedSubmission.day16Data.suggestions && (
                    <div className="pt-2 border-t">
                      <p className="font-kanit font-semibold text-navy-900">ข้อเสนอแนะเพิ่มเติม:</p>
                      <p className="italic">"{selectedSubmission.day16Data.suggestions}"</p>
                    </div>
                  )}
                </div>
              )}

              {selectedSubmission.day17Data && (
                <div className="space-y-3">
                  <h4 className="font-kanit font-bold text-navy-900 text-sm">Level 1 Reaction</h4>
                  <p>เนื้อหา: {selectedSubmission.day17Data.contentScore1}, {selectedSubmission.day17Data.contentScore2}, {selectedSubmission.day17Data.contentScore3}</p>
                  <p>วิทยากรทั้งวัน: {selectedSubmission.day17Data.lecturerFullDay1}, {selectedSubmission.day17Data.lecturerFullDay2}, {selectedSubmission.day17Data.lecturerFullDay3}</p>
                  {selectedSubmission.day17Data.lecturerComment && (
                    <p className="italic text-slate-600">ความเห็นต่อวิทยากร: "{selectedSubmission.day17Data.lecturerComment}"</p>
                  )}

                  <h4 className="font-kanit font-bold text-navy-900 text-sm pt-2 border-t">Level 2 Learning</h4>
                  <p>หัวข้อพยานหลักฐาน: ก่อน {selectedSubmission.day17Data.topic1Pre} / หลัง {selectedSubmission.day17Data.topic1Post}</p>
                  <p>Capability & Readiness: ข้อ 1 = {selectedSubmission.day17Data.readiness1}, ข้อ 2 = {selectedSubmission.day17Data.readiness2}, ข้อ 3 = {selectedSubmission.day17Data.readiness3}</p>

                  <h4 className="font-kanit font-bold text-navy-900 text-sm pt-2 border-t">Level 3 & 4 Baseline</h4>
                  <p>ความคาดหวังนำไปใช้: {selectedSubmission.day17Data.baseline1}, {selectedSubmission.day17Data.baseline2}, {selectedSubmission.day17Data.baseline3}</p>

                  {selectedSubmission.day17Data.suggestions && (
                    <div className="pt-2 border-t">
                      <p className="font-kanit font-semibold text-navy-900">ข้อเสนอแนะเพิ่มเติม:</p>
                      <p className="italic">"{selectedSubmission.day17Data.suggestions}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
