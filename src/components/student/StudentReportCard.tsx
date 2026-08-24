import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Student, ExamMark } from '../../types/erp';
import { erpDb } from '../../services/db';
import { ReportCardModal } from '../modals/ReportCardModal';
import { EkamKasotiTrendChart } from '../common/EkamKasotiTrendChart';
import {
  Award,
  Printer,
  Calendar,
  Sparkles,
  TrendingUp,
  Download,
} from 'lucide-react';

export const StudentReportCard: React.FC = () => {
  const { currentSchool, currentUser } = useAuth();
  const { language, t } = useLanguage();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const student = erpDb.getStudentByUserId(currentUser?.id || 'usr-student-harsh') || {
    id: 'stu-harsh-patel',
    school_id: currentSchool.id,
    user_id: 'usr-student-harsh',
    first_name: 'Harsh',
    last_name: 'Patel',
    gujarati_name: 'હર્ષ વિનોદભાઈ પટેલ',
    gr_number: 'GR-4821',
    class_id: 'class-10-a',
    roll_no: 14,
    dob: '2010-08-15',
    gender: 'MALE' as const,
    blood_group: 'B+',
    parent_user_id: 'usr-parent-vinod',
    parent_name: 'Vinodbhai Patel',
    parent_phone: '+91 98251 44321',
    address: '14, Sharda Society, Near Swaminarayan Temple, Nadiad',
    admission_date: '2020-06-15',
    status: 'ENROLLED' as const,
    emergency_contact: '+91 98251 44321',
  };

  const marks: ExamMark[] = [
    { id: 'm-1', school_id: currentSchool.id, exam_id: 'exam-1', exam_name: 'Ekam Kasoti - 1 (PAT)', class_id: student.class_id, student_id: student.id, student_name: student.gujarati_name || `${student.first_name} ${student.last_name}`, roll_no: student.roll_no, subject: 'Mathematics (ગણિત)', max_marks: 25, marks_obtained: 25, grade: 'A1', remarks: 'ઉત્કૃષ્ટ ગાણિતિક તર્ક અને ક્ષમતા' },
    { id: 'm-2', school_id: currentSchool.id, exam_id: 'exam-1', exam_name: 'Ekam Kasoti - 1 (PAT)', class_id: student.class_id, student_id: student.id, student_name: student.gujarati_name || `${student.first_name} ${student.last_name}`, roll_no: student.roll_no, subject: 'Science & Tech (વિજ્ઞાન)', max_marks: 25, marks_obtained: 24, grade: 'A1', remarks: 'પ્રાયોગિક સમજણ ખૂબ સરસ છે' },
    { id: 'm-3', school_id: currentSchool.id, exam_id: 'exam-1', exam_name: 'Ekam Kasoti - 1 (PAT)', class_id: student.class_id, student_id: student.id, student_name: student.gujarati_name || `${student.first_name} ${student.last_name}`, roll_no: student.roll_no, subject: 'Social Science (સામાજિક વિજ્ઞાન)', max_marks: 25, marks_obtained: 23, grade: 'A1', remarks: 'નકશા અને ઐતિહાસિક તથ્યોમાં કુશળ' },
    { id: 'm-4', school_id: currentSchool.id, exam_id: 'exam-1', exam_name: 'Ekam Kasoti - 1 (PAT)', class_id: student.class_id, student_id: student.id, student_name: student.gujarati_name || `${student.first_name} ${student.last_name}`, roll_no: student.roll_no, subject: 'Gujarati FL (ગુજરાતી પ્રથમ ભાષા)', max_marks: 25, marks_obtained: 25, grade: 'A1', remarks: 'સુંદર લેખનશૈલી અને વ્યાકરણ શુદ્ધતા' },
    { id: 'm-5', school_id: currentSchool.id, exam_id: 'exam-1', exam_name: 'Ekam Kasoti - 1 (PAT)', class_id: student.class_id, student_id: student.id, student_name: student.gujarati_name || `${student.first_name} ${student.last_name}`, roll_no: student.roll_no, subject: 'English SL (અંગ્રેજી દ્વિતીય ભાષા)', max_marks: 25, marks_obtained: 24, grade: 'A1', remarks: 'Good vocabulary and reading comprehension' },
    { id: 'm-6', school_id: currentSchool.id, exam_id: 'exam-1', exam_name: 'Ekam Kasoti - 1 (PAT)', class_id: student.class_id, student_id: student.id, student_name: student.gujarati_name || `${student.first_name} ${student.last_name}`, roll_no: student.roll_no, subject: 'Sanskrit / Computer (સંસ્કૃત/કોમ્પ્યુટર)', max_marks: 25, marks_obtained: 23, grade: 'A1', remarks: 'શ્લોક ગાન અને કોમ્પ્યુટર પરિચય ઉત્તમ' },
  ];

  const totalMaxMarks = marks.reduce((acc, m) => acc + m.max_marks, 0);
  const totalObtainedMarks = marks.reduce((acc, m) => acc + m.marks_obtained, 0);
  const aggregatePercentage = (totalObtainedMarks / totalMaxMarks) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>{language === 'gu' ? 'શૈક્ષણિક પ્રગતિ પત્રક (ગુણ પત્રક)' : 'Academic Performance & Report Card'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'gu'
              ? 'ગુજરાત માધ્યમિક શિક્ષણ બોર્ડ (GSEB) માન્ય સત્તાવાર એકમ કસોટી અને સત્રાંત પરીક્ષા પરિણામ'
              : 'Institutional examination marksheets certified under GSEB evaluation standard.'}
          </p>
        </div>

        <button
          onClick={() => setIsPrintModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 self-start cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>{language === 'gu' ? 'સત્તાવાર પ્રગતિ પત્રક PDF' : 'Official GSEB Report Card PDF'}</span>
        </button>
      </div>

      {/* Aggregate Score Card */}
      <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 border border-slate-800">
        <div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
            {language === 'gu' ? 'કુલ ટકાવારી (Percentage)' : 'Aggregate Percentage'}
          </span>
          <div className="text-3xl font-bold text-emerald-400 mt-1">{aggregatePercentage.toFixed(1)}%</div>
          <p className="text-xs text-slate-300 mt-0.5">{language === 'gu' ? 'કુલ ગ્રેડ: A1 (વિશિષ્ટ સિદ્ધિ)' : 'Overall Grade: Distinction (A1)'}</p>
        </div>

        <div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
            {language === 'gu' ? 'મેળવેલ કુલ ગુણ' : 'Total Marks Scored'}
          </span>
          <div className="text-3xl font-bold text-white mt-1">
            {totalObtainedMarks} <span className="text-xl font-normal text-slate-400">/ {totalMaxMarks}</span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">{language === 'gu' ? '૬ મુખ્ય વિષયોના પરિણામ' : 'Across 6 Core Subjects'}</p>
        </div>

        <div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
            {language === 'gu' ? 'વર્ગ ક્રમ (Class Rank)' : 'Class Rank'}
          </span>
          <div className="text-3xl font-bold text-amber-400 mt-1">
            {language === 'gu' ? '#૧ (ધોરણ ૧૦-A)' : '#1 in Class 10-A'}
          </div>
          <p className="text-xs text-slate-300 mt-0.5">{language === 'gu' ? 'પ્રથમ ક્રમાંક' : 'First Position'}</p>
        </div>
      </div>

      {/* D3-Based Ekam Kasoti Progress Trendline */}
      <EkamKasotiTrendChart
        studentName={student.gujarati_name || `${student.first_name} ${student.last_name}`}
        className="Class 10th-A"
        showSubjectFilter={true}
      />

      {/* Detailed Marksheet Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {language === 'gu' ? 'એકમ કસોટી - ૧ (સત્ર ૨૦૨૬-૨૭) • વિષયવાર ગુણપત્રક' : 'Ekam Kasoti - 1 (Session 2026-27) • Subject Breakdown'}
          </h3>
          <span className="text-[11px] font-mono text-emerald-700 font-bold">GSEB Evaluation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[620px] w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">{language === 'gu' ? 'વિષય (Subject)' : 'Subject'}</th>
                <th className="py-3 px-4 text-center">{language === 'gu' ? 'કુલ ગુણ' : 'Max Marks'}</th>
                <th className="py-3 px-4 text-center">{language === 'gu' ? 'મેળવેલ ગુણ' : 'Marks Obtained'}</th>
                <th className="py-3 px-4 text-center">{language === 'gu' ? 'ગ્રેડ' : 'Grade'}</th>
                <th className="py-3 px-4">{language === 'gu' ? 'શિક્ષકનો અભિપ્રાય / નોંધ' : 'Remarks'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {marks.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{m.subject}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-600">
                    {m.max_marks}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 text-sm">
                    {m.marks_obtained}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded font-bold text-xs bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {m.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{m.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Report Card Modal */}
      {isPrintModalOpen && (
        <ReportCardModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          student={student}
          school={currentSchool}
          marks={marks}
        />
      )}
    </div>
  );
};
