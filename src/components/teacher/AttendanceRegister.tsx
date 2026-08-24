import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AttendanceStatus, Student } from '../../types/erp';
import { erpDb } from '../../services/db';
import { WhatsAppNotifyModal } from '../modals/WhatsAppNotifyModal';
import {
  ClipboardCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Sparkles,
  Users,
  Search,
  Check,
  X,
  Phone,
  MessageCircle,
} from 'lucide-react';

export const AttendanceRegister: React.FC = () => {
  const { currentSchool, currentUser, refreshData } = useAuth();
  const { language, t } = useLanguage();

  const [selectedClassId, setSelectedClassId] = useState('class-10-a');
  const [selectedDate, setSelectedDate] = useState('2026-08-20');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // WhatsApp Alert State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppStudent, setWhatsAppStudent] = useState<Student | null>(null);

  const classes = erpDb.getClasses(currentSchool.id) || [];
  const students = erpDb.getStudents(currentSchool.id, 'TEACHER', currentUser?.id || '', selectedClassId) || [];

  // Local state map for attendance marks: studentId -> status
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const existing = erpDb.getStudentAttendance(currentSchool.id, selectedClassId, selectedDate) || [];
    const newMap: Record<string, AttendanceStatus> = {};
    const newRemarks: Record<string, string> = {};

    (students || []).forEach((s) => {
      const rec = existing.find((e) => e.entity_id === s.id);
      newMap[s.id] = rec ? rec.status : 'PRESENT';
      newRemarks[s.id] = rec?.remarks || '';
    });

    setAttendanceMap(newMap);
    setRemarksMap(newRemarks);
  }, [selectedClassId, selectedDate, currentSchool.id]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleRemarkChange = (studentId: string, remark: string) => {
    setRemarksMap((prev) => ({ ...prev, [studentId]: remark }));
  };

  const handleMarkAllPresent = () => {
    const newMap: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      newMap[s.id] = 'PRESENT';
    });
    setAttendanceMap(newMap);
  };

  const handleTriggerWhatsApp = (student: Student) => {
    setWhatsAppStudent(student);
    setIsWhatsAppModalOpen(true);
  };

  const handleSaveRegister = () => {
    const records = students.map((s) => ({
      student_id: s.id,
      student_name: s.gujarati_name || `${s.first_name} ${s.last_name}`,
      roll_no: s.roll_no,
      status: attendanceMap[s.id] || 'PRESENT',
      remarks: remarksMap[s.id] || undefined,
    }));

    erpDb.markBatchStudentAttendance(
      currentSchool.id,
      selectedClassId,
      selectedDate,
      records,
      currentUser?.id || 'stf-hitesh'
    );

    erpDb.logAudit({
      school_id: currentSchool.id,
      user_id: currentUser?.id || 'usr-teacher',
      user_name: currentUser?.full_name || 'Hiteshbhai Joshi',
      user_role: 'TEACHER',
      action: 'RECORD_ATTENDANCE',
      resource_type: 'ATTENDANCE',
      details: `Recorded daily roll register for ${selectedClassId} on date ${selectedDate}`,
      ip_address: '192.168.1.1',
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    refreshData();
  };

  const filteredStudents = (students || []).filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      (s.gujarati_name && s.gujarati_name.toLowerCase().includes(q)) ||
      s.roll_no.toString().includes(q) ||
      s.gr_number.toLowerCase().includes(q)
    );
  });

  const presentCount = Object.values(attendanceMap).filter((st) => st === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter((st) => st === 'ABSENT').length;
  const leaveCount = Object.values(attendanceMap).filter((st) => st === 'LEAVE').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-600" />
            <span>{t('attendance_register', 'Daily Attendance Register')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'gu'
              ? 'વર્ગ હાજરી પૂરો - ગેરહાજર વિદ્યાર્થીના વાલીને આપોઆપ SMS સૂચના મળશે'
              : 'Classroom daily roll register with automated parent notification for absentees.'}
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap">
          <button
            onClick={() => {
              setWhatsAppStudent(null);
              setIsWhatsAppModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{language === 'gu' ? 'વોટ્સએપ ગેરહાજરી કેન્દ્ર' : 'WhatsApp Absence Hub'}</span>
          </button>

          <button
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{t('mark_all_present', 'Mark All Present (બધા હાજર)')}</span>
          </button>

          <button
            onClick={handleSaveRegister}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t('save_attendance', 'Save Register')}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>
            {language === 'gu'
              ? 'હાજરી પત્રક સફળતાપૂર્વક સાચવવામાં આવ્યું છે અને ગેરહાજર વાલીઓને SMS મોકલાઈ ગયો છે!'
              : 'Attendance register saved successfully! SMS notification triggered for absent students.'}
          </span>
        </div>
      )}

      {/* Control Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Class Select */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500 font-semibold">{t('standard', 'Class')}:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Select */}
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'gu' ? 'નામ અથવા રોલ નં. થી શોધો...' : 'Search by student name or roll...'}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 flex items-center justify-between">
          <span className="font-semibold">{language === 'gu' ? 'હાજર (Present)' : 'Present'}</span>
          <span className="text-lg font-bold">{presentCount}</span>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-800 flex items-center justify-between">
          <span className="font-semibold">{language === 'gu' ? 'ગેરહાજર (Absent)' : 'Absent'}</span>
          <span className="text-lg font-bold">{absentCount}</span>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 flex items-center justify-between">
          <span className="font-semibold">{language === 'gu' ? 'રજા પર (Leave)' : 'On Leave'}</span>
          <span className="text-lg font-bold">{leaveCount}</span>
        </div>
      </div>

      {/* Student Attendance Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[650px] w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4 w-16">{t('roll_no', 'Roll')}</th>
                <th className="py-3 px-4">{t('student_name', 'Student Name')}</th>
                <th className="py-3 px-4">{t('gr_no', 'G.R. No')}</th>
                <th className="py-3 px-4 text-center">{language === 'gu' ? 'હાજરી સ્થિતિ (Status)' : 'Attendance Status'}</th>
                <th className="py-3 px-4">{language === 'gu' ? 'શિક્ષકની નોંધ' : 'Remarks'}</th>
                <th className="py-3 px-4 text-center">{language === 'gu' ? 'વોટ્સએપ' : 'WhatsApp'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => {
                const status = attendanceMap[s.id] || 'PRESENT';
                const isAbsentOrLeave = status === 'ABSENT' || status === 'LEAVE';

                return (
                  <tr key={s.id} className={`hover:bg-slate-50 transition-colors ${status === 'ABSENT' ? 'bg-rose-50/20' : status === 'LEAVE' ? 'bg-amber-50/20' : ''}`}>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      #{s.roll_no}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {s.gujarati_name || `${s.first_name} ${s.last_name}`}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {s.first_name} {s.father_name || ''} {s.last_name}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-900 font-semibold">
                      {s.gr_number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'PRESENT')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1 ${
                            status === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{language === 'gu' ? 'હાજર' : 'P'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'ABSENT')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1 ${
                            status === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>{language === 'gu' ? 'ગેરહાજર' : 'A'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'LEAVE')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1 ${
                            status === 'LEAVE'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>{language === 'gu' ? 'રજા' : 'L'}</span>
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder={language === 'gu' ? 'નોંધ લખો (દા.ત. બીમારી)...' : 'Add remark (e.g. sick leave)...'}
                        value={remarksMap[s.id] || ''}
                        onChange={(e) => handleRemarkChange(s.id, e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleTriggerWhatsApp(s)}
                        className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] inline-flex items-center space-x-1 transition-all cursor-pointer ${
                          isAbsentOrLeave
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border-slate-200'
                        }`}
                        title="Send WhatsApp Notice to Parent"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{isAbsentOrLeave ? (language === 'gu' ? 'મોકલો' : 'Alert') : 'WhatsApp'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Modal for Attendance */}
      {isWhatsAppModalOpen && (
        <WhatsAppNotifyModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => setIsWhatsAppModalOpen(false)}
          initialType="LEAVE"
          initialStudent={whatsAppStudent}
        />
      )}
    </div>
  );
};
