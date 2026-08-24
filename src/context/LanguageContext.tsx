import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'gu';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<string, { en: string; gu: string }> = {
  // Brand & Header
  app_name: { en: 'VidyaVeda Gujarat ERP', gu: 'વિદ્યાવેદા ગુજરાત ERP' },
  app_subtitle: { en: 'For GSEB Self-Financed Private Schools', gu: 'ગુજરાત માધ્યમિક શિક્ષણ બોર્ડ (GSEB) સ્વ-નિર્ભર શાળાઓ માટે' },
  school_campus: { en: 'School Campus', gu: 'શાળા સંકુલ' },
  gseb_index: { en: 'GSEB Index No', gu: 'GSEB ઇન્ડેક્સ નંબર' },
  gr_no: { en: 'G.R. Number', gu: 'જી.આર. નંબર' },
  general_register: { en: 'General Register', gu: 'જનરલ રજિસ્ટર' },
  roll_no: { en: 'Roll No.', gu: 'રોલ નંબર' },
  medium: { en: 'Medium', gu: 'માધ્યમ' },
  gujarati_medium: { en: 'Gujarati Medium', gu: 'ગુજરાતી માધ્યમ' },
  english_medium: { en: 'English Medium', gu: 'ઇંગ્લિશ માધ્યમ' },
  standard: { en: 'Class / Standard', gu: 'ધોરણ' },
  division: { en: 'Division / Section', gu: 'વર્ગ / સેક્શન' },
  academic_year: { en: 'Academic Year 2026-27', gu: 'શૈક્ષણિક વર્ષ ૨૦૨૬-૨૭' },
  reset_demo: { en: 'Reset Demo Data', gu: 'ડેમો ડેટા રીસેટ' },
  logout: { en: 'Sign Out', gu: 'લૉગ આઉટ' },
  demo_role: { en: 'Demo Persona:', gu: 'ડેમો ભૂમિકા:' },
  affiliation: { en: 'Affiliation:', gu: 'માન્યતા ક્રમાંક:' },
  self_financed_badge: { en: 'Self-Financed Private School', gu: 'સ્વ-નિર્ભર ખાનગી શાળા' },
  select_campus: { en: 'Select Gujarat Campus', gu: 'ગુજરાત શાળા સંકુલ પસંદ કરો' },

  // Roles
  role_principal: { en: 'Principal / Management', gu: 'આચાર્યશ્રી / સંચાલક' },
  role_teacher: { en: 'Teacher / Class In-Charge', gu: 'શિક્ષક / વર્ગ શિક્ષક' },
  role_student: { en: 'Student', gu: 'વિદ્યાર્થી' },
  role_parent: { en: 'Parent / Guardian', gu: 'વાલીશ્રી' },
  role_super_admin: { en: 'Trust / Super Admin', gu: 'ટ્રસ્ટી / સુપર એડમિન' },

  // Navigation Items
  nav_dashboard: { en: 'Dashboard', gu: 'મુખ્ય ડેશબોર્ડ' },
  nav_students: { en: 'Student Register (G.R.)', gu: 'વિદ્યાર્થી રજિસ્ટર' },
  nav_csv_import: { en: 'Bulk CSV Import', gu: 'બલ્ક ડેટા અપલોડ' },
  nav_fees: { en: 'Fee Counter & Receipts', gu: 'ફી કાઉન્ટર અને રસીદ' },
  nav_staff_payroll: { en: 'Staff & Payroll', gu: 'શિક્ષક સ્ટાફ અને પગાર' },
  nav_timetable: { en: 'Timetable Builder', gu: 'સમય-સારણી (ટાઇમટેબલ)' },
  nav_notices: { en: 'School Notices & Circulars', gu: 'પરિપત્ર અને નોટિસ બોર્ડ' },
  nav_analytics: { en: 'School Analytics', gu: 'શાળા પ્રગતિ રિપોર્ટ' },
  nav_audit_logs: { en: 'Security & Audit Logs', gu: 'સિસ્ટમ ઓડિટ લોગ' },
  nav_attendance: { en: 'Daily Attendance', gu: 'દૈનિક હાજરી પત્રક' },
  nav_schedule: { en: 'Teaching Schedule', gu: 'મારો તાસ ક્રમ (પીરિયડ)' },
  nav_homework: { en: 'Homework Diary', gu: 'દૈનિક ગૃહકાર્ય ડાયરી' },
  nav_gradebook: { en: 'Exam Marks & Grades', gu: 'પરીક્ષા પરિણામ અને ગુણ' },
  nav_staff_hub: { en: 'Staff Collaboration', gu: 'શિક્ષક ચર્ચા મંચ' },
  nav_library: { en: 'Digital Library', gu: 'ડિજિટલ લાયબ્રેરી' },
  nav_report_card: { en: 'Progress Report Card', gu: 'પ્રગતિ પત્રક (રિપોર્ટ કાર્ડ)' },
  nav_leaving_cert: { en: 'Leaving Certificate (L.C.)', gu: 'શાળા છોડ્યાનું પ્રમાણપત્ર (L.C.)' },
  nav_bonafide: { en: 'Bonafide Certificate', gu: 'બોનાફાઇડ સર્ટીફિકેટ' },
  nav_tenants: { en: 'Trust Campuses', gu: 'ટ્રસ્ટ શાળાઓની યાદી' },
  nav_liaison: { en: 'Teacher Consultation & Directory', gu: 'શિક્ષક સંપર્ક અને વાલી મિલન' },

  // Attendance
  attendance_present: { en: 'Present', gu: 'હાજર' },
  attendance_absent: { en: 'Absent', gu: 'ગેરહાજર' },
  attendance_leave: { en: 'On Leave', gu: 'રજા પર' },
  attendance_late: { en: 'Late', gu: 'મોડા' },
  mark_attendance: { en: 'Mark Attendance', gu: 'હાજરી પૂરો' },
  send_sms_parents: { en: 'Send Absentee SMS to Parents', gu: 'ગેરહાજર વાલીઓને SMS મોકલો' },
  attendance_percentage: { en: 'Attendance Rate', gu: 'હાજરી ટકાવારી' },

  // Fees
  fee_receipt_title: { en: 'Private School Fee Receipt', gu: 'સ્વ-નિર્ભર શાળા ફી રસીદ' },
  fee_paid: { en: 'Paid', gu: 'ચૂકવેલ' },
  fee_pending: { en: 'Pending', gu: 'બાકી' },
  fee_overdue: { en: 'Overdue', gu: 'મુદત વીતી ગયેલ' },
  pay_fee_btn: { en: 'Collect Fee (Cash / UPI)', gu: 'ફી જમા લો (રોકડ / UPI)' },
  print_receipt: { en: 'Print Fee Slip', gu: 'રસીદ પ્રિન્ટ કરો' },
  tuition_fee: { en: 'Tuition Fee', gu: 'ટ્યુશન ફી' },
  term_fee: { en: 'Term Fee', gu: 'સત્ર ફી' },
  computer_fee: { en: 'Computer Lab Fee', gu: 'કમ્પ્યુટર લેબ ફી' },
  activity_fee: { en: 'Sports & Activity Fee', gu: 'રમતગમત અને પ્રવૃત્તિ ફી' },
  bus_fee: { en: 'School Bus Fee', gu: 'વાહન વ્યવહાર ફી' },
  total_due: { en: 'Total Amount Due', gu: 'કુલ બાકી રકમ' },
  total_collected: { en: 'Total Collected', gu: 'કુલ જમા રકમ' },
  payment_mode: { en: 'Payment Mode', gu: 'ચૂકવણી પદ્ધતિ' },
  receipt_no: { en: 'Receipt No.', gu: 'રસીદ નંબર' },

  // Exams & Marks
  ekam_kasoti: { en: 'Periodic Assessment Test (PAT)', gu: 'એકમ કસોટી' },
  pratham_pariksha: { en: 'First Term Examination', gu: 'પ્રથમ સત્ર પરીક્ષા' },
  dviitiya_pariksha: { en: 'Preliminary Examination', gu: 'પ્રિલિમ પરીક્ષા' },
  annual_pariksha: { en: 'Annual Board Exam', gu: 'વાર્ષિક બોર્ડ પરીક્ષા' },
  max_marks: { en: 'Max Marks', gu: 'કુલ ગુણ' },
  marks_obtained: { en: 'Marks Scored', gu: 'મેળવેલ ગુણ' },
  gseb_grade: { en: 'GSEB Grade', gu: 'GSEB ગ્રેડ' },
  result_pass: { en: 'Passed', gu: 'ઉત્તીર્ણ' },
  result_fail: { en: 'Needs Improvement', gu: 'સુધારણા જરૂરી' },

  // Common Actions & Form Controls
  search: { en: 'Search by name, G.R. number, mobile...', gu: 'નામ, જી.આર. નંબર અથવા મોબાઈલથી શોધો...' },
  filter_all: { en: 'All Records', gu: 'તમામ વિગતો' },
  save: { en: 'Save Changes', gu: 'સાચવો' },
  cancel: { en: 'Cancel', gu: 'રદ કરો' },
  close: { en: 'Close', gu: 'બંધ કરો' },
  edit: { en: 'Edit', gu: 'ફેરફાર કરો' },
  delete: { en: 'Delete', gu: 'કાઢી નાખો' },
  add_student: { en: '+ New Student Admission', gu: '+ નવો વિદ્યાર્થી પ્રવેશ' },
  add_homework: { en: '+ Assign Homework', gu: '+ નવું ગૃહકાર્ય આપો' },
  add_notice: { en: '+ Publish Circular', gu: '+ નવો પરિપત્ર પ્રકાશિત કરો' },
  add_staff: { en: '+ Add Faculty Member', gu: '+ નવો શિક્ષક સ્ટાફ ઉમેરો' },
  download_excel: { en: 'Export to Excel', gu: 'Excel ડાઉનલોડ' },
  print: { en: 'Print Document', gu: 'પ્રિન્ટ કરો' },
  status: { en: 'Status', gu: 'સ્થિતિ' },
  date: { en: 'Date', gu: 'તારીખ' },
  action: { en: 'Action', gu: 'ક્રિયા' },
  remarks: { en: 'Remarks', gu: 'નોંધ' },
  contact_number: { en: 'Contact Number', gu: 'સંપર્ક નંબર' },
  parent_name: { en: 'Parent / Guardian Name', gu: 'વાલીનું નામ' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('vidyaveda_lang');
    return (saved === 'en' || saved === 'gu') ? (saved as Language) : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('vidyaveda_lang', lang);
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'gu' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: string, defaultText?: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
