import React from 'react';
import { Student, ExamMark, School } from '../../types/erp';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../common/UIComponents';
import { Printer, Award, CheckCircle2, TrendingUp, Sparkles, Heart, FileText } from 'lucide-react';
import { EkamKasotiTrendChart } from '../common/EkamKasotiTrendChart';

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  marks: ExamMark[];
  school: School;
  examName?: string;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  isOpen,
  onClose,
  student,
  marks,
  school,
  examName = 'Ekam Kasoti - 1 (PAT)',
}) => {
  const { language, t } = useLanguage();
  if (!student) return null;

  const totalMax = marks.reduce((sum, m) => sum + m.max_marks, 0) || 150;
  const totalObtained = marks.reduce((sum, m) => sum + m.marks_obtained, 0);
  const percentage = Math.round((totalObtained / totalMax) * 1000) / 10;

  const getGsebGrade = (pct: number) => {
    if (pct >= 91) return { grade: 'A1', remark: language === 'gu' ? 'વિશિષ્ટ સિદ્ધિ (Outstanding)' : 'Outstanding Performance', color: 'text-emerald-700 bg-emerald-50' };
    if (pct >= 81) return { grade: 'A2', remark: language === 'gu' ? 'ઉત્કૃષ્ટ પરિણામ (Excellent)' : 'Excellent Performance', color: 'text-emerald-600 bg-emerald-50' };
    if (pct >= 71) return { grade: 'B1', remark: language === 'gu' ? 'ખૂબ સરસ (Very Good)' : 'Very Good', color: 'text-blue-700 bg-blue-50' };
    if (pct >= 61) return { grade: 'B2', remark: language === 'gu' ? 'સરસ (Good)' : 'Good', color: 'text-blue-600 bg-blue-50' };
    if (pct >= 51) return { grade: 'C1', remark: language === 'gu' ? 'સંતોષકારક (Fair)' : 'Fair', color: 'text-amber-700 bg-amber-50' };
    if (pct >= 41) return { grade: 'C2', remark: language === 'gu' ? 'સાધારણ (Average)' : 'Average', color: 'text-amber-600 bg-amber-50' };
    if (pct >= 33) return { grade: 'D', remark: language === 'gu' ? 'ઉત્તીર્ણ (Passed)' : 'Passed', color: 'text-orange-700 bg-orange-50' };
    return { grade: 'E', remark: language === 'gu' ? 'સુધારણા જરૂરી (Needs Improvement)' : 'Needs Improvement', color: 'text-rose-700 bg-rose-50' };
  };

  const performance = getGsebGrade(percentage);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'gu' ? 'GSEB વિદ્યાર્થી પ્રગતિ પત્રક (રિપોર્ટ કાર્ડ)' : 'GSEB Student Progress Report Card'}
      subtitle={`${student.gujarati_name || `${student.first_name} ${student.last_name}`} • G.R. No: ${student.gr_number}`}
      maxWidth="3xl"
    >
      {/* Quick Print Action Bar (Hidden during actual print) */}
      <div className="mb-4 bg-slate-900 text-white p-3.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-slate-700 no-print">
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100 flex items-center space-x-1.5">
              <span>{language === 'gu' ? 'પ્રિન્ટ પૂર્વાવલોકન તૈયાર છે' : 'Print Layout Optimized'}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono">
                A4 Portrait
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {language === 'gu'
                ? 'બ્રાઉઝર પ્રિન્ટ ડાયલોગ દ્વારા સીધું PDF સેવ કરો અથવા પ્રિન્ટર પર મોકલો (Ctrl+P / ⌘+P)'
                : 'Clean printable layout with certified GSEB evaluation seals & signatures.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all hover:scale-105 cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'gu' ? 'રિપોર્ટ કાર્ડ પ્રિન્ટ કરો' : 'Print Report Card'}</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Canvas */}
      <div
        id="printable-report-card"
        className="bg-white text-slate-900 p-6 rounded-xl border border-slate-300 shadow-xs printable-document print:p-0 print:border-0"
      >
        {/* Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 institutional-header">
          <p className="text-[11px] font-bold text-amber-800 uppercase tracking-widest">
            {school.is_self_financed ? 'સ્વ-નિર્ભર ખાનગી માધ્યમિક શાળા (Self-Financed Private School)' : 'Recognized GSEB School'}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif uppercase tracking-tight mt-0.5">
            {school.gujarati_name ? school.gujarati_name : school.name}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">{school.address}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-600 mt-1">
            <span>GSEB Index: <strong className="text-slate-900">{school.gseb_index || '64.082'}</strong></span>
            <span>•</span>
            <span>UDISE+: <strong className="text-slate-900">{school.udiseCode || '24090104512'}</strong></span>
            <span>•</span>
            <span>{language === 'gu' ? 'માધ્યમ: ' : 'Medium: '}<strong>{student.medium === 'GUJARATI' ? 'ગુજરાતી માધ્યમ' : 'English Medium'}</strong></span>
          </div>
          <div className="inline-block mt-2 px-3 py-0.5 bg-slate-900 text-white text-xs font-bold uppercase rounded tracking-wider">
            {examName} • શૈક્ષણિક સત્ર ૨૦૨૬-૨૭ (ACADEMIC YEAR 2026-27)
          </div>
        </div>

        {/* Student Profile Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-bold">
              {language === 'gu' ? 'વિદ્યાર્થીનું નામ' : 'Student Name'}
            </span>
            <span className="font-bold text-slate-900">{student.gujarati_name || `${student.first_name} ${student.last_name}`}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-bold">
              {language === 'gu' ? 'જનરલ રજિસ્ટર (G.R. No.)' : 'General Register (G.R.)'}
            </span>
            <span className="font-mono font-bold text-blue-900">{student.gr_number}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-bold">
              {language === 'gu' ? 'ધોરણ અને રોલ નં.' : 'Class & Roll No'}
            </span>
            <span className="font-bold text-slate-800">Class 10th-A (રોલ #{student.roll_no})</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-bold">
              {language === 'gu' ? 'પિતાનું નામ' : "Father's Name"}
            </span>
            <span className="font-semibold text-slate-800">{student.father_name || student.parent_name}</span>
          </div>
        </div>

        {/* Marks Table */}
        <div className="py-3 border-b border-slate-200">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-300">
                <th className="py-2.5 px-3 text-left">{language === 'gu' ? 'વિષય (Subject)' : 'Subject'}</th>
                <th className="py-2.5 px-3 text-center">{language === 'gu' ? 'કુલ ગુણ' : 'Max Marks'}</th>
                <th className="py-2.5 px-3 text-center">{language === 'gu' ? 'મેળવેલ ગુણ' : 'Marks Scored'}</th>
                <th className="py-2.5 px-3 text-center">{language === 'gu' ? 'ટકાવારી' : 'Percentage'}</th>
                <th className="py-2.5 px-3 text-center">{language === 'gu' ? 'GSEB ગ્રેડ' : 'GSEB Grade'}</th>
                <th className="py-2.5 px-3 text-left">{language === 'gu' ? 'શિક્ષકની નોંધ' : 'Teacher Remark'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {marks.map((m, idx) => {
                const subPct = Math.round((m.marks_obtained / m.max_marks) * 100);
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{m.subject}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">{m.max_marks}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">{m.marks_obtained}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-700">{subPct}%</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{m.grade}</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">{m.remarks}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/80 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="py-3 px-3 uppercase text-[11px]">{language === 'gu' ? 'કુલ સરવાળો (Grand Total)' : 'Grand Total'}</td>
                <td className="py-3 px-3 text-center font-mono">{totalMax}</td>
                <td className="py-3 px-3 text-center font-mono text-emerald-700 text-sm">{totalObtained}</td>
                <td className="py-3 px-3 text-center font-mono text-sm">{percentage}%</td>
                <td className="py-3 px-3 text-center text-emerald-700 text-sm">{performance.grade}</td>
                <td className="py-3 px-3 text-emerald-700 text-xs">
                  {language === 'gu' ? 'પરિણામ: ઉત્તીર્ણ (PASSED)' : 'Result: PASSED'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Evaluation Summary & GSEB Scale Key */}
        <div className="py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs evaluation-summary">
          <div>
            <span className="text-slate-500 font-semibold uppercase text-[10px]">
              {language === 'gu' ? 'શૈક્ષણિક મૂલ્યાંકન:' : 'Academic Assessment:'}
            </span>
            <p className="font-bold text-slate-800 mt-0.5">{performance.remark}</p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-slate-500 font-semibold uppercase text-[10px]">
              {language === 'gu' ? 'વર્ગ ક્રમાંક અને હાજરી:' : 'Class Rank & Attendance:'}
            </span>
            <p className="font-bold text-slate-800 mt-0.5">
              {language === 'gu' ? 'વર્ગમાં ક્રમ: #૧ (હાજરી: ૯૬%)' : 'Rank #1 in Class 10th-A (96% Attendance)'}
            </p>
          </div>
        </div>

        {/* D3-Based Ekam Kasoti Progress Trendline in Certified Report Card */}
        <div className="my-3">
          <EkamKasotiTrendChart
            studentName={student.gujarati_name || `${student.first_name} ${student.last_name}`}
            className="Class 10th-A"
            compact={true}
            showSubjectFilter={false}
          />
        </div>

        {/* GSEB Grade Reference Matrix */}
        <div className="py-2.5 border-b border-slate-200 bg-slate-50/60 rounded-lg px-3 mt-2 text-[10px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-slate-700 uppercase">{language === 'gu' ? 'GSEB ગ્રેડ સ્કેલ:' : 'GSEB Grade Matrix:'}</span>
          <span className="font-mono">91-100%: <strong>A1</strong></span>
          <span className="font-mono">81-90%: <strong>A2</strong></span>
          <span className="font-mono">71-80%: <strong>B1</strong></span>
          <span className="font-mono">61-70%: <strong>B2</strong></span>
          <span className="font-mono">51-60%: <strong>C1</strong></span>
          <span className="font-mono">41-50%: <strong>C2</strong></span>
          <span className="font-mono">33-40%: <strong>D</strong> (Pass)</span>
        </div>

        {/* Signatures */}
        <div className="mt-8 pt-4 flex items-end justify-between text-xs signature-block">
          <div className="text-center">
            <div className="h-8 border-b border-slate-400 w-28 mx-auto"></div>
            <p className="mt-1 font-semibold text-slate-700">
              {language === 'gu' ? 'વર્ગ શિક્ષક' : 'Class Teacher'}
            </p>
          </div>
          <div className="text-center">
            <div className="h-8 border-b border-slate-400 w-28 mx-auto"></div>
            <p className="mt-1 font-semibold text-slate-700">
              {language === 'gu' ? 'વાલીની સહી' : 'Parent Signature'}
            </p>
          </div>
          <div className="text-center">
            <div className="h-8 border-b border-slate-400 w-32 mx-auto flex items-center justify-center font-serif italic text-blue-900 font-bold">
              V.C. Pandya
            </div>
            <p className="mt-1 font-bold text-slate-900">
              {language === 'gu' ? 'આચાર્યશ્રીની સહી અને સિક્કો' : 'Principal Stamp'}
            </p>
          </div>
        </div>

        {/* Printable Footer Credit Stamp */}
        <div className="mt-6 pt-2 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between font-mono">
          <span>Official GSEB Evaluation Dossier • ClassSec Gujarat School ERP</span>
          <span>Made with ❤️ by Harsh Ravaliya</span>
        </div>
      </div>

      {/* Modal Bottom Actions */}
      <div className="mt-4 flex justify-end space-x-3 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>{t('print', 'Print Report Card')}</span>
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          {t('close', 'Close')}
        </button>
      </div>
    </Modal>
  );
};

