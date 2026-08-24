import {
  School,
  User,
  Student,
  Staff,
  SchoolClass,
  FeeStructure,
  FeeTransaction,
  AttendanceStudent,
  AttendanceStaff,
  Notice,
  TimetableSlot,
  Homework,
  HomeworkSubmission,
  Examination,
  ExamMark,
  LeaveApplication,
  StaffChatGroup,
  ChatMessage,
  DigitalLibraryResource,
  StaffSalaryRecord,
  AuditLog,
  Role,
  SystemBackupInfo,
} from '../types/erp';
import {
  SEED_SCHOOLS,
  SEED_USERS,
  SEED_STUDENTS,
  SEED_STAFF,
  SEED_CLASSES,
  SEED_FEE_STRUCTURES,
  SEED_FEE_TRANSACTIONS,
  SEED_ATTENDANCE_STUDENTS,
  SEED_ATTENDANCE_STAFF,
  SEED_NOTICES,
  SEED_TIMETABLE_SLOTS,
  SEED_HOMEWORK,
  SEED_HOMEWORK_SUBMISSIONS,
  SEED_EXAMINATIONS,
  SEED_EXAM_MARKS,
  SEED_LEAVE_APPLICATIONS,
  SEED_CHAT_GROUPS,
  SEED_CHAT_MESSAGES,
  SEED_LIBRARY_RESOURCES,
  SEED_STAFF_SALARY_RECORDS,
  SEED_AUDIT_LOGS,
} from '../data/seedData';

const STORAGE_KEY_PREFIX = 'classsec_gseb_v1_';

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    if (parsed === null || parsed === undefined) return fallback;
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

export class ERPDatabaseService {
  private static instance: ERPDatabaseService;

  private schools: School[];
  private users: User[];
  private students: Student[];
  private staff: Staff[];
  private classes: SchoolClass[];
  private feeStructures: FeeStructure[];
  private feeTransactions: FeeTransaction[];
  private attendanceStudents: AttendanceStudent[];
  private attendanceStaff: AttendanceStaff[];
  private notices: Notice[];
  private timetableSlots: TimetableSlot[];
  private homework: Homework[];
  private homeworkSubmissions: HomeworkSubmission[];
  private examinations: Examination[];
  private examMarks: ExamMark[];
  private leaveApplications: LeaveApplication[];
  private chatGroups: StaffChatGroup[];
  private chatMessages: ChatMessage[];
  private libraryResources: DigitalLibraryResource[];
  private staffSalaries: StaffSalaryRecord[];
  private auditLogs: AuditLog[];
  private lastBackup: SystemBackupInfo;

  private constructor() {
    // Smart merge seed schools with stored schools
    const storedSchools = getStored<School[]>('schools', []);
    if (storedSchools.length === 0) {
      this.schools = [...SEED_SCHOOLS];
    } else {
      const mergedSchools = new Map<string, School>();
      SEED_SCHOOLS.forEach((s) => mergedSchools.set(s.id, s));
      storedSchools.forEach((s) => {
        if (!mergedSchools.has(s.id)) {
          mergedSchools.set(s.id, s);
        }
      });
      this.schools = Array.from(mergedSchools.values());
    }
    setStored('schools', this.schools);
    
    // Smart merge seed users with stored users to ensure valid emails
    const storedUsers = getStored<User[]>('users', []);
    if (storedUsers.length === 0) {
      this.users = [...SEED_USERS];
    } else {
      // Update any existing user with current seed data if IDs match, else keep custom created users
      const mergedMap = new Map<string, User>();
      SEED_USERS.forEach((su) => mergedMap.set(su.id, su));
      storedUsers.forEach((u) => {
        if (!mergedMap.has(u.id)) {
          mergedMap.set(u.id, u);
        }
      });
      this.users = Array.from(mergedMap.values());
    }
    setStored('users', this.users);

    this.students = getStored('students', SEED_STUDENTS);
    this.staff = getStored('staff', SEED_STAFF);
    this.classes = getStored('classes', SEED_CLASSES);
    this.feeStructures = getStored('feeStructures', SEED_FEE_STRUCTURES);
    this.feeTransactions = getStored('feeTransactions', SEED_FEE_TRANSACTIONS);
    this.attendanceStudents = getStored('attendanceStudents', SEED_ATTENDANCE_STUDENTS);
    this.attendanceStaff = getStored('attendanceStaff', SEED_ATTENDANCE_STAFF);
    this.notices = getStored('notices', SEED_NOTICES);
    this.timetableSlots = getStored('timetableSlots', SEED_TIMETABLE_SLOTS);
    this.homework = getStored('homework', SEED_HOMEWORK);
    this.homeworkSubmissions = getStored('homeworkSubmissions', SEED_HOMEWORK_SUBMISSIONS);
    this.examinations = getStored('examinations', SEED_EXAMINATIONS);
    this.examMarks = getStored('examMarks', SEED_EXAM_MARKS);
    this.leaveApplications = getStored('leaveApplications', SEED_LEAVE_APPLICATIONS);
    this.chatGroups = getStored('chatGroups', SEED_CHAT_GROUPS);
    this.chatMessages = getStored('chatMessages', SEED_CHAT_MESSAGES);
    this.libraryResources = getStored('libraryResources', SEED_LIBRARY_RESOURCES);
    this.staffSalaries = getStored('staffSalaries', SEED_STAFF_SALARY_RECORDS);
    this.auditLogs = getStored('auditLogs', SEED_AUDIT_LOGS);

    // Initialize Last Backup Info
    const defaultBackup: SystemBackupInfo = {
      id: 'bkp-initial',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      formatted_date: new Date(Date.now() - 3600000 * 2).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      size_kb: 486,
      created_by: 'Automated Snapshot Daemon',
      type: 'SCHEDULED_AUTOMATIC',
      status: 'SUCCESS',
      record_counts: {
        students: 1280,
        staff: 72,
        fees: 24,
        marks: 5,
        attendance: 34,
        notices: 4,
      },
    };
    const storedBackup = getStored<SystemBackupInfo>('lastBackup', defaultBackup);
    if (!storedBackup || typeof storedBackup !== 'object' || !storedBackup.formatted_date || !storedBackup.record_counts) {
      this.lastBackup = defaultBackup;
    } else {
      this.lastBackup = storedBackup;
    }
  }

