import {
  Department,
  Employee,
  EmployeeRateHistory,
  AttendanceSession,
  AttendanceStatusRecord,
  OvertimeSession,
  CompanySettings,
  CashAdvanceTransaction,
  KasbonEmployeeBalance,
  PayrollPeriod,
  PayrollRecord,
  EmployeeNote,
  AuditLog,
  OperationalSummary,
  UserRole,
  ConsistencyAuditReport,
} from '../types/index.ts';

let currentRole: UserRole = 'ADMIN';
let currentUserName: string = 'Administrator';

export function setApiRole(role: UserRole, name?: string) {
  currentRole = role;
  currentUserName = name || (role === 'ADMIN' ? 'Administrator' : role === 'OPERATOR' ? 'Operator Input' : 'Kiosk Terminal');
}

export function getApiRole(): UserRole {
  return currentRole;
}

export function getApiUserName(): string {
  return currentUserName;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('x-user-role', currentRole);
  headers.set('x-user-name', currentUserName);

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Permintaan gagal (${response.status}): ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Summary & Settings
  getSummary: () => request<OperationalSummary>('/api/summary'),
  getSettings: () => request<CompanySettings>('/api/settings'),
  updateSettings: (settings: Partial<CompanySettings>) =>
    request<CompanySettings>('/api/settings', { method: 'POST', body: JSON.stringify(settings) }),
  verifyAdminPin: (pin: string) =>
    request<{ success: boolean; message: string }>('/api/auth/verify-admin-pin', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    }),

  // Departments
  getDepartments: () => request<Department[]>('/api/departments'),
  addDepartment: (name: string, code: string) =>
    request<Department>('/api/departments', { method: 'POST', body: JSON.stringify({ name, code }) }),

  // Employees
  getEmployees: () => request<Employee[]>('/api/employees'),
  getEmployeeById: (id: string) => request<Employee>(`/api/employees/${id}`),
  saveEmployee: (emp: Partial<Employee> & { default_pay_items?: any[] }) =>
    request<Employee>('/api/employees', { method: 'POST', body: JSON.stringify(emp) }),
  getRateHistory: (employee_id?: string) =>
    request<EmployeeRateHistory[]>(`/api/employees/rate-history${employee_id ? `?employee_id=${employee_id}` : ''}`),

  // Attendance
  getAttendance: (date?: string) =>
    request<AttendanceSession[]>(`/api/attendance${date ? `?date=${date}` : ''}`),
  getAttendanceStatus: (date?: string) =>
    request<AttendanceStatusRecord[]>(`/api/attendance/status${date ? `?date=${date}` : ''}`),
  clockIn: (employee_id: string, source: 'INTERNAL' | 'PUBLIC_KIOSK' = 'INTERNAL', custom_work_date?: string) =>
    request<AttendanceSession>('/api/attendance/clock-in', {
      method: 'POST',
      body: JSON.stringify({ employee_id, source, custom_work_date }),
    }),
  clockOut: (employee_id: string, early_checkout_reason?: string, admin_pin?: string) =>
    request<AttendanceSession>('/api/attendance/clock-out', {
      method: 'POST',
      body: JSON.stringify({ employee_id, early_checkout_reason, admin_pin }),
    }),
  recordStatus: (employee_id: string, date: string, status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ABSEN', notes?: string) =>
    request<AttendanceStatusRecord>('/api/attendance/status', {
      method: 'POST',
      body: JSON.stringify({ employee_id, date, status, notes }),
    }),

  // Overtime
  getOvertime: (date?: string) =>
    request<OvertimeSession[]>(`/api/overtime${date ? `?date=${date}` : ''}`),
  startOvertime: (employee_id: string, notes: string) =>
    request<OvertimeSession>('/api/overtime/start', {
      method: 'POST',
      body: JSON.stringify({ employee_id, notes }),
    }),
  endOvertime: (employee_id: string) =>
    request<OvertimeSession>('/api/overtime/end', {
      method: 'POST',
      body: JSON.stringify({ employee_id }),
    }),

  // Kasbon (Cash Advances)
  getKasbonBalances: () => request<KasbonEmployeeBalance[]>('/api/kasbon/balances'),
  getKasbonTransactions: (employee_id?: string) =>
    request<CashAdvanceTransaction[]>(`/api/kasbon/transactions${employee_id ? `?employee_id=${employee_id}` : ''}`),
  addKasbonTransaction: (tx: Omit<CashAdvanceTransaction, 'id' | 'created_by'>) =>
    request<CashAdvanceTransaction>('/api/kasbon/transactions', {
      method: 'POST',
      body: JSON.stringify(tx),
    }),

  // Payroll & Closing
  getPayrollPeriods: () => request<PayrollPeriod[]>('/api/payroll/periods'),
  validatePeriodConsistency: (period_start: string, period_end: string) =>
    request<ConsistencyAuditReport>('/api/payroll/validate-consistency', {
      method: 'POST',
      body: JSON.stringify({ period_start, period_end }),
    }),
  previewPayroll: (period_start: string, period_end: string) =>
    request<{
      period_start: string;
      period_end: string;
      open_attendance_count: number;
      open_overtime_count: number;
      open_sessions: any[];
      records: Array<PayrollRecord & { current_kasbon_balance: number }>;
    }>('/api/payroll/preview', {
      method: 'POST',
      body: JSON.stringify({ period_start, period_end }),
    }),
  closePeriod: (
    period_start: string,
    period_end: string,
    notes: string,
    adjusted_deductions: Record<string, number>
  ) =>
    request<PayrollPeriod>('/api/payroll/close', {
      method: 'POST',
      body: JSON.stringify({ period_start, period_end, notes, adjusted_deductions }),
    }),
  reopenPeriod: (period_id: string, admin_pin: string, reason: string) =>
    request<PayrollPeriod>('/api/payroll/reopen', {
      method: 'POST',
      body: JSON.stringify({ period_id, admin_pin, reason }),
    }),
  getPayrollRecords: (period_id: string) =>
    request<PayrollRecord[]>(`/api/payroll/records/${period_id}`),
  setPaymentStatus: (record_id: string, status: 'PENDING' | 'PAID') =>
    request<PayrollRecord>(`/api/payroll/records/${record_id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  // Notes
  getNotes: (employee_id: string) => request<EmployeeNote[]>(`/api/notes/${employee_id}`),
  addNote: (employee_id: string, note: string) =>
    request<EmployeeNote>('/api/notes', {
      method: 'POST',
      body: JSON.stringify({ employee_id, note }),
    }),

  // Audit
  getAuditLogs: () => request<AuditLog[]>('/api/audit'),
};
