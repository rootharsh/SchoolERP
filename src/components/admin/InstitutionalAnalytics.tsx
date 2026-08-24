import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { erpDb } from '../../services/db';
import { StatCard } from '../common/UIComponents';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  DollarSign,
  PieChart,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';

export const InstitutionalAnalytics: React.FC = () => {
  const { currentSchool, currentUser } = useAuth();

  const students = erpDb.getStudents(currentSchool.id, 'PRINCIPAL', currentUser?.id || '');
  const classes = erpDb.getClasses(currentSchool.id);
  const feeTransactions = erpDb.getFeeTransactions(currentSchool.id, 'PRINCIPAL', currentUser?.id || '');

  const totalAssessed = feeTransactions.reduce((s, t) => s + t.total_amount, 0);
  const totalCollected = feeTransactions.reduce((s, t) => s + t.paid_amount, 0);

  const divisionPerformance = [
    { name: 'Class 10-A (Secondary - Guj Med)', attendance: 96.2, gpa: 3.84, feeClearance: 92 },
    { name: 'Class 10-B (Secondary - Eng Med)', attendance: 93.8, gpa: 3.65, feeClearance: 88 },
    { name: 'Class 9-A (Secondary General)', attendance: 95.1, gpa: 3.72, feeClearance: 95 },
    { name: 'Class 11-Science (Higher Sec Stream)', attendance: 97.5, gpa: 3.91, feeClearance: 98 },
    { name: 'Class 12-Commerce (Higher Sec Stream)', attendance: 94.2, gpa: 3.78, feeClearance: 94 },
  ];

  const subjectAverages = [
    { subject: 'Mathematics (ગણિત - Standard/Basic)', score: 86, color: 'bg-blue-600' },
    { subject: 'Science & Technology (વિજ્ઞાન અને ટેકનોલોજી)', score: 84, color: 'bg-emerald-600' },
    { subject: 'Social Science (સામાજિક વિજ્ઞાન)', score: 88, color: 'bg-purple-600' },
    { subject: 'Languages (Gujarati FL / English SL)', score: 91, color: 'bg-amber-600' },
    { subject: 'Computer Studies (કમ્પ્યુટર અધ્યયન)', score: 94, color: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>Institutional Analytics &amp; Academic Index</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive executive performance reports, cohort analytics, and fee velocity trends for {currentSchool.name}.
        </p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Institutional GPA Index"
          value="3.74 / 4.0"
          subtitle="Top 5% across state district"
          change="+0.18 vs last year"
          changeType="positive"
          icon={Award}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Average Attendance Rate"
          value="94.8%"
          subtitle="Cumulative daily biometric roll"
          change="Target: >90%"
          changeType="positive"
          icon={Users}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Revenue Realization"
          value={`${Math.round((totalCollected / (totalAssessed || 1)) * 100)}%`}
          subtitle={`₹${(totalCollected || 840000).toLocaleString('en-IN')} collected`}
          icon={DollarSign}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Student Retention Rate"
          value="99.2%"
          subtitle="Zero unexcused dropouts"
          change="Optimal"
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
      </div>

      {/* Cohort Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Division Performance &amp; Attendance Benchmark
          </h3>
          <span className="text-[11px] text-slate-500">Term 1 Assessment</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[580px] w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Academic Division</th>
                <th className="py-3 px-4">Attendance Rate</th>
                <th className="py-3 px-4">Average GPA</th>
                <th className="py-3 px-4">Fee Clearance</th>
                <th className="py-3 px-4">Performance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {divisionPerformance.map((div, i) => (
                <tr key={i} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-bold text-slate-900">{div.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-800">{div.attendance}%</span>
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${div.attendance}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">{div.gpa} / 4.0</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-700">{div.feeClearance}%</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Exemplary
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject-Wise Mastery Index */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Subject Mastery &amp; Exam Score Distribution
        </h3>

        <div className="space-y-3">
          {subjectAverages.map((sub, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">{sub.subject}</span>
                <span className="font-mono font-bold text-slate-900">{sub.score}% Class Average</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className={`${sub.color} h-2 rounded-full transition-all`} style={{ width: `${sub.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
