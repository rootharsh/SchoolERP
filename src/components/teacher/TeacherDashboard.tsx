import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { erpDb } from '../../services/db';
import {
  ClipboardCheck,
  BookOpen,
  Clock,
  Award,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (tabId: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { currentSchool, currentUser } = useAuth();
  const { language, t } = useLanguage();

  const assignedClassId = 'class-10-a';
  const schoolClass = erpDb.getClassById(assignedClassId);
  const students = erpDb.getStudents(currentSchool.id, 'TEACHER', currentUser?.id || '', assignedClassId) || [];
  const homeworkList = erpDb.getHomework(currentSchool.id, assignedClassId) || [];
  const timetable = erpDb.getTimetable(currentSchool.id, assignedClassId) || [];
  const todayAttendance = erpDb.getStudentAttendance(currentSchool.id, assignedClassId, '2026-08-20') || [];

  const presentCount = (todayAttendance || []).filter((a) => a.status === 'PRESENT').length || 29;
  const totalCount = students.length || 30;

  return (
    <div className="space-y-6">
      {/* Faculty Profile & Class Teacher Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-emerald-800 border-2 border-emerald-500 flex items-center justify-center text-xl font-bold text-white shrink-0">
            {currentUser?.full_name?.charAt(0) || 'H'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">
                {currentUser?.full_name || 'Hiteshbhai Joshi'}
              </h1>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded">
                {language === 'gu' ? 'વર્ગ શિક્ષક ઇન્ચાર્જ' : 'Class Teacher In-Charge'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'gu' ? 'સોંપેલ વર્ગ: ' : 'Assigned Class: '}
              <strong className="text-white">{schoolClass?.name || 'Class 10th-A'}</strong> (રૂમ નં. ૧૨) • 
              {language === 'gu' ? ' કુલ વિદ્યાર્થી: ' : ' Total Students: '}
              <strong className="text-white">{totalCount}</strong>
            </p>
            <p className="text-xs text-slate-400">
              {language === 'gu' ? 'વિષય: ગણિત અને વિજ્ઞાન • ' : 'Department: Mathematics & Science • '}
              {language === 'gu' && currentSchool.gujarati_name ? currentSchool.gujarati_name.split(' (')[0] : currentSchool.name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('attendance')}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>{t('mark_attendance', 'Daily Attendance')}</span>
          </button>
          <button
            onClick={() => onNavigate('homework')}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>{t('nav_homework', 'Homework Diary')}</span>
          </button>
        </div>
      </div>

      {/* 4 Standard Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Class Attendance */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{language === 'gu' ? 'વર્ગ ૧૦-અ હાજરી પત્રક' : 'Class 10th-A Roll Call'}</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {language === 'gu' ? 'આજે નોંધાયેલ' : 'Marked Today'}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {presentCount} / {totalCount} {language === 'gu' ? 'હાજર' : 'Present'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {language === 'gu' ? '૧ ગેરહાજર (રોલ #૧૮)' : '1 Absent (Roll #18 Priya)'}
          </div>
          <button
            onClick={() => onNavigate('attendance')}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center space-x-1 cursor-pointer"
          >
            <span>{language === 'gu' ? 'હાજરી પત્રક ખોલો' : 'Open Register'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 2: Today's Periods */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{language === 'gu' ? 'આજના તાસ (પીરિયડ)' : "Today's Teaching Load"}</span>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {language === 'gu' ? '૪ તાસ' : '4 Periods'}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {language === 'gu' ? '૧, ૩, ૫, ૭ તાસ' : 'Period 1, 3, 5, 7'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {language === 'gu' ? 'આગામી: તાસ ૩ (ધોરણ ૯-બ ગણિત)' : 'Next: Period 3 (Class 9-B Maths)'}
          </div>
          <button
            onClick={() => onNavigate('schedule')}
            className="mt-3 text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center space-x-1 cursor-pointer"
          >
            <span>{language === 'gu' ? 'સમયપત્રક જુઓ' : 'Full Schedule'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 3: Active Homework */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{language === 'gu' ? 'દૈનિક ગૃહકાર્ય (હોમવર્ક)' : 'Homework Diary'}</span>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {homeworkList.length} {language === 'gu' ? 'સક્રિય' : 'Active'}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {homeworkList.length} {language === 'gu' ? 'વિષયો' : 'Tasks'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {language === 'gu' ? 'આવતીકાલે સવારે ચકાસણી' : 'Submissions due by tomorrow morning'}
          </div>
          <button
            onClick={() => onNavigate('homework')}
            className="mt-3 text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center space-x-1 cursor-pointer"
          >
            <span>{language === 'gu' ? 'હોમવર્ક ડાયરી' : 'Manage Diary'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 4: Ekam Kasoti Marks */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{language === 'gu' ? 'એકમ કસોટી ગુણ પત્રક' : 'Ekam Kasoti Marks'}</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {language === 'gu' ? 'GSEB PAT-૧' : 'PAT-1 Ready'}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {language === 'gu' ? 'ગુણ ભરાઈ ગયા' : 'All Marks Logged'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {language === 'gu' ? 'વર્ગ સરેરાશ: ૮૯%' : 'Class Average: 89% (A Grade)'}
          </div>
          <button
            onClick={() => onNavigate('gradebook')}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center space-x-1 cursor-pointer"
          >
            <span>{language === 'gu' ? 'ગુણ પત્રક ખોલો' : 'Gradebook'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Homework Stream & Daily Period Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Today's Homework Entries */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {language === 'gu' ? 'વર્ગ ૧૦-અ દૈનિક ગૃહકાર્ય ડાયરી' : 'Class 10th-A Active Homework Diary'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'gu' ? 'વાલીઓને પોર્ટલ દ્વારા પહોંચાડેલ ગૃહકાર્ય' : 'Daily homework assignments broadcast to students and parents'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('homework')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              {language === 'gu' ? '+ નવું ગૃહકાર્ય' : '+ Assign Homework'}
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {homeworkList.map((hw) => (
              <div key={hw.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {hw.subject}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {language === 'gu' ? 'જમા તારીખ:' : 'Due Date:'} {hw.due_date}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900">{hw.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{hw.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Today's Period Timetable */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  {language === 'gu' ? 'આજનું દૈનિક સમયપત્રક' : "Today's Teaching Schedule"}
                </h2>
              </div>
              <span className="text-xs font-mono font-medium text-slate-500">
                {language === 'gu' ? 'ગુરુવાર' : 'Thursday'}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {[
                { period: 1, time: '07:30 - 08:15 AM', subject: 'Mathematics (ગણિત)', class: 'Class 10th-A', room: 'Room 12', status: 'COMPLETED' },
                { period: 2, time: '08:15 - 09:00 AM', subject: 'Science (વિજ્ઞાન)', class: 'Class 9th-A', room: 'Lab 2', status: 'COMPLETED' },
                { period: 3, time: '09:15 - 10:00 AM', subject: 'Mathematics (ગણિત)', class: 'Class 10th-B', room: 'Room 14', status: 'UPCOMING' },
                { period: 4, time: '10:00 - 10:45 AM', subject: 'Science Practical', class: 'Class 10th-A', room: 'Science Lab', status: 'UPCOMING' },
              ].map((slot) => (
                <div
                  key={slot.period}
                  className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                    slot.status === 'COMPLETED'
                      ? 'bg-slate-50 border-slate-200 text-slate-500'
                      : 'bg-emerald-50/50 border-emerald-200 text-slate-900 font-semibold'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center space-x-2">
                      <span>{language === 'gu' ? `તાસ ${slot.period}: ` : `Period ${slot.period}: `}{slot.subject}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {slot.class} • {slot.room} • {slot.time}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      slot.status === 'COMPLETED'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {slot.status === 'COMPLETED'
                      ? (language === 'gu' ? 'પૂર્ણ' : 'DONE')
                      : (language === 'gu' ? 'આગામી' : 'NEXT')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {language === 'gu' ? 'શાળા સમય: સવારે ૦૭:૩૦ થી બપોરે ૧૨:૩૦' : 'School Timing: 07:30 AM to 12:30 PM'}
            </span>
            <button
              onClick={() => onNavigate('schedule')}
              className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              {language === 'gu' ? 'સંપૂર્ણ સમયપત્રક →' : 'Master Table →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
