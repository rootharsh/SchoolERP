import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  HelpCircle,
  X,
  BookOpen,
  HelpCircle as FaqIcon,
  LifeBuoy,
  Search,
  ChevronRight,
  ChevronDown,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Check,
  Mail,
  Copy,
  ShieldCheck,
  School,
  UserCheck,
  IndianRupee,
  Sparkles,
  ExternalLink,
  MessageSquareQuote,
  Headphones,
  Laptop
} from 'lucide-react';

interface HelpWidgetProps {
  onNavigateTab?: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  hideFloatingTrigger?: boolean;
}

interface SupportTicket {
  id: string;
  category: string;
  title: string;
  description: string;
  urgency: 'NORMAL' | 'HIGH' | 'URGENT';
  reporterName: string;
  reporterRole: string;
  reporterContact: string;
  module: string;
  createdAt: string;
  status: 'SUBMITTED' | 'IN_REVIEW' | 'RESOLVED';
}

const SUPPORT_EMAIL = 'harshsec@proton.me';

const FAQ_DATA = [
  {
    id: 'faq-1',
    category: 'Institutional Security & Authentication',
    guCategory: 'સુરક્ષા અને લોગિન',
    allowedRoles: ['PRINCIPAL', 'SUPER_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
    question: 'How are staff and student data secured against unauthorized access?',
    guQuestion: 'શિક્ષક અને વિદ્યાર્થીઓના ડેટા સુરક્ષા માટે કયા પગલાં લેવામાં આવ્યા છે?',
    answer: 'ClassSec ERP employs enterprise Row-Level Security (RLS), multi-tenant isolation per GSEB school, server-side payload validation with strict rejection of malformed inputs, and immutable audit logs for all administrative actions.',
    guAnswer: 'ClassSec ERP દ્વારા રો-લેવલ સિક્યોરિટી (RLS), દરેક શાળા માટે અલગ ડેટાબેઝ આઈસોલેશન, સર્વર-સાઇડ સ્કીમા વેરિફિકેશન અને તમામ વહીવટી નિર્ણયો માટે ઓડિટ લોગિંગ સુનિશ્ચિત કરેલ છે.'
  },
  {
    id: 'faq-2',
    category: 'Student Records & L.C.',
    guCategory: 'વિદ્યાર્થી રેકોર્ડ અને એલ.સી.',
    allowedRoles: ['PRINCIPAL', 'SUPER_ADMIN'],
    question: 'How to issue and print an official GSEB-compliant School Leaving Certificate (L.C.)?',
    guQuestion: 'GSEB માન્ય શાળા છોડ્યાનું પ્રમાણપત્ર (L.C.) કેવી રીતે ઇશ્યૂ અને પ્રિન્ટ કરવું?',
    answer: 'Navigate to Principal Dashboard or Students Directory > Select student record > Click "Issue Official GSEB L.C.". The system checks fee clearance, generates the state serial number, bilingual Gujarati/English fields, birthdate in words, and provides a 1-click A4 print layout.',
    guAnswer: 'પ્રિન્સિપાલ ડેશબોર્ડ અથવા વિદ્યાર્થી ડિરેક્ટરીમાં જાઓ > વિદ્યાર્થી પસંદ કરો > "Issue Official GSEB L.C." ક્લિક કરો. સિસ્ટમ સત્તાવાર સીરીયલ નંબર, ગુજરાતી/અંગ્રેજી વિગતો, અક્ષરોમાં જન્મતારીખ અને A4 પ્રિન્ટ લેઆઉટ આપે છે.'
  },
  {
    id: 'faq-3',
    category: 'Principal Staff Governance',
    guCategory: 'શિક્ષક સંચાલન અને ફેરફાર',
    allowedRoles: ['PRINCIPAL', 'SUPER_ADMIN'],
    question: 'Can the Principal edit teacher designations, salary, or assignments?',
    guQuestion: 'શું આચાર્યશ્રી શિક્ષકની વિગતો, પગાર અને વર્ગ ફાળવણી સુધારી શકે?',
    answer: 'Yes. Principals can open Faculty Profiles under Staff & Payroll to edit designations, qualifications, teaching subjects, and basic pay. An automated formal notification is dispatched directly to the teacher informing them of the update.',
    guAnswer: 'હા. આચાર્યશ્રી સ્ટાફ અને પેરોલ સેક્શનમાં જઈને શિક્ષકનો હોદ્દો, લાયકાત, વિષય અને પગાર સુધારી શકે છે, અને સિસ્ટમ દ્વારા સંબંધિત શિક્ષકને તુરંત સત્તાવાર સૂચના પહોંચાડવામાં આવે છે.'
  },
  {
    id: 'faq-4',
    category: 'Attendance Marking & Mobile Register',
    guCategory: 'હાજરી પત્રક',
    allowedRoles: ['PRINCIPAL', 'SUPER_ADMIN', 'TEACHER'],
    question: 'How fast can teachers mark morning roll-call on mobile devices?',
    guQuestion: 'શિક્ષકો મોબાઇલમાં કેટલી ઝડપથી સવારની હાજરી પૂરી શકે?',
    answer: 'The Attendance Register takes under 30 seconds for a full classroom. Teachers mark Present/Absent with one touch and can instantly notify parents of absent students.',
    guAnswer: 'હાજરી પત્રક ૩૦ સેકન્ડથી પણ ઓછા સમયમાં પૂરી શકાય છે. શિક્ષકો એક ટચથી હાજર/ગેરહાજર ચિહ્નિત કરી ગેરહાજર વાલીઓને જાણ કરી શકે છે.'
  },
  {
    id: 'faq-5',
    category: 'Student Homework & Deadlines',
    guCategory: 'ગૃહકાર્ય અને જમા તારીખ',
    allowedRoles: ['STUDENT', 'PARENT', 'TEACHER', 'PRINCIPAL', 'SUPER_ADMIN'],
    question: 'How do students track homework due dates and submit assignments?',
    guQuestion: 'વિદ્યાર્થીઓ બાકી ગૃહકાર્ય અને જમા કરાવવાની છેલ્લી તારીખ કેવી રીતે જોઈ શકે?',
    answer: 'Students have a real-time "Homework Due" tracker on their dashboard with color-coded deadline alerts (Overdue, Due Today, Due Tomorrow). They can upload PDF or photo solutions with one click.',
    guAnswer: 'વિદ્યાર્થીઓના ડેશબોર્ડ પર બાકી ગૃહકાર્ય માટે લાઈવ ટ્રેકર છે જેમાં છેલ્લી તારીખ મુજબ એલર્ટ દેખાય છે અને તેઓ સીધા ઉકેલ/PDF અપલોડ કરી શકે છે.'
  },
  {
    id: 'faq-6',
    category: 'Fees & Online Payments',
    guCategory: 'ફી અને ઓનલાઇન પેમેન્ટ',
    allowedRoles: ['PARENT', 'PRINCIPAL', 'SUPER_ADMIN'],
    question: 'How do parents pay fees and get authorized receipts?',
    guQuestion: 'વાલીઓ ફી કેવી રીતે ભરી શકે અને પહોંચ કેવી રીતે મેળવી શકે?',
    answer: 'Parents log in to the Parent Portal, review itemized fee breakdowns (Tuition, Lab, Exam, Library), and make payments with zero convenience fees via standard UPI QR/Apps. Authorized receipts with QR verification are generated immediately.',
    guAnswer: 'વાલીઓ પેરન્ટ પોર્ટલમાં લોગિન કરી, વિગતવાર ફી જોઈને UPI થી સરળતાથી ફી ભરી શકે છે અને માન્ય QR કોડ વાળી પહોંચ ડાઉનલોડ કરી શકે છે.'
  },
  {
    id: 'faq-7',
    category: 'Digital e-Library',
    guCategory: 'ડિજિટલ પુસ્તકાલય',
    allowedRoles: ['STUDENT', 'TEACHER', 'PRINCIPAL'],
    question: 'How do students access GSEB textbooks and question banks?',
    guQuestion: 'વિદ્યાર્થીઓ GSEB પાઠ્યપુસ્તકો અને પ્રશ્નબેંક કેવી રીતે મેળવી શકે?',
    answer: 'Open the "GSEB e-Library" tab from the navigation sidebar. Students can view online e-reader textbooks for Grade 9 to 12 across Gujarati and English mediums with one click.',
    guAnswer: 'નેવિગેશન સાઇડબારમાંથી "GSEB e-Library" ટેબ ખોલો. વિદ્યાર્થીઓ ધોરણ ૯ થી ૧૨ ના પાઠ્યપુસ્તકો અને પ્રશ્નબેંક એક ક્લિકથી ઓનલાઇન વાંચી અને ડાઉનલોડ કરી શકે છે.'
  }
];

const QUICK_GUIDES = [
  {
    id: 'guide-principal',
    role: 'PRINCIPAL',
    title: 'Principal Administrative Control & Governance',
    guTitle: 'આચાર્યશ્રી દૈનિક વહીવટી માર્ગદર્શિકા',
    icon: School,
    color: 'from-blue-600 to-indigo-700',
    steps: [
      { text: 'Monitor campus-wide morning attendance percentage and absent counts.', guText: 'સમગ્ર શાળાની સવારની હાજરી ટકાવારી અને ગેરહાજરી તપાસો.' },
      { text: 'Manage faculty profiles, designations, and salary structures with automated teacher notification.', guText: 'શિક્ષકોની વિગતો, હોદ્દો અને પગાર સુધારો તથા શિક્ષકને સૂચના મોકલો.' },
      { text: 'Issue official GSEB Leaving Certificates (L.C.) with automated fee verification.', guText: 'સત્તાવાર GSEB શાળા છોડ્યાનું પ્રમાણપત્ર (L.C.) ઇશ્યૂ અને પ્રિન્ટ કરો.' },
      { text: 'Review quarterly fee collection statistics and oversee academic examinations.', guText: 'ત્રિમાસિક ફી સંગ્રહ અને એકમ કસોટી પરિણામોનું નિરીક્ષણ કરો.' }
    ],
    targetTab: 'dashboard',
    buttonText: 'Open Principal Dashboard',
    guButtonText: 'પ્રિન્સિપાલ ડેશબોર્ડ ખોલો'
  },
  {
    id: 'guide-teacher',
    role: 'TEACHER',
    title: 'Teacher Daily Workflow & Gradebook Register',
    guTitle: 'શિક્ષકો માટે દૈનિક કામગીરી અને માર્કશીટ',
    icon: UserCheck,
    color: 'from-emerald-600 to-teal-700',
    steps: [
      { text: 'Take morning attendance in under 30 seconds from any mobile or desktop device.', guText: 'કોઈપણ ડિવાઇસથી ૩૦ સેકન્ડમાં વર્ગ હાજરી પૂરો.' },
      { text: 'Post daily homework with subject details, submission deadlines, and resource attachments.', guText: 'વિષયવાર ગૃહકાર્ય અને જમા કરાવવાની તારીખ હોમવર્ક ડાયરીમાં નોંધો.' },
      { text: 'Input Periodic Assessment Test (Ekam Kasoti) scores for automated GSEB grade calculation.', guText: 'એકમ કસોટી અને વાર્ષિક પરીક્ષાના ગુણ દાખલ કરો.' },
      { text: 'Review notifications and timetable schedules posted by school management.', guText: 'આચાર્યશ્રી દ્વારા મળેલ સૂચનાઓ અને સમયપત્રક તપાસો.' }
    ],
    targetTab: 'attendance',
    buttonText: 'Open Attendance Register',
    guButtonText: 'હાજરી પત્રક ખોલો'
  },
  {
    id: 'guide-student',
    role: 'STUDENT',
    title: 'Student Academic Portal & Homework Due Tracker',
    guTitle: 'વિદ્યાર્થી પોર્ટલ અને બાકી ગૃહકાર્ય ટ્રેકર',
    icon: BookOpen,
    color: 'from-sky-600 to-cyan-700',
    steps: [
      { text: 'Check real-time "Homework Due" alerts to ensure assignments are submitted before deadline.', guText: 'ગૃહકાર્યની સમયમર્યાદા તપાસો અને નિયત સમય પહેલા જમા કરાવો.' },
      { text: 'Access daily period timetable, room numbers, and subject faculty information.', guText: 'દૈનિક સમયપત્રક, રૂમ નંબર અને વિષય શિક્ષકની વિગત જુઓ.' },
      { text: 'Download official GSEB digital textbooks and question banks from the e-Library.', guText: 'GSEB ડિજિટલ પુસ્તકાલયમાંથી પાઠ્યપુસ્તકો અને સાહિત્ય ડાઉનલોડ કરો.' },
      { text: 'Inspect Ekam Kasoti report cards and term examination performance.', guText: 'એકમ કસોટી અને વાર્ષિક ગુણપત્રક ચકાસો.' }
    ],
    targetTab: 'homework',
    buttonText: 'View Homework & Deadlines',
    guButtonText: 'ગૃહકાર્ય અને છેલ્લી તારીખ જુઓ'
  },
  {
    id: 'guide-parent',
    role: 'PARENT',
    title: 'Parent Portal: Attendance, Fees & Progress',
    guTitle: 'વાલી પોર્ટલ: હાજરી, ફી અને પ્રગતિ',
    icon: IndianRupee,
    color: 'from-amber-600 to-orange-700',
    steps: [
      { text: 'Track your child\'s daily attendance status and monthly attendance compliance.', guText: 'બાળકની દૈનિક હાજરી અને માસિક ટકાવારી જુઓ.' },
      { text: 'Pay institutional term fees seamlessly via UPI with zero gateway overhead.', guText: 'UPI દ્વારા કોઈપણ વધારાના ચાર્જ વગર ઓનલાઇન ફી ભરો.' },
      { text: 'Download authorized digital fee receipts with official verification QR codes.', guText: 'સત્તાવાર QR કોડ વાળી ડિજિટલ ફી પહોંચ ડાઉનલોડ કરો.' },
      { text: 'Review periodic test marks, grade remarks, and teacher observations.', guText: 'કસોટી ગુણ અને શિક્ષકની નોંધ ચકાસો.' }
    ],
    targetTab: 'dashboard',
    buttonText: 'View Parent Portal',
    guButtonText: 'પેરન્ટ પોર્ટલ જુઓ'
  }
];

export const HelpWidget: React.FC<HelpWidgetProps> = ({
  onNavigateTab,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  onOpen: controlledOnOpen,
  hideFloatingTrigger = false,
}) => {
  const { currentUser, currentRole, currentSchool } = useAuth();
  const { language } = useLanguage();

  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : uncontrolledIsOpen;

  const handleOpen = () => {
    if (controlledOnOpen) controlledOnOpen();
    else setUncontrolledIsOpen(true);
  };

  const handleClose = () => {
    if (controlledOnClose) controlledOnClose();
    else setUncontrolledIsOpen(false);
  };

  const [activeTab, setActiveTab] = useState<'GUIDES' | 'FAQS' | 'REPORT' | 'TICKETS'>('GUIDES');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Form State - dynamically synchronized with current logged-in persona
  const [category, setCategory] = useState<string>(() => {
    if (currentRole === 'STUDENT') return 'HOMEWORK';
    if (currentRole === 'PARENT') return 'FEES';
    if (currentRole === 'TEACHER') return 'ATTENDANCE';
    return 'PRINCIPAL_STAFF';
  });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [reporterContact, setReporterContact] = useState(currentUser?.email || '');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [emailStatusToast, setEmailStatusToast] = useState<string | null>(null);

  const [isInAppMailModalOpen, setIsInAppMailModalOpen] = useState(false);
  const [inAppMailSubject, setInAppMailSubject] = useState('');
  const [inAppMailBody, setInAppMailBody] = useState('');
  const [mailSentSuccess, setMailSentSuccess] = useState(false);

  // Synchronize contact email and default category when active user/role changes
  React.useEffect(() => {
    if (currentUser?.email) {
      setReporterContact(currentUser.email);
    }
    if (currentRole === 'STUDENT') {
      setCategory('HOMEWORK');
    } else if (currentRole === 'PARENT') {
      setCategory('FEES');
    } else if (currentRole === 'TEACHER') {
      setCategory('ATTENDANCE');
    } else {
      setCategory('PRINCIPAL_STAFF');
    }
  }, [currentUser, currentRole]);

  // Tickets stored in localStorage per user
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem('classsec_support_tickets_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const saveTickets = (updated: SupportTicket[]) => {
    setTickets(updated);
    try {
      localStorage.setItem('classsec_support_tickets_v2', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save support ticket', e);
    }
  };

  const getDiagnosticPayload = () => {
    return (
      `=== ClassSec ERP Technical Support Request ===\n` +
      `Campus: ${currentSchool.name} (${currentSchool.code || currentSchool.gseb_index || 'GSEB'})\n` +
      `User: ${currentUser?.full_name || 'Portal User'} [Role: ${currentRole || 'N/A'}]\n` +
      `Contact Email: ${reporterContact || currentUser?.email || 'N/A'}\n` +
      `Category: ${category}\n` +
      `Urgency: ${urgency}\n` +
      `Module Location: ${typeof window !== 'undefined' ? window.location.hash || 'Root' : 'Root'}\n` +
      `Timestamp: ${new Date().toISOString()}\n` +
      `Subject: ${title || 'Technical Inquiry'}\n` +
      `Details:\n${description || 'Please advise on system operations.'}\n` +
      `=============================================`
    );
  };

  const handleOpenInAppMailComposer = () => {
    setInAppMailSubject(`[ClassSec Support - ${urgency}] ${title || 'Technical Inquiry from ' + (currentUser?.full_name || 'User') + ' (' + (currentRole || 'User') + ')'}`);
    setInAppMailBody(getDiagnosticPayload());
    setMailSentSuccess(false);
    setIsInAppMailModalOpen(true);
  };

  const handleSendViaInAppRelay = () => {
    const newTicket: SupportTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      category: category === 'PRINCIPAL_STAFF' ? 'Principal Staff Management' :
                category === 'LC_STUDENT' ? 'Student Records & L.C.' :
                category === 'HOMEWORK' ? 'Student Homework & Deadlines' :
                category === 'ATTENDANCE' ? 'Attendance Register' :
                category === 'LIBRARY' ? 'Digital Library' :
                category === 'FEES' ? 'Fee Operations / UPI' : 'General Assistance',
      title: title.trim() || inAppMailSubject,
      description: description.trim() || inAppMailBody,
      urgency,
      reporterName: currentUser?.full_name || 'Portal User',
      reporterRole: currentRole || 'STUDENT',
      reporterContact: reporterContact.trim() || currentUser?.email || SUPPORT_EMAIL,
      module: typeof window !== 'undefined' ? window.location.hash.replace(/^#\/?/, '') || 'General' : 'General',
      createdAt: new Date().toISOString(),
      status: 'SUBMITTED'
    };

    const updated = [newTicket, ...tickets];
    saveTickets(updated);
    setMailSentSuccess(true);
    setTimeout(() => {
      setIsInAppMailModalOpen(false);
      setMailSentSuccess(false);
      setActiveTab('TICKETS');
    }, 1800);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopiedEmail(true);
    setEmailStatusToast(language === 'gu' ? 'સપોર્ટ ઈમેલ ક્લિપબોર્ડમાં કોપી થઈ ગયો છે.' : 'Support email copied to clipboard.');
    setTimeout(() => {
      setCopiedEmail(false);
      setEmailStatusToast(null);
    }, 3000);
  };

  const handleCopyDiagnostic = () => {
    navigator.clipboard.writeText(getDiagnosticPayload());
    setCopiedReport(true);
    setEmailStatusToast(language === 'gu' ? 'ડાયગ્નોસ્ટિક રિપોર્ટ કોપી થઈ ગયો છે.' : 'Diagnostic report copied to clipboard.');
    setTimeout(() => {
      setCopiedReport(false);
      setEmailStatusToast(null);
    }, 3000);
  };

  // Robust multi-channel mail opening triggers
  const handleSendEmailDirect = () => {
    handleOpenInAppMailComposer();
  };

  const handleOpenGmailWeb = () => {
    const subject = encodeURIComponent(`[ClassSec Support - ${urgency}] ${title || 'Inquiry from ' + currentSchool.name + ' (' + (currentRole || 'User') + ')'}`);
    const body = encodeURIComponent(getDiagnosticPayload());
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${SUPPORT_EMAIL}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenOutlookWeb = () => {
    const subject = encodeURIComponent(`[ClassSec Support - ${urgency}] ${title || 'Inquiry from ' + currentSchool.name + ' (' + (currentRole || 'User') + ')'}`);
    const body = encodeURIComponent(getDiagnosticPayload());
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${SUPPORT_EMAIL}&subject=${subject}&body=${body}`;
    window.open(outlookUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newTicket: SupportTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      category: category === 'PRINCIPAL_STAFF' ? 'Principal Staff Management' :
                category === 'LC_STUDENT' ? 'Student Records & L.C.' :
                category === 'HOMEWORK' ? 'Student Homework & Deadlines' :
                category === 'ATTENDANCE' ? 'Attendance Register' :
                category === 'LIBRARY' ? 'Digital Library' :
                category === 'FEES' ? 'Fee Operations / UPI' : 'General Assistance',
      title: title.trim(),
      description: description.trim(),
      urgency,
      reporterName: currentUser?.full_name || 'Portal User',
      reporterRole: currentRole || 'STUDENT',
      reporterContact: reporterContact.trim() || currentUser?.email || SUPPORT_EMAIL,
      module: typeof window !== 'undefined' ? window.location.hash.replace(/^#\/?/, '') || 'General' : 'General',
      createdAt: new Date().toISOString(),
      status: 'SUBMITTED'
    };

    const updated = [newTicket, ...tickets];
    saveTickets(updated);
    setSubmitSuccess(true);
    setTitle('');
    setDescription('');
    setTimeout(() => {
      setSubmitSuccess(false);
      setActiveTab('TICKETS');
    }, 1500);
  };

  const filteredFaqs = useMemo(() => {
    let list = FAQ_DATA;
    if (currentRole) {
      list = list.filter(f => !f.allowedRoles || f.allowedRoles.includes(currentRole));
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      f =>
        f.question.toLowerCase().includes(q) ||
        f.guQuestion.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.guAnswer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.guCategory.toLowerCase().includes(q)
    );
  }, [searchQuery, currentRole]);

  // Filter role guides: show active role first and clean up for students/parents
  const roleGuides = useMemo(() => {
    if (currentRole === 'STUDENT') {
      return QUICK_GUIDES.filter(g => g.role === 'STUDENT');
    }
    if (currentRole === 'PARENT') {
      return QUICK_GUIDES.filter(g => g.role === 'PARENT');
    }
    if (currentRole === 'TEACHER') {
      return QUICK_GUIDES.filter(g => g.role === 'TEACHER');
    }
    if (currentRole === 'PRINCIPAL') {
      return QUICK_GUIDES.filter(g => g.role === 'PRINCIPAL' || g.role === 'TEACHER');
    }
    return QUICK_GUIDES;
  }, [currentRole]);

  return (
    <>
      {/* Slide-over / Modal Help Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div
            id="help-drawer-panel"
            className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300 overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400">
                    <LifeBuoy className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-heading text-white flex items-center space-x-2">
                      <span>{language === 'gu' ? 'સત્તાવાર સહાયતા કેન્દ્ર' : 'Institutional Help Desk'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-mono border border-emerald-400/30">
                        harshsec@proton.me
                      </span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {language === 'gu'
                        ? 'પ્રિન્સિપાલ, શિક્ષકો, વિદ્યાર્થીઓ અને વાલીઓ માટે સત્તાવાર સહાય પોર્ટલ'
                        : 'Official support center for Principals, Faculty, Students & Parents'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close help"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Direct Support Email Banner */}
              <div className="mt-4 p-3 bg-slate-900/90 border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Direct Technical &amp; Governance Desk:</div>
                    <div className="font-mono text-xs font-bold text-emerald-300">{SUPPORT_EMAIL}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleCopyEmail}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
                    title="Copy email to clipboard"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleSendEmailDirect}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
                    title="Open default email app"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Mail</span>
                  </button>

                  <button
                    onClick={handleOpenGmailWeb}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-300 flex items-center space-x-1 transition-colors cursor-pointer"
                    title="Compose directly in Gmail Web"
                  >
                    <span>Gmail Web</span>
                  </button>
                </div>
              </div>

              {emailStatusToast && (
                <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-between animate-in fade-in">
                  <span>{emailStatusToast}</span>
                  <button onClick={() => setEmailStatusToast(null)} className="text-emerald-300 hover:text-white font-bold ml-2">✕</button>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 mt-4 pt-2 border-t border-white/10 overflow-x-auto scrollbar-none">
                <button
                  id="tab-btn-guides"
                  onClick={() => setActiveTab('GUIDES')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center space-x-1.5 ${
                    activeTab === 'GUIDES'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{language === 'gu' ? 'દૈનિક માર્ગદર્શિકા' : 'Role Guides'}</span>
                </button>

                <button
                  id="tab-btn-faqs"
                  onClick={() => setActiveTab('FAQS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center space-x-1.5 ${
                    activeTab === 'FAQS'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <FaqIcon className="w-3.5 h-3.5" />
                  <span>{language === 'gu' ? 'પ્રશ્નોત્તરી (FAQs)' : 'GSEB FAQs'}</span>
                </button>

                <button
                  id="tab-btn-report"
                  onClick={() => setActiveTab('REPORT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center space-x-1.5 ${
                    activeTab === 'REPORT'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'gu' ? 'સપોર્ટ વિનંતી' : 'Report Issue'}</span>
                </button>

                <button
                  id="tab-btn-tickets"
                  onClick={() => setActiveTab('TICKETS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center space-x-1.5 ${
                    activeTab === 'TICKETS'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{language === 'gu' ? 'મારી ફરિયાદો' : 'Tickets Log'}</span>
                  {tickets.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-slate-900 text-emerald-300 rounded-full font-mono font-bold">
                      {tickets.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Drawer Body Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50">
              {/* TAB 1: ROLE GUIDES */}
              {activeTab === 'GUIDES' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {language === 'gu' ? 'તમામ ભૂમિકાઓ માટે પગલાંવાર સંચાલન' : 'Standard Operating Procedures & Daily Workflows'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {roleGuides.map((guide) => {
                      const IconComponent = guide.icon;
                      const isCurrent = currentRole === guide.role;
                      return (
                        <div
                          key={guide.id}
                          className={`bg-white rounded-xl border p-4 shadow-xs transition-all ${
                            isCurrent
                              ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${guide.color} text-white shadow-xs`}>
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-sm font-bold text-slate-900">
                                    {language === 'gu' ? guide.guTitle : guide.title}
                                  </h4>
                                  {isCurrent && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Active Role
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">Role: {guide.role}</p>
                              </div>
                            </div>

                            {onNavigateTab && (
                              <button
                                onClick={() => {
                                  onNavigateTab(guide.targetTab);
                                  handleClose();
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer shrink-0 hidden sm:flex items-center space-x-1"
                              >
                                <span>{language === 'gu' ? guide.guButtonText : guide.buttonText}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                              </button>
                            )}
                          </div>

                          <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
                            {guide.steps.map((step, idx) => (
                              <div key={idx} className="flex items-start space-x-2 text-xs text-slate-600">
                                <span className="font-mono font-bold text-emerald-600 mt-0.5 shrink-0">
                                  0{idx + 1}.
                                </span>
                                <span>{language === 'gu' ? step.guText : step.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: GSEB FAQS */}
              {activeTab === 'FAQS' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={language === 'gu' ? 'પ્રશ્ન અથવા વિષય શોધો...' : 'Search questions, L.C., attendance, fees...'}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden shadow-xs"
                    />
                  </div>

                  <div className="space-y-2.5">
                    {filteredFaqs.map((faq) => {
                      const isExpanded = expandedFaq === faq.id;
                      return (
                        <div
                          key={faq.id}
                          className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
                        >
                          <button
                            onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                            className="w-full p-3.5 text-left flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                                {language === 'gu' ? faq.guCategory : faq.category}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 pt-0.5">
                                {language === 'gu' ? faq.guQuestion : faq.question}
                              </h4>
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 text-slate-400 shrink-0 mt-1 transition-transform ${
                                isExpanded ? 'rotate-180 text-emerald-600' : ''
                              }`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 border-t border-slate-100 bg-slate-50/50">
                              <p className="leading-relaxed">
                                {language === 'gu' ? faq.guAnswer : faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {filteredFaqs.length === 0 && (
                      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
                        <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-700">No matching FAQs found</p>
                        <p className="text-slate-400 mt-1">Try searching for &quot;attendance&quot;, &quot;L.C.&quot;, or &quot;fees&quot;.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: REPORT ISSUE / DIRECT TICKET */}
              {activeTab === 'REPORT' && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs animate-in fade-in duration-200">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-900 font-heading">
                      {language === 'gu' ? 'સહાયતા વિનંતી અથવા સમસ્યા નોંધણી' : 'Submit Support Request to harshsec@proton.me'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your query will be formatted with full session diagnostics and dispatched directly to the technical team.
                    </p>
                  </div>

                  {submitSuccess ? (
                    <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                      <h4 className="font-bold text-sm text-emerald-900">Support Request Logged Successfully</h4>
                      <p className="text-xs text-emerald-700">
                        Ticket saved to your local log and ready for review by <span className="font-mono font-bold">{SUPPORT_EMAIL}</span>.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleTicketSubmit} className="space-y-3.5 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          {language === 'gu' ? 'સમસ્યાનો પ્રકાર' : 'Issue Category / Module'}
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        >
                          {currentRole === 'STUDENT' ? (
                            <>
                              <option value="HOMEWORK">Student Homework Diary &amp; Due Date Tracker</option>
                              <option value="LIBRARY">GSEB e-Library &amp; Digital Textbooks</option>
                              <option value="ATTENDANCE">Student Attendance Records</option>
                              <option value="EXAMS">Ekam Kasoti &amp; Exam Marksheets</option>
                              <option value="OTHER">General Student Assistance</option>
                            </>
                          ) : currentRole === 'PARENT' ? (
                            <>
                              <option value="FEES">Fee Operations &amp; Online UPI Receipts</option>
                              <option value="ATTENDANCE">Child Attendance Tracker</option>
                              <option value="HOMEWORK">Homework Stream &amp; Diary</option>
                              <option value="LIAISON">Teacher &amp; Bus Liaison</option>
                              <option value="OTHER">General Parent Assistance</option>
                            </>
                          ) : currentRole === 'TEACHER' ? (
                            <>
                              <option value="ATTENDANCE">Attendance Marking Register &amp; Alerts</option>
                              <option value="HOMEWORK">Homework Assignment Publishing</option>
                              <option value="GRADEBOOK">Ekam Kasoti &amp; Marks Entry</option>
                              <option value="SCHEDULE">Teaching Schedule &amp; Timetable</option>
                              <option value="OTHER">General Teacher Assistance</option>
                            </>
                          ) : (
                            <>
                              <option value="PRINCIPAL_STAFF">Principal Staff Governance &amp; Teacher Profiles</option>
                              <option value="LC_STUDENT">GSEB Leaving Certificate (L.C.) &amp; Student Records</option>
                              <option value="HOMEWORK">Student Homework Diary &amp; Due Date Tracker</option>
                              <option value="ATTENDANCE">Attendance Marking Register &amp; Alerts</option>
                              <option value="FEES">Fee Operations &amp; Online UPI Receipts</option>
                              <option value="OTHER">General Platform Assistance</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            {language === 'gu' ? 'તાકીદનું સ્તર' : 'Urgency Level'}
                          </label>
                          <select
                            value={urgency}
                            onChange={(e) => setUrgency(e.target.value as any)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                          >
                            <option value="NORMAL">🟢 Normal (1–2 business days)</option>
                            <option value="HIGH">🟡 High (Same day support)</option>
                            <option value="URGENT">🔴 Urgent (Live institutional block)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            {language === 'gu' ? 'તમારો ઈમેલ / સંપર્ક' : 'Your Contact Email'}
                          </label>
                          <input
                            type="email"
                            required
                            value={reporterContact}
                            onChange={(e) => setReporterContact(e.target.value)}
                            placeholder={currentUser?.email || 'your-email@school.edu.in'}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          {language === 'gu' ? 'મુખ્ય વિષય' : 'Issue Summary / Subject'}
                        </label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder={language === 'gu' ? 'ટૂંકમાં વિષય લખો...' : 'e.g. Need assistance with homework or marksheet view'}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          {language === 'gu' ? 'વિગતવાર વર્ણન' : 'Detailed Description'}
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder={language === 'gu' ? 'વિસ્તારપૂર્વક સમસ્યા અને વિગત જણાવો...' : 'Describe what happened, any relevant subject or date...'}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 flex flex-wrap gap-2">
                        <button
                          type="submit"
                          className="flex-1 min-w-[130px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs"
                        >
                          <Send className="w-4 h-4" />
                          <span>{language === 'gu' ? 'ટિકિટ નોંધો' : 'Log Support Ticket'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSendEmailDirect}
                          className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-slate-700"
                          title="Open default mail app"
                        >
                          <Mail className="w-4 h-4 text-emerald-400" />
                          <span>Email App</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleOpenGmailWeb}
                          className="py-2.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 rounded-lg font-bold flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                          title="Open in Gmail Web composer"
                        >
                          <span>Gmail</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleOpenOutlookWeb}
                          className="py-2.5 px-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-900 border border-blue-300 rounded-lg font-bold flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                          title="Open in Outlook Web composer"
                        >
                          <span>Outlook</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleCopyDiagnostic}
                          className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                          title="Copy full diagnostic report to clipboard"
                        >
                          {copiedReport ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedReport ? 'Copied' : 'Copy Report'}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 4: MY TICKETS */}
              {activeTab === 'TICKETS' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {language === 'gu' ? 'નોંધાયેલી ફરિયાદો અને સ્થિતિ' : 'Logged Tickets & Resolution Logs'}
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
                    </span>
                  </div>

                  {tickets.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
                      <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700">No tickets logged yet</p>
                      <p className="text-slate-400 mt-1">Use the "Report Issue" tab if you need support.</p>
                    </div>
                  ) : (
                    tickets.map((tkt) => (
                      <div
                        key={tkt.id}
                        className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs font-bold text-slate-900">{tkt.id}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                tkt.status === 'RESOLVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tkt.status === 'IN_REVIEW'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {tkt.status}
                              </span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                tkt.urgency === 'URGENT' ? 'bg-rose-100 text-rose-800' :
                                tkt.urgency === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {tkt.urgency}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 mt-1.5">{tkt.title}</h4>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {new Date(tkt.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                          {tkt.description}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <span>Module: <strong className="text-slate-700">{tkt.module}</strong></span>
                          <span>Contact: <strong className="text-slate-700">{tkt.reporterContact}</strong></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer Contact Bar */}
            <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] text-slate-600">
                  {language === 'gu' ? 'GSEB માન્ય ડિજિટલ સંચાલન સહાય' : 'Official ClassSec Institutional Support'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleOpenInAppMailComposer}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-semibold text-xs border border-emerald-200 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-mono">{SUPPORT_EMAIL}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Direct Mail Dispatcher Modal */}
      {isInAppMailModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {language === 'gu' ? 'ઇન-એપ સપોર્ટ મેલ ડિસ્પેચર' : 'Institutional Support Email Composer'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {language === 'gu'
                      ? 'ઓફિશિયલ ટેકનિકલ સપોર્ટ ડેસ્ક પર સીધો સંદેશ મોકલો'
                      : 'Direct RFC-compliant message relay to harshsec@proton.me'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsInAppMailModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
              {mailSentSuccess ? (
                <div className="p-6 text-center space-y-3 my-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {language === 'gu' ? 'સંદેશ સફળતાપૂર્વક મોકલાઈ ગયો!' : 'Support Request Dispatched Successfully!'}
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    {language === 'gu'
                      ? 'તમારી વિનંતી સપોર્ટ ડેસ્ક પર નોંધાઈ ગઈ છે અને ટિકિટ જનરેટ થઈ છે.'
                      : 'Your inquiry has been relayed to the support desk and logged into your Tickets tab.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Recipient & Sender Badges */}
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-500">To:</span>
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {SUPPORT_EMAIL}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-500">From:</span>
                      <span className="font-mono text-slate-700">
                        {reporterContact || currentUser?.email || 'user@school.edu.in'} ({currentRole || 'USER'})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-500">School:</span>
                      <span className="text-slate-800 font-medium">{currentSchool.name}</span>
                    </div>
                  </div>

                  {/* Subject Input */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {language === 'gu' ? 'વિષય (Subject)' : 'Subject'}
                    </label>
                    <input
                      type="text"
                      value={inAppMailSubject}
                      onChange={(e) => setInAppMailSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                    />
                  </div>

                  {/* Body Textarea */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {language === 'gu' ? 'સંદેશ અને ડાયગ્નોસ્ટિક વિગતો' : 'Message Body & Diagnostic Info'}
                    </label>
                    <textarea
                      rows={7}
                      value={inAppMailBody}
                      onChange={(e) => setInAppMailBody(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg border border-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none leading-relaxed"
                    />
                  </div>

                  {/* Web Mail Quick Launch Buttons */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[11px] font-bold text-slate-700 mb-2">
                      {language === 'gu' ? 'અથવા સીધા વેબમેલ કંપોઝરમાં ખોલો:' : 'Or open directly in external mail composer:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleOpenGmailWeb}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                        <span>Open in Gmail Web</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenOutlookWeb}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        <span>Open in Outlook Web</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyDiagnostic}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedReport ? 'Copied' : 'Copy All Text'}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions */}
            {!mailSentSuccess && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsInAppMailModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
                >
                  {language === 'gu' ? 'બંધ કરો' : 'Cancel'}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleSendViaInAppRelay}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>{language === 'gu' ? 'ઇન-એપ રીલે દ્વારા મોકલો' : 'Send via In-App Relay'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
