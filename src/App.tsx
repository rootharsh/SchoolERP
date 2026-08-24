import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Role } from './types/erp';
import { LoginView } from './components/auth/LoginView';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { HelpWidget } from './components/common/HelpWidget';
import {
  LayoutDashboard,
  Users,
  IndianRupee,
  ClipboardCheck,
  BookOpen,
  Award,
  Clock,
  Menu,
  Building,
  BarChart3,
  Heart,
  Sparkles,
} from 'lucide-react';

// Principal / Administrator Components
import { PrincipalDashboard } from './components/admin/PrincipalDashboard';
import { StudentDirectory } from './components/admin/StudentDirectory';
import { CsvBulkImporter } from './components/admin/CsvBulkImporter';
import { FeeOperations } from './components/admin/FeeOperations';
import { StaffPayroll } from './components/admin/StaffPayroll';
import { TimetableBuilder } from './components/admin/TimetableBuilder';
import { NoticeEngine } from './components/admin/NoticeEngine';
import { InstitutionalAnalytics } from './components/admin/InstitutionalAnalytics';
import { AuditLogsView } from './components/admin/AuditLogsView';

// Teacher Components
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { AttendanceRegister } from './components/teacher/AttendanceRegister';
import { FacultySchedule } from './components/teacher/FacultySchedule';
import { HomeworkDiary } from './components/teacher/HomeworkDiary';
import { GradebookManagement } from './components/teacher/GradebookManagement';
import { StaffCollaborationHub } from './components/teacher/StaffCollaborationHub';

// Student Components
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentTimetable } from './components/student/StudentTimetable';
import { StudentHomework } from './components/student/StudentHomework';
import { DigitalLibrary } from './components/student/DigitalLibrary';
import { StudentAttendanceHealth } from './components/student/StudentAttendanceHealth';
import { StudentReportCard } from './components/student/StudentReportCard';

// Parent Components
import { ParentDashboard } from './components/parent/ParentDashboard';
import { ParentFeePayments } from './components/parent/ParentFeePayments';
import { ParentAttendanceTracker } from './components/parent/ParentAttendanceTracker';
import { ParentMarksheets } from './components/parent/ParentMarksheets';
import { FacultyLiaisonDirectory } from './components/parent/FacultyLiaisonDirectory';

// Super Admin Components
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';

