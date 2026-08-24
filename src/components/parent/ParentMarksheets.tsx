import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ExamMark, Student } from '../../types/erp';
import { ReportCardModal } from '../modals/ReportCardModal';
import { AcademicProgressChart } from './AcademicProgressChart';
import {
  Award,
  Printer,
  Calendar,
  Sparkles,
  TrendingUp,
  Download,
} from 'lucide-react';

export const ParentMarksheets: React.FC = () => {
  const { currentSchool } = useAuth();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const student: Student = {
    id: 'std-alex',
    school_id: currentSchool.id,
    user_id: 'usr-alex',
    first_name: 'Alex',
    last_name: 'Morgan',
    gr_number: 'GR-2024-1042',
    class_id: 'class-10-a',
    roll_no: 14,
    dob: '2010-04-12',
    gender: 'MALE',
    blood_group: 'O+',
    parent_user_id: 'usr-parent-alex',
    parent_name: 'Richard Morgan',
    parent_phone: '+1 (555) 234-5678',
    address: '42 Pine Hill Lane, Metro City',
    admission_date: '2024-06-01',
    status: 'ENROLLED',
    emergency_contact: '+1 (555) 999-0000',
  };

  const marks: ExamMark[] = [
    { id: 'm-1', school_id: currentSchool.id, exam_id: 'exam-1', exam_name: 'First Term Examination 2026', class_id: 'class-10-a', student_id: 'std-alex', student_name: 'Alex Morgan', roll_no: 14, subject: 'Mathematics (ગણિત - ૧૨)', max_marks: 100, marks_obtained: 96, grade: 'A1', remarks: 'Outstanding problem solving and algebraic reasoning' },
    { id: 'm-2', school_id: currentSchool.id, exam_id: 'exam-1', exam_name: 'First Term Examination 2026', class_id: 'class-10-a', student_id: 'std-alex', student_name: 'Alex Morgan', roll_no: 14, subject: 'Science & Technology (વિજ્ઞાન - ૧૧)', max_marks: 100, marks_obtained: 92, grade: 'A1', remarks: 'Demonstrates deep grasp of scientific experiments' },
    { id: 'm-3', school_id: currentSchool.id, exam_id: 'exam-1', exam_name: 'First Term Examination 2026', class_id: 'class-10-a', student_id: 'std-alex', student_name: 'Alex Morgan', roll_no: 14, subject: 'Social Science (સામાજિક વિજ્ઞાન - ૧૦)', max_marks: 100, marks_obtained: 88, grade: 'A2', remarks: 'Good analytical precision in Indian heritage & civics' },
    { id: 'm-4', school_id: currentSchool.id, exam_id: 'exam-1', exam_name: 'First Term Examination 2026', class_id: 'class-10-a', student_id: 'std-alex', student_name: 'Alex Morgan', roll_no: 14, subject: 'Gujarati FL (ગુજરાતી પ્રથમ ભાષા - ૦૧)', max_marks: 100, marks_obtained: 90, grade: 'A1', remarks: 'Rich vocabulary and eloquent prose writing' },
    { id: 'm-5', school_id: currentSchool.id, exam_id: 'exam-1', exam_name: 'First Term Examination 2026', class_id: 'class-10-a', student_id: 'std-alex', student_name: 'Alex Morgan', roll_no: 14, subject: 'English SL (અંગ્રેજી દ્વિતીય ભાષા - ૧૬)', max_marks: 100, marks_obtained: 91, grade: 'A1', remarks: 'Clear grammatical comprehension and writing' },
    { id: 'm-6', school_id: currentSchool.id, exam_id: 'exam-1', exam_name: 'First Term Examination 2026', class_id: 'class-10-a', student_id: 'std-alex', student_name: 'Alex Morgan', roll_no: 14, subject: 'Computer Studies (કમ્પ્યુટર અધ્યયન - ૩૩૧)', max_marks: 100, marks_obtained: 98, grade: 'A1', remarks: 'Exemplary practical coding and software mastery' },
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
            <Award className="w-5 h-5 text-amber-500" />
            <span>Academic Performance &amp; Official Marksheets</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View term exam marksheets, teacher appraisals, and download official certified report cards for Alex Morgan.
          </p>
        </div>

        <button
          onClick={() => setIsPrintModalOpen(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 self-start"
        >
          <Printer className="w-4 h-4" />
          <span>Print Official Report Card</span>
        </button>
      </div>

      {/* Aggregate Score Card */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-2xl p-6 text-white shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <span className="text-amber-100 text-xs font-bold uppercase tracking-wider block">
            Alex&apos;s Term Aggregate
          </span>
          <div className="text-3xl font-black mt-1">{aggregatePercentage.toFixed(1)}%</div>
          <p className="text-xs text-amber-100 mt-0.5">Grade: Distinction (A+)</p>
        </div>

        <div>
          <span className="text-amber-100 text-xs font-bold uppercase tracking-wider block">
            Total Marks Scored
          </span>
          <div className="text-3xl font-black mt-1">
            {totalObtainedMarks} <span className="text-xl font-normal text-amber-200">/ {totalMaxMarks}</span>
          </div>
          <p className="text-xs text-amber-100 mt-0.5">Across 5 Subjects</p>
        </div>

        <div>
          <span className="text-amber-100 text-xs font-bold uppercase tracking-wider block">
            Class Position
          </span>
          <div className="text-3xl font-black mt-1">#2 in Grade 10-A</div>
          <p className="text-xs text-amber-100 mt-0.5">Top 5% in Standard</p>
        </div>
      </div>

      {/* Detailed Marksheet Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Term 1 Midterm Examination 2026 • Subject Breakdown
          </h3>
          <span className="text-[11px] font-mono text-slate-500 font-bold">Academic Year: 2026-2027</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[620px] w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 text-center">Max Marks</th>
                <th className="py-3 px-4 text-center">Marks Obtained</th>
                <th className="py-3 px-4 text-center">Letter Grade</th>
                <th className="py-3 px-4">Instructor Appraisal &amp; Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {marks.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{m.subject}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-600">
                    {m.max_marks}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-black text-slate-900 text-sm">
                    {m.marks_obtained}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full font-black text-xs bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {m.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 italic">{m.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Longitudinal Academic Progress Visualization (Recharts) */}
      <AcademicProgressChart studentName="Alex Morgan (હર્ષ પટેલ)" className="Class 10th-A" />

      {/* Official Report Card Modal */}
      {isPrintModalOpen && (
        <ReportCardModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          student={student}
          marks={marks}
          school={currentSchool}
          examName="Term 1 Midterm Examination 2026"
        />
      )}
    </div>
  );
};
