export type Role = 'SUPER_ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT' | 'PARENT';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface School {
  id: string;
  name: string;
  gujarati_name?: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  affiliationNumber: string; // e.g. "GSEB/PVT/SF/RAJ-4821"
  udiseCode?: string; // e.g. "24090104512"
  boardType?: 'GSEB' | 'CBSE' | 'STATE_BOARD';
  gseb_index?: string; // e.g. "64.082" (GSEB Index Number)
  is_self_financed?: boolean; // True for private self-financed schools
  mediums?: ('GUJARATI' | 'ENGLISH')[];
  establishedYear: number;
  totalStudents: number;
  totalStaff: number;
  plan: 'ENTERPRISE' | 'PRO' | 'STARTER';
  created_at: string;
}

export interface User {
  id: string;
  school_id: string;
  email: string;
  role: Role;
  status: UserStatus;
  full_name: string;
  gujarati_name?: string;
  avatar_url?: string;
  phone?: string;
  mfa_enabled?: boolean;
  last_login?: string;
  created_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  gr_number: string; // General Register (G.R. No.) e.g. "GR-4821"
  admission_no?: string; // e.g. "ADM/2026/098"
  user_id: string;
  first_name: string;
  last_name: string;
  gujarati_name?: string; // e.g. "હર્ષ વિનોદભાઈ પટેલ"
  class_id: string;
  roll_no: number;
  medium?: 'GUJARATI' | 'ENGLISH';
  parent_user_id: string;
  parent_name: string;
  father_name?: string;
  mother_name?: string;
  parent_phone: string;
  dob: string;
  birth_place?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  blood_group: string;
  address: string;
  admission_date: string;
  category?: 'GEN' | 'OBC' | 'SC' | 'ST' | 'EWS';
  caste?: string; // e.g. "Patel (Kadva)", "Luhar", "Brahmin"
  pen_number?: string; // Permanent Education Number / Aadhar DISE Child ID
  transport_route?: string;
  status: 'ENROLLED' | 'ALUMNI' | 'TRANSFERRED';
  emergency_contact: string;
}

export interface Staff {
  id: string;
  school_id: string;
  user_id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  gujarati_name?: string;
  designation: string;
  department: string;
  qualification: string;
  base_salary: number;
  joining_date: string;
  phone: string;
  assigned_classes?: string[];
  specialization_subjects?: string[];
}

export interface SchoolClass {
  id: string;
  school_id: string;
  standard: string; // e.g., "10", "9", "8", "11-Sci", "12-Com"
  division: string; // e.g., "A", "B", "C"
  name: string; // "Class 10th-A (ધોરણ ૧૦-અ)"
  medium?: 'GUJARATI' | 'ENGLISH';
  stream?: 'GENERAL' | 'SCIENCE' | 'COMMERCE' | 'ARTS';
  class_teacher_id: string;
  class_teacher_name?: string;
  room_number: string;
  capacity: number;
  enrolled_count: number;
}

export type FeeStatus = 'PAID' | 'PARTIAL' | 'DUE' | 'OVERDUE';
export type PaymentMode = 'ONLINE' | 'CASH' | 'CHEQUE' | 'BANK_TRANSFER' | 'UPI';

export interface FeeStructure {
  id: string;
  school_id: string;
  class_id: string;
  fee_head?: string; // "Tuition Fee", "Lab Fee", "Annual Activity"
  name?: string;
  tuition_fee?: number;
  term_fee?: number;
  admission_fee?: number;
  exam_fee?: number;
  computer_fee?: number;
  activity_fee?: number;
  transport_fee?: number;
  total_amount?: number;
  frequency?: string;
  amount?: number;
  due_date?: string;
  academic_year: string;
}

