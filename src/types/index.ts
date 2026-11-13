export type DayStatus = 'open' | 'closed' | 'waiting';

export type EvaluationDay = {
  id: string;
  dayNumber: number;
  dayLabel: string;
  title: string;
  dateStr: string;
  status: DayStatus; // 'open' = เปิดรับคำตอบ, 'closed' = ปิดรับคำตอบ, 'waiting' = รอข้อมูลแบบสอบถาม
  totalSubmitted: number;
  averageScore: number;
  isSpecial?: boolean;
  hasQuestionnaire?: boolean;
  statusUpdatedAt?: string;
  statusUpdatedBy?: string;
};

// General Demographics (Section 1)
export type GeneralInfo = {
  workArea: 'central' | 'regional';
  bureauName: string; // ชื่อย่อสำนัก
  position: 'senior_professional' | 'special_professional'; // ชำนาญการ vs ชำนาญการพิเศษ
  roles: string[]; // multi-select roles
  traineeId?: string;
  traineeName?: string;
};

// Config-driven questionnaire definitions for every training day
export type LecturerSessionConfig = {
  id: string; // 'full' | 'morning' | 'afternoon'
  sessionLabel: string; // e.g. 'ทั้งวัน' | 'ภาคเช้า' | 'ภาคบ่าย'
  speakerName?: string; // e.g. 'พล.ต.ท.ภูมินทร์ พุ่มพันธุ์ม่วง ผบช.ปส.'
  headerText: string; // Full heading shown in Section 2
};

export type LearningTopicConfig = {
  id: string; // 'topic1' | 'topic2'
  title: string;
  sessionTag?: string; // 'ภาคเช้า' | 'ภาคบ่าย' | 'ทั้งวัน'
};

export type OverallProjectQuestion = {
  key: 'q8' | 'q9' | 'q10' | 'q11' | 'q12' | 'q13' | 'q14' | 'q15';
  number: number;
  category: 'content' | 'management';
  label: string;
};

export type DayQuestionnaireConfig = {
  dayId: string;
  dateFullLabel: string;
  shortTopic: string;
  lecturerSessions: LecturerSessionConfig[];
  learningTopics: LearningTopicConfig[];
  hasReadiness: boolean;
  hasOverallProjectEval?: boolean;
};

// Unified Dynamic Daily Evaluation Response (supports Days 16-27 cleanly)
export type DailyEvaluationResponse = {
  // Level 1: Content (1-3)
  contentScore1: number;
  contentScore2: number;
  contentScore3: number;
  // Level 1: Lecturers keyed by session id ('full' | 'morning' | 'afternoon')
  lecturerScores: Record<string, { q4: number; q5: number; q6: number }>;
  lecturerComment: string;
  // Day 27 Optional Overall Project Satisfaction (Items 8-15)
  overallProject?: {
    q8: number;
    q9: number;
    q10: number;
    q11: number;
    q12: number;
    q13: number;
    q14: number;
    q15: number;
  };
  // Level 2: 3.1 Self-Assessment Pre/Post keyed by topic id ('topic1' | 'topic2')
  learningTopics: Record<string, { pre: number; post: number }>;
  // Level 2: 3.2 Capability & Readiness
  readiness?: {
    r1: number;
    r2: number;
    r3: number;
  };
  // Level 3 & 4 Baseline
  baseline1: number;
  baseline2: number;
  baseline3: number;
  // Section 5
  suggestions: string;
};

// Detailed response for Day 16 (kept for legacy compatibility)
export type Day16Response = {
  contentScore1: number;
  contentScore2: number;
  contentScore3: number;
  lecturerMorning1: number;
  lecturerMorning2: number;
  lecturerMorning3: number;
  lecturerAfternoon1: number;
  lecturerAfternoon2: number;
  lecturerAfternoon3: number;
  lecturerComment: string;
  topic1Pre: number;
  topic1Post: number;
  topic2Pre: number;
  topic2Post: number;
  scenario1?: number;
  scenario2?: number;
  scenario3?: number;
  baseline1: number;
  baseline2: number;
  baseline3: number;
  suggestions: string;
};

// Detailed response for Day 17 (kept for legacy compatibility)
export type Day17Response = {
  contentScore1: number;
  contentScore2: number;
  contentScore3: number;
  lecturerFullDay1: number;
  lecturerFullDay2: number;
  lecturerFullDay3: number;
  lecturerComment: string;
  topic1Pre: number;
  topic1Post: number;
  readiness1: number;
  readiness2: number;
  readiness3: number;
  baseline1: number;
  baseline2: number;
  baseline3: number;
  suggestions: string;
};

export type EvaluationSubmission = {
  id: string;
  dayId: string;
  dayTitle: string;
  timestamp: string;
  referenceCode: string;
  generalInfo: GeneralInfo;
  participantName?: string;
  suggestions?: string;
  dailyData?: DailyEvaluationResponse;
  day16Data?: Day16Response;
  day17Data?: Day17Response;
  overallSatisfaction: number; // Computed 1-5 score
};

export type ParticipantRecord = {
  id: string;
  code: string;
  name: string;
  position: string;
  department: string;
  workArea: string;
  completedDays: string[];
  lastSubmittedAt?: string;
};
