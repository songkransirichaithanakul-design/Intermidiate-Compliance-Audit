import React from 'react';

interface StatsCardsProps {
  todaySubmitted: number;
  totalSubmitted: number;
  overallSatisfactionPercent: number;
  averageScoreOutOf5: number;
  onFilterActiveToday?: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  todaySubmitted,
  totalSubmitted,
  overallSatisfactionPercent,
  averageScoreOutOf5,
  onFilterActiveToday,
}) => {
  return (
    <section className="mb-14 -mt-10 sm:-mt-14 relative z-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
        {/* Card 1: Today's Submissions */}
        <div 
          onClick={onFilterActiveToday}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between transition-transform hover:-translate-y-0.5 duration-200 group cursor-pointer"
        >
          <div>
            <p className="text-sm font-kanit text-gray-500 font-medium">แบบประเมินที่ส่งแล้ว (วันนี้)</p>
            <h3 className="text-3xl font-bold font-kanit text-charcoal tabular-nums mt-1">
              {todaySubmitted}{' '}
              <span className="text-sm font-normal text-gray-400 font-sarabun">ฉบับ</span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sarabun mt-3 pt-2 border-t border-slate-100">
            {todaySubmitted === 0 ? 'ยังไม่มีผู้ส่งแบบประเมินในวันนี้' : `บันทึกข้อมูลเรียบร้อย ${todaySubmitted} ฉบับ`}
          </p>
        </div>

        {/* Card 2: Total Cumulative Submissions */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between transition-transform hover:-translate-y-0.5 duration-200">
          <div>
            <p className="text-sm font-kanit text-gray-500 font-medium">แบบประเมินสะสมตลอดหลักสูตร</p>
            <h3 className="text-3xl font-bold font-kanit text-charcoal tabular-nums mt-1">
              {totalSubmitted}{' '}
              <span className="text-sm font-normal text-gray-400 font-sarabun">ฉบับ</span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sarabun mt-3 pt-2 border-t border-slate-100">
            รวมทุกวันที่เปิดรับแบบประเมิน
          </p>
        </div>

        {/* Card 3: Cumulative Satisfaction */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between transition-transform hover:-translate-y-0.5 duration-200">
          <div>
            <p className="text-sm font-kanit text-gray-500 font-medium">ภาพรวมความพึงพอใจสะสม</p>
            <h3 className="text-3xl font-bold font-kanit text-charcoal tabular-nums flex items-baseline gap-2 mt-1">
              <span>{overallSatisfactionPercent > 0 ? overallSatisfactionPercent.toFixed(1) : '0.0'}</span>
              <span className="text-sm font-normal text-gray-400 font-sarabun">%</span>
              {averageScoreOutOf5 > 0 && (
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  ({averageScoreOutOf5.toFixed(2)} / 5.00)
                </span>
              )}
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-sarabun mt-3 pt-2 border-t border-slate-100">
            {averageScoreOutOf5 > 0
              ? 'ประมวลผลจากข้อมูลการประเมินจริง'
              : 'รอข้อมูลการประเมินจากผู้เข้าอบรม'}
          </p>
        </div>
      </div>
    </section>
  );
};
