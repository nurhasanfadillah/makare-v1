import React, { useState, useEffect } from 'react';
import {
  Flame,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Play,
  Square,
  X,
  Search,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Employee, OvertimeSession, CompanySettings } from '../types/index.ts';

export const OvertimeView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [overtimeSessions, setOvertimeSessions] = useState<OvertimeSession[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Start Overtime Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [notes, setNotes] = useState('Pengejaran kuota produksi ekspor');

  const loadData = async (dateToLoad: string) => {
    try {
      setLoading(true);
      setError(null);
      const [emps, ot, setts] = await Promise.all([
        api.getEmployees(),
        api.getOvertime(dateToLoad),
        api.getSettings(),
      ]);
      setEmployees(emps.filter((e) => e.is_active));
      setOvertimeSessions(ot);
      setSettings(setts);
      if (emps.length > 0 && !selectedEmpId) {
        setSelectedEmpId(emps[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat sesi lembur.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  const handleStartOvertime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;
    try {
      setError(null);
      await api.startOvertime(selectedEmpId, notes);
      setSuccessMsg('Sesi lembur berhasil dimulai dengan snapshot tarif terkunci.');
      setIsModalOpen(false);
      await loadData(selectedDate);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEndOvertime = async (employee_id: string) => {
    try {
      setError(null);
      const session = await api.endOvertime(employee_id);
      setSuccessMsg(`Lembur selesai. Durasi: ${session.duration_minutes} menit (${(session.duration_minutes / 60).toFixed(2)} jam).`);
      await loadData(selectedDate);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredSessions = overtimeSessions.filter((s) =>
    (s.employee_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.employee_code || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-[#D9E0E8] p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold tracking-tight text-[#173B67]">
              Absensi Lembur (Overtime)
            </h2>
            {settings && (
              <span
                className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${
                  settings.overtime_enabled
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {settings.overtime_enabled ? 'Lembur Aktif' : 'Lembur Nonaktif'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Pencatatan sesi lembur terpisah dengan snapshot tarif upah lembur per jam saat Masuk Lembur.
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
            onClick={() => setIsModalOpen(true)}
            disabled={!settings?.overtime_enabled}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Flame className="w-4 h-4" />
            <span>Mulai Sesi Lembur</span>
          </button>
        </div>
      </div>

      {!settings?.overtime_enabled && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>
            Fitur lembur saat ini dinonaktifkan dalam Pengaturan Perusahaan. Hubungi Administrator untuk mengaktifkan kembali lembur.
          </span>
        </div>
      )}

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

      {/* Overtime Sessions Table */}
      <div className="bg-white rounded-xl border border-[#D9E0E8] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="text-xs font-semibold text-slate-700">
            Daftar Sesi Lembur Tanggal: <span className="font-mono text-slate-900">{selectedDate}</span>
          </div>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari sesi lembur..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-[#D9E0E8] text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-4">Departemen</th>
                <th className="py-3 px-4">Mulai Lembur</th>
                <th className="py-3 px-4">Selesai Lembur</th>
                <th className="py-3 px-4 text-right">Tarif Lembur Snapshot</th>
                <th className="py-3 px-4 text-right">Durasi Lembur</th>
                <th className="py-3 px-4">Alasan & Catatan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Memuat data lembur...
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Tidak ada sesi lembur yang tercatat pada tanggal {selectedDate}.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((s) => {
                  const isActive = !s.end_at;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{s.employee_name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{s.employee_code}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{s.department_name}</td>
                      <td className="py-3 px-4 font-mono text-slate-800">
                        {new Date(s.start_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800">
                        {s.end_at ? (
                          new Date(s.end_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                            Sedang Lembur
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">
                        Rp {s.overtime_rate_snapshot.toLocaleString('id-ID')}/jam
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 font-medium">
                        {s.duration_minutes > 0
                          ? `${s.duration_minutes} mnt (${(s.duration_minutes / 60).toFixed(2)} jam)`
                          : 'Berjalan...'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{s.notes}</td>
                      <td className="py-3 px-4 text-center">
                        {isActive ? (
                          <button
                            onClick={() => handleEndOvertime(s.employee_id)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                          >
                            Selesai Lembur
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Tersimpan</span>
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

      {/* Start Overtime Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Mulai Sesi Lembur Baru</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartOvertime} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Pilih Karyawan *
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.employee_code}) — Tarif Lembur: Rp {e.default_overtime_rate.toLocaleString('id-ID')}/jam
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Keterangan & Target Lembur *
                </label>
                <textarea
                  rows={2}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Pengejaran kuota jahitan batch 120 pcs"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                Tarif lembur saat ini akan langsung di-snapshot dan dikunci ke dalam sesi ini.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Mulai Lembur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
