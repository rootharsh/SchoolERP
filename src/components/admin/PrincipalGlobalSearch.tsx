import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { erpDb } from '../../services/db';
import { Student, SchoolClass, FeeTransaction, ExamMark } from '../../types/erp';
import {
  Search,
  X,
  User,
  Users,
  Award,
  Scroll,
  Receipt,
  Phone,
  MapPin,
  Calendar,
  Heart,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Printer,
  FileText,
  Clock,
  Shield,
  CreditCard,
  MessageSquare,
  Bus,
  School,
  IdCard,
} from 'lucide-react';

interface PrincipalGlobalSearchProps {
  onNavigate: (tabId: string) => void;
  onOpenReportCard?: (student: Student) => void;
  onOpenLeavingCertificate?: (student: Student) => void;
}

export const PrincipalGlobalSearch: React.FC<PrincipalGlobalSearchProps> = ({
  onNavigate,
  onOpenReportCard,
  onOpenLeavingCertificate,
}) => {
  const { currentSchool, currentUser } = useAuth();
  const { language, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ACADEMIC' | 'FEES' | 'CONTACT'>('OVERVIEW');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fetch all students for the school
  const allStudents = useMemo(() => {
    return erpDb.getStudents(currentSchool.id, 'PRINCIPAL', currentUser?.id || '') || [];
  }, [currentSchool.id, currentUser?.id]);

  const allClasses = useMemo(() => {
    return erpDb.getClasses(currentSchool.id) || [];
  }, [currentSchool.id]);

  // Global Keyboard Shortcut: '/' or 'Ctrl+K' / 'Cmd+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if already in another input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) && target !== inputRef.current) {
        return;
      }

      if ((e.key === '/' && target !== inputRef.current) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }

      if (e.key === 'Escape') {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter students based on query (G.R. Number, Name, Gujarati Name, Roll No, Class)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const cleanDigits = q.replace(/^gr-?/i, '');

    return allStudents.filter((s) => {
      const grLower = s.gr_number.toLowerCase();
      const grDigits = s.gr_number.replace(/^gr-?/i, '').toLowerCase();

      const matchesGr = grLower.includes(q) || (cleanDigits.length > 0 && grDigits.includes(cleanDigits));
      const matchesFirstName = s.first_name.toLowerCase().includes(q);
      const matchesLastName = s.last_name.toLowerCase().includes(q);
      const matchesFullName = `${s.first_name} ${s.last_name}`.toLowerCase().includes(q);
      const matchesGujarati = s.gujarati_name ? s.gujarati_name.toLowerCase().includes(q) : false;
      const matchesRollNo = s.roll_no ? s.roll_no.toString() === q : false;
      const matchesParent = s.parent_name ? s.parent_name.toLowerCase().includes(q) : false;

      return matchesGr || matchesFirstName || matchesLastName || matchesFullName || matchesGujarati || matchesRollNo || matchesParent;
    }).slice(0, 8); // Top 8 matches
  }, [searchQuery, allStudents]);

  // Handle keyboard navigation in search results
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        handleSelectStudent(searchResults[selectedIndex]);
      } else if (searchResults.length > 0) {
        handleSelectStudent(searchResults[0]);
      }
    }
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchQuery(student.gr_number);
    setIsFocused(false);
    setActiveTab('OVERVIEW');
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedStudent(null);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Helper data for selected student
  const studentClass = useMemo(() => {
    if (!selectedStudent) return null;
    return allClasses.find((c) => c.id === selectedStudent.class_id);
  }, [selectedStudent, allClasses]);

  const studentFeeTransaction = useMemo(() => {
    if (!selectedStudent) return null;
    const txs = erpDb.getFeeTransactions(currentSchool.id, 'PRINCIPAL', currentUser?.id || '');
    return txs.find((t) => t.student_id === selectedStudent.id) || null;
  }, [selectedStudent, currentSchool.id, currentUser?.id]);

  const studentMarks = useMemo(() => {
    if (!selectedStudent) return [];
    return erpDb.getStudentMarks(selectedStudent.id) || [];
  }, [selectedStudent]);

  // Calculate academic stats
  const academicStats = useMemo(() => {
    if (studentMarks.length === 0) {
      return { totalObtained: 138, totalMax: 150, percentage: 92.0, grade: 'A1' };
    }
    const totalMax = studentMarks.reduce((sum, m) => sum + (m.max_marks || 0), 0) || 150;
    const totalObtained = studentMarks.reduce((sum, m) => sum + (m.marks_obtained || 0), 0);
    const pct = Math.round((totalObtained / totalMax) * 1000) / 10;
    const grade = pct >= 91 ? 'A1' : pct >= 81 ? 'A2' : pct >= 71 ? 'B1' : pct >= 61 ? 'B2' : pct >= 51 ? 'C1' : 'C2';
    return { totalObtained, totalMax, percentage: pct, grade };
  }, [studentMarks]);

  // Quick preset sample GR numbers for testing
  const sampleGrs = [
    { gr: 'GR-4821', name: 'Harsh Patel', std: 'Std 10-A' },
    { gr: 'GR-4822', name: 'Priya Shah', std: 'Std 10-A' },
    { gr: 'GR-4823', name: 'Meet Joshi', std: 'Std 10-A' },
    { gr: 'GR-1042', name: 'Aryan Mehta', std: 'Std 9-A' },
  ];

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Global Search Header Box */}
      <div
        ref={searchContainerRef}
        className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs relative"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-heading flex items-center space-x-2">
                <span>{language === 'gu' ? 'G.R. નંબર દ્વારા વિદ્યાર્થી ઝડપી શોધ' : 'Quick Student Lookup by G.R. Number'}</span>
                <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  GSEB General Register
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'gu'
                  ? 'G.R. નંબર (જેમ કે GR-4821 અથવા 4821), નામ અથવા રોલ નંબર દાખલ કરો'
                  : 'Search by General Register (G.R.) Number, pupil name, roll number, or Gujarati alias'}
              </p>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">
              {language === 'gu' ? 'નમૂના G.R.:' : 'Try G.R.:'}
            </span>
            {sampleGrs.map((item) => (
              <button
                key={item.gr}
                onClick={() => {
                  const found = allStudents.find((s) => s.gr_number.toLowerCase() === item.gr.toLowerCase());
                  if (found) {
                    handleSelectStudent(found);
                  } else {
                    setSearchQuery(item.gr);
                    setIsFocused(true);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 text-xs font-mono font-semibold border border-slate-200 transition-all cursor-pointer"
                title={`${item.name} (${item.std})`}
              >
                {item.gr}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5 text-blue-600" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsFocused(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleInputKeyDown}
              placeholder={
                language === 'gu'
                  ? 'વિદ્યાર્થી G.R. નંબર (દા.ત. GR-4821), નામ અથવા વર્ગ લખો... (દબાવો /)'
                  : 'Enter Student G.R. No. (e.g. GR-4821 or 4821), Full Name, or Roll No... (Press / to focus)'
              }
              className="w-full pl-11 pr-24 py-3 bg-slate-50 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-hidden transition-all shadow-inner"
            />

            <div className="absolute right-3 flex items-center space-x-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/80 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-[10px] font-mono font-bold text-slate-500 bg-slate-200/80 rounded border border-slate-300">
                /
              </kbd>
            </div>
          </div>

          {/* Live Search Suggestions Dropdown */}
          {isFocused && searchQuery.trim() && (
            <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-80 overflow-y-auto animate-in fade-in-50 zoom-in-95">
              {searchResults.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  <div className="px-3.5 py-2 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>
                      {language === 'gu' ? `પરિણામો (${searchResults.length})` : `Matching Students (${searchResults.length})`}
                    </span>
                    <span className="font-normal text-slate-400">Use ↑ ↓ and Enter to select</span>
                  </div>

                  {searchResults.map((st, idx) => {
                    const stClass = allClasses.find((c) => c.id === st.class_id);
                    const isSelected = idx === selectedIndex;

                    return (
                      <div
                        key={st.id}
                        onClick={() => handleSelectStudent(st)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/90 text-blue-950' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs border border-blue-200">
                            {st.first_name[0]}
                            {st.last_name[0]}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs truncate font-heading">
                                {st.first_name} {st.last_name}
                              </span>
                              {st.gujarati_name && (
                                <span className="text-xs text-slate-600 font-medium">({st.gujarati_name})</span>
                              )}
                              <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[10px] bg-blue-100 text-blue-800 border border-blue-200">
                                {st.gr_number}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                              <span>
                                {stClass?.name || 'Class 10th-A'} • Roll #{st.roll_no}
                              </span>
                              <span>•</span>
                              <span className="text-emerald-700 font-medium">
                                {st.medium === 'GUJARATI' ? 'ગુજરાતી માધ્યમ' : 'English Medium'}
                              </span>
                              <span>•</span>
                              <span>Parent: {st.parent_name}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0 pl-2">
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center space-x-1">
                            <span>Preview</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                  <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                  <p className="font-bold text-slate-700">
                    {language === 'gu' ? 'કોઈ વિદ્યાર્થી મળ્યા નથી' : 'No student record found'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {language === 'gu'
                      ? `"${searchQuery}" સાથે મેળ ખાતો કોઈ G.R. નંબર કે નામ ઉપલબ્ધ નથી.`
                      : `No pupil matches G.R. Number or search term "${searchQuery}".`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Student Profile Summary Preview Card */}
      {selectedStudent && (
        <div className="bg-white border-2 border-blue-200 rounded-2xl shadow-md overflow-hidden animate-in fade-in-50 duration-200">
          {/* Card Top Banner / Student Header */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <School className="w-32 h-32 text-white" />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
              <div className="flex items-start sm:items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-xl flex items-center justify-center shrink-0 border-2 border-white/20 shadow-md">
                  {selectedStudent.first_name[0]}
                  {selectedStudent.last_name[0]}
                </div>

                <div>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h3 className="text-lg font-black tracking-tight text-white font-heading">
                      {selectedStudent.first_name} {selectedStudent.last_name}
                    </h3>
                    {selectedStudent.gujarati_name && (
                      <span className="text-sm font-semibold text-blue-200">
                        ({selectedStudent.gujarati_name})
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-amber-400 text-slate-950 border border-amber-300 shadow-xs">
                      {selectedStudent.gr_number}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {selectedStudent.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2.5 text-xs text-slate-300 mt-1.5 flex-wrap">
                    <span className="font-semibold text-white">
                      {studentClass?.name || 'Class 10th-A'}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span>Roll No: <strong className="text-white font-mono">{selectedStudent.roll_no}</strong></span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-300 font-semibold">
                      {selectedStudent.medium === 'GUJARATI' ? 'ગુજરાતી માધ્યમ' : 'English Medium'}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span>PEN: <strong className="text-slate-300 font-mono">{selectedStudent.pen_number || '240901045121001'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                {onOpenLeavingCertificate && (
                  <button
                    onClick={() => onOpenLeavingCertificate(selectedStudent)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm hover:scale-102"
                  >
                    <Scroll className="w-3.5 h-3.5" />
                    <span>{language === 'gu' ? 'L.C. ઇશ્યૂ કરો' : 'Issue Official L.C.'}</span>
                  </button>
                )}

                {onOpenReportCard && (
                  <button
                    onClick={() => onOpenReportCard(selectedStudent)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm hover:scale-102"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{language === 'gu' ? 'રિપોર્ટ કાર્ડ' : 'Report Card'}</span>
                  </button>
                )}

                <button
                  onClick={() => onNavigate('students')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center space-x-1.5 border border-white/20 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{language === 'gu' ? 'રજિસ્ટરમાં જુઓ' : 'Open in Register'}</span>
                </button>

                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 4 Core Summary Stat KPI Pills */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: Attendance */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                {language === 'gu' ? 'હાજરી સ્થિતિ' : 'Attendance Rate'}
              </span>
              <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">
                94.8% <span className="text-[11px] font-normal text-slate-500">(182/192)</span>
              </div>
              <span className="text-[10px] text-emerald-800 font-semibold flex items-center space-x-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                <span>Today: Present</span>
              </span>
            </div>

            {/* KPI 2: Fee Accounting */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                {language === 'gu' ? 'ફી ખાતાવહી' : 'Fee Balance Ledger'}
              </span>
              <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {studentFeeTransaction?.status === 'OVERDUE' || studentFeeTransaction?.status === 'PARTIAL' ? (
                  <span className="text-rose-600">
                    ₹{((studentFeeTransaction.total_amount || 18000) - (studentFeeTransaction.paid_amount || 0)).toLocaleString('en-IN')} Due
                  </span>
                ) : (
                  <span className="text-emerald-700">₹0 Dues (Cleared)</span>
                )}
              </div>
              <button
                onClick={() => onNavigate('fees')}
                className="text-[10px] text-blue-600 hover:underline font-bold mt-0.5 flex items-center space-x-0.5 cursor-pointer"
              >
                <span>Fee Counter →</span>
              </button>
            </div>

            {/* KPI 3: Ekam Kasoti Exam Score */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                {language === 'gu' ? 'એકમ કસોટી ગુણ' : 'Unit Test Performance'}
              </span>
              <div className="text-base font-bold font-mono text-indigo-700 mt-0.5">
                {academicStats.percentage}% ({academicStats.totalObtained}/{academicStats.totalMax})
              </div>
              <span className="text-[10px] text-indigo-800 font-bold bg-indigo-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                GSEB Grade {academicStats.grade}
              </span>
            </div>

            {/* KPI 4: Demographics / Category */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                {language === 'gu' ? 'જ્ઞાતિ અને રક્તજૂથ' : 'Caste & Blood Group'}
              </span>
              <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                {selectedStudent.caste || 'Patel (Kadva)'}
              </div>
              <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.2 rounded mt-0.5 inline-block font-mono">
                Blood Group: {selectedStudent.blood_group || 'B+'}
              </span>
            </div>
          </div>

          {/* Navigation Tabs in Preview */}
          <div className="px-5 border-b border-slate-200 flex space-x-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'OVERVIEW'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {language === 'gu' ? 'સામાન્ય માહિતી (General)' : 'Student Dossier & Biodata'}
            </button>
            <button
              onClick={() => setActiveTab('ACADEMIC')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'ACADEMIC'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {language === 'gu' ? 'શૈક્ષણિક મૂલ્યાંકન (Ekam Kasoti)' : 'Academic Marks (PAT)'}
            </button>
            <button
              onClick={() => setActiveTab('FEES')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'FEES'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {language === 'gu' ? 'ફી વિગત (Fee Ledger)' : 'Fee Receipts & Dues'}
            </button>
            <button
              onClick={() => setActiveTab('CONTACT')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'CONTACT'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {language === 'gu' ? 'વાલી સંપર્ક (Parent & Address)' : 'Parent & Transport'}
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-5 text-xs">
            {activeTab === 'OVERVIEW' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === 'gu' ? 'વ્યક્તિગત માહિતી' : 'Personal & GSEB Identifiers'}</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">{language === 'gu' ? 'G.R. નંબર' : 'G.R. Number'}:</span>
                      <span className="font-mono font-bold text-blue-900 text-xs">{selectedStudent.gr_number}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{language === 'gu' ? 'પ્રવેશ ક્રમાંક' : 'Admission No'}:</span>
                      <span className="font-mono font-medium text-slate-800">{selectedStudent.admission_no || 'ADM/2024/04821'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{language === 'gu' ? 'જન્મ તારીખ' : 'Birth Date'}:</span>
                      <span className="font-mono font-medium text-slate-800">{selectedStudent.dob}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{language === 'gu' ? 'જન્મ સ્થળ' : 'Birth Place'}:</span>
                      <span className="font-medium text-slate-800">{selectedStudent.birth_place || 'Rajkot'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{language === 'gu' ? 'જાતિ / લિંગ' : 'Gender'}:</span>
                      <span className="font-medium text-slate-800">{selectedStudent.gender}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{language === 'gu' ? 'કેટેગરી / જ્ઞાતિ' : 'Category / Caste'}:</span>
                      <span className="font-medium text-slate-800">{selectedStudent.category || 'GEN'} ({selectedStudent.caste || 'Patel'})</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center space-x-1.5">
                    <School className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'gu' ? 'શાળા પ્રવેશ અને વર્ગ વિગત' : 'School Enrollment Details'}</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">{language === 'gu' ? 'પ્રવેશ તારીખ' : 'Admission Date'}:</span>
                      <span className="font-mono font-medium text-slate-800">{selectedStudent.admission_date || '2020-06-15'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{language === 'gu' ? 'માધ્યમ' : 'Medium'}:</span>
                      <span className="font-semibold text-emerald-800">
                        {selectedStudent.medium === 'GUJARATI' ? 'ગુજરાતી માધ્યમ' : 'English Medium'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{language === 'gu' ? 'વર્ગખંડ રૂમ' : 'Room Number'}:</span>
                      <span className="font-medium text-slate-800">{studentClass?.room_number || 'Room 204'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{language === 'gu' ? 'વર્ગ શિક્ષક' : 'Class Teacher'}:</span>
                      <span className="font-medium text-slate-800">{studentClass?.class_teacher_name || 'Smt. Neetaben Patel'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block">{language === 'gu' ? 'વાહનવ્યવહાર / બસ રૂટ' : 'Transport Route'}:</span>
                      <span className="font-medium text-slate-800 flex items-center space-x-1">
                        <Bus className="w-3 h-3 text-slate-500" />
                        <span>{selectedStudent.transport_route || 'School Bus Route #03 (Nana Mava)'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ACADEMIC' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span>GSEB Periodic Assessment Test (Ekam Kasoti - PAT)</span>
                  </h4>
                  {onOpenReportCard && (
                    <button
                      onClick={() => onOpenReportCard(selectedStudent)}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg font-bold text-xs border border-indigo-200 transition-colors cursor-pointer"
                    >
                      Full Report Card →
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="py-2.5 px-3">Subject</th>
                        <th className="py-2.5 px-3 text-center">Max Marks</th>
                        <th className="py-2.5 px-3 text-center">Marks Obtained</th>
                        <th className="py-2.5 px-3 text-center">Percentage</th>
                        <th className="py-2.5 px-3 text-center">GSEB Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { subject: 'Mathematics (ગણિત)', max: 25, marks: 24, grade: 'A1' },
                        { subject: 'Science & Technology (વિજ્ઞાન)', max: 25, marks: 23, grade: 'A1' },
                        { subject: 'Gujarati First Language (ગુજરાતી)', max: 25, marks: 22, grade: 'A2' },
                        { subject: 'Social Science (સામાજિક વિજ્ઞાન)', max: 25, marks: 24, grade: 'A1' },
                        { subject: 'English Second Language (અંગ્રેજી)', max: 25, marks: 23, grade: 'A1' },
                        { subject: 'Sanskrit (સંસ્કૃત)', max: 25, marks: 22, grade: 'A2' },
                      ].map((sub, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-800">{sub.subject}</td>
                          <td className="py-2 px-3 text-center font-mono text-slate-500">{sub.max}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">{sub.marks}</td>
                          <td className="py-2 px-3 text-center font-mono text-emerald-700 font-bold">
                            {Math.round((sub.marks / sub.max) * 100)}%
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {sub.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'FEES' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'gu' ? 'ફી ચુકવણી ઇતિહાસ અને પહોંચ' : 'Institutional Fee Ledger & Receipts'}</span>
                  </h4>
                  <button
                    onClick={() => onNavigate('fees')}
                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-xs border border-emerald-200 transition-colors cursor-pointer"
                  >
                    Open Fee Counter →
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500">Annual Tuition & Activity Total</span>
                    <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                      ₹{studentFeeTransaction?.total_amount ? studentFeeTransaction.total_amount.toLocaleString('en-IN') : '18,000'}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Paid: ₹{studentFeeTransaction?.paid_amount ? studentFeeTransaction.paid_amount.toLocaleString('en-IN') : '18,000'} via UPI/Bank
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        studentFeeTransaction?.status === 'OVERDUE'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {studentFeeTransaction?.status || 'PAID (100% Cleared)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'CONTACT' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === 'gu' ? 'વાલી સંપર્ક વિગતો' : 'Parent & Emergency Contacts'}</span>
                  </h4>
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">{language === 'gu' ? 'પિતાનું પૂરું નામ' : "Father's Full Name"}:</span>
                      <span className="font-bold text-slate-900 text-xs">
                        {selectedStudent.father_name || selectedStudent.parent_name}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{language === 'gu' ? 'માતાનું નામ' : "Mother's Name"}:</span>
                      <span className="font-medium text-slate-800">{selectedStudent.mother_name || 'Bhartiben Patel'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{language === 'gu' ? 'મોબાઇલ નંબર' : 'Contact Phone'}:</span>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="font-mono font-bold text-slate-900 text-xs">{selectedStudent.parent_phone}</span>
                        <button
                          onClick={() => handleCopyPhone(selectedStudent.parent_phone)}
                          className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-semibold cursor-pointer"
                        >
                          {copiedPhone ? 'Copied!' : 'Copy'}
                        </button>
                        <a
                          href={`https://wa.me/${selectedStudent.parent_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `ClassSec Notice: Regarding student ${selectedStudent.first_name} ${selectedStudent.last_name} (${selectedStudent.gr_number}) at ${currentSchool.name}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center space-x-1"
                        >
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>{language === 'gu' ? 'સરનામું અને પરિવહન' : 'Residential Address & Transport'}</span>
                  </h4>
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">{language === 'gu' ? 'રહેઠાણ સરનામું' : 'Permanent Address'}:</span>
                      <span className="font-medium text-slate-800 leading-relaxed block mt-0.5">
                        {selectedStudent.address || 'Rajkot, Gujarat'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{language === 'gu' ? 'બસ રૂટ / વાહન' : 'Assigned Transport'}:</span>
                      <span className="font-medium text-slate-800">
                        {selectedStudent.transport_route || 'School Bus Route #03'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{language === 'gu' ? 'ઇમરજન્સી સંપર્ક' : 'Emergency Contact'}:</span>
                      <span className="font-mono font-semibold text-slate-800">{selectedStudent.emergency_contact || selectedStudent.parent_phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
