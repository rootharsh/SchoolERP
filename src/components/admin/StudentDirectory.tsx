import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Student, SchoolClass } from '../../types/erp';
import { erpDb } from '../../services/db';
import { Modal } from '../common/UIComponents';
import { ReportCardModal } from '../modals/ReportCardModal';
import { LeavingCertificateModal } from '../modals/LeavingCertificateModal';
import { BulkStudentExportModal } from '../modals/BulkStudentExportModal';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Trash2,
  FileSpreadsheet,
  Download,
  Phone,
  Calendar,
  Award,
  Scroll,
  FileText,
  MapPin,
  Heart,
  Printer,
  Sparkles,
} from 'lucide-react';

interface StudentDirectoryProps {
  onOpenCsvImport?: () => void;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({ onOpenCsvImport }) => {
  const { currentSchool, currentUser, refreshData } = useAuth();
  const { language, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedMedium, setSelectedMedium] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [reportCardStudent, setReportCardStudent] = useState<Student | null>(null);
  const [lcStudent, setLcStudent] = useState<Student | null>(null);

  // Form State for Adding Student
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gujaratiName, setGujaratiName] = useState('');
  const [grNumber, setGrNumber] = useState(`GR-${Math.floor(4830 + Math.random() * 900)}`);
  const [classId, setClassId] = useState('class-10-a');
  const [medium, setMedium] = useState<'GUJARATI' | 'ENGLISH'>('GUJARATI');
  const [rollNo, setRollNo] = useState<number>(31);
  const [dob, setDob] = useState('2010-06-15');
  const [birthPlace, setBirthPlace] = useState('Rajkot (રાજકોટ)');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [caste, setCaste] = useState('Patel (Kadva Patidar)');
  const [address, setAddress] = useState('');

  const classes = erpDb.getClasses(currentSchool.id) || [];
  const students = erpDb.getStudents(currentSchool.id, 'PRINCIPAL', currentUser?.id || '', selectedClass) || [];

  const filteredStudents = (students || []).filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      (s.gujarati_name && s.gujarati_name.toLowerCase().includes(q)) ||
      s.gr_number.toLowerCase().includes(q) ||
      s.roll_no.toString().includes(q) ||
      s.parent_name.toLowerCase().includes(q);

    const matchesMedium =
      selectedMedium === 'ALL' || (s.medium || 'GUJARATI') === selectedMedium;

