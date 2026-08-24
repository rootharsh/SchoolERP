import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { erpDb } from '../../services/db';
import {
  Users,
  IndianRupee,
  BookOpen,
  Award,
  Phone,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  Calendar,
  Bus,
  ChevronRight,
  Receipt,
  GraduationCap,
} from 'lucide-react';

interface ParentDashboardProps {
  onNavigate: (tabId: string) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate }) => {
  const { currentSchool, currentUser } = useAuth();
  const { language, t } = useLanguage();

  const student = erpDb.getStudentByUserId('usr-student-harsh');
  const classId = student ? student.class_id : 'class-10-a';
  const schoolClass = erpDb.getClassById(classId);

  const homework = erpDb.getHomework(currentSchool.id, classId);
  const feeTransactions = erpDb.getFeeTransactions(currentSchool.id, 'PARENT', currentUser?.id || 'usr-parent-vinod');
  const attendanceSummary = erpDb.getStudentAttendanceSummary(student?.id || 'stu-harsh-patel');
  const notices = erpDb.getNotices(currentSchool.id, 'PARENT');

  const paidFee = feeTransactions.find((f) => f.status === 'PAID');

  return (
    <div className="space-y-6">
      {/* Child Dossier Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-amber-700 border-2 border-amber-500 flex items-center justify-center text-xl font-bold text-white shrink-0">
              {student?.first_name?.charAt(0) || 'H'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">
                  {student?.gujarati_name || `${student?.first_name} ${student?.last_name}`}
                </h1>
                <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded">
                  {language === 'gu' ? 'વિદ્યાર્થી પ્રોફાઇલ' : 'Ward / Child Dossier'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {schoolClass?.name || 'Class 10th-A'} • {t('roll_no', 'Roll No')}: <strong className="text-white">#{student?.roll_no || 14}</strong> • {t('gr_no', 'G.R. No')}: <span className="font-mono text-emerald-400 font-bold">{student?.gr_number || 'GR-4821'}</span>
              </p>
              <p className="text-xs text-slate-400">
                {language === 'gu' ? 'વર્ગ શિક્ષક: ' : 'Class Teacher: '}
                <strong className="text-slate-200">હિતેશભાઈ જોશી (Hiteshbhai Joshi)</strong> (+91 98251 33442)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('marksheets')}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Award className="w-4 h-4" />
              <span>{language === 'gu' ? 'એકમ કસોટી પરિણામ' : 'Ekam Kasoti Marks'}</span>
            </button>
            <button
              onClick={() => onNavigate('fees')}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>{language === 'gu' ? 'ફી પહોંચ' : 'Fee Receipts'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Standard Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Attendance */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{language === 'gu' ? 'દૈનિક હાજરી' : 'Daily Attendance'}</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {language === 'gu' ? 'આજે હાજર' : 'Present Today'}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{attendanceSummary.percentage}%</div>
          <div className="text-xs text-slate-500 mt-1">
            {language === 'gu' ? '૫૦ માંથી ૪૮ દિવસ હાજર' : '48 of 50 Working Days (07:30 AM)'}
          </div>
          <button
            onClick={() => onNavigate('attendance')}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center space-x-1 cursor-pointer"
          >
            <span>{language === 'gu' ? 'માસિક હાજરી જુઓ' : 'View Attendance'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 2: Academic Term Mark */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{language === 'gu' ? 'એકમ કસોટી-૧ (PAT)' : 'Ekam Kasoti - 1 (PAT)'}</span>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {language === 'gu' ? 'ક્રમ #૧ (A1 ગ્રેડ)' : 'Rank #1 (Grade A1)'}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">96.0%</div>
          <div className="text-xs text-slate-500 mt-1">
            {language === 'gu' ? '૧૫૦ માંથી ૧૪૪ ગુણ (GSEB)' : '144 / 150 Total Score (GSEB Matrix)'}
          </div>
          <button
            onClick={() => onNavigate('marksheets')}
            className="mt-3 text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center space-x-1 cursor-pointer"
          >
            <span>{language === 'gu' ? 'પ્રગતિ પત્રક જુઓ' : 'Progress Report Card'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 3: Fee Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{language === 'gu' ? 'સત્ર-૧ ફી સ્થિતિ' : 'Term 1 Fee Status'}</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {language === 'gu' ? 'સંપૂર્ણ ભરપાઈ' : 'Paid in Full'}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">₹12,500</div>
          <div className="text-xs text-slate-500 mt-1">
            Receipt: SVM/2026-27/REC-4821 (UPI)
          </div>
          <button
            onClick={() => onNavigate('fees')}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center space-x-1 cursor-pointer"
          >
            <span>{language === 'gu' ? 'પહોંચ ડાઉનલોડ કરો' : 'Download Receipt'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 4: School Bus & Van */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{language === 'gu' ? 'શાળા બસ / વાન સુવિધા' : 'School Van Transport'}</span>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Route #4
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {language === 'gu' ? 'વાન નં. ૦૪' : 'Van #04'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {language === 'gu' ? 'ડ્રાઇવર: રમેશભાઈ (+91 98259 44321)' : 'Driver: Rameshbhai (+91 98259 44321)'}
          </div>
          <button
            onClick={() => onNavigate('directory')}
            className="mt-3 text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center space-x-1 cursor-pointer"
          >
            <span>{language === 'gu' ? 'સંપર્ક નંબર જુઓ' : 'Driver Contact'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Homework Diary & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Daily Homework Stream */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {language === 'gu' ? 'આજનું દૈનિક ગૃહકાર્ય (હોમવર્ક ડાયરી)' : 'Daily Homework Diary'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'gu' ? 'શિક્ષક દ્વારા અપાયેલ સ્વાધ્યાય અને ગૃહકાર્ય' : 'Class teacher homework assignments'}
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500">
              {language === 'gu' ? 'ગુરુવાર' : 'Thursday'}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {homework.map((hw) => (
              <div key={hw.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {hw.subject}
                  </span>
                  <span className="text-[11px] font-semibold text-rose-600">
                    {language === 'gu' ? 'જમા તારીખ:' : 'Due:'} {hw.due_date}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900">{hw.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{hw.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: School Circulars */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900">
                {language === 'gu' ? 'શાળા પરિપત્ર અને નોટિસ' : 'School Notices & Circulars'}
              </h2>
              <button
                onClick={() => onNavigate('notices')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                {language === 'gu' ? 'બધા જુઓ →' : 'View All →'}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {notices.map((n) => (
                <div key={n.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Circular
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{n.date}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{n.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              {language === 'gu' && currentSchool.gujarati_name ? currentSchool.gujarati_name.split(' (')[0] : currentSchool.name}
            </span>
            <span>Helpline: {currentSchool.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
