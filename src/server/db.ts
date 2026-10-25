import fs from 'fs';
import path from 'path';
import {
  Department,
  Employee,
  EmployeeRateHistory,
  EmployeeDefaultPayItem,
  AttendanceSession,
  AttendanceStatusRecord,
  OvertimeSession,
  CompanySettings,
  CashAdvanceTransaction,
  KasbonEmployeeBalance,
  PayrollPeriod,
  PayrollRecord,
  PayrollItem,
  EmployeeNote,
  AuditLog,
  OperationalSummary,
  SalaryMode,
  ConsistencyAuditReport,
  ConsistencyAuditCheck,
} from '../types/index.ts';

interface DatabaseSchema {
  departments: Department[];
  employees: Employee[];
  rate_history: EmployeeRateHistory[];
  default_pay_items: EmployeeDefaultPayItem[];
  attendance_sessions: AttendanceSession[];
  attendance_status_records: AttendanceStatusRecord[];
  overtime_sessions: OvertimeSession[];
  company_settings: CompanySettings;
  cash_advance_transactions: CashAdvanceTransaction[];
  payroll_periods: PayrollPeriod[];
  payroll_records: PayrollRecord[];
  payroll_items: PayrollItem[];
  employee_notes: EmployeeNote[];
  audit_logs: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'makare_database.json');