    return matchesSearch && matchesMedium;
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !grNumber) return;

    erpDb.addStudent(currentSchool.id, {
      first_name: firstName,
      last_name: lastName,
      gujarati_name: gujaratiName || `${firstName} ${fatherName || ''} ${lastName}`,
      gr_number: grNumber,
      class_id: classId,
      roll_no: Number(rollNo),
      medium,
      dob,
      birth_place: birthPlace,
      gender,
      blood_group: bloodGroup,
      parent_name: fatherName ? `Shri ${fatherName} ${lastName}` : 'Guardian',
      father_name: fatherName,
      mother_name: motherName,
      parent_phone: parentPhone || '+91 98250 00000',
      parent_user_id: 'usr-parent-default',
      caste,
      address: address || 'Rajkot, Gujarat',
      admission_date: new Date().toISOString().split('T')[0],
      status: 'ENROLLED',
      emergency_contact: parentPhone || '+91 98250 00000',
    });

    erpDb.logAudit({
      school_id: currentSchool.id,
      user_id: currentUser?.id || 'usr-principal',
      user_name: currentUser?.full_name || 'Principal',
      user_role: 'PRINCIPAL',
      action: 'ADD_STUDENT',
      resource_type: 'STUDENTS',
      details: `Enrolled new student ${firstName} ${lastName} (${grNumber}) in ${classId}`,
      ip_address: '192.168.1.1',
    });

    setIsAddModalOpen(false);
    // Reset form
    setFirstName('');
    setLastName('');
    setGujaratiName('');
    setFatherName('');
    setMotherName('');
    setParentPhone('');
    setAddress('');
    refreshData();
  };

  const handleDelete = (studentId: string, name: string) => {
    if (window.confirm(language === 'gu'
      ? `શું તમે ખરેખર ${name} નું વિદ્યાર્થી રજિસ્ટર રેકોર્ડ કાઢી નાખવા માંગો છો?`
      : `Are you sure you want to withdraw and remove student record for ${name}?`)) {
      erpDb.deleteStudent(studentId);
      refreshData();
    }
  };

  const currentMarks = reportCardStudent ? erpDb.getStudentMarks(reportCardStudent.id) : [];

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>{t('nav_students', 'Student Register (G.R.)')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'gu'
              ? 'જનરલ રજિસ્ટર (G.R.), પ્રવેશ વિગતો, પરિણામ પત્રક અને L.C. સંચાલન'
              : `Complete student dossiers, general register (G.R.) records for ${currentSchool.name}.`}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Bulk Export Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all hover:scale-105 cursor-pointer border border-slate-700"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>{language === 'gu' ? 'અહેવાલ નિકાસ (PDF / Excel)' : 'Export Register (PDF/Excel)'}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-700">
              {filteredStudents.length}
            </span>
          </button>

          {onOpenCsvImport && (
            <button
              onClick={onOpenCsvImport}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{t('nav_csv_import', 'Bulk CSV Ingest')}</span>
            </button>
          )}

          <button
            onClick={() => {
              setGrNumber(`GR-${Math.floor(4830 + Math.random() * 900)}`);
              setIsAddModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_student', '+ New Admission (G.R.)')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search', 'Search by name, G.R. No, Phone...')}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Class Filter */}
          <div className="flex items-center space-x-1.5 w-full md:w-auto">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              {t('standard', 'Class')}:
            </span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">{language === 'gu' ? 'બધા ધોરણ (All Classes)' : 'All Classes'}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Medium Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              {t('medium', 'Medium')}:
            </span>
            <select
              value={selectedMedium}
              onChange={(e) => setSelectedMedium(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">{t('filter_all', 'All')}</option>
              <option value="GUJARATI">{t('gujarati_medium', 'Gujarati Medium')}</option>
              <option value="ENGLISH">{t('english_medium', 'English Medium')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Stats & Quick Export Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white px-4 py-3 rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-700">
        <div className="flex items-center space-x-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-medium text-slate-300">
            {language === 'gu' ? 'ફિલ્ટર કરેલ રેકોર્ડ્સ:' : 'Showing Filtered Records:'}
          </span>
          <span className="font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
            {filteredStudents.length} / {students.length} {language === 'gu' ? 'વિદ્યાર્થીઓ' : 'Students'}
          </span>
          {(selectedClass !== 'ALL' || selectedMedium !== 'ALL' || searchQuery) && (
            <span className="text-[11px] text-slate-400 hidden md:inline">
              ({selectedClass !== 'ALL' ? classes.find((c) => c.id === selectedClass)?.name : ''}
              {selectedMedium !== 'ALL' ? ` • ${selectedMedium}` : ''}
              {searchQuery ? ` • "${searchQuery}"` : ''})
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'gu' ? 'G.R. અહેવાલ / PDF' : 'PDF G.R. Report'}</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{language === 'gu' ? 'Excel શીટ (.CSV)' : 'Excel Sheet (.CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[750px] w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">{t('gr_no', 'G.R. Number')}</th>
                <th className="py-3 px-4">{language === 'gu' ? 'વિદ્યાર્થીનું નામ (ગુજરાતી / English)' : 'Student Name'}</th>
                <th className="py-3 px-4">{language === 'gu' ? 'ધોરણ અને રોલ નં.' : 'Class & Roll'}</th>
                <th className="py-3 px-4">{t('medium', 'Medium')}</th>
                <th className="py-3 px-4">{language === 'gu' ? 'વાલી અને મોબાઈલ' : 'Parent & Phone'}</th>
                <th className="py-3 px-4">{language === 'gu' ? 'જ્ઞાતિ' : 'Caste/Category'}</th>
                <th className="py-3 px-4 text-right">{language === 'gu' ? 'પ્રમાણપત્રો અને ક્રિયા' : 'Certificates & Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    {language === 'gu' ? 'કોઈ વિદ્યાર્થી રેકોર્ડ મળ્યો નથી.' : 'No student records found matching the query.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const sClass = classes.find((c) => c.id === s.class_id);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-900">
                        {s.gr_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {s.gujarati_name || `${s.first_name} ${s.last_name}`}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {s.first_name} {s.father_name || ''} {s.last_name}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {sClass?.name || 'Class 10th-A'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {t('roll_no', 'Roll No')}: #{s.roll_no}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          (s.medium || 'GUJARATI') === 'GUJARATI'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          {(s.medium || 'GUJARATI') === 'GUJARATI' ? 'ગુજરાતી' : 'English'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{s.parent_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{s.parent_phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-700 font-medium">{s.caste || 'Patel'}</span>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">{s.category || 'GEN'}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Leaving Certificate (L.C.) Button */}
                          <button
                            onClick={() => setLcStudent(s)}
                            title={language === 'gu' ? 'શાળા છોડ્યાનું પ્રમાણપત્ર (L.C.)' : 'School Leaving Certificate (L.C.)'}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1"
                          >
                            <Scroll className="w-3 h-3 text-amber-700" />
                            <span>L.C.</span>
                          </button>

                          {/* Report Card Button */}
                          <button
                            onClick={() => setReportCardStudent(s)}
                            title={language === 'gu' ? 'પ્રગતિ પત્રક (રિપોર્ટ કાર્ડ)' : 'Progress Report Card'}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1"
                          >
                            <Award className="w-3 h-3 text-emerald-700" />
                            <span>{language === 'gu' ? 'પરિણામ' : 'Marks'}</span>
                          </button>

                          {/* View Dossier Button */}
                          <button
                            onClick={() => setViewingStudent(s)}
                            title={language === 'gu' ? 'સંપૂર્ણ વિગતો જુઓ' : 'View Full Dossier'}
                            className="p-1.5 hover:bg-slate-200 text-slate-600 rounded transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(s.id, s.gujarati_name || `${s.first_name} ${s.last_name}`)}
                            title={t('delete', 'Delete')}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={language === 'gu' ? 'નવો વિદ્યાર્થી પ્રવેશ નોંધણી (G.R. એન્ટ્રી)' : 'New Student Admission (G.R. Entry)'}
        subtitle={language === 'gu' ? 'ગુજરાત માધ્યમિક બોર્ડ શૈક્ષણિક સત્ર ૨૦૨૬-૨૭' : 'GSEB Academic Session 2026-27'}
        maxWidth="2xl"
      >
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'gu' ? 'જનરલ રજિસ્ટર (G.R.) નં.' : 'G.R. Number'} *
              </label>
              <input
                type="text"
                required
                value={grNumber}
                onChange={(e) => setGrNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-blue-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'gu' ? 'પ્રથમ નામ (First Name)' : 'First Name'} *
              </label>
              <input
                type="text"
                required
                placeholder="Harsh"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'gu' ? 'અટક (Last Name)' : 'Last Name'} *
              </label>
              <input
                type="text"
                required
                placeholder="Patel"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'gu' ? 'વિદ્યાર્થીનું પૂરું ગુજરાતી નામ' : 'Student Full Name (Gujarati)'}
              </label>
              <input
                type="text"
                placeholder="હર્ષ વિનોદભાઈ પટેલ"
                value={gujaratiName}
                onChange={(e) => setGujaratiName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'gu' ? 'પિતાનું નામ' : "Father's Name"}
              </label>
              <input
                type="text"
                placeholder="Vinodbhai Ranchhodbhai"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('standard', 'Class')}
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('medium', 'Medium')}
              </label>
              <select
                value={medium}
                onChange={(e) => setMedium(e.target.value as 'GUJARATI' | 'ENGLISH')}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="GUJARATI">ગુજરાતી માધ્યમ (Gujarati)</option>
                <option value="ENGLISH">English Medium</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('roll_no', 'Roll No')}
              </label>
              <input
                type="number"
                value={rollNo}
                onChange={(e) => setRollNo(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'gu' ? 'જન્મ તારીખ' : 'Date of Birth'}
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'gu' ? 'જન્મ સ્થળ' : 'Place of Birth'}
              </label>
              <input
                type="text"
                placeholder="Rajkot (રાજકોટ)"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'gu' ? 'જ્ઞાતિ / Caste' : 'Caste & Category'}
              </label>
              <input
                type="text"
                placeholder="Patel (Kadva Patidar)"
                value={caste}
                onChange={(e) => setCaste(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'gu' ? 'વાલીનો મોબાઈલ નંબર' : 'Parent Mobile Number'}
              </label>
              <input
                type="tel"
                placeholder="+91 98252 44119"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'gu' ? 'રહેઠાણનું સરનામું' : 'Residential Address'}
              </label>
              <input
                type="text"
                placeholder="Kalawad Road, Rajkot"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              {t('cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {language === 'gu' ? 'પ્રવેશ નોંધણી પૂર્ણ કરો' : 'Complete Admission'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Student Dossier Modal */}
      {viewingStudent && (
        <Modal
          isOpen={!!viewingStudent}
          onClose={() => setViewingStudent(null)}
          title={language === 'gu' ? 'વિદ્યાર્થી પ્રોફાઇલ અને G.R. માહિતી' : 'Student Dossier & G.R. Profile'}
          subtitle={`${viewingStudent.gujarati_name || `${viewingStudent.first_name} ${viewingStudent.last_name}`} • G.R. No: ${viewingStudent.gr_number}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 uppercase text-[10px] font-bold block">{t('gr_no', 'G.R. No')}</span>
                <span className="font-mono font-bold text-blue-900 text-sm">{viewingStudent.gr_number}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px] font-bold block">{t('medium', 'Medium')}</span>
                <span className="font-semibold text-emerald-800">
                  {viewingStudent.medium === 'GUJARATI' ? 'ગુજરાતી માધ્યમ' : 'English Medium'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px] font-bold block">
                  {language === 'gu' ? 'જન્મ તારીખ' : 'Birth Date'}
                </span>
                <span className="font-mono font-medium text-slate-800">{viewingStudent.dob}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px] font-bold block">
                  {language === 'gu' ? 'જ્ઞાતિ' : 'Caste'}
                </span>
                <span className="font-medium text-slate-800">{viewingStudent.caste || 'Patel'}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">
                {language === 'gu' ? 'વાલી અને સરનામાં વિગતો' : 'Family & Contact Information'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 font-semibold block">{language === 'gu' ? 'પિતાનું નામ' : "Father's Name"}:</span>
                  <span className="font-medium text-slate-800">{viewingStudent.father_name || viewingStudent.parent_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">{language === 'gu' ? 'વાલી મોબાઈલ' : 'Parent Phone'}:</span>
                  <span className="font-mono font-bold text-slate-900">{viewingStudent.parent_phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 font-semibold block">{language === 'gu' ? 'રહેઠાણ સરનામું' : 'Address'}:</span>
                  <span className="text-slate-800">{viewingStudent.address}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setViewingStudent(null);
                    setLcStudent(viewingStudent);
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Scroll className="w-3.5 h-3.5" />
                  <span>{language === 'gu' ? 'L.C. પ્રમાણપત્ર જનરેટ કરો' : 'Generate L.C.'}</span>
                </button>
                <button
                  onClick={() => {
                    setViewingStudent(null);
                    setReportCardStudent(viewingStudent);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{language === 'gu' ? 'રિપોર્ટ કાર્ડ જુઓ' : 'View Report Card'}</span>
                </button>
              </div>

              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                {t('close', 'Close')}
              </button>
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
          marks={currentMarks}
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

      {/* Bulk Export Modal for PDF / Excel */}
      <BulkStudentExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        students={filteredStudents}
        school={currentSchool}
        classes={classes}
        selectedClassId={selectedClass}
        selectedMedium={selectedMedium}
        searchQuery={searchQuery}
      />
    </div>
  );
};
