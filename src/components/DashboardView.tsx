import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  Flame,
  WalletCards,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Shield,
  Play,
  Square,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { OperationalSummary, AttendanceSession, Employee } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenKiosk: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenKiosk }) => {
  const { isAdmin } = useAuth();
  const [summary, setSummary] = useState<OperationalSummary | null>(null);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const today = new Date().toISOString().split('T')[0];
      const [sum, att, emps] = await Promise.all([
        api.getSummary(),
        api.getAttendance(today),
        api.getEmployees(),
      ]);
      setSummary(sum);
      setSessions(att);
      setEmployees(emps);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data ringkasan dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openSessions = sessions.filter((s) => !s.check_out_at);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white rounded-xl border border-[#D9E0E8] p-5 lg:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold tracking-tight text-[#173B67]">
              Dashboard Operasional MAKARE
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-[#173B67] font-semibold border border-blue-200">
              Live
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {summary?.company_settings?.company_name || 'PT MAKARE NUSANTARA'} · Jadwal Hari Ini:{' '}
            <span className="font-semibold text-slate-700">
              {summary?.company_settings?.start_time || '08:00'} -{' '}
              {summary?.company_settings?.end_time || '17:00'} WIB
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={onOpenKiosk}
            className="flex-1 md:flex-none px-4 py-2 text-xs font-semibold text-white bg-[#173B67] hover:bg-[#122f52] rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <span>Layar Kios Absensi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          {isAdmin && (
            <button
              onClick={() => onNavigate('payroll')}
              className="flex-1 md:flex-none px-4 py-2 text-xs font-semibold text-[#173B67] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Periksa Payroll</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid (4 structured metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Karyawan Aktif */}
        <div
          onClick={() => isAdmin && onNavigate('employees')}
          className={`bg-white rounded-xl border border-[#D9E0E8] p-5 shadow-xs transition-all ${
            isAdmin ? 'hover:border-slate-300 cursor-pointer' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Karyawan Aktif
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#173B67] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {summary ? summary.active_employees : '—'}{' '}
            <span className="text-xs font-normal text-slate-400">/ {summary?.total_employees || 0}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Terdaftar dalam sistem</div>
        </div>

        {/* Metric 2: Kehadiran Hari Ini */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white rounded-xl border border-[#D9E0E8] p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hadir Hari Ini
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {summary ? summary.checked_in_today : '—'}
          </div>
          <div className="text-[11px] text-emerald-800 font-medium mt-1">
            {summary?.open_sessions_count || 0} sesi aktif sedang berjalan
          </div>
        </div>

        {/* Metric 3: Lembur Hari Ini */}
        <div
          onClick={() => onNavigate('overtime')}
          className="bg-white rounded-xl border border-[#D9E0E8] p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lembur Hari Ini
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {summary ? summary.overtime_sessions_today : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Status Lembur: {summary?.overtime_enabled ? 'Aktif' : 'Nonaktif'}
          </div>
        </div>

        {/* Metric 4: Total Kasbon Terutang (Admin only) */}
        {isAdmin ? (
          <div
            onClick={() => onNavigate('kasbon')}
            className="bg-white rounded-xl border border-[#D9E0E8] p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Kasbon Terutang
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <WalletCards className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              Rp {summary ? summary.total_active_kasbon.toLocaleString('id-ID') : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Dipotong saat penutupan periode</div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#D9E0E8] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Periode Aktif
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#173B67] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-base font-bold text-slate-900 truncate">
              {summary?.active_period?.period_start} s/d {summary?.active_period?.period_end}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Status: Berjalan (Draft)</div>
          </div>
        )}
      </div>

      {/* Alert if open unclosed sessions exist */}
      {openSessions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
            <div className="text-xs text-amber-900">
              <span className="font-semibold">{openSessions.length} Sesi Masuk Belum Selesai (Check-Out):</span>{' '}
              {openSessions.map((s) => s.employee_name).join(', ')}.
            </div>
          </div>
          <button
            onClick={() => onNavigate('attendance')}
            className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            Tinjau Absensi
          </button>
        </div>
      )}

      {/* Main Grid: Active Shifts & Payroll Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Shift Attendance Today */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#D9E0E8] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Sesi Kerja Hari Ini</h3>
                <p className="text-xs text-slate-500">Pencatatan langsung per jam & snapshot tarif</p>
              </div>
              <button
                onClick={() => onNavigate('attendance')}
                className="text-xs font-medium text-[#173B67] hover:underline cursor-pointer"
              >
                Lihat Seluruhnya →
              </button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Belum ada catatan absensi untuk hari ini. Gunakan Kios Absensi atau menu Absensi Reguler.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-medium">
                      <th className="pb-2">Karyawan</th>
                      <th className="pb-2">Departemen</th>
                      <th className="pb-2">Waktu Masuk</th>
                      <th className="pb-2">Waktu Keluar</th>
                      <th className="pb-2 text-right">Tarif Snapshot</th>
                      <th className="pb-2 text-right">Durasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sessions.slice(0, 6).map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 font-medium text-slate-900">
                          {s.employee_name} <span className="text-slate-400 font-mono text-[11px]">({s.employee_code})</span>
                        </td>
                        <td className="py-2.5 text-slate-600">{s.department_name}</td>
                        <td className="py-2.5 font-mono text-slate-700">
                          {new Date(s.check_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 font-mono">
                          {s.check_out_at ? (
                            new Date(s.check_out_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                          ) : (
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Aktif
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-right font-mono tabular-nums text-slate-700">
                          Rp {s.hourly_rate_snapshot.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 text-right font-mono tabular-nums text-slate-900 font-medium">
                          {s.duration_minutes > 0 ? `${(s.duration_minutes / 60).toFixed(2)} jam` : 'Berjalan'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Active Period & Closing Status */}
        <div className="bg-white rounded-xl border border-[#D9E0E8] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-[#173B67]" />
              <h3 className="font-semibold text-slate-900 text-sm">Status Periode Penggajian</h3>
            </div>

            {summary?.active_period ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Rentang Periode:</span>
                    <span className="font-semibold text-slate-900">
                      {summary.active_period.period_start} s/d {summary.active_period.period_end}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Status:</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#173B67] font-semibold text-[11px]">
                      {summary.active_period.status} (Terbuka)
                    </span>
                  </div>
                  <div className="text-slate-500 pt-1 border-t border-slate-200 text-[11px]">
                    {summary.active_period.notes || 'Periode operasional berjalan'}
                  </div>
                </div>

                <div className="text-slate-600 leading-relaxed text-xs">
                  Penutupan periode akan memvalidasi seluruh absensi, mengunci snapshot tarif, dan memotong saldo kasbon secara atomik dan idempoten.
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                Tidak ada periode aktif yang terbuka.
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => onNavigate('payroll')}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#173B67] hover:bg-[#122f52] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Buka Modul Penggajian</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