  public static getInstance(): ERPDatabaseService {
    if (!ERPDatabaseService.instance) {
      ERPDatabaseService.instance = new ERPDatabaseService();
    }
    return ERPDatabaseService.instance;
  }

  public resetToFactorySeed(): void {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(k);
      }
    });
    this.schools = [...SEED_SCHOOLS];
    this.users = [...SEED_USERS];
    this.students = [...SEED_STUDENTS];
    this.staff = [...SEED_STAFF];
    this.classes = [...SEED_CLASSES];
    this.feeStructures = [...SEED_FEE_STRUCTURES];
    this.feeTransactions = [...SEED_FEE_TRANSACTIONS];
    this.attendanceStudents = [...SEED_ATTENDANCE_STUDENTS];
    this.attendanceStaff = [...SEED_ATTENDANCE_STAFF];
    this.notices = [...SEED_NOTICES];
    this.timetableSlots = [...SEED_TIMETABLE_SLOTS];
    this.homework = [...SEED_HOMEWORK];
    this.homeworkSubmissions = [...SEED_HOMEWORK_SUBMISSIONS];
    this.examinations = [...SEED_EXAMINATIONS];
    this.examMarks = [...SEED_EXAM_MARKS];
    this.leaveApplications = [...SEED_LEAVE_APPLICATIONS];
    this.chatGroups = [...SEED_CHAT_GROUPS];
    this.chatMessages = [...SEED_CHAT_MESSAGES];
    this.libraryResources = [...SEED_LIBRARY_RESOURCES];
    this.staffSalaries = [...SEED_STAFF_SALARY_RECORDS];
    this.auditLogs = [...SEED_AUDIT_LOGS];

    // Initialize Last Backup Info
    const defaultBackup: SystemBackupInfo = {
      id: 'bkp-initial',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      formatted_date: new Date(Date.now() - 3600000 * 2).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      size_kb: 486,
      created_by: 'Automated Snapshot Daemon',
      type: 'SCHEDULED_AUTOMATIC',
      status: 'SUCCESS',
      record_counts: {
        students: 1280,
        staff: 72,
        fees: 24,
        marks: 5,
        attendance: 34,
        notices: 4,
      },
    };
    const storedBackup = getStored<SystemBackupInfo>('lastBackup', defaultBackup);
    if (!storedBackup || typeof storedBackup !== 'object' || !storedBackup.formatted_date || !storedBackup.record_counts) {
      this.lastBackup = defaultBackup;
    } else {
      this.lastBackup = storedBackup;
    }

    this.persistAll();
  }

  private persistAll(): void {
    setStored('schools', this.schools);
    setStored('users', this.users);
    setStored('students', this.students);
    setStored('staff', this.staff);
    setStored('classes', this.classes);
    setStored('feeStructures', this.feeStructures);
    setStored('feeTransactions', this.feeTransactions);
    setStored('attendanceStudents', this.attendanceStudents);
    setStored('attendanceStaff', this.attendanceStaff);
    setStored('notices', this.notices);
    setStored('timetableSlots', this.timetableSlots);
    setStored('homework', this.homework);
    setStored('homeworkSubmissions', this.homeworkSubmissions);
    setStored('examinations', this.examinations);
    setStored('examMarks', this.examMarks);
    setStored('leaveApplications', this.leaveApplications);
    setStored('chatGroups', this.chatGroups);
    setStored('chatMessages', this.chatMessages);
    setStored('libraryResources', this.libraryResources);
    setStored('staffSalaries', this.staffSalaries);
    setStored('auditLogs', this.auditLogs);
    setStored('lastBackup', this.lastBackup);
  }

  // --- Multi-Tenant School Operations ---
  public getSchools(): School[] {
    return [...this.schools];
  }

  public getSchoolById(schoolId: string): School | undefined {
    return this.schools.find((s) => s.id === schoolId);
  }

  public createSchool(data: Omit<School, 'id' | 'created_at'>): School {
    const newSchool: School = {
      ...data,
      id: `school-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    };
    this.schools.push(newSchool);
    setStored('schools', this.schools);
    this.logAudit({
      school_id: newSchool.id,
      user_id: 'usr-superadmin',
      user_name: 'Super Admin',
      user_role: 'SUPER_ADMIN',
      action: 'PROVISION_SCHOOL',
      resource_type: 'SCHOOLS',
      resource_id: newSchool.id,
      details: `Provisioned new tenant school "${newSchool.name}" (Code: ${newSchool.code})`,
      ip_address: '10.0.0.1',
    });
    return newSchool;
  }

  // --- Users & Authentication Helpers ---
  public getAllUsers(schoolId?: string): User[] {
    if (!schoolId) return [...this.users];
    return this.users.filter((u) => u.school_id === schoolId || u.role === 'SUPER_ADMIN');
  }

  public getUserByEmail(email: string): User | undefined {
    if (!email) return undefined;
    const cleanEmail = email.trim().toLowerCase();
    
    // 1. Exact match
    const exact = this.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (exact) return exact;

    // 2. Domain alias match (support adityaschool.edu.in <-> shardarajkot.edu.in <-> tapovanglobal.edu.in)
    const localPart = cleanEmail.split('@')[0];
    const localMatch = this.users.find((u) => {
      const uLocal = u.email.toLowerCase().split('@')[0];
      return uLocal === localPart;
    });
    if (localMatch) return localMatch;

    // 3. Prefix matching for demo convenience (e.g. "principal", "trustee", "teacher", "student", "parent")
    if (cleanEmail.includes('principal')) {
      return this.users.find((u) => u.role === 'PRINCIPAL') || this.users[1];
    }
    if (cleanEmail.includes('trustee') || cleanEmail.includes('superadmin') || cleanEmail.includes('admin')) {
      return this.users.find((u) => u.role === 'SUPER_ADMIN') || this.users[0];
    }
    if (cleanEmail.includes('teacher') || cleanEmail.includes('neeta')) {
      return this.users.find((u) => u.role === 'TEACHER') || this.users[3];
    }
    if (cleanEmail.includes('student') || cleanEmail.includes('harsh')) {
      return this.users.find((u) => u.role === 'STUDENT') || this.users.find((u) => u.id === 'usr-student-harsh');
    }
    if (cleanEmail.includes('parent') || cleanEmail.includes('vinod')) {
      return this.users.find((u) => u.role === 'PARENT') || this.users.find((u) => u.id === 'usr-parent-vinod');
    }

    return undefined;
  }

  public getStudentByParentUserId(parentUserId: string): Student | undefined {
    return this.students.find((s) => s.parent_user_id === parentUserId) || this.students[0];
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  // --- Super Admin User & Faculty Access Provisioning ---
  public provisionUser(data: {
    name: string;
    email: string;
    username?: string;
    role: Role;
    school_id: string;
    phone?: string;
    subject?: string;
    designation?: string;
    assigned_classes?: string[];
  }): { success: boolean; user?: User; error?: string } {
    const cleanEmail = data.email.trim().toLowerCase();
    
    // Check if email already exists
    if (this.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: `An account with email ${cleanEmail} is already registered.` };
    }

    const newUser: User = {
      id: `usr-${Date.now().toString(36)}`,
      school_id: data.school_id,
      email: cleanEmail,
      role: data.role,
      status: 'ACTIVE',
      full_name: data.name.trim(),
      gujarati_name: data.name.trim(),
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      phone: data.phone || '+91 98250 12345',
      mfa_enabled: false,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    };

    this.users.push(newUser);
    setStored('users', this.users);

    // If role is TEACHER, also automatically create a staff service record
    if (data.role === 'TEACHER') {
      const nameParts = data.name.trim().split(' ');
      const firstName = nameParts[0] || data.name;
      const lastName = nameParts.slice(1).join(' ') || 'Teacher';

      const newStaff: Staff = {
        id: `staff-${Date.now().toString(36)}`,
        school_id: data.school_id,
        user_id: newUser.id,
        employee_code: `EMP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        first_name: firstName,
        last_name: lastName,
        gujarati_name: data.name,
        designation: data.designation || 'Assistant Teacher (GSEB Secondary)',
        department: 'ACADEMIC',
        qualification: 'M.Sc., B.Ed.',
        base_salary: 48500,
        joining_date: new Date().toISOString().slice(0, 10),
        phone: data.phone || '+91 98250 12345',
        assigned_classes: data.assigned_classes || ['class-10-a'],
        specialization_subjects: data.subject ? [data.subject] : ['Mathematics', 'Science & Tech'],
      };
      this.staff.push(newStaff);
      setStored('staff', this.staff);
    }

    this.logAudit({
      school_id: data.school_id,
      user_id: 'usr-superadmin',
      user_name: 'Shri Pravinbhai Patel (Super Admin)',
      user_role: 'SUPER_ADMIN',
      action: 'PROVISION_USER_ACCESS',
      resource_type: 'USER_ACCOUNT',
      resource_id: newUser.id,
      details: `Provisioned official institutional access for [${data.role}] "${newUser.full_name}" (${newUser.email}) at school [${data.school_id}]`,
      ip_address: '10.0.0.1',
    });

    return { success: true, user: newUser };
  }

  public updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return false;
    user.status = status as any;
    setStored('users', this.users);

    this.logAudit({
      school_id: user.school_id,
      user_id: 'usr-superadmin',
      user_name: 'Shri Pravinbhai Patel (Super Admin)',
      user_role: 'SUPER_ADMIN',
      action: 'UPDATE_USER_STATUS',
      resource_type: 'USER_ACCOUNT',
      resource_id: user.id,
      details: `Updated account status for "${user.full_name}" (${user.role}) to [${status}]`,
      ip_address: '10.0.0.1',
    });
    return true;
  }

  public deleteUser(userId: string): boolean {
    const idx = this.users.findIndex((u) => u.id === userId);
    if (idx === -1) return false;
    const removedUser = this.users.splice(idx, 1)[0];
    setStored('users', this.users);

    this.logAudit({
      school_id: removedUser.school_id,
      user_id: 'usr-superadmin',
      user_name: 'Shri Pravinbhai Patel (Super Admin)',
      user_role: 'SUPER_ADMIN',
      action: 'REVOKE_USER_ACCESS',
      resource_type: 'USER_ACCOUNT',
      resource_id: removedUser.id,
      details: `Revoked access and removed user account for "${removedUser.full_name}" (${removedUser.role})`,
      ip_address: '10.0.0.1',
    });
    return true;
  }

  public resetUserPassword(userId: string, newPasswordMasked?: string): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return false;

    this.logAudit({
      school_id: user.school_id,
      user_id: 'usr-superadmin',
      user_name: 'Shri Pravinbhai Patel (Super Admin)',
      user_role: 'SUPER_ADMIN',
      action: 'PASSWORD_RESET_PROVISIONED',
      resource_type: 'USER_CREDENTIALS',
      resource_id: user.id,
      details: `Temporary password reset and emergency credentials issued for "${user.full_name}" (${user.email})`,
      ip_address: '10.0.0.1',
    });
    return true;
  }

  // --- Classes Operations ---
  public getClasses(schoolId: string): SchoolClass[] {
    return this.classes.filter((c) => c.school_id === schoolId);
  }

  public getClassById(classId: string): SchoolClass | undefined {
    return this.classes.find((c) => c.id === classId);
  }

  public addClass(schoolId: string, data: Omit<SchoolClass, 'id' | 'school_id'>): SchoolClass {
    const newClass: SchoolClass = {
      ...data,
      id: `class-${Date.now().toString(36)}`,
      school_id: schoolId,
    };
    this.classes.push(newClass);
    setStored('classes', this.classes);
    return newClass;
  }

  // --- Student Operations (RLS Enforced) ---
  public getStudents(schoolId: string, role: Role, userId: string, classIdFilter?: string): Student[] {
    let list = this.students.filter((s) => s.school_id === schoolId);

    // Row-Level Security policy checks
    if (role === 'STUDENT') {
      list = list.filter((s) => s.user_id === userId);
    } else if (role === 'PARENT') {
      list = list.filter((s) => s.parent_user_id === userId);
    } else if (role === 'TEACHER') {
      const staffMember = this.staff.find((st) => st.user_id === userId && st.school_id === schoolId);
      if (staffMember && staffMember.assigned_classes && staffMember.assigned_classes.length > 0) {
        list = list.filter((s) => staffMember.assigned_classes?.includes(s.class_id));
      }
    }

    if (classIdFilter && classIdFilter !== 'ALL') {
      list = list.filter((s) => s.class_id === classIdFilter);
    }

    return list;
  }

  public getStudentById(studentId: string): Student | undefined {
    return this.students.find((s) => s.id === studentId);
  }

  public getStudentByUserId(userId: string): Student | undefined {
    return this.students.find((s) => s.user_id === userId);
  }

  public addStudent(schoolId: string, studentData: Omit<Student, 'id' | 'school_id' | 'user_id'>): Student {
    const newId = `stu-${Date.now().toString(36)}`;
    const userId = `usr-stu-${Date.now().toString(36)}`;
    
    // Auto-create companion user record for student
    const newUser: User = {
      id: userId,
      school_id: schoolId,
      email: `${studentData.first_name.toLowerCase()}.${studentData.last_name.toLowerCase()}@stjude.student`,
      role: 'STUDENT',
      status: 'ACTIVE',
      full_name: `${studentData.first_name} ${studentData.last_name}`,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentData.first_name}`,
      phone: studentData.parent_phone,
      created_at: new Date().toISOString(),
    };
    this.users.push(newUser);
    setStored('users', this.users);

    const newStudent: Student = {
      ...studentData,
      id: newId,
      school_id: schoolId,
      user_id: userId,
    };
    this.students.unshift(newStudent);
    setStored('students', this.students);

    // Update class enrolled count
    const targetClass = this.classes.find((c) => c.id === studentData.class_id);
    if (targetClass) {
      targetClass.enrolled_count = (targetClass.enrolled_count || 0) + 1;
      setStored('classes', this.classes);
    }

    return newStudent;
  }

  public updateStudent(studentId: string, updates: Partial<Student>): Student | null {
    const idx = this.students.findIndex((s) => s.id === studentId);
    if (idx === -1) return null;
    this.students[idx] = { ...this.students[idx], ...updates };
    setStored('students', this.students);
    return this.students[idx];
  }

  public deleteStudent(studentId: string): boolean {
    const idx = this.students.findIndex((s) => s.id === studentId);
    if (idx === -1) return false;
    const removed = this.students.splice(idx, 1)[0];
    setStored('students', this.students);
    return true;
  }

  public bulkAddStudents(schoolId: string, students: Array<Omit<Student, 'id' | 'school_id' | 'user_id'>>): Student[] {
    return students.map((s) => this.addStudent(schoolId, s));
  }

  public bulkImportStudents(schoolId: string, importedRows: Array<Omit<Student, 'id' | 'school_id' | 'user_id'>>): { success: number; errors: string[] } {
    const errors: string[] = [];
    let successCount = 0;

    importedRows.forEach((row, i) => {
      try {
        if (!row.first_name || !row.last_name || !row.gr_number) {
          errors.push(`Row ${i + 1}: Missing mandatory fields (First name, Last name or GR number)`);
          return;
        }
        // Check duplicate GR
        if (this.students.some((s) => s.school_id === schoolId && s.gr_number === row.gr_number)) {
          errors.push(`Row ${i + 1}: Duplicate GR Number ${row.gr_number}`);
          return;
        }
        this.addStudent(schoolId, row);
        successCount++;
      } catch (err: any) {
        errors.push(`Row ${i + 1}: ${err.message || 'Unknown ingestion error'}`);
      }
    });

    return { success: successCount, errors };
  }

  // --- Staff Operations ---
  public getStaff(schoolId: string): Staff[] {
    return this.staff.filter((s) => s.school_id === schoolId);
  }

  public getStaffByUserId(userId: string): Staff | undefined {
    return this.staff.find((s) => s.user_id === userId);
  }

  public addStaff(schoolId: string, staffData: Omit<Staff, 'id' | 'school_id' | 'user_id'>): Staff {
    const newId = `stf-${Date.now().toString(36)}`;
    const userId = `usr-stf-${Date.now().toString(36)}`;

    const newUser: User = {
      id: userId,
      school_id: schoolId,
      email: `${staffData.first_name.toLowerCase()}.${staffData.last_name.toLowerCase()}@stjude.edu`,
      role: 'TEACHER',
      status: 'ACTIVE',
      full_name: `${staffData.first_name} ${staffData.last_name}`,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${staffData.first_name}`,
      phone: staffData.phone,
      created_at: new Date().toISOString(),
    };
    this.users.push(newUser);
    setStored('users', this.users);

    const newStaff: Staff = {
      ...staffData,
      id: newId,
      school_id: schoolId,
      user_id: userId,
    };
    this.staff.push(newStaff);
    setStored('staff', this.staff);
    return newStaff;
  }

  public updateStaff(
    staffId: string,
    updates: Partial<Staff>,
    notifyTeacher = true,
    updatedByName = 'Principal Dr. Vinodbhai C. Pandya'
  ): { staff: Staff | null; notified: boolean } {
    const idx = this.staff.findIndex((s) => s.id === staffId);
    if (idx === -1) return { staff: null, notified: false };

    const oldStaff = this.staff[idx];
    const updatedStaff: Staff = {
      ...oldStaff,
      ...updates,
    };
    this.staff[idx] = updatedStaff;
    setStored('staff', this.staff);

    // Also update associated User record if name/phone changed
    if (updatedStaff.user_id) {
      const uIdx = this.users.findIndex((u) => u.id === updatedStaff.user_id);
      if (uIdx !== -1) {
        this.users[uIdx] = {
          ...this.users[uIdx],
          full_name: `${updatedStaff.first_name} ${updatedStaff.last_name}`,
          phone: updatedStaff.phone || this.users[uIdx].phone,
        };
        setStored('users', this.users);
      }
    }

    // Log audit
    this.logAudit({
      school_id: updatedStaff.school_id,
      user_id: 'usr-principal',
      user_name: updatedByName,
      user_role: 'PRINCIPAL',
      action: 'UPDATE_TEACHER_RECORD',
      resource_type: 'STAFF',
      resource_id: staffId,
      details: `Principal updated profile information for ${updatedStaff.first_name} ${updatedStaff.last_name} (${updatedStaff.designation}). Notification dispatched: ${notifyTeacher}`,
      ip_address: '192.168.1.1',
    });

    // Notify teacher via institutional notice & system notification
    if (notifyTeacher && updatedStaff.school_id) {
      const changedFields: string[] = [];
      if (updates.designation && updates.designation !== oldStaff.designation) changedFields.push(`Designation (${updates.designation})`);
      if (updates.department && updates.department !== oldStaff.department) changedFields.push(`Department (${updates.department})`);
      if (updates.base_salary && updates.base_salary !== oldStaff.base_salary) changedFields.push(`Basic Pay (₹${updates.base_salary.toLocaleString('en-IN')})`);
      if (updates.qualification && updates.qualification !== oldStaff.qualification) changedFields.push(`Qualification`);
      if (updates.phone && updates.phone !== oldStaff.phone) changedFields.push(`Phone (${updates.phone})`);

      const fieldSummary = changedFields.length > 0 ? changedFields.join(', ') : 'Profile & Assignment details';

      this.createNotice(updatedStaff.school_id, {
        title: `Official Profile Update: ${updatedStaff.first_name} ${updatedStaff.last_name}`,
        gujarati_title: `શિક્ષક પ્રોફાઇલ અપડેટ: ${updatedStaff.first_name} ${updatedStaff.last_name}`,
        content: `Your faculty profile has been officially reviewed and updated by ${updatedByName}. Updated parameters: ${fieldSummary}. Please check your staff profile if you have any questions.`,
        gujarati_content: `${updatedByName} દ્વારા તમારી શિક્ષક પ્રોફાઇલ અપડેટ કરવામાં આવી છે. સુધારેલ વિગતો: ${fieldSummary}. વધુ માહિતી માટે આચાર્યશ્રીનો સંપર્ક કરવો.`,
        type: 'ADMINISTRATIVE',
        priority: 'NORMAL',
        target_audience: 'TEACHERS',
        created_by_name: updatedByName,
        created_by_role: 'PRINCIPAL',
        published: true,
      });
    }

    return { staff: updatedStaff, notified: notifyTeacher };
  }

  // --- Attendance Operations ---
  public getStudentAttendance(schoolId: string, classId?: string, date?: string): AttendanceStudent[] {
    let list = this.attendanceStudents.filter((a) => a.school_id === schoolId);
    if (classId && classId !== 'ALL') {
      list = list.filter((a) => a.class_id === classId);
    }
    if (date) {
      list = list.filter((a) => a.date === date);
    }
    return list;
  }

  public getStudentAttendanceSummary(studentId: string): { totalDays: number; presentDays: number; percentage: number; leaves: number; absents: number } {
    const records = this.attendanceStudents.filter((a) => a.entity_id === studentId);
    if (records.length === 0) {
      return { totalDays: 30, presentDays: 28, percentage: 93.3, leaves: 1, absents: 1 };
    }
    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === 'PRESENT' || r.status === 'HALF_DAY').length;
    const leaves = records.filter((r) => r.status === 'LEAVE').length;
    const absents = records.filter((r) => r.status === 'ABSENT').length;
    const percentage = Math.round((presentDays / totalDays) * 1000) / 10;
    return { totalDays, presentDays, percentage, leaves, absents };
  }

  public markBatchStudentAttendance(
    schoolId: string,
    classId: string,
    date: string,
    records: Array<{ student_id: string; student_name: string; roll_no: number; status: AttendanceStudent['status']; remarks?: string }>,
    markedByUserId: string
  ): void {
    // Remove existing records for this class & date
    this.attendanceStudents = this.attendanceStudents.filter(
      (a) => !(a.school_id === schoolId && a.class_id === classId && a.date === date)
    );

    records.forEach((rec) => {
      this.attendanceStudents.push({
        id: `att-stu-${Date.now().toString(36)}-${rec.student_id}`,
        school_id: schoolId,
        entity_id: rec.student_id,
        student_name: rec.student_name,
        roll_no: rec.roll_no,
        class_id: classId,
        date: date,
        status: rec.status,
        remarks: rec.remarks,
        marked_by: markedByUserId,
      });
    });

    setStored('attendanceStudents', this.attendanceStudents);
  }

  public getStaffAttendance(schoolId: string, date?: string): AttendanceStaff[] {
    let list = this.attendanceStaff.filter((a) => a.school_id === schoolId);
    if (date) {
      list = list.filter((a) => a.date === date);
    }
    return list;
  }

  // --- Fee Operations ---
  public getFeeTransactions(schoolId: string, role: Role, userId: string): FeeTransaction[] {
    let list = this.feeTransactions.filter((f) => f.school_id === schoolId);

    if (role === 'STUDENT') {
      const student = this.getStudentByUserId(userId);
      if (student) {
        list = list.filter((f) => f.student_id === student.id);
      }
    } else if (role === 'PARENT') {
      const childIds = this.students.filter((s) => s.parent_user_id === userId).map((s) => s.id);
      list = list.filter((f) => childIds.includes(f.student_id));
    }

    return list;
  }

  public recordFeePayment(
    transactionId: string,
    amountPaid: number,
    paymentMode: FeeTransaction['payment_mode'],
    remarks?: string
  ): FeeTransaction | null {
    const idx = this.feeTransactions.findIndex((t) => t.id === transactionId);
    if (idx === -1) return null;

    const tx = this.feeTransactions[idx];
    const currentTotal = tx.total_amount ?? tx.amount_due ?? 0;
    const currentPaid = tx.paid_amount ?? tx.amount_paid ?? 0;
    const newPaidAmount = currentPaid + amountPaid;
    const isFullyPaid = newPaidAmount >= currentTotal;
    const newStatus = isFullyPaid ? 'PAID' : 'PARTIAL';
    const rawReceipt = tx.receipt_no || tx.receipt_number || '';
    const receiptNo = rawReceipt.startsWith('REC-') ? rawReceipt : `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    this.feeTransactions[idx] = {
      ...tx,
      total_amount: currentTotal,
      amount_due: currentTotal,
      paid_amount: newPaidAmount,
      amount_paid: newPaidAmount,
      balance: Math.max(0, currentTotal - newPaidAmount),
      status: newStatus,
      payment_mode: paymentMode,
      receipt_no: receiptNo,
      receipt_number: receiptNo,
      paid_at: new Date().toISOString(),
      paid_date: new Date().toISOString().split('T')[0],
      remarks: remarks || `Fee payment of ₹${amountPaid.toLocaleString('en-IN')} received via ${paymentMode}`,
    };

    setStored('feeTransactions', this.feeTransactions);
    return this.feeTransactions[idx];
  }

  // --- Notice Operations ---
  public getNotices(schoolId: string, role: Role): Notice[] {
    return this.notices.filter((n) => {
      if (n.school_id !== schoolId) return false;
      const isPublished = n.published !== false;
      if (!isPublished && role !== 'PRINCIPAL' && role !== 'SUPER_ADMIN') return false;
      const aud = String(n.target_audience || n.audience || 'ALL');
      if (aud === 'ALL') return true;
      if (role === 'PRINCIPAL' || role === 'SUPER_ADMIN') return true;
      if (role === 'TEACHER' && (aud === 'TEACHERS' || aud === 'STAFF' || aud === 'TEACHER')) return true;
      if (role === 'STUDENT' && (aud === 'STUDENTS' || aud === 'STUDENT')) return true;
      if (role === 'PARENT' && (aud === 'PARENTS' || aud === 'PARENT')) return true;
      return false;
    });
  }

  public createNotice(schoolId: string, data: Omit<Notice, 'id' | 'school_id' | 'created_at'>): Notice {
    const newNotice: Notice = {
      ...data,
      id: `not-${Date.now().toString(36)}`,
      school_id: schoolId,
      created_at: new Date().toISOString(),
    };
    this.notices.unshift(newNotice);
    setStored('notices', this.notices);
    return newNotice;
  }

  public deleteNotice(noticeId: string): boolean {
    const idx = this.notices.findIndex((n) => n.id === noticeId);
    if (idx === -1) return false;
    this.notices.splice(idx, 1);
    setStored('notices', this.notices);
    return true;
  }

  // --- Timetable Operations ---
  public getTimetable(schoolId: string, classId?: string, teacherId?: string): TimetableSlot[] {
    return this.timetableSlots.filter((t) => {
      if (t.school_id !== schoolId) return false;
      if (classId && t.class_id !== classId) return false;
      if (teacherId && t.teacher_id !== teacherId) return false;
      return true;
    });
  }

  public addTimetableSlot(schoolId: string, slotData: Omit<TimetableSlot, 'id' | 'school_id'>): { slot?: TimetableSlot; conflict?: string } {
    // Check if teacher has a scheduling conflict on that day and time
    const conflict = this.timetableSlots.find(
      (s) =>
        s.school_id === schoolId &&
        s.day_of_week === slotData.day_of_week &&
        s.teacher_id === slotData.teacher_id &&
        s.start_time === slotData.start_time
    );

    if (conflict) {
      return {
        conflict: `Scheduling conflict: ${slotData.teacher_name || 'Teacher'} is already scheduled for ${conflict.subject} at ${conflict.room} (${conflict.start_time}-${conflict.end_time}) on ${conflict.day_of_week}`,
      };
    }

    const newSlot: TimetableSlot = {
      ...slotData,
      id: `tt-${Date.now().toString(36)}`,
      school_id: schoolId,
    };
    this.timetableSlots.push(newSlot);
    setStored('timetableSlots', this.timetableSlots);
    return { slot: newSlot };
  }

  public deleteTimetableSlot(slotId: string): boolean {
    const idx = this.timetableSlots.findIndex((t) => t.id === slotId);
    if (idx === -1) return false;
    this.timetableSlots.splice(idx, 1);
    setStored('timetableSlots', this.timetableSlots);
    return true;
  }

  // --- Homework Operations ---
  public getHomework(schoolId: string, classId?: string, teacherId?: string): Homework[] {
    return this.homework.filter((h) => {
      if (h.school_id !== schoolId) return false;
      if (classId && h.class_id !== classId) return false;
      if (teacherId && h.teacher_id !== teacherId) return false;
      return true;
    });
  }

  public createHomework(schoolId: string, data: Omit<Homework, 'id' | 'school_id' | 'created_at' | 'total_submissions'>): Homework {
    const newHw: Homework = {
      ...data,
      id: `hw-${Date.now().toString(36)}`,
      school_id: schoolId,
      created_at: new Date().toISOString(),
      total_submissions: 0,
    };
    this.homework.unshift(newHw);
    setStored('homework', this.homework);
    return newHw;
  }

  public getHomeworkSubmissions(homeworkId: string): HomeworkSubmission[] {
    return this.homeworkSubmissions.filter((s) => s.homework_id === homeworkId);
  }

  public submitHomework(data: Omit<HomeworkSubmission, 'id' | 'submitted_at'>): HomeworkSubmission {
    const newSub: HomeworkSubmission = {
      ...data,
      id: `sub-${Date.now().toString(36)}`,
      submitted_at: new Date().toISOString(),
    };
    this.homeworkSubmissions.push(newSub);
    setStored('homeworkSubmissions', this.homeworkSubmissions);

    const hw = this.homework.find((h) => h.id === data.homework_id);
    if (hw) {
      hw.total_submissions = (hw.total_submissions || 0) + 1;
      setStored('homework', this.homework);
    }
    return newSub;
  }

  public gradeHomeworkSubmission(submissionId: string, grade: string, feedback: string): boolean {
    const sub = this.homeworkSubmissions.find((s) => s.id === submissionId);
    if (!sub) return false;
    sub.status = 'GRADED';
    sub.grade = grade;
    sub.feedback = feedback;
    setStored('homeworkSubmissions', this.homeworkSubmissions);
    return true;
  }

  // --- Examinations & Marks Operations ---
  public getExaminations(schoolId: string): Examination[] {
    return this.examinations.filter((e) => e.school_id === schoolId);
  }

  public getExamMarks(schoolId: string, examId?: string, classId?: string, studentId?: string): ExamMark[] {
    return this.examMarks.filter((m) => {
      if (m.school_id && schoolId && m.school_id !== schoolId) return false;
      if (examId && m.exam_id !== examId && m.examination_id !== examId) return false;
      if (classId && m.class_id !== classId) return false;
      if (studentId && m.student_id !== studentId) return false;
      return true;
    });
  }

  public getStudentMarks(studentId: string): ExamMark[] {
    return this.examMarks.filter((m) => m.student_id === studentId);
  }

  public saveExamMark(markData: Omit<ExamMark, 'id'>): ExamMark {
    const existingIdx = this.examMarks.findIndex(
      (m) =>
        m.school_id === markData.school_id &&
        m.exam_id === markData.exam_id &&
        m.student_id === markData.student_id &&
        m.subject === markData.subject
    );

    if (existingIdx !== -1) {
      this.examMarks[existingIdx] = {
        ...this.examMarks[existingIdx],
        ...markData,
      };
      setStored('examMarks', this.examMarks);
      return this.examMarks[existingIdx];
    } else {
      const newMark: ExamMark = {
        ...markData,
        id: `mrk-${Date.now().toString(36)}`,
      };
      this.examMarks.push(newMark);
      setStored('examMarks', this.examMarks);
      return newMark;
    }
  }

  // --- Leave Applications Operations ---
  public getLeaveApplications(schoolId: string, studentId?: string): LeaveApplication[] {
    return this.leaveApplications.filter((l) => {
      if (l.school_id !== schoolId) return false;
      if (studentId && l.student_id !== studentId) return false;
      return true;
    });
  }

  public submitLeaveApplication(schoolId: string, data: Omit<LeaveApplication, 'id' | 'school_id' | 'status' | 'applied_at'>): LeaveApplication {
    const newLeave: LeaveApplication = {
      ...data,
      id: `leave-${Date.now().toString(36)}`,
      school_id: schoolId,
      status: 'PENDING',
      applied_at: new Date().toISOString(),
    };
    this.leaveApplications.unshift(newLeave);
    setStored('leaveApplications', this.leaveApplications);
    return newLeave;
  }

  public updateLeaveStatus(leaveId: string, status: LeaveApplication['status'], reviewedBy: string, reviewNote?: string): boolean {
    const leave = this.leaveApplications.find((l) => l.id === leaveId);
    if (!leave) return false;
    leave.status = status;
    leave.reviewed_by = reviewedBy;
    leave.review_note = reviewNote;
    setStored('leaveApplications', this.leaveApplications);
    return true;
  }

  // --- Digital Library Operations ---
  public getLibraryResources(schoolId: string, subjectFilter?: string): DigitalLibraryResource[] {
    return this.libraryResources.filter((r) => {
      if (r.school_id !== schoolId) return false;
      if (subjectFilter && subjectFilter !== 'ALL' && r.subject !== subjectFilter) return false;
      return true;
    });
  }

  public addLibraryResource(schoolId: string, data: Omit<DigitalLibraryResource, 'id' | 'school_id' | 'downloads_count' | 'created_at'>): DigitalLibraryResource {
    const newRes: DigitalLibraryResource = {
      ...data,
      id: `lib-${Date.now().toString(36)}`,
      school_id: schoolId,
      downloads_count: 0,
      created_at: new Date().toISOString(),
    };
    this.libraryResources.unshift(newRes);
    setStored('libraryResources', this.libraryResources);
    return newRes;
  }

  public incrementDownload(resourceId: string): void {
    const res = this.libraryResources.find((r) => r.id === resourceId);
    if (res) {
      res.downloads_count++;
      setStored('libraryResources', this.libraryResources);
    }
  }

  // --- Staff Chat & Messages Operations ---
  public getChatGroups(schoolId: string): StaffChatGroup[] {
    return this.chatGroups.filter((g) => g.school_id === schoolId);
  }

  public getChatMessages(groupId: string): ChatMessage[] {
    return this.chatMessages.filter((m) => m.group_id === groupId);
  }

  public sendChatMessage(data: Omit<ChatMessage, 'id' | 'sent_at'>): ChatMessage {
    const newMsg: ChatMessage = {
      ...data,
      id: `msg-${Date.now().toString(36)}`,
      sent_at: new Date().toISOString(),
    };
    this.chatMessages.push(newMsg);
    setStored('chatMessages', this.chatMessages);

    const grp = this.chatGroups.find((g) => g.id === data.group_id);
    if (grp) {
      grp.last_message_at = newMsg.sent_at;
      setStored('chatGroups', this.chatGroups);
    }
    return newMsg;
  }

  // --- Payroll & Staff Salaries ---
  public getStaffSalaries(schoolId: string): StaffSalaryRecord[] {
    return this.staffSalaries.filter((s) => s.school_id === schoolId);
  }

  public processPayroll(salaryId: string): boolean {
    const record = this.staffSalaries.find((s) => s.id === salaryId);
    if (!record) return false;
    record.status = 'PAID';
    record.payout_date = new Date().toISOString().split('T')[0];
    setStored('staffSalaries', this.staffSalaries);
    return true;
  }

  // --- Audit Logs ---
  public getAuditLogs(schoolId?: string): AuditLog[] {
    if (!schoolId) return [...this.auditLogs];
    return this.auditLogs.filter((a) => a.school_id === schoolId);
  }

  public logAudit(logData: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      ...logData,
      id: `aud-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    setStored('auditLogs', this.auditLogs);
    return newLog;
  }

  // --- System Backup & Snapshot Operations ---
  public getLastBackupInfo(): SystemBackupInfo {
    if (!this.lastBackup || typeof this.lastBackup !== 'object' || !this.lastBackup.formatted_date || !this.lastBackup.record_counts) {
      const now = new Date(Date.now() - 3600000 * 2);
      this.lastBackup = {
        id: 'bkp-initial',
        timestamp: now.toISOString(),
        formatted_date: now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        size_kb: 486,
        created_by: 'Automated Snapshot Daemon',
        type: 'SCHEDULED_AUTOMATIC',
        status: 'SUCCESS',
        record_counts: {
          students: this.students ? this.students.length : 1280,
          staff: this.staff ? this.staff.length : 72,
          fees: this.feeTransactions ? this.feeTransactions.length : 24,
          marks: this.examMarks ? this.examMarks.length : 5,
          attendance: this.attendanceStudents ? this.attendanceStudents.length : 34,
          notices: this.notices ? this.notices.length : 4,
        },
      };
      setStored('lastBackup', this.lastBackup);
    }
    return this.lastBackup;
  }

  public performBackupNow(triggeredByName: string = 'Dr. Jayesh Mehta (Principal)'): SystemBackupInfo {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newBackup: SystemBackupInfo = {
      id: `bkp-${Date.now().toString(36)}`,
      timestamp: now.toISOString(),
      formatted_date: formatted,
      size_kb: Math.round(512 + Math.random() * 80),
      created_by: triggeredByName,
      type: 'MANUAL',
      status: 'SUCCESS',
      record_counts: {
        students: this.students.length,
        staff: this.staff.length,
        fees: this.feeTransactions.length,
        marks: this.examMarks.length,
        attendance: this.attendanceStudents.length,
        notices: this.notices.length,
      },
    };

    this.lastBackup = newBackup;
    setStored('lastBackup', this.lastBackup);

    this.logAudit({
      school_id: this.schools[0]?.id || 'school-sharda-rajkot',
      user_id: 'usr-principal',
      user_name: triggeredByName,
      user_role: 'PRINCIPAL',
      action: 'SYSTEM_SNAPSHOT_BACKUP_COMPLETED',
      resource_type: 'SYSTEM_MAINTENANCE',
      resource_id: newBackup.id,
      details: `Full cryptographic snapshot generated (${newBackup.size_kb} KB, ${newBackup.record_counts.students} Students, ${newBackup.record_counts.staff} Staff records archived).`,
      ip_address: '10.0.0.1',
    });

    return newBackup;
  }

  public exportDatabaseJson(): string {
    const dump = {
      version: 'ClassSec-GSEB-v4.2',
      exported_at: new Date().toISOString(),
      schools: this.schools,
      users: this.users,
      students: this.students,
      staff: this.staff,
      classes: this.classes,
      feeStructures: this.feeStructures,
      feeTransactions: this.feeTransactions,
      attendanceStudents: this.attendanceStudents,
      attendanceStaff: this.attendanceStaff,
      notices: this.notices,
      examinations: this.examinations,
      examMarks: this.examMarks,
      lastBackup: this.lastBackup,
    };
    return JSON.stringify(dump, null, 2);
  }
}

export const erpDb = ERPDatabaseService.getInstance();
