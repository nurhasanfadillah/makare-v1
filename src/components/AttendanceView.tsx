import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  LogOut,
  UserCheck,
  Search,
  Filter,
  Check,
  X,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Employee, AttendanceSession, AttendanceStatusRecord, CompanySettings } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { AdminPinModal } from './AdminPinModal.tsx';

export const AttendanceView: React.FC = () => {
  const { isAdmin } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [statusRecords, setStatusRecords] = useState<AttendanceStatusRecord[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tabType, setTabType] = useState<'HOURLY' | 'MANUAL'>('HOURLY');

  // Early checkout states
  const [earlyCheckoutEmp, setEarlyCheckoutEmp] = useState<Employee | null>(null);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [earlyReason, setEarlyReason] = useState('Pulang lebih awal atas izin supervisor');

  const loadData = async (dateToLoad: string) => {
    try {
      setLoading(true);
      setError(null);
      const [emps, attSessions, attStatus, setts] = await Promise.all([
        api.getEmployees(),
        api.getAttendance(dateToLoad),
        api.getAttendanceStatus(dateToLoad),
        api.getSettings(),
      ]);
      setEmployees(emps.filter((e) => e.is_active));
      setSessions(attSessions);
      setStatusRecords(attStatus);
      setSettings(setts);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat absensi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  const handleClockIn = async (employee_id: string) => {
    try {
      setError(null);
      await api.clockIn(employee_id, 'INTERNAL', selectedDate);
      setSuccessMsg('Check-In berhasil dicatat dengan snapshot tarif terkunci.');
      await loadData(selectedDate);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleClockOut = async (emp: Employee) => {
    // Check if early checkout applies
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    if (selectedDate === today && settings?.end_time) {
      const [endH, endM] = settings.end_time.split(':').map(Number);
      const endMinutes = endH * 60 + endM;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      if (currentMinutes < endMinutes) {
        setEarlyCheckoutEmp(emp);
        setShowAdminPinModal(true);
        return;
      }
    }

    try {
      setError(null);
      await api.clockOut(emp.id);
      setSuccessMsg(`Check-Out berhasil untuk ${emp.name}.`);
      await loadData(selectedDate);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (
    employee_id: string,
    status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ABSEN',
    notes: string = ''
  ) => {
    try {
      setError(null);
      await api.recordStatus(employee_id, selectedDate, status, notes);
      setSuccessMsg(`Status ${status} berhasil disimpan.`);
      await loadData(selectedDate);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const hourlyEmployees = employees.filter(
    (e) =>
      e.salary_mode === 'HOURLY' &&
      (e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.employee_code.toLowerCase().includes(search.toLowerCase()))
  );

  const manualEmployees = employees.filter(
    (e) =>
      e.salary_mode === 'MANUAL' &&
      (e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.employee_code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Picker */}
      <div className="bg-white rounded-xl border border-[#D9E0E8] p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#173B67]">
            Absensi Reguler Harian
          </h2>
          <p className="text-xs text-slate-500">
            Pencatatan sesi kerja karyawan per jam dan konfirmasi status (Hadir, Sakit, Izin, Absen) karyawan bulanan.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-hidden"
            />
          </div>
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Hari Ini
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mode Sub-tabs (Hourly vs Manual) */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center p-1 bg-white border border-[#D9E0E8] rounded-xl shadow-xs w-full sm:w-auto">
          <button
            onClick={() => setTabType('HOURLY')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              tabType === 'HOURLY'
                ? 'bg-[#173B67] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Karyawan Per Jam (Hourly) ({hourlyEmployees.length})</span>
          </button>
          <button
            onClick={() => setTabType('MANUAL')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              tabType === 'MANUAL'
                ? 'bg-[#173B67] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Karyawan Manual / Bulanan ({manualEmployees.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari karyawan..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
          />
        </div>
      </div>

      {/* Hourly Employees Table */}
      {tabType === 'HOURLY' ? (
        <div className="bg-white rounded-xl border border-[#D9E0E8] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-[#D9E0E8] text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Karyawan</th>
                  <th className="py-3 px-4">Departemen</th>
                  <th className="py-3 px-4">Jam Masuk</th>
                  <th className="py-3 px-4">Jam Keluar</th>
                  <th className="py-3 px-4 text-right">Tarif Snapshot</th>
                  <th className="py-3 px-4 text-right">Durasi Aktual</th>
                  <th className="py-3 px-4 text-center">Aksi Masuk / Keluar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hourlyEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Tidak ada karyawan gaji per jam.
                    </td>
                  </tr>
                ) : (
                  hourlyEmployees.map((emp) => {
                    const session = sessions.find((s) => s.employee_id === emp.id);
                    const isWorking = Boolean(session && !session.check_out_at);
                    const isCompleted = Boolean(session && session.check_out_at);

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{emp.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">{emp.employee_code}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{emp.department_name}</td>
                        <td className="py-3 px-4">
                          {session ? (
                            <div>
                              <div className="font-mono text-slate-800 font-medium">
                                {new Date(session.check_in_at).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                              {session.is_late ? (
                                <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5 inline-block">
                                  Terlambat {session.late_minutes} mnt
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5 inline-block">
                                  Tepat Waktu
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-800">
                          {session?.check_out_at ? (
                            new Date(session.check_out_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          ) : isWorking ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                              Sedang Bekerja
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">
                          {session
                            ? `Rp ${session.hourly_rate_snapshot.toLocaleString('id-ID')}`
                            : `Rp ${emp.default_hourly_rate.toLocaleString('id-ID')} (default)`}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 font-medium">
                          {session && session.duration_minutes > 0
                            ? `${session.duration_minutes} mnt (${(session.duration_minutes / 60).toFixed(2)} jam)`
                            : isWorking
                            ? 'Berjalan...'
                            : '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isWorking ? (
                            <button
                              onClick={() => handleClockOut(emp)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 mx-auto"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Catat Keluar</span>
                            </button>
                          ) : isCompleted ? (
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-md">
                              Selesai Hari Ini
                            </span>
                          ) : (
                            <button
                              onClick={() => handleClockIn(emp.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#173B67] hover:bg-[#122f52] rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 mx-auto"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Catat Masuk</span>
                            </button>
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
      ) : (
        /* Manual Employees Status Table */
        <div className="bg-white rounded-xl border border-[#D9E0E8] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-[#D9E0E8] text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Karyawan</th>
                  <th className="py-3 px-4">Departemen</th>
                  <th className="py-3 px-4">Status Konfirmasi</th>
                  <th className="py-3 px-4">Catatan Keterangan</th>
                  <th className="py-3 px-4 text-center">Ubah Status Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {manualEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Tidak ada karyawan bergaji manual.
                    </td>
                  </tr>
                ) : (
                  manualEmployees.map((emp) => {
                    const record = statusRecords.find((r) => r.employee_id === emp.id);
                    const currentStatus = record?.status || 'ABSEN';

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{emp.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">{emp.employee_code}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{emp.department_name}</td>
                        <td className="py-3 px-4">
                          {currentStatus === 'HADIR' ? (
                            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                              Hadir
                            </span>
                          ) : currentStatus === 'SAKIT' ? (
                            <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                              Sakit (Surat Dokter)
                            </span>
                          ) : currentStatus === 'IZIN' ? (
                            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                              Izin Resmi
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold">
                              Absen / Belum Konfirmasi
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {record?.notes || '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 gap-1">
                            <button
                              onClick={() => handleStatusChange(emp.id, 'HADIR')}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                currentStatus === 'HADIR'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Hadir
                            </button>
                            <button
                              onClick={() => handleStatusChange(emp.id, 'SAKIT', 'Keterangan Sakit')}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                currentStatus === 'SAKIT'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Sakit
                            </button>
                            <button
                              onClick={() => handleStatusChange(emp.id, 'IZIN', 'Izin Resmi')}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                currentStatus === 'IZIN'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Izin
                            </button>
                            <button
                              onClick={() => handleStatusChange(emp.id, 'ABSEN', 'Tidak ada konfirmasi')}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                currentStatus === 'ABSEN'
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Absen
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Pin modal for early checkout */}
      <AdminPinModal
        isOpen={showAdminPinModal}
        onClose={() => {
          setShowAdminPinModal(false);
          setEarlyCheckoutEmp(null);
        }}
        title="Otorisasi Pulang Awal (Sebelum 17:00)"
        description={`Karyawan ${earlyCheckoutEmp?.name} (${earlyCheckoutEmp?.employee_code}) melakukan Check-Out sebelum jam kerja reguler selesai (${settings?.end_time || '17:00'}). Diperlukan verifikasi PIN Administrator.`}
        actionButtonLabel="Verifikasi & Simpan Check-Out"
        onSuccess={async () => {
          const emp = earlyCheckoutEmp;
          setShowAdminPinModal(false);
          setEarlyCheckoutEmp(null);
          if (emp) {
            try {
              await api.clockOut(emp.id, earlyReason, '8899');
              setSuccessMsg(`Check-Out pulang awal berhasil diverifikasi untuk ${emp.name}.`);
              await loadData(selectedDate);
            } catch (err: any) {
              setError(err.message);
            }
          }
        }}
      />
    </div>
  );
};