export interface FeeTransaction {
  id: string;
  school_id: string;
  student_id: string;
  student_name: string;
  gr_number: string;
  class_id?: string;
  class_name: string;
  fee_structure_id?: string;
  invoice_number?: string;
  amount_due?: number;
  amount_paid?: number;
  discount_amount?: number;
  fine_amount?: number;
  balance?: number;
  total_amount?: number;
  paid_amount?: number;
  due_date: string;
  status: FeeStatus;
  payment_mode?: PaymentMode;
  receipt_no?: string;
  receipt_number?: string;
  transaction_reference?: string;
  paid_at?: string;
  paid_date?: string;
  collected_by?: string;
  term?: string;
  remarks?: string;
  fee_breakdown?: { head: string; amount: number }[];
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HALF_DAY';

export interface AttendanceStudent {
  id: string;
  school_id: string;
  entity_id?: string; // student_id
  student_id?: string;
  student_name?: string;
  roll_no?: number;
  class_id: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  sms_sent?: boolean;
  remarks?: string;
  marked_by?: string;
}

export interface AttendanceStaff {
  id: string;
  school_id: string;
  entity_id?: string; // staff_id
  staff_name?: string;
  designation?: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
  check_in?: string;
  check_out?: string;
  biometric_device_id?: string;
}

export type TargetAudience = 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'PARENT' | 'STAFF' | 'TEACHER' | 'STUDENT';

export interface Notice {
  id: string;
  school_id: string;
  created_by?: string;
  creator_name?: string;
  creator_role?: Role;
  created_by_name?: string;
  created_by_role?: string;
  title: string;
  gujarati_title?: string;
  content: string;
  gujarati_content?: string;
  type?: string;
  target_audience?: TargetAudience;
  audience?: TargetAudience;
  published_by?: string;
  is_urgent?: boolean;
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  category?: 'ACADEMIC' | 'ADMINISTRATIVE' | 'EVENT' | 'EXAMINATION' | 'HOLIDAY';
  published?: boolean;
  created_at?: string;
  date?: string;
  attachment_name?: string;
}

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export interface TimetableSlot {
  id: string;
  school_id: string;
  class_id: string;
  teacher_id: string;
  teacher_name?: string;
  subject: string;
  day_of_week: DayOfWeek;
  period_number?: number;
  start_time: string; // "08:30"
  end_time: string; // "09:15"
  room: string;
}

export interface Homework {
  id: string;
  school_id: string;
  class_id: string;
  class_name?: string;
  teacher_id: string;
  teacher_name?: string;
  subject: string;
  title: string;
  description: string;
  submission_deadline?: string;
  due_date?: string;
  assigned_date?: string;
  total_marks?: number;
  attachments_url?: string;
  created_at?: string;
  total_submissions?: number;
}

export interface HomeworkSubmission {
  id: string;
  homework_id: string;
  student_id: string;
  student_name: string;
  submitted_at?: string;
  submission_date?: string;
  status: 'SUBMITTED' | 'GRADED' | 'LATE';
  marks_awarded?: number;
  grade?: string;
  feedback?: string;
  teacher_feedback?: string;
  attachment_name?: string;
}

export interface Examination {
  id: string;
  school_id: string;
  exam_name?: string; // e.g. "Term 1 Midterm Exam 2026"
  name?: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  status?: 'UPCOMING' | 'ONGOING' | 'PUBLISHED';
}

export interface ExamMark {
  id: string;
  school_id?: string;
  exam_id?: string;
  examination_id?: string;
  exam_name?: string;
  class_id?: string;
  subject: string;
  student_id: string;
  student_name?: string;
  roll_no?: number;
  marks_obtained: number;
  max_marks: number;
  grade: string; // "A+", "A", "B", etc.
  remarks?: string;
}

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveApplication {
  id: string;
  school_id: string;
  student_id?: string;
  user_id?: string;
  user_role?: Role;
  student_name?: string;
  user_name?: string;
  applicant_name?: string;
  class_id?: string;
  class_name?: string;
  parent_name?: string;
  leave_type?: string;
  reason: string;
  start_date: string;
  end_date: string;
  status: LeaveStatus;
  reviewed_by?: string;
  approved_by?: string;
  review_note?: string;
  applied_at?: string;
  applied_on?: string;
}

export interface StaffChatGroup {
  id: string;
  school_id: string;
  group_name?: string;
  name?: string;
  department?: string;
  description: string;
  members_count?: number;
  members?: string[];
  created_by?: string;
  last_message_at?: string;
}

export interface ChatMessage {
  id: string;
  school_id?: string;
  group_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: Role;
  message_text?: string;
  content?: string;
  sent_at?: string;
  timestamp?: string;
}

export interface DigitalLibraryResource {
  id: string;
  school_id: string;
  title: string;
  subject: string;
  class_target?: string; // e.g., "Grade 10", "Grade 9", "All"
  class_id?: string;
  file_url?: string;
  download_url?: string;
  tags?: string[];
  file_type: 'PDF' | 'EPUB' | 'DOCX' | 'VIDEO' | 'WORKSHEET';
  file_size: string;
  author: string;
  downloads_count?: number;
  created_at?: string;
}

export interface StaffSalaryRecord {
  id: string;
  school_id: string;
  staff_id: string;
  staff_name: string;
  employee_code: string;
  designation: string;
  month: string; // "August 2026"
  base_salary: number;
  working_days: number;
  present_days: number;
  leave_deduction: number;
  bonus: number;
  tax_deduction: number;
  net_salary: number;
  status: 'PROCESSED' | 'PAID' | 'PENDING';
  payout_date?: string;
  payment_date?: string;
  payment_mode?: string;
  remarks?: string;
}

export interface AuditLog {
  id: string;
  school_id: string;
  user_id: string;
  user_name: string;
  user_role: Role;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: string;
  ip_address: string;
  timestamp: string;
}

export interface SystemBackupInfo {
  id: string;
  timestamp: string;
  formatted_date: string;
  size_kb: number;
  created_by: string;
  type: 'MANUAL' | 'SCHEDULED_AUTOMATIC';
  status: 'SUCCESS' | 'IN_PROGRESS' | 'FAILED';
  record_counts: {
    students: number;
    staff: number;
    fees: number;
    marks: number;
    attendance: number;
    notices: number;
  };
}
