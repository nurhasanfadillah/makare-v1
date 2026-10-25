import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './src/server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Request audit context helper
function getActor(req: Request): string {
  const role = req.headers['x-user-role'] as string || 'ADMIN';
  const name = req.headers['x-user-name'] as string || (role === 'ADMIN' ? 'Administrator' : role === 'OPERATOR' ? 'Operator Input' : 'Kiosk Terminal');
  return name;
}

// RBAC Middleware Helper
function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req.headers['x-user-role'] as string) || 'ADMIN';
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        error: `Akses ditolak. Peran '${role}' tidak diizinkan melakukan tindakan ini.`,
      });
    }
    next();
  };
}

// --- API Endpoints ---

// 1. Operational Summary & Settings
app.get('/api/summary', (req: Request, res: Response) => {
  try {
    const summary = db.getSummary();
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/settings', (req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    // Mask admin pin for security when returning to client
    res.json({
      ...settings,
      admin_pin: '••••',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const updated = db.updateSettings(req.body, actor);
    res.json({
      ...updated,
      admin_pin: '••••',
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/verify-admin-pin', (req: Request, res: Response) => {
  try {
    const { pin } = req.body;
    const isValid = db.verifyAdminPin(pin);
    if (!isValid) {
      return res.status(401).json({ error: 'PIN Administrator salah.' });
    }
    res.json({ success: true, message: 'Verifikasi PIN Administrator berhasil.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Departments
app.get('/api/departments', (req: Request, res: Response) => {
  try {
    res.json(db.getDepartments());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/departments', requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ error: 'Nama dan kode departemen wajib diisi.' });
    const actor = getActor(req);
    const dept = db.addDepartment(name, code, actor);
    res.json(dept);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Employees
app.get('/api/employees', (req: Request, res: Response) => {
  try {
    const employees = db.getEmployees();
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/employees/rate-history', requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    const empId = req.query.employee_id as string | undefined;
    res.json(db.getRateHistory(empId));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/employees/:id', (req: Request, res: Response) => {
  try {
    const emp = db.getEmployeeById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Karyawan tidak ditemukan.' });
    res.json(emp);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employees', requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const saved = db.saveEmployee(req.body, actor);
    res.json(saved);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 4. Attendance (Hourly sessions & Manual status)
app.get('/api/attendance', (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    const sessions = db.getAttendanceSessions(date);
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/attendance/status', (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    const records = db.getAttendanceStatusRecords(date);
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/attendance/clock-in', (req: Request, res: Response) => {
  try {
    const { employee_id, source = 'INTERNAL', custom_work_date } = req.body;
    if (!employee_id) return res.status(400).json({ error: 'ID Karyawan wajib disertakan.' });
    const actor = getActor(req);
    const session = db.clockIn(employee_id, source, actor, custom_work_date);
    res.json(session);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/attendance/clock-out', (req: Request, res: Response) => {
  try {
    const { employee_id, early_checkout_reason, admin_pin } = req.body;
    if (!employee_id) return res.status(400).json({ error: 'ID Karyawan wajib disertakan.' });

    let authorizedBy: string | undefined = undefined;

    // Check if early checkout requirement applies
    if (admin_pin) {
      if (!db.verifyAdminPin(admin_pin)) {
        return res.status(401).json({ error: 'PIN Administrator salah untuk otorisasi pulang awal.' });
      }
      authorizedBy = 'Administrator (PIN Verified)';
    }

    const actor = getActor(req);
    const session = db.clockOut(employee_id, early_checkout_reason, authorizedBy, actor);
    res.json(session);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/attendance/status', requireRole(['ADMIN', 'OPERATOR']), (req: Request, res: Response) => {
  try {
    const { employee_id, date, status, notes } = req.body;
    if (!employee_id || !date || !status) {
      return res.status(400).json({ error: 'ID Karyawan, tanggal, dan status wajib diisi.' });
    }
    const actor = getActor(req);
    const record = db.setAttendanceStatus(employee_id, date, status, notes, actor);
    res.json(record);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 5. Overtime (Absensi Lembur)
app.get('/api/overtime', (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    res.json(db.getOvertimeSessions(date));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/overtime/start', requireRole(['ADMIN', 'OPERATOR']), (req: Request, res: Response) => {
  try {
    const { employee_id, notes } = req.body;
    if (!employee_id) return res.status(400).json({ error: 'ID Karyawan wajib diisi.' });
    const actor = getActor(req);
    const session = db.startOvertime(employee_id, notes, actor);
    res.json(session);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/overtime/end', requireRole(['ADMIN', 'OPERATOR']), (req: Request, res: Response) => {
  try {
    const { employee_id } = req.body;
    if (!employee_id) return res.status(400).json({ error: 'ID Karyawan wajib diisi.' });
    const actor = getActor(req);
    const session = db.endOvertime(employee_id, actor);
    res.json(session);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 6. Kasbon (Cash Advance Ledger)
app.get('/api/kasbon/balances', requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    res.json(db.getKasbonBalances());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/kasbon/transactions', requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    const empId = req.query.employee_id as string | undefined;
    res.json(db.getKasbonTransactions(empId));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/kasbon/transactions', requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const tx = db.addKasbonTransaction(req.body, actor);
    res.json(tx);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 7. Payroll & Period Closing
app.get('/api/payroll/periods', requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    res.json(db.getPayrollPeriods());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payroll/validate-consistency', requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    const { period_start, period_end } = req.body;
    if (!period_start || !period_end) {
      return res.status(400).json({ error: 'Tanggal awal dan akhir periode wajib disertakan.' });
    }
    const report = db.validatePeriodConsistency(period_start, period_end);
    res.json(report);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/payroll/preview', requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    const { period_start, period_end } = req.body;
    if (!period_start || !period_end) {
      return res.status(400).json({ error: 'Tanggal awal dan akhir periode wajib disertakan.' });
    }
    const preview = db.calculatePeriodPreview(period_start, period_end);
    res.json(preview);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/payroll/close', requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    const { period_start, period_end, notes, adjusted_deductions = {} } = req.body;
    if (!period_start || !period_end) {
      return res.status(400).json({ error: 'Tanggal awal dan akhir periode wajib disertakan.' });
    }
    const actor = getActor(req);
    const closed = db.closePeriod(period_start, period_end, notes, adjusted_deductions, actor);
    res.json(closed);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/payroll/reopen', requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    const { period_id, admin_pin, reason } = req.body;
    if (!period_id || !admin_pin || !reason) {
      return res.status(400).json({ error: 'ID Periode, PIN Admin, dan alasan pembukaan kembali wajib diisi.' });
    }
    const actor = getActor(req);
    const reopened = db.reopenPeriod(period_id, admin_pin, reason, actor);
    res.json(reopened);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/payroll/records/:period_id', requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    const records = db.getPayrollRecordsForPeriod(req.params.period_id);
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payroll/records/:id/status', requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !['PENDING', 'PAID'].includes(status)) {
      return res.status(400).json({ error: 'Status harus bernilai PENDING atau PAID.' });
    }
    const actor = getActor(req);
    const updated = db.setPayrollPaymentStatus(req.params.id, status, actor);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 8. Employee Notes
app.get('/api/notes/:employee_id', requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    res.json(db.getEmployeeNotes(req.params.employee_id));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notes', requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    const { employee_id, note } = req.body;
    if (!employee_id || !note) {
      return res.status(400).json({ error: 'ID Karyawan dan isi catatan wajib disertakan.' });
    }
    const author = getActor(req);
    const saved = db.addEmployeeNote(employee_id, note, author);
    res.json(saved);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 9. Audit Logs
app.get('/api/audit', requireRole(['ADMIN']), (req: Request, res: Response) => {
  try {
    res.json(db.getAuditLogs());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Vite Middleware integration for Full-Stack React ---
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MAKARE server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
