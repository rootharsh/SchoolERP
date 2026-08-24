import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Student, ExamMark } from '../../types/erp';
import { erpDb } from '../../services/db';
import { ReportCardModal } from '../modals/ReportCardModal';
import {
  Award,
  Save,
  Printer,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export const GradebookManagement: React.FC = () => {
  const { currentSchool, currentUser, refreshData } = useAuth();
  const { language } = useLanguage();

  const [selectedClassId, setSelectedClassId] = useState('class-10-a');
  const [selectedExam, setSelectedExam] = useState('Midterm Examination 2026');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [reportCardStudent, setReportCardStudent] = useState<Student | null>(null);

  const students = erpDb.getStudents(currentSchool.id, 'TEACHER', currentUser?.id || '', selectedClassId);

  // Local marks state map: studentId -> score as string or number
  const [marksMap, setMarksMap] = useState<Record<string, string | number>>({
    'std-alex': 96,
    'std-emma': 92,
    'std-daniel': 88,
  });

  const subjects = [
    'Mathematics (ગણિત)',
    'Science & Technology (વિજ્ઞાન અને ટેકનોલોજી)',
    'Social Science (સામાજિક વિજ્ઞાન)',
    'Gujarati (ગુજરાતી)',
    'English (અંગ્રેજી)',
    'Hindi / Sanskrit (હિન્દી / સંસ્કૃત)',
    'Computer Studies (કમ્પ્યુટર અધ્યયન)',
  ];

  const handleScoreChange = (studentId: string, val: string) => {
    // If empty, let user clear the input completely
    if (val === '') {
      setMarksMap((prev) => ({ ...prev, [studentId]: '' }));
      return;
    }

    // Strip leading zeros unless it's just '0'
    let cleaned = val.replace(/^0+(?=\d)/, '');
    let num = Number(cleaned);

    if (isNaN(num)) return;
    if (num > 100) num = 100;
    if (num < 0) num = 0;

    setMarksMap((prev) => ({ ...prev, [studentId]: num }));
  };

  const handleSaveMarks = () => {
    students.forEach((s) => {
      const rawScore = marksMap[s.id];
      const score = rawScore === '' || rawScore === undefined ? 85 : Number(rawScore);
      erpDb.saveExamMark({
        school_id: currentSchool.id,
        exam_id: 'exam-midterm-2026',
        exam_name: selectedExam,
        class_id: selectedClassId,
        student_id: s.id,
        student_name: `${s.first_name} ${s.last_name}`,
        roll_no: s.roll_no,
        subject: selectedSubject,
        max_marks: 100,
        marks_obtained: score,
        grade: score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : 'C',
        remarks: 'Recorded by class teacher',
      });
    });

    erpDb.logAudit({
      school_id: currentSchool.id,
      user_id: currentUser?.id || 'usr-teacher-neeta',
      user_name: currentUser?.full_name || 'Smt. Neetaben R. Patel',
      user_role: 'TEACHER',
      action: 'UPDATE_GRADEBOOK',
      resource_type: 'EXAM_MARKS',
      details: `Saved ${selectedExam} marks for subject [${selectedSubject}] in ${selectedClassId}`,
      ip_address: '192.168.1.1',
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    refreshData();
  };

  const getStudentAllSubjectMarks = (student: Student): ExamMark[] => {
    const mathScore = marksMap[student.id] !== undefined && marksMap[student.id] !== '' ? Number(marksMap[student.id]) : 94;
    return [
      { id: 'm-1', school_id: currentSchool.id, exam_id: 'exam-1', exam_name: selectedExam, class_id: selectedClassId, student_id: student.id, student_name: `${student.first_name} ${student.last_name}`, roll_no: student.roll_no, subject: 'Mathematics (ગણિત)', max_marks: 100, marks_obtained: mathScore, grade: mathScore >= 90 ? 'A+' : 'A', remarks: 'Exceptional analytical aptitude' },
      { id: 'm-2', school_id: currentSchool.id, exam_id: 'exam-1', exam_name: selectedExam, class_id: selectedClassId, student_id: student.id, student_name: `${student.first_name} ${student.last_name}`, roll_no: student.roll_no, subject: 'Science & Technology (વિજ્ઞાન)', max_marks: 100, marks_obtained: 88, grade: 'A', remarks: 'Good grasp of scientific concepts' },
      { id: 'm-3', school_id: currentSchool.id, exam_id: 'exam-1', exam_name: selectedExam, class_id: selectedClassId, student_id: student.id, student_name: `${student.first_name} ${student.last_name}`, roll_no: student.roll_no, subject: 'Social Science (સામાજિક વિજ્ઞાન)', max_marks: 100, marks_obtained: 92, grade: 'A+', remarks: 'Excellent understanding of history and civics' },
      { id: 'm-4', school_id: currentSchool.id, exam_id: 'exam-1', exam_name: selectedExam, class_id: selectedClassId, student_id: student.id, student_name: `${student.first_name} ${student.last_name}`, roll_no: student.roll_no, subject: 'Gujarati (ગુજરાતી)', max_marks: 100, marks_obtained: 90, grade: 'A+', remarks: 'Strong expression and vocabulary' },
      { id: 'm-5', school_id: currentSchool.id, exam_id: 'exam-1', exam_name: selectedExam, class_id: selectedClassId, student_id: student.id, student_name: `${student.first_name} ${student.last_name}`, roll_no: student.roll_no, subject: 'English (અંગ્રેજી)', max_marks: 100, marks_obtained: 89, grade: 'A', remarks: 'Well-structured essays' },
      { id: 'm-6', school_id: currentSchool.id, exam_id: 'exam-1', exam_name: selectedExam, class_id: selectedClassId, student_id: student.id, student_name: `${student.first_name} ${student.last_name}`, roll_no: student.roll_no, subject: 'Computer Studies (કમ્પ્યુટર અધ્યયન)', max_marks: 100, marks_obtained: 96, grade: 'A+', remarks: 'Proficient practical skills' },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>{language === 'gu' ? 'ગુણ પત્રક અને પરીક્ષા મૂલ્યાંકન' : 'Marks Entry & Gradebook'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'gu'
              ? 'પરીક્ષાના ગુણ દાખલ કરો, ગ્રેડ આપો અને વિદ્યાર્થીઓનું પરિણામ પત્રક (રિપોર્ટ કાર્ડ) પ્રિન્ટ કરો.'
              : 'Enter student exam marks directly, review computed grades, and print official report cards.'}
          </p>
        </div>

        <button
          onClick={handleSaveMarks}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 flex items-center space-x-1.5 transition-all self-start cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{language === 'gu' ? 'ગુણ સેવ કરો' : 'Save Subject Marks'}</span>
        </button>
      </div>

      {/* Save Success Toast */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {language === 'gu'
                ? 'ગુણ સફળતાપૂર્વક સિસ્ટમમાં સચવાઈ ગયા છે!'
                : 'Marks recorded successfully and synced with student report cards!'}
            </span>
          </div>
          <button onClick={() => setSaveSuccess(false)} className="text-white/80 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {language === 'gu' ? 'પરીક્ષાનું નામ' : 'Exam Cycle'}
          </label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="Midterm Examination 2026">Midterm Examination 2026 (સત્રાંત પરીક્ષા)</option>
            <option value="Term 1 Finals">Term 1 Finals (પ્રથમ સત્ર)</option>
            <option value="Unit Diagnostic Test 1">Unit Diagnostic Test 1 (એકમ કસોટી ૧)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {language === 'gu' ? 'વિષય' : 'Subject'}
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub} (Max 100)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {language === 'gu' ? 'ધોરણ અને વર્ગ' : 'Class / Standard'}
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="class-10-a">Class 10th-A (ધોરણ ૧૦ - ગુજરાતી માધ્યમ)</option>
            <option value="class-10-b">Class 10th-B (Grade 10 - English Medium)</option>
            <option value="class-9-a">Class 9th-A (ધોરણ ૯ સામાન્ય)</option>
            <option value="class-11-sci">Class 11th-Science (ધોરણ ૧૧ વિજ્ઞાન પ્રવાહ)</option>
            <option value="class-12-com">Class 12th-Commerce (ધોરણ ૧૨ વાણિજ્ય પ્રવાહ)</option>
          </select>
        </div>
      </div>

      {/* Marks Entry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {selectedExam} • {selectedSubject}
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {language === 'gu' ? 'કુલ ગુણ: ૧૦૦' : 'Maximum Marks: 100'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[620px] w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4 w-16">{language === 'gu' ? 'રોલ નં.' : 'Roll'}</th>
                <th className="py-3 px-4">{language === 'gu' ? 'જી.આર. નંબર' : 'GR Number'}</th>
                <th className="py-3 px-4">{language === 'gu' ? 'વિદ્યાર્થીનું નામ' : 'Student Name'}</th>
                <th className="py-3 px-4 w-36">{language === 'gu' ? 'મેળવેલ ગુણ (/100)' : 'Marks Scored (/100)'}</th>
                <th className="py-3 px-4">{language === 'gu' ? 'ગ્રેડ' : 'Grade'}</th>
                <th className="py-3 px-4 text-right">{language === 'gu' ? 'રિપોર્ટ કાર્ડ' : 'Report Card'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => {
                const currentVal = marksMap[student.id] !== undefined ? marksMap[student.id] : 86;
                const numVal = currentVal === '' ? 0 : Number(currentVal);
                const letterGrade = currentVal === '' ? '-' : numVal >= 90 ? 'A+' : numVal >= 80 ? 'A' : numVal >= 70 ? 'B' : 'C';
                
                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      #{student.roll_no}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                      {student.gr_number}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative inline-block">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={currentVal}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => handleScoreChange(student.id, e.target.value)}
                          placeholder="0"
                          className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm bg-white"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                          letterGrade === 'A+'
                            ? 'bg-emerald-100 text-emerald-800'
                            : letterGrade === 'A'
                            ? 'bg-blue-100 text-blue-800'
                            : letterGrade === 'B'
                            ? 'bg-amber-100 text-amber-800'
                            : letterGrade === 'C'
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {letterGrade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setReportCardStudent(student)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center space-x-1.5 cursor-pointer shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{language === 'gu' ? 'પ્રિન્ટ પરિણામ' : 'Print Card'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Report Card Modal */}
      {reportCardStudent && (
        <ReportCardModal
          isOpen={!!reportCardStudent}
          onClose={() => setReportCardStudent(null)}
          student={reportCardStudent}
          marks={getStudentAllSubjectMarks(reportCardStudent)}
          school={currentSchool}
          examName={selectedExam}
        />
      )}
    </div>
  );
};
