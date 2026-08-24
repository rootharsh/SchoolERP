import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { erpDb } from '../../services/db';
import {
  Clock,
  BookOpen,
  Library,
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Check,
  ChevronRight,
  GraduationCap,
  AlertTriangle,
  Upload,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (tabId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { currentSchool, currentUser } = useAuth();
  const { language, t } = useLanguage();

  const student =
    erpDb.getStudentByUserId(currentUser?.id || '') ||
    erpDb.getStudents(currentSchool.id, 'STUDENT', currentUser?.id || '')[0] ||
    erpDb.getStudents(currentSchool.id, 'STUDENT', 'usr-student-harsh')[0];
  const classId = student ? student.class_id : 'class-10-a';
  const schoolClass = erpDb.getClassById(classId);

  const homeworkList = erpDb.getHomework(currentSchool.id, classId);
  const attendanceSummary = erpDb.getStudentAttendanceSummary(student?.id || 'stu-harsh-patel');
  const timetable = erpDb.getTimetable(currentSchool.id, classId);
  const libraryResources = erpDb.getLibraryResources(currentSchool.id);

  // Compute pending vs submitted homework with due status
  const homeworkDueItems = homeworkList.map((hw) => {
    const subs = erpDb.getHomeworkSubmissions(hw.id);
    const mySub = subs.find(s => s.student_id === student?.id || s.student_id === 'stu-harsh-patel');
    const isSubmitted = !!mySub;

    // Check due date proximity
    const today = new Date().toISOString().split('T')[0];
    const isDueToday = hw.submission_deadline === today;
    const isOverdue = hw.submission_deadline < today && !isSubmitted;

    return {
      ...hw,
      isSubmitted,
      submission: mySub,
      isDueToday,
      isOverdue,
      statusLabel: isSubmitted ? 'Submitted' : isOverdue ? 'Overdue' : isDueToday ? 'Due Today' : 'Due Soon'
    };
  });

  const pendingDueCount = homeworkDueItems.filter(h => !h.isSubmitted).length;

  return (
    <div className="space-y-6">
      {/* Student Profile Identity Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-emerald-800 border-2 border-emerald-400 flex items-center justify-center text-xl font-bold text-white shrink-0 font-heading">
              {student ? `${student.first_name[0]}` : 'H'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white font-heading">
                  {student?.gujarati_name || `${student?.first_name} ${student?.last_name}`}
                </h1>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded">
                  {language === 'gu' ? 'નિયમિત વિદ્યાર્થી' : 'Regular GSEB Pupil'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {schoolClass?.name || 'Class 10th-A'} • {t('roll_no', 'Roll No')}: <strong className="text-white">#{student?.roll_no || 14}</strong> • {t('gr_no', 'G.R. No')}: <span className="font-mono text-emerald-400 font-bold">{student?.gr_number || 'GR-4821'}</span>
              </p>
              <p className="text-xs text-slate-400">
                {language === 'gu' ? 'વર્ગ શિક્ષક: ' : 'Class Teacher: '}
                <strong className="text-slate-200">{schoolClass?.class_teacher_name || 'હિતેશભાઈ જોશી'}</strong> • {language === 'gu' ? 'સત્ર: ૨૦૨૬-૨૭ (GSEB)' : 'Academic Session: 2026-27 (GSEB)'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('homework')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <Clock className="w-4 h-4" />
              <span>{pendingDueCount} {language === 'gu' ? 'ગૃહકાર્ય બાકી' : 'Tasks Due'}</span>
            </button>
            <button
              onClick={() => onNavigate('report-card')}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              <Award className="w-4 h-4" />
              <span>{language === 'gu' ? 'ગુણ પત્રક' : 'Report Card'}</span>
            </button>
            <button
              onClick={() => onNavigate('library')}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Library className="w-4 h-4" />
              <span>{language === 'gu' ? 'GSEB પુસ્તકાલય' : 'e-Library'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Homework Due Action Box */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-900 font-heading">
                  {language === 'gu' ? 'બાકી રહેલ ગૃહકાર્ય અને જમા કરાવવાની સમયમર્યાદા (Homework Due Tracker)' : 'Homework Due & Upcoming Deadlines Tracker'}
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-mono">
                  {pendingDueCount} Pending
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {language === 'gu'
                  ? 'શિક્ષકો દ્વારા આપવામાં આવેલ હોમવર્ક સમયસર જમા કરાવી ગ્રેડ મેળવો.'
                  : 'Submit assigned exercises and project work before the submission deadline to secure A1 grades.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('homework')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center space-x-1.5 shrink-0"
          >
            <span>{language === 'gu' ? 'તમામ હોમવર્ક જુઓ અને જમા કરો' : 'Open Homework Desk'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Due Items Mini-Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {homeworkDueItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('homework')}
              className={`p-3.5 rounded-xl border bg-white shadow-xs cursor-pointer transition-all hover:border-amber-400 hover:shadow-sm space-y-2 ${
                item.isSubmitted
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : item.isDueToday
                  ? 'border-rose-300 ring-2 ring-rose-500/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  {item.subject}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.isSubmitted
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.isDueToday
                      ? 'bg-rose-100 text-rose-800 animate-pulse'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.isSubmitted ? '✓ Submitted' : `⏰ Due: ${item.submission_deadline}`}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{item.description}</p>

              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>By: {item.teacher_name || 'Subject Teacher'}</span>
                <span className="text-amber-700 font-bold hover:underline inline-flex items-center space-x-0.5">
                  <span>{item.isSubmitted ? 'View Submission' : 'Submit Now'}</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Standard Academic Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Attendance */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{language === 'gu' ? 'હાજરી સ્થિતિ' : 'Attendance Record'}</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              GSEB &gt;75% OK
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-heading">{attendanceSummary.percentage}%</div>
          <div className="text-xs text-slate-500 mt-1">
            {attendanceSummary.presentDays} of {attendanceSummary.totalDays} {language === 'gu' ? 'શૈક્ષણિક દિવસો હાજર' : 'days present'}
          </div>
          <button
            onClick={() => onNavigate('attendance')}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center space-x-1 cursor-pointer"
          >
            <span>{language === 'gu' ? 'માસિક હાજરી' : 'Monthly Register'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 2: Academic Grade */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{language === 'gu' ? 'એકમ કસોટી-૧ પરિણામ' : 'Ekam Kasoti - 1'}</span>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {language === 'gu' ? 'ગ્રેડ A1' : 'Grade A1'}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-heading">96.0%</div>
          <div className="text-xs text-slate-500 mt-1">
            {language === 'gu' ? 'કુલ ૧૫૦ માંથી ૧૪૪ • વર્ગ ક્રમ #૧' : '144 / 150 Total • Class Rank #1'}
          </div>
          <button
            onClick={() => onNavigate('report-card')}
            className="mt-3 text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center space-x-1 cursor-pointer"
          >
            <span>{language === 'gu' ? 'વિષયવાર ગુણ જુઓ' : 'View Breakdown'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 3: Homework Diary */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{language === 'gu' ? 'કુલ ગૃહકાર્ય' : 'Assigned Homework'}</span>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {homeworkList.length} Tasks
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-heading">{homeworkList.length} Exercises</div>
          <div className="text-xs text-slate-500 mt-1">
            {language === 'gu' ? 'ગણિત, વિજ્ઞાન, ગુજરાતી, અંગ્રેજી સ્વાધ્યાય' : 'Maths, Science, Gujarati, English exercises'}
          </div>
          <button
            onClick={() => onNavigate('homework')}
            className="mt-3 text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center space-x-1 cursor-pointer"
          >
            <span>{language === 'gu' ? 'ડાયરી ખોલો' : 'View Homework'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 4: Library Resources */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{language === 'gu' ? 'GSEB ડિજિટલ પુસ્તકાલય' : 'GSEB e-Textbooks'}</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {language === 'gu' ? 'ગુજરાત પાઠ્યપુસ્તક' : 'GCERT Ready'}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-heading">
            {libraryResources.length} {language === 'gu' ? 'પુસ્તકો' : 'Books'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {language === 'gu' ? 'ધોરણ ૧૦ ના તમામ વિષયોના પાઠ્યપુસ્તકો' : 'Class 10 Textbooks & Question Banks'}
          </div>
          <button
            onClick={() => onNavigate('library')}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center space-x-1 cursor-pointer"
          >
            <span>{language === 'gu' ? 'વાંચન શરૂ કરો' : 'Browse Library'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Today's Homework & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Homework List */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 font-heading">
                {language === 'gu' ? 'આજનું દૈનિક ગૃહકાર્ય (હોમવર્ક)' : 'Active Homework & Study Assignments'}
              </h2>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {language === 'gu' ? 'આવતીકાલે તપાસણી' : 'Due tomorrow'}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {homeworkList.map((hw) => (
              <div key={hw.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {hw.subject}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {language === 'gu' ? 'તારીખ:' : 'Date:'} {hw.assigned_date}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900">{hw.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{hw.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Today's Periods */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 font-heading">
                  {language === 'gu' ? 'આજનું તાસ સમયપત્રક' : "Today's Periods"}
                </h2>
              </div>
              <span className="text-xs font-mono font-medium text-slate-500">
                {language === 'gu' ? 'ગુરુવાર' : 'Thursday'}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {[
                { period: 1, time: '07:30 - 08:15', subject: 'Mathematics (ગણિત)', room: 'Room 12', teacher: 'Hiteshbhai Joshi' },
                { period: 2, time: '08:15 - 09:00', subject: 'Science (વિજ્ઞાન)', room: 'Science Lab', teacher: 'Prakashbhai Trivedi' },
                { period: 3, time: '09:15 - 10:00', subject: 'Social Science (સામાજિક વિજ્ઞાન)', room: 'Room 12', teacher: 'Rekhaben Dave' },
                { period: 4, time: '10:00 - 10:45', subject: 'Gujarati (ગુજરાતી પ્રથમ ભાષા)', room: 'Room 12', teacher: 'Sanjaybhai Raval' },
              ].map((slot) => (
                <div key={slot.period} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">
                      {language === 'gu' ? `તાસ ${slot.period}: ` : `Period ${slot.period}: `}{slot.subject}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {slot.room} • {slot.teacher}
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-slate-600">{slot.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {language === 'gu' ? 'પ્રાર્થના સભા: સવારે ૦૭:૧૫ વાગ્યે' : 'Assembly at 07:15 AM'}
            </span>
            <button
              onClick={() => onNavigate('timetable')}
              className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              {language === 'gu' ? 'સમગ્ર સપ્તાહ →' : 'Full Timetable →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
