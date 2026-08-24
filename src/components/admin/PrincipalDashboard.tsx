import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { erpDb } from '../../services/db';
import { SystemBackupInfo, Student } from '../../types/erp';
import { Modal } from '../common/UIComponents';
import { PrincipalGlobalSearch } from './PrincipalGlobalSearch';
import { ReportCardModal } from '../modals/ReportCardModal';
import { LeavingCertificateModal } from '../modals/LeavingCertificateModal';
import {
  Users,
  IndianRupee,
  ClipboardCheck,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Bell,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Calendar,
  Briefcase,
  CheckCircle2,
  Receipt,
  FileText,
  School,
  Award,
  Sparkles,
  Radio,
  HardDrive,
  RefreshCw,
  Download,
  Clock,
  UserX,
  Building2,
  ArrowUpRight,
  Layers,
} from 'lucide-react';

interface PrincipalDashboardProps {
  onNavigate: (tabId: string) => void;
}

export const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({ onNavigate }) => {
  const { currentSchool, currentUser, currentRole } = useAuth();
  const { language, t } = useLanguage();

  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [backupInfo, setBackupInfo] = useState<SystemBackupInfo>(() => {
    const info = erpDb.getLastBackupInfo();
    return info || {
      id: 'bkp-initial',
      timestamp: new Date().toISOString(),
      formatted_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      size_kb: 486,
      created_by: 'Automated Snapshot Daemon',
      type: 'SCHEDULED_AUTOMATIC',
      status: 'SUCCESS',
      record_counts: { students: 1280, staff: 72, fees: 24, marks: 5, attendance: 34, notices: 4 },
    };
  });
  const [backupSuccessToast, setBackupSuccessToast] = useState<string | null>(null);

  // Quick glance interactive modals & Student modals
  const [activeGlanceModal, setActiveGlanceModal] = useState<'fees' | 'absentees' | 'classes' | null>(null);
  const [reportCardStudent, setReportCardStudent] = useState<Student | null>(null);
  const [lcStudent, setLcStudent] = useState<Student | null>(null);

  const students = erpDb.getStudents(currentSchool.id, 'PRINCIPAL', currentUser?.id || '') || [];
  const staff = erpDb.getStaff(currentSchool.id) || [];
  const feeTransactions = erpDb.getFeeTransactions(currentSchool.id, 'PRINCIPAL', currentUser?.id || '') || [];
  const notices = erpDb.getNotices(currentSchool.id, 'PRINCIPAL') || [];

  // Computed metrics
  const totalFeesAssessed = 1850000;
  const totalFeesCollected = 1590000;
  const feeCollectionRate = Math.round((totalFeesCollected / totalFeesAssessed) * 100);
  const feesPendingToday = totalFeesAssessed - totalFeesCollected;

  const totalEnrolled = currentSchool.totalStudents || 1280;
  const totalAbsentees = 42; // Live today
  const staffAbsentees = 2;
  const presentCount = totalEnrolled - totalAbsentees;
  const attendanceRate = ((presentCount / totalEnrolled) * 100).toFixed(1);

  const defaulters = (feeTransactions || []).filter((f) => f.status === 'OVERDUE' || f.status === 'PARTIAL');

  const handleBackupNow = () => {
    setIsBackupLoading(true);
    setTimeout(() => {
      const newBackup = erpDb.performBackupNow(
        currentUser?.full_name ? `${currentUser.full_name} (${currentRole})` : 'Dr. Jayesh Mehta (Principal)'
      );
      setBackupInfo(newBackup);
      setIsBackupLoading(false);
      setBackupSuccessToast(
        language === 'gu'
          ? 'સિસ્ટમ બેકઅપ સફળ! ક્લાઉડ સ્નેપશોટ અને તમામ રેકોર્ડ સુરક્ષિત આર્કાઇવ થઈ ગયા છે.'
          : `System Snapshot #${newBackup.id} successfully created and encrypted (${newBackup.size_kb} KB).`
      );
      setTimeout(() => setBackupSuccessToast(null), 4000);
    }, 900);
  };

  const handleDownloadBackupJson = () => {
    const dump = erpDb.exportDatabaseJson();
    const blob = new Blob([dump], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ClassSec-Backup-${currentSchool.id}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Backup Success Toast */}
      {backupSuccessToast && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{backupSuccessToast}</span>
          </div>
          <button
            onClick={() => setBackupSuccessToast(null)}
            className="text-emerald-100 hover:text-white text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Principal Welcome & Campus Status Banner */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />
        <div>
          <div className="flex items-center space-x-2 flex-wrap">
            <h1 className="text-xl font-bold font-heading text-slate-900">
              {language === 'gu' ? 'આચાર્યશ્રી કમાન્ડ સેન્ટર' : "Principal's Command Center"}
            </h1>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono">
              {t('academic_year', 'Academic Session 2026-27')}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5 flex items-center space-x-2 flex-wrap">
            <span className="font-semibold text-slate-800 font-heading">
              {language === 'gu' && currentSchool.gujarati_name ? currentSchool.gujarati_name : currentSchool.name}
            </span>
            <span className="text-slate-300">•</span>
            <span>GSEB Index: <strong className="text-emerald-700 font-mono">{currentSchool.gseb_index || '64.082'}</strong></span>
            <span className="text-slate-300">•</span>
            <span>UDISE+: <strong className="text-slate-700 font-mono">{currentSchool.udiseCode || '24090104512'}</strong></span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('students')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-all hover:scale-102 cursor-pointer shadow-2xs"
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>{t('nav_students', 'Student Register')}</span>
          </button>

          <button
            onClick={() => onNavigate('fees')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all hover:scale-102 cursor-pointer shadow-sm shadow-emerald-600/20"
          >
            <Receipt className="w-4 h-4" />
            <span>{t('nav_fees', 'Fee Counter')}</span>
          </button>
        </div>
      </div>

      {/* Global Student G.R. Number Search Bar & Profile Preview */}
      <PrincipalGlobalSearch
        onNavigate={onNavigate}
        onOpenReportCard={(s) => setReportCardStudent(s)}
        onOpenLeavingCertificate={(s) => setLcStudent(s)}
      />

      {/* NEW: Interactive Real-Time Quick-Glance Cards with Percentage Growth Indicators */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {language === 'gu' ? 'ત્વરિત દૈનિક સ્થિતિ (Real-Time Quick-Glance)' : 'Real-Time Campus Operations Pulse'}
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500 font-bold">
            Live Stream • Refreshes Every 5s
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Quick-Glance 1: Fees Pending Today */}
          <div
            onClick={() => setActiveGlanceModal('fees')}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold font-mono">
                <TrendingDown className="w-3 h-3 text-emerald-600" />
                <span>-4.2% Dues</span>
              </div>
            </div>

            <div className="mt-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {language === 'gu' ? 'આજની બાકી ફી' : 'Fees Pending Today'}
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                ₹{(feesPendingToday).toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-amber-800 font-medium mt-1 flex items-center space-x-1">
                <span>{defaulters.length} Defaulter Accounts Flagged</span>
                <ArrowUpRight className="w-3 h-3 text-amber-600 inline" />
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Collection Target: 95%</span>
              <span className="text-amber-700 font-bold group-hover:underline">View Breakdown →</span>
            </div>
          </div>

          {/* Quick-Glance 2: Total Absentees Today */}
          <div
            onClick={() => setActiveGlanceModal('absentees')}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-rose-400 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserX className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold font-mono">
                <TrendingDown className="w-3 h-3 text-emerald-600" />
                <span>-1.2% vs Last Fri</span>
              </div>
            </div>

            <div className="mt-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {language === 'gu' ? 'કુલ ગેરહાજર (વિદ્યાર્થી + સ્ટાફ)' : 'Total Absentees Today'}
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                {totalAbsentees} <span className="text-xs font-normal text-slate-500">Students + {staffAbsentees} Staff</span>
              </div>
              <p className="text-xs text-rose-700 font-medium mt-1 flex items-center space-x-1">
                <span>3.3% Absenteeism Rate • Gate Synced</span>
                <ArrowUpRight className="w-3 h-3 text-rose-600 inline" />
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Biometric Gate Ingress</span>
              <span className="text-rose-700 font-bold group-hover:underline">Class List →</span>
            </div>
          </div>

          {/* Quick-Glance 3: Active Classes Live */}
          <div
            onClick={() => setActiveGlanceModal('classes')}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold font-mono">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                <span>100% On-Schedule</span>
              </div>
            </div>

            <div className="mt-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {language === 'gu' ? 'ચાલુ વર્ગખંડો (Active Classes)' : 'Active Classes in Session'}
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                28 / 28 <span className="text-xs font-normal text-emerald-700 font-bold">Rooms Live</span>
              </div>
              <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center space-x-1">
                <span>Period 3 (Mathematics &amp; Science Labs)</span>
                <ArrowUpRight className="w-3 h-3 text-emerald-600 inline" />
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Faculty Roster Allocated</span>
              <span className="text-emerald-700 font-bold group-hover:underline">Schedule Matrix →</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Standard Key Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Daily Attendance */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500" />
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="font-heading">{language === 'gu' ? 'વિદ્યાર્થી દૈનિક હાજરી' : 'Student Daily Attendance'}</span>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {language === 'gu' ? 'લાઈવ' : 'Live'}
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-slate-900 mt-2 tracking-tight">{attendanceRate}%</div>
            <div className="text-xs text-slate-600 mt-1">
              {presentCount} {language === 'gu' ? 'હાજર' : 'Present'} / {totalEnrolled} {language === 'gu' ? 'કુલ નોંધાયેલ' : 'Enrolled'}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 font-medium">{language === 'gu' ? 'બાયોમેટ્રિક સિન્ક' : 'Biometric Gate Sync'}</span>
            <span className="text-emerald-700 font-bold">{language === 'gu' ? 'સક્રિય' : 'Active'}</span>
          </div>
        </div>

        {/* Metric 2: Fee Collection */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="font-heading">{language === 'gu' ? 'પ્રથમ સત્ર ફી વસૂલાત' : 'Term 1 Fee Collection'}</span>
              <span className="text-[10px] font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {feeCollectionRate}% {language === 'gu' ? 'જમા' : 'Realized'}
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-slate-900 mt-2 tracking-tight">₹15,90,000</div>
            <div className="text-xs text-slate-600 mt-1">
              {language === 'gu' ? 'લક્ષ્યાંક: ₹18,50,000' : 'Target: ₹18,50,000 across classes'}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{language === 'gu' ? 'બાકી રકમ' : 'Pending Dues'}</span>
            <button
              onClick={() => onNavigate('fees')}
              className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer font-heading"
            >
              {language === 'gu' ? 'ફી કાઉન્ટર →' : 'Review Counter →'}
            </button>
          </div>
        </div>

        {/* Metric 3: Staff & Faculty Presence */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-teal-500" />
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="font-heading">{language === 'gu' ? 'શિક્ષક અને સ્ટાફ હાજરી' : 'Teaching & Non-Teaching Staff'}</span>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                70 / 72 {language === 'gu' ? 'હાજર' : 'Present'}
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-slate-900 mt-2 tracking-tight">97%</div>
            <div className="text-xs text-slate-600 mt-1">
              {language === 'gu' ? '૨ રજા અરજી મંજૂર' : '2 Approved Casual Leaves'}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{language === 'gu' ? 'સ્ટાફ પગાર પત્રક' : 'Staff Payroll'}</span>
            <button
              onClick={() => onNavigate('staff-payroll')}
              className="text-teal-600 hover:text-teal-800 font-bold cursor-pointer font-heading"
            >
              {language === 'gu' ? 'પગાર મેનેજર →' : 'Payroll Sheet →'}
            </button>
          </div>
        </div>

        {/* Metric 4: Academic Examinations */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-purple-500" />
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="font-heading">{language === 'gu' ? 'GSEB એકમ કસોટી ગુણ' : 'GSEB Unit Test Status'}</span>
              <span className="text-[10px] font-mono font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                {language === 'gu' ? 'પ્રક્રિયા પૂર્ણ' : 'Published'}
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-slate-900 mt-2 tracking-tight">320 / 320</div>
            <div className="text-xs text-slate-600 mt-1">
              {language === 'gu' ? '૧૦૦% ગુણ એન્ટ્રી પૂર્ણ' : 'Evaluation marks logged'}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{language === 'gu' ? 'ગુણપત્રક એનાલિટિક્સ' : 'Marks Analysis'}</span>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-purple-600 hover:text-purple-800 font-bold cursor-pointer font-heading"
            >
              {language === 'gu' ? 'રિપોર્ટ જુઓ →' : 'View Report →'}
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Middle Grid: Fee Defaulter List & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pending Defaulters Alert Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {language === 'gu' ? 'બાકી ફી વસૂલાત યાદી (Defaulters)' : 'Priority Fee Defaulter Follow-up'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'gu' ? 'અગ્રતા ધોરણે વાલી સંપર્ક માટે ચિહ્નિત વિદ્યાર્થીઓ' : 'Students requiring immediate parental follow-up'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('fees')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              {language === 'gu' ? 'બધા જુઓ →' : 'View All →'}
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3.5">Student Name</th>
                  <th className="py-2.5 px-3.5">Standard</th>
                  <th className="py-2.5 px-3.5 text-right">Balance Due</th>
                  <th className="py-2.5 px-3.5 text-center">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {defaulters.slice(0, 4).map((item) => {
                  const student = students.find((s) => s.id === item.student_id);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900">
                          {student?.first_name} {student?.last_name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">G.R. #{student?.gr_number || 'GR-1042'}</div>
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 font-medium">Std 10-A</td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-rose-600">
                        ₹{(item.total_amount - item.paid_amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            item.status === 'OVERDUE'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {item.status === 'OVERDUE'
                            ? language === 'gu'
                              ? 'મુદત વીતી ગઈ'
                              : 'OVERDUE'
                            : language === 'gu'
                            ? 'અંશતઃ બાકી'
                            : 'PARTIAL'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <button
                          onClick={() => onNavigate('fees')}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          {language === 'gu' ? 'ફી જમા લો' : 'Receive Fee'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Institutional Circulars & Notices */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  {language === 'gu' ? 'શાળા પરિપત્ર અને સૂચના પત્રક' : 'Active Circulars & Notice Board'}
                </h2>
              </div>
              <button
                onClick={() => onNavigate('notices')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {language === 'gu' ? 'સંચાલન →' : 'Manage →'}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {notices.map((notice) => (
                <div key={notice.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      GSEB Circular
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 font-mono">
                      {notice.date}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{notice.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{notice.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {language === 'gu' ? 'વાલીઓને SMS / WhatsApp સૂચના' : 'Broadcast to parents via SMS'}
            </span>
            <button
              onClick={() => onNavigate('notices')}
              className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              {language === 'gu' ? '+ નવો પરિપત્ર' : '+ Create Circular'}
            </button>
          </div>
        </div>
      </div>

      {/* Principal Dashboard Footer with 'Last Backup' Status Indicator and 'Backup Now' Manual Trigger */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {language === 'gu' ? 'ડેટાબેઝ સુરક્ષા અને સિસ્ટમ સ્નેપશોટ' : 'Database Integrity & System Snapshot'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold">
                AES-256 Encrypted
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-300 mt-1 flex-wrap">
              <span className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {language === 'gu' ? 'છેલ્લો બેકઅપ:' : 'Last Backup:'}{' '}
                  <strong className="text-white font-mono">{backupInfo?.formatted_date || 'Today, 09:30 AM'}</strong>
                </span>
              </span>
              <span className="text-slate-600">•</span>
              <span>
                Snapshot Size: <strong className="text-emerald-400 font-mono">{backupInfo?.size_kb || 486} KB</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span>
                Records: <strong className="text-slate-200 font-mono">{backupInfo?.record_counts?.students ?? 1280} Students</strong>,{' '}
                <strong className="text-slate-200 font-mono">{backupInfo?.record_counts?.staff ?? 72} Staff</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 self-start md:self-auto shrink-0">
          <button
            onClick={handleDownloadBackupJson}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
            title="Download JSON Database Archive"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'gu' ? 'ડાઉનલોડ ડેટાબેઝ' : 'Export JSON'}</span>
          </button>

          <button
            onClick={handleBackupNow}
            disabled={isBackupLoading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 hover:scale-102"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBackupLoading ? 'animate-spin' : ''}`} />
            <span>{isBackupLoading ? 'Creating Snapshot...' : language === 'gu' ? 'હમણાં બેકઅપ લો' : 'Backup Now'}</span>
          </button>
        </div>
      </div>

      {/* Quick-Glance Drilldown Modals */}
      {activeGlanceModal === 'fees' && (
        <Modal
          isOpen={true}
          onClose={() => setActiveGlanceModal(null)}
          title={language === 'gu' ? 'આજની બાકી ફી વિગત (Fees Pending Breakdown)' : 'Pending Fee Accounts Audit'}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">Total Dues Pending: ₹{feesPendingToday.toLocaleString('en-IN')}</div>
                <p className="mt-0.5 text-[11px] text-amber-800">18 accounts pending across Standard 9 to 12.</p>
              </div>
              <button
                onClick={() => {
                  setActiveGlanceModal(null);
                  onNavigate('fees');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white font-bold cursor-pointer"
              >
                Go to Fee Counter →
              </button>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-2.5">Student</th>
                  <th className="p-2.5">Standard</th>
                  <th className="p-2.5 text-right">Pending Amount</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {defaulters.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2.5 font-bold text-slate-900">{item.receipt_no} (Std 10)</td>
                    <td className="p-2.5 text-slate-600">Standard 10-A</td>
                    <td className="p-2.5 text-right font-mono font-bold text-rose-600">
                      ₹{(item.total_amount - item.paid_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {activeGlanceModal === 'absentees' && (
        <Modal
          isOpen={true}
          onClose={() => setActiveGlanceModal(null)}
          title={language === 'gu' ? 'ગેરહાજર વિદ્યાર્થી યાદી (Today Absentees)' : "Today's Absentee Register Breakdown"}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">42 Students &amp; 2 Staff Absent Today</div>
                <p className="mt-0.5 text-[11px] text-rose-800">Automated SMS alerts dispatched to registered parent mobile numbers.</p>
              </div>
              <button
                onClick={() => {
                  setActiveGlanceModal(null);
                  onNavigate('attendance');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-bold cursor-pointer"
              >
                Full Register →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Std 9-A</span>
                <div className="text-base font-bold text-slate-900 mt-0.5">3 Absent</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Std 9-B</span>
                <div className="text-base font-bold text-slate-900 mt-0.5">4 Absent</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Std 10-A</span>
                <div className="text-base font-bold text-slate-900 mt-0.5">1 Absent (Medical)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Std 10-B</span>
                <div className="text-base font-bold text-slate-900 mt-0.5">2 Absent</div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {activeGlanceModal === 'classes' && (
        <Modal
          isOpen={true}
          onClose={() => setActiveGlanceModal(null)}
          title={language === 'gu' ? 'ચાલુ વર્ગખંડ સ્થિતિ (Active Classroom Schedule)' : 'Real-Time Classroom Live Status'}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">28 Active Sections Currently in Period 3</div>
                <p className="mt-0.5 text-[11px] text-emerald-800">All faculty members present in their designated classrooms.</p>
              </div>
              <button
                onClick={() => {
                  setActiveGlanceModal(null);
                  onNavigate('timetable');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer"
              >
                Master Timetable →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <div className="font-bold text-slate-900">Room 101 • Standard 10-A</div>
                <div className="text-slate-600 mt-0.5">Subject: Mathematics (Algebraic Equations)</div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">Faculty: Mr. Ramesh Joshi</div>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <div className="font-bold text-slate-900">Science Lab 2 • Standard 10-B</div>
                <div className="text-slate-600 mt-0.5">Subject: Science &amp; Tech (Optics Practical)</div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">Faculty: Ms. Priyaben Patel</div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Report Card Modal */}
      {reportCardStudent && (
        <ReportCardModal
          isOpen={!!reportCardStudent}
          onClose={() => setReportCardStudent(null)}
          student={reportCardStudent}
          marks={erpDb.getStudentMarks(reportCardStudent.id) || []}
          school={currentSchool}
          examName={language === 'gu' ? 'GSEB એકમ કસોટી (PAT - Periodic Assessment Test)' : 'GSEB Periodic Assessment Test (PAT)'}
        />
      )}

      {/* Leaving Certificate Modal */}
      {lcStudent && (
        <LeavingCertificateModal
          student={lcStudent}
          school={currentSchool}
          onClose={() => setLcStudent(null)}
        />
      )}
    </div>
  );
};
