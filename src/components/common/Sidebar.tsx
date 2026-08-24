import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  IndianRupee,
  Briefcase,
  Calendar,
  Bell,
  BarChart3,
  ShieldCheck,
  BookOpen,
  ClipboardCheck,
  Clock,
  Award,
  MessageSquare,
  Library,
  HeartHandshake,
  Building,
  Activity,
  Layers,
  GraduationCap,
  X,
  Code2,
  Sparkles,
  Heart,
  ArrowLeft,
  LogOut,
  LifeBuoy,
  UserPlus,
  KeyRound,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenHelp?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
  onOpenHelp,
}) => {
  const { currentRole, currentSchool, logout } = useAuth();
  const { language, t } = useLanguage();

  const getNavItems = () => {
    switch (currentRole) {
      case 'PRINCIPAL':
        return [
          { id: 'dashboard', label: t('nav_dashboard', 'School Overview'), icon: LayoutDashboard },
          { id: 'students', label: t('nav_students', 'Student Register (G.R.)'), icon: Users },
          { id: 'csv-import', label: t('nav_csv_import', 'Bulk Student CSV'), icon: FileSpreadsheet },
          { id: 'fees', label: t('nav_fees', 'Fee Counter & Receipts'), icon: IndianRupee },
          { id: 'staff-payroll', label: t('nav_staff_payroll', 'Staff & Payroll'), icon: Briefcase },
          { id: 'timetable', label: t('nav_timetable', 'Timetable Master'), icon: Calendar },
          { id: 'notices', label: t('nav_notices', 'Notices & Circulars'), icon: Bell },
          { id: 'analytics', label: t('nav_analytics', 'GSEB School Analytics'), icon: BarChart3 },
          { id: 'audit-logs', label: t('nav_audit_logs', 'Security Audit Logs'), icon: ShieldCheck },
        ];

      case 'TEACHER':
        return [
          { id: 'dashboard', label: t('nav_dashboard', 'Class Dashboard'), icon: LayoutDashboard },
          { id: 'attendance', label: t('nav_attendance', 'Daily Attendance'), icon: ClipboardCheck },
          { id: 'schedule', label: t('nav_schedule', 'Teaching Schedule'), icon: Clock },
          { id: 'homework', label: t('nav_homework', 'Homework Diary'), icon: BookOpen },
          { id: 'gradebook', label: t('nav_gradebook', 'Ekam Kasoti & Marks'), icon: Award },
          { id: 'staff-hub', label: t('nav_staff_hub', 'Staff Collaboration'), icon: MessageSquare },
          { id: 'notices', label: t('nav_notices', 'School Circulars'), icon: Bell },
        ];

      case 'STUDENT':
        return [
          { id: 'dashboard', label: t('nav_dashboard', 'Student Portal'), icon: LayoutDashboard },
          { id: 'timetable', label: t('nav_schedule', 'Period Timetable'), icon: Clock },
          { id: 'homework', label: t('nav_homework', 'Homework Diary'), icon: BookOpen },
          { id: 'library', label: t('nav_library', 'GSEB e-Library'), icon: Library },
          { id: 'attendance', label: t('nav_attendance', 'Attendance Records'), icon: Activity },
          { id: 'report-card', label: t('nav_report_card', 'Report Card & PAT'), icon: Award },
          { id: 'notices', label: t('nav_notices', 'School Circulars'), icon: Bell },
        ];

      case 'PARENT':
        return [
          { id: 'dashboard', label: t('nav_dashboard', 'Student Profile'), icon: LayoutDashboard },
          { id: 'attendance', label: t('nav_attendance', 'Daily Attendance'), icon: ClipboardCheck },
          { id: 'fees', label: t('nav_fees', 'Fee Receipts & Online Pay'), icon: IndianRupee },
          { id: 'homework-stream', label: t('nav_homework', 'Daily Homework Diary'), icon: BookOpen },
          { id: 'marksheets', label: t('nav_gradebook', 'Ekam Kasoti & Marks'), icon: Award },
          { id: 'directory', label: language === 'gu' ? 'શિક્ષક અને વાહન સંપર્ક' : 'Teacher & Bus Liaison', icon: HeartHandshake },
          { id: 'notices', label: t('nav_notices', 'School Circulars'), icon: Bell },
        ];

      case 'SUPER_ADMIN':
        return [
          { id: 'tenants', label: language === 'gu' ? 'શાળા સંકુલો (Tenants)' : 'All School Campuses', icon: Building },
          { id: 'access-provisioning', label: language === 'gu' ? 'આચાર્ય & શિક્ષક ફાળવણી' : 'Staff & Principal Access', icon: KeyRound },
          { id: 'platform-metrics', label: language === 'gu' ? 'સંકલિત પ્રગતિ રિપોર્ટ' : 'Consolidated Analytics', icon: BarChart3 },
          { id: 'rls-auditor', label: language === 'gu' ? 'સુરક્ષા અને અધિકારો' : 'Role Security Auditor', icon: ShieldCheck },
          { id: 'audit-trail', label: t('nav_audit_logs', 'Audit & Access Logs'), icon: Layers },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  React.useEffect(() => {
    if (isOpenMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpenMobile]);

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop - Covers full screen with high z-index */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[60] md:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 md:sticky md:top-[85px] h-[100dvh] md:h-[calc(100vh-85px)] w-[285px] max-w-[85vw] md:w-64 bg-white/98 md:bg-white/95 backdrop-blur-md border-r border-slate-200 flex flex-col justify-between z-[70] md:z-30 transition-transform duration-300 ease-out shrink-0 shadow-2xl md:shadow-xs pb-safe ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5 scrollbar-thin">
          {/* Institutional Banner inside Sidebar on Mobile with Close Button */}
          <div className="md:hidden pb-3 mb-2 border-b border-slate-200 px-1 flex items-center justify-between">
            <div className="pr-2 min-w-0">
              <div className="font-bold font-heading text-slate-900 text-sm truncate">
                {language === 'gu' && currentSchool.gujarati_name ? currentSchool.gujarati_name.split(' (')[0] : currentSchool.name}
              </div>
              <div className="text-[11px] text-emerald-700 font-mono font-bold">GSEB: {currentSchool.gseb_index || currentSchool.code}</div>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer shrink-0 border border-slate-200 active:scale-95 transition-transform"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>{t(`role_${currentRole?.toLowerCase()}`, currentRole || 'PORTAL')}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer text-left relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25 font-bold'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-white/15' : 'text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors'}`}>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : ''}`} />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs shrink-0" />
                )}
              </button>
            );
          })}

          {/* Quick Help & Support Item in Navigation */}
          {onOpenHelp && (
            <button
              onClick={() => {
                onOpenHelp();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-800 bg-slate-50 hover:bg-emerald-50/80 border border-slate-200/80 hover:border-emerald-200 transition-all duration-200 cursor-pointer text-left mt-2"
            >
              <div className="flex items-center space-x-3 truncate">
                <div className="p-1 rounded-lg bg-slate-200/70 text-slate-700">
                  <LifeBuoy className="w-4 h-4 shrink-0 text-emerald-600" />
                </div>
                <span className="truncate font-medium text-slate-800">
                  {language === 'gu' ? 'મદદ અને માર્ગદર્શન' : 'Help & Support Desk'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full">
                24×7
              </span>
            </button>
          )}
        </div>

        {/* Institution Info Footer */}
        <div className="p-3 border border-slate-200/80 bg-gradient-to-br from-slate-50 to-emerald-50/40 rounded-2xl mx-3 mb-2 shadow-2xs shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
              CAMPUS
            </span>
            <span className="flex items-center text-[10px] text-emerald-700 font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
              ONLINE
            </span>
          </div>
          <div className="text-xs font-bold font-heading text-slate-900 truncate">
            {language === 'gu' && currentSchool.gujarati_name ? currentSchool.gujarati_name.split(' (')[0] : currentSchool.name}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            UDISE+: {currentSchool.udiseCode || '24090104512'}
          </div>
        </div>

        {/* Creator Credit Badge */}
        <div className="mx-3 mb-3 p-2.5 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-md border border-slate-700/80 flex items-center justify-between shrink-0 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <Code2 className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <div className="text-[9px] text-slate-400 font-mono tracking-wider font-semibold flex items-center space-x-1">
                <span>{language === 'gu' ? 'હૃદયપૂર્વક નિર્મિત' : 'Made with'}</span>
                <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500 animate-pulse inline" />
                <span>{language === 'gu' ? '' : 'by'}</span>
              </div>
              <div className="text-[12px] font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-heading tracking-wide flex items-center space-x-1">
                <span className="truncate">Harsh Ravaliya</span>
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0 inline" />
              </div>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0 ml-1" />
        </div>
      </aside>
    </>
  );
};
