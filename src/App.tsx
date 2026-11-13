/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StatsCards } from './components/StatsCards';
import { DailyEvaluationSection } from './components/DailyEvaluationSection';
import { EvaluationPage } from './components/EvaluationPage';
import { DashboardSection } from './components/DashboardSection';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Footer } from './components/Footer';
import { INITIAL_DAYS } from './data/trainingData';
import { QUESTIONNAIRE_CONFIGS } from './data/questionnaireConfigs';
import {
  EvaluationDay,
  EvaluationSubmission,
  ParticipantRecord,
  DayStatus,
  DailyEvaluationResponse,
} from './types';
import { DataService } from './services/dataService';
import { KirkpatrickPyramid } from './components/KirkpatrickPyramid';
import { UserCheck, CheckCircle2, Award, Sparkles, ArrowRight, Clock } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'evaluation' | 'dashboard' | 'admin'>('home');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('auditeval_is_admin') === 'true';
  });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);

  // Initialize state with local data immediately for instant responsive UX
  const initialData = DataService.getLocalData();
  const [days, setDays] = useState<EvaluationDay[]>(initialData.days);
  const [submissions, setSubmissions] = useState<EvaluationSubmission[]>(initialData.submissions);
  const [participants, setParticipants] = useState<ParticipantRecord[]>(initialData.participants);

  // Selected Day ID for evaluation page
  const [selectedDayId, setSelectedDayId] = useState<string>('day-1');

  // Load from server file-base and sync on mount
  const syncWithServer = useCallback(async () => {
    const serverData = await DataService.fetchServerData();
    if (serverData) {
      setSubmissions(serverData.submissions);
      if (serverData.days && serverData.days.length > 0) {
        setDays(serverData.days);
      }
      if (serverData.participants) {
        setParticipants(serverData.participants);
      }
    }
  }, []);

  // Verify admin token on mount if isAdmin was persisted
  useEffect(() => {
    if (isAdmin) {
      DataService.verifyAdminSession().then((valid) => {
        if (!valid) {
          setIsAdmin(false);
          DataService.clearAdminToken();
        }
      });
    }
  }, [isAdmin]);

  useEffect(() => {
    syncWithServer();

    // Listen to real-time updates from other tabs
    const unsubscribe = DataService.onRealtimeUpdate((event) => {
      if (event.type === 'NEW_SUBMISSION') {
        if (event.submission) {
          setSubmissions((prev) => {
            const exists = prev.some((s) => s.id === event.submission.id);
            return exists ? prev : [event.submission, ...prev];
          });
        }
        if (event.days) setDays(event.days);
        if (event.participants) setParticipants(event.participants);
      } else if (event.type === 'DAYS_UPDATED') {
        if (event.days) setDays(event.days);
      } else if (event.type === 'DATABASE_RESET') {
        setSubmissions([]);
        if (event.days) setDays(event.days);
        setParticipants([]);
      } else if (event.type === 'SUBMISSION_DELETED') {
        if (event.submissionId) {
          setSubmissions((prev) => prev.filter((s) => s.id !== event.submissionId));
        }
        if (event.days) setDays(event.days);
      } else if (event.type === 'DATABASE_RESTORED') {
        syncWithServer();
      }
    });

    // Real-time polling every 4 seconds to sync any multi-device submissions & Admin day locks from server
    const pollInterval = setInterval(() => {
      syncWithServer();
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [syncWithServer]);

  // Persist admin session
  useEffect(() => {
    localStorage.setItem('auditeval_is_admin', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  // Dynamic automatic day detection — STRICTLY filtered to Admin-opened days ONLY
  const now = new Date();
  const currentDayOfMonth = now.getDate();
  const openDaysList = days.filter((d) => d.status === 'open');
  const todayOpenDay = openDaysList.find((d) => {
    const m = d.dateStr.match(/^(\d+)/);
    return m ? parseInt(m[1], 10) === currentDayOfMonth : false;
  });
  const activeAutoDay = todayOpenDay || openDaysList[0] || null;

  const selectedDay = days.find((d) => d.id === selectedDayId) || activeAutoDay || days[0];

  // Dynamic calculations
  const todaySubmitted = activeAutoDay
    ? submissions.filter((s) => s.dayId === activeAutoDay.id).length
    : 0;
  const totalSubmitted = submissions.length;
  const overallSatisfactionPercent =
    submissions.length > 0
      ? (submissions.reduce((acc, curr) => acc + curr.overallSatisfaction, 0) /
          (submissions.length * 5)) *
        100
      : 0;
  const averageScoreOutOf5 =
    submissions.length > 0
      ? submissions.reduce((acc, curr) => acc + curr.overallSatisfaction, 0) /
        submissions.length
      : 0;

  // Handler: Open dedicated evaluation page ONLY if day is open by Admin
  const handleOpenEvaluation = (dayId?: string) => {
    const targetId = dayId || activeAutoDay?.id;
    if (!targetId) return;
    const targetDay = days.find((d) => d.id === targetId);
    if (!targetDay || targetDay.status !== 'open') return;
    setSelectedDayId(targetDay.id);
    setActiveTab('evaluation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Submission success from EvaluationPage (Server verifies day.status === 'open')
  const handleSubmissionSuccess = async (
    newSubmission: EvaluationSubmission
  ): Promise<{ ok: boolean; error?: string }> => {
    // 1. Calculate updated days stats
    const updatedDays = days.map((d) => {
      if (d.id === newSubmission.dayId) {
        const newTotal = d.totalSubmitted + 1;
        const newAvg = Number(
          ((d.averageScore * d.totalSubmitted + newSubmission.overallSatisfaction) / newTotal).toFixed(2)
        );
        return {
          ...d,
          totalSubmitted: newTotal,
          averageScore: newAvg,
        };
      }
      return d;
    });

    // 2. Calculate updated participant record
    const pName =
      newSubmission.participantName ||
      (newSubmission.generalInfo.traineeName
        ? `${newSubmission.generalInfo.traineeId ? `[${newSubmission.generalInfo.traineeId}] ` : ''}${newSubmission.generalInfo.traineeName}`
        : `ผู้เข้าอบรม ${newSubmission.generalInfo.bureauName || ''}`);
    const posText =
      newSubmission.generalInfo.position === 'senior_professional'
        ? 'ชำนาญการ'
        : newSubmission.generalInfo.position === 'special_professional'
        ? 'ชำนาญการพิเศษ'
        : newSubmission.generalInfo.position || 'นักวิชาการตรวจเงินแผ่นดิน';
    const areaText = newSubmission.generalInfo.workArea === 'central' ? 'ส่วนกลาง' : 'ส่วนภูมิภาค';
    const deptText = newSubmission.generalInfo.bureauName
      ? `${areaText} (${newSubmission.generalInfo.bureauName})`
      : areaText;

    let updatedParticipants: ParticipantRecord[] = [];
    const existsIndex = participants.findIndex((p) => p.name === pName);

    if (existsIndex >= 0) {
      updatedParticipants = [...participants];
      const current = updatedParticipants[existsIndex];
      if (!current.completedDays.includes(newSubmission.dayId)) {
        updatedParticipants[existsIndex] = {
          ...current,
          completedDays: [...current.completedDays, newSubmission.dayId],
          lastSubmittedAt: newSubmission.timestamp,
        };
      }
    } else {
      const newRecord: ParticipantRecord = {
        id: `P${participants.length + 1}`,
        code: newSubmission.generalInfo.traineeId || `STG-2569-${(participants.length + 1).toString().padStart(3, '0')}`,
        name: pName,
        position: posText,
        department: deptText,
        workArea: areaText,
        completedDays: [newSubmission.dayId],
        lastSubmittedAt: newSubmission.timestamp,
      };
      updatedParticipants = [newRecord, ...participants];
    }

    // 3. Save via DataService FIRST (Server checks Admin day status === 'open')
    const res = await DataService.submitEvaluation(newSubmission, updatedDays, updatedParticipants);
    if (!res.ok) {
      await syncWithServer();
      return { ok: false, error: res.error };
    }

    // 4. Update state with authoritative server response
    setSubmissions((prev) => [newSubmission, ...prev]);
    setDays(res.days || updatedDays);
    setParticipants(updatedParticipants);
    return { ok: true };
  };

  // Handler: Clear all data (Reset — preserves Admin's open/closed day statuses)
  const handleClearAllData = async () => {
    const res = await DataService.resetDatabase();
    if (res.unauthorized) {
      setIsAdmin(false);
      setShowAdminLoginModal(true);
      return;
    }
    if (res.success) {
      setDays(res.days || days.map((d) => ({ ...d, totalSubmitted: 0, averageScore: 0 })));
      setSubmissions([]);
      setParticipants([]);
    }
  };

  // Handler: Simulate 1 test submission for any prepared day (16-27 Nov)
  const handleSimulateTestSubmission = async (dayId: string = 'day-1') => {
    const day = days.find((d) => d.id === dayId);
    const config = QUESTIONNAIRE_CONFIGS[dayId];
    if (!day || !config) return;

    const now = new Date();
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
    ];
    const timestampStr = `${now.getDate()} ${thaiMonths[now.getMonth()]} 2569 ${now
      .getHours()
      .toString()
      .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} น.`;
    const refCode = `STG-2569-D${day.dayNumber.toString().padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;

    const lecturerScores: Record<string, { q4: number; q5: number; q6: number }> = {};
    for (const session of config.lecturerSessions) {
      lecturerScores[session.id] = { q4: 5, q5: 5, q6: 5 };
    }

    const learningTopics: Record<string, { pre: number; post: number }> = {};
    for (const topic of config.learningTopics) {
      learningTopics[topic.id] = { pre: 3, post: 5 };
    }

    const dailyData: DailyEvaluationResponse = {
      contentScore1: 5,
      contentScore2: 5,
      contentScore3: 5,
      lecturerScores,
      lecturerComment: 'วิทยากรถ่ายทอดความรู้และกรณีศึกษาได้อย่างชัดเจน เป็นประโยชน์อย่างยิ่ง',
      overallProject: config.hasOverallProjectEval
        ? { q8: 5, q9: 5, q10: 5, q11: 5, q12: 5, q13: 5, q14: 5, q15: 5 }
        : undefined,
      learningTopics,
      readiness: config.hasReadiness ? { r1: 5, r2: 5, r3: 5 } : undefined,
      baseline1: 5,
      baseline2: 5,
      baseline3: 5,
      suggestions: `ข้อมูลทดสอบสำหรับ${day.dateStr} เนื้อหาและตัวอย่างสอดคล้องกับการปฏิบัติงาน`,
    };

    const testSub: EvaluationSubmission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dayId: day.id,
      dayTitle: day.title,
      timestamp: timestampStr,
      referenceCode: refCode,
      generalInfo: {
        workArea: 'central',
        bureauName: 'สตน.1',
        position: 'special_professional',
        roles: ['หัวหน้าทีม/หัวหน้างานตรวจสอบ', 'ผู้สอนงาน/ให้คำปรึกษาแนะนำการปฏิบัติงาน'],
      },
      participantName: 'ผู้เข้าอบรม (ชำนาญการพิเศษ · ส่วนกลาง สตน.1)',
      suggestions: dailyData.suggestions,
      dailyData,
      ...(dayId === 'day-1'
        ? {
            day16Data: {
              contentScore1: 5,
              contentScore2: 5,
              contentScore3: 5,
              lecturerMorning1: 5,
              lecturerMorning2: 5,
              lecturerMorning3: 5,
              lecturerAfternoon1: 5,
              lecturerAfternoon2: 5,
              lecturerAfternoon3: 5,
              lecturerComment: dailyData.lecturerComment,
              topic1Pre: 3,
              topic1Post: 5,
              topic2Pre: 3,
              topic2Post: 5,
              baseline1: 5,
              baseline2: 5,
              baseline3: 5,
              suggestions: dailyData.suggestions,
            },
          }
        : {}),
      ...(dayId === 'day-2'
        ? {
            day17Data: {
              contentScore1: 5,
              contentScore2: 5,
              contentScore3: 5,
              lecturerFullDay1: 5,
              lecturerFullDay2: 5,
              lecturerFullDay3: 5,
              lecturerComment: dailyData.lecturerComment,
              topic1Pre: 3,
              topic1Post: 5,
              readiness1: 5,
              readiness2: 5,
              readiness3: 5,
              baseline1: 5,
              baseline2: 5,
              baseline3: 5,
              suggestions: dailyData.suggestions,
            },
          }
        : {}),
      overallSatisfaction: 5.0,
    };

    await handleSubmissionSuccess(testSub);
  };

  // Handler: Toggle day status (open <-> closed)
  const handleToggleDayStatus = async (dayId: string) => {
    const current = days.find((d) => d.id === dayId);
    if (!current) return;
    const nextStatus: DayStatus = current.status === 'open' ? 'closed' : 'open';
    await handleSetDayStatus(dayId, nextStatus);
  };

  // Handler: Admin explicit 3-state day status control
  const handleSetDayStatus = async (dayId: string, status: DayStatus) => {
    const res = await DataService.setDayStatus(dayId, status);
    if (res.unauthorized) {
      setIsAdmin(false);
      setShowAdminLoginModal(true);
      return;
    }
    if (res.success && res.days) {
      setDays(res.days);
    }
  };

  // Handler: Close all open days immediately (Admin only)
  const handleCloseAllDays = async () => {
    const res = await DataService.closeAllDays();
    if (res.unauthorized) {
      setIsAdmin(false);
      setShowAdminLoginModal(true);
      return;
    }
    if (res.success && res.days) {
      setDays(res.days);
    }
  };

  // Handler: Request Admin page
  const handleRequestAdmin = async () => {
    if (isAdmin && (await DataService.verifyAdminSession())) {
      setActiveTab('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsAdmin(false);
      setShowAdminLoginModal(true);
    }
  };

  // Handler: Admin Login Success
  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setShowAdminLoginModal(false);
    setActiveTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Admin Logout
  const handleAdminLogout = async () => {
    await DataService.adminLogout();
    setIsAdmin(false);
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Delete a submission (Admin only)
  const handleDeleteSubmission = async (submissionId: string) => {
    const res = await DataService.deleteSubmission(submissionId);
    if (res.unauthorized) {
      setIsAdmin(false);
      setShowAdminLoginModal(true);
      return;
    }
    setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
    await syncWithServer();
  };

  // Handler: Restore database from JSON
  const handleRestoreDatabase = async (databaseData: any): Promise<boolean> => {
    const ok = await DataService.restoreDatabase(databaseData);
    if (ok) {
      await syncWithServer();
    }
    return ok;
  };

  // Check if current user has submitted selected day
  const hasUserSubmitted = (dayId: string) => {
    return DataService.hasUserSubmitted(dayId);
  };

  // User submissions map for DailyEvaluationSection
  const userSubmissionsMap: Record<string, boolean> = {};
  days.forEach((d) => {
    userSubmissionsMap[d.id] = hasUserSubmitted(d.id);
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sarabun text-charcoal antialiased">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab === 'evaluation' ? 'home' : activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isAdmin={isAdmin}
        onRequestAdmin={handleRequestAdmin}
        onLogoutAdmin={handleAdminLogout}
      />

      {/* Main Dynamic Viewport */}
      <div className="flex-1">
        {/* VIEW 1: HOME PAGE */}
        {activeTab === 'home' && (
          <>
            <Hero days={days} onSelectDay={handleOpenEvaluation} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 pb-24 md:pb-12">
              {/* 3-Step Quick Guide for Trainees */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-kanit font-bold text-navy-900">
                        ขั้นตอนการตอบแบบประเมินผลรายวัน (สะดวก รวดเร็ว 2-3 นาที)
                      </h2>
                      <p className="text-xs text-slate-500 font-sarabun">
                        เพื่อนำข้อมูลไปสรุปรายงานผลและติดตามผลสัมฤทธิ์ตามระเบียบ สตง.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-sarabun text-slate-600 self-start sm:self-auto">
                    <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      ประมาณ 2–3 นาที
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-kanit font-bold text-sm shrink-0 shadow-xs">
                      1
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-kanit font-bold text-navy-900">
                        ข้อมูลทั่วไปของผู้ตอบแบบสอบถาม
                      </div>
                      <p className="text-xs text-slate-600 font-sarabun mt-0.5">
                        ระบุตำแหน่งและพื้นที่ปฏิบัติงาน (ส่วนกลาง หรือ ส่วนภูมิภาค)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-kanit font-bold text-sm shrink-0 shadow-xs">
                      2
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-kanit font-bold text-navy-900">
                        ประเมินความพึงพอใจ &amp; ความรู้
                      </div>
                      <p className="text-xs text-slate-600 font-sarabun mt-0.5">
                        ให้คะแนนวิทยากร (Reaction) และวัดผลความรู้ ก่อน-หลัง อบรม (Learning)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-kanit font-bold text-sm shrink-0 shadow-xs">
                      3
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-kanit font-bold text-navy-900">
                        รับรหัสยืนยันการส่งทันที
                      </div>
                      <p className="text-xs text-slate-600 font-sarabun mt-0.5">
                        บันทึกข้อเสนอแนะ และรับ Reference Code สำหรับเป็นหลักฐานยืนยัน
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <StatsCards
                todaySubmitted={todaySubmitted}
                totalSubmitted={totalSubmitted}
                overallSatisfactionPercent={overallSatisfactionPercent}
                averageScoreOutOf5={averageScoreOutOf5}
                onFilterActiveToday={activeAutoDay ? () => handleOpenEvaluation(activeAutoDay.id) : undefined}
              />

              <DailyEvaluationSection
                days={days}
                userSubmissions={userSubmissionsMap}
                onSelectDay={handleOpenEvaluation}
              />

              {/* Dedicated Kirkpatrick Model Section at bottom of page for mobile convenience & academic reference */}
              <section id="kirkpatrick-model" className="pt-8 border-t border-slate-200 scroll-mt-20">
                <div className="text-center max-w-2xl mx-auto mb-6">
                  <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-navy-100 text-navy-900 text-xs font-kanit font-semibold mb-2 border border-slate-300">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    กรอบทฤษฎีการประเมินผลระดับสากล
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-kanit font-bold text-navy-900">
                    การติดตามประเมินผลตามทฤษฎี Donald Kirkpatrick 4 ระดับ
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-sarabun mt-1.5 max-w-xl mx-auto">
                    หลักสูตรนี้จัดระบบการวัดผลตามมาตรฐานสากล: ประเมินความพึงพอใจ (Reaction) และการเรียนรู้ (Learning) รายวัน เพื่อใช้เป็นฐานข้อมูล (Baseline) ในการติดตามผลพฤติกรรมการปฏิบัติงานจริง (Behavior) และผลสัมฤทธิ์ต่อ สตง. (Results)
                  </p>
                </div>

                <div className="max-w-3xl mx-auto">
                  <KirkpatrickPyramid />
                </div>
              </section>
            </main>

            {/* Mobile Floating Sticky Bar for 1-Tap Evaluation Access (Only active when Admin opened a day) */}
            <div className="fixed bottom-0 inset-x-0 bg-navy-950/95 backdrop-blur-md border-t-2 border-lime/80 py-2.5 px-4 z-40 md:hidden shadow-2xl flex items-center justify-between gap-3">
              {activeAutoDay ? (
                <>
                  <div className="min-w-0">
                    <div className="text-[10px] text-lime font-kanit font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-lime animate-ping" />
                      แบบประเมินประจำวัน:
                    </div>
                    <div className="text-xs text-white font-kanit font-semibold truncate">
                      {activeAutoDay.dayLabel} · {activeAutoDay.dateStr}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEvaluation(activeAutoDay.id)}
                    className="px-4 py-2 bg-lime hover:bg-lime-dark text-navy-950 text-xs font-kanit font-bold rounded-xl shadow-md active:scale-95 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <span>ทำแบบประเมิน</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div className="w-full text-center py-0.5">
                  <div className="text-xs text-slate-300 font-kanit font-medium">
                    ขณะนี้ปิดรับการทำแบบประเมินชั่วคราว (ควบคุมโดยผู้ดูแลระบบ)
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* VIEW 2: DEDICATED FULL-PAGE EVALUATION (Zero Popup Overlays, Responsive on all devices) */}
        {activeTab === 'evaluation' && (
          <EvaluationPage
            day={selectedDay}
            onBackToHome={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSubmitSuccess={handleSubmissionSuccess}
            onViewDashboard={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            hasSubmitted={hasUserSubmitted(selectedDay.id)}
          />
        )}

        {/* VIEW 3: DEDICATED DASHBOARD PAGE */}
        {activeTab === 'dashboard' && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
            <DashboardSection
              days={days}
              submissions={submissions}
              onBackToHome={() => {
                setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </main>
        )}

        {/* VIEW 4: DEDICATED ADMIN PAGE */}
        {activeTab === 'admin' && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
            <AdminPanel
              days={days}
              submissions={submissions}
              participants={participants}
              onClearAllData={handleClearAllData}
              onSimulateTestSubmission={handleSimulateTestSubmission}
              onToggleDayStatus={handleToggleDayStatus}
              onSetDayStatus={handleSetDayStatus}
              onCloseAllDays={handleCloseAllDays}
              onDeleteSubmission={handleDeleteSubmission}
              onRestoreDatabase={handleRestoreDatabase}
              onLogout={handleAdminLogout}
            />
          </main>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Admin Login Modal (only shown when explicitly logging in as admin) */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
