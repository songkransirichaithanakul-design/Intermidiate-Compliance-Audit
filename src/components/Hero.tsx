import React from 'react';

export const Hero: React.FC = () => {
  return (
    <header className="bg-navy-900 relative border-b-4 border-lime overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-10 pointer-events-none text-slate-400">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="hero-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40L40 0H20L0 20M40 40V20L20 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid-pattern)"></rect>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-18 relative z-10">
        <div className="text-center md:text-left max-w-4xl">
          <div className="inline-block py-1 px-3.5 rounded-full bg-navy-800 text-lime font-kanit text-xs md:text-sm font-medium mb-4 border border-lime/30">
            รอบประเมินผล พฤศจิกายน 2569 · ระยะเวลาอบรม 16 - 27 พ.ย. 2569
          </div>

          {/* Heading: การประเมินผลโครงการฝึกอบรม */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-kanit font-bold text-white leading-tight mb-4 text-balance">
            การประเมินผลโครงการฝึกอบรม
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 mb-6 max-w-2xl font-light font-sarabun leading-relaxed">
            หลักสูตร <span className="text-white font-medium">"การตรวจสอบการปฏิบัติตามกฎหมาย ระดับกลาง"</span>
            <br />
            สำหรับข้าราชการระดับชำนาญการและชำนาญการพิเศษ สำนักงานการตรวจเงินแผ่นดิน
          </p>

          {/* คำชี้แจง */}
          <div className="bg-navy-800/80 border border-slate-700/80 rounded-xl p-5 sm:p-6 mb-8 text-left shadow-md">
            <h2 className="text-lime font-kanit font-semibold text-lg sm:text-xl mb-3">
              คำชี้แจง
            </h2>
            <ol className="space-y-3 text-sm sm:text-base font-sarabun text-slate-200 leading-relaxed list-none">
              <li className="flex items-start gap-2.5">
                <span className="font-kanit font-semibold text-lime shrink-0 pt-0.5">1.</span>
                <span>
                  แบบสอบถามนี้จัดทำขึ้นเพื่อประเมินผลความพึงพอใจและวัดผลการเรียนรู้รายวัน (Reaction and Learning Evaluation) เพื่อรวบรวมและวิเคราะห์สรุปรายงานผลการดำเนินโครงการภายหลังเสร็จสิ้นการดำเนินโครงการภายใน 60 วัน โดยเสนอรายงานแก่หัวหน้าหน่วยงาน ตามระเบียบกระทรวงการคลัง ว่าด้วยค่าใช้จ่ายในการฝึกอบรม การจัดงาน และการประชุมระหว่างประเทศ พ.ศ. 2549 และที่แก้ไขเพิ่มเติม (ฉบับที่ 2 พ.ศ. 2552) (ฉบับที่ 3 พ.ศ. 2555)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-kanit font-semibold text-lime shrink-0 pt-0.5">2.</span>
                <span>
                  รายงานฉบับนี้จะเป็นข้อมูลสำหรับติดตามประเมินผลการนำความรู้ไปใช้ปฏิบัติงานจริงภายหลังเสร็จสิ้นการฝึกอบรมไม่น้อยกว่า 3 – 6 เดือน ต่อไป (Behavior and Result Evaluation)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-kanit font-semibold text-lime shrink-0 pt-0.5">3.</span>
                <span>
                  การให้ข้อมูลตามความเป็นจริงของท่านเป็นหัวใจสำคัญที่จะช่วยให้ได้ข้อมูลที่ถูกต้อง นำไปสู่การพัฒนาหลักสูตรและระบบสนับสนุนการทำงานที่ตรงจุดอย่างแท้จริง
                </span>
              </li>
            </ol>
          </div>

          {/* Institutional Trust markers without icons */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400 font-sarabun justify-center md:justify-start">
            <span>มาตรฐานวิชาชีพการตรวจเงินแผ่นดิน (ISSAI)</span>
            <span className="text-slate-600">·</span>
            <span>บันทึกชั่วโมงการพัฒนาความรู้ต่อเนื่อง (CPD) 48 ชั่วโมง</span>
            <span className="text-slate-600">·</span>
            <span>ความลับข้อมูลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
