import React, { useState, useEffect } from 'react';
import {
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  LogOut,
  Flame,
  User,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Employee, AttendanceSession, OvertimeSession, CompanySettings } from '../types/index.ts';
import { AdminPinModal } from './AdminPinModal.tsx';

interface KioskModeProps {
  onClose: () => void;
  onRefreshData?: () => void;
}

export const KioskMode: React.FC<KioskModeProps> = ({ onClose, onRefreshData }) => {
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [search, setSearch] = useState('');
  const [attendanceType, setAttendanceType] = useState<'REGULAR' | 'OVERTIME'>('REGULAR');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [todaySessions, setTodaySessions] = useState<AttendanceSession[]>([]);
  const [todayOvertime, setTodayOvertime] = useState<OvertimeSession[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Early checkout states
  const [earlyCheckoutEmp, setEarlyCheckoutEmp] = useState<Employee | null>(null);
  const [earlyReason, setEarlyReason] = useState('Keperluan mendesak');
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [showExitPinModal, setShowExitPinModal] = useState(false);

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setDateStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const [empData, attData, otData, setts] = await Promise.all([
        api.getEmployees(),
        api.getAttendance(today),
        api.getOvertime(today),
        api.getSettings(),
      ]);

      setEmployees(empData.filter((e) => e.is_active));
      setTodaySessions(attData);
      setTodayOvertime(otData);
      setSettings(setts);
    } catch (e: any) {
      setFeedback({ type: 'error', message: 'Gagal memuat data kios: ' + e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isEarlyCheckoutTime = (): boolean => {
    if (!settings?.end_time) return false;
    const now = new Date();
    const [endH, endM] = settings.end_time.split(':').map(Number);
    const endMinutes = endH * 60 + endM;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return currentMinutes < endMinutes;
  };

  const handleClockIn = async (emp: Employee) => {
    try {
      setSubmittingId(emp.id);
      setFeedback(null);
      if (attendanceType === 'REGULAR') {
        await api.clockIn(emp.id, 'PUBLIC_KIOSK');
        setFeedback({
          type: 'success',
          message: `Selamat Bekerja, ${emp.name}! Masuk berhasil dicatat (Tarif snapshot: Rp ${(emp.default_hourly_rate || 0).toLocaleString('id-ID')}/jam).`,
        });
      } else {
        await api.startOvertime(emp.id, 'Lembur Kios Mandiri');
        setFeedback({
          type: 'success',
          message: `Lembur Aktif: ${emp.name} (Tarif snapshot: Rp ${(emp.default_overtime_rate || 0).toLocaleString('id-ID')}/jam).`,
        });
      }
      await loadData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleClockOutClick = (emp: Employee) => {
    if (attendanceType === 'REGULAR') {
      if (isEarlyCheckoutTime()) {
        // Must prompt for admin PIN
        setEarlyCheckoutEmp(emp);
        setShowAdminPinModal(true);
        return;
      }
      executeClockOut(emp.id);
    } else {
      executeOvertimeEnd(emp.id);
    }
  };

  const executeClockOut = async (empId: string, pin?: string, reason?: string) => {
    try {
      setSubmittingId(empId);
      setFeedback(null);
      const session = await api.clockOut(empId, reason, pin);
      const durationHours = (session.duration_minutes / 60).toFixed(2);
      setFeedback({
        type: 'success',
        message: `Terima Kasih! Keluar berhasil dicatat. Durasi kerja: ${session.duration_minutes} menit (${durationHours} jam).`,
      });
      await loadData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmittingId(null);
    }
  };

  const executeOvertimeEnd = async (empId: string) => {
    try {
      setSubmittingId(empId);
      setFeedback(null);
      const ot = await api.endOvertime(empId);
      const durationHours = (ot.duration_minutes / 60).toFixed(2);
      setFeedback({
        type: 'success',
        message: `Selesai Lembur! Durasi: ${ot.duration_minutes} menit (${durationHours} jam).`,
      });
      await loadData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employee_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F6F9] flex flex-col overflow-hidden">
      {/* Kiosk Header */}
      <header className="bg-[#173B67] text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg">
            M
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">KIOS ABSENSI MANDIRI</h1>
            <p className="text-xs text-blue-200">
              {settings?.company_name || 'PT MAKARE NUSANTARA'} · Terminal Terintegrasi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-3xl font-bold font-mono tracking-wider tabular-nums text-emerald-400">
              {time || '00:00:00'}
            </div>
            <div className="text-xs text-blue-200">{dateStr}</div>
          </div>

          <button
            onClick={() => setShowExitPinModal(true)}
            title="Keluar dari Mode Kios (Otorisasi Admin)"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Tutup Kios</span>
          </button>
        </div>
      </header>

      {/* Shift Info Banner */}
      <div className="bg-white border-b border-[#D9E0E8] px-6 py-2.5 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-800">Jadwal Shift:</span>
          <span>{settings?.start_time || '08:00'} — {settings?.end_time || '17:00'} WIB</span>
          <span className="hidden sm:inline">· Toleransi Keterlambatan: {settings?.late_tolerance_minutes || 15} Menit</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-emerald-800">Terminal Aktif</span>
        </div>
      </div>

      {/* Main Kiosk Viewport */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full flex flex-col gap-5">
        {/* Feedback alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between shadow-xs ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                : 'bg-red-50 border border-red-300 text-red-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span className="text-sm font-medium">{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Controls Toolbar: Mode switcher & Search */}
        <div className="bg-white p-4 rounded-xl border border-[#D9E0E8] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setAttendanceType('REGULAR')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                attendanceType === 'REGULAR'
                  ? 'bg-white text-[#173B67] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Absensi Reguler</span>
            </button>
            <button
              onClick={() => setAttendanceType('OVERTIME')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                attendanceType === 'OVERTIME'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Absensi Lembur</span>
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ketik Nama atau Kode Karyawan..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67] focus:bg-white"
            />
          </div>
        </div>

        {/* Employee Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 animate-pulse p-4"></div>
            ))}
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
            Tidak ditemukan karyawan aktif yang sesuai dengan pencarian &ldquo;{search}&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
            {filteredEmployees.map((emp) => {
              const activeSession = todaySessions.find(
                (s) => s.employee_id === emp.id && !s.check_out_at
              );
              const completedSession = todaySessions.find(
                (s) => s.employee_id === emp.id && s.check_out_at
              );

              const activeOt = todayOvertime.find(
                (s) => s.employee_id === emp.id && !s.end_at
              );
              const completedOt = todayOvertime.find(
                (s) => s.employee_id === emp.id && s.end_at
              );

              const isHourly = emp.salary_mode === 'HOURLY';
              const isWorkingRegular = Boolean(activeSession);
              const isWorkingOt = Boolean(activeOt);

              const isSubmitting = submittingId === emp.id;

              return (
                <div
                  key={emp.id}
                  className="bg-white rounded-xl border border-[#D9E0E8] p-4 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                        {emp.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 text-base">{emp.name}</h3>
                          <span className="font-mono text-xs text-slate-500">({emp.employee_code})</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{emp.department_name}</span>
                          <span>·</span>
                          <span>{emp.salary_mode === 'HOURLY' ? 'Gaji Per Jam' : 'Gaji Bulanan'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="text-right">
                      {attendanceType === 'REGULAR' ? (
                        isWorkingRegular ? (
                          <div
                            className={`text-xs font-medium px-2.5 py-1 rounded-md border ${
                              activeSession!.is_late
                                ? 'text-amber-800 bg-amber-50 border-amber-300'
                                : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                            }`}
                          >
                            <div>Masuk: {new Date(activeSession!.check_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                            <div className="text-[10px] font-semibold mt-0.5">
                              {activeSession!.is_late ? `Terlambat ${activeSession!.late_minutes} mnt` : 'Tepat Waktu'}
                            </div>
                          </div>
                        ) : completedSession ? (
                          <div className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                            Sudah Selesai ({completedSession.duration_minutes} mnt)
                          </div>
                        ) : (
                          <div className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md">
                            Belum Masuk
                          </div>
                        )
                      ) : isWorkingOt ? (
                        <div className="text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                          Lembur Sejak: {new Date(activeOt!.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      ) : completedOt ? (
                        <div className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                          Lembur Selesai ({completedOt.duration_minutes} mnt)
                        </div>
                      ) : (
                        <div className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md">
                          Belum Lembur
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    {attendanceType === 'REGULAR' ? (
                      isWorkingRegular ? (
                        <button
                          onClick={() => handleClockOutClick(emp)}
                          disabled={isSubmitting}
                          className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{isSubmitting ? 'Memproses...' : 'Catat Keluar (Check-Out)'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleClockIn(emp)}
                          disabled={isSubmitting}
                          className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-[#173B67] hover:bg-[#122f52] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{isSubmitting ? 'Memproses...' : 'Catat Masuk (Check-In)'}</span>
                        </button>
                      )
                    ) : isWorkingOt ? (
                      <button
                        onClick={() => handleClockOutClick(emp)}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Memproses...' : 'Selesai Lembur'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleClockIn(emp)}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Memproses...' : 'Mulai Lembur'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Early Checkout Modal with Admin PIN verification */}
      <AdminPinModal
        isOpen={showAdminPinModal}
        onClose={() => {
          setShowAdminPinModal(false);
          setEarlyCheckoutEmp(null);
        }}
        title="Otorisasi Pulang Awal (Sebelum 17:00)"
        description={`Karyawan ${earlyCheckoutEmp?.name} (${earlyCheckoutEmp?.employee_code}) melakukan Check-Out sebelum jam kerja reguler selesai. Diperlukan verifikasi PIN Administrator.`}
        actionButtonLabel="Konfirmasi Pulang Awal"
        onSuccess={() => {
          const emp = earlyCheckoutEmp;
          setShowAdminPinModal(false);
          setEarlyCheckoutEmp(null);
          if (emp) {
            executeClockOut(emp.id, '8899', earlyReason);
          }
        }}
      />

      {/* Exit Kiosk Confirmation with Admin PIN */}
      <AdminPinModal
        isOpen={showExitPinModal}
        onClose={() => setShowExitPinModal(false)}
        title="Tutup Mode Kios Publik"
        description="Kembali ke antarmuka aplikasi manajemen MAKARE memerlukan otorisasi PIN Administrator."
        actionButtonLabel="Buka Kunci & Keluar Kios"
        onSuccess={() => {
          setShowExitPinModal(false);
          onClose();
        }}
      />
    </div>
  );
};