// Initial seed data generator
function createInitialDatabase(): DatabaseSchema {
  const departments: Department[] = [
    { id: 'dept-1', name: 'Produksi & Jahit', code: 'PRD', created_at: '2026-01-01T08:00:00Z' },
    { id: 'dept-2', name: 'Finishing & QC', code: 'FNS', created_at: '2026-01-01T08:00:00Z' },
    { id: 'dept-3', name: 'Gudang & Logistik', code: 'GDG', created_at: '2026-01-01T08:00:00Z' },
    { id: 'dept-4', name: 'Kantor & HRD', code: 'ADM', created_at: '2026-01-01T08:00:00Z' },
  ];

  const employees: Employee[] = [
    {
      id: 'emp-1',
      employee_code: 'MK-001',
      name: 'Ahmad Fauzi',
      address: 'Jl. Merdeka No. 42, Bandung',
      gender: 'L',
      birth_date: '1992-05-14',
      national_id_masked: '3273*********001',
      phone: '081234567890',
      department_id: 'dept-1',
      join_date: '2024-02-01',
      salary_mode: 'HOURLY',
      default_hourly_rate: 25000,
      default_overtime_rate: 35000,
      is_active: true,
      created_at: '2024-02-01T08:00:00Z',
    },
    {
      id: 'emp-2',
      employee_code: 'MK-002',
      name: 'Budi Santoso',
      address: 'Kp. Sukamaju RT 03/05, Cimahi',
      gender: 'L',
      birth_date: '1995-11-20',
      national_id_masked: '3273*********002',
      phone: '081298765432',
      department_id: 'dept-1',
      join_date: '2024-03-15',
      salary_mode: 'HOURLY',
      default_hourly_rate: 24000,
      default_overtime_rate: 34000,
      is_active: true,
      created_at: '2024-03-15T08:00:00Z',
    },
    {
      id: 'emp-3',
      employee_code: 'MK-003',
      name: 'Siti Rahmawati',
      address: 'Jl. Pasirkaliki No. 110, Bandung',
      gender: 'P',
      birth_date: '1990-08-08',
      national_id_masked: '3273*********003',
      phone: '085712345678',
      department_id: 'dept-2',
      join_date: '2023-11-01',
      salary_mode: 'MANUAL',
      default_hourly_rate: 0,
      default_overtime_rate: 30000,
      is_active: true,
      created_at: '2023-11-01T08:00:00Z',
    },
    {
      id: 'emp-4',
      employee_code: 'MK-004',
      name: 'Dewi Anggraini',
      address: 'Komplek Permata Biru Blok C4, Bandung',
      gender: 'P',
      birth_date: '1998-03-25',
      national_id_masked: '3273*********004',
      phone: '087812349900',
      department_id: 'dept-3',
      join_date: '2024-06-01',
      salary_mode: 'HOURLY',
      default_hourly_rate: 22000,
      default_overtime_rate: 30000,
      is_active: true,
      created_at: '2024-06-01T08:00:00Z',
    },
    {
      id: 'emp-5',
      employee_code: 'MK-005',
      name: 'Hendra Wijaya',
      address: 'Jl. Riau No. 88, Bandung',
      gender: 'L',
      birth_date: '1988-12-10',
      national_id_masked: '3273*********005',
      phone: '081399887766',
      department_id: 'dept-4',
      join_date: '2023-05-10',
      salary_mode: 'MANUAL',
      default_hourly_rate: 0,
      default_overtime_rate: 0,
      is_active: true,
      created_at: '2023-05-10T08:00:00Z',
    },
    {
      id: 'emp-6',
      employee_code: 'MK-006',
      name: 'Rahmat Hidayat',
      address: 'Jl. Cikutra Timur No. 19, Bandung',
      gender: 'L',
      birth_date: '1997-07-04',
      national_id_masked: '3273*********006',
      phone: '082111223344',
      department_id: 'dept-1',
      join_date: '2024-08-01',
      salary_mode: 'HOURLY',
      default_hourly_rate: 23000,
      default_overtime_rate: 32000,
      is_active: true,
      created_at: '2024-08-01T08:00:00Z',
    },
  ];

  const default_pay_items: EmployeeDefaultPayItem[] = [
    { id: 'item-1', employee_id: 'emp-3', description: 'Gaji Pokok Bulanan', amount: 3200000, item_type: 'ALLOWANCE' },
    { id: 'item-2', employee_id: 'emp-3', description: 'Tunjangan Transport & Makan', amount: 450000, item_type: 'ALLOWANCE' },
    { id: 'item-3', employee_id: 'emp-5', description: 'Gaji Pokok Supervisor', amount: 4800000, item_type: 'ALLOWANCE' },
    { id: 'item-4', employee_id: 'emp-5', description: 'Tunjangan Jabatan', amount: 750000, item_type: 'ALLOWANCE' },
  ];

  const company_settings: CompanySettings = {
    company_name: 'PT MAKARE NUSANTARA INDONESIA',
    company_address: 'Kawasan Industri Batujajar KM 2.5 No. 88, Bandung Barat, Jawa Barat',
    company_phone: '(022) 686-7788',
    work_days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    start_time: '08:00',
    end_time: '17:00',
    late_tolerance_minutes: 15,
    overtime_enabled: true,
    admin_pin: process.env.ADMIN_MASTER_PIN || '8899',
    timezone: 'Asia/Jakarta',
  };

  const cash_advance_transactions: CashAdvanceTransaction[] = [
    {
      id: 'kasbon-1',
      employee_id: 'emp-1',
      date: '2026-10-15',
      type: 'ISSUED',
      amount: 600000,
      notes: 'Pinjaman biaya berobat keluarga',
      created_by: 'Administrator',
    },
    {
      id: 'kasbon-2',
      employee_id: 'emp-4',
      date: '2026-10-18',
      type: 'ISSUED',
      amount: 350000,
      notes: 'Pinjaman perbaikan motor harian',
      created_by: 'Administrator',
    },
  ];

  // Past closed period (Bulan lalu)
  const payroll_periods: PayrollPeriod[] = [
    {
      id: 'period-closed-1',
      period_start: '2026-09-26',
      period_end: '2026-10-10',
      status: 'CLOSED',
      closed_at: '2026-10-10T19:30:00Z',
      closed_by: 'Administrator',
      notes: 'Periode Penggajian Reguler Awal Oktober',
    },
    {
      id: 'period-active',
      period_start: '2026-10-11',
      period_end: '2026-10-25',
      status: 'DRAFT',
      notes: 'Periode Berjalan (Batas Akhir 25 Oktober 2026)',
    },
  ];

  const today = '2026-10-24';
  const attendance_sessions: AttendanceSession[] = [
    {
      id: 'att-1',
      employee_id: 'emp-1',
      work_date: today,
      check_in_at: '2026-10-24T07:55:00+07:00',
      check_out_at: null,
      hourly_rate_snapshot: 25000,
      duration_minutes: 0,
      source: 'PUBLIC_KIOSK',
      created_by: 'Kiosk',
    },
    {
      id: 'att-2',
      employee_id: 'emp-2',
      work_date: today,
      check_in_at: '2026-10-24T08:05:00+07:00',
      check_out_at: null,
      hourly_rate_snapshot: 24000,
      duration_minutes: 0,
      source: 'PUBLIC_KIOSK',
      created_by: 'Kiosk',
    },
    {
      id: 'att-3',
      employee_id: 'emp-4',
      work_date: today,
      check_in_at: '2026-10-24T08:00:00+07:00',
      check_out_at: '2026-10-24T17:05:00+07:00',
      hourly_rate_snapshot: 22000,
      duration_minutes: 545,
      source: 'PUBLIC_KIOSK',
      created_by: 'Kiosk',
    },
    // Past dates in active period for realistic payroll calculation
    {
      id: 'att-hist-1',
      employee_id: 'emp-1',
      work_date: '2026-10-20',
      check_in_at: '2026-10-20T08:00:00+07:00',
      check_out_at: '2026-10-20T17:00:00+07:00',
      hourly_rate_snapshot: 25000,
      duration_minutes: 540, // 9 hours
      source: 'PUBLIC_KIOSK',
      created_by: 'Kiosk',
    },
    {
      id: 'att-hist-2',
      employee_id: 'emp-1',
      work_date: '2026-10-21',
      check_in_at: '2026-10-21T08:00:00+07:00',
      check_out_at: '2026-10-21T17:00:00+07:00',
      hourly_rate_snapshot: 25000,
      duration_minutes: 540,
      source: 'PUBLIC_KIOSK',
      created_by: 'Kiosk',
    },
    {
      id: 'att-hist-3',
      employee_id: 'emp-1',
      work_date: '2026-10-22',
      check_in_at: '2026-10-22T08:00:00+07:00',
      check_out_at: '2026-10-22T17:00:00+07:00',
      hourly_rate_snapshot: 25000,
      duration_minutes: 540,
      source: 'PUBLIC_KIOSK',
      created_by: 'Kiosk',
    },
    {
      id: 'att-hist-4',
      employee_id: 'emp-2',
      work_date: '2026-10-20',
      check_in_at: '2026-10-20T08:00:00+07:00',
      check_out_at: '2026-10-20T17:00:00+07:00',
      hourly_rate_snapshot: 24000,
      duration_minutes: 540,
      source: 'PUBLIC_KIOSK',
      created_by: 'Kiosk',
    },
    {
      id: 'att-hist-5',
      employee_id: 'emp-2',
      work_date: '2026-10-21',
      check_in_at: '2026-10-21T08:00:00+07:00',
      check_out_at: '2026-10-21T17:00:00+07:00',
      hourly_rate_snapshot: 24000,
      duration_minutes: 540,
      source: 'PUBLIC_KIOSK',
      created_by: 'Kiosk',
    },
  ];

  const attendance_status_records: AttendanceStatusRecord[] = [
    {
      id: 'stat-1',
      employee_id: 'emp-3',
      date: today,
      status: 'HADIR',
      notes: 'Hadir tepat waktu',
      created_by: 'Operator Input',
    },
    {
      id: 'stat-2',
      employee_id: 'emp-5',
      date: today,
      status: 'HADIR',
      notes: 'Supervisi tim kantor',
      created_by: 'Operator Input',
    },
  ];

  const overtime_sessions: OvertimeSession[] = [
    {
      id: 'ot-1',
      employee_id: 'emp-1',
      work_date: '2026-10-21',
      start_at: '2026-10-21T17:30:00+07:00',
      end_at: '2026-10-21T20:30:00+07:00',
      overtime_rate_snapshot: 35000,
      duration_minutes: 180,
      notes: 'Pengejaran kuota ekspor jahit polo',
      created_by: 'Operator Input',
    },
  ];

  const employee_notes: EmployeeNote[] = [
    {
      id: 'note-1',
      employee_id: 'emp-1',
      note: 'Kinerja jahit sangat rapi, memenuhi target batch 120 pcs.',
      author: 'Administrator',
      created_at: '2026-10-18T14:20:00Z',
    },
  ];

  const audit_logs: AuditLog[] = [
    {
      id: 'audit-init',
      action: 'SYSTEM_INITIALIZE',
      entity_type: 'SYSTEM',
      entity_id: 'makare',
      payload_summary: 'Sistem MAKARE diinisialisasi dengan master data & konfigurasi pabrik.',
      performed_by: 'System',
      timestamp: new Date().toISOString(),
    },
  ];

  return {
    departments,
    employees,
    rate_history: [],
    default_pay_items,
    attendance_sessions,
    attendance_status_records,
    overtime_sessions,
    company_settings,
    cash_advance_transactions,
    payroll_periods,
    payroll_records: [],
    payroll_items: [],
    employee_notes,
    audit_logs,
  };
}

