import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatCard, Badge } from '../common/UIComponents';
import { Activity, Calendar, CheckCircle2, XCircle } from 'lucide-react';

export const ParentAttendanceTracker: React.FC = () => {
  const { currentSchool } = useAuth();

  const daysHistory = [
    { date: '2026-08-01', status: 'PRESENT' },
    { date: '2026-08-02', status: 'PRESENT' },
    { date: '2026-08-03', status: 'PRESENT' },
    { date: '2026-08-04', status: 'PRESENT' },
    { date: '2026-08-05', status: 'PRESENT' },
    { date: '2026-08-08', status: 'PRESENT' },
    { date: '2026-08-09', status: 'PRESENT' },
    { date: '2026-08-10', status: 'PRESENT' },
    { date: '2026-08-11', status: 'PRESENT' },
    { date: '2026-08-12', status: 'ABSENT' },
    { date: '2026-08-15', status: 'PRESENT' },
    { date: '2026-08-16', status: 'PRESENT' },
    { date: '2026-08-17', status: 'PRESENT' },
    { date: '2026-08-18', status: 'PRESENT' },
    { date: '2026-08-19', status: 'PRESENT' },
    { date: '2026-08-20', status: 'PRESENT' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          <span>Child Daily Roll Call &amp; Attendance Record</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Verified daily classroom attendance for Alex Morgan (Grade 10-A, Roll #12).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Overall Attendance Rate"
          value="96.4%"
          subtitle="27 / 28 Days Present"
          change="Regular & Punctual"
          changeType="positive"
          icon={Activity}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Total Full Days Present"
          value="27 Days"
          subtitle="August 2026 Session"
          icon={CheckCircle2}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Recorded Absences"
          value="1 Day"
          subtitle="Leave excuse verified"
          icon={Calendar}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            August 2026 Daily Roll Call Timeline
          </h3>
          <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
            96.4% Good Standing
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {daysHistory.map((d, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl text-center text-xs font-bold border transition-colors ${
                d.status === 'PRESENT'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <span className="text-[10px] text-slate-400 block font-normal">Day {i + 1}</span>
              <span className="text-base font-mono">{d.status === 'PRESENT' ? 'P' : 'A'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
