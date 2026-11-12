import React, { useState } from 'react';
import {
  EvaluationDay,
  EvaluationSubmission,
  GeneralInfo,
  Day16Response,
  Day17Response,
} from '../types';

interface EvaluationModalProps {
  day: EvaluationDay;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submission: Omit<EvaluationSubmission, 'id' | 'timestamp' | 'referenceCode'>) => void;
  hasSubmitted?: boolean;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  day,
  isOpen,
  onClose,
  onSubmit,
  hasSubmitted = false,
}) => {
  const isDay16 = day.id === 'day-1';
  const isDay17 = day.id === 'day-2';

  // Step Management: 1 to 5
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Section 1: General Info
  const [workArea, setWorkArea] = useState<'central' | 'regional'>('central');
  const [bureauName, setBureauName] = useState('');
  const [position, setPosition] = useState<'senior_professional' | 'special_professional'>(
    'senior_professional'
  );
  const [roles, setRoles] = useState<string[]>(['ปฏิบัติงานตรวจสอบ']);

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

  // Day 16 Level 2 Learning Pre/Post
  const [day16Topic1Pre, setDay16Topic1Pre] = useState<number>(0);
  const [day16Topic1Post, setDay16Topic1Post] = useState<number>(0);
  const [day16Topic2Pre, setDay16Topic2Pre] = useState<number>(0);
  const [day16Topic2Post, setDay16Topic2Post] = useState<number>(0);

  // Day 16 Scenario-based
  const [scenario1, setScenario1] = useState<number>(0);
  const [scenario2, setScenario2] = useState<number>(0);
  const [scenario3, setScenario3] = useState<number>(0);

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

  // Shared Section 5: Suggestions
  const [suggestions, setSuggestions] = useState<string>('');

  // Step Error State
  const [stepError, setStepError] = useState<string>('');

  if (!isOpen) return null;

  const handleRoleToggle = (role: string) => {
    if (roles.includes(role)) {
      if (roles.length > 1) {
        setRoles(roles.filter((r) => r !== role));
      }
    } else {
      setRoles([...roles, role]);
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    if (!bureauName.trim()) {
      setStepError('กรุณาระบุชื่อย่อสำนัก');
      return false;
    }
    if (roles.length === 0) {
      setStepError('กรุณาเลือกบทบาทหน้าที่หลักอย่างน้อย 1 ข้อ');
      return false;
    }
    setStepError('');
    return true;
  };

  // Step 2 Validation (Level 1 Reaction)
  const validateStep2 = (): boolean => {
    if (!contentScore1 || !contentScore2 || !contentScore3) {
      setStepError('กรุณาให้คะแนนด้านเนื้อหาวิชาให้ครบทุกข้อ (3 ข้อ)');
      return false;
    }

    if (isDay16) {
      if (!lecturerMorning1 || !lecturerMorning2 || !lecturerMorning3) {
        setStepError('กรุณาให้คะแนนวิทยากรประจำวัน (ภาคเช้า) ให้ครบทุกข้อ (3 ข้อ)');
        return false;
      }
      if (!lecturerAfternoon1 || !lecturerAfternoon2 || !lecturerAfternoon3) {
        setStepError('กรุณาให้คะแนนวิทยากรประจำวัน (ภาคบ่าย) ให้ครบทุกข้อ (3 ข้อ)');
        return false;
      }
    } else if (isDay17) {
      if (!lecturerFullDay1 || !lecturerFullDay2 || !lecturerFullDay3) {
        setStepError('กรุณาให้คะแนนวิทยากรประจำวัน (ทั้งวัน) ให้ครบทุกข้อ (3 ข้อ)');
        return false;
      }
    }

    setStepError('');
    return true;
  };

  // Step 3 Validation (Level 2 Learning)
  const validateStep3 = (): boolean => {
    if (isDay16) {
      if (!day16Topic1Pre || !day16Topic1Post) {
        setStepError('กรุณาประเมินระดับความรู้ความเข้าใจ ก่อน-หลัง ในหัวข้อที่ 1 ให้ครบถ้วน');
        return false;
      }
      if (!day16Topic2Pre || !day16Topic2Post) {
        setStepError('กรุณาประเมินระดับความรู้ความเข้าใจ ก่อน-หลัง ในหัวข้อที่ 2 ให้ครบถ้วน');
        return false;
      }
      if (!scenario1 || !scenario2 || !scenario3) {
        setStepError('กรุณาประเมินแนวทางการดำเนินการตามสถานการณ์จำลอง (Scenario) ให้ครบทั้ง 3 ข้อ');
        return false;
      }
    } else if (isDay17) {
      if (!day17Topic1Pre || !day17Topic1Post) {
        setStepError('กรุณาประเมินระดับความรู้ความเข้าใจ ก่อน-หลัง ในหัวข้อพยานหลักฐาน ให้ครบถ้วน');
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

  // Advance step handler
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) setCurrentStep(4);
    } else if (currentStep === 4) {
      if (validateStep4()) setCurrentStep(5);
    }
  };

  // Go to previous step handler (allows editing answers)
  const handlePrevStep = () => {
    setStepError('');
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Jump to specific step (for review in Step 5)
  const handleJumpToStep = (targetStep: number) => {
    if (targetStep < currentStep) {
      setStepError('');
      setCurrentStep(targetStep);
    } else if (targetStep === currentStep + 1) {
      handleNextStep();
    }
  };

  // Rating Radio Component with Mandatory Alert
  const renderRatingRadio = (
    label: string,
    currentVal: number,
    setter: (val: number) => void,
    isRequired: boolean = true
  ) => {
    const isUnanswered = isRequired && currentVal === 0;

    return (
      <div
        className={`bg-white p-3.5 sm:p-4 rounded-xl border transition-all ${
          isUnanswered ? 'border-slate-200' : 'border-lime/40 bg-lime/5'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <p className="text-xs sm:text-sm font-sarabun font-medium text-slate-800 leading-relaxed">
            {label} <span className="text-red-500 font-bold">*</span>
          </p>
          {currentVal > 0 ? (
            <span className="text-[11px] font-kanit font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
              {currentVal} คะแนน
            </span>
          ) : (
            <span className="text-[11px] font-kanit text-amber-700 bg-amber-50 px-2 py-0.5 rounded shrink-0 border border-amber-200">
              ยังไม่เลือก
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {[5, 4, 3, 2, 1].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                setter(val);
                setStepError('');
              }}
              className={`text-center py-2 px-1 rounded-lg text-xs font-kanit cursor-pointer border transition-all ${
                currentVal === val
                  ? 'bg-lime text-navy-900 border-lime font-bold shadow-xs scale-102 ring-2 ring-lime/40'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <span className="block text-sm sm:text-base font-bold">{val}</span>
              <span className="text-[10px] sm:text-[11px] block text-slate-500 font-normal">
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

  // Final Submission Handler (Invoked only on Step 5)
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Final integrity checks
    if (!validateStep1() || !validateStep2() || !validateStep3() || !validateStep4()) {
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
        lecturerComment,
        topic1Pre: day16Topic1Pre,
        topic1Post: day16Topic1Post,
        topic2Pre: day16Topic2Pre,
        topic2Post: day16Topic2Post,
        scenario1,
        scenario2,
        scenario3,
        baseline1,
        baseline2,
        baseline3,
        suggestions,
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
        lecturerComment,
        topic1Pre: day17Topic1Pre,
        topic1Post: day17Topic1Post,
        readiness1,
        readiness2,
        readiness3,
        baseline1,
        baseline2,
        baseline3,
        suggestions,
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

    // Submit only now!
    onSubmit({
      dayId: day.id,
      dayTitle: day.title,
      generalInfo,
      participantName,
      suggestions,
      day16Data,
      day17Data,
      overallSatisfaction,
    });
  };

  const stepsList = [
    { num: 1, title: 'ส่วนที่ 1 ข้อมูลทั่วไป' },
    { num: 2, title: 'ส่วนที่ 2 Level 1 Reaction' },
    { num: 3, title: 'ส่วนที่ 3 Level 2 Learning' },
    { num: 4, title: 'ส่วนที่ 4 Baseline (Lv 3-4)' },
    { num: 5, title: 'ส่วนที่ 5 ตรวจทานและส่ง' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-navy-900 text-white p-5 sm:p-6 border-b-4 border-lime flex justify-between items-start shrink-0">
          <div className="pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-lime/20 text-lime px-2.5 py-0.5 rounded text-xs font-kanit font-semibold border border-lime/30">
                {day.dayLabel} · {day.dateStr}
              </span>
              <span className="text-xs text-slate-300 font-sarabun">
                สถาบันพัฒนาการตรวจเงินแผ่นดิน · สำนักงานการตรวจเงินแผ่นดิน
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-kanit font-bold text-white leading-snug">
              แบบสอบถามประเมินผลโครงการฝึกอบรม
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-sarabun mt-1">
              หลักสูตร "การตรวจสอบการปฏิบัติตามกฎหมาย ระดับกลาง" ประจำวันที่ {day.dateStr}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white px-2.5 py-1 rounded text-xs font-kanit border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
          >
            ปิด
          </button>
        </div>

        {/* Step Progress Bar (Clickable to return and edit previous steps) */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 py-2.5 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1 sm:gap-2 min-w-max">
            {stepsList.map((st) => {
              const isCurrent = currentStep === st.num;
              const isPast = currentStep > st.num;
              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => handleJumpToStep(st.num)}
                  disabled={st.num > currentStep}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-kanit transition-all ${
                    isCurrent
                      ? 'bg-navy-900 text-lime font-bold shadow-xs'
                      : isPast
                      ? 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 cursor-pointer'
                      : 'bg-transparent text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isCurrent
                        ? 'bg-lime text-navy-900'
                        : isPast
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    {isPast ? '✓' : st.num}
                  </span>
                  <span>{st.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Form Scroll Area */}
        <form onSubmit={handleFinalSubmit} className="overflow-y-auto p-5 sm:p-8 space-y-6 flex-1">
          {hasSubmitted && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm">
              <span className="font-kanit font-semibold">หมายเหตุ:</span> ท่านได้เคยทำแบบประเมินของวันนี้แล้ว หากทำรายการและส่งใหม่ ระบบจะบันทึกข้อมูลปรับปรุงฉบับล่าสุด
            </div>
          )}

          {stepError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-kanit font-medium flex items-center justify-between">
              <span>{stepError}</span>
              <span className="text-[11px] bg-red-200/50 px-2 py-0.5 rounded text-red-800">
                บังคับตอบทุกข้อ
              </span>
            </div>
          )}

          {/* ==================== STEP 1: ส่วนที่ 1 ข้อมูลทั่วไป ==================== */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* คำชี้แจง */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 text-xs sm:text-sm text-slate-700 font-sarabun space-y-2">
                <h4 className="font-kanit font-bold text-navy-900 text-sm sm:text-base">
                  คำชี้แจง
                </h4>
                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-slate-600">
                  <li>
                    แบบสอบถามนี้จัดทำขึ้นเพื่อประเมินผลความพึงพอใจและวัดผลการเรียนรู้รายวัน (Reaction and Learning Evaluation) เพื่อรวบรวมและวิเคราะห์สรุปรายงานผลการดำเนินโครงการภายหลังเสร็จสิ้นการดำเนินโครงการภายใน 60 วัน โดยเสนอรายงานแก่หัวหน้าหน่วยงาน ตามระเบียบกระทรวงการคลัง พ.ศ. 2549
                  </li>
                  <li>
                    รายงานฉบับนี้จะเป็นข้อมูลสำหรับติดตามประเมินผลการนำความรู้ไปใช้ปฏิบัติงานจริงภายหลังเสร็จสิ้นการฝึกอบรมไม่น้อยกว่า 3 – 6 เดือน ต่อไป (Behavior and Result Evaluation)
                  </li>
                  <li>
                    การให้ข้อมูลตามความเป็นจริงของท่านเป็นหัวใจสำคัญที่จะช่วยให้ได้ข้อมูลที่ถูกต้อง นำไปสู่การพัฒนาหลักสูตรและระบบสนับสนุนการทำงานที่ตรงจุดอย่างแท้จริง
                  </li>
                </ol>
              </div>

              {/* Form Section 1 */}
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
                <div className="border-b border-slate-200 pb-2">
                  <span className="text-xs font-kanit font-semibold text-lime-dark uppercase">
                    ขั้นตอนที่ 1 จาก 5
                  </span>
                  <h4 className="font-kanit font-bold text-lg text-navy-900">
                    ส่วนที่ 1 ข้อมูลทั่วไปของผู้ตอบแบบสอบถาม
                  </h4>
                </div>

                {/* 1. พื้นที่ปฏิบัติงาน */}
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-kanit font-semibold text-slate-800">
                    1. พื้นที่ปฏิบัติงานของท่าน <span className="text-red-500">*</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                        workArea === 'central'
                          ? 'border-lime bg-lime/10 ring-1 ring-lime/40'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="radio"
                          name="workArea"
                          checked={workArea === 'central'}
                          onChange={() => {
                            setWorkArea('central');
                            setStepError('');
                          }}
                          className="text-lime-dark focus:ring-lime"
                        />
                        <span className="text-xs sm:text-sm font-kanit font-semibold text-slate-800">
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
                        placeholder="ระบุชื่อย่อสำนัก เช่น สตน.1, สตส., สชญ."
                        className="w-full text-xs px-2.5 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-lime disabled:bg-slate-100"
                      />
                    </label>

                    <label
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                        workArea === 'regional'
                          ? 'border-lime bg-lime/10 ring-1 ring-lime/40'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="radio"
                          name="workArea"
                          checked={workArea === 'regional'}
                          onChange={() => {
                            setWorkArea('regional');
                            setStepError('');
                          }}
                          className="text-lime-dark focus:ring-lime"
                        />
                        <span className="text-xs sm:text-sm font-kanit font-semibold text-slate-800">
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
                        placeholder="ระบุชื่อย่อสำนัก เช่น ตภ.1, ตภ.7, ตภ.8"
                        className="w-full text-xs px-2.5 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-lime disabled:bg-slate-100"
                      />
                    </label>
                  </div>
                </div>

                {/* 2. ระดับตำแหน่งปัจจุบัน */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <p className="text-xs sm:text-sm font-kanit font-semibold text-slate-800">
                    2. ระดับตำแหน่งปัจจุบัน <span className="text-red-500">*</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2.5 ${
                        position === 'senior_professional'
                          ? 'border-lime bg-lime/10 ring-1 ring-lime/40'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="position"
                        checked={position === 'senior_professional'}
                        onChange={() => setPosition('senior_professional')}
                        className="text-lime-dark focus:ring-lime"
                      />
                      <span className="text-xs sm:text-sm font-sarabun text-slate-800">
                        ชำนาญการ (ปฏิบัติงานด้านตรวจสอบไม่น้อยกว่า 3 ปี)
                      </span>
                    </label>

                    <label
                      className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2.5 ${
                        position === 'special_professional'
                          ? 'border-lime bg-lime/10 ring-1 ring-lime/40'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="position"
                        checked={position === 'special_professional'}
                        onChange={() => setPosition('special_professional')}
                        className="text-lime-dark focus:ring-lime"
                      />
                      <span className="text-xs sm:text-sm font-sarabun text-slate-800 font-medium">
                        ชำนาญการพิเศษ
                      </span>
                    </label>
                  </div>
                </div>

                {/* 3. บทบาทหน้าที่หลัก */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <p className="text-xs sm:text-sm font-kanit font-semibold text-slate-800">
                    3. บทบาทหน้าที่หลักในการปฏิบัติงานปัจจุบัน (เลือกได้มากกว่า 1 ข้อ) <span className="text-red-500">*</span>
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
                        className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2.5 text-xs sm:text-sm font-sarabun ${
                          roles.includes(role)
                            ? 'border-lime bg-lime/10 font-medium text-slate-900 ring-1 ring-lime/40'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={roles.includes(role)}
                          onChange={() => handleRoleToggle(role)}
                          className="rounded text-lime-dark focus:ring-lime"
                        />
                        <span>{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== STEP 2: ส่วนที่ 2 Level 1 Reaction ==================== */}
          {currentStep === 2 && (
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
              <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="text-xs font-kanit font-semibold text-lime-dark uppercase">
                    ขั้นตอนที่ 2 จาก 5
                  </span>
                  <h4 className="font-kanit font-bold text-lg text-navy-900">
                    ส่วนที่ 2: Level 1 Reaction (ประเมินความพึงพอใจต่อเนื้อหาและวิทยากรประจำวัน)
                  </h4>
                </div>
                <span className="text-xs font-sarabun text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                  เกณฑ์ 5 ระดับ (5 = มากที่สุด, 1 = น้อยที่สุด)
                </span>
              </div>

              {/* ด้านเนื้อหาวิชาประจำวัน */}
              <div className="space-y-3">
                <h5 className="font-kanit font-semibold text-sm text-navy-900 pb-1 border-b">
                  ด้านเนื้อหาวิชาประจำวัน (บังคับตอบครบ 3 ข้อ)
                </h5>
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
                  {/* วิทยากรเช้า */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <h5 className="font-kanit font-semibold text-sm text-navy-900 pb-1 border-b">
                      ด้านวิทยากรประจำวัน วันที่ 16 พฤศจิกายน 2569 (ภาคเช้า)
                    </h5>
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

                  {/* วิทยากรบ่าย */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <h5 className="font-kanit font-semibold text-sm text-navy-900 pb-1 border-b">
                      ด้านวิทยากรประจำวัน วันที่ 16 พฤศจิกายน 2569 (ภาคบ่าย)
                    </h5>
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
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h5 className="font-kanit font-semibold text-sm text-navy-900 pb-1 border-b">
                    ด้านวิทยากรประจำวัน วันที่ 17 พฤศจิกายน 2569 (ทั้งวัน)
                  </h5>
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

              {/* ความเห็นต่อวิทยากร */}
              <div className="pt-2">
                <label className="block text-xs font-kanit font-medium text-slate-700 mb-1">
                  7. ความเห็นต่อวิทยากร ระบุ (ถ้ามี)
                </label>
                <textarea
                  rows={2}
                  value={lecturerComment}
                  onChange={(e) => setLecturerComment(e.target.value)}
                  placeholder="ระบุความเห็นเพิ่มเติมต่อวิทยากรหรือเทคนิคการสอน..."
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime"
                ></textarea>
              </div>
            </div>
          )}

          {/* ==================== STEP 3: ส่วนที่ 3 Level 2 Learning ==================== */}
          {currentStep === 3 && (
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
              <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="text-xs font-kanit font-semibold text-lime-dark uppercase">
                    ขั้นตอนที่ 3 จาก 5
                  </span>
                  <h4 className="font-kanit font-bold text-lg text-navy-900">
                    ส่วนที่ 3: Level 2 Learning (ประเมินความรู้ ความเข้าใจที่เกิดขึ้นประจำวัน)
                  </h4>
                </div>
                <span className="text-xs font-sarabun text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                  เกณฑ์ 5 ระดับ (5 = มากที่สุด, 1 = น้อยที่สุด)
                </span>
              </div>

              {isDay16 ? (
                <>
                  {/* Day 16 3.1 Self Assessment */}
                  <div className="space-y-4">
                    <h5 className="font-kanit font-semibold text-sm text-slate-800">
                      3.1 การประเมินระดับความรู้ ความเข้าใจด้วยตนเอง (Self-Assessment)
                    </h5>

                    {/* Topic 1 */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <p className="text-xs sm:text-sm font-kanit font-semibold text-navy-900">
                        1. หัวข้อ: ทบทวนสาระสำคัญความรู้เกี่ยวกับกฎหมายและแนวปฏิบัติในการตรวจสอบ เพื่อกำกับ แนะนำ ตรวจสอบการปฏิบัติงานในฐานะหัวหน้างาน
                      </p>
                      {renderRatingRadio(
                        '1. ระดับความรู้ความเข้าใจ ก่อน การฝึกอบรมหัวข้อนี้',
                        day16Topic1Pre,
                        setDay16Topic1Pre
                      )}
                      {renderRatingRadio(
                        '2. ระดับความรู้ความเข้าใจ หลัง การฝึกอบรมหัวข้อนี้',
                        day16Topic1Post,
                        setDay16Topic1Post
                      )}
                    </div>

                    {/* Topic 2 */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <p className="text-xs sm:text-sm font-kanit font-semibold text-navy-900">
                        2. หัวข้อ: ทบทวนสาระสำคัญความรู้เกี่ยวกับการตรวจสอบการปฏิบัติตามกฎหมายเพื่อกำกับ แนะนำ ตรวจสอบการปฏิบัติงานในฐานะหัวหน้างาน
                      </p>
                      {renderRatingRadio(
                        '1. ระดับความรู้ความเข้าใจ ก่อน การฝึกอบรมหัวข้อนี้',
                        day16Topic2Pre,
                        setDay16Topic2Pre
                      )}
                      {renderRatingRadio(
                        '2. ระดับความรู้ความเข้าใจ หลัง การฝึกอบรมหัวข้อนี้',
                        day16Topic2Post,
                        setDay16Topic2Post
                      )}
                    </div>
                  </div>

                  {/* Day 16 3.2 Scenario-based Assessment */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <h5 className="font-kanit font-semibold text-sm text-slate-800">
                      3.2 การประเมินความรู้ความเข้าใจผ่านสถานการณ์จำลอง (Scenario-based Assessment)
                    </h5>

                    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs sm:text-sm font-sarabun text-slate-800 leading-relaxed space-y-1.5">
                      <p className="font-kanit font-bold text-amber-900">
                        สถานการณ์: ในฐานะผู้สอบทานงานตรวจสอบ
                      </p>
                      <p>
                        ท่านพบว่าทีมตรวจสอบรายงานผลเบื้องต้นกรณีหน่วยรับตรวจจัดซื้อครุภัณฑ์ราคาสูงกว่าท้องตลาด แต่ทีมงานสรุปเพียงว่า "เป็นการบกพร่องตามระเบียบพัสดุ" โดยยังไม่ได้ตรวจสอบความเชื่อมโยงของเส้นทางการเงินหรือการสอบถ้อยคำเพื่อหาเจตนาทุจริต
                      </p>
                      <p className="text-slate-600 text-xs italic pt-1">
                        คำชี้แจง: จากความรู้ที่ได้รับในวันนี้ โปรดประเมินแนวโน้มความเหมาะสมที่ท่านจะดำเนินการในฐานะหัวหน้างาน (5 = เหมาะสมอย่างยิ่ง/ปฏิบัติแน่นอน, 1 = ไม่เหมาะสมอย่างยิ่ง/ไม่ปฏิบัติแน่นอน)
                      </p>
                    </div>

                    <div className="space-y-3">
                      {renderRatingRadio(
                        '1. สั่งการให้ทีมงานกำหนดประเด็นการตรวจสอบเพิ่มเติม และวางแผนสอบถ้อยคำพยานบุคคลที่เกี่ยวข้องกับการอนุมัติจัดซื้อ',
                        scenario1,
                        setScenario1
                      )}
                      {renderRatingRadio(
                        '2. อนุมัติผ่านรายงานตามที่ทีมงานเสนอ เนื่องจากมองว่าหลักฐานความเชื่อมโยงทางการเงินหาได้ยากและใช้เวลามากเกินไป',
                        scenario2,
                        setScenario2
                      )}
                      {renderRatingRadio(
                        '3. แนะนำเทคนิคทางจิตวิทยาในการสอบถ้อยคำให้แก่ทีมงาน เพื่อเตรียมความพร้อมก่อนลงพื้นที่หาพยานหลักฐานเพิ่มเติม',
                        scenario3,
                        setScenario3
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Day 17 Level 2 Learning */
                <>
                  <div className="space-y-4">
                    <h5 className="font-kanit font-semibold text-sm text-slate-800">
                      3.1 การประเมินระดับความรู้ ความเข้าใจด้วยตนเอง (Self-Assessment)
                    </h5>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <p className="text-xs sm:text-sm font-kanit font-semibold text-navy-900">
                        หัวข้อ: เทคนิคและทักษะการรวบรวมพยานหลักฐาน (กรณีมีความเสียหาย/ทุจริต/จงใจ) เพื่อกำกับ แนะนำ ตรวจสอบการปฏิบัติงาน ในฐานะหัวหน้างาน
                      </p>
                      {renderRatingRadio(
                        '1. ระดับความรู้ความเข้าใจ ก่อน การฝึกอบรมหัวข้อนี้',
                        day17Topic1Pre,
                        setDay17Topic1Pre
                      )}
                      {renderRatingRadio(
                        '2. ระดับความรู้ความเข้าใจ หลัง การฝึกอบรมหัวข้อนี้',
                        day17Topic1Post,
                        setDay17Topic1Post
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <h5 className="font-kanit font-semibold text-sm text-slate-800">
                      3.2 การประเมินความรู้ความเข้าใจในระดับความสามารถและความพร้อม (Capability & Readiness)
                    </h5>
                    <p className="text-xs text-slate-500 font-sarabun">
                      คำชี้แจง: โปรดประเมินแนวโน้มความเหมาะสมที่ท่านจะดำเนินการในฐานะหัวหน้างาน (5 = ปฏิบัติแน่นอน / เหมาะสมอย่างยิ่ง, 1 = ไม่ปฏิบัติแน่นอน / ไม่เหมาะสมอย่างยิ่ง)
                    </p>

                    <div className="space-y-3">
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
                </>
              )}
            </div>
          )}

          {/* ==================== STEP 4: ส่วนที่ 4 ข้อมูลพื้นฐานสำหรับติดตาม Level 3 & 4 ==================== */}
          {currentStep === 4 && (
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-xs font-kanit font-semibold text-lime-dark uppercase">
                  ขั้นตอนที่ 4 จาก 5
                </span>
                <h4 className="font-kanit font-bold text-lg text-navy-900">
                  ส่วนที่ 4: ข้อมูลพื้นฐานสำหรับติดตาม Level 3 (Behavior) และ Level 4 (Results)
                </h4>
                <p className="text-xs text-slate-500 font-sarabun mt-1">
                  คำชี้แจง: ประเมินความคาดหวังในการนำความรู้ไปประยุกต์ใช้เพื่อเป็น Baseline ข้อมูล (5 = มากที่สุด, 1 = น้อยที่สุด)
                </p>
              </div>

              <div className="space-y-3">
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

          {/* ==================== STEP 5: ส่วนที่ 5 ข้อเสนอแนะ & ตรวจทานและยืนยัน ==================== */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* ส่วนที่ 5 ข้อเสนอแนะเพิ่มเติม */}
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="border-b border-slate-200 pb-2">
                  <span className="text-xs font-kanit font-semibold text-lime-dark uppercase">
                    ขั้นตอนที่ 5 จาก 5
                  </span>
                  <h4 className="font-kanit font-bold text-lg text-navy-900">
                    ส่วนที่ 5: ข้อเสนอแนะเพิ่มเติมสำหรับหัวข้อวิชาประจำวัน
                  </h4>
                </div>
                <textarea
                  rows={3}
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  placeholder="ระบุข้อคิดเห็นและข้อเสนอแนะเพิ่มเติมสำหรับหัวข้อวิชาประจำวันนี้..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime"
                ></textarea>
              </div>

              {/* Review and Confirmation Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="font-kanit font-bold text-navy-900 text-base">
                    สรุปการตรวจทานคำตอบก่อนยืนยันการส่ง
                  </h4>
                  <span className="text-xs font-kanit text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    ตอบครบทุกข้อสมบูรณ์แล้ว
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sarabun text-slate-700">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 flex flex-col justify-between">
                    <div>
                      <p className="font-kanit font-semibold text-navy-900">ส่วนที่ 1 ข้อมูลผู้ตอบ:</p>
                      <p>พื้นที่: {workArea === 'central' ? 'ส่วนกลาง' : 'ส่วนภูมิภาค'} ({bureauName})</p>
                      <p>ตำแหน่ง: {position === 'senior_professional' ? 'ชำนาญการ' : 'ชำนาญการพิเศษ'}</p>
                      <p>บทบาท: {roles.join(', ')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-lime-dark hover:underline font-kanit pt-2 text-left cursor-pointer"
                    >
                      ✎ แก้ไขส่วนที่ 1
                    </button>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 flex flex-col justify-between">
                    <div>
                      <p className="font-kanit font-semibold text-navy-900">ส่วนที่ 2 Level 1 Reaction:</p>
                      <p>เนื้อหา: ข้อ 1({contentScore1}), ข้อ 2({contentScore2}), ข้อ 3({contentScore3})</p>
                      {isDay16 ? (
                        <p>วิทยากร: เช้า ({lecturerMorning1},{lecturerMorning2},{lecturerMorning3}) | บ่าย ({lecturerAfternoon1},{lecturerAfternoon2},{lecturerAfternoon3})</p>
                      ) : (
                        <p>วิทยากรทั้งวัน: ({lecturerFullDay1},{lecturerFullDay2},{lecturerFullDay3})</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-lime-dark hover:underline font-kanit pt-2 text-left cursor-pointer"
                    >
                      ✎ แก้ไขส่วนที่ 2
                    </button>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 flex flex-col justify-between">
                    <div>
                      <p className="font-kanit font-semibold text-navy-900">ส่วนที่ 3 Level 2 Learning:</p>
                      {isDay16 ? (
                        <>
                          <p>หัวข้อ 1 ก่อน {day16Topic1Pre} ➔ หลัง {day16Topic1Post}</p>
                          <p>หัวข้อ 2 ก่อน {day16Topic2Pre} ➔ หลัง {day16Topic2Post}</p>
                          <p>Scenario: ({scenario1}, {scenario2}, {scenario3})</p>
                        </>
                      ) : (
                        <>
                          <p>หัวข้อพยานหลักฐาน ก่อน {day17Topic1Pre} ➔ หลัง {day17Topic1Post}</p>
                          <p>Readiness: ({readiness1}, {readiness2}, {readiness3})</p>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs text-lime-dark hover:underline font-kanit pt-2 text-left cursor-pointer"
                    >
                      ✎ แก้ไขส่วนที่ 3
                    </button>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 flex flex-col justify-between">
                    <div>
                      <p className="font-kanit font-semibold text-navy-900">ส่วนที่ 4 Baseline (Lv 3-4):</p>
                      <p>ปรับใช้/สอนงาน: {baseline1} / 5</p>
                      <p>ยกระดับมาตรฐานทีม: {baseline2} / 5</p>
                      <p>นำไปปรับใช้จริง: {baseline3} / 5</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="text-xs text-lime-dark hover:underline font-kanit pt-2 text-left cursor-pointer"
                    >
                      ✎ แก้ไขส่วนที่ 4
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 font-sarabun">
                  <span className="font-kanit font-semibold">ข้อตกลงการส่ง:</span> เมื่อท่านกดปุ่ม <b>"ยืนยันและส่งแบบประเมิน"</b> ระบบจะทำการบันทึกข้อมูลเข้าสู่ฐานข้อมูลอย่างเป็นทางการ และนำท่านกลับสู่หน้าหลัก
                </div>
              </div>
            </div>
          )}

          {/* Modal Bottom Actions Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
            {/* Previous Step Button */}
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-kanit font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                ← ย้อนกลับไปแก้ไข
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-kanit text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
            )}

            {/* Next / Final Submit Button */}
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full sm:w-auto px-7 py-2.5 text-xs sm:text-sm font-kanit font-bold text-navy-900 bg-lime hover:bg-lime-dark rounded-lg transition-colors shadow-md cursor-pointer"
              >
                ถัดไป: {stepsList[currentStep].title} →
              </button>
            ) : (
              <button
                type="submit"
                className="w-full sm:w-auto px-9 py-2.5 text-xs sm:text-sm font-kanit font-bold text-navy-900 bg-gradient-to-r from-lime via-lime-light to-lime hover:brightness-105 rounded-lg transition-all shadow-lg hover:shadow-lime/40 cursor-pointer"
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
