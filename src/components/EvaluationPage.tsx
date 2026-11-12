import React, { useState } from 'react';
import {
  EvaluationDay,
  EvaluationSubmission,
  GeneralInfo,
  Day16Response,
  Day17Response,
} from '../types';

interface EvaluationPageProps {
  day: EvaluationDay;
  onBackToHome: () => void;
  onSubmitSuccess: (submission: EvaluationSubmission) => void;
  onViewDashboard?: () => void;
  hasSubmitted?: boolean;
}

export const EvaluationPage: React.FC<EvaluationPageProps> = ({
  day,
  onBackToHome,
  onSubmitSuccess,
  onViewDashboard,
  hasSubmitted = false,
}) => {
  const isDay16 = day.id === 'day-1';
  const isDay17 = day.id === 'day-2';

  // Step Management: 1 to 5 (or submitted receipt)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submittedReceipt, setSubmittedReceipt] = useState<EvaluationSubmission | null>(null);

  // Section 1: General Info (เริ่มต้นว่างไว้ ไม่ใส่ค่าจำลอง เพื่อรอรับคำตอบจริง)
  const [workArea, setWorkArea] = useState<'central' | 'regional' | ''>('');
  const [bureauName, setBureauName] = useState<string>('');
  const [position, setPosition] = useState<'senior_professional' | 'special_professional' | ''>('');
  const [roles, setRoles] = useState<string[]>([]);

  // Shared Level 1: Content (0 = not chosen yet)
  const [contentScore1, setContentScore1] = useState<number>(0);
  const [contentScore2, setContentScore2] = useState<number>(0);
  const [contentScore3, setContentScore3] = useState<number>(0);

  // Day 16 Lecturer Morning
  const [lecturerMorning1, setLecturerMorning1] = useState<number>(0);
  const [lecturerMorning2, setLecturerMorning2] = useState<number>(0);
  const [lecturerMorning3, setLecturerMorning3] = useState<number>(0);

  // Day 16 Lecturer Afternoon
  const [lecturerAfternoon1, setLecturerAfternoon1] = useState<number>(0);
  const [lecturerAfternoon2, setLecturerAfternoon2] = useState<number>(0);
  const [lecturerAfternoon3, setLecturerAfternoon3] = useState<number>(0);

  // Day 17 Lecturer Full Day
  const [lecturerFullDay1, setLecturerFullDay1] = useState<number>(0);
  const [lecturerFullDay2, setLecturerFullDay2] = useState<number>(0);
  const [lecturerFullDay3, setLecturerFullDay3] = useState<number>(0);

  // Lecturer Comment
  const [lecturerComment, setLecturerComment] = useState<string>('');
  const [noLecturerComment, setNoLecturerComment] = useState<boolean>(false);

  // Day 16 Level 2 Learning Pre/Post
  const [day16Topic1Pre, setDay16Topic1Pre] = useState<number>(0);
  const [day16Topic1Post, setDay16Topic1Post] = useState<number>(0);
  const [day16Topic2Pre, setDay16Topic2Pre] = useState<number>(0);
  const [day16Topic2Post, setDay16Topic2Post] = useState<number>(0);

  // Day 17 Level 2 Learning Pre/Post
  const [day17Topic1Pre, setDay17Topic1Pre] = useState<number>(0);
  const [day17Topic1Post, setDay17Topic1Post] = useState<number>(0);

  // Day 17 Capability & Readiness
  const [readiness1, setReadiness1] = useState<number>(0);
  const [readiness2, setReadiness2] = useState<number>(0);
  const [readiness3, setReadiness3] = useState<number>(0);

  // Shared Level 3 & 4 Baseline
  const [baseline1, setBaseline1] = useState<number>(0);
  const [baseline2, setBaseline2] = useState<number>(0);
  const [baseline3, setBaseline3] = useState<number>(0);

  // Shared Section 5: Suggestions (with mandatory condition)
  const [suggestions, setSuggestions] = useState<string>('');
  const [noSuggestions, setNoSuggestions] = useState<boolean>(false);

  // Step Error State
  const [stepError, setStepError] = useState<string>('');

  const handleRoleToggle = (role: string) => {
    if (roles.includes(role)) {
      setRoles(roles.filter((r) => r !== role));
    } else {
      setRoles([...roles, role]);
    }
    setStepError('');
  };

  // Step 1 Validation
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

  // Step 2 Validation (Level 1 Reaction)
  const validateStep2 = (): boolean => {
    if (!contentScore1 || !contentScore2 || !contentScore3) {
      setStepError('กรุณาให้คะแนนด้านเนื้อหาวิชาประจำวันให้ครบทุกข้อ (3 ข้อ)');
      return false;
    }

    if (isDay16) {
      if (!lecturerMorning1 || !lecturerMorning2 || !lecturerMorning3) {
        setStepError('กรุณาให้คะแนนด้านวิทยากรประจำวัน (ภาคเช้า) ให้ครบทุกข้อ (3 ข้อ)');
        return false;
      }
      if (!lecturerAfternoon1 || !lecturerAfternoon2 || !lecturerAfternoon3) {
        setStepError('กรุณาให้คะแนนด้านวิทยากรประจำวัน (ภาคบ่าย) ให้ครบทุกข้อ (3 ข้อ)');
        return false;
      }
    } else if (isDay17) {
      if (!lecturerFullDay1 || !lecturerFullDay2 || !lecturerFullDay3) {
        setStepError('กรุณาให้คะแนนด้านวิทยากรประจำวัน (ทั้งวัน) ให้ครบทุกข้อ (3 ข้อ)');
        return false;
      }
    }

    // Question 7 validation (Lecturer comment must either have text or confirmed 'ไม่มีความเห็นเพิ่มเติม')
    if (!noLecturerComment && !lecturerComment.trim()) {
      setStepError('กรุณาระบุความเห็นต่อวิทยากร หรือติ๊กเลือก "ไม่มีความเห็นเพิ่มเติมต่อวิทยากร"');
      return false;
    }

    setStepError('');
    return true;
  };

  // Step 3 Validation (Level 2 Learning)
  const validateStep3 = (): boolean => {
    if (isDay16) {
      if (!day16Topic1Pre) {
        setStepError('กรุณาประเมินระดับความรู้ความเข้าใจ "ก่อน" การฝึกอบรม ในหัวข้อที่ 1');
        return false;
      }
      if (!day16Topic1Post) {
        setStepError('กรุณาประเมินระดับความรู้ความเข้าใจ "หลัง" การฝึกอบรม ในหัวข้อที่ 1');
        return false;
      }
      if (!day16Topic2Pre) {
        setStepError('กรุณาประเมินระดับความรู้ความเข้าใจ "ก่อน" การฝึกอบรม ในหัวข้อที่ 2');
        return false;
      }
      if (!day16Topic2Post) {
        setStepError('กรุณาประเมินระดับความรู้ความเข้าใจ "หลัง" การฝึกอบรม ในหัวข้อที่ 2');
        return false;
      }
    } else if (isDay17) {
      if (!day17Topic1Pre) {
        setStepError('กรุณาประเมินระดับความรู้ความเข้าใจ "ก่อน" การฝึกอบรม ในหัวข้อพยานหลักฐาน');
        return false;
      }
      if (!day17Topic1Post) {
        setStepError('กรุณาประเมินระดับความรู้ความเข้าใจ "หลัง" การฝึกอบรม ในหัวข้อพยานหลักฐาน');
        return false;
      }
      if (!readiness1 || !readiness2 || !readiness3) {
        setStepError('กรุณาประเมินระดับความสามารถและความพร้อม (Capability & Readiness) ให้ครบทั้ง 3 ข้อ');
        return false;
      }
    }

    setStepError('');
    return true;
  };

  // Step 4 Validation (Level 3 & 4 Baseline)
  const validateStep4 = (): boolean => {
    if (!baseline1 || !baseline2 || !baseline3) {
      setStepError('กรุณาประเมินความคาดหวังในการนำไปใช้ (Level 3 & 4 Baseline) ให้ครบทุกข้อ (3 ข้อ)');
      return false;
    }
    setStepError('');
    return true;
  };

  // Step 5 Validation (Suggestions / Open-ended feedback condition)
  const validateStep5 = (): boolean => {
    if (!noSuggestions && !suggestions.trim()) {
      setStepError('กรุณาระบุข้อเสนอแนะเพิ่มเติม หรือติ๊กเลือก "ไม่มีข้อเสนอแนะเพิ่มเติมในหัวข้อนี้"');
      return false;
    }
    setStepError('');
    return true;
  };

  // Advance step
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

  // Return to previous step
  const handlePrevStep = () => {
    setStepError('');
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Jump directly to step
  const handleJumpToStep = (targetStep: number) => {
    if (targetStep < currentStep) {
      setStepError('');
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetStep === currentStep + 1) {
      handleNextStep();
    }
  };

  // Final Submit Action on Step 5
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep1() || !validateStep2() || !validateStep3() || !validateStep4() || !validateStep5()) {
      return;
    }

    if (!workArea || !position) {
      return;
    }

    const generalInfo: GeneralInfo = {
      workArea,
      bureauName: bureauName.trim(),
      position,
      roles,
    };

    let overallSatisfaction = 5;
    let day16Data: Day16Response | undefined = undefined;
    let day17Data: Day17Response | undefined = undefined;

    const finalSuggestions = noSuggestions ? 'ไม่มีข้อเสนอแนะเพิ่มเติม' : suggestions.trim();
    const finalLecturerComment = noLecturerComment ? 'ไม่มีความเห็นเพิ่มเติม' : lecturerComment.trim();

    if (isDay16) {
      day16Data = {
        contentScore1,
        contentScore2,
        contentScore3,
        lecturerMorning1,
        lecturerMorning2,
        lecturerMorning3,
        lecturerAfternoon1,
        lecturerAfternoon2,
        lecturerAfternoon3,
        lecturerComment: finalLecturerComment,
        topic1Pre: day16Topic1Pre,
        topic1Post: day16Topic1Post,
        topic2Pre: day16Topic2Pre,
        topic2Post: day16Topic2Post,
        baseline1,
        baseline2,
        baseline3,
        suggestions: finalSuggestions,
      };

      const reactionScores = [
        contentScore1,
        contentScore2,
        contentScore3,
        lecturerMorning1,
        lecturerMorning2,
        lecturerMorning3,
        lecturerAfternoon1,
        lecturerAfternoon2,
        lecturerAfternoon3,
      ];
      overallSatisfaction = Number(
        (reactionScores.reduce((a, b) => a + b, 0) / reactionScores.length).toFixed(2)
      );
    } else if (isDay17) {
      day17Data = {
        contentScore1,
        contentScore2,
        contentScore3,
        lecturerFullDay1,
        lecturerFullDay2,
        lecturerFullDay3,
        lecturerComment: finalLecturerComment,
        topic1Pre: day17Topic1Pre,
        topic1Post: day17Topic1Post,
        readiness1,
        readiness2,
        readiness3,
        baseline1,
        baseline2,
        baseline3,
        suggestions: finalSuggestions,
      };

      const reactionScores = [
        contentScore1,
        contentScore2,
        contentScore3,
        lecturerFullDay1,
        lecturerFullDay2,
        lecturerFullDay3,
      ];
      overallSatisfaction = Number(
        (reactionScores.reduce((a, b) => a + b, 0) / reactionScores.length).toFixed(2)
      );
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
      id: `sub-${Date.now()}`,
      dayId: day.id,
      dayTitle: day.title,
      timestamp: timestampStr,
      referenceCode: refCode,
      generalInfo,
      participantName,
      suggestions: finalSuggestions,
      day16Data,
      day17Data,
      overallSatisfaction,
    };

    // Commit to parent state & server storage
    onSubmitSuccess(newSubmission);

    // Show full-page success screen
    setSubmittedReceipt(newSubmission);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compact, sleek rating radio buttons with larger Thai Prompt text
  const renderRatingRadio = (
    label: string,
    currentVal: number,
    setter: (val: number) => void,
    isRequired: boolean = true
  ) => {
    const isUnanswered = isRequired && currentVal === 0;

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
              {currentVal} คะแนน
            </span>
          ) : (
            <span className="text-xs sm:text-sm font-prompt text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full shrink-0 border border-amber-200 self-start">
              ยังไม่ได้เลือก
            </span>
          )}
        </div>

        {/* Compact, clean 5-button score picker */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 max-w-lg">
          {[5, 4, 3, 2, 1].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                setter(val);
                setStepError('');
              }}
              className={`h-11 sm:h-12 flex flex-col items-center justify-center rounded-lg text-xs font-prompt cursor-pointer border transition-all active:scale-95 ${
                currentVal === val
                  ? 'bg-lime text-navy-900 border-lime font-bold shadow-xs ring-2 ring-lime/40 scale-102'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span className="text-base sm:text-lg font-bold leading-none">{val}</span>
              <span className="text-[10px] sm:text-xs block text-slate-600 font-normal leading-tight mt-0.5">
                {val === 5
                  ? 'มากที่สุด'
                  : val === 4
                  ? 'มาก'
                  : val === 3
                  ? 'ปานกลาง'
                  : val === 2
                  ? 'น้อย'
                  : 'น้อยที่สุด'}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // High-contrast, crystal-clear PRE vs POST comparison block
  const renderPrePostComparison = (
    topicNum: number,
    topicTitle: string,
    preVal: number,
    setPreVal: (val: number) => void,
    postVal: number,
    setPostVal: (val: number) => void
  ) => {
    const isPreAnswered = preVal > 0;
    const isPostAnswered = postVal > 0;
    const diff = postVal - preVal;

    return (
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
        {/* Topic Header with Large, Clear Font */}
        <div className="border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-navy-900 text-lime px-2.5 py-0.5 rounded-md text-xs font-prompt font-bold">
              หัวข้อที่ {topicNum}
            </span>
            <span className="text-xs font-prompt text-slate-500">
              เปรียบเทียบระดับความรู้ ก่อน-หลัง การอบรม
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-prompt font-bold text-navy-900 leading-snug">
            {topicTitle}
          </h4>
        </div>

        {/* 2 DISTINCT SIDE-BY-SIDE OR STACKED CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {/* 1. BEFORE TRAINING (ก่อน) */}
          <div
            className={`rounded-xl p-4 sm:p-5 border-2 transition-all ${
              isPreAnswered
                ? 'border-amber-400 bg-amber-50/40 shadow-xs'
                : 'border-amber-200 bg-amber-50/20'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs sm:text-sm font-prompt font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <span>🔴</span>
                <span>1. ระดับความรู้ความเข้าใจ "ก่อน" การฝึกอบรม</span>
              </span>
              {isPreAnswered && (
                <span className="text-xs font-prompt font-bold text-amber-900">
                  {preVal} / 5
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-prompt text-slate-600 mb-3">
              โปรดประเมินความรู้เดิมของท่าน <b>ก่อนเริ่มเรียน</b> ในหัวข้อนี้
            </p>

            {/* 5 Compact buttons for PRE */}
            <div className="grid grid-cols-5 gap-1.5">
              {[5, 4, 3, 2, 1].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setPreVal(v);
                    setStepError('');
                  }}
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

          {/* 2. AFTER TRAINING (หลัง) */}
          <div
            className={`rounded-xl p-4 sm:p-5 border-2 transition-all ${
              isPostAnswered
                ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                : 'border-emerald-200 bg-emerald-50/20'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs sm:text-sm font-prompt font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                <span>🟢</span>
                <span>2. ระดับความรู้ความเข้าใจ "หลัง" การฝึกอบรม</span>
              </span>
              {isPostAnswered && (
                <span className="text-xs font-prompt font-bold text-emerald-900">
                  {postVal} / 5
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-prompt text-slate-600 mb-3">
              โปรดประเมินความรู้ที่ได้รับเพิ่มขึ้น <b>หลังผ่านการอบรม</b> ในวันนี้
            </p>

            {/* 5 Compact buttons for POST */}
            <div className="grid grid-cols-5 gap-1.5">
              {[5, 4, 3, 2, 1].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setPostVal(v);
                    setStepError('');
                  }}
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

        {/* Real-time Comparison Result Tag */}
        {isPreAnswered && isPostAnswered && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-prompt">
            <span className="text-slate-600">
              ผลการเปรียบเทียบ: ก่อนได้ <b className="text-amber-800">{preVal}</b> คะแนน ➔ หลังได้ <b className="text-emerald-800">{postVal}</b> คะแนน
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

  // ==================== FULL-PAGE SUCCESS RECEIPT VIEW ====================
  if (submittedReceipt) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-prompt">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          {/* Success Banner */}
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

          {/* Receipt Details */}
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
                <span className="text-slate-700 text-xs sm:text-sm">{submittedReceipt.participantName}</span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-slate-500 text-xs font-prompt">เวลาที่บันทึกส่ง:</span>
                <span className="text-slate-600 text-xs tabular-nums">{submittedReceipt.timestamp}</span>
              </div>
            </div>

            <div className="text-center text-xs sm:text-sm text-slate-500 font-prompt leading-relaxed">
              สถาบันพัฒนาการตรวจเงินแผ่นดิน · สำนักงานการตรวจเงินแผ่นดิน (สตง.)
              <br />
              ขอขอบคุณสำหรับข้อคิดเห็นอันเป็นประโยชน์ต่อการพัฒนาหลักสูตรและการเรียนรู้
            </div>

            {/* Action Buttons */}
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

  // ==================== FULL-PAGE QUESTIONNAIRE VIEW ====================
  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 font-prompt">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header Bar */}
        <div className="bg-navy-900 rounded-2xl p-5 sm:p-7 text-white border-b-4 border-lime shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-prompt font-semibold text-lime hover:text-white px-3.5 py-1.5 rounded-lg bg-navy-800/80 border border-lime/30 hover:border-lime transition-colors self-start cursor-pointer"
            >
              ← กลับสู่หน้าหลัก
            </button>

            <span className="text-xs sm:text-sm text-slate-300 font-prompt self-start sm:self-auto">
              สถาบันพัฒนาการตรวจเงินแผ่นดิน · สำนักงานการตรวจเงินแผ่นดิน
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-lime/20 text-lime px-2.5 py-0.5 rounded text-xs font-prompt font-semibold border border-lime/30">
                {day.dayLabel} · {day.dateStr}
              </span>
              {hasSubmitted && (
                <span className="text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded font-prompt">
                  ประเมินแล้ว (สามารถแก้ไขและส่งใหม่ได้)
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-prompt font-bold text-white leading-snug">
              แบบสอบถามประเมินผลโครงการฝึกอบรม
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-prompt mt-1">
              หลักสูตร "การตรวจสอบการปฏิบัติตามกฎหมาย ระดับกลาง" ประจำวันที่ {day.dateStr}
            </p>
          </div>
        </div>

        {/* Responsive Step Progress Navigation */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs">
          {/* Mobile view */}
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

          {/* Desktop & Tablet view */}
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

        {/* Main Step Form Content */}
        <form onSubmit={handleFinalSubmit} className="space-y-6">
          {/* ==================== STEP 1: ข้อมูลทั่วไป ==================== */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* คำชี้แจง Banner */}
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

              {/* Section 1 Card */}
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
                        onChange={() => setPosition('senior_professional')}
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
                        onChange={() => setPosition('special_professional')}
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
                    3. บทบาทหน้าที่หลักในการปฏิบัติงานปัจจุบัน (เลือกได้มากกว่า 1 ข้อ) <span className="text-red-500 font-bold">*</span>
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
              <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="text-xs font-prompt font-semibold text-lime-dark uppercase tracking-wider">
                    ขั้นตอนที่ 2 จาก 5
                  </span>
                  <h2 className="font-prompt font-bold text-lg sm:text-xl text-navy-900">
                    ส่วนที่ 2: Level 1 Reaction (ความพึงพอใจต่อเนื้อหาและวิทยากรประจำวัน)
                  </h2>
                </div>
                <span className="text-xs sm:text-sm font-prompt text-slate-600 bg-slate-100 px-3 py-1 rounded-md">
                  เกณฑ์: 5 = มากที่สุด ถึง 1 = น้อยที่สุด
                </span>
              </div>

              {/* ด้านเนื้อหาวิชาประจำวัน */}
              <div className="space-y-4">
                <h3 className="font-prompt font-bold text-base sm:text-lg text-navy-900 pb-1 border-b">
                  ด้านเนื้อหาวิชาประจำวัน (บังคับตอบครบ 3 ข้อ)
                </h3>
                {renderRatingRadio(
                  '1. เนื้อหามีความสอดคล้องกับบทบาทหน้าที่ของท่านในฐานะผู้ปฏิบัติงาน/หัวหน้างาน/ผู้สอบทาน',
                  contentScore1,
                  setContentScore1
                )}
                {renderRatingRadio(
                  '2. เนื้อหามีความเหมาะสมกับยุคสมัย สอดคล้องกับกฎหมาย ระเบียบ และหลักเกณฑ์มาตรฐานของสำนักงานการตรวจเงินแผ่นดิน',
                  contentScore2,
                  setContentScore2
                )}
                {renderRatingRadio(
                  '3. สามารถนำเนื้อหาไปประยุกต์ใช้ในการปฏิบัติงาน กำกับ แนะนำ และควบคุมคุณภาพงานได้จริง',
                  contentScore3,
                  setContentScore3
                )}
              </div>

              {/* ด้านวิทยากรประจำวัน */}
              {isDay16 ? (
                <>
                  {/* เช้า */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="font-prompt font-bold text-base sm:text-lg text-navy-900 pb-1 border-b">
                      ด้านวิทยากรประจำวัน วันที่ 16 พฤศจิกายน 2569 (ภาคเช้า)
                    </h3>
                    {renderRatingRadio(
                      '4. วิทยากรมีความรู้ ความเชี่ยวชาญตามหัวข้อวิชาที่ถ่ายทอดความรู้',
                      lecturerMorning1,
                      setLecturerMorning1
                    )}
                    {renderRatingRadio(
                      '5. วิทยากรถ่ายทอดเนื้อหา เทคนิค และกรณีศึกษาได้อย่างชัดเจน เข้าใจง่าย',
                      lecturerMorning2,
                      setLecturerMorning2
                    )}
                    {renderRatingRadio(
                      '6. วิทยากรกระตุ้นให้เกิดการแลกเปลี่ยนเรียนรู้และตอบข้อซักถามได้ตรงประเด็น',
                      lecturerMorning3,
                      setLecturerMorning3
                    )}
                  </div>

                  {/* บ่าย */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="font-prompt font-bold text-base sm:text-lg text-navy-900 pb-1 border-b">
                      ด้านวิทยากรประจำวัน วันที่ 16 พฤศจิกายน 2569 (ภาคบ่าย)
                    </h3>
                    {renderRatingRadio(
                      '4. วิทยากรมีความรู้ ความเชี่ยวชาญตามหัวข้อวิชาที่ถ่ายทอดความรู้',
                      lecturerAfternoon1,
                      setLecturerAfternoon1
                    )}
                    {renderRatingRadio(
                      '5. วิทยากรถ่ายทอดเนื้อหา เทคนิค และกรณีศึกษาได้อย่างชัดเจน เข้าใจง่าย',
                      lecturerAfternoon2,
                      setLecturerAfternoon2
                    )}
                    {renderRatingRadio(
                      '6. วิทยากรกระตุ้นให้เกิดการแลกเปลี่ยนเรียนรู้และตอบข้อซักถามได้ตรงประเด็น',
                      lecturerAfternoon3,
                      setLecturerAfternoon3
                    )}
                  </div>
                </>
              ) : (
                /* Day 17 Full Day Lecturer */
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-prompt font-bold text-base sm:text-lg text-navy-900 pb-1 border-b">
                    ด้านวิทยากรประจำวัน วันที่ 17 พฤศจิกายน 2569 (ทั้งวัน)
                  </h3>
                  {renderRatingRadio(
                    '4. วิทยากรมีความรู้ ความเชี่ยวชาญตามหัวข้อวิชาที่ถ่ายทอดความรู้',
                    lecturerFullDay1,
                    setLecturerFullDay1
                  )}
                  {renderRatingRadio(
                    '5. วิทยากรถ่ายทอดเนื้อหา เทคนิค และกรณีศึกษาได้อย่างชัดเจน เข้าใจง่าย',
                    lecturerFullDay2,
                    setLecturerFullDay2
                  )}
                  {renderRatingRadio(
                    '6. วิทยากรกระตุ้นให้เกิดการแลกเปลี่ยนเรียนรู้และตอบข้อซักถามได้ตรงประเด็น',
                    lecturerFullDay3,
                    setLecturerFullDay3
                  )}
                </div>
              )}

              {/* ข้อ 7 ความเห็นต่อวิทยากร (พร้อมเงื่อนไขบังคับ) */}
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

              {isDay16 ? (
                /* DAY 16 NEW PDF STRUCTURE: 2 Topics with Clear Pre/Post Comparison */
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs sm:text-sm font-prompt text-blue-900 leading-relaxed">
                    💡 <b>คำชี้แจง:</b> ให้ท่านประเมินระดับความรู้ความเข้าใจของตนเอง <b>(1 = น้อยที่สุด ถึง 5 = มากที่สุด)</b> โดยแยกเป็นสถานะ <b>"ก่อน"</b> การฝึกอบรม และ <b>"หลัง"</b> การฝึกอบรมในแต่ละหัวข้อ
                  </div>

                  {/* Topic 1 Pre/Post */}
                  {renderPrePostComparison(
                    1,
                    'ทบทวนสาระสำคัญความรู้เกี่ยวกับกฎหมายและแนวปฏิบัติในการตรวจสอบ เพื่อกำกับ แนะนำ ตรวจสอบการปฏิบัติงานในฐานะหัวหน้างาน',
                    day16Topic1Pre,
                    setDay16Topic1Pre,
                    day16Topic1Post,
                    setDay16Topic1Post
                  )}

                  {/* Topic 2 Pre/Post */}
                  {renderPrePostComparison(
                    2,
                    'ทบทวนสาระสำคัญความรู้เกี่ยวกับการตรวจสอบการปฏิบัติตามกฎหมายเพื่อกำกับ แนะนำ ตรวจสอบการปฏิบัติงานในฐานะหัวหน้างาน',
                    day16Topic2Pre,
                    setDay16Topic2Pre,
                    day16Topic2Post,
                    setDay16Topic2Post
                  )}
                </div>
              ) : (
                /* DAY 17 STRUCTURE: Topic 1 Pre/Post + 3.2 Capability & Readiness */
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs sm:text-sm font-prompt text-blue-900 leading-relaxed">
                    💡 <b>คำชี้แจง:</b> ให้ท่านประเมินระดับความรู้ความเข้าใจของตนเอง <b>(1 = น้อยที่สุด ถึง 5 = มากที่สุด)</b> แยกเป็นสถานะ <b>"ก่อน"</b> และ <b>"หลัง"</b> การฝึกอบรม
                  </div>

                  {/* Day 17 Topic 1 Pre/Post */}
                  {renderPrePostComparison(
                    1,
                    'เทคนิคและทักษะการรวบรวมพยานหลักฐาน (กรณีมีความเสียหาย/ทุจริต/จงใจ) เพื่อกำกับ แนะนำ ตรวจสอบการปฏิบัติงาน ในฐานะหัวหน้างาน',
                    day17Topic1Pre,
                    setDay17Topic1Pre,
                    day17Topic1Post,
                    setDay17Topic1Post
                  )}

                  {/* Day 17 3.2 Capability & Readiness */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="border-b border-slate-200 pb-2">
                      <h3 className="font-prompt font-bold text-base sm:text-lg text-slate-900">
                        3.2 การประเมินความรู้ความเข้าใจในระดับความสามารถและความพร้อม (Capability & Readiness)
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 font-prompt mt-0.5">
                        คำชี้แจง: โปรดประเมินแนวโน้มความเหมาะสมที่ท่านจะดำเนินการในฐานะหัวหน้างาน (5 = ปฏิบัติแน่นอน / เหมาะสมอย่างยิ่ง, 1 = ไม่ปฏิบัติแน่นอน / ไม่เหมาะสมอย่างยิ่ง)
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      {renderRatingRadio(
                        '1. สามารถนำหลักเกณฑ์หรือแนวปฏิบัติที่เรียนรู้ในวันนี้ไปกำหนดเป็นกรอบในการกำกับความถูกต้องและครบถ้วนของงานตรวจสอบที่รับผิดชอบได้',
                        readiness1,
                        setReadiness1
                      )}
                      {renderRatingRadio(
                        '2. สามารถให้คำปรึกษา แนะนำ หรือสอนงานผู้ใต้บังคับบัญชา เพื่อป้องกันข้อผิดพลาดเชิงระบบมาตรฐานหรือเชิงกฎหมายที่อาจเกิดขึ้นได้',
                        readiness2,
                        setReadiness2
                      )}
                      {renderRatingRadio(
                        '3. สามารถตัดสินใจทางวิชาชีพได้อย่างรอบคอบและมีหลักการมากขึ้น เมื่อพบประเด็นปัญหาหรือข้อคิดเห็นที่แตกต่างกันในเรื่องที่เกี่ยวข้อง',
                        readiness3,
                        setReadiness3
                      )}
                    </div>
                  </div>
                </div>
              )}
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
                {renderRatingRadio(
                  '1. ท่านคาดว่าจะสามารถนำความรู้ เทคนิควิธีการจากหัวข้อนี้ ไปปรับใช้/สอนงานหรือให้คำปรึกษาแก่ผู้ปฏิบัติงานในทีมได้อย่างมั่นใจ',
                  baseline1,
                  setBaseline1
                )}
                {renderRatingRadio(
                  '2. ท่านคาดว่าความรู้ในวันนี้จะช่วยยกระดับคุณภาพการตรวจสอบการปฏิบัติตามกฎหมายของทีมให้เป็นมาตรฐานเดียวกัน',
                  baseline2,
                  setBaseline2
                )}
                {renderRatingRadio(
                  '3. ท่านคาดว่าจะนำองค์ความรู้นี้ไปปรับใช้จริงในการปฏิบัติงานต่อไป',
                  baseline3,
                  setBaseline3
                )}
              </div>
            </div>
          )}

          {/* ==================== STEP 5: ข้อเสนอแนะ & ตรวจทานและยืนยัน ==================== */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* ส่วนที่ 5 ข้อเสนอแนะเพิ่มเติม (พร้อมเงื่อนไขบังคับ) */}
              <div className="bg-white p-5 sm:p-7 rounded-xl border-2 border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-prompt font-semibold text-lime-dark uppercase tracking-wider">
                      ขั้นตอนที่ 5 จาก 5
                    </span>
                    <h2 className="font-prompt font-bold text-lg sm:text-xl text-navy-900">
                      ส่วนที่ 5: ข้อเสนอแนะเพิ่มเติมสำหรับหัวข้อวิชาประจำวัน <span className="text-red-500">*</span>
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
                    โปรดระบุข้อคิดเห็น หรือข้อเสนอแนะเพื่อนำไปพัฒนาหลักสูตรและการจัดอบรมให้ดียิ่งขึ้น <span className="text-red-500 font-bold">*</span>
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

              {/* Review and Confirmation Summary Box */}
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
                    ตอบครบถ้วนสมบูรณ์
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm font-prompt text-slate-700">
                  {/* Review 1 */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <p className="font-prompt font-bold text-navy-900 text-sm">ส่วนที่ 1 ข้อมูลผู้ตอบ:</p>
                      <p>พื้นที่: <span className="font-semibold text-slate-900">{workArea === 'central' ? 'ส่วนกลาง' : 'ส่วนภูมิภาค'} ({bureauName})</span></p>
                      <p>ตำแหน่ง: <span className="font-semibold text-slate-900">{position === 'senior_professional' ? 'ชำนาญการ' : 'ชำนาญการพิเศษ'}</span></p>
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

                  {/* Review 2 */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <p className="font-prompt font-bold text-navy-900 text-sm">ส่วนที่ 2 Level 1 Reaction:</p>
                      <p>เนื้อหา: ข้อ 1({contentScore1}), ข้อ 2({contentScore2}), ข้อ 3({contentScore3})</p>
                      {isDay16 ? (
                        <p>วิทยากร: เช้า ({lecturerMorning1},{lecturerMorning2},{lecturerMorning3}) | บ่าย ({lecturerAfternoon1},{lecturerAfternoon2},{lecturerAfternoon3})</p>
                      ) : (
                        <p>วิทยากรทั้งวัน: ({lecturerFullDay1},{lecturerFullDay2},{lecturerFullDay3})</p>
                      )}
                      <p className="text-xs text-slate-500">
                        ความเห็นวิทยากร: {noLecturerComment ? 'ไม่มีความเห็นเพิ่มเติม' : `"${lecturerComment}"`}
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

                  {/* Review 3 */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <p className="font-prompt font-bold text-navy-900 text-sm">ส่วนที่ 3 Level 2 Learning:</p>
                      {isDay16 ? (
                        <>
                          <p>หัวข้อ 1: ก่อน {day16Topic1Pre} ➔ หลัง {day16Topic1Post}</p>
                          <p>หัวข้อ 2: ก่อน {day16Topic2Pre} ➔ หลัง {day16Topic2Post}</p>
                        </>
                      ) : (
                        <>
                          <p>หัวข้อพยานหลักฐาน: ก่อน {day17Topic1Pre} ➔ หลัง {day17Topic1Post}</p>
                          <p>Readiness: ({readiness1}, {readiness2}, {readiness3})</p>
                        </>
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

                  {/* Review 4 & 5 */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <p className="font-prompt font-bold text-navy-900 text-sm">ส่วนที่ 4 & 5 Baseline และข้อเสนอแนะ:</p>
                      <p>Baseline: ปรับใช้({baseline1}), มาตรฐาน({baseline2}), ใช้จริง({baseline3})</p>
                      <p className="text-xs text-slate-600 truncate">
                        ข้อเสนอแนะ: {noSuggestions ? 'ไม่มีข้อเสนอแนะเพิ่มเติม' : `"${suggestions}"`}
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
                  <span className="font-bold">ยืนยันข้อมูล:</span> เมื่อท่านกดปุ่ม <b>"ยืนยันและส่งแบบประเมิน"</b> ด้านล่าง ข้อมูลทั้งหมดจะถูกบันทึกเข้าสู่ฐานข้อมูลอย่างเป็นทางการ
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons Row */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Back Button */}
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

            {/* Next / Submit Button */}
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
                className="w-full sm:w-auto px-10 py-3.5 text-base sm:text-lg font-prompt font-bold text-navy-900 bg-gradient-to-r from-lime via-lime-light to-lime hover:brightness-105 rounded-xl transition-all shadow-lg hover:shadow-lime/40 cursor-pointer"
              >
                ✓ ยืนยันและส่งแบบประเมิน
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
