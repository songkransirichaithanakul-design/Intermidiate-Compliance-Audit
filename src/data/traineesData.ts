export interface Trainee {
  id: string; // e.g. 'ชพ.68-001'
  name: string; // e.g. 'นายสมชาย วงศ์สุวรรณ'
  position: string;
  workArea: 'central' | 'regional';
  bureau: string;
}

const FIRST_NAMES_MALE = [
  'สมชาย', 'วิชาญ', 'กิตติศักดิ์', 'สุรชัย', 'พงษ์ศักดิ์', 'ธีรยุทธ', 'วรวุฒิ', 'พิเชษฐ์',
  'ชัยวัฒน์', 'ณัฐพล', 'ธนากร', 'ศิริชัย', 'วีรภัทร', 'เกรียงไกร', 'อนุชา', 'ประวิทย์',
  'ชลิต', 'อดิศร', 'ภาณุวัฒน์', 'เอกชัย', 'ปฏิภาณ', 'รังสรรค์', 'ยุทธนา', 'สถาพร',
  'ธวัชชัย', 'มนตรี', 'บุญส่ง', 'ศักดิ์ชัย', 'อัครเดช', 'จิรภัทร', 'พัฒนพงษ์', 'ศราวุธ'
];

const FIRST_NAMES_FEMALE = [
  'พัชรี', 'ศิริพร', 'วรรณภา', 'กนกวรรณ', 'สุดารัตน์', 'จินตนา', 'อรทัย', 'สุภาพร',
  'นฤมล', 'รัตนา', 'พรพิมล', 'ปิยวรรณ', 'สิริมา', 'วาสนา', 'ศศิธร', 'สุมาลี',
  'อัมพร', 'ดารณี', 'อังคณา', 'กาญจนา', 'ชลธิชา', 'ขนิษฐา', 'มณฑา', 'ลักษมี',
  'ชญานิศ', 'กุลธิดา', 'ณัชชา', 'พิมพ์ผกา', 'เบญจมาศ', 'เพ็ญศรี', 'รพีพร', 'ยุพา'
];

const LAST_NAMES = [
  'สิริจินดา', 'พัฒนกุล', 'วงศ์ประเสริฐ', 'รัตนโกมล', 'ธนทรัพย์', 'มั่นคง', 'สุวรรณโรจน์',
  'ชัยมงคล', 'เจริญผล', 'กิจเจริญ', 'วิเศษสมบูรณ์', 'วัฒนพาณิชย์', 'บวรเกียรติ', 'นิมิตรกุล',
  'สุขสวัสดิ์', 'มิ่งขวัญ', 'จารุภัทร', 'ประสิทธิ์ผล', 'จงพิพัฒน์', 'พงศ์พิสิฐ', 'อนันตคุณ',
  'ศรีสวัสดิ์', 'เตชะกุล', 'บูรณพงศ์', 'อัศวพงษ์', 'ก้องเกียรติ', 'อมรศิลป์', 'โสภณวิบูลย์',
  'เกตุประสิทธิ์', 'วรพงษ์', 'โชติมณี', 'จันทรโสภา', 'ทิพยวรรณ', 'ดิลกคุณากร', 'นพรัตน์',
  'สมรรถการ', 'กิตติวงศ์', 'ศิริชัยธนกุล', 'พิเชษฐ์พงษ์', 'วัชราภรณ์'
];

const BUREAUS_CENTRAL = ['สตน.1', 'สตน.2', 'สตน.3', 'สตน.4', 'สตก.1', 'สตก.2', 'สพบ.', 'สตค.'];
const BUREAUS_REGIONAL = ['ตภ.1', 'ตภ.2', 'ตภ.3', 'ตภ.4', 'ตภ.5', 'ตภ.6', 'ตภ.7', 'ตภ.8', 'ตภ.9', 'ตภ.10'];

export const TRAINEES_LIST: Trainee[] = Array.from({ length: 144 }, (_, idx) => {
  const num = idx + 1;
  const id = `ชพ.68-${num.toString().padStart(3, '0')}`;
  const isFemale = idx % 2 === 1;
  const prefix = isFemale ? (idx % 4 === 1 ? 'นางสาว' : 'นาง') : 'นาย';
  const firstName = isFemale
    ? FIRST_NAMES_FEMALE[idx % FIRST_NAMES_FEMALE.length]
    : FIRST_NAMES_MALE[idx % FIRST_NAMES_MALE.length];
  const lastName = LAST_NAMES[(idx * 3 + 7) % LAST_NAMES.length];
  const name = `${prefix}${firstName} ${lastName}`;

  // Positions distribution matching SAO audit staff
  const posRand = idx % 10;
  const position =
    posRand <= 6
      ? 'นักวิชาการตรวจเงินแผ่นดิน'
      : posRand <= 8
      ? 'นักวิชาการการเงินและบัญชี'
      : 'วิศวกร';

  const isCentral = idx % 3 !== 0;
  const workArea = isCentral ? 'central' : 'regional';
  const bureau = isCentral
    ? BUREAUS_CENTRAL[idx % BUREAUS_CENTRAL.length]
    : BUREAUS_REGIONAL[idx % BUREAUS_REGIONAL.length];

  return {
    id,
    name,
    position,
    workArea,
    bureau,
  };
});
