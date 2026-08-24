import React, { useState, useRef } from 'react';
import { Student, School, SchoolClass } from '../../types/erp';
import { useLanguage } from '../../context/LanguageContext';
import {
  X,
  Printer,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  CheckCircle2,
  Heart,
  Users,
  Copy,
  Check,
  Building,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface BulkStudentExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  school: School;
  classes: SchoolClass[];
  selectedClassId: string;
  selectedMedium: string;
  searchQuery: string;
}

export const BulkStudentExportModal: React.FC<BulkStudentExportModalProps> = ({
  isOpen,
  onClose,
  students,
  school,
  classes,
  selectedClassId,
  selectedMedium,
  searchQuery,
}) => {
  const { language, t } = useLanguage();
  const [reportFormat, setReportFormat] = useState<'GR_FULL' | 'CONTACT_LIST' | 'ACADEMIC_LIST'>('GR_FULL');
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentClassObj = classes.find((c) => c.id === selectedClassId);
  const classNameDisplay =
    selectedClassId === 'ALL'
      ? language === 'gu'
        ? 'બધા ધોરણ (All Standards)'
        : 'All Standards'
      : currentClassObj?.name || selectedClassId;

  const mediumDisplay =
    selectedMedium === 'ALL'
      ? language === 'gu'
        ? 'બંને માધ્યમ (All Mediums)'
        : 'All Mediums'
      : selectedMedium === 'GUJARATI'
      ? 'ગુજરાતી માધ્યમ'
      : 'English Medium';

  const safeStudents = students || [];
  const totalBoys = safeStudents.filter((s) => s.gender === 'MALE').length;
  const totalGirls = safeStudents.filter((s) => s.gender === 'FEMALE').length;
  const totalGuMedium = safeStudents.filter((s) => (s.medium || 'GUJARATI') === 'GUJARATI').length;
  const totalEnMedium = safeStudents.filter((s) => s.medium === 'ENGLISH').length;

  const handlePrint = () => {
    window.print();
  };

  // Export to formatted CSV / Excel with UTF-8 BOM
  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const schoolTitle = school.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Student_Register_${schoolTitle}_${classNameDisplay.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.csv`;

    // Prepare CSV rows
    const headerLines = [
      `"${school.name} - ${school.gujarati_name || ''}"`,
      `"UDISE+ Code: ${school.udiseCode || '24090104512'} | Board: GSEB (Self-Financed) | Academic Year: 2026-27"`,
      `"Administrative General Register Export | Class: ${classNameDisplay} | Medium: ${mediumDisplay} | Total Records: ${students.length}"`,
      `"Generated On: ${new Date().toLocaleString('en-IN')} | System: ClassSec Gujarat School ERP"`,
      `"Engineered with ❤️ by Harsh Ravaliya"`,
      `""`, // empty row
    ];

    let headers: string[] = [];
    if (reportFormat === 'GR_FULL') {
      headers = [
        'Sr No',
        'GR Number',
        'Gujarati Name (વિદ્યાર્થી નામ)',
        'English Name',
        'Father Name',
        'Mother Name',
        'Class & Div',
        'Roll No',
        'Medium',
        'Gender',
        'Date of Birth',
        'Blood Group',
        'Parent / Guardian',
        'Contact Phone',
        'Emergency Phone',
        'Caste',
        'Category',
        'Address',
        'Admission Date',
        'Status',
      ];
    } else if (reportFormat === 'CONTACT_LIST') {
      headers = [
        'Sr No',
        'GR Number',
        'Student Name',
        'Class & Div',
        'Roll No',
        'Parent / Guardian Name',
        'Primary Mobile Phone',
        'Emergency Contact',
        'Residential Address',
      ];
    } else {
      headers = [
        'Sr No',
        'GR Number',
        'Roll No',
        'Student Name (English)',
        'Gujarati Name',
        'Class',
        'Medium',
        'DOB',
        'Gender',
        'Blood Group',
        'Caste/Cat',
      ];
    }

    const dataRows = students.map((s, idx) => {
      const sClass = classes.find((c) => c.id === s.class_id)?.name || 'Class 10-A';
      if (reportFormat === 'GR_FULL') {
        return [
          idx + 1,
          `"${s.gr_number}"`,
          `"${s.gujarati_name || ''}"`,
          `"${s.first_name} ${s.last_name}"`,
          `"${s.father_name || ''}"`,
          `"${s.mother_name || ''}"`,
          `"${sClass}"`,
          s.roll_no,
          `"${s.medium || 'GUJARATI'}"`,
          `"${s.gender || 'MALE'}"`,
          `"${s.dob || ''}"`,
          `"${s.blood_group || '-'}"`,
          `"${s.parent_name || ''}"`,
          `"${s.parent_phone || ''}"`,
          `"${s.emergency_contact || s.parent_phone || ''}"`,
          `"${s.caste || ''}"`,
          `"${s.category || 'GEN'}"`,
          `"${(s.address || '').replace(/"/g, '""')}"`,
          `"${s.admission_date || ''}"`,
          `"${s.status || 'ENROLLED'}"`,
        ].join(',');
      } else if (reportFormat === 'CONTACT_LIST') {
        return [
          idx + 1,
          `"${s.gr_number}"`,
          `"${s.first_name} ${s.last_name} (${s.gujarati_name || ''})"`,
          `"${sClass}"`,
          s.roll_no,
          `"${s.parent_name || ''}"`,
          `"${s.parent_phone || ''}"`,
          `"${s.emergency_contact || s.parent_phone || ''}"`,
          `"${(s.address || '').replace(/"/g, '""')}"`,
        ].join(',');
      } else {
        return [
          idx + 1,
          `"${s.gr_number}"`,
          s.roll_no,
          `"${s.first_name} ${s.last_name}"`,
          `"${s.gujarati_name || ''}"`,
          `"${sClass}"`,
          `"${s.medium || 'GUJARATI'}"`,
          `"${s.dob || ''}"`,
          `"${s.gender || 'MALE'}"`,
          `"${s.blood_group || '-'}"`,
          `"${s.caste || 'Patel'} / ${s.category || 'GEN'}"`,
        ].join(',');
      }
    });

    const csvContent =
      '\uFEFF' +
      [
        ...headerLines,
        headers.map((h) => `"${h}"`).join(','),
        ...dataRows,
        `""`,
        `"--- Summary ---"`,
        `"Total Filtered Students: ${students.length} (Boys: ${totalBoys}, Girls: ${totalGirls})"`,
        `"Exported by ClassSec Gujarat ERP • Created with ❤️ by Harsh Ravaliya"`,
      ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyClipboard = () => {
    let headers: string[] = [
      'Sr',
      'GR No',
      'Student Name',
      'Gujarati Name',
      'Class',
      'Roll',
      'Medium',
      'Parent Phone',
    ];
    const rows = students.map((s, idx) => {
      const sClass = classes.find((c) => c.id === s.class_id)?.name || 'Class 10';
      return [
        idx + 1,
        s.gr_number,
        `${s.first_name} ${s.last_name}`,
        s.gujarati_name || '',
        sClass,
        s.roll_no,
        s.medium || 'GUJARATI',
        s.parent_phone,
      ].join('\t');
    });

    const text = [headers.join('\t'), ...rows].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden border border-slate-200 my-4 flex flex-col max-h-[92vh]">
        {/* Modal Top Toolbar (Screen Only) */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center space-x-2">
                <span>{language === 'gu' ? 'વિદ્યાર્થી જનરલ રજિસ્ટર નિકાસ (Bulk Export)' : 'Export Student Register (G.R.)'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {students.length} {language === 'gu' ? 'રેકોર્ડ્સ' : 'Records'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {school.name} • {classNameDisplay} • {mediumDisplay}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Format Selector */}
            <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex text-xs">
              <button
                onClick={() => setReportFormat('GR_FULL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  reportFormat === 'GR_FULL' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {language === 'gu' ? 'સંપૂર્ણ G.R.' : 'Complete G.R.'}
              </button>
              <button
                onClick={() => setReportFormat('CONTACT_LIST')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  reportFormat === 'CONTACT_LIST' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {language === 'gu' ? 'વાલી સંપર્ક' : 'Parents Phone'}
              </button>
              <button
                onClick={() => setReportFormat('ACADEMIC_LIST')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  reportFormat === 'ACADEMIC_LIST' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {language === 'gu' ? 'હાજરી યાદી' : 'Roll List'}
              </button>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopyClipboard}
              title="Copy Tab-Separated Values for Google Sheets / Excel"
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center space-x-1 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            {/* Export Excel Button */}
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition-all hover:scale-105 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'gu' ? 'Excel / CSV ડાઉનલોડ' : 'Download Excel (CSV)'}</span>
            </button>

            {/* Print / Save PDF Button */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition-all hover:scale-105 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'gu' ? 'પ્રિન્ટ / PDF સેવ કરો' : 'Print / Save PDF'}</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable & Scrollable Report Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 text-slate-900">
          <div
            ref={printRef}
            className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto print:border-none print:shadow-none print:p-0"
          >
            {/* Gujarat Board Institutional Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center">
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono font-semibold mb-1">
                <span>GSEB SELF-FINANCED RECOGNIZED</span>
                <span>UDISE+: {school.udiseCode || '24090104512'}</span>
                <span>SESSION: 2026-2027</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
                {school.gujarati_name ? `${school.gujarati_name} (${school.name})` : school.name}
              </h1>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {school.address || 'GSEB Campus, Rajkot, Gujarat (360001)'} • Phone: {school.phone || '+91 98250 12345'}
              </p>
              <div className="mt-3 inline-block px-4 py-1 rounded bg-slate-900 text-white font-bold text-xs uppercase tracking-wider font-mono">
                {reportFormat === 'GR_FULL'
                  ? language === 'gu'
                    ? 'જનરલ રજિસ્ટર પ્રમાણિત વિદ્યાર્થી અહેવાલ (GENERAL REGISTER REPORT)'
                    : 'OFFICIAL GENERAL REGISTER (G.R.) ADMINISTRATIVE DOSSIER'
                  : reportFormat === 'CONTACT_LIST'
                  ? language === 'gu'
                    ? 'વાલી સંપર્ક અને ઈમરજન્સી ડિરેક્ટરી'
                    : 'STUDENT PARENT CONTACT & EMERGENCY DIRECTORY'
                  : language === 'gu'
                  ? 'શિક્ષણ અને વર્ગ હાજરી નોંધણી પત્રક'
                  : 'ACADEMIC CLASS ROLL & ATTENDANCE REGISTER'}
              </div>
            </div>

            {/* Filter Conditions & Summary Meta Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-slate-100/90 border border-slate-200 text-xs mb-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Class / Standard:</span>
                <span className="font-bold text-slate-800">{classNameDisplay}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Medium:</span>
                <span className="font-bold text-slate-800">{mediumDisplay}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Total Strength:</span>
                <span className="font-bold text-emerald-800 font-mono">
                  {students.length} Enrolled ({totalBoys} Boys / {totalGirls} Girls)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Report Generated:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {new Date().toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Formatted Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400">
                    <th className="p-2 border border-slate-300 w-8 text-center font-mono">#</th>
                    <th className="p-2 border border-slate-300 w-18 font-mono">G.R. No</th>
                    <th className="p-2 border border-slate-300">
                      {language === 'gu' ? 'વિદ્યાર્થી નામ (ગુજરાતી / English)' : 'Student Name'}
                    </th>
                    <th className="p-2 border border-slate-300 w-16 text-center">Class/Roll</th>
                    {reportFormat === 'GR_FULL' && (
                      <>
                        <th className="p-2 border border-slate-300 w-16 text-center">Medium</th>
                        <th className="p-2 border border-slate-300 w-20">DOB</th>
                        <th className="p-2 border border-slate-300">Parent / Guardian</th>
                        <th className="p-2 border border-slate-300 font-mono">Contact Phone</th>
                        <th className="p-2 border border-slate-300">Caste / Cat</th>
                      </>
                    )}
                    {reportFormat === 'CONTACT_LIST' && (
                      <>
                        <th className="p-2 border border-slate-300">Parent / Guardian</th>
                        <th className="p-2 border border-slate-300 font-mono">Primary Phone</th>
                        <th className="p-2 border border-slate-300">Address</th>
                      </>
                    )}
                    {reportFormat === 'ACADEMIC_LIST' && (
                      <>
                        <th className="p-2 border border-slate-300 w-16 text-center">Medium</th>
                        <th className="p-2 border border-slate-300 w-12 text-center">Gender</th>
                        <th className="p-2 border border-slate-300 w-20">DOB</th>
                        <th className="p-2 border border-slate-300 w-14 text-center">Blood</th>
                        <th className="p-2 border border-slate-300">Father Name</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-500 font-medium">
                        {language === 'gu'
                          ? 'કોઈ વિદ્યાર્થી રેકોર્ડ્સ મળ્યા નથી.'
                          : 'No student records match the active filter criteria.'}
                      </td>
                    </tr>
                  ) : (
                    students.map((s, idx) => {
                      const sClass = classes.find((c) => c.id === s.class_id);
                      return (
                        <tr
                          key={s.id}
                          className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}
                        >
                          <td className="p-1.5 border border-slate-300 text-center font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="p-1.5 border border-slate-300 font-mono font-bold text-blue-900 text-[11px]">
                            {s.gr_number}
                          </td>
                          <td className="p-1.5 border border-slate-300">
                            <div className="font-bold text-slate-900 text-[12px]">
                              {s.gujarati_name || `${s.first_name} ${s.last_name}`}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {s.first_name} {s.father_name || ''} {s.last_name}
                            </div>
                          </td>
                          <td className="p-1.5 border border-slate-300 text-center">
                            <div className="font-semibold text-slate-800 text-[11px]">
                              {sClass?.name || 'Class 10'}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">#{s.roll_no}</div>
                          </td>

                          {reportFormat === 'GR_FULL' && (
                            <>
                              <td className="p-1.5 border border-slate-300 text-center">
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    (s.medium || 'GUJARATI') === 'GUJARATI'
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'bg-blue-100 text-blue-900'
                                  }`}
                                >
                                  {(s.medium || 'GUJARATI') === 'GUJARATI' ? 'GUJ' : 'ENG'}
                                </span>
                              </td>
                              <td className="p-1.5 border border-slate-300 font-mono text-[11px]">
                                {s.dob || '-'}
                              </td>
                              <td className="p-1.5 border border-slate-300">
                                <div className="font-medium text-slate-800 text-[11px]">
                                  {s.parent_name || (s.father_name ? `Shri ${s.father_name}` : '-')}
                                </div>
                              </td>
                              <td className="p-1.5 border border-slate-300 font-mono text-[11px] text-slate-800">
                                {s.parent_phone || '-'}
                              </td>
                              <td className="p-1.5 border border-slate-300 text-[11px]">
                                <span className="font-medium text-slate-700">{s.caste || 'Patel'}</span>
                                <span className="text-[9px] text-slate-500 uppercase ml-1">
                                  ({s.category || 'GEN'})
                                </span>
                              </td>
                            </>
                          )}

                          {reportFormat === 'CONTACT_LIST' && (
                            <>
                              <td className="p-1.5 border border-slate-300">
                                <div className="font-medium text-slate-800 text-[11px]">
                                  {s.parent_name || 'Guardian'}
                                </div>
                              </td>
                              <td className="p-1.5 border border-slate-300 font-mono font-bold text-slate-900 text-[11px]">
                                {s.parent_phone}
                              </td>
                              <td className="p-1.5 border border-slate-300 text-[11px] text-slate-600 truncate max-w-xs">
                                {s.address || 'Gujarat, India'}
                              </td>
                            </>
                          )}

                          {reportFormat === 'ACADEMIC_LIST' && (
                            <>
                              <td className="p-1.5 border border-slate-300 text-center font-bold text-[10px]">
                                {(s.medium || 'GUJARATI') === 'GUJARATI' ? 'GUJ' : 'ENG'}
                              </td>
                              <td className="p-1.5 border border-slate-300 text-center font-mono text-[11px]">
                                {s.gender === 'FEMALE' ? 'F' : 'M'}
                              </td>
                              <td className="p-1.5 border border-slate-300 font-mono text-[11px]">
                                {s.dob || '-'}
                              </td>
                              <td className="p-1.5 border border-slate-300 text-center font-mono font-semibold text-[11px]">
                                {s.blood_group || '-'}
                              </td>
                              <td className="p-1.5 border border-slate-300 text-[11px] text-slate-700">
                                {s.father_name ? `Shri ${s.father_name}` : s.parent_name}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Official Signatures Section */}
            <div className="mt-8 pt-6 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <div className="h-10 border-b border-dashed border-slate-400 mx-6 mb-1" />
                <span className="font-bold text-slate-800">
                  {language === 'gu' ? 'ક્લાર્ક ની સહી (Prepared by)' : 'Office Clerk'}
                </span>
                <p className="text-[10px] text-slate-500">General Register Dept</p>
              </div>

              <div>
                <div className="h-10 border-b border-dashed border-slate-400 mx-6 mb-1" />
                <span className="font-bold text-slate-800">
                  {language === 'gu' ? 'તપાસનાર સુપરવાઇઝર' : 'Verified by Supervisor'}
                </span>
                <p className="text-[10px] text-slate-500">Academic Verification</p>
              </div>

              <div>
                <div className="h-10 border-b border-dashed border-slate-400 mx-6 mb-1 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-serif italic">Institutional Seal</span>
                </div>
                <span className="font-bold text-slate-900">
                  {language === 'gu' ? 'આચાર્યશ્રી ની સહી અને સિક્કો' : "Principal's Signature & Seal"}
                </span>
                <p className="text-[10px] text-slate-500">{school.name}</p>
              </div>
            </div>

            {/* Official Watermark & Harsh Ravaliya Credits */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>ClassSec Gujarat School ERP • Official Administrative Document</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-600 font-semibold">
                <span>Engineered with</span>
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
                <span>by</span>
                <span className="text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Harsh Ravaliya
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
