import {
  DailyEvaluationResponse,
  DayQuestionnaireConfig,
  EvaluationSubmission,
  OverallProjectQuestion,
} from '../types';

export const CONTENT_QUESTIONS = [
  {
    key: 'contentScore1' as const,
    label: '1. เนื้อหามีความสอดคล้องกับบทบาทหน้าที่ของท่านในฐานะผู้ปฏิบัติงาน/หัวหน้างาน/ผู้สอบทาน',
  },
  {
    key: 'contentScore2' as const,
    label: '2. เนื้อหามีความเหมาะสมกับยุคสมัย สอดคล้องกับกฎหมาย ระเบียบ และหลักเกณฑ์มาตรฐานของสำนักงานการตรวจเงินแผ่นดิน',
  },
  {
    key: 'contentScore3' as const,
    label: '3. สามารถนำเนื้อหาไปประยุกต์ใช้ในการปฏิบัติงาน กำกับ แนะนำ และควบคุมคุณภาพงานได้จริง',
  },
];

export const READINESS_QUESTIONS = [
  {
    key: 'r1' as const,
    label: '1. สามารถนำหลักเกณฑ์หรือแนวปฏิบัติที่เรียนรู้ในวันนี้ไปกำหนดเป็นกรอบในการกำกับความถูกต้องและครบถ้วนของงานตรวจสอบที่รับผิดชอบได้',
  },
  {
    key: 'r2' as const,
    label: '2. สามารถให้คำปรึกษา แนะนำ หรือสอนงานผู้ใต้บังคับบัญชา เพื่อป้องกันข้อผิดพลาดเชิงระบบมาตรฐานหรือเชิงกฎหมายที่อาจเกิดขึ้นได้',
  },
  {
    key: 'r3' as const,
    label: '3. สามารถตัดสินใจทางวิชาชีพได้อย่างรอบคอบและมีหลักการมากขึ้น เมื่อพบประเด็นปัญหาหรือข้อคิดเห็นที่แตกต่างกันในเรื่องที่เกี่ยวข้อง',
  },
];

export const BASELINE_QUESTIONS = [
  {
    key: 'baseline1' as const,
    label: '1. ท่านคาดว่าจะสามารถนำความรู้ เทคนิควิธีการจากหัวข้อนี้ ไปปรับใช้/สอนงานหรือให้คำปรึกษาแก่ผู้ปฏิบัติงานในทีมได้อย่างมั่นใจ',
  },
  {
    key: 'baseline2' as const,
    label: '2. ท่านคาดว่าความรู้ในวันนี้จะช่วยยกระดับคุณภาพการตรวจสอบการปฏิบัติตามกฎหมายของทีมให้เป็นมาตรฐานเดียวกัน',
  },
  {
    key: 'baseline3' as const,
    label: '3. ท่านคาดว่าจะนำองค์ความรู้นี้ไปปรับใช้จริงในการปฏิบัติงานต่อไป',
  },
];

export const OVERALL_PROJECT_QUESTIONS: OverallProjectQuestion[] = [
  {
    key: 'q8',
    number: 8,
    category: 'content',
    label: '8. เนื้อหาสาระตามหัวข้อวิชาและกิจกรรมของโครงการตลอดช่วงเวลาฝึกอบรมเป็นประโยชน์และปรับใช้ในการปฏิบัติงานได้จริง',
  },
  {
    key: 'q9',
    number: 9,
    category: 'content',
    label: '9. รูปแบบวิธีการฝึกอบรม (รับฟังการบรรยายแบบมีส่วนร่วม/ฝึกปฏิบัติ) ส่งเสริมให้เกิดความรู้และเทคนิควิธีการเพิ่มขึ้น',
  },
  {
    key: 'q10',
    number: 10,
    category: 'content',
    label: '10. ความเหมาะสมของระยะเวลาฝึกอบรม (จำนวนชั่วโมง, จำนวนวัน)',
  },
  {
    key: 'q11',
    number: 11,
    category: 'content',
    label: '11. ความเหมาะสม ความสำคัญและประโยชน์ที่ได้รับจากโครงการในภาพรวม',
  },
  {
    key: 'q12',
    number: 12,
    category: 'management',
    label: '12. สถานที่จัดโครงการฝึกอบรมมีความเหมาะสม (สภาพแวดล้อม ห้องอบรม แสงสว่าง ระบบเสียง)',
  },
  {
    key: 'q13',
    number: 13,
    category: 'management',
    label: '13. เจ้าหน้าที่โครงการสนับสนุนและอำนวยความสะดวก',
  },
  {
    key: 'q14',
    number: 14,
    category: 'management',
    label: '14. การประชาสัมพันธ์ชี้แจงเรื่องที่เกี่ยวข้องกับการฝึกอบรม ทั้งก่อนและระหว่างโครงการ',
  },
  {
    key: 'q15',
    number: 15,
    category: 'management',
    label: '15. ความพึงพอใจต่อความเหมาะสมและคุณภาพของการบริหารจัดการโครงการ',
  },
];

