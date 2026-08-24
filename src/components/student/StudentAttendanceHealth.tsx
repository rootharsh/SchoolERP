import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatCard, Badge, Modal } from '../common/UIComponents';
import {
  Activity,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export const StudentAttendanceHealth: React.FC = () => {
  const { currentSchool, currentUser } = useAuth();
  const { language } = useLanguage();

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('2026-08-28');
  const [endDate, setEndDate] = useState('2026-08-29');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveToast, setLeaveToast] = useState<string | null>(null);

  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([
    { id: '1', startDate: '2026-07-14', endDate: '2026-07-15', reason: 'Annual Dental Checkup and Orthodontics', status: 'APPROVED' },
    { id: '2', startDate: '2026-06-02', endDate: '2026-06-02', reason: 'Inter-School Robotics Competition Regional Finals', status: 'APPROVED' },
  ]);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason) return;

    const newReq: LeaveRequest = {
      id: Date.now().toString(),
      startDate,
      endDate,
      reason: leaveReason,
      status: 'PENDING',
    };

    setLeaveHistory([newReq, ...leaveHistory]);
    setLeaveToast(
      language === 'gu'
        ? 'રજાની અરજી વર્ગશિક્ષક (શ્રીમતી નીતાબેન આર. પટેલ) ને મંજૂરી માટે મોકલાઈ ગઈ છે.'
        : 'Leave application submitted to Class Teacher (Smt. Neetaben R. Patel) for approval.'
    );
    setTimeout(() => setLeaveToast(null), 4000);
    setIsLeaveModalOpen(false);
    setLeaveReason('');
  };

  // 28 days mock record
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
      {/* Toast Notification */}
      {leaveToast && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{leaveToast}</span>
          </div>
          <button onClick={() => setLeaveToast(null)} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span>Attendance Health &amp; Leave Desk</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time biometric attendance percentage, daily roll call audit, and official leave application dispatch.
          </p>
        </div>

        <button
          onClick={() => setIsLeaveModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all self-start"
        >
          <FileText className="w-4 h-4" />
          <span>Apply for Excused Leave</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Attendance Score"
          value="96.4%"
          subtitle="27 / 28 Days Verified"
          change="Eligible for Board Exams (>75% required)"
          changeType="positive"
          icon={Activity}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Total Days Present"
          value="27 Days"
          subtitle="0 Late Punch-ins"
          icon={CheckCircle2}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Excused / Unexcused"
          value="1 Day"
          subtitle="Leave Note Approved"
          icon={Calendar}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Main Grid: Calendar Heatmap & Leave Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Daily Calendar Logs */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              August 2026 Daily Roll Call History
            </h3>
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
              96.4% Good Standing
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {daysHistory.map((d, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl text-center text-xs font-bold border transition-colors ${
                  d.status === 'PRESENT'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <span className="text-[10px] text-slate-400 block font-normal">Day {i + 1}</span>
                <span className="text-sm font-mono">{d.status === 'PRESENT' ? 'P' : 'A'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Leave History */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
            My Submitted Leave Applications
          </h3>

          <div className="space-y-3">
            {leaveHistory.map((l) => (
              <div key={l.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-600 font-semibold">
                    {l.startDate} → {l.endDate}
                  </span>
                  <Badge variant={l.status === 'APPROVED' ? 'success' : 'warning'} size="sm">
                    {l.status}
                  </Badge>
                </div>
                <p className="text-slate-800 font-medium">{l.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leave Application Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Apply for Excused Leave of Absence"
        subtitle={`Request submitted to Grade 10-A Class Teacher`}
        maxWidth="lg"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Leave Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Leave End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Absence *</label>
            <textarea
              required
              rows={3}
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="e.g. Attending National Science Olympiad training workshop..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30 flex items-center space-x-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Submit Leave Request</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
