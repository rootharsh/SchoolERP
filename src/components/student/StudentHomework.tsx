import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Homework, HomeworkSubmission } from '../../types/erp';
import { erpDb } from '../../services/db';
import { Badge, Modal } from '../common/UIComponents';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Paperclip,
  Upload,
  Award,
  Search,
  Filter,
  FileText,
  AlertTriangle,
  FileCheck,
  Sparkles,
  Calendar,
  UserCheck
} from 'lucide-react';

export const StudentHomework: React.FC = () => {
  const { currentSchool, currentUser, refreshData } = useAuth();
  const { language } = useLanguage();

  const student = erpDb.getStudentByUserId(currentUser?.id || 'usr-student-harsh');
  const classId = student ? student.class_id : 'class-10-a';

  const [filterTab, setFilterTab] = useState<'ALL' | 'DUE' | 'SUBMITTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHw, setSelectedHw] = useState<Homework | null>(null);
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const homeworkList = erpDb.getHomework(currentSchool.id, classId);

  const enrichedHomework = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return homeworkList.map((hw) => {
      const subs = erpDb.getHomeworkSubmissions(hw.id);
      const studentSub = subs.find((s) => s.student_id === student?.id || s.student_id === 'stu-harsh-patel' || s.student_id === 'std-alex');
      const isSubmitted = !!studentSub;
      const isDueToday = hw.submission_deadline === today;
      const isOverdue = hw.submission_deadline < today && !isSubmitted;

      return {
        ...hw,
        isSubmitted,
        studentSub,
        isDueToday,
        isOverdue,
      };
    });
  }, [homeworkList, student]);

  const filteredList = useMemo(() => {
    return enrichedHomework.filter((item) => {
      if (filterTab === 'DUE' && item.isSubmitted) return false;
      if (filterTab === 'SUBMITTED' && !item.isSubmitted) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [enrichedHomework, filterTab, searchQuery]);

  const pendingDueCount = enrichedHomework.filter((h) => !h.isSubmitted).length;

  const handleUploadSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHw || !student) return;

    const studentName = student.gujarati_name || `${student.first_name} ${student.last_name}`;

    erpDb.submitHomework({
      homework_id: selectedHw.id,
      student_id: student.id,
      student_name: studentName,
      status: 'SUBMITTED',
      attachment_name: submissionFileName || `${student.first_name}_${selectedHw.subject}_Solution.pdf`,
    });

    erpDb.logAudit({
      school_id: currentSchool.id,
      user_id: currentUser?.id || student.user_id,
      user_name: studentName,
      user_role: 'STUDENT',
      action: 'SUBMIT_HOMEWORK',
      resource_type: 'HOMEWORK',
      details: `Submitted solution file for assignment "${selectedHw.title}" (${selectedHw.subject})`,
      ip_address: '192.168.1.1',
    });

    setSelectedHw(null);
    setSubmissionFileName('');
    setSubmissionNotes('');
    setSubmissionSuccess(true);
    setTimeout(() => setSubmissionSuccess(false), 4000);
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2 font-heading">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <span>
              {language === 'gu'
                ? 'વિદ્યાર્થી દૈનિક ગૃહકાર્ય અને સોંપણી ડેસ્ક (Homework Due Tracker)'
                : 'Student Homework Assignments & Due Submission Desk'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'gu'
              ? 'બાકી ગૃહકાર્યની સમયમર્યાદા તપાસો, ઉકેલ અપલોડ કરો અને શિક્ષકનો પ્રતિભાવ ચકાસો.'
              : 'Track homework deadlines, submit coursework solutions before due dates, and view faculty grading.'}
          </p>
        </div>

        {/* Due summary tag */}
        <div className="flex items-center space-x-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold font-mono flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{pendingDueCount} {language === 'gu' ? 'બાકી ગૃહકાર્ય' : 'Tasks Pending'}</span>
          </div>
        </div>
      </div>

      {/* Submission Success Toast */}
      {submissionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white shadow-md flex items-center justify-between text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {language === 'gu'
                ? 'ગૃહકાર્ય સફળતાપૂર્વક અપલોડ થયું! શિક્ષક મૂલ્યાંકન માટે નોંધાયેલ છે.'
                : 'Homework solution uploaded successfully and marked for faculty review!'}
            </span>
          </div>
          <button onClick={() => setSubmissionSuccess(false)} className="text-white/80 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'gu' ? 'તમામ ગૃહકાર્ય' : 'All Assignments'} ({enrichedHomework.length})
          </button>
          <button
            onClick={() => setFilterTab('DUE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
              filterTab === 'DUE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'gu' ? 'બાકી / જમા કરાવવાના' : 'Pending Due'}</span>
            <span className="font-mono ml-1 px-1.5 py-0.2 text-[10px] rounded bg-white/20">
              {pendingDueCount}
            </span>
          </button>
          <button
            onClick={() => setFilterTab('SUBMITTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
              filterTab === 'SUBMITTED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>{language === 'gu' ? 'જમા કરેલ / પૂર્ણ' : 'Submitted'}</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'gu' ? 'વિષય કે પ્રકરણ શોધો...' : 'Search by subject or title...'}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Homework Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.map((hw) => {
          const { isSubmitted, studentSub, isDueToday, isOverdue } = hw;

          return (
            <div
              key={hw.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-4 flex flex-col justify-between ${
                isSubmitted
                  ? 'border-emerald-200 hover:border-emerald-300'
                  : isDueToday
                  ? 'border-rose-300 ring-2 ring-rose-500/20'
                  : isOverdue
                  ? 'border-rose-400 bg-rose-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200 font-mono">
                    {hw.subject}
                  </span>

                  <span
                    className={`text-xs font-mono font-bold flex items-center space-x-1 px-2.5 py-0.5 rounded-full ${
                      isSubmitted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isDueToday
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : isOverdue
                        ? 'bg-rose-100 text-rose-900 font-bold'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {isSubmitted
                        ? 'Submitted'
                        : isOverdue
                        ? `Overdue (${hw.submission_deadline})`
                        : isDueToday
                        ? 'Due Today!'
                        : `Due: ${hw.submission_deadline}`}
                    </span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug font-heading">{hw.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{hw.description}</p>

                {hw.attachments_url && (
                  <div className="inline-flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reference Material: {hw.attachments_url}</span>
                  </div>
                )}
              </div>

              {/* Status & Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {isSubmitted && studentSub ? (
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                        {studentSub.status === 'GRADED' ? `Grade: ${studentSub.grade || 'A1'}` : '✓ Submitted (In Review)'}
                      </span>
                      {studentSub.feedback && (
                        <p className="text-[11px] text-slate-500 italic mt-1">
                          Teacher Note: &quot;{studentSub.feedback}&quot;
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                      {isDueToday ? '🔴 Pending (Due Today)' : '⏳ Action Required'}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedHw(hw)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer hover:scale-105 ${
                    isSubmitted
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : isDueToday
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {isSubmitted
                      ? language === 'gu' ? 'પુનઃ અપલોડ' : 'Resubmit Solution'
                      : language === 'gu' ? 'ઉકેલ અપલોડ કરો' : 'Upload Solution'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredList.length === 0 && (
          <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No homework assignments found</h4>
            <p className="text-xs text-slate-400">All due assignments are submitted or no match with current filters.</p>
          </div>
        )}
      </div>

      {/* Upload Solution Modal */}
      {selectedHw && (
        <Modal
          isOpen={!!selectedHw}
          onClose={() => setSelectedHw(null)}
          title={language === 'gu' ? 'ગૃહકાર્ય ઉકેલ જમા કરો' : 'Submit Homework Solution'}
          subtitle={`${selectedHw.title} • ${selectedHw.subject}`}
          maxWidth="md"
        >
          <form onSubmit={handleUploadSolution} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
              <span className="font-bold block mb-0.5">
                {language === 'gu' ? 'જમા કરવાની સૂચનાઓ' : 'Submission Instructions'}
              </span>
              <p className="text-[11px] text-amber-700">
                {language === 'gu'
                  ? 'તમારો ઉકેલ PDF અથવા ફોટો ફાઇલ તરીકે જોડીને સબમિટ કરો. શિક્ષક દ્વારા તપાસીને ગુણ આપવામાં આવશે.'
                  : 'Upload your completed handwritten worksheet or typed PDF. The subject teacher will review and award Ekam Kasoti points.'}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {language === 'gu' ? 'જોડાણ ફાઇલ નામ (PDF / Image) *' : 'Solution File Name (PDF / Scanned Photo) *'}
              </label>
              <input
                type="text"
                required
                value={submissionFileName}
                onChange={(e) => setSubmissionFileName(e.target.value)}
                placeholder="e.g. Harsh_Patel_Maths_Chapter4_Solutions.pdf"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {language === 'gu' ? 'શિક્ષક માટે કોઈ નોંધ (વૈકલ્પિક)' : 'Student Note for Teacher (Optional)'}
              </label>
              <textarea
                rows={2}
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder={language === 'gu' ? 'પ્રશ્ન ક્રમાંક ૪ માં મુશ્કેલી પડી હતી...' : 'e.g. Completed all textbook exercises 4.1 to 4.4...'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedHw(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer hover:bg-slate-50"
              >
                {language === 'gu' ? 'રદ કરો' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md shadow-amber-600/20 flex items-center space-x-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{language === 'gu' ? 'ઉકેલ જમા કરો' : 'Upload & Submit'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