export const QUESTIONNAIRE_CONFIGS: Record<string, DayQuestionnaireConfig> = {
  'day-1': {
    dayId: 'day-1',
    dateFullLabel: 'วันที่ 16 พฤศจิกายน 2569',
    shortTopic: 'ทบทวนกฎหมาย แนวปฏิบัติ และการตรวจสอบฯ',
    lecturerSessions: [
      {
        id: 'morning',
        sessionLabel: 'ภาคเช้า',
        headerText: 'ด้านวิทยากรประจำวัน วันที่ 16 พฤศจิกายน 2569 (ภาคเช้า)',
      },
      {
        id: 'afternoon',
        sessionLabel: 'ภาคบ่าย',
        headerText: 'ด้านวิทยากรประจำวัน วันที่ 16 พฤศจิกายน 2569 (ภาคบ่าย)',
      },
    ],
    learningTopics: [
      {
        id: 'topic1',
        sessionTag: 'ภาคเช้า',
        title: 'ทบทวนสาระสำคัญความรู้เกี่ยวกับกฎหมายและแนวปฏิบัติในการตรวจสอบ เพื่อกำกับ แนะนำ ตรวจสอบการปฏิบัติงานในฐานะหัวหน้างาน',
      },
      {
        id: 'topic2',
        sessionTag: 'ภาคบ่าย',
        title: 'ทบทวนสาระสำคัญความรู้เกี่ยวกับการตรวจสอบการปฏิบัติตามกฎหมายเพื่อกำกับ แนะนำ ตรวจสอบการปฏิบัติงานในฐานะหัวหน้างาน',
      },
    ],
    hasReadiness: false,
  },

  'day-2': {
    dayId: 'day-2',
    dateFullLabel: 'วันที่ 17 พฤศจิกายน 2569',
    shortTopic: 'รวบรวมพยานหลักฐาน (ทุจริต/จงใจ) & Readiness',
    lecturerSessions: [
      {
        id: 'full',
        sessionLabel: 'ทั้งวัน',
        headerText: 'ด้านวิทยากรประจำวัน วันที่ 17 พฤศจิกายน 2569 (ทั้งวัน)',
      },
    ],
    learningTopics: [
      {
        id: 'topic1',
        sessionTag: 'ทั้งวัน',
        title: 'เทคนิคและทักษะการรวบรวมพยานหลักฐาน (กรณีมีความเสียหาย/ทุจริต/จงใจ) เพื่อกำกับ แนะนำ ตรวจสอบการปฏิบัติงาน ในฐานะหัวหน้างาน',
      },
    ],
    hasReadiness: true,
  },

  'day-3': {
    dayId: 'day-3',
    dateFullLabel: 'วันที่ 18 พฤศจิกายน 2569',
    shortTopic: 'เทคนิคการสรุปผลและเขียนรายงานการตรวจสอบฯ',
    lecturerSessions: [
      {
        id: 'full',
        sessionLabel: 'ทั้งวัน',
        headerText: 'ด้านวิทยากรประจำวัน วันที่ 18 พฤศจิกายน 2569 (ทั้งวัน)',
      },
    ],
    learningTopics: [
      {
        id: 'topic1',
        sessionTag: 'ทั้งวัน',
        title: 'เทคนิคและทักษะการสรุปผล และเขียนรายงานการตรวจสอบเพื่อกำกับ แนะนำ ตรวจสอบการปฏิบัติงาน ในฐานะหัวหน้างาน',
      },
    ],
    hasReadiness: true,
  },

  'day-4': {
    dayId: 'day-4',
    dateFullLabel: 'วันที่ 19 พฤศจิกายน 2569',
    shortTopic: 'รวบรวมพยานหลักฐาน (ทุจริต/จงใจ) · เช้า-บ่าย',
    lecturerSessions: [
      {
        id: 'morning',
        sessionLabel: 'ภาคเช้า',
        speakerName: 'พล.ต.ท.ภูมินทร์ พุ่มพันธุ์ม่วง ผบช.ปส.',
        headerText: 'ด้านวิทยากรประจำวัน วันที่ 19 พฤศจิกายน 2569 (ภาคเช้า)',
      },
      {
        id: 'afternoon',
        sessionLabel: 'ภาคบ่าย',
        speakerName: 'พ.ต.ท.ดร.ปุริมพัฒน์ ธนาพันธ์สิริ รอง ผกก.4 บก.สอท.1',
        headerText: 'ด้านวิทยากรประจำวัน วันที่ 19 พฤศจิกายน 2569 (ภาคบ่าย)',
      },
    ],
    learningTopics: [
      {
        id: 'topic1',
        sessionTag: 'ภาคเช้า',
        title: 'เทคนิคและทักษะการรวบรวมพยานหลักฐาน (กรณีมีความเสียหาย/ทุจริต/จงใจ) เพื่อกำกับ แนะนำ ตรวจสอบการปฏิบัติงาน ในฐานะหัวหน้างาน (ภาคเช้า)',
      },
      {
        id: 'topic2',
        sessionTag: 'ภาคบ่าย',
        title: 'เทคนิคและทักษะการรวบรวมพยานหลักฐาน (กรณีมีความเสียหาย/ทุจริต/จงใจ) เพื่อกำกับ แนะนำ ตรวจสอบการปฏิบัติงาน ในฐานะหัวหน้างาน (ภาคบ่าย)',
      },
    ],
    hasReadiness: true,
  },

  'day-5': {
    dayId: 'day-5',
    dateFullLabel: 'วันที่ 20 พฤศจิกายน 2569',
    shortTopic: 'ตรวจเส้นทางการเงิน (ปปง.) & ควบคุมคุณภาพ (สตง.)',
    lecturerSessions: [
      {
        id: 'morning',
        sessionLabel: 'ภาคเช้า',
        speakerName: 'นายปิยะ ศรีวิกะ ผู้อำนวยการกองคดี 2 สำนักงาน ปปง.',
        headerText: 'ด้านวิทยากรประจำวัน วันที่ 20 พฤศจิกายน 2569 (ภาคเช้า)',
      },
      {
        id: 'afternoon',
        sessionLabel: 'ภาคบ่าย',
        speakerName: 'วิทยากรจากสำนักควบคุมและประกันคุณภาพการตรวจเงินแผ่นดิน',
        headerText: 'ด้านวิทยากรประจำวัน วันที่ 20 พฤศจิกายน 2569 (ภาคบ่าย)',
      },
    ],
    learningTopics: [
      {
        id: 'topic1',
        sessionTag: 'ภาคเช้า',
        title: 'เทคนิคและทักษะการรวบรวมพยานหลักฐาน (การตรวจสอบเส้นทางการเงิน) เพื่อกำกับ แนะนำ ตรวจสอบการปฏิบัติงานในฐานะหัวหน้างาน (ภาคเช้า)',
      },
      {
        id: 'topic2',
        sessionTag: 'ภาคบ่าย',
        title: 'การควบคุมคุณภาพการตรวจสอบการปฏิบัติตามกฎหมาย เพื่อกำกับ แนะนำ ตรวจสอบการปฏิบัติงาน ในฐานะหัวหน้างาน (ภาคบ่าย)',
      },
    ],
    hasReadiness: true,
  },

  'day-6': {
    dayId: 'day-6',
    dateFullLabel: 'วันที่ 23 พฤศจิกายน 2569',
    shortTopic: 'วิเคราะห์ปัญหาข้อกฎหมาย & ความผิดวินัยการเงินการคลังฯ',
    lecturerSessions: [
      {
        id: 'morning',
        sessionLabel: 'ภาคเช้า',
        speakerName: 'คณะวิทยากร สตง.',
        headerText: 'ด้านวิทยากรประจำวัน วันที่ 23 พฤศจิกายน 2569 (ภาคเช้า)',
      },
      {
        id: 'afternoon',
        sessionLabel: 'ภาคบ่าย',
        speakerName: 'คณะวิทยากร สตง.',
        headerText: 'ด้านวิทยากรประจำวัน วันที่ 23 พฤศจิกายน 2569 (ภาคบ่าย)',
      },
    ],
    learningTopics: [
      {
        id: 'topic1',
        sessionTag: 'ภาคเช้า',
        title: 'เทคนิคและทักษะการวิเคราะห์ประเด็นปัญหาและการบังคับใช้กฎหมายที่เกี่ยวข้องเพื่อกำกับ แนะนำ ตรวจสอบการปฏิบัติงานในฐานะหัวหน้างาน (ภาคเช้า)',
      },
      {
        id: 'topic2',
        sessionTag: 'ภาคบ่าย',
        title: 'การเสนอเรื่องความผิดวินัยการเงินการคลังของรัฐ (ภาคบ่าย)',
      },
    ],
    hasReadiness: true,
  },

  'day-7': {
    dayId: 'day-7',
    dateFullLabel: 'วันที่ 24 พฤศจิกายน 2569',
    shortTopic: 'การสื่อสารเชิงบวก เพื่อสร้างพื้นที่ปลอดภัยในงานตรวจสอบ',
    lecturerSessions: [
      {
        id: 'full',
        sessionLabel: 'ทั้งวัน',
        speakerName: 'พ.ท. ธนานิษฐ์ สิริไอยราวัชร และคณะ',
        headerText: 'ด้านวิทยากรประจำวัน วันที่ 24 พฤศจิกายน 2569 (ทั้งวัน)',
      },
    ],
    learningTopics: [
      {
        id: 'topic1',
        sessionTag: 'ทั้งวัน',
        title: 'การสื่อสารเชิงบวก เพื่อสร้างพื้นที่ปลอดภัยในงานตรวจสอบ',
      },
    ],
    hasReadiness: true,
  },

  'day-9': {
    dayId: 'day-9',
    dateFullLabel: 'วันที่ 26 พฤศจิกายน 2569',
    shortTopic: 'การเปิดเผยเอกสาร/ฟ้องร้อง & พยานหลักฐานก่อสร้าง',
    lecturerSessions: [
      {
        id: 'morning',
        sessionLabel: 'ภาคเช้า',
        speakerName: 'คณะวิทยากร สตง.',
        headerText: 'ด้านวิทยากรประจำวัน วันที่ 26 พฤศจิกายน 2569 (ภาคเช้า)',
      },
      {
        id: 'afternoon',
        sessionLabel: 'ภาคบ่าย',
        speakerName: 'คณะวิทยากร สตง.',
        headerText: 'ด้านวิทยากรประจำวัน วันที่ 26 พฤศจิกายน 2569 (ภาคบ่าย)',
      },
    ],
    learningTopics: [
      {
        id: 'topic1',
        sessionTag: 'ภาคเช้า',
        title: 'ประเด็นปัญหาและแนวทางปฏิบัติเกี่ยวกับการเปิดเผยเอกสารและข้อมูลของสำนักงานการตรวจเงินแผ่นดิน และกรณีเจ้าหน้าที่ตรวจสอบถูกฟ้องร้องดำเนินคดีสืบเนื่องจากการปฏิบัติหน้าที่ (ภาคเช้า)',
      },
      {
        id: 'topic2',
        sessionTag: 'ภาคบ่าย',
        title: 'การถกแถลงประเด็นอื่น ๆ : การรวบรวมพยานหลักฐานในการตรวจสอบการจัดซื้อจัดจ้างงานก่อสร้าง (ภาคบ่าย)',
      },
    ],
    hasReadiness: true,
  },

  'day-10': {
    dayId: 'day-10',
    dateFullLabel: 'วันที่ 27 พฤศจิกายน 2569',
    shortTopic: 'แลกเปลี่ยนความรู้ & ประเมินผลโครงการในภาพรวม',
    lecturerSessions: [
      {
        id: 'morning',
        sessionLabel: 'ภาคเช้า',
        speakerName: 'คณะวิทยากร สตง.',
        headerText: 'ด้านวิทยากรประจำวัน วันที่ 27 พฤศจิกายน 2569 (ภาคเช้า)',
      },
      {
        id: 'afternoon',
        sessionLabel: 'ภาคบ่าย',
        speakerName: 'นายภูธเรศ คงเอียด ผู้ช่วยผู้ว่าการตรวจเงินแผ่นดิน',
        headerText: 'ด้านวิทยากรประจำวัน วันที่ 27 พฤศจิกายน 2569 (ภาคบ่าย)',
      },
    ],
    learningTopics: [
      {
        id: 'topic1',
        sessionTag: 'ทั้งวัน',
        title: 'การแลกเปลี่ยนความรู้เกี่ยวกับการตรวจสอบที่สำคัญ',
      },
    ],
    hasReadiness: true,
    hasOverallProjectEval: true,
  },
};

