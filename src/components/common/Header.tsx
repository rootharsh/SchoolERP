import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, Language } from '../../context/LanguageContext';
import {
  Building2,
  ShieldCheck,
  LogOut,
  RotateCcw,
  ChevronDown,
  Menu,
  Globe,
  Check,
  Heart,
  Sparkles,
  ArrowLeft,
  LifeBuoy,
} from 'lucide-react';
import { ERPLogo } from './ERPLogo';
import { erpDb } from '../../services/db';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenHelp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenHelp }) => {
  const {
    currentUser,
    currentSchool,
    currentRole,
    allSchools,
    switchSchool,
    switchDemoRole,
    logout,
    refreshData,
  } = useAuth();

  const { language, setLanguage, t } = useLanguage();

  const [showSchoolMenu, setShowSchoolMenu] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleResetData = () => {
    if (
      window.confirm(
        language === 'gu'
          ? 'શું તમે તમામ ગુજરાત શાળાઓનો ડેમો ડેટા ફરી મૂળ સ્થિતિમાં સેટ કરવા માંગો છો?'
          : 'Reset all demo school data across all institutions back to initial seed state?'
      )
    ) {
      setResetting(true);
      erpDb.resetToFactorySeed();
      refreshData();
      setTimeout(() => {
        setResetting(false);
      }, 400);
    }
  };

  const roleConfigs: Record<string, { label: string; guLabel: string; bgActive: string; textActive: string }> = {
    PRINCIPAL: {
      label: 'Principal',
      guLabel: 'આચાર્ય',
      bgActive: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25',
      textActive: 'text-blue-600',
    },
    TEACHER: {
      label: 'Teacher',
      guLabel: 'શિક્ષક',
      bgActive: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-500/25',
      textActive: 'text-emerald-600',
    },
    STUDENT: {
      label: 'Student',
      guLabel: 'વિદ્યાર્થી',
      bgActive: 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-sm shadow-sky-500/25',
      textActive: 'text-sky-600',
    },
    PARENT: {
      label: 'Parent',
      guLabel: 'વાલી',
      bgActive: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm shadow-amber-500/25',
      textActive: 'text-amber-600',
    },
    SUPER_ADMIN: {
      label: 'Super Admin',
      guLabel: 'સુપર એડમિન',
      bgActive: 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-sm shadow-purple-500/25',
      textActive: 'text-purple-600',
    },
  };

  const [secretClickCount, setSecretClickCount] = useState(0);

  const handleSecretGsebClick = () => {
    const newCount = secretClickCount + 1;
    setSecretClickCount(newCount);
    if (newCount >= 3) {
      setSecretClickCount(0);
      switchDemoRole('SUPER_ADMIN');
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
      {/* Top Context & Compliance Bar */}
      <div className="bg-slate-900 text-slate-200 px-3 sm:px-4 lg:px-6 py-1.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 border-b border-slate-800">
        <div className="flex items-center space-x-2 flex-wrap text-[11px]">
          <div
            onClick={handleSecretGsebClick}
            title={secretClickCount > 0 ? `${3 - secretClickCount} clicks away from Super Admin Vault` : undefined}
            className="flex items-center text-emerald-400 font-semibold space-x-1.5 shrink-0 cursor-pointer select-none"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300 font-medium">{t('gseb_index', 'GSEB')}:</span>
            <span className="font-mono bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded text-[11px] font-bold">
              {currentSchool.gseb_index || currentSchool.code}
            </span>
          </div>
          <span className="text-slate-700 hidden xs:inline">|</span>
          <span className="text-slate-400 hidden md:inline">{t('affiliation', 'Affiliation:')}</span>
          <span className="text-slate-300 font-mono text-[10px] sm:text-[11px] font-medium hidden sm:inline">{currentSchool.affiliationNumber}</span>
          <span className="text-slate-700 hidden lg:inline">|</span>
          <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-0.2 rounded-full text-[10px] font-bold font-mono shrink-0 hidden xs:inline">
            {t('self_financed_badge', 'Self-Financed')}
          </span>
        </div>

        {/* Demo Persona Switcher Pill Group (Super Admin hidden unless active) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5 -mx-1 px-1">
          <span className="text-slate-400 text-[10px] sm:text-[11px] mr-1 hidden xl:inline font-mono font-medium">
            {t('demo_role', 'Demo Persona:')}
          </span>
          {(['PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT'] as const).map((roleKey) => {
            const config = roleConfigs[roleKey];
            const isActive = currentRole === roleKey;
            return (
              <button
                key={roleKey}
                onClick={() => switchDemoRole(roleKey)}
                className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? config.bgActive
                    : 'bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                {language === 'gu' ? config.guLabel : config.label}
              </button>
            );
          })}

          {/* Render Super Admin ONLY when currently active */}
          {currentRole === 'SUPER_ADMIN' && (
            <span
              className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold shrink-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-sm shadow-purple-500/25 border border-purple-400/40 font-mono"
            >
              ★ {language === 'gu' ? 'સુપર એડમિન' : 'Super Admin'}
            </span>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="px-2 sm:px-4 lg:px-6 py-1.5 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-3 w-full overflow-hidden">
        <div className="flex items-center space-x-1.5 sm:space-x-3 min-w-0 shrink">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer border border-slate-200 shrink-0"
            aria-label="Toggle Menu"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Logo & Platform Name */}
          <ERPLogo language={language} size="sm" className="shrink min-w-0" />

          {/* Campus Display: Dropdown for SUPER_ADMIN (Multi-Tenant Master), Fixed Scope Badge for PRINCIPAL & Single-School Roles */}
          {currentRole === 'SUPER_ADMIN' ? (
            <div className="relative hidden lg:block pl-3 border-l border-slate-200">
              <button
                onClick={() => setShowSchoolMenu(!showSchoolMenu)}
                className="flex items-center space-x-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-950 transition-colors cursor-pointer group"
                title={language === 'gu' ? 'સુપર એડમિન: તમામ સંકુલોનું સંચાલન' : 'Super Admin: Switch active campus view'}
              >
                <Building2 className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-mono text-purple-600 font-extrabold tracking-wider">
                    {language === 'gu' ? 'તમામ શાળા સંકુલો' : 'ERP SaaS Master'}
                  </div>
                  <div className="truncate max-w-[170px] font-heading font-bold text-purple-950">
                    {language === 'gu' && currentSchool.gujarati_name
                      ? currentSchool.gujarati_name.split(' (')[0]
                      : currentSchool.name.split(' (')[0]}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-purple-500 ml-1" />
              </button>

              {showSchoolMenu && (
                <div className="absolute left-0 mt-2 w-92 bg-white border border-purple-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                  <div className="px-3.5 py-2 border-b border-purple-100 text-[11px] font-bold uppercase text-purple-800 tracking-wider bg-purple-50 flex items-center justify-between font-mono">
                    <span>{language === 'gu' ? 'શાળા સંકુલ પસંદ કરો' : 'Switch Multi-Tenant Campus'}</span>
                    <span className="text-[10px] bg-purple-200 px-1.5 py-0.5 rounded text-purple-900 font-bold">{allSchools.length} Campuses</span>
                  </div>
                  {allSchools.map((school) => (
                    <button
                      key={school.id}
                      onClick={() => {
                        switchSchool(school.id);
                        setShowSchoolMenu(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-purple-50/70 transition-colors cursor-pointer ${
                        school.id === currentSchool.id
                          ? 'bg-purple-100 text-purple-950 font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">
                          {language === 'gu' && school.gujarati_name ? school.gujarati_name : school.name}
                        </div>
                        <div className="text-[11px] text-slate-500">{school.address.split(',')[0]}</div>
                      </div>
                      <span className="text-[10px] font-mono bg-purple-50 text-purple-800 border border-purple-200 px-1.5 py-0.5 rounded font-bold">
                        {school.gseb_index || school.code}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-slate-200">
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-800">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500 font-bold">
                    {currentRole === 'PRINCIPAL' ? (language === 'gu' ? 'આચાર્ય સંચાલિત સંકુલ' : 'Assigned Campus') : (language === 'gu' ? 'શાળા સંકુલ' : 'Campus')}
                  </div>
                  <div className="truncate max-w-[200px] font-heading font-bold text-slate-900">
                    {language === 'gu' && currentSchool.gujarati_name
                      ? currentSchool.gujarati_name.split(' (')[0]
                      : currentSchool.name.split(' (')[0]}
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-bold ml-1">
                  {currentSchool.gseb_index || 'GSEB'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
          {/* Eye-Catching Harsh Ravaliya Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 shadow-xs hover:border-emerald-500/50 transition-all cursor-default">
            <span className="text-[11px] text-slate-400 font-medium">{language === 'gu' ? 'નિર્મિત' : 'Made with'}</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse shrink-0" />
            <span className="text-[11px] text-slate-400 font-medium">{language === 'gu' ? 'દ્વારા' : 'by'}</span>
            <span className="text-xs font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-heading tracking-wide">
              Harsh Ravaliya
            </span>
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
          </div>

          {/* Strict 2-Way Language Toggle: [ English | ગુજરાતી ] */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg sm:rounded-xl border border-slate-200 shadow-inner shrink-0">
            <button
              onClick={() => setLanguage('en')}
              className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                language === 'en'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="sm:hidden">EN</span>
              <span className="hidden sm:inline">English</span>
              {language === 'en' && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />}
            </button>
            <button
              onClick={() => setLanguage('gu')}
              className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                language === 'gu'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="sm:hidden">ગુજ</span>
              <span className="hidden sm:inline">ગુજરાતી</span>
              {language === 'gu' && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />}
            </button>
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={handleResetData}
            title={language === 'gu' ? 'ડેટા મૂળ સ્થિતિમાં લાવો' : 'Reset Database to Initial State'}
            className="hidden md:flex items-center space-x-1.5 text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all hover:scale-105 cursor-pointer shrink-0"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
            <span>{t('reset_demo', 'Reset')}</span>
          </button>

          {/* Help & Support Header Button */}
          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              title={language === 'gu' ? 'મદદ અને માર્ગદર્શન' : 'Help, Guides & Support'}
              className="flex items-center space-x-1.5 text-slate-700 hover:text-emerald-800 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all hover:scale-105 cursor-pointer shrink-0"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">{language === 'gu' ? 'સહાયતા' : 'Support'}</span>
            </button>
          )}

          {/* User Profile */}
          {currentUser && (
            <div className="flex items-center space-x-1 sm:space-x-2 pl-1 sm:pl-2 border-l border-slate-200 shrink-0">
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-slate-900 leading-tight font-heading truncate max-w-[120px]">
                  {language === 'gu' && currentUser.gujarati_name
                    ? currentUser.gujarati_name.split(' (')[0]
                    : currentUser.full_name.split(' (')[0]}
                </div>
                <div className="text-[10px] text-slate-500 font-mono font-medium">
                  {t(`role_${currentUser.role.toLowerCase()}`, currentUser.role)}
                </div>
              </div>
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUser.full_name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-emerald-500/40 object-cover shadow-xs"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
              </div>

              <button
                onClick={logout}
                title={t('logout', 'Sign Out')}
                className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg sm:rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
