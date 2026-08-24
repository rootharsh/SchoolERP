import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { School, Role, User } from '../../types/erp';
import { erpDb } from '../../services/db';
import { Modal } from '../common/UIComponents';
import { AttendanceHeatmap } from '../trustee/AttendanceHeatmap';
import {
  Building,
  Plus,
  Server,
  Activity,
  Users,
  CheckCircle2,
  ShieldCheck,
  Search,
  School as SchoolIcon,
  IndianRupee,
  ExternalLink,
  Lock,
  Building2,
  Sparkles,
  BarChart3,
  Award,
  BookOpen,
  Filter,
  Check,
  X,
  ArrowRight,
  TrendingUp,
  Layers,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  FileCheck,
  KeyRound,
  UserPlus,
  UserCheck,
  ShieldAlert,
  Trash2,
  Copy,
  RotateCcw,
  Mail,
  Phone,
  GraduationCap,
  Eye,
  EyeOff,
  CheckCheck,
} from 'lucide-react';

interface SuperAdminDashboardProps {
  activeTab?: string;
  onNavigate?: (tabId: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  activeTab = 'tenants',
  onNavigate,
}) => {
  const { currentSchool, switchSchool, refreshData } = useAuth();
  const { language, t } = useLanguage();

  // Modals and form state
  const [isNewSchoolModalOpen, setIsNewSchoolModalOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolGujaratiName, setNewSchoolGujaratiName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [newSchoolCity, setNewSchoolCity] = useState('Jamnagar');
  const [newSchoolGsebIndex, setNewSchoolGsebIndex] = useState('64.120');
  const [newSchoolAffiliation, setNewSchoolAffiliation] = useState('GSEB/SF/JAM/64.120');
  const [newSchoolUdise, setNewSchoolUdise] = useState('24100105432');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User Access Provisioning State ("I will give access only")
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [provisionRole, setProvisionRole] = useState<'PRINCIPAL' | 'TEACHER'>('PRINCIPAL');
  const [provisionSchoolId, setProvisionSchoolId] = useState<string>(currentSchool?.id || 'school-sharda-rajkot');
  const [provisionName, setProvisionName] = useState('');
  const [provisionEmail, setProvisionEmail] = useState('');
  const [provisionPhone, setProvisionPhone] = useState('+91 98250 ');
  const [provisionSubject, setProvisionSubject] = useState('Mathematics');
  const [provisionClass, setProvisionClass] = useState('Class 10-A');
  const [provisionDesignation, setProvisionDesignation] = useState('Principal & Chief Academic Officer');
  const [provisionPassword, setProvisionPassword] = useState('GsebAuth#2026');
  const [provisionShowPassword, setProvisionShowPassword] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  // User Directory Filter State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT' | 'PARENT'>('ALL');
  const [userSchoolFilter, setUserSchoolFilter] = useState<string>('ALL');

  // Password Reset / Credential Modal
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedUserToReset, setSelectedUserToReset] = useState<User | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('GsebPass#2026');
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  // RLS Simulator State
  const [simRole, setSimRole] = useState<Role>('TEACHER');
  const [simResource, setSimResource] = useState('STUDENTS_GR_REGISTER');
  const [simResult, setSimResult] = useState<{
    allowed: boolean;
    policy: string;
    scopePredicate: string;
    explanation: string;
    guExplanation: string;
  } | null>(null);

  // Audit Filter State
  const [auditSchoolFilter, setAuditSchoolFilter] = useState('ALL');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  const schools = erpDb.getSchools() || [];
  const filteredSchools = (schools || []).filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.gujarati_name && s.gujarati_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStudents = (schools || []).reduce((acc, s) => acc + (s.totalStudents || 0), 0);
  const totalStaff = (schools || []).reduce((acc, s) => acc + (s.totalStaff || 0), 0);

  const allUsers = erpDb.getAllUsers() || [];
  const filteredUsers = (allUsers || []).filter((u) => {
    // School filter
    if (userSchoolFilter !== 'ALL' && u.school_id !== userSchoolFilter && u.role !== 'SUPER_ADMIN') {
      return false;
    }
    // Role filter
    if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) {
      return false;
    }
    // Search query
    if (userSearchQuery) {
      const q = userSearchQuery.toLowerCase();
      const matchName = u.full_name.toLowerCase().includes(q) || (u.gujarati_name && u.gujarati_name.toLowerCase().includes(q));
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.phone && u.phone.includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  const handleOpenProvisionModal = (role: 'PRINCIPAL' | 'TEACHER', schoolId?: string) => {
    setProvisionRole(role);
    setProvisionSchoolId(schoolId || currentSchool?.id || schools[0]?.id || 'school-sharda-rajkot');
    if (role === 'PRINCIPAL') {
      setProvisionName('Dr. Kiritbhai M. Patel');
      setProvisionEmail(`principal.${Date.now().toString(36).slice(-4)}@royalacademyrajkot.edu.in`);
      setProvisionDesignation('Principal & Head of Institution');
      setProvisionSubject('');
    } else {
      setProvisionName('Shri Mayurbhai S. Joshi');
      setProvisionEmail(`mayur.joshi.${Date.now().toString(36).slice(-4)}@royalacademyrajkot.edu.in`);
      setProvisionDesignation('Senior Assistant Teacher (Secondary GSEB)');
      setProvisionSubject('Science & Technology');
    }
    setProvisionPhone('+91 98250 44556');
    setProvisionPassword('GsebAuth#2026');
    setProvisionError(null);
    setIsProvisionModalOpen(true);
  };

  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provisionName.trim() || !provisionEmail.trim()) {
      setProvisionError('Name and email are strictly required.');
      return;
    }

    const res = erpDb.provisionUser({
      school_id: provisionSchoolId,
      name: provisionName.trim(),
      email: provisionEmail.trim(),
      role: provisionRole,
      phone: provisionPhone.trim(),
      designation: provisionDesignation.trim(),
      subject: provisionSubject.trim(),
      assigned_classes: [provisionClass],
    });

    if (!res.success) {
      setProvisionError(res.error || 'Failed to provision user.');
      return;
    }

    const targetSchool = schools.find((s) => s.id === provisionSchoolId);
    setToastMessage(
      language === 'gu'
        ? `નવા ${provisionRole === 'PRINCIPAL' ? 'આચાર્યશ્રી' : 'શિક્ષક'} "${provisionName}" ને "${targetSchool?.name}" માટે સફળતાપૂર્વક અધિકૃત કરવામાં આવ્યા છે.`
        : `Successfully provisioned ${provisionRole} account for "${provisionName}" at ${targetSchool?.name}.`
    );
    setTimeout(() => setToastMessage(null), 4500);
    setIsProvisionModalOpen(false);
    refreshData();
  };

  const handleToggleUserStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    erpDb.updateUserStatus(userId, newStatus);
    setToastMessage(
      language === 'gu'
        ? `વપરાશકર્તા સ્થિતિ [${newStatus === 'ACTIVE' ? 'સક્રિય (ACTIVE)' : 'સ્થગિત (SUSPENDED)'}] તરીકે અપડેટ કરવામાં આવી છે.`
        : `User account status updated to [${newStatus}].`
    );
    setTimeout(() => setToastMessage(null), 3000);
    refreshData();
  };

  const handleDeleteUser = (userId: string, userName: string, role: string) => {
    if (confirm(`Are you sure you want to revoke institutional access and delete account for ${role} "${userName}"?`)) {
      erpDb.deleteUser(userId);
      setToastMessage(
        language === 'gu'
          ? `${role} "${userName}" નું ખાતું અને અધિકારો રદ કરવામાં આવ્યા છે.`
          : `Revoked access and deleted account for ${role} "${userName}".`
      );
      setTimeout(() => setToastMessage(null), 3500);
      refreshData();
    }
  };

  const handleResetUserPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserToReset || !newPasswordInput.trim()) return;

    erpDb.resetUserPassword(selectedUserToReset.id, newPasswordInput);
    setToastMessage(
      language === 'gu'
        ? `"${selectedUserToReset.full_name}" માટે નવો પાસવર્ડ સફળતાપૂર્વક સેટ કરવામાં આવ્યો છે.`
        : `Temporary credentials successfully reset for "${selectedUserToReset.full_name}".`
    );
    setTimeout(() => setToastMessage(null), 4000);
    setIsResetPasswordModalOpen(false);
    setSelectedUserToReset(null);
  };

  const handleCopyCredentials = (user: User) => {
    const creds = `=== ERP Institutional Access Credentials ===\nPlatform: ClassSec GSEB Multi-Tenant ERP\nName: ${user.full_name}\nRole: ${user.role}\nEmail / Username: ${user.email}\nDefault Access Passcode: GsebAuth#2026\nPortal URL: https://classsec-erp.edu.in/login`;
    navigator.clipboard.writeText(creds);
    setCopiedUserId(user.id);
    setTimeout(() => setCopiedUserId(null), 2500);
  };

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName || !newSchoolCode) return;

    const newSchool = erpDb.createSchool({
      name: newSchoolName,
      gujarati_name: newSchoolGujaratiName || newSchoolName,
      code: newSchoolCode.toUpperCase(),
      address: `${newSchoolCity}, Gujarat`,
      phone: '+91 281-2589040',
      email: `principal@${newSchoolCode.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu.in`,
      gseb_index: newSchoolGsebIndex,
      affiliationNumber: newSchoolAffiliation,
      udiseCode: newSchoolUdise,
      boardType: 'GSEB',
      establishedYear: 2026,
      totalStudents: 520,
      totalStaff: 38,
      plan: 'ENTERPRISE',
      is_self_financed: true,
      mediums: ['GUJARATI', 'ENGLISH'],
    });

    setToastMessage(
      language === 'gu'
        ? `સંસ્થા "${newSchool.name}" સફળતાપૂર્વક GSEB ઇન્ડેક્સ અને RLS ડેટાબેઝ સાથે જોડાઈ ગઈ છે.`
        : `Institution "${newSchool.name}" registered successfully with GSEB Index & isolated database.`
    );
    setTimeout(() => setToastMessage(null), 4000);
    setIsNewSchoolModalOpen(false);
    setNewSchoolName('');
    setNewSchoolGujaratiName('');
    setNewSchoolCode('');
    refreshData();
  };

  const handleRunRlsSimulation = () => {
    let allowed = true;
    let policy = '';
    let scopePredicate = '';
    let explanation = '';
    let guExplanation = '';

    if (simRole === 'SUPER_ADMIN') {
      allowed = true;
      policy = 'SUPER_ADMIN_TRUST_BYPASS';
      scopePredicate = `SELECT * FROM ${simResource} WHERE tenant_trust_id = 'TRUST-GUJ-01'`;
      explanation = 'Full unrestricted read/write across all affiliated Gujarat private campuses.';
      guExplanation = 'ટ્રસ્ટ સંચાલિત તમામ શાળાઓના ડેટા જોવા અને સુધારવાની સંપૂર્ણ છૂટ.';
    } else if (simRole === 'PRINCIPAL') {
      if (simResource === 'TRUST_CONSOLIDATED_FINANCE') {
        allowed = false;
        policy = 'PRINCIPAL_LOCAL_ISOLATION';
        scopePredicate = `DENIED (Restricted to Super Admin)`;
        explanation = 'Principals can only view their own school finances, not other campuses.';
        guExplanation = 'આચાર્યશ્રી માત્ર પોતાની શાળાના હિસાબો જોઈ શકે છે, અન્ય શાળાના નહીં.';
      } else {
        allowed = true;
        policy = 'PRINCIPAL_CAMPUS_SCOPE';
        scopePredicate = `SELECT * FROM ${simResource} WHERE school_id = '${currentSchool.id}'`;
        explanation = `Full management granted strictly for local campus (${currentSchool.name}).`;
        guExplanation = `સ્થાનિક સંકુલ (${currentSchool.name}) માટે તમામ વ્યવસ્થાપનની મંજૂરી.`;
      }
    } else if (simRole === 'TEACHER') {
      if (simResource === 'STAFF_PAYROLL' || simResource === 'TRUST_CONSOLIDATED_FINANCE') {
        allowed = false;
        policy = 'TEACHER_RESTRICTED_PAYROLL';
        scopePredicate = `DENIED (Restricted to Administration)`;
        explanation = 'Teachers cannot inspect administrative payroll or trust finances.';
        guExplanation = 'શિક્ષકો સંસ્થાના વહીવટી પગારપત્રક કે હિસાબો જોઈ શકતા નથી.';
      } else if (simResource === 'STUDENTS_GR_REGISTER') {
        allowed = true;
        policy = 'TEACHER_CLASS_SCOPE';
        scopePredicate = `SELECT * FROM students WHERE school_id = '${currentSchool.id}' AND class_id IN (assigned_classes)`;
        explanation = 'Access granted strictly to students in teacher’s assigned classes (e.g. Class 10-A).';
        guExplanation = 'માત્ર પોતાના સોંપેલ વર્ગ (ધોરણ ૧૦-અ) ના વિદ્યાર્થીઓના રેકોર્ડ જ જોઈ શકાશે.';
      } else {
        allowed = true;
        policy = 'TEACHER_STANDARD_SCOPE';
        scopePredicate = `SELECT * FROM ${simResource} WHERE school_id = '${currentSchool.id}'`;
        explanation = 'Standard teaching resources and timetable available for current campus.';
        guExplanation = 'શૈક્ષણિક સામગ્રી અને સમયપત્રક માટે નિયમિત પ્રવેશ ઉપલબ્ધ.';
      }
    } else if (simRole === 'STUDENT') {
      if (simResource === 'STUDENTS_GR_REGISTER' || simResource === 'STAFF_PAYROLL' || simResource === 'TRUST_CONSOLIDATED_FINANCE') {
        allowed = false;
        policy = 'STUDENT_PRIVACY_GUARD';
        scopePredicate = `SELECT * FROM students WHERE user_id = auth.uid()`;
        explanation = 'Students can ONLY see their personal profile, homework, and own report card.';
        guExplanation = 'વિદ્યાર્થીઓ માત્ર પોતાનું પ્રોફાઇલ, હોમવર્ક અને ગુણપત્રક જ જોઈ શકે છે.';
      } else {
        allowed = true;
        policy = 'STUDENT_INDIVIDUAL_SCOPE';
        scopePredicate = `SELECT * FROM ${simResource} WHERE student_id = auth.student_id`;
        explanation = 'Self-service read access for homework, digital library, and report card.';
        guExplanation = 'પોતાના અભ્યાસક્રમ, પુસ્તકાલય અને પરિણામ માટે વ્યક્તિગત પ્રવેશ.';
      }
    } else if (simRole === 'PARENT') {
      if (simResource === 'STUDENTS_GR_REGISTER' || simResource === 'STAFF_PAYROLL') {
        allowed = false;
        policy = 'PARENT_WARD_ISOLATION';
        scopePredicate = `SELECT * FROM students WHERE parent_user_id = auth.uid()`;
        explanation = 'Parents can strictly access only their enrolled child’s data (Ward Isolation).';
        guExplanation = 'વાલીશ્રી માત્ર પોતાના સંતાન (પાલ્ય) ની વિગતો અને ફી પહોંચ જોઈ શકે છે.';
      } else {
        allowed = true;
        policy = 'PARENT_WARD_SCOPE';
        scopePredicate = `SELECT * FROM ${simResource} WHERE student_id = auth.ward_student_id`;
        explanation = 'Access granted for ward attendance, Ekam Kasoti marks, and fee payment.';
        guExplanation = 'પાલ્યની હાજરી, એકમ કસોટી ગુણ અને ફી ભરપાઈ માટે અધિકાર.';
      }
    }

    setSimResult({
      allowed,
      policy,
      scopePredicate,
      explanation,
      guExplanation,
    });

    erpDb.logAudit({
      school_id: currentSchool.id,
      user_id: 'usr-superadmin',
      user_name: 'Shri Pravinbhai Patel',
      user_role: 'SUPER_ADMIN',
      action: 'RLS_SECURITY_SIMULATION',
      resource_type: simResource,
      details: `Simulated RLS check for role [${simRole}] on table [${simResource}]. Result: ${allowed ? 'PERMITTED' : 'DENIED'}`,
      ip_address: '10.0.0.1',
    });
  };

  // Multi-campus aggregated metrics
  const campusAnalytics = [
    {
      id: 'school-sharda-rajkot',
      name: 'Aditya International Vidyamandir',
      guName: 'આદિત્ય ઇન્ટરનેશનલ વિદ્યામંદિર, રાજકોટ',
      city: 'Rajkot (રાજકોટ)',
      students: 1280,
      staff: 72,
      feeCollection: '₹1.42 Cr / ₹1.45 Cr (97.9%)',
      passRate: '99.2%',
      a1Stars: 24,
      attendanceRate: '96.4%',
      status: 'TOP PERFORMER',
    },
    {
      id: 'school-tapovan-mehsana',
      name: 'Girnar Vidyamandir High School',
      guName: 'ગિરનાર વિદ્યામંદિર હાઈસ્કૂલ, જૂનાગઢ',
      city: 'Junagadh (જૂનાગઢ)',
      students: 950,
      staff: 58,
      feeCollection: '₹1.05 Cr / ₹1.12 Cr (93.7%)',
      passRate: '97.8%',
      a1Stars: 18,
      attendanceRate: '95.4%',
      status: 'EXCELLENT',
    },
    {
      id: 'school-gyanmanjari-bhavnagar',
      name: 'Saraswati Global Academy',
      guName: 'સરસ્વતી ગ્લોબલ એકેડેમી, કેશોદ',
      city: 'Keshod (કેશોદ)',
      students: 780,
      staff: 48,
      feeCollection: '₹84.5 L / ₹89.0 L (94.9%)',
      passRate: '98.5%',
      a1Stars: 16,
      attendanceRate: '95.8%',
      status: 'RAPID GROWTH',
    },
  ];

  // All multi-campus audit logs
  const allAuditLogs = useMemo(() => {
    return erpDb.getAuditLogs() || [];
  }, []);

  const filteredAuditLogs = (allAuditLogs || []).filter((log) => {
    const matchesSchool = auditSchoolFilter === 'ALL' || log.school_id === auditSchoolFilter;
    const matchesAction = auditActionFilter === 'ALL' || log.action.includes(auditActionFilter);
    const q = auditSearchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      log.user_name.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.ip_address.includes(q);
    return matchesSchool && matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-purple-700 text-white shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Trust & Society Governance Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900">
              {language === 'gu'
                ? 'શ્રી સરસ્વતી કેળવણી મંડળ - ટ્રસ્ટ ગવર્નન્સ'
                : 'Education Trust & Society Governance'}
            </h1>
            <span className="bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Multi-Campus GSEB Portal
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            {language === 'gu'
              ? 'ગુજરાતના વિવિધ શહેરોના તમામ સંલગ્ન શૈક્ષણિક સંકુલોનું કેન્દ્રીય સંચાલન, ડેટા આઇસોલેશન અને સુરક્ષા ઓડિટિંગ'
              : 'Central monitoring, row-level security governance, and multi-campus academic analytics for Gujarat private schools.'}
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-2">
          {onNavigate && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold flex-wrap gap-1">
              <button
                onClick={() => onNavigate('tenants')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'tenants'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'gu' ? 'શાળા સંકુલો' : 'Campuses'}
              </button>
              <button
                onClick={() => onNavigate('access-provisioning')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'access-provisioning'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{language === 'gu' ? 'આચાર્ય & શિક્ષક ફાળવણી' : 'Staff & Principal Access'}</span>
              </button>
              <button
                onClick={() => onNavigate('platform-metrics')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'platform-metrics'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'gu' ? 'પ્રગતિ રિપોર્ટ' : 'Analytics'}
              </button>
              <button
                onClick={() => onNavigate('rls-auditor')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'rls-auditor'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'gu' ? 'સુરક્ષા ઓડિટર' : 'RLS Auditor'}
              </button>
              <button
                onClick={() => onNavigate('audit-trail')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'audit-trail'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'gu' ? 'ઓડિટ લૉગ્સ' : 'Audit Logs'}
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleOpenProvisionModal('PRINCIPAL')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{language === 'gu' ? '+ આચાર્યશ્રી નીમવા' : '+ Provision Principal'}</span>
            </button>

            <button
              onClick={() => handleOpenProvisionModal('TEACHER')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{language === 'gu' ? '+ શિક્ષક નીમવા' : '+ Provision Faculty'}</span>
            </button>

            <button
              onClick={() => setIsNewSchoolModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'gu' ? '+ નવું સંકુલ' : '+ Add Campus'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">
            {language === 'gu' ? 'સંચાલિત શાળા સંકુલો' : 'Affiliated Campuses'}
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{schools.length} Schools</div>
          <div className="text-xs text-slate-500 mt-1">GSEB Gujarat Recognized</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">
            {language === 'gu' ? 'કુલ નોંધાયેલ વિદ્યાર્થીઓ' : 'Total Enrolled Students'}
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {totalStudents.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            Across Tier 2-3 Gujarat cities
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">
            {language === 'gu' ? 'શૈક્ષણિક & બિન-શૈક્ષણિક સ્ટાફ' : 'Teaching & Non-Teaching Staff'}
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalStaff} Faculty</div>
          <div className="text-xs text-slate-500 mt-1">7th Pay Scale Approved</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">
            {language === 'gu' ? 'ડેટા સુરક્ષા & સુરક્ષિત અલગતા' : 'Data Architecture'}
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-1">Multi-Tenant</div>
          <div className="text-xs text-slate-500 mt-1">Row-Level Security (RLS)</div>
        </div>
      </div>

      {/* TAB 1: TENANTS (TRUST CAMPUSES) */}
      {(activeTab === 'tenants' || activeTab === 'dashboard') && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {language === 'gu'
                    ? 'નોંધાયેલ સંસ્થા સંકુલો (Gujarat Campuses)'
                    : 'Registered Institutional Campuses'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'gu'
                    ? 'કોઈપણ શાળા પસંદ કરીને તેનો વહીવટ ચકાસી શકો છો'
                    : 'Click any campus to switch context and review local administration'}
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    language === 'gu' ? 'શાળા અથવા શહેર શોધો...' : 'Search school or city...'
                  }
                  className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-3.5">
                      {language === 'gu' ? 'શાળાનું નામ અને કોડ' : 'School Name & Code'}
                    </th>
                    <th className="py-3 px-3.5">
                      {language === 'gu' ? 'GSEB ઇન્ડેક્સ & UDISE+' : 'Affiliation / UDISE+'}
                    </th>
                    <th className="py-3 px-3.5">{language === 'gu' ? 'શહેર / સ્થળ' : 'Location'}</th>
                    <th className="py-3 px-3.5 text-right">
                      {language === 'gu' ? 'વિદ્યાર્થીઓ' : 'Students'}
                    </th>
                    <th className="py-3 px-3.5 text-right">{language === 'gu' ? 'સ્ટાફ' : 'Staff'}</th>
                    <th className="py-3 px-3.5 text-center">
                      {language === 'gu' ? 'કાર્યવાહી' : 'Action'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSchools.map((school) => {
                    const isSelected = school.id === currentSchool.id;
                    return (
                      <tr
                        key={school.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? 'bg-purple-50/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-3.5">
                          <div className="font-bold text-slate-900">
                            {language === 'gu' && school.gujarati_name
                              ? school.gujarati_name
                              : school.name}
                          </div>
                          <div className="text-[11px] font-mono font-bold text-purple-700">
                            {school.code}
                          </div>
                        </td>
                        <td className="py-3.5 px-3.5">
                          <div className="font-semibold text-slate-800">
                            GSEB: {school.gseb_index || school.affiliationNumber}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">
                            UDISE: {school.udiseCode || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3.5 px-3.5 text-slate-600">{school.address}</td>
                        <td className="py-3.5 px-3.5 text-right font-bold text-slate-900">
                          {school.totalStudents}
                        </td>
                        <td className="py-3.5 px-3.5 text-right text-slate-600 font-semibold">
                          {school.totalStaff}
                        </td>
                        <td className="py-3.5 px-3.5 text-center">
                          {isSelected ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-900 font-bold text-[11px]">
                              Active Scope
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                switchSchool(school.id);
                                setToastMessage(
                                  language === 'gu'
                                    ? `સક્રિય સંસ્થા "${school.name}" માં બદલાઈ ગઈ છે.`
                                    : `Active administrative scope switched to "${school.name}".`
                                );
                                setTimeout(() => setToastMessage(null), 3000);
                              }}
                              className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-purple-600 hover:text-white text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Switch Scope
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ACCESS PROVISIONING ("I WILL GIVE ACCESS ONLY") */}
      {activeTab === 'access-provisioning' && (
        <div className="space-y-6">
          {/* Top Banner with Authority Notice */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-purple-800/40 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="max-w-2xl">
                <div className="flex items-center space-x-2">
                  <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    <KeyRound className="w-5 h-5 text-purple-300" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      {language === 'gu'
                        ? 'કેન્દ્રીય સત્તાવાર પ્રવેશ અને અધિકાર ફાળવણી કેન્દ્ર'
                        : 'Institutional Faculty & Principal Access Provisioner'}
                    </h2>
                    <span className="text-[11px] text-purple-300 font-mono">Super Admin Exclusive Privilege</span>
                  </div>
                </div>
                <p className="text-xs text-purple-200 mt-2.5 leading-relaxed">
                  {language === 'gu'
                    ? 'સુરક્ષા નીતિ મુજબ કોઈપણ વ્યક્તિ જાતે આચાર્ય કે શિક્ષક તરીકે રજીસ્ટ્રેશન કરી શકતી નથી. માત્ર સુપર એડમિન જ ગુજરાતના તમામ શાળા સંકુલો માટે નવા આચાર્યશ્રી અને શિક્ષકોના ખાતા બનાવીને યુઝરનેમ અને પાસવર્ડ સોંપી શકે છે.'
                    : 'Strict Security Mandate: Principals and Teachers cannot self-register. You (Super Admin) directly provision, issue credentials, and assign institutional roles across all Gujarat campuses.'}
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleOpenProvisionModal('PRINCIPAL')}
                  className="px-4 py-2.5 rounded-xl bg-white text-purple-950 hover:bg-purple-50 font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-purple-700" />
                  <span>{language === 'gu' ? '+ નવા આચાર્યશ્રી નીમો' : '+ Provision Principal'}</span>
                </button>
                <button
                  onClick={() => handleOpenProvisionModal('TEACHER')}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer border border-purple-400/30"
                >
                  <UserPlus className="w-4 h-4 text-purple-200" />
                  <span>{language === 'gu' ? '+ નવા શિક્ષક નીમો' : '+ Provision Faculty'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Demographics Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {language === 'gu' ? 'કુલ વપરાશકર્તાઓ' : 'Total ERP Users'}
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1 font-heading">{allUsers.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Across {schools.length} Campuses</div>
            </div>

            <div className="bg-white border border-purple-100 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider flex items-center space-x-1">
                <span>{language === 'gu' ? 'અધિકૃત આચાર્યશ્રી' : 'Principals'}</span>
              </div>
              <div className="text-2xl font-black text-purple-900 mt-1 font-heading">
                {allUsers.filter((u) => u.role === 'PRINCIPAL').length}
              </div>
              <div className="text-[10px] text-purple-600 mt-0.5">Campus Heads (Assigned)</div>
            </div>

            <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center space-x-1">
                <span>{language === 'gu' ? 'પ્રમાણિત શિક્ષકો' : 'Faculty Teachers'}</span>
              </div>
              <div className="text-2xl font-black text-emerald-900 mt-1 font-heading">
                {allUsers.filter((u) => u.role === 'TEACHER').length}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Active Academic Staff</div>
            </div>

            <div className="bg-white border border-sky-100 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider">
                {language === 'gu' ? 'વિદ્યાર્થી & વાલી' : 'Students & Parents'}
              </div>
              <div className="text-2xl font-black text-sky-900 mt-1 font-heading">
                {allUsers.filter((u) => u.role === 'STUDENT' || u.role === 'PARENT').length}
              </div>
              <div className="text-[10px] text-sky-600 mt-0.5">Public Portal Access</div>
            </div>
          </div>

          {/* Directory Filter Bar & Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>{language === 'gu' ? 'ગુજરાત વ્યાપી વપરાશકર્તા અને સ્ટાફ ડિરેક્ટરી' : 'Institutional User & Access Directory'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'gu'
                    ? 'તમામ શાળાઓના વપરાશકર્તાઓના અધિકારો તપાસો, પાસવર્ડ રિસેટ કરો અથવા સ્થિતિ બદલો'
                    : 'Manage user credentials, reset temporary passwords, or toggle account status across all campuses.'}
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                {/* Search Box */}
                <div className="relative">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder={language === 'gu' ? 'નામ, ઇમેઇલ કે ફોન શોધો...' : 'Search user, email, phone...'}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 w-52 sm:w-60"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                {/* Campus Filter */}
                <select
                  value={userSchoolFilter}
                  onChange={(e) => setUserSchoolFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ALL">All Gujarat Campuses</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                {/* Role Filter */}
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value as any)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ALL">All Roles</option>
                  <option value="PRINCIPAL">Principals Only</option>
                  <option value="TEACHER">Teachers Only</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="PARENT">Parents Only</option>
                </select>
              </div>
            </div>

            {/* User Directory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 font-heading">
                    <th className="py-3 px-3.5">User Identity</th>
                    <th className="py-3 px-3.5">Institutional Role</th>
                    <th className="py-3 px-3.5">Assigned Campus</th>
                    <th className="py-3 px-3.5">Contact Information</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                    <th className="py-3 px-3.5 text-right">Actions &amp; Access Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        {language === 'gu' ? 'કોઈ વપરાશકર્તા મળ્યા નથી.' : 'No users match the selected filters.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const userSchool = schools.find((s) => s.id === u.school_id);
                      const isSuperAdminUser = u.role === 'SUPER_ADMIN';

                      const roleBadgeStyles: Record<string, string> = {
                        SUPER_ADMIN: 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold',
                        PRINCIPAL: 'bg-blue-100 text-blue-900 border-blue-300 font-bold',
                        TEACHER: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
                        STUDENT: 'bg-sky-100 text-sky-900 border-sky-300 font-semibold',
                        PARENT: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
                      };

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* User Identity */}
                          <td className="py-3 px-3.5">
                            <div className="flex items-center space-x-2.5">
                              <img
                                src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.full_name)}`}
                                alt={u.full_name}
                                className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 object-cover shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 leading-tight">
                                  {language === 'gu' && u.gujarati_name ? u.gujarati_name : u.full_name}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">ID: {u.id}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] border ${roleBadgeStyles[u.role] || 'bg-slate-100 text-slate-800'}`}>
                              {u.role}
                            </span>
                          </td>

                          {/* Assigned Campus */}
                          <td className="py-3 px-3.5">
                            {isSuperAdminUser ? (
                              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                All Trust Campuses (Master)
                              </span>
                            ) : (
                              <div>
                                <div className="font-semibold text-slate-900">{userSchool?.name || 'Unassigned'}</div>
                                <div className="text-[10px] font-mono text-slate-500">
                                  GSEB Index: {userSchool?.gseb_index || userSchool?.code || 'N/A'}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Contact Info */}
                          <td className="py-3 px-3.5">
                            <div className="font-mono text-slate-800 text-[11px]">{u.email}</div>
                            <div className="text-slate-500 text-[10px]">{u.phone || 'No phone recorded'}</div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3.5 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3.5 text-right">
                            {isSuperAdminUser ? (
                              <span className="text-[11px] text-slate-400 font-medium italic">Master Authority</span>
                            ) : (
                              <div className="flex items-center justify-end space-x-1.5">
                                {/* Copy Credentials */}
                                <button
                                  onClick={() => handleCopyCredentials(u)}
                                  title="Copy Login Details"
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                                >
                                  {copiedUserId === u.id ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                {/* Reset Password */}
                                <button
                                  onClick={() => {
                                    setSelectedUserToReset(u);
                                    setNewPasswordInput('GsebPass#2026');
                                    setIsResetPasswordModalOpen(true);
                                  }}
                                  title="Reset User Credentials / Password"
                                  className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-900 transition-colors cursor-pointer"
                                >
                                  <KeyRound className="w-3.5 h-3.5" />
                                </button>

                                {/* Toggle Active/Suspended */}
                                <button
                                  onClick={() => handleToggleUserStatus(u.id, u.status)}
                                  title={u.status === 'ACTIVE' ? 'Suspend Access' : 'Activate Access'}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    u.status === 'ACTIVE'
                                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete / Revoke Access */}
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.full_name, u.role)}
                                  title="Revoke Access & Delete User"
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'platform-metrics' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span>
                    {language === 'gu'
                      ? 'સંકલિત શૈક્ષણિક & નાણાકીય પ્રગતિ રિપોર્ટ'
                      : 'Consolidated Trust Academic & Financial Benchmarks'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'gu'
                    ? 'રાજકોટ, મહેસાણા, ભાવનગર અને આણંદ સંકુલોની વાર્ષિક પ્રગતિ સરખામણી'
                    : 'Cross-campus comparative performance across all Trust private school branches in Gujarat.'}
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
                Academic Year 2026-27 (GSEB)
              </span>
            </div>

            {/* 4 Analytics Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                <div className="text-xs font-semibold text-purple-900">Total Trust Fee Revenue</div>
                <div className="text-xl font-bold text-purple-950 mt-1">₹4.97 Cr</div>
                <div className="text-[11px] text-purple-700 mt-0.5">94.9% Realization Rate</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="text-xs font-semibold text-emerald-900">GSEB SSC Board Result</div>
                <div className="text-xl font-bold text-emerald-950 mt-1">98.6% Pass</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">78 Students in A1 Grade</div>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="text-xs font-semibold text-blue-900">Faculty-Student Ratio</div>
                <div className="text-xl font-bold text-blue-950 mt-1">1 : 16.8</div>
                <div className="text-[11px] text-blue-700 mt-0.5">NEP 2020 Standard Compliant</div>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                <div className="text-xs font-semibold text-amber-900">Average Attendance</div>
                <div className="text-xl font-bold text-amber-950 mt-1">95.6%</div>
                <div className="text-[11px] text-amber-700 mt-0.5">Biometric &amp; App Tracked</div>
              </div>
            </div>

            {/* Detailed Multi-Campus Comparison Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-3.5">Campus Branch</th>
                    <th className="py-3 px-3.5">City District</th>
                    <th className="py-3 px-3.5 text-right">Students</th>
                    <th className="py-3 px-3.5 text-right">Faculty</th>
                    <th className="py-3 px-3.5">Fee Realization</th>
                    <th className="py-3 px-3.5 text-right">Board Pass %</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campusAnalytics.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-3.5">
                        <div className="font-bold text-slate-900">
                          {language === 'gu' ? c.guName : c.name}
                        </div>
                        <div className="text-[11px] text-purple-700 font-mono font-bold">
                          {c.a1Stars} A1 Star Rankers
                        </div>
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-600 font-medium">{c.city}</td>
                      <td className="py-3.5 px-3.5 text-right font-bold text-slate-900">
                        {c.students.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3.5 text-right text-slate-600 font-semibold">
                        {c.staff}
                      </td>
                      <td className="py-3.5 px-3.5 font-semibold text-emerald-700">
                        {c.feeCollection}
                      </td>
                      <td className="py-3.5 px-3.5 text-right font-bold text-blue-700">
                        {c.passRate}
                      </td>
                      <td className="py-3.5 px-3.5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* School-wide Monthly Attendance Heatmap for Trustees */}
          <AttendanceHeatmap />
        </div>
      )}

      {/* TAB 3: RLS SECURITY AUDITOR */}
      {activeTab === 'rls-auditor' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  {language === 'gu'
                    ? 'રોલ-બેઝ્ડ એક્સેસ કંટ્રોલ (RBAC) & રો-લેવલ સિક્યુરિટી (RLS) ઓડિટર'
                    : 'Role-Based Access Control (RBAC) & Row-Level Security (RLS) Auditor'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'gu'
                  ? 'વપરાશકર્તાની ભૂમિકા અને શાળાના કાર્યક્ષેત્ર અનુસાર ડેટાબેઝ અલગતા અને પરવાનગી ચકાસણી સિમ્યુલેટર'
                  : 'Live cryptographic tenant isolation verification and row-level security boundary inspector.'}
              </p>
            </div>

            {/* 5-Role Matrix Overview */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                {
                  role: 'SUPER_ADMIN',
                  title: 'Super Admin / Trustee',
                  scope: 'Cross-Tenant Trust Wide',
                  badge: 'Full Bypass & Provisioning',
                  color: 'border-purple-200 bg-purple-50/50',
                },
                {
                  role: 'PRINCIPAL',
                  title: 'Principal / Admin',
                  scope: 'Local Campus Only',
                  badge: 'Full Local Admin (RLS Enforced)',
                  color: 'border-blue-200 bg-blue-50/50',
                },
                {
                  role: 'TEACHER',
                  title: 'Faculty / Teacher',
                  scope: 'Assigned Classes Scope',
                  badge: 'Attendance & Marks Entry',
                  color: 'border-emerald-200 bg-emerald-50/50',
                },
                {
                  role: 'STUDENT',
                  title: 'Enrolled Student',
                  scope: 'Self UID Only',
                  badge: 'Homework & Own Report Card',
                  color: 'border-sky-200 bg-sky-50/50',
                },
                {
                  role: 'PARENT',
                  title: 'Parent / Guardian',
                  scope: 'Enrolled Ward Only',
                  badge: 'Ward Receipts & Attendance',
                  color: 'border-amber-200 bg-amber-50/50',
                },
              ].map((r) => (
                <div key={r.role} className={`p-4 rounded-xl border ${r.color} flex flex-col justify-between`}>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{r.title}</div>
                    <div className="text-[11px] font-semibold text-slate-600 mt-0.5">{r.scope}</div>
                  </div>
                  <div className="mt-3 text-[10px] font-bold text-slate-700 bg-white/80 px-2 py-1 rounded border border-slate-200/60">
                    {r.badge}
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Live RLS Simulation Sandbox */}
            <div className="mt-6 bg-slate-900 text-white rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold mb-4">
                <Sparkles className="w-4 h-4" />
                <span>LIVE POLICY ENFORCEMENT &amp; ISOLATION SIMULATOR</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select Test Role:
                  </label>
                  <select
                    value={simRole}
                    onChange={(e) => {
                      setSimRole(e.target.value as Role);
                      setSimResult(null);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Trust Secretary)</option>
                    <option value="PRINCIPAL">PRINCIPAL (Dr. Pandya)</option>
                    <option value="TEACHER">TEACHER (Smt. Neetaben Patel)</option>
                    <option value="STUDENT">STUDENT (Harsh Patel)</option>
                    <option value="PARENT">PARENT (Shri Vinodbhai Patel)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Table / Collection:
                  </label>
                  <select
                    value={simResource}
                    onChange={(e) => {
                      setSimResource(e.target.value);
                      setSimResult(null);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="STUDENTS_GR_REGISTER">STUDENTS_GR_REGISTER (General Register)</option>
                    <option value="FEE_TRANSACTIONS">FEE_TRANSACTIONS (Receipts & Invoices)</option>
                    <option value="STAFF_PAYROLL">STAFF_PAYROLL (Faculty Salary Ledgers)</option>
                    <option value="HOMEWORK_SUBMISSIONS">HOMEWORK_SUBMISSIONS (Student Files)</option>
                    <option value="EXAMINATION_MARKS">EXAMINATION_MARKS (Ekam Kasoti & PAT)</option>
                    <option value="TRUST_CONSOLIDATED_FINANCE">TRUST_CONSOLIDATED_FINANCE</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleRunRlsSimulation}
                    className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center space-x-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Evaluate RLS Policy</span>
                  </button>
                </div>
              </div>

              {simResult && (
                <div className="mt-6 p-4 rounded-xl bg-slate-800/90 border border-slate-700 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <div className="flex items-center space-x-2">
                      {simResult.allowed ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>ACCESS PERMITTED</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center space-x-1">
                          <X className="w-3.5 h-3.5" />
                          <span>ACCESS BLOCKED BY RLS</span>
                        </span>
                      )}
                      <span className="text-xs font-mono text-slate-400">
                        Policy: <strong>{simResult.policy}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400">Active Scope Filter: </span>
                      <code className="font-mono text-emerald-300 bg-slate-950 px-2 py-0.5 rounded text-[11px]">
                        {simResult.scopePredicate}
                      </code>
                    </div>
                    <p className="text-slate-200">
                      {language === 'gu' ? simResult.guExplanation : simResult.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'audit-trail' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>
                    {language === 'gu'
                      ? 'મલ્ટી-કેમ્પસ સુરક્ષા & ઓડિટ ટ્રાયલ'
                      : 'Multi-Campus Security Audit & Access Logs'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'gu'
                    ? 'તમામ શાળા સંકુલોમાં થયેલ પ્રવેશ, ફી પહોંચ, સુધારા અને સુરક્ષા ઘટનાઓનું લાઇવ ટ્રેકિંગ'
                    : 'Tamper-evident logs of logins, fee generation, record edits, and role switches across all campuses.'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={auditSchoolFilter}
                  onChange={(e) => setAuditSchoolFilter(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ALL">All Campuses (તમામ સંકુલો)</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>

                <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ALL">All Event Types</option>
                  <option value="LOGIN">Authentication &amp; Login</option>
                  <option value="FEE">Fee Collections</option>
                  <option value="PROVISION">Campus Provisioning</option>
                  <option value="RLS">Security &amp; RLS</option>
                  <option value="STUDENT">Student Record</option>
                </select>
              </div>
            </div>

            {/* Search within Audit Logs */}
            <div className="mt-4 relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                placeholder="Search audit trail by user, IP address, or details..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Audit Logs Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-3.5">Timestamp</th>
                    <th className="py-3 px-3.5">User &amp; Role</th>
                    <th className="py-3 px-3.5">Action Code</th>
                    <th className="py-3 px-3.5">Target Resource</th>
                    <th className="py-3 px-3.5">Details &amp; IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditLogs.slice(0, 15).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900">{log.user_name}</div>
                        <div className="text-[10px] font-semibold text-purple-700">{log.user_role}</div>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 font-semibold">
                        {log.resource_type}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600">
                        <div>{log.details}</div>
                        <div className="text-[10px] font-mono text-slate-400">IP: {log.ip_address}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New School Registration Modal */}
      <Modal
        isOpen={isNewSchoolModalOpen}
        onClose={() => setIsNewSchoolModalOpen(false)}
        title={language === 'gu' ? 'નવા શાળા સંકુલની નોંધણી' : 'Register New Campus Branch'}
      >
        <form onSubmit={handleCreateSchool} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              School Full Name (English) *
            </label>
            <input
              type="text"
              required
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              placeholder="e.g. Swaminarayan Gurukul High School"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              શાળાનું નામ (ગુજરાતીમાં)
            </label>
            <input
              type="text"
              value={newSchoolGujaratiName}
              onChange={(e) => setNewSchoolGujaratiName(e.target.value)}
              placeholder="દા.ત. શ્રી સ્વામિનારાયણ ગુરુકુળ હાઈસ્કૂલ"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">School Code *</label>
              <input
                type="text"
                required
                value={newSchoolCode}
                onChange={(e) => setNewSchoolCode(e.target.value)}
                placeholder="SGHS-JAM-2026"
                className="w-full px-3.5 py-2.5 font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">City / Location</label>
              <select
                value={newSchoolCity}
                onChange={(e) => setNewSchoolCity(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Keshod">Keshod (કેશોદ)</option>
                <option value="Rajkot">Rajkot (રાજકોટ)</option>
                <option value="Junagadh">Junagadh (જૂનાગઢ)</option>
                <option value="Jamnagar">Jamnagar (જામનગર)</option>
                <option value="Surat">Surat (સુરત)</option>
                <option value="Mehsana">Mehsana (મહેસાણા)</option>
                <option value="Bhavnagar">Bhavnagar (ભાવનગર)</option>
                <option value="Anand">Anand (આણંદ)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">GSEB Index Number</label>
              <input
                type="text"
                value={newSchoolGsebIndex}
                onChange={(e) => setNewSchoolGsebIndex(e.target.value)}
                placeholder="64.120"
                className="w-full px-3.5 py-2.5 font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">UDISE+ Code</label>
              <input
                type="text"
                value={newSchoolUdise}
                onChange={(e) => setNewSchoolUdise(e.target.value)}
                placeholder="24100105432"
                className="w-full px-3.5 py-2.5 font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsNewSchoolModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
            >
              {t('cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
            >
              {language === 'gu' ? 'નોંધણી પૂર્ણ કરો' : 'Provision Campus'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Provision Faculty / Principal Modal ("I Will Give Access Only") */}
      <Modal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        title={
          provisionRole === 'PRINCIPAL'
            ? language === 'gu'
              ? 'શાળા આચાર્યશ્રીની કેન્દ્રીય નિમણૂક & અધિકાર ફાળવણી'
              : 'Provision School Principal & Campus Head'
            : language === 'gu'
            ? 'શિક્ષકની કેન્દ્રીય નિમણૂક & વિષય ફાળવણી'
            : 'Provision Faculty Teacher & Academic Assignment'
        }
      >
        <form onSubmit={handleProvisionSubmit} className="space-y-3.5 text-xs">
          {/* Security Banner */}
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 leading-relaxed flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[11px] text-purple-950">
                {language === 'gu' ? 'સુપર એડમિન સત્તાવાર પ્રોવિઝનિંગ' : 'Super Admin Direct Provisioning'}
              </div>
              <div className="text-[11px] text-purple-800">
                {provisionRole === 'PRINCIPAL'
                  ? 'આચાર્યશ્રીને પસંદ કરેલા સંકુલના તમામ શૈક્ષણિક, હિસાબી અને સ્ટાફ સંચાલનના પૂર્ણ અધિકાર સોંપવામાં આવશે.'
                  : 'શિક્ષકને સંસ્થાકીય ઇમેઇલ, વિષય અને વર્ગ ફાળવણી સાથે પોર્ટલ પ્રવેશ સોંપવામાં આવશે.'}
              </div>
            </div>
          </div>

          {provisionError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold text-[11px]">
              {provisionError}
            </div>
          )}

          {/* Role Selection Tabs */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Institutional Role</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setProvisionRole('PRINCIPAL');
                  setProvisionDesignation('Principal & Head of Institution');
                }}
                className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  provisionRole === 'PRINCIPAL'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                🎓 Principal (આચાર્યશ્રી)
              </button>
              <button
                type="button"
                onClick={() => {
                  setProvisionRole('TEACHER');
                  setProvisionDesignation('Senior Assistant Teacher (GSEB)');
                }}
                className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  provisionRole === 'TEACHER'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                👨‍🏫 Teacher / Faculty (શિક્ષક)
              </button>
            </div>
          </div>

          {/* Target School Campus Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Target Gujarat School Campus *
            </label>
            <select
              required
              value={provisionSchoolId}
              onChange={(e) => setProvisionSchoolId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            >
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.address.split(',')[0]} - GSEB {s.gseb_index || s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Full Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Full Name (with Prefix e.g. Dr. / Smt. / Shri) *
            </label>
            <input
              type="text"
              required
              value={provisionName}
              onChange={(e) => setProvisionName(e.target.value)}
              placeholder="e.g. Dr. Kiritbhai M. Patel"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Institutional Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Institutional Email *</label>
              <input
                type="email"
                required
                value={provisionEmail}
                onChange={(e) => setProvisionEmail(e.target.value)}
                placeholder="faculty@royalacademyrajkot.edu.in"
                className="w-full px-3.5 py-2.5 font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={provisionPhone}
                onChange={(e) => setProvisionPhone(e.target.value)}
                placeholder="+91 98250 12345"
                className="w-full px-3.5 py-2.5 font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Designation */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Official Designation</label>
            <input
              type="text"
              value={provisionDesignation}
              onChange={(e) => setProvisionDesignation(e.target.value)}
              placeholder={provisionRole === 'PRINCIPAL' ? 'Principal & Academic Director' : 'Assistant Teacher (Secondary GSEB)'}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Teacher Specific: Subject & Assigned Class */}
          {provisionRole === 'TEACHER' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <div>
                <label className="block font-bold text-indigo-950 mb-1">Primary Subject Specialization</label>
                <select
                  value={provisionSubject}
                  onChange={(e) => setProvisionSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Mathematics">Mathematics (ગણિત)</option>
                  <option value="Science & Technology">Science &amp; Tech (વિજ્ઞાન &amp; ટેકનોલોજી)</option>
                  <option value="Physics">Physics (ભૌતિક વિજ્ઞાન)</option>
                  <option value="Chemistry">Chemistry (રસાયણ વિજ્ઞાન)</option>
                  <option value="Biology">Biology (જીવ વિજ્ઞાન)</option>
                  <option value="Computer Studies">Computer Studies (કમ્પ્યુટર)</option>
                  <option value="Gujarati">Gujarati Language (ગુજરાતી)</option>
                  <option value="English (FL/SL)">English (અંગ્રેજી)</option>
                  <option value="Social Science">Social Science (સામાજિક વિજ્ઞાન)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-indigo-950 mb-1">Primary Class Assignment</label>
                <select
                  value={provisionClass}
                  onChange={(e) => setProvisionClass(e.target.value)}
                  className="w-full px-3 py-2 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Class 10-A">Class 10-A (ધોરણ ૧૦-અ)</option>
                  <option value="Class 10-B">Class 10-B (ધોરણ ૧૦-બ)</option>
                  <option value="Class 9-A">Class 9-A (ધોરણ ૯-અ)</option>
                  <option value="Class 9-B">Class 9-B (ધોરણ ૯-બ)</option>
                  <option value="Class 11-Science">Class 11 Science (ધોરણ ૧૧ વિજ્ઞાન)</option>
                  <option value="Class 12-Science">Class 12 Science (ધોરણ ૧૨ વિજ્ઞાન)</option>
                  <option value="Class 8-A">Class 8-A (ધોરણ ૮-અ)</option>
                </select>
              </div>
            </div>
          )}

          {/* Default Initial Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Initial Access Passcode</label>
              <button
                type="button"
                onClick={() => setProvisionPassword(`GsebAuth#${Math.floor(2026 + Math.random() * 900)}`)}
                className="text-purple-600 hover:text-purple-800 font-bold text-[11px] cursor-pointer"
              >
                Generate New Passcode
              </button>
            </div>
            <div className="relative">
              <input
                type={provisionShowPassword ? 'text' : 'password'}
                required
                value={provisionPassword}
                onChange={(e) => setProvisionPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setProvisionShowPassword(!provisionShowPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
              >
                {provisionShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              The provisioned user will be required to authenticate with this passcode upon initial institutional sign-in.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsProvisionModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
            >
              {t('cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>
                {language === 'gu' ? 'અધિકાર સત્તાવાર સોંપો' : `Issue ${provisionRole} Access`}
              </span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        isOpen={isResetPasswordModalOpen}
        onClose={() => {
          setIsResetPasswordModalOpen(false);
          setSelectedUserToReset(null);
        }}
        title={
          language === 'gu'
            ? 'પાસવર્ડ અને ઓળખપત્ર રિસેટ (Emergency Credential Reset)'
            : 'Emergency Password & Credential Reset'
        }
      >
        {selectedUserToReset && (
          <form onSubmit={handleResetUserPassword} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
              <div className="font-bold text-purple-950">{selectedUserToReset.full_name}</div>
              <div className="text-[11px] font-mono text-purple-700">{selectedUserToReset.email}</div>
              <div className="text-[10px] text-purple-600 mt-0.5">Role: {selectedUserToReset.role}</div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                New Temporary Passcode *
              </label>
              <input
                type="text"
                required
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsResetPasswordModalOpen(false);
                  setSelectedUserToReset(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
              >
                {language === 'gu' ? 'પાસવર્ડ અપડેટ કરો' : 'Update Credentials'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