export const PREPARED_DAY_IDS = Object.keys(QUESTIONNAIRE_CONFIGS);

/**
 * Normalizes legacy (day16Data / day17Data) and new (dailyData) submissions
 * into one uniform DailyEvaluationResponse structure for Dashboard, Admin, and Exports.
 */
export function normalizeSubmissionDailyData(
  sub: EvaluationSubmission
): DailyEvaluationResponse | null {
  if (sub.dailyData) {
    return sub.dailyData;
  }

  if (sub.day16Data) {
    const d = sub.day16Data;
    return {
      contentScore1: d.contentScore1,
      contentScore2: d.contentScore2,
      contentScore3: d.contentScore3,
      lecturerScores: {
        morning: {
          q4: d.lecturerMorning1,
          q5: d.lecturerMorning2,
          q6: d.lecturerMorning3,
        },
        afternoon: {
          q4: d.lecturerAfternoon1,
          q5: d.lecturerAfternoon2,
          q6: d.lecturerAfternoon3,
        },
      },
      lecturerComment: d.lecturerComment || '',
      learningTopics: {
        topic1: { pre: d.topic1Pre, post: d.topic1Post },
        topic2: { pre: d.topic2Pre, post: d.topic2Post },
      },
      baseline1: d.baseline1,
      baseline2: d.baseline2,
      baseline3: d.baseline3,
      suggestions: d.suggestions || sub.suggestions || '',
    };
  }

  if (sub.day17Data) {
    const d = sub.day17Data;
    return {
      contentScore1: d.contentScore1,
      contentScore2: d.contentScore2,
      contentScore3: d.contentScore3,
      lecturerScores: {
        full: {
          q4: d.lecturerFullDay1,
          q5: d.lecturerFullDay2,
          q6: d.lecturerFullDay3,
        },
      },
      lecturerComment: d.lecturerComment || '',
      learningTopics: {
        topic1: { pre: d.topic1Pre, post: d.topic1Post },
      },
      readiness: {
        r1: d.readiness1,
        r2: d.readiness2,
        r3: d.readiness3,
      },
      baseline1: d.baseline1,
      baseline2: d.baseline2,
      baseline3: d.baseline3,
      suggestions: d.suggestions || sub.suggestions || '',
    };
  }

  return null;
}