class MakareDatabase {
  private data: DatabaseSchema;
  private isSaving: boolean = false;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all arrays exist
        return {
          departments: parsed.departments || [],
          employees: parsed.employees || [],
          rate_history: parsed.rate_history || [],
          default_pay_items: parsed.default_pay_items || [],
          attendance_sessions: parsed.attendance_sessions || [],
          attendance_status_records: parsed.attendance_status_records || [],
          overtime_sessions: parsed.overtime_sessions || [],
          company_settings: parsed.company_settings || createInitialDatabase().company_settings,
          cash_advance_transactions: parsed.cash_advance_transactions || [],
          payroll_periods: parsed.payroll_periods || [],
          payroll_records: parsed.payroll_records || [],
          payroll_items: parsed.payroll_items || [],
          employee_notes: parsed.employee_notes || [],
          audit_logs: parsed.audit_logs || [],
        };
      }
    } catch (e) {
      console.error('Failed reading database file, regenerating default:', e);
    }

    const initial = createInitialDatabase();
    this.persist(initial);
    return initial;
  }

  private persist(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing to database file:', e);
    }
  }

  private save() {
    this.persist(this.data);
  }

  public logAudit(action: string, entity_type: string, entity_id: string, payload_summary: string, performed_by: string) {
    const entry: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action,
      entity_type,
      entity_id,
      payload_summary,
      performed_by: performed_by || 'Unknown',
      timestamp: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(entry);
    this.save();
  }

  // --- Summary & Settings ---
  public getSummary(): OperationalSummary {
    const today = new Date().toISOString().split('T')[0];
    const activePeriod = this.data.payroll_periods.find((p) => p.status !== 'CLOSED') || null;

    // Calculate active kasbon balance total
    const balances = this.getKasbonBalances();
    const total_active_kasbon = balances.reduce((sum, b) => sum + Math.max(0, b.current_balance), 0);

    const checked_in_today = this.data.attendance_sessions.filter((s) => s.work_date === today).length +
      this.data.attendance_status_records.filter((s) => s.date === today && s.status === 'HADIR').length;

    const open_sessions_count = this.data.attendance_sessions.filter(
      (s) => s.work_date === today && !s.check_out_at
    ).length;

    const overtime_sessions_today = this.data.overtime_sessions.filter((s) => s.work_date === today).length;

    return {
      total_employees: this.data.employees.length,
      active_employees: this.data.employees.filter((e) => e.is_active).length,
      checked_in_today,
      open_sessions_count,
      overtime_sessions_today,
      total_active_kasbon,
      active_period: activePeriod,
      overtime_enabled: this.data.company_settings.overtime_enabled,
      company_settings: this.data.company_settings,
    };
  }

  public getSettings(): CompanySettings {
    return this.data.company_settings;
  }

  public updateSettings(settings: Partial<CompanySettings>, performed_by: string): CompanySettings {
    this.data.company_settings = {
      ...this.data.company_settings,
      ...settings,
    };
    this.logAudit('UPDATE_SETTINGS', 'COMPANY_SETTINGS', 'settings', `Pembaruan pengaturan perusahaan & absensi`, performed_by);
    this.save();
    return this.data.company_settings;
  }

  public verifyAdminPin(pin: string): boolean {
    const validPin = this.data.company_settings.admin_pin || '8899';
    return String(pin).trim() === String(validPin).trim();
  }

  // --- Departments ---
  public getDepartments(): Department[] {
    return this.data.departments;
  }

  public addDepartment(name: string, code: string, performed_by: string): Department {
    const dept: Department = {
      id: `dept-${Date.now()}`,
      name,
      code: code.toUpperCase(),
      created_at: new Date().toISOString(),
    };
    this.data.departments.push(dept);
    this.logAudit('CREATE_DEPARTMENT', 'DEPARTMENT', dept.id, `Departemen baru: ${name} (${code})`, performed_by);
    this.save();
    return dept;
  }

  // --- Employees ---
  public getEmployees(): Employee[] {
    const deptMap = new Map(this.data.departments.map((d) => [d.id, d.name]));
    return this.data.employees.map((emp) => ({
      ...emp,
      department_name: deptMap.get(emp.department_id) || 'Umum',
      default_pay_items: this.data.default_pay_items.filter((item) => item.employee_id === emp.id),
    }));
  }

  public getEmployeeById(id: string): Employee | null {
    const emp = this.data.employees.find((e) => e.id === id);
    if (!emp) return null;
    const dept = this.data.departments.find((d) => d.id === emp.department_id);
    return {
      ...emp,
      department_name: dept?.name || 'Umum',
      default_pay_items: this.data.default_pay_items.filter((item) => item.employee_id === emp.id),
    };
  }

  public saveEmployee(
    employeeData: Omit<Employee, 'id' | 'created_at'> & { id?: string; default_pay_items?: EmployeeDefaultPayItem[] },
    performed_by: string
  ): Employee {
    const isEdit = Boolean(employeeData.id);
    const id = employeeData.id || `emp-${Date.now()}`;

    if (isEdit) {
      const index = this.data.employees.findIndex((e) => e.id === id);
      if (index === -1) throw new Error('Karyawan tidak ditemukan');

      const existing = this.data.employees[index];

      // Check if hourly or overtime rate changed -> record rate history
      if (existing.default_hourly_rate !== employeeData.default_hourly_rate) {
        this.data.rate_history.push({
          id: `rate-${Date.now()}-h`,
          employee_id: id,
          employee_name: existing.name,
          old_rate: existing.default_hourly_rate,
          new_rate: employeeData.default_hourly_rate,
          rate_type: 'HOURLY',
          effective_date: new Date().toISOString(),
          reason: 'Perubahan tarif reguler per jam',
          changed_by: performed_by,
        });
      }

      if (existing.default_overtime_rate !== employeeData.default_overtime_rate) {
        this.data.rate_history.push({
          id: `rate-${Date.now()}-ot`,
          employee_id: id,
          employee_name: existing.name,
          old_rate: existing.default_overtime_rate,
          new_rate: employeeData.default_overtime_rate,
          rate_type: 'OVERTIME',
          effective_date: new Date().toISOString(),
          reason: 'Perubahan tarif lembur',
          changed_by: performed_by,
        });
      }

      this.data.employees[index] = {
        ...existing,
        ...employeeData,
        id,
      };

      this.logAudit('UPDATE_EMPLOYEE', 'EMPLOYEE', id, `Pembaruan data karyawan: ${employeeData.name} (${employeeData.employee_code})`, performed_by);
    } else {
      // Check unique code
      if (this.data.employees.some((e) => e.employee_code.toLowerCase() === employeeData.employee_code.toLowerCase())) {
        throw new Error(`Kode karyawan ${employeeData.employee_code} sudah digunakan.`);
      }

      const newEmp: Employee = {
        ...employeeData,
        id,
        created_at: new Date().toISOString(),
      };
      this.data.employees.push(newEmp);
      this.logAudit('CREATE_EMPLOYEE', 'EMPLOYEE', id, `Karyawan baru: ${newEmp.name} (${newEmp.employee_code})`, performed_by);
    }

    // Update manual default pay items if provided
    if (employeeData.default_pay_items) {
      this.data.default_pay_items = this.data.default_pay_items.filter((item) => item.employee_id !== id);
      for (const item of employeeData.default_pay_items) {
        this.data.default_pay_items.push({
          id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          employee_id: id,
          description: item.description,
          amount: Number(item.amount) || 0,
          item_type: item.item_type || 'ALLOWANCE',
        });
      }
    }

    this.save();
    return this.getEmployeeById(id)!;
  }

  public getRateHistory(employee_id?: string): EmployeeRateHistory[] {
    const empMap = new Map(this.data.employees.map((e) => [e.id, e.name]));
    let list = this.data.rate_history;
    if (employee_id) {
      list = list.filter((r) => r.employee_id === employee_id);
    }
    return list.map((r) => ({
      ...r,
      employee_name: empMap.get(r.employee_id) || 'Karyawan',
    }));
  }

  // --- Attendance Sessions & Kiosk ---
  public getAttendanceSessions(date?: string): AttendanceSession[] {
    const empMap = new Map(this.data.employees.map((e) => [e.id, e]));
    const deptMap = new Map(this.data.departments.map((d) => [d.id, d.name]));

    const startTimeStr = this.data.company_settings.start_time || '08:00';
    const toleranceMins = Number(this.data.company_settings.late_tolerance_minutes) || 15;
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const startThresholdMins = startH * 60 + startM + toleranceMins;

    let sessions = this.data.attendance_sessions;
    if (date) {
      sessions = sessions.filter((s) => s.work_date === date);
    }

    return sessions
      .map((s) => {
        const emp = empMap.get(s.employee_id);
        const checkIn = new Date(s.check_in_at);
        const checkInTotalMins = checkIn.getHours() * 60 + checkIn.getMinutes();
        const isLate = checkInTotalMins > startThresholdMins;
        const lateMinutes = isLate ? checkInTotalMins - (startH * 60 + startM) : 0;

        return {
          ...s,
          employee_name: emp?.name || 'Unknown',
          employee_code: emp?.employee_code || '-',
          department_name: emp ? deptMap.get(emp.department_id) : '-',
          is_late: isLate,
          late_minutes: lateMinutes,
        };
      })
      .sort((a, b) => new Date(b.check_in_at).getTime() - new Date(a.check_in_at).getTime());
  }

  public getAttendanceStatusRecords(date?: string): AttendanceStatusRecord[] {
    const empMap = new Map(this.data.employees.map((e) => [e.id, e]));
    const deptMap = new Map(this.data.departments.map((d) => [d.id, d.name]));

    let records = this.data.attendance_status_records;
    if (date) {
      records = records.filter((r) => r.date === date);
    }

    return records.map((r) => {
      const emp = empMap.get(r.employee_id);
      return {
        ...r,
        employee_name: emp?.name || 'Unknown',
        employee_code: emp?.employee_code || '-',
        department_name: emp ? deptMap.get(emp.department_id) : '-',
      };
    });
  }

  public clockIn(
    employee_id: string,
    source: 'INTERNAL' | 'PUBLIC_KIOSK',
    performed_by: string,
    custom_work_date?: string
  ): AttendanceSession {
    const emp = this.data.employees.find((e) => e.id === employee_id);
    if (!emp) throw new Error('Karyawan tidak ditemukan');
    if (!emp.is_active) throw new Error('Karyawan sudah nonaktif');

    const now = new Date();
    const work_date = custom_work_date || now.toISOString().split('T')[0];

    // Check if there is already an open session for this employee
    const openSession = this.data.attendance_sessions.find(
      (s) => s.employee_id === employee_id && !s.check_out_at
    );
    if (openSession) {
      throw new Error(`Karyawan ${emp.name} sudah memiliki sesi Masuk aktif sejak ${openSession.check_in_at}.`);
    }

    // Invariant: Snapshot rate at clock in
    const snapshotRate = emp.default_hourly_rate || 0;

    const session: AttendanceSession = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      employee_id,
      work_date,
      check_in_at: now.toISOString(),
      check_out_at: null,
      hourly_rate_snapshot: snapshotRate,
      duration_minutes: 0,
      source,
      created_by: performed_by,
    };

    this.data.attendance_sessions.push(session);
    this.logAudit('CLOCK_IN', 'ATTENDANCE_SESSION', session.id, `Masuk kerja: ${emp.name} (${emp.employee_code}) tarif snapshot Rp ${snapshotRate.toLocaleString('id-ID')}`, performed_by);
    this.save();

    return session;
  }

  public clockOut(
    employee_id: string,
    early_checkout_reason?: string,
    early_checkout_authorized_by?: string,
    performed_by: string = 'User'
  ): AttendanceSession {
    const emp = this.data.employees.find((e) => e.id === employee_id);
    if (!emp) throw new Error('Karyawan tidak ditemukan');

    // Find the latest open session
    const openSession = this.data.attendance_sessions.find(
      (s) => s.employee_id === employee_id && !s.check_out_at
    );
    if (!openSession) {
      throw new Error(`Tidak ditemukan sesi aktif untuk ${emp.name}. Silakan catat Masuk terlebih dahulu.`);
    }

    const now = new Date();
    const inTime = new Date(openSession.check_in_at);
    const diffMs = now.getTime() - inTime.getTime();
    if (diffMs < 0) {
      throw new Error('Waktu Keluar tidak boleh lebih awal dari waktu Masuk.');
    }

    const durationMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));

    openSession.check_out_at = now.toISOString();
    openSession.duration_minutes = durationMinutes;
    if (early_checkout_reason) {
      openSession.early_checkout_reason = early_checkout_reason;
    }
    if (early_checkout_authorized_by) {
      openSession.early_checkout_authorized_by = early_checkout_authorized_by;
    }

    this.logAudit(
      'CLOCK_OUT',
      'ATTENDANCE_SESSION',
      openSession.id,
      `Keluar kerja: ${emp.name} (${emp.employee_code}) durasi ${durationMinutes} menit (${(durationMinutes / 60).toFixed(2)} jam)`,
      performed_by
    );
    this.save();

    return openSession;
  }

  public setAttendanceStatus(
    employee_id: string,
    date: string,
    status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ABSEN',
    notes: string = '',
    performed_by: string
  ): AttendanceStatusRecord {
    const emp = this.data.employees.find((e) => e.id === employee_id);
    if (!emp) throw new Error('Karyawan tidak ditemukan');

    // Remove existing status for this date if any
    const existingIndex = this.data.attendance_status_records.findIndex(
      (r) => r.employee_id === employee_id && r.date === date
    );

    const record: AttendanceStatusRecord = {
      id: existingIndex !== -1 ? this.data.attendance_status_records[existingIndex].id : `stat-${Date.now()}`,
      employee_id,
      date,
      status,
      notes,
      created_by: performed_by,
    };

    if (existingIndex !== -1) {
      this.data.attendance_status_records[existingIndex] = record;
    } else {
      this.data.attendance_status_records.push(record);
    }

    this.logAudit('RECORD_STATUS', 'ATTENDANCE_STATUS', record.id, `Status absensi: ${emp.name} -> ${status} (${date})`, performed_by);
    this.save();
    return record;
  }

  // --- Overtime Sessions ---
  public getOvertimeSessions(date?: string): OvertimeSession[] {
    const empMap = new Map(this.data.employees.map((e) => [e.id, e]));
    const deptMap = new Map(this.data.departments.map((d) => [d.id, d.name]));

    let sessions = this.data.overtime_sessions;
    if (date) {
      sessions = sessions.filter((s) => s.work_date === date);
    }

    return sessions
      .map((s) => {
        const emp = empMap.get(s.employee_id);
        return {
          ...s,
          employee_name: emp?.name || 'Unknown',
          employee_code: emp?.employee_code || '-',
          department_name: emp ? deptMap.get(emp.department_id) : '-',
        };
      })
      .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());
  }

  public startOvertime(
    employee_id: string,
    notes: string,
    performed_by: string
  ): OvertimeSession {
    if (!this.data.company_settings.overtime_enabled) {
      throw new Error('Fitur lembur sedang dinonaktifkan dalam Pengaturan Perusahaan.');
    }

    const emp = this.data.employees.find((e) => e.id === employee_id);
    if (!emp) throw new Error('Karyawan tidak ditemukan');
    if (!emp.is_active) throw new Error('Karyawan nonaktif tidak dapat mengambil lembur.');

    const openOt = this.data.overtime_sessions.find((s) => s.employee_id === employee_id && !s.end_at);
    if (openOt) {
      throw new Error(`Karyawan ${emp.name} masih memiliki sesi lembur aktif sejak ${openOt.start_at}.`);
    }

    const now = new Date();
    const work_date = now.toISOString().split('T')[0];
    const snapshotRate = emp.default_overtime_rate || 0;

    const session: OvertimeSession = {
      id: `ot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      employee_id,
      work_date,
      start_at: now.toISOString(),
      end_at: null,
      overtime_rate_snapshot: snapshotRate,
      duration_minutes: 0,
      notes: notes || 'Lembur operasional',
      created_by: performed_by,
    };

    this.data.overtime_sessions.push(session);
    this.logAudit('START_OVERTIME', 'OVERTIME_SESSION', session.id, `Mulai lembur: ${emp.name} (${emp.employee_code}) tarif Rp ${snapshotRate.toLocaleString('id-ID')}`, performed_by);
    this.save();
    return session;
  }

  public endOvertime(employee_id: string, performed_by: string): OvertimeSession {
    const emp = this.data.employees.find((e) => e.id === employee_id);
    if (!emp) throw new Error('Karyawan tidak ditemukan');

    const openOt = this.data.overtime_sessions.find((s) => s.employee_id === employee_id && !s.end_at);
    if (!openOt) {
      throw new Error(`Tidak ditemukan sesi lembur aktif untuk ${emp.name}.`);
    }

    const now = new Date();
    const start = new Date(openOt.start_at);
    const diffMs = now.getTime() - start.getTime();
    const durationMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));

    openOt.end_at = now.toISOString();
    openOt.duration_minutes = durationMinutes;

    this.logAudit('END_OVERTIME', 'OVERTIME_SESSION', openOt.id, `Selesai lembur: ${emp.name} durasi ${durationMinutes} menit (${(durationMinutes / 60).toFixed(2)} jam)`, performed_by);
    this.save();
    return openOt;
  }

  // --- Kasbon (Cash Advance) Ledger ---
  public getKasbonBalances(): KasbonEmployeeBalance[] {
    const deptMap = new Map(this.data.departments.map((d) => [d.id, d.name]));

    return this.data.employees.map((emp) => {
      const txs = this.data.cash_advance_transactions.filter((t) => t.employee_id === emp.id);

      let total_issued = 0;
      let total_deducted = 0;
      let total_repaid = 0;
      let total_reversed = 0;

      let lastDate: string | undefined;

      for (const t of txs) {
        if (!lastDate || new Date(t.date).getTime() > new Date(lastDate).getTime()) {
          lastDate = t.date;
        }

        switch (t.type) {
          case 'ISSUED':
            total_issued += Number(t.amount) || 0;
            break;
          case 'PAYROLL_DEDUCTION':
            total_deducted += Number(t.amount) || 0;
            break;
          case 'REPAYMENT':
            total_repaid += Number(t.amount) || 0;
            break;
          case 'REVERSAL':
            total_reversed += Number(t.amount) || 0;
            break;
        }
      }

      // Balance formula: ISSUED - PAYROLL_DEDUCTION - REPAYMENT - REVERSAL
      const current_balance = total_issued - total_deducted - total_repaid - total_reversed;

      return {
        employee_id: emp.id,
        employee_code: emp.employee_code,
        employee_name: emp.name,
        department_name: deptMap.get(emp.department_id) || '-',
        total_issued,
        total_deducted,
        total_repaid,
        total_reversed,
        current_balance,
        last_transaction_date: lastDate,
      };
    });
  }

  public getKasbonTransactions(employee_id?: string): CashAdvanceTransaction[] {
    const empMap = new Map(this.data.employees.map((e) => [e.id, e]));

    let txs = this.data.cash_advance_transactions;
    if (employee_id) {
      txs = txs.filter((t) => t.employee_id === employee_id);
    }

    return txs
      .map((t) => {
        const emp = empMap.get(t.employee_id);
        return {
          ...t,
          employee_name: emp?.name || 'Unknown',
          employee_code: emp?.employee_code || '-',
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public addKasbonTransaction(
    transaction: Omit<CashAdvanceTransaction, 'id'>,
    performed_by: string
  ): CashAdvanceTransaction {
    const emp = this.data.employees.find((e) => e.id === transaction.employee_id);
    if (!emp) throw new Error('Karyawan tidak ditemukan');

    const amount = Number(transaction.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Nominal kasbon harus berupa angka positif.');
    }

    // Check balances if REPAYMENT or DEDUCTION
    if (transaction.type === 'REPAYMENT') {
      const balanceObj = this.getKasbonBalances().find((b) => b.employee_id === transaction.employee_id);
      const currentBalance = balanceObj?.current_balance || 0;
      if (amount > currentBalance) {
        throw new Error(`Nominal pelunasan (Rp ${amount.toLocaleString('id-ID')}) melebihi sisa saldo kasbon (Rp ${currentBalance.toLocaleString('id-ID')}).`);
      }
    }

    const newTx: CashAdvanceTransaction = {
      ...transaction,
      id: `kasbon-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      amount,
      created_by: performed_by,
    };

    this.data.cash_advance_transactions.push(newTx);
    this.logAudit(
      'KASBON_TRANSACTION',
      'CASH_ADVANCE',
      newTx.id,
      `Kasbon [${newTx.type}]: ${emp.name} Rp ${amount.toLocaleString('id-ID')} (${newTx.notes})`,
      performed_by
    );
    this.save();
    return newTx;
  }

  // --- Payroll Calculation & Period Closing ---
  public getPayrollPeriods(): PayrollPeriod[] {
    return this.data.payroll_periods.sort(
      (a, b) => new Date(b.period_end).getTime() - new Date(a.period_end).getTime()
    );
  }

  public calculatePeriodPreview(period_start: string, period_end: string) {
    const deptMap = new Map(this.data.departments.map((d) => [d.id, d.name]));
    const kasbonBalances = this.getKasbonBalances();
    const kasbonMap = new Map(kasbonBalances.map((b) => [b.employee_id, b.current_balance]));

    // Check for open attendance or overtime sessions within this range
    const openAttendance = this.data.attendance_sessions.filter(
      (s) => s.work_date >= period_start && s.work_date <= period_end && !s.check_out_at
    );
    const openOvertime = this.data.overtime_sessions.filter(
      (s) => s.work_date >= period_start && s.work_date <= period_end && !s.end_at
    );

    const records: Array<PayrollRecord & { items: PayrollItem[]; current_kasbon_balance: number }> = [];

    for (const emp of this.data.employees.filter((e) => e.is_active)) {
      const items: PayrollItem[] = [];
      let total_regular_hours = 0;
      let regular_pay = 0;
      let total_overtime_hours = 0;
      let overtime_pay = 0;
      let manual_allowances = 0;

      if (emp.salary_mode === 'HOURLY') {
        // Collect regular sessions
        const empSessions = this.data.attendance_sessions.filter(
          (s) => s.employee_id === emp.id && s.work_date >= period_start && s.work_date <= period_end && s.check_out_at
        );

        for (const s of empSessions) {
          const hours = (s.duration_minutes || 0) / 60;
          total_regular_hours += hours;
          // Invariant: Use rate snapshot from session!
          const sessionEarned = hours * s.hourly_rate_snapshot;
          regular_pay += sessionEarned;
        }

        if (total_regular_hours > 0) {
          items.push({
            id: `item-reg-${emp.id}`,
            payroll_record_id: '',
            description: `Gaji Reguler (${total_regular_hours.toFixed(2)} jam @ snapshot)`,
            amount: Math.round(regular_pay),
            type: 'BASE',
          });
        }
      } else {
        // MANUAL salary mode: pull default pay items
        const defaultItems = this.data.default_pay_items.filter((item) => item.employee_id === emp.id);
        for (const it of defaultItems) {
          if (it.item_type === 'ALLOWANCE') {
            manual_allowances += it.amount;
            items.push({
              id: `item-man-${it.id}`,
              payroll_record_id: '',
              description: it.description,
              amount: it.amount,
              type: 'ALLOWANCE',
            });
          }
        }
      }

      // Collect overtime sessions in period
      const empOvertimes = this.data.overtime_sessions.filter(
        (s) => s.employee_id === emp.id && s.work_date >= period_start && s.work_date <= period_end && s.end_at
      );

      for (const ot of empOvertimes) {
        const hours = (ot.duration_minutes || 0) / 60;
        total_overtime_hours += hours;
        // Invariant: Use overtime rate snapshot!
        const otEarned = hours * ot.overtime_rate_snapshot;
        overtime_pay += otEarned;
      }

      if (total_overtime_hours > 0) {
        items.push({
          id: `item-ot-${emp.id}`,
          payroll_record_id: '',
          description: `Upah Lembur (${total_overtime_hours.toFixed(2)} jam @ snapshot)`,
          amount: Math.round(overtime_pay),
          type: 'OVERTIME',
        });
      }

      const gross_pay = Math.round(regular_pay + overtime_pay + manual_allowances);

      // Other authorized deductions (if any manual deduction items exist)
      let other_deductions = 0;
      if (emp.salary_mode === 'MANUAL') {
        const defaultDed = this.data.default_pay_items.filter(
          (item) => item.employee_id === emp.id && item.item_type === 'DEDUCTION'
        );
        for (const d of defaultDed) {
          other_deductions += d.amount;
          items.push({
            id: `item-ded-${d.id}`,
            payroll_record_id: '',
            description: d.description,
            amount: d.amount,
            type: 'DEDUCTION',
          });
        }
      }

      // INVARIANT: Available salary for kasbon deduction:
      // Gaji Tersedia = Gaji Kotor - Potongan Lain yang Sah
      const available_for_kasbon = Math.max(0, gross_pay - other_deductions);
      const currentKasbon = Math.max(0, kasbonMap.get(emp.id) || 0);

      // Suggest deduction up to available salary
      const suggested_kasbon_deduction = Math.min(currentKasbon, available_for_kasbon);

      const net_pay = Math.max(0, available_for_kasbon - suggested_kasbon_deduction);

      records.push({
        id: `rec-prev-${emp.id}`,
        payroll_period_id: '',
        employee_id: emp.id,
        employee_name: emp.name,
        employee_code: emp.employee_code,
        department_name: deptMap.get(emp.department_id) || '-',
        salary_mode: emp.salary_mode,
        total_regular_hours: Number(total_regular_hours.toFixed(2)),
        total_overtime_hours: Number(total_overtime_hours.toFixed(2)),
        regular_pay: Math.round(regular_pay),
        overtime_pay: Math.round(overtime_pay),
        manual_allowances: Math.round(manual_allowances),
        gross_pay,
        cash_advance_deduction: suggested_kasbon_deduction,
        other_deductions,
        net_pay,
        payment_status: 'PENDING',
        items,
        current_kasbon_balance: currentKasbon,
      });
    }

    return {
      period_start,
      period_end,
      open_attendance_count: openAttendance.length,
      open_overtime_count: openOvertime.length,
      open_sessions: [...openAttendance, ...openOvertime],
      records,
    };
  }

  public validatePeriodConsistency(period_start: string, period_end: string): ConsistencyAuditReport {
    const checks: ConsistencyAuditCheck[] = [];
    const empMap = new Map(this.data.employees.map((e) => [e.id, e]));

    // 1. SESSIONS: Check unclosed attendance sessions
    const openAttendance = this.data.attendance_sessions.filter(
      (s) => s.work_date >= period_start && s.work_date <= period_end && !s.check_out_at
    );
    const openOvertime = this.data.overtime_sessions.filter(
      (s) => s.work_date >= period_start && s.work_date <= period_end && !s.end_at
    );
    const totalOpen = openAttendance.length + openOvertime.length;

    if (totalOpen > 0) {
      const openNames = [
        ...openAttendance.map((s) => `${empMap.get(s.employee_id)?.name || 'Karyawan'} (Masuk: ${s.work_date})`),
        ...openOvertime.map((s) => `${empMap.get(s.employee_id)?.name || 'Karyawan'} (Lembur: ${s.work_date})`),
      ];
      checks.push({
        id: 'chk-open-sessions',
        title: 'Integritas Sesi Absensi & Lembur Terbuka',
        category: 'SESSIONS',
        status: 'BLOCKER',
        message: `Terdapat ${totalOpen} sesi aktif yang belum Keluar (Check-Out). Penutupan buku ditolak hingga seluruh sesi diselesaikan.`,
        details: openNames,
      });
    } else {
      checks.push({
        id: 'chk-open-sessions',
        title: 'Integritas Sesi Absensi & Lembur Terbuka',
        category: 'SESSIONS',
        status: 'PASS',
        message: 'Seluruh sesi absensi dan lembur pada rentang periode telah selesai (memiliki timestamp Keluar).',
      });
    }

    // 2. PERIOD_DATES: Validate date boundaries and collision
    let hasDateOverlap = false;
    const overlapDetails: string[] = [];

    const s2 = new Date(period_start).getTime();
    const e2 = new Date(period_end).getTime();

    if (s2 > e2) {
      checks.push({
        id: 'chk-period-range',
        title: 'Validitas Rentang Tanggal Periode',
        category: 'PERIOD_DATES',
        status: 'BLOCKER',
        message: `Tanggal awal (${period_start}) tidak boleh lebih besar dari tanggal akhir (${period_end}).`,
      });
    } else {
      for (const p of this.data.payroll_periods) {
        if (p.status === 'CLOSED') {
          const s1 = new Date(p.period_start).getTime();
          const e1 = new Date(p.period_end).getTime();
          if (s2 <= e1 && e2 >= s1) {
            hasDateOverlap = true;
            overlapDetails.push(`Bertabrakan dengan periode tertutup: ${p.period_start} s/d ${p.period_end}`);
          }
        }
      }

      if (hasDateOverlap) {
        checks.push({
          id: 'chk-period-range',
          title: 'Validitas Rentang Tanggal & Tumpang Tindih',
          category: 'PERIOD_DATES',
          status: 'BLOCKER',
          message: 'Rentang tanggal periode bertabrakan dengan periode yang sudah ditutup sebelumnya.',
          details: overlapDetails,
        });
      } else {
        checks.push({
          id: 'chk-period-range',
          title: 'Validitas Rentang Tanggal & Tumpang Tindih',
          category: 'PERIOD_DATES',
          status: 'PASS',
          message: `Rentang ${period_start} s/d ${period_end} valid dan tidak tumpang tindih dengan periode tertutup.`,
        });
      }
    }

    // 3. SNAPSHOTS: Check rate snapshot integrity
    const hourlySessions = this.data.attendance_sessions.filter(
      (s) => s.work_date >= period_start && s.work_date <= period_end
    );
    const zeroSnapshots = hourlySessions.filter((s) => (s.hourly_rate_snapshot || 0) <= 0);

    if (zeroSnapshots.length > 0) {
      checks.push({
        id: 'chk-snapshots',
        title: 'Validasi Snapshot Tarif Upah Per Jam',
        category: 'SNAPSHOTS',
        status: 'WARNING',
        message: `Ditemukan ${zeroSnapshots.length} sesi absensi dengan tarif snapshot Rp 0. Periksa profil karyawan terkait.`,
        details: zeroSnapshots.map((s) => `${empMap.get(s.employee_id)?.name || 'Karyawan'} (Tanggal ${s.work_date})`),
      });
    } else {
      checks.push({
        id: 'chk-snapshots',
        title: 'Validasi Snapshot Tarif Upah Per Jam',
        category: 'SNAPSHOTS',
        status: 'PASS',
        message: 'Semua sesi absensi reguler memiliki snapshot tarif upah per jam yang valid dan terkunci.',
      });
    }

    // 4. KASBON & NET PAY: Reconcile with calculations
    const preview = this.calculatePeriodPreview(period_start, period_end);
    const kasbonIssues: string[] = [];
    const negativeNetPayIssues: string[] = [];

    for (const rec of preview.records) {
      const availableSalary = rec.gross_pay - rec.other_deductions;
      if (rec.cash_advance_deduction > availableSalary) {
        kasbonIssues.push(
          `${rec.employee_name}: Potongan kasbon (Rp ${rec.cash_advance_deduction.toLocaleString('id-ID')}) melebihi gaji tersedia (Rp ${availableSalary.toLocaleString('id-ID')})`
        );
      }
      if (rec.net_pay < 0) {
        negativeNetPayIssues.push(`${rec.employee_name}: Gaji bersih negatif (Rp ${rec.net_pay.toLocaleString('id-ID')})`);
      }
    }

    if (kasbonIssues.length > 0) {
      checks.push({
        id: 'chk-kasbon-reconcile',
        title: 'Rekonsiliasi Pemotongan Kasbon vs Gaji Tersedia',
        category: 'KASBON',
        status: 'BLOCKER',
        message: 'Terdapat potongan kasbon yang melampaui batas gaji tersedia. Sistem menolak penutupan.',
        details: kasbonIssues,
      });
    } else {
      checks.push({
        id: 'chk-kasbon-reconcile',
        title: 'Rekonsiliasi Pemotongan Kasbon vs Gaji Tersedia',
        category: 'KASBON',
        status: 'PASS',
        message: 'Seluruh usulan potongan kasbon berada di dalam batas aman gaji tersedia karyawan.',
      });
    }

    if (negativeNetPayIssues.length > 0) {
      checks.push({
        id: 'chk-net-pay',
        title: 'Pencegahan Gaji Bersih Negatif (Net Pay Invariant)',
        category: 'NET_PAY',
        status: 'BLOCKER',
        message: 'Terdapat perhitungan gaji bersih negatif. Periksa kembali komponen potongan.',
        details: negativeNetPayIssues,
      });
    } else {
      checks.push({
        id: 'chk-net-pay',
        title: 'Pencegahan Gaji Bersih Negatif (Net Pay Invariant)',
        category: 'NET_PAY',
        status: 'PASS',
        message: 'Seluruh karyawan memiliki gaji bersih non-negatif (Take Home Pay >= Rp 0).',
      });
    }

    const blockers = checks.filter((c) => c.status === 'BLOCKER');
    const warnings = checks.filter((c) => c.status === 'WARNING');
    const canClose = blockers.length === 0;

    const summary = canClose
      ? `Audit konsistensi berhasil: Seluruh ${checks.length} parameter validasi terpenuhi. Periode siap ditutup.`
      : `Audit konsistensi menemukan ${blockers.length} kendala penghambat (Blocker) yang wajib diselesaikan sebelum penutupan buku.`;

    return {
      can_close: canClose,
      blockers_count: blockers.length,
      warnings_count: warnings.length,
      checks,
      summary,
    };
  }

  public closePeriod(
    period_start: string,
    period_end: string,
    notes: string,
    adjusted_deductions: Record<string, number>,
    performed_by: string
  ): PayrollPeriod {
    // 1. Invariant: Check if period start & end are valid and not overlapping with existing CLOSED period
    for (const p of this.data.payroll_periods) {
      if (p.status === 'CLOSED') {
        const s1 = new Date(p.period_start).getTime();
        const e1 = new Date(p.period_end).getTime();
        const s2 = new Date(period_start).getTime();
        const e2 = new Date(period_end).getTime();

        if (s2 <= e1 && e2 >= s1) {
          throw new Error(`Rentang tanggal (${period_start} s/d ${period_end}) bertabrakan dengan periode tertutup ${p.period_start} s/d ${p.period_end}.`);
        }
      }
    }

    // 2. Invariant: Block if there are unclosed active attendance or overtime sessions
    const openAttendance = this.data.attendance_sessions.filter(
      (s) => s.work_date >= period_start && s.work_date <= period_end && !s.check_out_at
    );
    if (openAttendance.length > 0) {
      throw new Error(`Masih terdapat ${openAttendance.length} sesi absensi yang belum Keluar (Check-Out) pada rentang tanggal tersebut. Selesaikan sesi terlebih dahulu sebelum penutupan.`);
    }

    // 3. Compute calculations
    const preview = this.calculatePeriodPreview(period_start, period_end);

    const periodId = `period-${Date.now()}`;
    const newPeriod: PayrollPeriod = {
      id: periodId,
      period_start,
      period_end,
      status: 'CLOSED',
      closed_at: new Date().toISOString(),
      closed_by: performed_by,
      notes: notes || 'Penutupan Periode Penggajian',
    };

    // 4. Atomic creation of payroll records and kasbon deductions
    const createdRecords: PayrollRecord[] = [];

    for (const rec of preview.records) {
      // Determine final kasbon deduction
      let finalKasbonDeduction = rec.cash_advance_deduction;
      if (typeof adjusted_deductions[rec.employee_id] === 'number') {
        finalKasbonDeduction = adjusted_deductions[rec.employee_id];
      }

      // Invariant: deduction cannot exceed available salary
      const availableSalary = rec.gross_pay - rec.other_deductions;
      if (finalKasbonDeduction > availableSalary) {
        throw new Error(
          `Potongan kasbon untuk ${rec.employee_name} (Rp ${finalKasbonDeduction.toLocaleString('id-ID')}) melebihi gaji yang tersedia untuk dipotong (Rp ${availableSalary.toLocaleString('id-ID')}).`
        );
      }

      // Invariant: deduction cannot exceed current kasbon balance
      if (finalKasbonDeduction > rec.current_kasbon_balance) {
        throw new Error(
          `Potongan kasbon untuk ${rec.employee_name} (Rp ${finalKasbonDeduction.toLocaleString('id-ID')}) melebihi saldo kasbon terutang (Rp ${rec.current_kasbon_balance.toLocaleString('id-ID')}).`
        );
      }

      const finalNetPay = Math.max(0, availableSalary - finalKasbonDeduction);
      const payrollRecordId = `rec-${periodId}-${rec.employee_id}`;

      const savedRecord: PayrollRecord = {
        id: payrollRecordId,
        payroll_period_id: periodId,
        employee_id: rec.employee_id,
        salary_mode: rec.salary_mode,
        total_regular_hours: rec.total_regular_hours,
        total_overtime_hours: rec.total_overtime_hours,
        regular_pay: rec.regular_pay,
        overtime_pay: rec.overtime_pay,
        manual_allowances: rec.manual_allowances,
        gross_pay: rec.gross_pay,
        cash_advance_deduction: finalKasbonDeduction,
        other_deductions: rec.other_deductions,
        net_pay: finalNetPay,
        payment_status: 'PENDING',
      };

      this.data.payroll_records.push(savedRecord);
      createdRecords.push(savedRecord);

      // Save payroll items
      for (const it of rec.items) {
        this.data.payroll_items.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          payroll_record_id: payrollRecordId,
          description: it.description,
          amount: it.amount,
          type: it.type,
        });
      }

      // Add PAYROLL_DEDUCTION transaction to kasbon ledger if deduction > 0
      if (finalKasbonDeduction > 0) {
        this.data.cash_advance_transactions.push({
          id: `kasbon-ded-${periodId}-${rec.employee_id}`,
          employee_id: rec.employee_id,
          date: period_end,
          type: 'PAYROLL_DEDUCTION',
          amount: finalKasbonDeduction,
          notes: `Potongan otomatis penggajian periode ${period_start} s/d ${period_end}`,
          payroll_period_id: periodId,
          created_by: performed_by,
        });
      }
    }

    // Add period to periods list
    this.data.payroll_periods.unshift(newPeriod);

    this.logAudit(
      'CLOSE_PERIOD',
      'PAYROLL_PERIOD',
      periodId,
      `Penutupan periode ${period_start} s/d ${period_end}: ${createdRecords.length} slip gaji terkunci. Total gaji bersih Rp ${createdRecords.reduce((sum, r) => sum + r.net_pay, 0).toLocaleString('id-ID')}`,
      performed_by
    );

    this.save();
    return newPeriod;
  }

  public reopenPeriod(period_id: string, admin_pin: string, reason: string, performed_by: string): PayrollPeriod {
    if (!this.verifyAdminPin(admin_pin)) {
      throw new Error('PIN Administrator salah. Pembukaan kembali periode ditolak.');
    }

    if (!reason || reason.trim().length < 5) {
      throw new Error('Alasan pembukaan kembali periode wajib diisi minimal 5 karakter.');
    }

    const period = this.data.payroll_periods.find((p) => p.id === period_id);
    if (!period) throw new Error('Periode tidak ditemukan.');
    if (period.status !== 'CLOSED') throw new Error('Hanya periode yang berstatus CLOSED yang dapat dibuka kembali.');

    period.status = 'DRAFT';
    period.reopened_at = new Date().toISOString();
    period.reopened_by = performed_by;
    period.reopen_reason = reason;

    // Reverse kasbon deductions associated with this period
    this.data.cash_advance_transactions = this.data.cash_advance_transactions.filter(
      (t) => !(t.payroll_period_id === period_id && t.type === 'PAYROLL_DEDUCTION')
    );

    // Remove frozen payroll records & items so it can be recomputed
    const recordIds = new Set(
      this.data.payroll_records.filter((r) => r.payroll_period_id === period_id).map((r) => r.id)
    );
    this.data.payroll_records = this.data.payroll_records.filter((r) => r.payroll_period_id !== period_id);
    this.data.payroll_items = this.data.payroll_items.filter((item) => !recordIds.has(item.payroll_record_id));

    this.logAudit('REOPEN_PERIOD', 'PAYROLL_PERIOD', period_id, `Pembukaan kembali periode ${period.period_start} s/d ${period.period_end}: ${reason}`, performed_by);
    this.save();
    return period;
  }

  public getPayrollRecordsForPeriod(period_id: string): PayrollRecord[] {
    const empMap = new Map(this.data.employees.map((e) => [e.id, e]));
    const deptMap = new Map(this.data.departments.map((d) => [d.id, d.name]));

    return this.data.payroll_records
      .filter((r) => r.payroll_period_id === period_id)
      .map((r) => {
        const emp = empMap.get(r.employee_id);
        const items = this.data.payroll_items.filter((item) => item.payroll_record_id === r.id);
        return {
          ...r,
          employee_name: emp?.name || 'Unknown',
          employee_code: emp?.employee_code || '-',
          department_name: emp ? deptMap.get(emp.department_id) : '-',
          items,
        };
      });
  }

  public setPayrollPaymentStatus(record_id: string, status: 'PENDING' | 'PAID', performed_by: string): PayrollRecord {
    const rec = this.data.payroll_records.find((r) => r.id === record_id);
    if (!rec) throw new Error('Catatan gaji tidak ditemukan');

    rec.payment_status = status;
    rec.paid_at = status === 'PAID' ? new Date().toISOString() : undefined;

    this.logAudit('UPDATE_PAYMENT_STATUS', 'PAYROLL_RECORD', record_id, `Status pembayaran gaji diubah menjadi ${status}`, performed_by);
    this.save();
    return rec;
  }

  // --- Employee Notes ---
  public getEmployeeNotes(employee_id: string): EmployeeNote[] {
    return this.data.employee_notes
      .filter((n) => n.employee_id === employee_id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addEmployeeNote(employee_id: string, note: string, author: string): EmployeeNote {
    const newNote: EmployeeNote = {
      id: `note-${Date.now()}`,
      employee_id,
      note,
      author,
      created_at: new Date().toISOString(),
    };
    this.data.employee_notes.unshift(newNote);
    this.logAudit('ADD_NOTE', 'EMPLOYEE_NOTE', newNote.id, `Catatan karyawan ditambahkan untuk ID ${employee_id}`, author);
    this.save();
    return newNote;
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return this.data.audit_logs.slice(0, 150);
  }
}

export const db = new MakareDatabase();
