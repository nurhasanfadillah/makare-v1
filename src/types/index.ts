export type UserRole = 'ADMIN' | 'OPERATOR' | 'KIOSK';

export type SalaryMode = 'HOURLY' | 'MANUAL';

export interface Department {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface EmployeeDefaultPayItem {
  id: string;
  employee_id: string;
  description: string;
  amount: number;
  item_type: 'ALLOWANCE' | 'DEDUCTION';
}

export interface Employee {
  id: string;
  employee_code: string;
  name: string;
  address: string;
  gender: 'L' | 'P';
  birth_date: string;
  national_id_masked: string;
  phone: string;
  department_id: string;
  department_name?: string;
  join_date: string;
  salary_mode: SalaryMode;
  default_hourly_rate: number;
  default_overtime_rate: number;
  is_active: boolean;
  created_at: string;
  default_pay_items?: EmployeeDefaultPayItem[];
}

export interface EmployeeRateHistory {
  id: string;
  employee_id: string;
  employee_name?: string;
  old_rate: number;
  new_rate: number;
  rate_type: 'HOURLY' | 'OVERTIME';
  effective_date: string;
  reason?: string;
  changed_by: string;
}

export interface AttendanceSession {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_code?: string;
  department_name?: string;
  work_date: string;
  check_in_at: string;
  check_out_at?: string | null;
  hourly_rate_snapshot: number;
  duration_minutes: number;
  source: 'INTERNAL' | 'PUBLIC_KIOSK';
  is_late?: boolean;
  late_minutes?: number;
  early_checkout_reason?: string;
  early_checkout_authorized_by?: string;
  created_by: string;
}

export interface ConsistencyAuditCheck {
  id: string;
  title: string;
  category: 'SESSIONS' | 'PERIOD_DATES' | 'KASBON' | 'SNAPSHOTS' | 'NET_PAY';
  status: 'PASS' | 'WARNING' | 'BLOCKER';
  message: string;
  details?: string[];
}

export interface ConsistencyAuditReport {
  can_close: boolean;
  blockers_count: number;
  warnings_count: number;
  checks: ConsistencyAuditCheck[];
  summary: string;
}

export interface AttendanceStatusRecord {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_code?: string;
  department_name?: string;
  date: string;
  status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ABSEN';
  notes?: string;
  created_by: string;
}

export interface OvertimeSession {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_code?: string;
  department_name?: string;
  work_date: string;
  start_at: string;
  end_at?: string | null;
  overtime_rate_snapshot: number;
  duration_minutes: number;
  notes: string;
  created_by: string;
}

export interface CompanySettings {
  company_name: string;
  company_address: string;
  company_phone: string;
  work_days: string[];
  start_time: string;
  end_time: string;
  late_tolerance_minutes: number;
  overtime_enabled: boolean;
  admin_pin: string;
  timezone: string;
}

export type KasbonType = 'ISSUED' | 'PAYROLL_DEDUCTION' | 'REPAYMENT' | 'REVERSAL';

export interface CashAdvanceTransaction {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_code?: string;
  date: string;
  type: KasbonType;
  amount: number;
  notes: string;
  payroll_period_id?: string;
  reversal_ref_id?: string;
  created_by: string;
}

export interface KasbonEmployeeBalance {
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department_name: string;
  total_issued: number;
  total_deducted: number;
  total_repaid: number;
  total_reversed: number;
  current_balance: number;
  last_transaction_date?: string;
}

export interface PayrollPeriod {
  id: string;
  period_start: string;
  period_end: string;
  status: 'DRAFT' | 'REVIEW' | 'CLOSED';
  closed_at?: string;
  closed_by?: string;
  notes?: string;
  reopened_at?: string;
  reopened_by?: string;
  reopen_reason?: string;
}

export interface PayrollItem {
  id: string;
  payroll_record_id: string;
  description: string;
  amount: number;
  type: 'BASE' | 'OVERTIME' | 'ALLOWANCE' | 'DEDUCTION';
}

export interface PayrollRecord {
  id: string;
  payroll_period_id: string;
  employee_id: string;
  employee_name?: string;
  employee_code?: string;
  department_name?: string;
  salary_mode: SalaryMode;
  total_regular_hours: number;
  total_overtime_hours: number;
  regular_pay: number;
  overtime_pay: number;
  manual_allowances: number;
  gross_pay: number;
  cash_advance_deduction: number;
  other_deductions: number;
  net_pay: number;
  payment_status: 'PENDING' | 'PAID';
  paid_at?: string;
  items?: PayrollItem[];
}

export interface EmployeeNote {
  id: string;
  employee_id: string;
  note: string;
  author: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  payload_summary: string;
  performed_by: string;
  timestamp: string;
}

export interface OperationalSummary {
  total_employees: number;
  active_employees: number;
  checked_in_today: number;
  open_sessions_count: number;
  overtime_sessions_today: number;
  total_active_kasbon: number;
  active_period: PayrollPeriod | null;
  overtime_enabled: boolean;
  company_settings: CompanySettings;
}