const ERPAppContent: React.FC = () => {
  const { isAuthenticated, currentUser, currentRole } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#\/?/, '') : '';
    return hash || 'dashboard';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const navigateToTab = (newTab: string, replace = false) => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      const targetHash = `#/${newTab}`;
      if (window.location.hash !== targetHash) {
        if (replace) {
          window.history.replaceState({ tab: newTab }, '', targetHash);
        } else {
          window.history.pushState({ tab: newTab }, '', targetHash);
        }
      }
    }
  };

  // Sync default tab when role changes and listen to browser back / forward navigation
  React.useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash) {
        setActiveTab(hash);
      } else {
        const defaultTab = currentRole === 'SUPER_ADMIN' ? 'tenants' : 'dashboard';
        setActiveTab(defaultTab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    // Initial check or role adjustment
    const currentHash = window.location.hash.replace(/^#\/?/, '');
    if (!currentHash) {
      const defaultTab = currentRole === 'SUPER_ADMIN' ? 'tenants' : 'dashboard';
      navigateToTab(defaultTab, true);
    } else if (currentRole === 'SUPER_ADMIN' && currentHash === 'dashboard') {
      navigateToTab('tenants', true);
    } else if (currentRole !== 'SUPER_ADMIN' && ['tenants', 'platform-metrics', 'rls-auditor', 'audit-trail'].includes(currentHash)) {
      navigateToTab('dashboard', true);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [currentRole]);

  // If not logged in, show authentication view
  if (!isAuthenticated || !currentUser || !currentRole) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    // Principal Views
    if (currentRole === 'PRINCIPAL') {
      switch (activeTab) {
        case 'dashboard':
          return <PrincipalDashboard onNavigate={navigateToTab} />;
        case 'students':
          return <StudentDirectory onOpenBulkImport={() => navigateToTab('csv-import')} />;
        case 'csv-import':
          return <CsvBulkImporter onComplete={() => navigateToTab('students')} />;
        case 'fees':
          return <FeeOperations />;
        case 'staff-payroll':
          return <StaffPayroll />;
        case 'timetable':
          return <TimetableBuilder />;
        case 'notices':
          return <NoticeEngine />;
        case 'analytics':
          return <InstitutionalAnalytics />;
        case 'audit-logs':
          return <AuditLogsView />;
        default:
          return <PrincipalDashboard onNavigate={navigateToTab} />;
      }
    }

    // Teacher Views
    if (currentRole === 'TEACHER') {
      switch (activeTab) {
        case 'dashboard':
          return <TeacherDashboard onNavigate={navigateToTab} />;
        case 'attendance':
          return <AttendanceRegister />;
        case 'schedule':
          return <FacultySchedule />;
        case 'homework':
          return <HomeworkDiary />;
        case 'gradebook':
          return <GradebookManagement />;
        case 'staff-hub':
          return <StaffCollaborationHub />;
        case 'notices':
          return <NoticeEngine />;
        default:
          return <TeacherDashboard onNavigate={navigateToTab} />;
      }
    }

    // Student Views
    if (currentRole === 'STUDENT') {
      switch (activeTab) {
        case 'dashboard':
          return <StudentDashboard onNavigate={navigateToTab} />;
        case 'timetable':
          return <StudentTimetable />;
        case 'homework':
          return <StudentHomework />;
        case 'library':
          return <DigitalLibrary />;
        case 'attendance':
        case 'leave':
          return <StudentAttendanceHealth />;
        case 'report-card':
          return <StudentReportCard />;
        case 'notices':
          return <NoticeEngine />;
        default:
          return <StudentDashboard onNavigate={navigateToTab} />;
      }
    }

    // Parent Views
    if (currentRole === 'PARENT') {
      switch (activeTab) {
        case 'dashboard':
          return <ParentDashboard onNavigate={navigateToTab} />;
        case 'attendance':
          return <ParentAttendanceTracker />;
        case 'fees':
          return <ParentFeePayments />;
        case 'homework-stream':
          return <StudentHomework />;
        case 'marksheets':
          return <ParentMarksheets />;
        case 'directory':
          return <FacultyLiaisonDirectory />;
        case 'notices':
          return <NoticeEngine />;
        default:
          return <ParentDashboard onNavigate={navigateToTab} />;
      }
    }

    // Super Admin Views
    if (currentRole === 'SUPER_ADMIN') {
      return <SuperAdminDashboard activeTab={activeTab} onNavigate={navigateToTab} />;
    }

    return <PrincipalDashboard onNavigate={navigateToTab} />;
  };

  // Dynamic Mobile Bottom Bar Nav Items per Role
  const getMobileBottomNav = () => {
    switch (currentRole) {
      case 'PRINCIPAL':
        return [
          { id: 'dashboard', label: language === 'gu' ? 'ડેશબોર્ડ' : 'Overview', icon: LayoutDashboard },
          { id: 'students', label: language === 'gu' ? 'વિદ્યાર્થી' : 'Students', icon: Users },
          { id: 'fees', label: language === 'gu' ? 'ફી કલેક્શન' : 'Fees', icon: IndianRupee },
          { id: 'timetable', label: language === 'gu' ? 'સમયપત્રક' : 'Timetable', icon: Clock },
        ];
      case 'TEACHER':
        return [
          { id: 'dashboard', label: language === 'gu' ? 'મુખ્ય' : 'Home', icon: LayoutDashboard },
          { id: 'attendance', label: language === 'gu' ? 'હાજરી' : 'Attendance', icon: ClipboardCheck },
          { id: 'homework', label: language === 'gu' ? 'હોમવર્ક' : 'Diary', icon: BookOpen },
          { id: 'gradebook', label: language === 'gu' ? 'ગુણ' : 'Marks', icon: Award },
        ];
      case 'STUDENT':
        return [
          { id: 'dashboard', label: language === 'gu' ? 'પોર્ટલ' : 'Portal', icon: LayoutDashboard },
          { id: 'timetable', label: language === 'gu' ? 'સમયપત્રક' : 'Schedule', icon: Clock },
          { id: 'homework', label: language === 'gu' ? 'હોમવર્ક' : 'Tasks', icon: BookOpen },
          { id: 'report-card', label: language === 'gu' ? 'રિપોર્ટ કાર્ડ' : 'Results', icon: Award },
        ];
      case 'PARENT':
        return [
          { id: 'dashboard', label: language === 'gu' ? 'વિદ્યાર્થી' : 'Child', icon: LayoutDashboard },
          { id: 'attendance', label: language === 'gu' ? 'હાજરી' : 'Attendance', icon: ClipboardCheck },
          { id: 'fees', label: language === 'gu' ? 'ફી ભરો' : 'Pay Fees', icon: IndianRupee },
          { id: 'marksheets', label: language === 'gu' ? 'ગુણપત્રક' : 'Marks', icon: Award },
        ];
      case 'SUPER_ADMIN':
        return [
          { id: 'tenants', label: language === 'gu' ? 'કેમ્પસ' : 'Campuses', icon: Building },
          { id: 'platform-metrics', label: language === 'gu' ? 'મેટ્રિક્સ' : 'Analytics', icon: BarChart3 },
          { id: 'rls-auditor', label: language === 'gu' ? 'સુરક્ષા' : 'RLS Roles', icon: Users },
        ];
      default:
        return [
          { id: 'dashboard', label: language === 'gu' ? 'મુખ્ય' : 'Home', icon: LayoutDashboard },
        ];
    }
  };

  const mobileNavItems = getMobileBottomNav();

  return (
    <div className="min-h-screen bg-slate-50 bg-mesh-pattern flex flex-col font-sans antialiased text-slate-900 selection:bg-emerald-600 selection:text-white pb-16 md:pb-0">
      {/* Unified Bilingual Header */}
      <Header
        onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* App Workspace Shell */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Side Navigation Bar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            navigateToTab(tab);
            setIsMobileMenuOpen(false);
          }}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-2.5 sm:p-5 lg:p-8 pb-28 md:pb-8 bg-transparent">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {renderActiveView()}

            {/* Portal Footer & Harsh Ravaliya Credits */}
            <footer className="pt-8 pb-4 mt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span>ClassSec Gujarat School ERP • GSEB Standard v4.2</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white shadow-md border border-slate-700/80 hover:border-emerald-500/50 transition-all">
                  <span className="text-[11px] text-slate-400 font-medium">{language === 'gu' ? 'હૃદયપૂર્વક નિર્મિત' : 'Made with'}</span>
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse inline shrink-0" />
                  <span className="text-[11px] text-slate-400 font-medium">{language === 'gu' ? 'દ્વારા' : 'by'}</span>
                  <span className="font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-heading tracking-wide">
                    Harsh Ravaliya
                  </span>
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0 inline ml-0.5" />
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* 24x7 Helpdesk & Support Center Drawer (Opened cleanly via Header or Sidebar) */}
      <HelpWidget
        isOpen={isHelpOpen}
        onOpen={() => setIsHelpOpen(true)}
        onClose={() => setIsHelpOpen(false)}
        onNavigateTab={(tab) => {
          navigateToTab(tab);
          setIsHelpOpen(false);
        }}
      />

      {/* Sleek Mobile Bottom Navigation Bar */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1 py-1.5 flex items-center justify-around shadow-lg pb-safe transition-all duration-200 ${
          isMobileMenuOpen ? 'opacity-0 pointer-events-none translate-y-full' : 'opacity-100 translate-y-0'
        }`}
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                navigateToTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer min-w-[50px] min-h-[44px] ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-50 text-emerald-700' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 leading-none whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
        {/* Menu Drawer Toggle Button in Bottom Bar */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer min-w-[50px] min-h-[44px] ${
            isMobileMenuOpen
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${isMobileMenuOpen ? 'bg-emerald-50 text-emerald-700' : ''}`}>
            <Menu className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 leading-none whitespace-nowrap">{language === 'gu' ? 'મેનુ' : 'More'}</span>
        </button>
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ERPAppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
