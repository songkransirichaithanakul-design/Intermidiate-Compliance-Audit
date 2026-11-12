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

// Detailed response for Day 16
export type Day16Response = {
  // Level 1: Reaction
  contentScore1: number; // ความสอดคล้องกับบทบาท
  contentScore2: number; // ความเหมาะสมกับยุคสมัย/กฎหมาย สตง.
  contentScore3: number; // การนำไปประยุกต์ใช้กำกับควบคุมงาน
  // Lecturer Morning
  lecturerMorning1: number;
  lecturerMorning2: number;
  lecturerMorning3: number;
  // Lecturer Afternoon
  lecturerAfternoon1: number;
  lecturerAfternoon2: number;
  lecturerAfternoon3: number;
  lecturerComment: string;

  // Level 2: Learning
  topic1Pre: number; // หัวข้อ 1 ก่อน
  topic1Post: number; // หัวข้อ 1 หลัง
  topic2Pre: number; // หัวข้อ 2 ก่อน
  topic2Post: number; // หัวข้อ 2 หลัง
  // Scenario-based Assessment (if applicable)
  scenario1?: number;
  scenario2?: number;
  scenario3?: number;

  // Level 3 & 4 Baseline
  baseline1: number; // ปรับใช้/สอนงาน
  baseline2: number; // ยกระดับมาตรฐานทีม
  baseline3: number; // นำไปปรับใช้จริง

  // Suggestions
  suggestions: string;
};

// Detailed response for Day 17
export type Day17Response = {
  // Level 1: Reaction
  contentScore1: number;
  contentScore2: number;
  contentScore3: number;
  // Lecturer Full Day
  lecturerFullDay1: number;
  lecturerFullDay2: number;
  lecturerFullDay3: number;
  lecturerComment: string;

  // Level 2: Learning
  topic1Pre: number; // เทคนิคและทักษะรวบรวมพยานหลักฐาน ก่อน
  topic1Post: number; // หลัง
  // 3.2 Capability & Readiness
  readiness1: number; // กำหนดกรอบกำกับงาน
  readiness2: number; // ให้คำปรึกษาสอนงาน
  readiness3: number; // ตัดสินใจทางวิชาชีพรอบคอบ

  // Level 3 & 4 Baseline
  baseline1: number;
  baseline2: number;
  baseline3: number;

  // Suggestions
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
