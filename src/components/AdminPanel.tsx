import React, { useState, useEffect } from 'react';
import { EvaluationDay, EvaluationSubmission, ParticipantRecord, DayStatus } from '../types';
import { TrackingSection } from './TrackingSection';
import { DataService } from '../services/dataService';
import {
  QUESTIONNAIRE_CONFIGS,
  OVERALL_PROJECT_QUESTIONS,
  normalizeSubmissionDailyData,
} from '../data/questionnaireConfigs';
import {
  ShieldCheck,
  Database,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  Search,
  Layers,
  Sparkles,
  Server
} from 'lucide-react';

interface AdminPanelProps {
  days: EvaluationDay[];
  submissions: EvaluationSubmission[];
  participants: ParticipantRecord[];
  onClearAllData: () => void;
  onSimulateTestSubmission: (dayId: string) => void;
  onToggleDayStatus: (dayId: string) => void;
  onSetDayStatus?: (dayId: string, status: DayStatus) => Promise<void>;
  onCloseAllDays?: () => Promise<void>;
  onDeleteSubmission?: (submissionId: string) => void;
  onRestoreDatabase?: (databaseData: any) => Promise<boolean>;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  days,
  submissions,
  participants,
  onClearAllData,
  onSimulateTestSubmission,
  onToggleDayStatus,
  onSetDayStatus,
  onCloseAllDays,
  onDeleteSubmission,
  onRestoreDatabase,
  onLogout,
}) => {
  const [adminTab, setAdminTab] = useState<'days' | 'tracking' | 'submissions' | 'security'>('days');
  const [statusFeedback, setStatusFeedback] = useState<string>('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<EvaluationSubmission | null>(null);
  const [searchSubmission, setSearchSubmission] = useState('');
  const [submissionToDelete, setSubmissionToDelete] = useState<EvaluationSubmission | null>(null);
  const [simDayId, setSimDayId] = useState<string>('day-1');

  // Health and Audit Log State
  const [healthStats, setHealthStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [snapshotMsg, setSnapshotMsg] = useState('');
  const [restoreError, setRestoreError] = useState('');
  const [restoreSuccess, setRestoreSuccess] = useState('');

  // Fetch health stats & audit log
  const loadSystemInfo = async () => {
    setIsLoadingAudit(true);
    const health = await DataService.fetchHealth();
    if (health) setHealthStats(health);
    const logs = await DataService.fetchAuditLog();
    setAuditLogs(logs);
    setIsLoadingAudit(false);
  };

  useEffect(() => {
    if (adminTab === 'security') {
      loadSystemInfo();
    }
  }, [adminTab]);

  // Handle Snapshot creation
  const handleCreateSnapshot = async () => {
    setSnapshotMsg('กำลังสร้างจุดสำรองข้อมูล...');
    const res = await DataService.createSnapshot();
    if (res.success) {
      setSnapshotMsg(`สร้างจุดสำรองข้อมูลสำเร็จ: ${res.fileName}`);
      loadSystemInfo();
      setTimeout(() => setSnapshotMsg(''), 4000);
    } else {
      setSnapshotMsg(`เกิดข้อผิดพลาด: ${res.error}`);
    }
  };

  // Handle Restore file upload
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreError('');
    setRestoreSuccess('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed || !Array.isArray(parsed.submissions)) {
          setRestoreError('ไฟล์ไม่ถูกต้อง: รูปแบบ JSON ต้องมีรายการ submissions');
          return;
        }

        const confirmed = window.confirm(
          `ต้องการกู้คืนฐานข้อมูลจากไฟล์นี้ใช่หรือไม่?\nพบข้อมูลแบบประเมิน: ${parsed.submissions.length} ฉบับ`
        );
        if (!confirmed) return;

        if (onRestoreDatabase) {
          const ok = await onRestoreDatabase(parsed);
          if (ok) {
            setRestoreSuccess(`กู้คืนฐานข้อมูลสำเร็จ: ${parsed.submissions.length} ฉบับ`);
            loadSystemInfo();
          } else {
            setRestoreError('กู้คืนฐานข้อมูลไม่สำเร็จ กรุณาตรวจสอบไฟล์');
          }
        }
      } catch (err: any) {
        setRestoreError('ไม่สามารถอ่านไฟล์ JSON ได้: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Filtered submissions
  const filteredSubmissions = submissions.filter((s) => {
    const q = searchSubmission.toLowerCase().trim();
    if (!q) return true;
    return (
      s.referenceCode.toLowerCase().includes(q) ||
      s.dayTitle.toLowerCase().includes(q) ||
      (s.generalInfo.bureauName && s.generalInfo.bureauName.toLowerCase().includes(q)) ||
      (s.generalInfo.position && s.generalInfo.position.toLowerCase().includes(q)) ||
      (s.participantName && s.participantName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 text-left">
      {/* Admin Top Header */}
      <div className="bg-navy-900 rounded-2xl p-6 sm:p-8 text-white border-b-4 border-lime shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-kanit font-semibold text-navy-900 bg-lime px-2.5 py-0.5 rounded">
              ADMINISTRATOR
            </span>
            <span className="text-xs text-slate-300 font-sarabun flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-lime" />
              สำนักงานการตรวจเงินแผ่นดิน · ระบบความมั่นคงปลอดภัยข้อมูล
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-kanit font-bold text-white">
            ระบบบริหารจัดการการประเมินผลโครงการ
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-sarabun mt-1">
            ผู้ดูแลระบบ: <span className="text-white font-medium">songkran.sirichaithanakul@gmail.com</span>
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
          ติดตามผลรายบุคคล ({participants.length})
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

        <button
          onClick={() => setAdminTab('security')}
          className={`px-4 py-2 rounded-lg font-kanit text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'security'
              ? 'bg-navy-900 text-lime shadow-xs'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ความมั่นคงปลอดภัย &amp; สำรองข้อมูล</span>
        </button>
      </div>

      {/* TAB 1: Day Status Management */}
      {adminTab === 'days' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Days list */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-kanit font-bold text-lg text-navy-900">
                      ควบคุมสิทธิเปิดรับ-ปิดรับคำตอบรายวัน
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-navy-900 text-lime text-[10px] font-kanit font-semibold">
                      <Lock className="w-3 h-3" />
                      ADMIN ONLY
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-sarabun">
                    ระบบจะไม่เปิด-ปิดแบบสอบถามเองอัตโนมัติ สิทธิทั้งหมดบันทึกบนเซิร์ฟเวอร์ตามคำสั่งของ Admin เท่านั้น
                  </p>
                </div>

                {onCloseAllDays && (
                  <button
                    type="button"
                    onClick={async () => {
                      await onCloseAllDays();
                      setStatusFeedback('สั่งปิดรับคำตอบทั้งหมดเรียบร้อยแล้ว');
                      setTimeout(() => setStatusFeedback(''), 3500);
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-kanit font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    ปิดรับคำตอบทุกวัน
                  </button>
                )}
              </div>

              {statusFeedback && (
                <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-kanit flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{statusFeedback}</span>
                </div>
              )}

              <div className="divide-y divide-slate-100">
                {days.map((d) => (
                  <div key={d.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
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
                        {QUESTIONNAIRE_CONFIGS[d.id] && (
                          <span className="text-[10px] font-kanit font-medium text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                            มีแบบสอบถามแล้ว
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-sarabun">{d.title}</p>
                      <p className="text-[11px] text-slate-400 font-sarabun">
                        ส่งแล้ว {d.totalSubmitted} ฉบับ {d.averageScore > 0 ? `· เฉลี่ย ${d.averageScore.toFixed(2)} / 5.00` : ''}
                        {d.statusUpdatedAt ? ` · ปรับล่าสุด: ${d.statusUpdatedAt}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSetDayStatus ? (
                        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 gap-0.5">
                          <button
                            type="button"
                            onClick={async () => {
                              await onSetDayStatus(d.id, 'open');
                              setStatusFeedback(`เปิดรับคำตอบ: ${d.dateStr} แล้ว`);
                              setTimeout(() => setStatusFeedback(''), 3000);
                            }}
                            className={`text-[11px] font-kanit font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                              d.status === 'open'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            เปิดรับคำตอบ
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await onSetDayStatus(d.id, 'closed');
                              setStatusFeedback(`ปิดรับคำตอบ: ${d.dateStr} แล้ว`);
                              setTimeout(() => setStatusFeedback(''), 3000);
                            }}
                            className={`text-[11px] font-kanit font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                              d.status === 'closed'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            ปิดรับคำตอบ
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await onSetDayStatus(d.id, 'waiting');
                              setStatusFeedback(`ตั้งสถานะรอข้อมูล: ${d.dateStr} แล้ว`);
                              setTimeout(() => setStatusFeedback(''), 3000);
                            }}
                            className={`text-[11px] font-kanit font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                              d.status === 'waiting'
                                ? 'bg-slate-700 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            รอข้อมูล
                          </button>
                        </div>
                      ) : (
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
                      )}
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
                    สร้างข้อมูลทดสอบสำหรับวันที่เปิดรับคำตอบอยู่ เพื่อตรวจสอบการแสดงผลบนแดชบอร์ดและไฟล์ CSV
                  </p>
                  <div className="flex flex-col gap-2">
                    <select
                      value={simDayId}
                      onChange={(e) => setSimDayId(e.target.value)}
                      className="w-full text-xs font-kanit px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime"
                    >
                      {days
                        .filter((d) => !!QUESTIONNAIRE_CONFIGS[d.id])
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.dateStr} ({d.status === 'open' ? 'เปิดรับคำตอบ' : 'ปิดอยู่ - ต้องเปิดก่อนส่ง'})
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => onSimulateTestSubmission(simDayId)}
                      className="w-full py-2 px-3 text-center bg-navy-800 hover:bg-navy-900 text-white font-kanit text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      + ส่งข้อมูลทดสอบ ({days.find((d) => d.id === simDayId)?.dateStr || simDayId})
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-kanit font-semibold text-slate-700 mb-1">
                    ส่งออกรายงานและสำรองข้อมูล
                  </p>
                  <div className="space-y-2 mt-2">
                    <a
                      href="/api/database/export/csv"
                      download="AuditEval_Report.csv"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-kanit text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      ส่งออกรายงาน Excel / CSV (ภาษาไทย)
                    </a>
                    <a
                      href="/api/database/export"
                      download="AuditEval_Database.json"
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-navy-900 border border-slate-300 font-kanit text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      ดาวน์โหลดฐานข้อมูลสำรอง (.json)
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <p className="text-xs font-kanit font-semibold text-slate-700">
                    ล้างข้อมูลระบบทั้งหมด (Reset to 0)
                  </p>
                  <p className="text-xs text-slate-500 font-sarabun">
                    (ระบบจะสำรองข้อมูลอัตโนมัติก่อนล้าง เพื่อความปลอดภัยสูงสุด)
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

      {/* TAB 2: Participant Tracking */}
      {adminTab === 'tracking' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <TrackingSection participants={participants} days={days} />
        </div>
      )}

      {/* TAB 3: Detailed Submissions */}
      {adminTab === 'submissions' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-kanit font-bold text-lg text-navy-900">
                รายการแบบประเมินที่ส่งแล้วทั้งหมด ({submissions.length} ฉบับ)
              </h3>
              <p className="text-xs text-slate-500 font-sarabun">
                สามารถค้นหา ตรวจสอบคำตอบ หรือลบแบบประเมินที่มีข้อผิดพลาดได้
              </p>
            </div>

            {/* Search Input */}
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchSubmission}
                onChange={(e) => setSearchSubmission(e.target.value)}
                placeholder="ค้นหารหัสอ้างอิง, สำนัก, หรือตำแหน่ง..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime"
              />
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-sarabun">
              <p className="font-kanit text-slate-600 text-base mb-1">
                {submissions.length === 0 ? 'ยังไม่มีข้อมูลแบบประเมินที่ส่งเข้ามา' : 'ไม่พบข้อมูลที่ตรงกับคำค้นหา'}
              </p>
              <p className="text-xs text-slate-400">
                เมื่อผู้เข้าอบรมส่งแบบสอบถาม จะแสดงรายละเอียดทุกข้อที่นี่
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredSubmissions.map((s) => (
                <div
                  key={s.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-lg transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {s.referenceCode}
                      </span>
                      <span className="text-xs font-kanit font-semibold text-navy-900">
                        {s.dayTitle}
                      </span>
                      <span className="text-[11px] font-kanit font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        คะแนนเฉลี่ย: {s.overallSatisfaction.toFixed(2)} / 5.00
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-sarabun">
                      ระดับ: <span className="font-semibold text-slate-900">{s.generalInfo.position === 'senior_professional' ? 'ชำนาญการ' : s.generalInfo.position === 'special_professional' ? 'ชำนาญการพิเศษ' : s.generalInfo.position}</span> · 
                      พื้นที่: <span className="font-semibold text-slate-900">{s.generalInfo.workArea === 'central' ? 'ส่วนกลาง' : 'ส่วนภูมิภาค'}</span> ({s.generalInfo.bureauName})
                    </p>
                    <p className="text-[11px] text-slate-400 font-sarabun">
                      ส่งเมื่อ: {s.timestamp}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedSubmission(s)}
                      className="px-3 py-1.5 text-xs font-kanit font-medium text-navy-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 cursor-pointer transition-colors"
                    >
                      ดูคำตอบฉบับเต็ม
                    </button>
                    {onDeleteSubmission && (
                      <button
                        onClick={() => setSubmissionToDelete(s)}
                        title="ลบแบบประเมินนี้"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded border border-slate-200 hover:border-red-300 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Data Security & Governance (NEW) */}
      {adminTab === 'security' && (
        <div className="space-y-6">
          {/* Security Architecture Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-700 mb-2 font-kanit font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>การบันทึกแบบ Safe Atomic Write</span>
              </div>
              <p className="text-xs text-slate-600 font-sarabun leading-relaxed">
                ระบบใช้ Atomic Writes (เขียนลงไฟล์ชั่วคราวแล้ว Rename) ป้องกันไฟล์ฐานข้อมูลเสียหายจากกรณีไฟดับหรือปิดระบบกะทันหันได้ 100%
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-700 mb-2 font-kanit font-bold text-sm">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>FIFO Queue Concurrency</span>
              </div>
              <p className="text-xs text-slate-600 font-sarabun leading-relaxed">
                มีระบบคิวแบบ FIFO ประมวลผลคำตอบแบบเป็นลำดับ ป้องกันปัญหา Race Condition เมื่อมีผู้เข้าอบรมส่งแบบสอบถามพร้อมกันหลายเครื่อง
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-700 mb-2 font-kanit font-bold text-sm">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Auto-Recovery &amp; Snapshots</span>
              </div>
              <p className="text-xs text-slate-600 font-sarabun leading-relaxed">
                มีระบบสำรองข้อมูลอัตโนมัติ (Rolling Snapshots) และระบบ Auto-Recovery กู้คืนอัตโนมัติจากไฟล์สำรองหากเกิดข้อผิดพลาด
              </p>
            </div>
          </div>

          {/* Backup & Governance Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-kanit font-bold text-lg text-navy-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-lime-dark" />
                  การจัดการและรักษาความมั่นคงปลอดภัยฐานข้อมูล
                </h3>
                <p className="text-xs text-slate-500 font-sarabun">
                  เครื่องมือสำรองข้อมูล กู้คืนข้อมูลฉุกเฉิน และส่งออกรายงานทางการ
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadSystemInfo}
                  disabled={isLoadingAudit}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-kanit font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAudit ? 'animate-spin' : ''}`} />
                  รีเฟรชสถานะ
                </button>
              </div>
            </div>

            {/* Notification Messages */}
            {snapshotMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-kanit flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{snapshotMsg}</span>
              </div>
            )}
            {restoreSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-kanit flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{restoreSuccess}</span>
              </div>
            )}
            {restoreError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs font-kanit flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{restoreError}</span>
              </div>
            )}

            {/* Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Button 1: Create Snapshot Now */}
              <button
                type="button"
                onClick={handleCreateSnapshot}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="font-kanit font-bold text-sm text-navy-900 group-hover:text-emerald-800">
                  สร้างจุดสำรองข้อมูลทันที
                </div>
                <p className="text-[11px] text-slate-500 font-sarabun mt-1">
                  บันทึก Snapshot ปัจจุบันเก็บไว้ในโฟลเดอร์สำรอง
                </p>
              </button>

              {/* Button 2: Export Official CSV */}
              <a
                href="/api/database/export/csv"
                download="AuditEval_Report.csv"
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-lime/10 hover:border-lime transition-all text-left group cursor-pointer block"
              >
                <div className="w-8 h-8 rounded-lg bg-lime/20 text-navy-900 flex items-center justify-center mb-2">
                  <FileSpreadsheet className="w-4 h-4 text-lime-dark" />
                </div>
                <div className="font-kanit font-bold text-sm text-navy-900 group-hover:text-emerald-900">
                  ส่งออกรายงาน Excel / CSV
                </div>
                <p className="text-[11px] text-slate-500 font-sarabun mt-1">
                  ไฟล์ CSV พร้อม UTF-8 BOM รองรับภาษาไทยสมบูรณ์
                </p>
              </a>

              {/* Button 3: Download JSON Database */}
              <a
                href="/api/database/export"
                download="AuditEval_Database.json"
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 transition-all text-left group cursor-pointer block"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center mb-2">
                  <Download className="w-4 h-4" />
                </div>
                <div className="font-kanit font-bold text-sm text-navy-900 group-hover:text-sky-800">
                  ดาวน์โหลดฐานข้อมูล JSON
                </div>
                <p className="text-[11px] text-slate-500 font-sarabun mt-1">
                  ไฟล์สำรองโครงสร้างฐานข้อมูลฉบับเต็ม
                </p>
              </a>

              {/* Button 4: Restore from JSON File */}
              <label className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 transition-all text-left group cursor-pointer block relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="font-kanit font-bold text-sm text-navy-900 group-hover:text-amber-800">
                  กู้คืนข้อมูลจากไฟล์สำรอง
                </div>
                <p className="text-[11px] text-slate-500 font-sarabun mt-1">
                  เลือกไฟล์ .json เพื่อกู้คืนฐานข้อมูลกลับคืน
                </p>
              </label>
            </div>

            {/* System Live Stats */}
            {healthStats && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-sarabun text-slate-700 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-kanit font-semibold text-navy-900">สถานะเซิร์ฟเวอร์:</span>
                  <span className="text-emerald-700 font-medium">ทำงานปกติ (Online)</span>
                </div>
                <div>
                  <span className="font-kanit font-semibold text-navy-900">ขนาดฐานข้อมูล:</span>{' '}
                  <span className="font-mono">{((healthStats.database?.sizeBytes || 0) / 1024).toFixed(2)} KB</span>
                </div>
                <div>
                  <span className="font-kanit font-semibold text-navy-900">จุดสำรองย้อนหลัง:</span>{' '}
                  <span className="font-semibold text-navy-900">{healthStats.database?.snapshotCount || 0} จุด</span>
                </div>
                <div>
                  <span className="font-kanit font-semibold text-navy-900">เซิร์ฟเวอร์เปิดต่อเนื่อง:</span>{' '}
                  <span>{Math.floor((healthStats.uptimeSeconds || 0) / 60)} นาที</span>
                </div>
              </div>
            )}
          </div>

          {/* Audit Trail Log Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-kanit font-bold text-lg text-navy-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-600" />
                  ประวัติการทำรายการในระบบ (System Audit Trail Log)
                </h3>
                <p className="text-xs text-slate-500 font-sarabun">
                  บันทึกประวัติกิจกรรมสำคัญเพื่อความโปร่งใสและตรวจสอบย้อนหลังได้ตามมาตรฐาน สตง.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-sarabun">
                แสดง {auditLogs.length} รายการล่าสุด
              </span>
            </div>

            {auditLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-sarabun">
                ยังไม่มีบันทึกประวัติการทำรายการ
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                <table className="w-full text-xs font-sarabun text-left divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-700 font-kanit font-semibold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">วันเวลา (Timestamp)</th>
                      <th className="py-2.5 px-3">ประเภทกิจกรรม</th>
                      <th className="py-2.5 px-3">รายละเอียดการดำเนินงาน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => {
                      const isError = log.type.includes('FAIL') || log.type.includes('DELETE') || log.type.includes('RESET');
                      const isSuccess = log.type.includes('SUCCESS') || log.type.includes('RECORDED') || log.type.includes('SNAPSHOT');

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('th-TH')}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-kanit font-semibold ${
                                isError
                                  ? 'bg-red-100 text-red-800'
                                  : isSuccess
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {log.type}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-800">{log.description}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {submissionToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-kanit font-bold text-lg text-slate-900">
                  ยืนยันการลบแบบประเมิน?
                </h3>
                <p className="text-xs text-slate-500 font-sarabun">
                  รหัสอ้างอิง: {submissionToDelete.referenceCode}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-sarabun leading-relaxed">
              ท่านกำลังจะลบผลการประเมินของ <strong>{submissionToDelete.dayTitle}</strong> ({submissionToDelete.generalInfo.workArea === 'central' ? 'ส่วนกลาง' : 'ส่วนภูมิภาค'} · {submissionToDelete.generalInfo.bureauName})
              <br />
              การลบนี้จะถูกบันทึกลงใน Audit Log ของระบบ
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSubmissionToDelete(null)}
                className="px-4 py-2 text-xs font-kanit text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteSubmission) {
                    onDeleteSubmission(submissionToDelete.id);
                  }
                  setSubmissionToDelete(null);
                }}
                className="px-4 py-2 text-xs font-kanit font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                ยืนยันลบแบบประเมิน
              </button>
            </div>
          </div>
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
                className="text-slate-400 hover:text-white px-2 py-1 rounded text-xs font-kanit border border-slate-700 cursor-pointer"
              >
                ปิด
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4 text-xs sm:text-sm font-sarabun text-slate-700">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                <p className="font-kanit font-semibold text-navy-900">ข้อมูลผู้ตอบ:</p>
                <p>พื้นที่ปฏิบัติงาน: <span className="font-semibold text-slate-900">{selectedSubmission.generalInfo.workArea === 'central' ? 'ส่วนกลาง' : 'ส่วนภูมิภาค'}</span> (ชื่อย่อสำนัก: {selectedSubmission.generalInfo.bureauName})</p>
                <p>ระดับตำแหน่ง: <span className="font-semibold text-slate-900">{selectedSubmission.generalInfo.position === 'senior_professional' ? 'ชำนาญการ (ปฏิบัติงานด้านตรวจสอบไม่น้อยกว่า 3 ปี)' : selectedSubmission.generalInfo.position === 'special_professional' ? 'ชำนาญการพิเศษ' : selectedSubmission.generalInfo.position}</span></p>
                <p>บทบาทหน้าที่หลัก: {selectedSubmission.generalInfo.roles.join(', ')}</p>
                <p className="text-slate-500 text-xs">เวลาที่บันทึก: {selectedSubmission.timestamp}</p>
              </div>

              {(() => {
                const detailData = normalizeSubmissionDailyData(selectedSubmission);
                const detailConfig = QUESTIONNAIRE_CONFIGS[selectedSubmission.dayId];
                if (!detailData) return null;
                return (
                  <div className="space-y-3">
                    <h4 className="font-kanit font-bold text-navy-900 text-sm">Level 1 Reaction</h4>
                    <p>
                      ด้านเนื้อหา (ข้อ 1–3): {detailData.contentScore1}, {detailData.contentScore2},{' '}
                      {detailData.contentScore3}
                    </p>
                    {Object.entries(detailData.lecturerScores || {}).map(([sessionId, sc]) => {
                      const sessionCfg = detailConfig?.lecturerSessions.find(
                        (s) => s.id === sessionId
                      );
                      return (
                        <p key={sessionId}>
                          วิทยากร{sessionCfg ? ` (${sessionCfg.sessionLabel}${sessionCfg.speakerName ? ` · ${sessionCfg.speakerName}` : ''})` : ` (${sessionId})`}:{' '}
                          {sc.q4}, {sc.q5}, {sc.q6}
                        </p>
                      );
                    })}
                    {detailData.lecturerComment && (
                      <p className="italic text-slate-600">
                        ความเห็นต่อวิทยากร: &quot;{detailData.lecturerComment}&quot;
                      </p>
                    )}

                    {detailData.overallProject && (
                      <div className="pt-2 border-t space-y-1">
                        <h4 className="font-kanit font-bold text-navy-900 text-sm">
                          ความพึงพอใจต่อโครงการฝึกอบรมในภาพรวม (ข้อ 8–15)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                          {OVERALL_PROJECT_QUESTIONS.map((q) => (
                            <p key={q.key}>
                              ข้อ {q.number}: <b>{detailData.overallProject?.[q.key]}</b> / 5
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    <h4 className="font-kanit font-bold text-navy-900 text-sm pt-2 border-t">
                      Level 2 Learning
                    </h4>
                    {Object.entries(detailData.learningTopics || {}).map(([topicId, sc], idx) => {
                      const topicCfg = detailConfig?.learningTopics.find((t) => t.id === topicId);
                      return (
                        <p key={topicId}>
                          หัวข้อ {idx + 1}
                          {topicCfg?.sessionTag ? ` (${topicCfg.sessionTag})` : ''}: ก่อน {sc.pre} ➔
                          หลัง {sc.post}
                        </p>
                      );
                    })}
                    {detailData.readiness && (
                      <p>
                        3.2 Capability &amp; Readiness: ข้อ 1 = {detailData.readiness.r1}, ข้อ 2 ={' '}
                        {detailData.readiness.r2}, ข้อ 3 = {detailData.readiness.r3}
                      </p>
                    )}

                    <h4 className="font-kanit font-bold text-navy-900 text-sm pt-2 border-t">
                      Level 3 &amp; 4 Baseline
                    </h4>
                    <p>
                      ความคาดหวังนำไปใช้: {detailData.baseline1}, {detailData.baseline2},{' '}
                      {detailData.baseline3}
                    </p>

                    {(detailData.suggestions || selectedSubmission.suggestions) && (
                      <div className="pt-2 border-t">
                        <p className="font-kanit font-semibold text-navy-900">ข้อเสนอแนะเพิ่มเติม:</p>
                        <p className="italic">
                          &quot;{detailData.suggestions || selectedSubmission.suggestions}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
