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
import { EvaluationDay, EvaluationSubmission, ParticipantRecord, DayStatus } from './types';
import { DataService } from './services/dataService';

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
        setDays(INITIAL_DAYS);
        setParticipants([]);
      }
    });

    // Real-time polling every 4 seconds to sync any multi-device submissions from server file base
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

  const selectedDay = days.find((d) => d.id === selectedDayId) || days[0];

  // Dynamic calculations
  const todaySubmitted = submissions.filter((s) => s.dayId === 'day-1' || s.dayId === 'day-2').length;
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

  // Handler: Open dedicated evaluation page (NOT a popup modal!)
  const handleOpenEvaluation = (dayId: string = 'day-1') => {
    setSelectedDayId(dayId);
    setActiveTab('evaluation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Submission success from EvaluationPage
  const handleSubmissionSuccess = async (newSubmission: EvaluationSubmission) => {
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
    const pName = newSubmission.participantName || `ผู้เข้าอบรม ${newSubmission.generalInfo.bureauName}`;
    const posText =
      newSubmission.generalInfo.position === 'senior_professional' ? 'ชำนาญการ' : 'ชำนาญการพิเศษ';
    const areaText = newSubmission.generalInfo.workArea === 'central' ? 'ส่วนกลาง' : 'ส่วนภูมิภาค';
    const deptText = `${areaText} (${newSubmission.generalInfo.bureauName})`;

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
        code: `STG-2569-${(participants.length + 1).toString().padStart(3, '0')}`,
        name: pName,
        position: posText,
        department: deptText,
        workArea: areaText,
        completedDays: [newSubmission.dayId],
        lastSubmittedAt: newSubmission.timestamp,
      };
      updatedParticipants = [newRecord, ...participants];
    }

    // 3. Update state
    setSubmissions((prev) => [newSubmission, ...prev]);
    setDays(updatedDays);
    setParticipants(updatedParticipants);

    // 4. Save via DataService with dual-layer persistence (File base + local)
    await DataService.submitEvaluation(newSubmission, updatedDays, updatedParticipants);
  };

  // Handler: Clear all data (Reset)
  const handleClearAllData = async () => {
    await DataService.resetDatabase();
    setDays(INITIAL_DAYS);
    setSubmissions([]);
    setParticipants([]);
  };

  // Handler: Simulate 1 test submission (Day 16 or 17)
  const handleSimulateTestSubmission = async (dayId: string = 'day-1') => {
    const isDay16 = dayId === 'day-1';
    const day = days.find((d) => d.id === dayId) || days[0];
    const now = new Date();
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
    ];
    const timestampStr = `${now.getDate()} ${thaiMonths[now.getMonth()]} 2569 ${now
      .getHours()
      .toString()
      .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} น.`;
    const refCode = `STG-2569-D0${day.dayNumber}-${Math.floor(100 + Math.random() * 900)}`;

    let testSub: EvaluationSubmission;

    if (isDay16) {
      testSub = {
        id: `sub-${Date.now()}`,
        dayId: 'day-1',
        dayTitle: 'ประเมินผลอบรมวันที่ 16 พ.ย. 2569',
        timestamp: timestampStr,
        referenceCode: refCode,
        participantName: 'ผู้เข้าอบรม (ชำนาญการพิเศษ · ส่วนกลาง สตน.1)',
        suggestions: 'เนื้อหาและการวิเคราะห์กรณีศึกษากฎหมายมีความชัดเจนและนำไปใช้จริงได้ดีมาก',
        generalInfo: {
          workArea: 'central',
          bureauName: 'สตน.1',
          position: 'special_professional',
          roles: ['หัวหน้าทีม/หัวหน้างานตรวจสอบ', 'ผู้สอนงาน/ให้คำปรึกษาแนะนำการปฏิบัติงาน'],
        },
        day16Data: {
          contentScore1: 5,
          contentScore2: 5,
          contentScore3: 5,
          lecturerMorning1: 5,
          lecturerMorning2: 5,
          lecturerMorning3: 4,
          lecturerAfternoon1: 5,
          lecturerAfternoon2: 5,
          lecturerAfternoon3: 5,
          lecturerComment: 'วิทยากรถ่ายทอดความรู้ได้กระชับ ชัดเจน พร้อมตอบข้อซักถามได้ตรงจุด',
          topic1Pre: 3,
          topic1Post: 5,
          topic2Pre: 2,
          topic2Post: 5,
          scenario1: 5,
          scenario2: 1,
          scenario3: 5,
          baseline1: 5,
          baseline2: 5,
          baseline3: 5,
          suggestions: 'ขอให้คงรูปแบบการฝึกปฏิบัติ Scenario แบบนี้ในหัวข้อต่อๆ ไป',
        },
        overallSatisfaction: 4.89,
      };
    } else {
      testSub = {
        id: `sub-${Date.now()}`,
        dayId: 'day-2',
        dayTitle: 'ประเมินผลอบรมวันที่ 17 พ.ย. 2569',
        timestamp: timestampStr,
        referenceCode: refCode,
        participantName: 'ผู้เข้าอบรม (ชำนาญการ · ส่วนภูมิภาค ตภ.7)',
        suggestions: 'เทคนิคการรวบรวมพยานหลักฐานมีประโยชน์อย่างมากกับการกำกับงานในพื้นที่',
        generalInfo: {
          workArea: 'regional',
          bureauName: 'ตภ.7',
          position: 'senior_professional',
          roles: ['ปฏิบัติงานตรวจสอบ', 'ผู้ช่วยหรือผู้สอบทานงานตรวจสอบ'],
        },
        day17Data: {
          contentScore1: 5,
          contentScore2: 5,
          contentScore3: 5,
          lecturerFullDay1: 5,
          lecturerFullDay2: 5,
          lecturerFullDay3: 5,
          lecturerComment: 'ตัวอย่างคดีและการรวบรวมหลักฐานพยานทำให้เห็นภาพขั้นตอนชัดเจน',
          topic1Pre: 3,
          topic1Post: 5,
          readiness1: 5,
          readiness2: 5,
          readiness3: 5,
          baseline1: 5,
          baseline2: 5,
          baseline3: 5,
          suggestions: 'อยากให้มีเอกสารเช็คลิสต์พยานหลักฐานแจกจ่ายเพิ่มเติม',
        },
        overallSatisfaction: 5.0,
      };
    }

    await handleSubmissionSuccess(testSub);
  };

  // Handler: Toggle day status (open <-> closed)
  const handleToggleDayStatus = async (dayId: string) => {
    const nextDays: EvaluationDay[] = days.map((d) => {
      if (d.id === dayId) {
        const nextStatus: DayStatus = d.status === 'open' ? 'closed' : 'open';
        return {
          ...d,
          status: nextStatus,
        };
      }
      return d;
    });

    setDays(nextDays);
    await DataService.updateDayStatus(nextDays);
  };

  // Handler: Request Admin page
  const handleRequestAdmin = () => {
    if (isAdmin) {
      setActiveTab('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
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
  const handleAdminLogout = () => {
    setIsAdmin(false);
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <Hero />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 space-y-12">
              <StatsCards
                todaySubmitted={todaySubmitted}
                totalSubmitted={totalSubmitted}
                overallSatisfactionPercent={overallSatisfactionPercent}
                averageScoreOutOf5={averageScoreOutOf5}
                onFilterActiveToday={() => handleOpenEvaluation('day-1')}
              />

              <DailyEvaluationSection
                days={days}
                userSubmissions={userSubmissionsMap}
                onSelectDay={handleOpenEvaluation}
              />
            </main>
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
