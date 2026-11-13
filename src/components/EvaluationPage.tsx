import React, { useState, useEffect } from 'react';
import {
  EvaluationDay,
  EvaluationSubmission,
  GeneralInfo,
  DailyEvaluationResponse,
  Day16Response,
  Day17Response,
} from '../types';
import {
  QUESTIONNAIRE_CONFIGS,
  CONTENT_QUESTIONS,
  READINESS_QUESTIONS,
  BASELINE_QUESTIONS,
  OVERALL_PROJECT_QUESTIONS,
} from '../data/questionnaireConfigs';

interface EvaluationPageProps {
  day: EvaluationDay;
  onBackToHome: () => void;
  onSubmitSuccess: (submission: EvaluationSubmission) => Promise<{ ok: boolean; error?: string }>;
  onViewDashboard?: () => void;
  hasSubmitted?: boolean;
}

const DEFAULT_SCALE_LABELS: Record<number, string> = {
  5: 'มากที่สุด',
  4: 'มาก',
  3: 'ปานกลาง',
  2: 'น้อย',
  1: 'น้อยที่สุด',
};

const READINESS_SCALE_LABELS: Record<number, string> = {
  5: 'ปฏิบัติแน่นอน',
  4: 'มีแนวโน้มสูง',
  3: 'อาจจะปฏิบัติ',
  2: 'แนวโน้มไม่ปฏิบัติ',
  1: 'ไม่ปฏิบัติแน่นอน',
};

