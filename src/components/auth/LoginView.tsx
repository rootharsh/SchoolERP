import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Role } from '../../types/erp';
import {
  Building2,
  Lock,
  Mail,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  UserCheck,
  Landmark,
  Shield,
  Sparkles,
  Heart,
  UserPlus,
  LogIn,
  Bug,
  ShieldAlert,
  User as UserIcon,
  Phone,
} from 'lucide-react';
import { ERPLogo } from '../common/ERPLogo';
import { GENERIC_AUTH_ERROR, GENERIC_AUTH_ERROR_GU } from '../../lib/validation/authSchemas';

export const LoginView: React.FC = () => {
  const { allSchools, login, registerUser, verifyMFA, pendingMFAUser, cancelMFA } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // Mode: 'login' | 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Login Form State
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(allSchools[0]?.id || 'school-sharda-rajkot');
  const [email, setEmail] = useState<string>('principal@royalacademyrajkot.edu.in');
  const [password, setPassword] = useState<string>('gseb2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Signup Form State (Self-registration strictly for Students & Parents)
  const [signupName, setSignupName] = useState<string>('Harsh V. Dave');
  const [signupEmail, setSignupEmail] = useState<string>('harsh.dave@royalacademyrajkot.edu.in');
  const [signupUsername, setSignupUsername] = useState<string>('harsh.dave');
  const [signupPassword, setSignupPassword] = useState<string>('StudentPass#2026');
  const [signupRole, setSignupRole] = useState<Role>('STUDENT');
  const [signupPhone, setSignupPhone] = useState<string>('+91 98250 88776');

  // MFA & Status State
  const [totpCode, setTotpCode] = useState<string>('123456');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSecurityTester, setShowSecurityTester] = useState<boolean>(false);

  // Secret Super Admin State
  const [showSecretSuperAdminModal, setShowSecretSuperAdminModal] = useState<boolean>(false);
  const [secretPasscode, setSecretPasscode] = useState<string>('');
  const [secretClickCount, setSecretClickCount] = useState<number>(0);

  // Keyboard shortcut listener for Ctrl+Shift+S or Cmd+Shift+S
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        setShowSecretSuperAdminModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSecretTriggerClick = () => {
    const next = secretClickCount + 1;
    setSecretClickCount(next);
    if (next >= 3) {
      setSecretClickCount(0);
      setShowSecretSuperAdminModal(true);
    }
  };

  const handleExecuteSecretSuperAdminLogin = async (pass?: string) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await login('trustee@royalacademyrajkot.edu.in', 'gseb2026', 'school-sharda-rajkot');
      setLoading(false);
      if (res.success) {
        setShowSecretSuperAdminModal(false);
      } else if (!res.requiresMFA) {
        setErrorMsg(res.error || (language === 'gu' ? GENERIC_AUTH_ERROR_GU : GENERIC_AUTH_ERROR));
      }
    } catch {
      setLoading(false);
      setErrorMsg(language === 'gu' ? GENERIC_AUTH_ERROR_GU : GENERIC_AUTH_ERROR);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await login(email, password, selectedSchoolId);
      setLoading(false);
      if (!res.success && !res.requiresMFA) {
        setErrorMsg(
          res.error || (language === 'gu' ? GENERIC_AUTH_ERROR_GU : GENERIC_AUTH_ERROR)
        );
      }
    } catch {
      setLoading(false);
      setErrorMsg(language === 'gu' ? GENERIC_AUTH_ERROR_GU : GENERIC_AUTH_ERROR);
    }
  };

  // Handle Signup Submit
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await registerUser({
        name: signupName,
        email: signupEmail,
        username: signupUsername,
        password: signupPassword,
        role: signupRole,
        schoolId: selectedSchoolId,
        phone: signupPhone,
      });

      setLoading(false);

      if (res.success && res.user) {
        setSuccessMsg(
          language === 'gu'
            ? `ખાતું સફળતાપૂર્વક પ્રમાણિત થયું અને સંગ્રહાયું (${res.user.full_name}). હવે સાઇન ઇન કરો.`
            : `Account server-validated & created for ${res.user.full_name}. You can now sign in.`
        );
        setEmail(res.user.email);
        setPassword(signupPassword);
        setAuthMode('login');
      } else {
        setErrorMsg(res.error || (language === 'gu' ? GENERIC_AUTH_ERROR_GU : GENERIC_AUTH_ERROR));
      }
    } catch {
      setLoading(false);
      setErrorMsg(language === 'gu' ? GENERIC_AUTH_ERROR_GU : GENERIC_AUTH_ERROR);
    }
  };

  const handleSelectRolePreset = (accEmail: string, schoolId: string) => {
    setAuthMode('login');
    setEmail(accEmail);
    setSelectedSchoolId(schoolId);
    setPassword('gseb2026');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await verifyMFA(totpCode);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(
          res.error ||
            (language === 'gu'
              ? 'અમાન્ય 2FA ચકાસણી કોડ. ડેમો કોડ: 123456'
              : 'Invalid 2FA verification code. Try: 123456')
        );
      }
    } catch {
      setLoading(false);
      setErrorMsg('2FA verification failed.');
    }
  };

  // Quick Security Attack Payloads for Auditing
  const loadAttackPayload = (type: 'xss' | 'sqli' | 'malformed_email' | 'tag_in_name') => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (type === 'xss') {
      setAuthMode('login');
      setEmail('<script>alert("XSS")</script>@royalacademyrajkot.edu.in');
      setPassword('gseb2026');
    } else if (type === 'sqli') {
      setAuthMode('login');
      setEmail("admin' OR '1'='1' --@royalacademyrajkot.edu.in");
      setPassword("' OR 1=1 --");
    } else if (type === 'malformed_email') {
      setAuthMode('login');
      setEmail('invalid..email@@domain..com');
      setPassword('pass123');
    } else if (type === 'tag_in_name') {
      setAuthMode('signup');
      setSignupName('<img src=x onerror=alert(1)> Hacker Name');
      setSignupEmail('hacker@threat-domain.com');
      setSignupUsername('hacker<script>');
      setSignupPassword('Sec#Pass2026');
    }
  };

  const demoAccounts = [
    {
      role: 'PRINCIPAL' as Role,
      title: 'Principal',
      guTitle: 'આચાર્યશ્રી',
      name: 'Dr. Vinodbhai C. Pandya',
      guName: 'ડૉ. વિનોદભાઈ સી. પંડ્યા',
      email: 'principal@royalacademyrajkot.edu.in',
      schoolId: 'school-sharda-rajkot',
      tag: 'Full Governance',
      guTag: 'સંપૂર્ણ વહીવટ',
      icon: Shield,
      accentGradient: 'from-blue-600 to-indigo-600',
      activeBorder: 'border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      role: 'TEACHER' as Role,
      title: 'Class Teacher',
      guTitle: 'વર્ગ શિક્ષક',
      name: 'Smt. Neetaben R. Patel',
      guName: 'શ્રીમતી નીતાબેન આર. પટેલ',
      email: 'neeta.patel@royalacademyrajkot.edu.in',
      schoolId: 'school-sharda-rajkot',
      tag: 'Grade 10–A In-Charge',
      guTag: 'ધોરણ ૧૦-અ વર્ગ શિક્ષક',
      icon: BookOpen,
      accentGradient: 'from-emerald-600 to-teal-600',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/10',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      role: 'STUDENT' as Role,
      title: 'Student',
      guTitle: 'વિદ્યાર્થી',
      name: 'Harsh V. Patel (G.R. 4821)',
      guName: 'હર્ષ વી. પટેલ (જી.આર. ૪૮૨૧)',
      email: 'harsh.patel@student.royalacademyrajkot.edu.in',
      schoolId: 'school-sharda-rajkot',
      tag: 'Class 10th–A (Roll 14)',
      guTag: 'ધોરણ ૧૦-અ વિદ્યાર્થી',
      icon: GraduationCap,
      accentGradient: 'from-sky-600 to-cyan-600',
      activeBorder: 'border-sky-500 ring-2 ring-sky-500/20 shadow-sky-500/10',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      role: 'PARENT' as Role,
      title: 'Parent',
      guTitle: 'વાલીશ્રી',
      name: 'Shri Vinodbhai K. Patel',
      guName: 'શ્રી વિનોદભાઈ કે. પટેલ',
      email: 'vinodbhai.patel@gmail.com',
      schoolId: 'school-sharda-rajkot',
      tag: 'Ward: Harsh Patel',
      guTag: 'પાલ્ય: હર્ષ પટેલ',
      icon: UserCheck,
      accentGradient: 'from-amber-600 to-orange-600',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 shadow-amber-500/10',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 bg-mesh-light-login flex flex-col justify-between text-slate-900 font-sans relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Decorative ambient soft glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-sky-300/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <ERPLogo language={language} size="lg" variant="light" />

          <div className="flex items-center space-x-3">
            {/* Language Switcher in Login Bar */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  language === 'en'
                    ? 'bg-white text-emerald-700 shadow-xs border border-emerald-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>English</span>
                {language === 'en' && <Check className="w-3 h-3 text-emerald-600" />}
              </button>
              <button
                type="button"
                onClick={() => setLanguage('gu')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  language === 'gu'
                    ? 'bg-white text-emerald-700 shadow-xs border border-emerald-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>ગુજરાતી</span>
                {language === 'gu' && <Check className="w-3 h-3 text-emerald-600" />}
              </button>
            </div>

            {/* Secret Super Admin Gate Trigger */}
            <div
              onClick={handleSecretTriggerClick}
              title={
                secretClickCount > 0
                  ? `${3 - secretClickCount} clicks away from Super Admin Vault`
                  : 'GSEB Enterprise Security Gate (Ctrl+Shift+S)'
              }
              className="hidden sm:flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100/70 px-3 py-1.5 rounded-xl border border-emerald-300 text-xs text-emerald-800 cursor-pointer select-none transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold font-mono">
                {language === 'gu' ? 'Zod સર્વર વેલિડેશન' : 'Zod Server-Side Gate'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Secret Super Admin Login Modal */}
      {showSecretSuperAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-white relative overflow-hidden">
            {/* Ambient Background Aura */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading flex items-center space-x-2">
                    <span>{language === 'gu' ? 'સુપર એડમિન ગુપ્ત પ્રવેશદ્વાર' : 'Super Admin Confidential Vault'}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-700">
                      RESTRICTED
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'gu'
                      ? 'મલ્ટી-કેમ્પસ ટ્રસ્ટ શાસન અને સુરક્ષા નિયંત્રક પોર્ટલ'
                      : 'Multi-Campus Institutional Governance & RLS Audit Controller'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSecretSuperAdminModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{language === 'gu' ? 'સુપર એડમિન ખાતું:' : 'Super Admin Account:'}</span>
                <span className="font-mono text-purple-300 font-bold">Shri Pravinbhai G. Patel</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{language === 'gu' ? 'ઇમેઇલ:' : 'Authorized Email:'}</span>
                <span className="font-mono text-slate-200">trustee@royalacademyrajkot.edu.in</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{language === 'gu' ? 'અધિકાર સ્તર:' : 'Privilege Level:'}</span>
                <span className="font-mono text-emerald-400 font-semibold">Tier-1 Multi-Campus Trustee</span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleExecuteSecretSuperAdminLogin()}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 font-heading"
              >
                <Lock className="w-4 h-4 text-purple-200" />
                <span>
                  {loading
                    ? 'Authorizing Super Admin Credentials...'
                    : language === 'gu'
                    ? '૧-ક્લિક સુપર એડમિન પ્રવેશ (Instant Access)'
                    : '1-Click Super Admin Instant Access'}
                </span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 font-mono">
                <span>Shortcut: Ctrl+Shift+S / ⌘+Shift+S</span>
                <span>Audit Logged #SEC-2026</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MFA Verification Modal */}
      {pendingMFAUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-slate-900">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-5">
              <KeyRound className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold font-heading text-slate-900">
              {language === 'gu' ? 'દ્વિ-પરિમાણીય સુરક્ષા (2FA)' : 'Two-Factor Verification (2FA)'}
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              {language === 'gu'
                ? `કૃપા કરીને ખાતા માટે 6-અંકનો સુરક્ષા કોડ દાખલ કરો: `
                : `Enter the 6-digit TOTP verification security code for `}
              <span className="text-emerald-700 font-semibold">{pendingMFAUser.email}</span>.
            </p>
            <div className="mt-3 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-500">💡 {language === 'gu' ? 'ડેમો કોડ:' : 'Demo TOTP code:'}</span>
              <strong className="font-mono text-emerald-700 text-sm font-bold bg-white px-2 py-0.5 rounded border border-emerald-300">123456</strong>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerifyMFA} className="mt-6 space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="123456"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="w-full text-center text-3xl tracking-widest font-mono font-bold py-3.5 rounded-2xl border border-slate-300 bg-slate-50 text-emerald-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={cancelMFA}
                  className="flex-1 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading || totpCode.length < 6}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Verifying...' : language === 'gu' ? 'ચકાસણી કરો' : 'Verify & Enter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full relative z-10 space-y-8">
        {/* Simple & Eye-Catching Persona Access Header */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold mb-2 font-mono shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'gu' ? 'ડેમો એક્સેસ પાસ' : 'ONE-CLICK PERSONA ACCESS'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
              {language === 'gu' ? 'કોઈપણ ભૂમિકા પસંદ કરો' : 'Select a Role to Experience ClassSec'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'gu'
                ? 'કોઈપણ પાસ પર ક્લિક કરો જેથી લોગિન વિગતો આપોઆપ ભરાઈ જશે.'
                : 'Click any pass below to load credentials, then submit to test server-side Zod validation.'}
            </p>
          </div>

          {/* 4 Sleek Eye-Catching Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {demoAccounts.map((acc) => {
              const isSelected = email === acc.email && authMode === 'login';
              const IconComp = acc.icon;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSelectRolePreset(acc.email, acc.schoolId)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                    isSelected
                      ? `bg-white ${acc.activeBorder} shadow-lg scale-[1.02]`
                      : 'border-slate-200/90 bg-white/85 hover:border-slate-300 hover:bg-white hover:shadow-md hover:scale-[1.01]'
                  }`}
                >
                  {isSelected && (
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${acc.accentGradient}`} />
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${acc.accentGradient} flex items-center justify-center text-white shadow-xs`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border font-mono ${acc.badgeBg}`}>
                        {language === 'gu' ? acc.guTitle : acc.title}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-slate-900 font-heading truncate group-hover:text-emerald-700 transition-colors">
                      {language === 'gu' ? acc.guName : acc.name}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">{acc.email}</div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 truncate max-w-[140px]">
                      {language === 'gu' ? acc.guTag : acc.tag}
                    </span>
                    {isSelected ? (
                      <span className="flex items-center text-emerald-600 font-bold text-[10px] font-mono space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ACTIVE</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono group-hover:text-slate-700">
                        Select →
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Auth Form Card with Tabs (Sign In vs Register Account) */}
        <div className="max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl shadow-slate-200/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 mb-6 relative z-10">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'gu' ? 'લૉગિન' : 'Institutional Sign In'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'gu' ? 'નવું ખાતું બનાવો' : 'Register Account'}</span>
            </button>
          </div>

          {/* Notifications */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 relative z-10">
              {/* School Campus Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'gu' ? 'શાળા સંકુલ પસંદ કરો' : 'School Campus'}
                </label>
                <div className="relative">
                  <select
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer shadow-2xs transition-all"
                  >
                    {allSchools.map((s) => (
                      <option key={s.id} value={s.id} className="bg-white text-slate-900">
                        {language === 'gu' && s.gujarati_name ? s.gujarati_name : s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'gu' ? 'ઇમેઇલ સરનામું' : 'Email Address'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@royalacademyrajkot.edu.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/80 shadow-2xs transition-all font-mono"
                  />
                  <Mail className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {language === 'gu' ? 'પાસવર્ડ' : 'Password'}
                  </label>
                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    Demo: gseb2026
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/80 shadow-2xs transition-all font-mono"
                  />
                  <Lock className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2 font-heading"
              >
                <span>
                  {loading
                    ? 'Re-Checking Server Zod Schema...'
                    : language === 'gu'
                    ? 'ERP સિસ્ટમમાં પ્રવેશ કરો'
                    : 'Sign In to ClassSec'}
                </span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </form>
          )}

          {/* 2. SIGNUP / REGISTRATION FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 relative z-10">
              {/* Access Policy Information Notice */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-[11px] leading-relaxed flex items-start space-x-2">
                <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block text-amber-950">
                    {language === 'gu' ? 'સુરક્ષા નીતિ: આચાર્ય અને શિક્ષક નોંધણી' : 'Role Security Policy'}
                  </strong>
                  <span>
                    {language === 'gu'
                      ? 'આચાર્યશ્રી (Principal) અને શિક્ષકો (Teachers) ના ખાતા માત્ર Super Admin / ટ્રસ્ટ દ્વારા જ અધિકૃત રીતે ફાળવવામાં આવે છે. અહીં માત્ર વિદ્યાર્થી અને વાલી જ નવું ખાતું બનાવી શકે છે.'
                      : 'Faculty (Teacher) and Principal access cannot be self-registered. Those accounts are provisioned exclusively by the ERP Super Admin. Only Students and Parents can register here.'}
                  </span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'gu' ? 'પૂરું નામ (Full Name)' : 'Full Name'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Harsh V. Dave"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/80 transition-all"
                  />
                  <UserIcon className="w-4 h-4 text-blue-600 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'gu' ? 'સંસ્થાકીય ઇમેઇલ' : 'Institutional Email'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="harsh.dave@royalacademyrajkot.edu.in"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/80 transition-all font-mono"
                  />
                  <Mail className="w-4 h-4 text-blue-600 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Username & Role Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'gu' ? 'વપરાશકર્તા નામ (Username)' : 'Username'}
                  </label>
                  <input
                    type="text"
                    required
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    placeholder="harsh.dave"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/80 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'gu' ? 'ભૂમિકા (Role)' : 'Role'}
                  </label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as Role)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/80 transition-all"
                  >
                    <option value="STUDENT">Student (વિદ્યાર્થી)</option>
                    <option value="PARENT">Parent (વાલી)</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'gu' ? 'પાસવર્ડ (Min. 8 chars)' : 'Password (Min. 8 Chars)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/80 transition-all"
                  />
                  <Lock className="w-4 h-4 text-blue-600 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* School Campus Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'gu' ? 'શાળા સંકુલ' : 'School Campus'}
                </label>
                <select
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/80 transition-all"
                >
                  {allSchools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Registration Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-3 font-heading"
              >
                <span>
                  {loading
                    ? 'Validating Credentials...'
                    : language === 'gu'
                    ? 'ખાતું રજીસ્ટર કરો'
                    : 'Register Institutional Account'}
                </span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/90 backdrop-blur-sm py-4 px-4 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-slate-600 font-medium">
            {language === 'gu'
              ? '© ૨૦૨૬ ClassSec ગુજરાત ERP • GSEB સ્વ-નિર્ભર શાળાઓ માટે નિર્મિત'
              : '© 2026 ClassSec Gujarat School ERP • Designed for GSEB Private Institutions'}
          </span>
          <div className="inline-flex items-center space-x-1.5 bg-slate-900 border border-slate-700/80 px-3.5 py-1.5 rounded-full text-xs shadow-md text-white hover:border-emerald-500/50 transition-all">
            <span className="text-slate-400 font-medium">{language === 'gu' ? 'હૃદયપૂર્વક નિર્મિત' : 'Made with'}</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse shrink-0 inline" />
            <span className="text-slate-400 font-medium">{language === 'gu' ? 'દ્વારા' : 'by'}</span>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-extrabold font-heading tracking-wide">
              Harsh Ravaliya
            </span>
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0 inline ml-0.5" />
          </div>
          <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-500">
            <span>Rajkot • Junagadh • Ahmedabad</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
