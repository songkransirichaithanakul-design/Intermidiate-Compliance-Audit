import React, { useState, useMemo } from 'react';
import { ParticipantRecord, EvaluationDay } from '../types';

interface TrackingSectionProps {
  participants: ParticipantRecord[];
  days: EvaluationDay[];
}

export const TrackingSection: React.FC<TrackingSectionProps> = ({
  participants,
  days,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [notificationSentMsg, setNotificationSentMsg] = useState<string | null>(null);

  const departments = useMemo(() => {
    const set = new Set<string>();
    participants.forEach((p) => set.add(p.department));
    return Array.from(set);
  }, [participants]);

  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.position.toLowerCase().includes(searchTerm.toLowerCase());

      let matchDept = true;
      if (departmentFilter !== 'all') {
        matchDept = p.department === departmentFilter;
      }

      return matchSearch && matchDept;
    });
  }, [participants, searchTerm, departmentFilter]);

  // Export to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = [
      'รหัสผู้เข้าอบรม',
      'ชื่อ-นามสกุล',
      'ตำแหน่ง',
      'หน่วยงานสังกัด',
      'จำนวนแบบประเมินที่ส่งแล้ว',
      'เวลาที่ส่งล่าสุด',
    ];

    const rows = filteredParticipants.map((p) => [
      p.code,
      `"${p.name}"`,
      `"${p.position}"`,
      `"${p.department}"`,
      `${p.completedDays.length} วัน`,
      `"${p.lastSubmittedAt || '-'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Tracking_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="mb-14 scroll-mt-24">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 mb-6 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-kanit font-bold text-navy-900">
            ติดตามผลการตอบแบบประเมินรายบุคคล
          </h2>
          <p className="text-gray-500 font-sarabun text-sm mt-1">
            บันทึกรายชื่อผู้เข้าร่วมอบรมที่ตอบแบบประเมินในระบบ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-lime hover:bg-lime-dark text-navy-900 rounded-lg text-xs font-kanit font-semibold transition-colors cursor-pointer shadow-xs"
          >
            ส่งออกรายงาน Excel (CSV)
          </button>
        </div>
      </div>

      {notificationSentMsg && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs sm:text-sm font-kanit">
          {notificationSentMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mb-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาด้วยชื่อ-สกุล, รหัสประจำตัว, ตำแหน่ง หรือสังกัด..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime"
            />
          </div>

          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime"
            >
              <option value="all">ทุกหน่วยงาน / ทุกสำนัก</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Participant List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-sarabun border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 font-kanit text-xs text-slate-600">
              <tr>
                <th className="py-3 px-4 font-semibold">รหัส / ผู้เข้าอบรม</th>
                <th className="py-3 px-4 font-semibold">ตำแหน่งและสังกัด</th>
                <th className="py-3 px-4 font-semibold text-center">จำนวนวันที่ส่งแล้ว</th>
                <th className="py-3 px-4 font-semibold text-center">เวลาบันทึกล่าสุด</th>
                <th className="py-3 px-4 font-semibold text-right">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-sarabun">
                    <p className="font-kanit text-slate-600 text-base mb-1">
                      ยังไม่มีข้อมูลผู้เข้าอบรมที่ตอบแบบประเมินในระบบ
                    </p>
                    <p className="text-xs text-slate-400">
                      เมื่อผู้เข้าร่วมอบรมส่งแบบประเมิน รายชื่อและผลการประเมินจะแสดงผลที่นี่โดยอัตโนมัติ
                    </p>
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-kanit font-semibold text-slate-900">{p.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{p.code}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800 text-xs font-medium">{p.position}</div>
                        <div className="text-slate-500 text-xs">{p.department}</div>
                      </td>

                      <td className="py-3 px-4 text-center font-kanit font-medium text-slate-700">
                        {p.completedDays.length} วัน
                      </td>

                      <td className="py-3 px-4 text-center text-xs text-slate-500 tabular-nums">
                        {p.lastSubmittedAt || '-'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="text-[11px] font-kanit text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          บันทึกแล้ว
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-sarabun gap-2">
          <span>
            แสดงผล {filteredParticipants.length} รายการ
          </span>
          <span className="text-slate-400">
            ระบบอัปเดตข้อมูลอัตโนมัติแบบเรียลไทม์ · สำนักงานการตรวจเงินแผ่นดิน
          </span>
        </div>
      </div>
    </section>
  );
};