export const EvaluationPage: React.FC<EvaluationPageProps> = ({
  day,
  onBackToHome,
  onSubmitSuccess,
  onViewDashboard,
  hasSubmitted = false,
}) => {
  const config = QUESTIONNAIRE_CONFIGS[day.id];

  // Step Management: 1 to 5 (or submitted receipt)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submittedReceipt, setSubmittedReceipt] = useState<EvaluationSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Section 1: General Info (เริ่มต้นว่างไว้ เพื่อรอรับคำตอบจริง)
  const [workArea, setWorkArea] = useState<'central' | 'regional' | ''>('');
  const [bureauName, setBureauName] = useState<string>('');
  const [position, setPosition] = useState<'senior_professional' | 'special_professional' | ''>('');
  const [roles, setRoles] = useState<string[]>([]);

  // Section 2: Level 1 Content (0 = not chosen yet)
  const [contentScore1, setContentScore1] = useState<number>(0);
  const [contentScore2, setContentScore2] = useState<number>(0);
  const [contentScore3, setContentScore3] = useState<number>(0);

  // Section 2: Lecturer scores keyed by session id ('full' | 'morning' | 'afternoon')
  const [lecturerScores, setLecturerScores] = useState<
    Record<string, { q4: number; q5: number; q6: number }>
  >({});

  // Section 2: Question 7 Lecturer Comment
  const [lecturerComment, setLecturerComment] = useState<string>('');
  const [noLecturerComment, setNoLecturerComment] = useState<boolean>(false);

  // Section 2 Special (Day 27 / day-10): Overall Project Satisfaction Items 8-15
  const [overallProjectScores, setOverallProjectScores] = useState<Record<string, number>>({});

  // Section 3.1: Level 2 Learning Pre/Post keyed by topic id ('topic1' | 'topic2')
  const [learningTopics, setLearningTopics] = useState<
    Record<string, { pre: number; post: number }>
  >({});

  // Section 3.2: Capability & Readiness
  const [readinessScores, setReadinessScores] = useState<{ r1: number; r2: number; r3: number }>({
    r1: 0,
    r2: 0,
    r3: 0,
  });

  // Section 4: Level 3 & 4 Baseline
  const [baseline1, setBaseline1] = useState<number>(0);
  const [baseline2, setBaseline2] = useState<number>(0);
  const [baseline3, setBaseline3] = useState<number>(0);

  // Section 5: Suggestions
  const [suggestions, setSuggestions] = useState<string>('');
  const [noSuggestions, setNoSuggestions] = useState<boolean>(false);

  // Step Error State
  const [stepError, setStepError] = useState<string>('');

  // Reset form cleanly if day changes
  useEffect(() => {
    setCurrentStep(1);
    setSubmittedReceipt(null);
    setLecturerScores({});
    setOverallProjectScores({});
    setLearningTopics({});
    setReadinessScores({ r1: 0, r2: 0, r3: 0 });
    setStepError('');
  }, [day.id]);

  const handleRoleToggle = (role: string) => {
    if (roles.includes(role)) {
      setRoles(roles.filter((r) => r !== role));
    } else {
      setRoles([...roles, role]);
    }
    setStepError('');
  };

  const setLecturerField = (sessionId: string, field: 'q4' | 'q5' | 'q6', val: number) => {
    setLecturerScores((prev) => ({
      ...prev,
      [sessionId]: {
        q4: prev[sessionId]?.q4 || 0,
        q5: prev[sessionId]?.q5 || 0,
        q6: prev[sessionId]?.q6 || 0,
        [field]: val,
      },
    }));
    setStepError('');
  };

  const setTopicField = (topicId: string, field: 'pre' | 'post', val: number) => {
    setLearningTopics((prev) => ({
      ...prev,
      [topicId]: {
        pre: prev[topicId]?.pre || 0,
        post: prev[topicId]?.post || 0,
        [field]: val,
      },
    }));
    setStepError('');
  };

  // ==================== VALIDATION ====================
  const validateStep1 = (): boolean => {
    if (!workArea) {
      setStepError('กรุณาเลือกพื้นที่ปฏิบัติงานของท่าน (ส่วนกลาง หรือ ส่วนภูมิภาค)');
      return false;
    }
    if (!bureauName.trim()) {
      setStepError('กรุณาระบุชื่อย่อสำนักของท่าน');
      return false;
    }
    if (!position) {
      setStepError('กรุณาเลือกระดับตำแหน่งปัจจุบันของท่าน');
      return false;
    }
    if (roles.length === 0) {
      setStepError('กรุณาเลือกบทบาทหน้าที่หลักในการปฏิบัติงานปัจจุบันอย่างน้อย 1 ข้อ');
      return false;
    }
    setStepError('');
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!config) return false;
    if (!contentScore1 || !contentScore2 || !contentScore3) {
      setStepError('กรุณาให้คะแนนด้านเนื้อหาวิชาประจำวันให้ครบทุกข้อ (ข้อ 1–3)');
      return false;
    }

    for (const session of config.lecturerSessions) {
      const sc = lecturerScores[session.id];
      if (!sc || !sc.q4 || !sc.q5 || !sc.q6) {
        setStepError(`กรุณาให้คะแนนด้านวิทยากร (${session.sessionLabel}) ให้ครบทุกข้อ (ข้อ 4–6)`);
        return false;
      }
    }

    if (!noLecturerComment && !lecturerComment.trim()) {
      setStepError('กรุณาระบุความเห็นต่อวิทยากร หรือติ๊กเลือก "ไม่มีความเห็นเพิ่มเติมต่อวิทยากร"');
      return false;
    }

    if (config.hasOverallProjectEval) {
      for (const q of OVERALL_PROJECT_QUESTIONS) {
        if (!overallProjectScores[q.key]) {
          setStepError(
            `กรุณาให้คะแนนความพึงพอใจต่อโครงการฝึกอบรมในภาพรวมให้ครบทุกข้อ (ยังขาดข้อที่ ${q.number})`
          );
          return false;
        }
      }
    }

    setStepError('');
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!config) return false;

    for (let idx = 0; idx < config.learningTopics.length; idx++) {
      const topic = config.learningTopics[idx];
      const scores = learningTopics[topic.id];
      if (!scores?.pre) {
        setStepError(`กรุณาประเมินระดับความรู้ความเข้าใจ "ก่อน" การฝึกอบรม ในหัวข้อที่ ${idx + 1}`);
        return false;
      }
      if (!scores?.post) {
        setStepError(`กรุณาประเมินระดับความรู้ความเข้าใจ "หลัง" การฝึกอบรม ในหัวข้อที่ ${idx + 1}`);
        return false;
      }
    }

    if (config.hasReadiness) {
      if (!readinessScores.r1 || !readinessScores.r2 || !readinessScores.r3) {
        setStepError(
          'กรุณาประเมินระดับความสามารถและความพร้อม (3.2 Capability & Readiness) ให้ครบทั้ง 3 ข้อ'
        );
        return false;
      }
    }

    setStepError('');
    return true;
  };

  const validateStep4 = (): boolean => {
    if (!baseline1 || !baseline2 || !baseline3) {
      setStepError('กรุณาประเมินความคาดหวังในการนำไปใช้ (Level 3 & 4 Baseline) ให้ครบทุกข้อ (3 ข้อ)');
      return false;
    }
    setStepError('');
    return true;
  };

  const validateStep5 = (): boolean => {
    if (!noSuggestions && !suggestions.trim()) {
      setStepError('กรุณาระบุข้อเสนอแนะเพิ่มเติม หรือติ๊กเลือก "ไม่มีข้อเสนอแนะเพิ่มเติมในส่วนนี้"');
      return false;
    }
    setStepError('');
    return true;
  };

  const handleNextStep = () => {
    let isValid = false;
    if (currentStep === 1) isValid = validateStep1();
    else if (currentStep === 2) isValid = validateStep2();
    else if (currentStep === 3) isValid = validateStep3();
    else if (currentStep === 4) isValid = validateStep4();

    if (isValid) {
      setStepError('');
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setStepError('');
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpToStep = (targetStep: number) => {
    if (targetStep < currentStep) {
      setStepError('');
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetStep === currentStep + 1) {
      handleNextStep();
    }
  };

  // ==================== FINAL SUBMIT ====================
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !config) return;

    if (day.status !== 'open') {
      setStepError('แบบประเมินของวันนี้ปิดรับคำตอบแล้ว (ควบคุมโดยผู้ดูแลระบบ Admin)');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (
      !validateStep1() ||
      !validateStep2() ||
      !validateStep3() ||
      !validateStep4() ||
      !validateStep5()
    ) {
      return;
    }

    if (!workArea || !position) return;

    const generalInfo: GeneralInfo = {
      workArea,
      bureauName: bureauName.trim(),
      position,
      roles,
    };

    const finalSuggestions = noSuggestions ? 'ไม่มีข้อเสนอแนะเพิ่มเติม' : suggestions.trim();
    const finalLecturerComment = noLecturerComment
      ? 'ไม่มีความเห็นเพิ่มเติม'
      : lecturerComment.trim();

    const normalizedOverallProject = config.hasOverallProjectEval
      ? {
          q8: overallProjectScores.q8,
          q9: overallProjectScores.q9,
          q10: overallProjectScores.q10,
          q11: overallProjectScores.q11,
          q12: overallProjectScores.q12,
          q13: overallProjectScores.q13,
          q14: overallProjectScores.q14,
          q15: overallProjectScores.q15,
        }
      : undefined;

    const dailyData: DailyEvaluationResponse = {
      contentScore1,
      contentScore2,
      contentScore3,
      lecturerScores,
      lecturerComment: finalLecturerComment,
      overallProject: normalizedOverallProject,
      learningTopics,
      readiness: config.hasReadiness ? { ...readinessScores } : undefined,
      baseline1,
      baseline2,
      baseline3,
      suggestions: finalSuggestions,
    };

    // Compute Reaction Score Average across Content + All Lecturer Sessions (+ Overall Project if Day 27)
    const reactionScores: number[] = [contentScore1, contentScore2, contentScore3];
    for (const session of config.lecturerSessions) {
      const sc = lecturerScores[session.id];
      if (sc) {
        reactionScores.push(sc.q4, sc.q5, sc.q6);
      }
    }
    if (normalizedOverallProject) {
      reactionScores.push(
        normalizedOverallProject.q8,
        normalizedOverallProject.q9,
        normalizedOverallProject.q10,
        normalizedOverallProject.q11,
        normalizedOverallProject.q12,
        normalizedOverallProject.q13,
        normalizedOverallProject.q14,
        normalizedOverallProject.q15
      );
    }

    const overallSatisfaction = Number(
      (reactionScores.reduce((a, b) => a + b, 0) / reactionScores.length).toFixed(2)
    );

    // Populate legacy day16Data / day17Data when applicable so old readers stay 100% compatible
    let day16Data: Day16Response | undefined = undefined;
    let day17Data: Day17Response | undefined = undefined;

    if (day.id === 'day-1') {
      day16Data = {
        contentScore1,
        contentScore2,
        contentScore3,
        lecturerMorning1: lecturerScores.morning?.q4 || 0,
        lecturerMorning2: lecturerScores.morning?.q5 || 0,
        lecturerMorning3: lecturerScores.morning?.q6 || 0,
        lecturerAfternoon1: lecturerScores.afternoon?.q4 || 0,
        lecturerAfternoon2: lecturerScores.afternoon?.q5 || 0,
        lecturerAfternoon3: lecturerScores.afternoon?.q6 || 0,
        lecturerComment: finalLecturerComment,
        topic1Pre: learningTopics.topic1?.pre || 0,
        topic1Post: learningTopics.topic1?.post || 0,
        topic2Pre: learningTopics.topic2?.pre || 0,
        topic2Post: learningTopics.topic2?.post || 0,
        baseline1,
        baseline2,
        baseline3,
        suggestions: finalSuggestions,
      };
    } else if (day.id === 'day-2') {
      day17Data = {
        contentScore1,
        contentScore2,
        contentScore3,
        lecturerFullDay1: lecturerScores.full?.q4 || 0,
        lecturerFullDay2: lecturerScores.full?.q5 || 0,
        lecturerFullDay3: lecturerScores.full?.q6 || 0,
        lecturerComment: finalLecturerComment,
        topic1Pre: learningTopics.topic1?.pre || 0,
        topic1Post: learningTopics.topic1?.post || 0,
        readiness1: readinessScores.r1,
        readiness2: readinessScores.r2,
        readiness3: readinessScores.r3,
        baseline1,
        baseline2,
        baseline3,
        suggestions: finalSuggestions,
      };
    }

    const posLabel = position === 'senior_professional' ? 'ชำนาญการ' : 'ชำนาญการพิเศษ';
    const areaLabel = workArea === 'central' ? 'ส่วนกลาง' : 'ส่วนภูมิภาค';
    const participantName = `ผู้เข้าอบรม (${posLabel} · ${areaLabel} ${bureauName.trim()})`;

    const seq = Math.floor(100 + Math.random() * 900);
    const dayCode = `D${day.dayNumber.toString().padStart(2, '0')}`;
    const refCode = `STG-2569-${dayCode}-${seq}`;
    const now = new Date();
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
    ];
    const timestampStr = `${now.getDate()} ${thaiMonths[now.getMonth()]} 2569 ${now
      .getHours()
      .toString()
      .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} น.`;

    const newSubmission: EvaluationSubmission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dayId: day.id,
      dayTitle: day.title,
      timestamp: timestampStr,
      referenceCode: refCode,
      generalInfo,
      participantName,
      suggestions: finalSuggestions,
      dailyData,
      day16Data,
      day17Data,
      overallSatisfaction,
    };

    setIsSubmitting(true);
    const result = await onSubmitSuccess(newSubmission);
    setIsSubmitting(false);

    if (!result.ok) {
      setStepError(result.error || 'ไม่สามารถบันทึกแบบประเมินได้ กรุณาลองใหม่อีกครั้ง');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmittedReceipt(newSubmission);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==================== REUSABLE UI HELPERS ====================
  const renderRatingRadio = (
    label: string,
    currentVal: number,
    onSelect: (val: number) => void,
    scaleLabels: Record<number, string> = DEFAULT_SCALE_LABELS
  ) => {
    const isUnanswered = currentVal === 0;

    return (
      <div
        className={`bg-white p-4 sm:p-5 rounded-xl border transition-all ${
          isUnanswered ? 'border-slate-200' : 'border-lime/40 bg-lime/5 ring-1 ring-lime/20'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
          <p className="text-base sm:text-lg font-prompt font-semibold text-slate-900 leading-snug">
            {label} <span className="text-red-500 font-bold">*</span>
          </p>
          {currentVal > 0 ? (
            <span className="text-xs sm:text-sm font-prompt font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full shrink-0 self-start border border-emerald-200">
              {currentVal} คะแนน ({scaleLabels[currentVal]})
            </span>
          ) : (
            <span className="text-xs sm:text-sm font-prompt text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full shrink-0 border border-amber-200 self-start">
              ยังไม่ได้เลือก
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 max-w-2xl">
          {[5, 4, 3, 2, 1].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                onSelect(val);
                setStepError('');
              }}
              className={`min-h-[48px] py-1.5 px-1 flex flex-col items-center justify-center rounded-lg text-xs font-prompt cursor-pointer border transition-all active:scale-95 ${
                currentVal === val
                  ? 'bg-lime text-navy-900 border-lime font-bold shadow-xs ring-2 ring-lime/40 scale-102'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span className="text-base sm:text-lg font-bold leading-none">{val}</span>
              <span className="text-[10px] sm:text-[11px] block text-slate-600 font-normal leading-tight mt-0.5 text-center">
                {scaleLabels[val]}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderPrePostComparison = (
    topicNum: number,
    topicTitle: string,
    preVal: number,
    onPre: (val: number) => void,
    postVal: number,
    onPost: (val: number) => void,
    sessionTag?: string
  ) => {
    const isPreAnswered = preVal > 0;
    const isPostAnswered = postVal > 0;
    const diff = postVal - preVal;

    return (
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-200 pb-3">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="bg-navy-900 text-lime px-2.5 py-0.5 rounded-md text-xs font-prompt font-bold">
              หัวข้อที่ {topicNum}
            </span>
            {sessionTag && (
              <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-xs font-prompt font-semibold">
                {sessionTag}
              </span>
            )}
            <span className="text-xs font-prompt text-slate-500">
              เปรียบเทียบระดับความรู้ ก่อน-หลัง การอบรม
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-prompt font-bold text-navy-900 leading-snug">
            {topicTitle}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {/* BEFORE TRAINING */}
          <div
            className={`rounded-xl p-4 sm:p-5 border-2 transition-all ${
              isPreAnswered
                ? 'border-amber-400 bg-amber-50/40 shadow-xs'
                : 'border-amber-200 bg-amber-50/20'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs sm:text-sm font-prompt font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <span>1. ระดับความรู้ความเข้าใจ &quot;ก่อน&quot; การฝึกอบรม</span>
              </span>
              {isPreAnswered && (
                <span className="text-xs font-prompt font-bold text-amber-900 shrink-0">
                  {preVal} / 5
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-prompt text-slate-600 mb-3">
              โปรดประเมินความรู้เดิมของท่าน <b>ก่อนเริ่มเรียน</b> ในหัวข้อนี้
            </p>

            <div className="grid grid-cols-5 gap-1.5">
              {[5, 4, 3, 2, 1].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onPre(v)}
                  className={`h-11 flex flex-col items-center justify-center rounded-lg text-xs font-prompt cursor-pointer border transition-all active:scale-95 ${
                    preVal === v
                      ? 'bg-amber-400 text-amber-950 border-amber-500 font-bold shadow-xs scale-102 ring-2 ring-amber-300'
                      : 'bg-white hover:bg-amber-50 text-slate-700 border-amber-200'
                  }`}
                >
                  <span className="text-base font-bold leading-none">{v}</span>
                  <span className="text-[10px] font-prompt text-slate-500 leading-tight">
                    {v === 5 ? 'มากสุด' : v === 1 ? 'น้อยสุด' : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* AFTER TRAINING */}
          <div
            className={`rounded-xl p-4 sm:p-5 border-2 transition-all ${
              isPostAnswered
                ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                : 'border-emerald-200 bg-emerald-50/20'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs sm:text-sm font-prompt font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                <span>2. ระดับความรู้ความเข้าใจ &quot;หลัง&quot; การฝึกอบรม</span>
              </span>
              {isPostAnswered && (
                <span className="text-xs font-prompt font-bold text-emerald-900 shrink-0">
                  {postVal} / 5
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-prompt text-slate-600 mb-3">
              โปรดประเมินความรู้ที่ได้รับเพิ่มขึ้น <b>หลังผ่านการอบรม</b> ในวันนี้
            </p>

            <div className="grid grid-cols-5 gap-1.5">
              {[5, 4, 3, 2, 1].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onPost(v)}
                  className={`h-11 flex flex-col items-center justify-center rounded-lg text-xs font-prompt cursor-pointer border transition-all active:scale-95 ${
                    postVal === v
                      ? 'bg-lime text-navy-900 border-lime font-bold shadow-xs scale-102 ring-2 ring-lime/40'
                      : 'bg-white hover:bg-emerald-50 text-slate-700 border-emerald-200'
                  }`}
                >
                  <span className="text-base font-bold leading-none">{v}</span>
                  <span className="text-[10px] font-prompt text-slate-500 leading-tight">
                    {v === 5 ? 'มากสุด' : v === 1 ? 'น้อยสุด' : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {isPreAnswered && isPostAnswered && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-prompt">
            <span className="text-slate-600">
              ผลการเปรียบเทียบ: ก่อนได้ <b className="text-amber-800">{preVal}</b> คะแนน ➔ หลังได้{' '}
              <b className="text-emerald-800">{postVal}</b> คะแนน
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold ${
                diff > 0
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : diff === 0
                  ? 'bg-slate-200 text-slate-700'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {diff > 0 ? `พัฒนาการเพิ่มขึ้น +${diff} ระดับความรู้` : `เท่าเดิม (${preVal} คะแนน)`}
            </span>
          </div>
        )}
      </div>
    );
  };

  const stepsList = [
    { num: 1, title: 'ส่วนที่ 1 ข้อมูลทั่วไป' },
    { num: 2, title: 'ส่วนที่ 2 Level 1 Reaction' },
    { num: 3, title: 'ส่วนที่ 3 Level 2 Learning' },
    { num: 4, title: 'ส่วนที่ 4 Baseline (Lv 3-4)' },
    { num: 5, title: 'ส่วนที่ 5 ข้อเสนอแนะ & ตรวจทาน' },
  ];

  // ==================== SUCCESS RECEIPT VIEW ====================
  if (submittedReceipt) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-prompt">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="bg-navy-900 text-white p-6 sm:p-8 text-center border-b-4 border-lime">
            <div className="inline-block px-3.5 py-1 bg-lime/20 text-lime font-prompt text-xs font-semibold rounded-full border border-lime/30 mb-3">
              บันทึกสำเร็จเรียบร้อย
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-prompt font-bold text-white mb-2">
              ส่งแบบประเมินแล้ว
            </h1>
            <p className="text-sm sm:text-base text-lime font-prompt font-medium">
              ระบบได้บันทึกผลการประเมินของท่านเข้าสู่ฐานข้อมูลเรียบร้อยสมบูรณ์
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 font-prompt text-sm space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-prompt text-xs">รหัสอ้างอิงการประเมิน:</span>
                <span className="font-mono font-bold text-navy-900 text-xs sm:text-sm tracking-wider bg-white px-2.5 py-1 rounded border border-slate-200">
                  {submittedReceipt.referenceCode}
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-slate-500 text-xs font-prompt">หลักสูตร:</span>
                <span className="font-medium text-slate-800 text-right text-xs sm:text-sm max-w-[280px]">
                  การตรวจสอบการปฏิบัติตามกฎหมาย ระดับกลาง
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-slate-500 text-xs font-prompt">แบบประเมิน:</span>
                <span className="font-medium text-slate-800 text-right text-xs sm:text-sm">
                  {day.title}
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-slate-500 text-xs font-prompt">ผู้ประเมิน:</span>
                <span className="text-slate-700 text-xs sm:text-sm">
                  {submittedReceipt.participantName}
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-slate-500 text-xs font-prompt">เวลาที่บันทึกส่ง:</span>
                <span className="text-slate-600 text-xs tabular-nums">
                  {submittedReceipt.timestamp}
                </span>
              </div>
            </div>

            <div className="text-center text-xs sm:text-sm text-slate-500 font-prompt leading-relaxed">
              สถาบันพัฒนาการตรวจเงินแผ่นดิน · สำนักงานการตรวจเงินแผ่นดิน (สตง.)
              <br />
              ขอขอบคุณสำหรับข้อคิดเห็นอันเป็นประโยชน์ต่อการพัฒนาหลักสูตรและการเรียนรู้
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={onBackToHome}
                className="w-full py-3.5 bg-lime hover:bg-lime-dark text-navy-900 rounded-xl text-base font-prompt font-bold flex items-center justify-center cursor-pointer transition-colors shadow-md hover:shadow-lime/30"
              >
                กลับสู่หน้าแรก
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2.5 px-3 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-prompt text-center cursor-pointer transition-colors"
                >
                  พิมพ์หลักฐาน
                </button>

                {onViewDashboard && (
                  <button
                    type="button"
                    onClick={onViewDashboard}
                    className="py-2.5 px-3 bg-navy-800 hover:bg-navy-900 text-white rounded-xl text-xs sm:text-sm font-prompt text-center cursor-pointer transition-colors"
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
  }

  // ==================== DAY CLOSED / NO CONFIG GUARD ====================
  if (day.status !== 'open' || !config) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-prompt">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="bg-navy-900 text-white p-6 sm:p-8 text-center border-b-4 border-rose-500">
            <div className="inline-block px-3.5 py-1 bg-rose-500/20 text-rose-300 font-prompt text-xs font-semibold rounded-full border border-rose-400/40 mb-3">
              {day.status === 'closed'
                ? 'ปิดรับคำตอบแล้ว'
                : !config
                ? 'รอข้อมูลแบบสอบถาม'
                : 'ยังไม่เปิดรับคำตอบ'}
            </div>
            <h1 className="text-xl sm:text-2xl font-prompt font-bold text-white mb-2">
              {day.dayLabel} · {day.dateStr}
            </h1>
            <p className="text-sm text-slate-300 font-prompt">{day.title}</p>
          </div>
          <div className="p-6 sm:p-8 space-y-5 text-center">
            <p className="text-sm sm:text-base text-slate-700 font-sarabun leading-relaxed">
              {day.status === 'closed'
                ? 'ผู้ดูแลระบบ (Admin) ได้ปิดรับคำตอบแบบประเมินสำหรับรอบวันนี้แล้ว ไม่สามารถทำรายการหรือส่งคำตอบเพิ่มเติมได้'
                : 'แบบประเมินของรอบวันนี้ยังไม่เปิดให้ทำรายการ กรุณารอผู้ดูแลระบบ (Admin) เปิดรับคำตอบ'}
            </p>
            <button
              type="button"
              onClick={onBackToHome}
              className="w-full py-3.5 bg-navy-900 hover:bg-navy-800 text-lime rounded-xl text-sm sm:text-base font-prompt font-bold transition-colors cursor-pointer shadow-md"
            >
              ← กลับสู่หน้าหลัก
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Compute Step 2 answered progress counter
  const step2TotalCount =
    3 + config.lecturerSessions.length * 3 + (config.hasOverallProjectEval ? OVERALL_PROJECT_QUESTIONS.length : 0);
  const step2AnsweredCount =
    [contentScore1, contentScore2, contentScore3].filter((v) => v > 0).length +
    config.lecturerSessions.reduce((acc, s) => {
      const sc = lecturerScores[s.id];
      return acc + (sc ? [sc.q4, sc.q5, sc.q6].filter((v) => v > 0).length : 0);
    }, 0) +
    (config.hasOverallProjectEval
      ? OVERALL_PROJECT_QUESTIONS.filter((q) => (overallProjectScores[q.key] || 0) > 0).length
      : 0);

  // ==================== FULL-PAGE QUESTIONNAIRE VIEW ====================
  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 font-prompt">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-navy-900 rounded-2xl p-5 sm:p-7 text-white border-b-4 border-lime shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-prompt font-semibold text-lime hover:text-white px-3.5 py-1.5 rounded-lg bg-navy-800/80 border border-lime/30 hover:border-lime transition-colors self-start cursor-pointer"
            >
              ← กลับสู่หน้าหลัก
            </button>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="bg-white px-2 py-0.5 rounded-md shadow-xs shrink-0">
                <img
                  src="/assets/aistudio/Asset_8_300x_0_30a573ad.png"
                  alt="SADI Logo"
                  className="h-5 w-auto object-contain"
                />
              </span>
              <span className="text-xs sm:text-sm text-slate-300 font-prompt">
                สถาบันพัฒนาการตรวจเงินแผ่นดิน · สำนักงานการตรวจเงินแผ่นดิน
              </span>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-lime/20 text-lime px-2.5 py-0.5 rounded text-xs font-prompt font-semibold border border-lime/30">
                {day.dayLabel} · {config.dateFullLabel}
              </span>
              <span className="bg-slate-800 text-slate-200 px-2.5 py-0.5 rounded text-xs font-prompt border border-slate-700">
                {config.shortTopic}
              </span>
              {hasSubmitted && (
                <span className="text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded font-prompt">
                  ประเมินแล้ว (สามารถส่งเพิ่มเติมได้)
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-prompt font-bold text-white leading-snug">
              แบบสอบถามประเมินผลโครงการฝึกอบรม
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-prompt mt-1">
              หลักสูตร &quot;การตรวจสอบการปฏิบัติตามกฎหมาย ระดับกลาง&quot; ประจำ{config.dateFullLabel}
            </p>
          </div>
        </div>

        {/* Step Progress Navigation */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs">
          <div className="sm:hidden space-y-2">
            <div className="flex justify-between items-center text-xs font-prompt">
              <span className="font-semibold text-navy-900">
                ขั้นตอนที่ {currentStep} จาก 5:
              </span>
              <span className="text-lime-dark font-bold">
                {stepsList[currentStep - 1].title}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-lime h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="hidden sm:flex items-center justify-between gap-1 overflow-x-auto">
            {stepsList.map((st) => {
              const isCurrent = currentStep === st.num;
              const isPast = currentStep > st.num;
              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => handleJumpToStep(st.num)}
                  disabled={st.num > currentStep}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-prompt transition-all ${
                    isCurrent
                      ? 'bg-navy-900 text-lime font-bold shadow-xs ring-1 ring-lime/40'
                      : isPast
                      ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 cursor-pointer border border-slate-200'
                      : 'text-slate-400 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isCurrent
                        ? 'bg-lime text-navy-900'
                        : isPast
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPast ? '✓' : st.num}
                  </span>
                  <span className="whitespace-nowrap">{st.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Validation Error Alert */}
        {stepError && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-800 text-sm font-prompt font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>{stepError}</span>
            </div>
            <span className="text-xs bg-red-200/60 px-2.5 py-1 rounded text-red-900 shrink-0 ml-2">
              จำเป็นต้องตอบ
            </span>
          </div>
        )}

        <form onSubmit={handleFinalSubmit} className="space-y-6">
          {/* ==================== STEP 1: ข้อมูลทั่วไป ==================== */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 text-sm text-slate-700 font-prompt space-y-2.5 shadow-xs">
                <h3 className="font-prompt font-bold text-navy-900 text-base sm:text-lg">
                  คำชี้แจง
                </h3>
                <ol className="list-decimal pl-5 space-y-2 leading-relaxed text-slate-700">
                  <li>
                    แบบสอบถามนี้จัดทำขึ้นเพื่อประเมินผลความพึงพอใจและวัดผลการเรียนรู้รายวัน (Reaction and Learning Evaluation) เพื่อรวบรวมและวิเคราะห์สรุปรายงานผลการดำเนินโครงการภายหลังเสร็จสิ้นการดำเนินโครงการในวันสุดท้าย เสนอผู้บังคับบัญชาตามระเบียบต่อไป
                  </li>
                  <li>
                    รายงานฉบับนี้จะเป็นข้อมูลสำหรับติดตามประเมินผลการนำความรู้ไปใช้ปฏิบัติงานจริงภายหลังเสร็จสิ้นการฝึกอบรมไม่น้อยกว่า 3 – 6 เดือน ต่อไป (Behavior and Result Evaluation)
                  </li>
                  <li>
                    การให้ข้อมูลตามความเป็นจริงของท่านเป็นหัวใจสำคัญที่จะช่วยให้ได้ข้อมูลที่ถูกต้อง นำไปสู่การพัฒนาหลักสูตรและระบบสนับสนุนการทำงานที่ตรงจุดอย่างแท้จริง
                  </li>
                </ol>
              </div>

              <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-xs font-prompt font-semibold text-lime-dark uppercase tracking-wider">
                    ขั้นตอนที่ 1 จาก 5
                  </span>
                  <h2 className="font-prompt font-bold text-lg sm:text-xl text-navy-900">
                    ส่วนที่ 1 ข้อมูลทั่วไปของผู้ตอบแบบสอบถาม
                  </h2>
                </div>

                {/* 1. พื้นที่ปฏิบัติงาน */}
                <div className="space-y-2">
                  <p className="text-base sm:text-lg font-prompt font-semibold text-slate-900">
                    1. พื้นที่ปฏิบัติงานของท่าน <span className="text-red-500 font-bold">*</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        workArea === 'central'
                          ? 'border-lime bg-lime/10 ring-1 ring-lime/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <input
                          type="radio"
                          name="workArea"
                          checked={workArea === 'central'}
                          onChange={() => {
                            setWorkArea('central');
                            setStepError('');
                          }}
                          className="text-lime-dark focus:ring-lime h-4 w-4 cursor-pointer"
                        />
                        <span className="text-base font-prompt font-bold text-slate-900">
                          ส่วนกลาง
                        </span>
                      </div>
                      <input
                        type="text"
                        disabled={workArea !== 'central'}
                        value={workArea === 'central' ? bureauName : ''}
                        onChange={(e) => {
                          setBureauName(e.target.value);
                          setStepError('');
                        }}
                        placeholder="ระบุชื่อย่อสำนัก เช่น สตน.1, สตก.1, สพบ."
                        className="w-full text-sm font-prompt px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </label>

                    <label
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        workArea === 'regional'
                          ? 'border-lime bg-lime/10 ring-1 ring-lime/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <input
                          type="radio"
                          name="workArea"
                          checked={workArea === 'regional'}
                          onChange={() => {
                            setWorkArea('regional');
                            setStepError('');
                          }}
                          className="text-lime-dark focus:ring-lime h-4 w-4 cursor-pointer"
                        />
                        <span className="text-base font-prompt font-bold text-slate-900">
                          ส่วนภูมิภาค
                        </span>
                      </div>
                      <input
                        type="text"
                        disabled={workArea !== 'regional'}
                        value={workArea === 'regional' ? bureauName : ''}
                        onChange={(e) => {
                          setBureauName(e.target.value);
                          setStepError('');
                        }}
                        placeholder="ระบุชื่อย่อสำนัก เช่น ตภ.1, ตภ.7, ตภ.10"
                        className="w-full text-sm font-prompt px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </label>
                  </div>
                </div>

                {/* 2. ระดับตำแหน่งปัจจุบัน */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <p className="text-base sm:text-lg font-prompt font-semibold text-slate-900">
                    2. ระดับตำแหน่งปัจจุบัน <span className="text-red-500 font-bold">*</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                        position === 'senior_professional'
                          ? 'border-lime bg-lime/10 ring-1 ring-lime/40 text-slate-950 font-medium'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="position"
                        checked={position === 'senior_professional'}
                        onChange={() => {
                          setPosition('senior_professional');
                          setStepError('');
                        }}
                        className="text-lime-dark focus:ring-lime h-4 w-4 cursor-pointer"
                      />
                      <span className="text-sm sm:text-base font-prompt text-slate-900">
                        ชำนาญการ (ปฏิบัติงานด้านตรวจสอบไม่น้อยกว่า 3 ปี)
                      </span>
                    </label>

                    <label
                      className={`p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                        position === 'special_professional'
                          ? 'border-lime bg-lime/10 ring-1 ring-lime/40 text-slate-950 font-medium'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="position"
                        checked={position === 'special_professional'}
                        onChange={() => {
                          setPosition('special_professional');
                          setStepError('');
                        }}
                        className="text-lime-dark focus:ring-lime h-4 w-4 cursor-pointer"
                      />
                      <span className="text-sm sm:text-base font-prompt text-slate-900 font-medium">
                        ชำนาญการพิเศษ
                      </span>
                    </label>
                  </div>
                </div>

                {/* 3. บทบาทหน้าที่หลัก */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <p className="text-base sm:text-lg font-prompt font-semibold text-slate-900">
                    3. บทบาทหน้าที่หลักในการปฏิบัติงานปัจจุบัน (เลือกได้มากกว่า 1 ข้อ){' '}
                    <span className="text-red-500 font-bold">*</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      'ปฏิบัติงานตรวจสอบ',
                      'หัวหน้าทีม/หัวหน้างานตรวจสอบ',
                      'ผู้ช่วยหรือผู้สอบทานงานตรวจสอบ',
                      'ผู้สอนงาน/ให้คำปรึกษาแนะนำการปฏิบัติงาน',
                    ].map((role) => (
                      <label
                        key={role}
                        className={`p-3 sm:p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2.5 text-sm sm:text-base font-prompt ${
                          roles.includes(role)
                            ? 'border-lime bg-lime/10 font-medium text-slate-950 ring-1 ring-lime/40'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={roles.includes(role)}
                          onChange={() => handleRoleToggle(role)}
                          className="rounded text-lime-dark focus:ring-lime h-4 w-4 cursor-pointer"
                        />
                        <span>{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== STEP 2: Level 1 Reaction ==================== */}
          {currentStep === 2 && (
            <div className="bg-white p-5 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-6">
              <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-prompt font-semibold text-lime-dark uppercase tracking-wider">
                    ขั้นตอนที่ 2 จาก 5
                  </span>
                  <h2 className="font-prompt font-bold text-lg sm:text-xl text-navy-900">
                    ส่วนที่ 2: Level 1 Reaction (ประเมินความพึงพอใจต่อเนื้อหาและวิทยากรประจำวัน)
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-prompt font-semibold text-navy-900 bg-lime/25 px-3 py-1 rounded-md border border-lime/40">
                    ตอบแล้ว {step2AnsweredCount} / {step2TotalCount} ข้อ
                  </span>
                  <span className="text-xs sm:text-sm font-prompt text-slate-600 bg-slate-100 px-3 py-1 rounded-md">
                    5 = มากที่สุด ถึง 1 = น้อยที่สุด
                  </span>
                </div>
              </div>

              {/* ด้านเนื้อหาวิชาประจำวัน */}
              <div className="space-y-4">
                <h3 className="font-prompt font-bold text-base sm:text-lg text-navy-900 pb-1 border-b">
                  ด้านเนื้อหาวิชาประจำวัน (บังคับตอบครบ 3 ข้อ)
                </h3>
                {renderRatingRadio(CONTENT_QUESTIONS[0].label, contentScore1, setContentScore1)}
                {renderRatingRadio(CONTENT_QUESTIONS[1].label, contentScore2, setContentScore2)}
                {renderRatingRadio(CONTENT_QUESTIONS[2].label, contentScore3, setContentScore3)}
              </div>

              {/* ด้านวิทยากรประจำวัน (1 หรือ 2 ช่วงตามโครงสร้างของวันนั้นๆ) */}
              {config.lecturerSessions.map((session) => {
                const sc = lecturerScores[session.id] || { q4: 0, q5: 0, q6: 0 };
                return (
                  <div key={session.id} className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="pb-2 border-b border-slate-200">
                      <h3 className="font-prompt font-bold text-base sm:text-lg text-navy-900">
                        {session.headerText}
                      </h3>
                      {session.speakerName && (
                        <p className="text-sm font-prompt font-semibold text-emerald-800 bg-emerald-50 inline-block px-3 py-1 rounded-lg border border-emerald-200 mt-1.5">
                          วิทยากร: {session.speakerName}
                        </p>
                      )}
                    </div>

                    {renderRatingRadio(
                      '4. วิทยากรมีความรู้ ความเชี่ยวชาญตามหัวข้อวิชาที่ถ่ายทอดความรู้',
                      sc.q4,
                      (val) => setLecturerField(session.id, 'q4', val)
                    )}
                    {renderRatingRadio(
                      '5. วิทยากรถ่ายทอดเนื้อหา เทคนิค และกรณีศึกษาได้อย่างชัดเจน เข้าใจง่าย',
                      sc.q5,
                      (val) => setLecturerField(session.id, 'q5', val)
                    )}
                    {renderRatingRadio(
                      '6. วิทยากรกระตุ้นให้เกิดการแลกเปลี่ยนเรียนรู้และตอบข้อซักถามได้ตรงประเด็น',
                      sc.q6,
                      (val) => setLecturerField(session.id, 'q6', val)
                    )}
                  </div>
                );
              })}

              {/* ข้อ 7 ความเห็นต่อวิทยากร */}
              <div className="pt-4 border-t border-slate-100 space-y-3 bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-base font-prompt font-semibold text-slate-900">
                    7. ความเห็นต่อวิทยากร ระบุ <span className="text-red-500">*</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      checked={noLecturerComment}
                      onChange={(e) => {
                        setNoLecturerComment(e.target.checked);
                        if (e.target.checked) setLecturerComment('');
                        setStepError('');
                      }}
                      className="rounded text-lime-dark focus:ring-lime"
                    />
                    <span className="text-xs sm:text-sm font-prompt text-slate-700">
                      ไม่มีความเห็นเพิ่มเติมต่อวิทยากร
                    </span>
                  </label>
                </div>

                <textarea
                  rows={2}
                  disabled={noLecturerComment}
                  value={noLecturerComment ? 'ไม่มีความเห็นเพิ่มเติมต่อวิทยากร' : lecturerComment}
                  onChange={(e) => {
                    setLecturerComment(e.target.value);
                    setStepError('');
                  }}
                  placeholder="ระบุความเห็นเพิ่มเติมต่อวิทยากร เทคนิคการสอน หรือบรรยากาศการเรียนรู้..."
                  className="w-full text-sm font-prompt px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime disabled:bg-slate-100 disabled:text-slate-400"
                ></textarea>
              </div>

              {/* เฉพาะวันที่ 27 พ.ย. (day-10): ความพึงพอใจต่อโครงการฝึกอบรมในภาพรวม (ข้อ 8-15) */}
              {config.hasOverallProjectEval && (
                <div className="space-y-6 pt-5 border-t-2 border-navy-900/15">
                  <div className="bg-navy-900 text-white rounded-xl p-4 sm:p-5 border-l-4 border-lime">
                    <span className="text-xs font-prompt font-semibold text-lime uppercase tracking-wider block">
                      ส่วนประเมินเพิ่มเติมสำหรับวันสุดท้ายของโครงการ
                    </span>
                    <h3 className="font-prompt font-bold text-lg sm:text-xl text-white mt-0.5">
                      ความพึงพอใจต่อโครงการฝึกอบรมในภาพรวม (ข้อ 8–15)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 font-sarabun mt-1">
                      ประเมินคุณภาพเนื้อหาสาระตลอดหลักสูตรและการบริหารจัดการโครงการตั้งแต่วันแรกจนถึงวันสุดท้าย
                    </p>
                  </div>

                  {/* ด้านเนื้อหาสาระทั้งโครงการ (ข้อ 8-11) */}
                  <div className="space-y-4">
                    <h4 className="font-prompt font-bold text-base sm:text-lg text-navy-900 pb-1 border-b">
                      ด้านเนื้อหาสาระทั้งโครงการ (ข้อ 8–11)
                    </h4>
                    {OVERALL_PROJECT_QUESTIONS.filter((q) => q.category === 'content').map((q) => (
                      <React.Fragment key={q.key}>
                        {renderRatingRadio(q.label, overallProjectScores[q.key] || 0, (val) => {
                          setOverallProjectScores((prev) => ({ ...prev, [q.key]: val }));
                          setStepError('');
                        })}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* ด้านการบริหารจัดการ (ข้อ 12-15) */}
                  <div className="space-y-4 pt-3 border-t border-slate-200">
                    <h4 className="font-prompt font-bold text-base sm:text-lg text-navy-900 pb-1 border-b">
                      ด้านการบริหารจัดการ (ข้อ 12–15)
                    </h4>
                    {OVERALL_PROJECT_QUESTIONS.filter((q) => q.category === 'management').map(
                      (q) => (
                        <React.Fragment key={q.key}>
                          {renderRatingRadio(q.label, overallProjectScores[q.key] || 0, (val) => {
                            setOverallProjectScores((prev) => ({ ...prev, [q.key]: val }));
                            setStepError('');
                          })}
                        </React.Fragment>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== STEP 3: Level 2 Learning ==================== */}
          {currentStep === 3 && (
            <div className="bg-white p-5 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-6">
              <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="text-xs font-prompt font-semibold text-lime-dark uppercase tracking-wider">
                    ขั้นตอนที่ 3 จาก 5
                  </span>
                  <h2 className="font-prompt font-bold text-lg sm:text-xl text-navy-900">
                    ส่วนที่ 3: Level 2 Learning (ประเมินความรู้ ความเข้าใจที่เกิดขึ้นประจำวัน)
                  </h2>
                </div>
                <span className="text-xs sm:text-sm font-prompt text-slate-600 bg-slate-100 px-3 py-1 rounded-md">
                  ประเมินตนเอง (Self-Assessment)
                </span>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs sm:text-sm font-prompt text-blue-900 leading-relaxed">
                  <b>3.1 การประเมินระดับความรู้ ความเข้าใจด้วยตนเอง (Self-Assessment):</b>{' '}
                  ให้ท่านประเมินระดับความรู้ความเข้าใจของตนเอง <b>(5 = มากที่สุด ถึง 1 = น้อยที่สุด)</b>{' '}
                  โดยแยกเป็นสถานะ <b>&quot;ก่อน&quot;</b> และ <b>&quot;หลัง&quot;</b> การฝึกอบรมในแต่ละหัวข้อ
                </div>

                {config.learningTopics.map((topic, index) => {
                  const sc = learningTopics[topic.id] || { pre: 0, post: 0 };
                  return (
                    <React.Fragment key={topic.id}>
                      {renderPrePostComparison(
                        index + 1,
                        topic.title,
                        sc.pre,
                        (v) => setTopicField(topic.id, 'pre', v),
                        sc.post,
                        (v) => setTopicField(topic.id, 'post', v),
                        topic.sessionTag
                      )}
                    </React.Fragment>
                  );
                })}

                {config.hasReadiness && (
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="border-b border-slate-200 pb-2">
                      <h3 className="font-prompt font-bold text-base sm:text-lg text-slate-900">
                        3.2 การประเมินความรู้ความเข้าใจในระดับความสามารถและความพร้อม (Capability
                        &amp; Readiness - Level 2 Learning)
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 font-prompt mt-1 leading-relaxed">
                        คำชี้แจง: 5 = ปฏิบัติแน่นอน / เหมาะสมอย่างยิ่ง, 4 = มีแนวโน้มสูงที่จะปฏิบัติ
                        / เหมาะสมมาก, 3 = อาจจะปฏิบัติ / เหมาะสมปานกลาง, 2 =
                        มีแนวโน้มที่จะไม่ปฏิบัติ / ไม่ค่อยเหมาะสม, 1 = ไม่ปฏิบัติแน่นอน /
                        ไม่เหมาะสมอย่างยิ่ง
                      </p>
                      <p className="text-xs sm:text-sm font-prompt font-semibold text-navy-900 mt-1">
                        โปรดประเมินแนวโน้มความเหมาะสมที่ท่านจะดำเนินการในฐานะหัวหน้างาน
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      {READINESS_QUESTIONS.map((rq) => (
                        <React.Fragment key={rq.key}>
                          {renderRatingRadio(
                            rq.label,
                            readinessScores[rq.key],
                            (val) =>
                              setReadinessScores((prev) => ({
                                ...prev,
                                [rq.key]: val,
                              })),
                            READINESS_SCALE_LABELS
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== STEP 4: Level 3 & 4 Baseline ==================== */}
          {currentStep === 4 && (
            <div className="bg-white p-5 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-xs font-prompt font-semibold text-lime-dark uppercase tracking-wider">
                  ขั้นตอนที่ 4 จาก 5
                </span>
                <h2 className="font-prompt font-bold text-lg sm:text-xl text-navy-900">
                  ส่วนที่ 4: ข้อมูลพื้นฐานสำหรับติดตาม Level 3 (Behavior) และ Level 4 (Results)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-prompt mt-1">
                  คำชี้แจง: ประเมินความคาดหวังในการนำความรู้ไปประยุกต์ใช้เพื่อเป็น Baseline ข้อมูล (5 = มากที่สุด, 1 = น้อยที่สุด)
                </p>
              </div>

              <div className="space-y-4">
                {renderRatingRadio(BASELINE_QUESTIONS[0].label, baseline1, setBaseline1)}
                {renderRatingRadio(BASELINE_QUESTIONS[1].label, baseline2, setBaseline2)}
                {renderRatingRadio(BASELINE_QUESTIONS[2].label, baseline3, setBaseline3)}
              </div>
            </div>
          )}

          {/* ==================== STEP 5: ข้อเสนอแนะ & ตรวจทานและยืนยัน ==================== */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-white p-5 sm:p-7 rounded-xl border-2 border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-prompt font-semibold text-lime-dark uppercase tracking-wider">
                      ขั้นตอนที่ 5 จาก 5
                    </span>
                    <h2 className="font-prompt font-bold text-lg sm:text-xl text-navy-900">
                      ส่วนที่ 5: ข้อเสนอแนะเพิ่มเติมสำหรับหัวข้อวิชาประจำวัน{' '}
                      <span className="text-red-500">*</span>
                    </h2>
                  </div>
                  <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      checked={noSuggestions}
                      onChange={(e) => {
                        setNoSuggestions(e.target.checked);
                        if (e.target.checked) setSuggestions('');
                        setStepError('');
                      }}
                      className="rounded text-lime-dark focus:ring-lime"
                    />
                    <span className="text-xs sm:text-sm font-prompt text-slate-700 font-medium">
                      ไม่มีข้อเสนอแนะเพิ่มเติมในส่วนนี้
                    </span>
                  </label>
                </div>

                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-slate-600 font-prompt">
                    โปรดระบุข้อคิดเห็น หรือข้อเสนอแนะเพื่อนำไปพัฒนาหลักสูตรและการจัดอบรมให้ดียิ่งขึ้น{' '}
                    <span className="text-red-500 font-bold">*</span>
                  </p>
                  <textarea
                    rows={3}
                    disabled={noSuggestions}
                    value={noSuggestions ? 'ไม่มีข้อเสนอแนะเพิ่มเติม' : suggestions}
                    onChange={(e) => {
                      setSuggestions(e.target.value);
                      setStepError('');
                    }}
                    placeholder="กรุณาระบุข้อคิดเห็น ข้อเสนอแนะ หรือประเด็นที่ท่านต้องการให้พัฒนาเพิ่มเติมในหัวข้อนี้..."
                    className="w-full text-sm font-prompt p-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime disabled:bg-slate-100 disabled:text-slate-400"
                  ></textarea>
                </div>
              </div>

              {/* Review Summary */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="font-prompt font-bold text-navy-900 text-base sm:text-lg">
                      สรุปการตรวจทานคำตอบก่อนยืนยันการส่ง
                    </h3>
                    <p className="text-xs text-slate-500 font-prompt">
                      ท่านสามารถกดปุ่มแก้ไขในแต่ละส่วน เพื่อย้อนกลับไปปรับเปลี่ยนคำตอบได้ตลอดเวลา
                    </p>
                  </div>
                  <span className="text-xs font-prompt font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full shrink-0 border border-emerald-300">
                    พร้อมตรวจสอบและส่ง
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm font-prompt text-slate-700">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <p className="font-prompt font-bold text-navy-900 text-sm">
                        ส่วนที่ 1 ข้อมูลผู้ตอบ:
                      </p>
                      <p>
                        พื้นที่:{' '}
                        <span className="font-semibold text-slate-900">
                          {workArea === 'central' ? 'ส่วนกลาง' : 'ส่วนภูมิภาค'} ({bureauName})
                        </span>
                      </p>
                      <p>
                        ตำแหน่ง:{' '}
                        <span className="font-semibold text-slate-900">
                          {position === 'senior_professional' ? 'ชำนาญการ' : 'ชำนาญการพิเศษ'}
                        </span>
                      </p>
                      <p className="text-xs text-slate-600">บทบาท: {roles.join(', ')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleJumpToStep(1)}
                      className="text-xs text-lime-dark hover:underline font-prompt font-bold pt-2 text-left cursor-pointer"
                    >
                      ✎ ย้อนกลับไปแก้ไขส่วนที่ 1
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <p className="font-prompt font-bold text-navy-900 text-sm">
                        ส่วนที่ 2 Level 1 Reaction:
                      </p>
                      <p>
                        เนื้อหา: ข้อ 1({contentScore1}), ข้อ 2({contentScore2}), ข้อ 3({contentScore3})
                      </p>
                      {config.lecturerSessions.map((session) => {
                        const sc = lecturerScores[session.id];
                        return (
                          <p key={session.id}>
                            วิทยากร ({session.sessionLabel}): ({sc?.q4 || 0}, {sc?.q5 || 0},{' '}
                            {sc?.q6 || 0})
                          </p>
                        );
                      })}
                      {config.hasOverallProjectEval && (
                        <p className="text-xs text-emerald-800 font-semibold">
                          ประเมินโครงการภาพรวม (ข้อ 8–15): ตอบครบ 8 ข้อ
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        ความเห็นวิทยากร:{' '}
                        {noLecturerComment ? 'ไม่มีความเห็นเพิ่มเติม' : `"${lecturerComment}"`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleJumpToStep(2)}
                      className="text-xs text-lime-dark hover:underline font-prompt font-bold pt-2 text-left cursor-pointer"
                    >
                      ✎ ย้อนกลับไปแก้ไขส่วนที่ 2
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <p className="font-prompt font-bold text-navy-900 text-sm">
                        ส่วนที่ 3 Level 2 Learning:
                      </p>
                      {config.learningTopics.map((topic, idx) => {
                        const sc = learningTopics[topic.id];
                        return (
                          <p key={topic.id}>
                            หัวข้อ {idx + 1}: ก่อน {sc?.pre || 0} ➔ หลัง {sc?.post || 0}
                          </p>
                        );
                      })}
                      {config.hasReadiness && (
                        <p>
                          Readiness (3.2): ({readinessScores.r1}, {readinessScores.r2},{' '}
                          {readinessScores.r3})
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleJumpToStep(3)}
                      className="text-xs text-lime-dark hover:underline font-prompt font-bold pt-2 text-left cursor-pointer"
                    >
                      ✎ ย้อนกลับไปแก้ไขส่วนที่ 3
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <p className="font-prompt font-bold text-navy-900 text-sm">
                        ส่วนที่ 4 &amp; 5 Baseline และข้อเสนอแนะ:
                      </p>
                      <p>
                        Baseline: ปรับใช้({baseline1}), มาตรฐาน({baseline2}), ใช้จริง({baseline3})
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        ข้อเสนอแนะ:{' '}
                        {noSuggestions ? 'ไม่มีข้อเสนอแนะเพิ่มเติม' : `"${suggestions}"`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleJumpToStep(4)}
                      className="text-xs text-lime-dark hover:underline font-prompt font-bold pt-2 text-left cursor-pointer"
                    >
                      ✎ ย้อนกลับไปแก้ไขส่วนที่ 4
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs sm:text-sm text-amber-900 font-prompt">
                  <span className="font-bold">ยืนยันข้อมูล:</span> เมื่อท่านกดปุ่ม{' '}
                  <b>&quot;ยืนยันและส่งแบบประเมิน&quot;</b> ด้านล่าง
                  ข้อมูลทั้งหมดจะถูกบันทึกเข้าสู่ฐานข้อมูลอย่างเป็นทางการ
                </div>
              </div>
            </div>
          )}

          {/* Navigation Row */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-full sm:w-auto px-6 py-3 text-sm font-prompt font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                ← ย้อนกลับไปแก้ไข
              </button>
            ) : (
              <button
                type="button"
                onClick={onBackToHome}
                className="w-full sm:w-auto px-6 py-3 text-sm font-prompt font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                ยกเลิกและกลับหน้าหลัก
              </button>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full sm:w-auto px-8 py-3 text-sm sm:text-base font-prompt font-bold text-navy-900 bg-lime hover:bg-lime-dark rounded-xl transition-colors shadow-md cursor-pointer"
              >
                ถัดไป: {stepsList[currentStep].title} →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-10 py-3.5 text-base sm:text-lg font-prompt font-bold text-navy-900 bg-gradient-to-r from-lime via-lime-light to-lime hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg hover:shadow-lime/40 cursor-pointer"
              >
                {isSubmitting ? 'กำลังบันทึกข้อมูล...' : '✓ ยืนยันและส่งแบบประเมิน'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
