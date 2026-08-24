import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Staff, StaffSalaryRecord } from '../../types/erp';
import { erpDb } from '../../services/db';
import { StatCard, Badge, Modal } from '../common/UIComponents';
import {
  Briefcase,
  Users,
  ClipboardCheck,
  Plus,
  CheckCircle2,
  Clock,
  Building,
  Fingerprint,
  IndianRupee,
  Edit,
  Bell,
  Mail,
  Phone,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const StaffPayroll: React.FC = () => {
  const { currentSchool, currentUser, refreshData } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'PAYROLL' | 'ATTENDANCE' | 'STAFF'>('PAYROLL');
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Add Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [designation, setDesignation] = useState('PGT Mathematics');
  const [department, setDepartment] = useState('Senior Secondary (Class 11-12)');
  const [baseSalary, setBaseSalary] = useState(58400);
  const [phone, setPhone] = useState('+91 94140 33412');
  const [qualification, setQualification] = useState('M.Sc. Mathematics, B.Ed (Gold Medalist)');

  // Edit Form State
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editBaseSalary, setEditBaseSalary] = useState(0);
  const [editPhone, setEditPhone] = useState('');
  const [editQualification, setEditQualification] = useState('');
  const [notifyTeacher, setNotifyTeacher] = useState(true);
  const [editSuccessMessage, setEditSuccessMessage] = useState<string | null>(null);

  const staff = erpDb.getStaff(currentSchool.id);
  const salaries = erpDb.getStaffSalaries(currentSchool.id);
  const staffAttendance = erpDb.getStaffAttendance(currentSchool.id, '2026-08-20');

  const totalPayroll = salaries.reduce((s, r) => s + r.net_salary, 0);

  const handleProcessPayroll = (salId: string) => {
    erpDb.processPayroll(salId);
    erpDb.logAudit({
      school_id: currentSchool.id,
      user_id: currentUser?.id || 'usr-principal',
      user_name: currentUser?.full_name || 'Principal Dr. Vinodbhai C. Pandya',
      user_role: 'PRINCIPAL',
      action: 'PAYROLL_PROCESSED',
      resource_type: 'STAFF_SALARIES',
      resource_id: salId,
      details: `Processed 7th Pay salary NEFT direct transfer for employee record #${salId}`,
      ip_address: '192.168.1.1',
    });
    refreshData();
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) return;

    erpDb.addStaff(currentSchool.id, {
      employee_code: `EMP-SVM-${Math.floor(100 + Math.random() * 900)}`,
      first_name: firstName,
      last_name: lastName,
      designation,
      department,
      qualification,
      base_salary: Number(baseSalary),
      joining_date: new Date().toISOString().split('T')[0],
      phone,
    });

    setIsAddStaffModalOpen(false);
    setFirstName('');
    setLastName('');
    refreshData();
  };

  const handleOpenEditStaff = (member: Staff) => {
    setEditingStaff(member);
    setEditFirstName(member.first_name);
    setEditLastName(member.last_name);
    setEditDesignation(member.designation);
    setEditDepartment(member.department);
    setEditBaseSalary(member.base_salary);
    setEditPhone(member.phone || '');
    setEditQualification(member.qualification);
    setNotifyTeacher(true);
  };

  const handleSaveStaffEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    const result = erpDb.updateStaff(
      editingStaff.id,
      {
        first_name: editFirstName,
        last_name: editLastName,
        designation: editDesignation,
        department: editDepartment,
        base_salary: Number(editBaseSalary),
        phone: editPhone,
        qualification: editQualification,
      },
      notifyTeacher,
      currentUser?.full_name || 'Principal Dr. Vinodbhai C. Pandya'
    );

    setEditingStaff(null);
    refreshData();

    const msg = notifyTeacher
      ? `Profile for ${editFirstName} ${editLastName} updated successfully! Official notification sent to teacher.`
      : `Profile for ${editFirstName} ${editLastName} updated successfully.`;
    setEditSuccessMessage(msg);
    setTimeout(() => setEditSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2 font-heading">
            <Briefcase className="w-5 h-5 text-indigo-700" />
            <span>
              {language === 'gu'
                ? 'શિક્ષક સ્ટાફ અને ૭મા પગાર પંચ પેરોલ માસ્ટર'
                : 'Teaching Staff & 7th Pay Payroll Master'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'gu'
              ? 'શિક્ષકોની વિગતો સુધારો, બાયોમેટ્રિક હાજરી, ૭મું પગાર પંચ DA/HRA અને સત્તાવાર સેવા નોંધણી.'
              : 'Principal staff management, teacher profile updates with notification dispatch, and 7th Pay salary registers.'}
          </p>
        </div>

        <button
          onClick={() => setIsAddStaffModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all self-start cursor-pointer hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'gu' ? 'નવા શિક્ષક ઉમેરો' : 'Add Faculty Member'}</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {editSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-700 text-white shadow-md flex items-center justify-between text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{editSuccessMessage}</span>
          </div>
          <button onClick={() => setEditSuccessMessage(null)} className="text-white/80 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">
            {language === 'gu' ? 'કુલ મંજૂર શિક્ષક સંખ્યા' : 'Total Sanctioned Staff'}
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-heading">{staff.length} Faculty</div>
          <div className="text-xs text-slate-500 mt-1">PGT, TGT, PRT &amp; Administrative</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">
            {language === 'gu' ? 'આજની બાયોમેટ્રિક હાજરી' : 'Biometric Punch Today'}
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-heading">100% Present</div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">Staff Room Check-in 07:45 AM</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">
            {language === 'gu' ? 'માસિક કુલ પગાર બજેટ' : 'Monthly Net Payroll Commitment'}
          </div>
          <div className="text-2xl font-bold text-indigo-700 mt-1 font-mono">₹{totalPayroll.toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-500 mt-1">August 2026 Salary Cycle (7th Pay)</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
        <button
          onClick={() => setActiveTab('PAYROLL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'PAYROLL'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {language === 'gu' ? 'માસિક પગાર પત્રક (૭મું પગાર પંચ)' : 'Monthly Salary Register (7th Pay)'}
        </button>
        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'ATTENDANCE'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {language === 'gu' ? 'બાયોમેટ્રિક હાજરી પત્રક' : 'Biometric Attendance Register'}
        </button>
        <button
          onClick={() => setActiveTab('STAFF')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'STAFF'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {language === 'gu' ? 'શિક્ષક પ્રોફાઇલ અને વિગત સંચાલન' : 'Faculty Profiles & Permissions'}
        </button>
      </div>

      {/* Tab 1: Monthly Payroll Computation */}
      {activeTab === 'PAYROLL' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Salary Register • Cycle: August 2026 (22 Working Days)
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Calculation: Net = Basic + DA (50%) + HRA (18%) - EPF (12%) - TDS</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Emp Code</th>
                  <th className="py-3 px-4">Basic Pay (Level)</th>
                  <th className="py-3 px-4">Working Days</th>
                  <th className="py-3 px-4">EPF &amp; Deductions</th>
                  <th className="py-3 px-4">DA &amp; Allowances</th>
                  <th className="py-3 px-4">Net Salary Payable</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Bank Transfer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salaries.map((sal) => (
                  <tr key={sal.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{sal.staff_name}</div>
                      <div className="text-[11px] text-slate-500">{sal.designation}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">{sal.employee_code}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">₹{sal.base_salary.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">{sal.present_days} / {sal.working_days}</td>
                    <td className="py-3 px-4 font-mono text-rose-600">-₹{(sal.leave_deduction + sal.tax_deduction).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-mono text-emerald-700">+₹{sal.bonus.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                      ₹{sal.net_salary.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          sal.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {sal.status === 'PAID' ? 'DISBURSED' : 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {sal.status !== 'PAID' ? (
                        <button
                          onClick={() => handleProcessPayroll(sal.id)}
                          className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          Disburse via NEFT
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center justify-end space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>SBI Ref #{Math.floor(10000000 + Math.random() * 90000000)}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Biometric Attendance */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Staff Daily Biometric In/Out Log • Date: 20 August 2026
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Biometric Machine #01 (Staff Main Gate)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[560px] w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Faculty Name</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Punch In Time</th>
                  <th className="py-3 px-4">Punch Out Time</th>
                  <th className="py-3 px-4">Total Hours</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffAttendance.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{att.staff_name}</td>
                    <td className="py-3 px-4 text-slate-600">{att.designation}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-700">{att.check_in || '07:45 AM'}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{att.check_out || '02:30 PM'}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">6h 45m</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Faculty Profiles with Principal Edit Permissions */}
      {activeTab === 'STAFF' && (
        <div className="space-y-4">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0" />
              <span>
                {language === 'gu'
                  ? 'આચાર્યશ્રી શિક્ષકોની માહિતી (હોદ્દો, પગાર, વિષય) સુધારી શકે છે. સુધારા બાદ શિક્ષકને સિસ્ટમ દ્વારા આપોઆપ સૂચના મોકલવામાં આવે છે.'
                  : 'Principal has authorized permissions to update teacher records. Saving changes dispatches an official in-app notice to inform the teacher.'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((member) => (
              <div key={member.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-base border border-indigo-200 shrink-0 font-heading">
                        {member.first_name[0]}{member.last_name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 font-heading">
                          {member.first_name} {member.last_name}
                        </h3>
                        <p className="text-xs text-indigo-700 font-semibold">{member.designation}</p>
                        <p className="text-[11px] font-mono text-slate-500">{member.employee_code}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEditStaff(member)}
                      className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer border border-slate-200"
                      title="Edit teacher information"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                    <div><span className="font-semibold text-slate-700">Department:</span> {member.department}</div>
                    <div><span className="font-semibold text-slate-700">Qualification:</span> {member.qualification}</div>
                    <div><span className="font-semibold text-slate-700">Phone:</span> {member.phone}</div>
                    <div><span className="font-semibold text-slate-700">Basic Pay:</span> <strong className="font-mono text-slate-900 font-bold">₹{member.base_salary.toLocaleString('en-IN')}</strong></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                    ACTIVE FACULTY
                  </span>
                  <button
                    onClick={() => handleOpenEditStaff(member)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{language === 'gu' ? 'વિગત સુધારો' : 'Edit Profile'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <Modal
          isOpen={!!editingStaff}
          onClose={() => setEditingStaff(null)}
          title={`Edit Faculty Record: ${editingStaff.first_name} ${editingStaff.last_name}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveStaffEdit} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-amber-900">
              <Bell className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {language === 'gu'
                  ? 'ફેરફાર સાચવ્યા પછી શિક્ષકને તેમના પોર્ટલમાં સત્તાવાર સૂચના પહોંચાડવામાં આવશે.'
                  : 'Teacher will receive an official notification informing them of profile/salary scale changes made by the Principal.'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">First Name (નામ) *</label>
                <input
                  type="text"
                  required
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Last Name (ઉપનામ) *</label>
                <input
                  type="text"
                  required
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation (હોદ્દો) *</label>
                <select
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="PGT Mathematics">PGT Mathematics (11th-12th)</option>
                  <option value="PGT Physics">PGT Physics</option>
                  <option value="PGT Chemistry">PGT Chemistry</option>
                  <option value="PGT Biology">PGT Biology</option>
                  <option value="TGT Science">TGT Science (6th-10th)</option>
                  <option value="TGT Gujarati & Sanskrit">TGT Gujarati &amp; Sanskrit</option>
                  <option value="TGT Hindi">TGT Hindi</option>
                  <option value="TGT Social Science">TGT Social Science</option>
                  <option value="TGT English">TGT English</option>
                  <option value="PRT All Subjects">PRT Primary Teacher</option>
                  <option value="Lab Assistant / Office">Lab Assistant / Office Staff</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monthly Basic Pay (7th Pay ₹) *</label>
                <input
                  type="number"
                  required
                  min={15000}
                  value={editBaseSalary}
                  onChange={(e) => setEditBaseSalary(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department (વિભાગ)</label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone (મોબાઇલ)</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Educational Qualifications (લાયકાત)</label>
              <input
                type="text"
                value={editQualification}
                onChange={(e) => setEditQualification(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* In-app Notification Toggle */}
            <div className="pt-2 border-t border-slate-200">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyTeacher}
                  onChange={(e) => setNotifyTeacher(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="font-semibold text-slate-800">
                  {language === 'gu'
                    ? 'શિક્ષકને પ્રોફાઇલ સુધારા અંગે તુરંત સૂચના મોકલો'
                    : 'Dispatch instant in-app circular / alert to inform teacher of these changes'}
                </span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold cursor-pointer hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold cursor-pointer shadow-sm flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Changes &amp; Notify Teacher</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddStaffModalOpen}
        onClose={() => setIsAddStaffModalOpen(false)}
        title="Add Faculty / Staff Member (નવા શિક્ષક ઉમેરો)"
        maxWidth="lg"
      >
        <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name (નામ) *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Ramesh"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name (ઉપનામ) *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Sharma"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation (હોદ્દો) *</label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="PGT Mathematics">PGT Mathematics (11th-12th)</option>
                <option value="PGT Physics">PGT Physics</option>
                <option value="PGT Chemistry">PGT Chemistry</option>
                <option value="TGT Science">TGT Science (6th-10th)</option>
                <option value="TGT Gujarati & Sanskrit">TGT Gujarati &amp; Sanskrit</option>
                <option value="TGT Hindi">TGT Hindi</option>
                <option value="TGT Social Science">TGT Social Science</option>
                <option value="PRT All Subjects">PRT Primary Teacher</option>
                <option value="Lab Assistant / Office">Lab Assistant / Office Staff</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Basic Pay (7th Pay ₹) *</label>
              <input
                type="number"
                required
                min={15000}
                value={baseSalary}
                onChange={(e) => setBaseSalary(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Educational Qualifications (લાયકાત)</label>
            <input
              type="text"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              placeholder="e.g. M.Sc. (Physics), B.Ed, CTET Qualified"
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Mobile Number (મોબાઇલ નંબર)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 94140 12345"
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddStaffModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold cursor-pointer shadow-sm"
            >
              Save Faculty Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
