import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Clock,
  Shield,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  Flame,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { CompanySettings } from '../types/index.ts';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<CompanySettings>({
    company_name: '',
    company_address: '',
    company_phone: '',
    work_days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    start_time: '08:00',
    end_time: '17:00',
    late_tolerance_minutes: 15,
    overtime_enabled: true,
    admin_pin: '',
    timezone: 'Asia/Jakarta',
  });

  const [newAdminPin, setNewAdminPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await api.getSettings();
        setSettings(data);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat pengaturan.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const updatePayload: Partial<CompanySettings> = {
        company_name: settings.company_name,
        company_address: settings.company_address,
        company_phone: settings.company_phone,
        start_time: settings.start_time,
        end_time: settings.end_time,
        late_tolerance_minutes: Number(settings.late_tolerance_minutes) || 0,
        overtime_enabled: settings.overtime_enabled,
      };

      if (newAdminPin.trim()) {
        updatePayload.admin_pin = newAdminPin.trim();
      }

      const updated = await api.updateSettings(updatePayload);
      setSettings(updated);
      setNewAdminPin('');
      setSuccessMsg('Pengaturan perusahaan berhasil diperbarui dan disimpan.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-[#D9E0E8] p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#173B67]">
            Pengaturan Perusahaan & Jam Kerja
          </h2>
          <p className="text-xs text-slate-500">
            Atur parameter jadwal shift operasional, toleransi keterlambatan, aktivasi lembur, dan PIN Administrator.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Profil Perusahaan */}
        <div className="bg-white rounded-xl border border-[#D9E0E8] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-semibold text-sm text-slate-900">
            <Building className="w-4 h-4 text-[#173B67]" />
            <span>Identitas Perusahaan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Nama Perusahaan *
              </label>
              <input
                type="text"
                required
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Nomor Telepon Kantor
              </label>
              <input
                type="text"
                value={settings.company_phone}
                onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-600 mb-1">
                Alamat Pabrik / Kantor Operasional
              </label>
              <input
                type="text"
                value={settings.company_address}
                onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Jadwal Jam Kerja & Lembur */}
        <div className="bg-white rounded-xl border border-[#D9E0E8] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-semibold text-sm text-slate-900">
            <Clock className="w-4 h-4 text-[#173B67]" />
            <span>Jadwal Shift & Aturan Absensi</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Jam Masuk Reguler (WIB)
              </label>
              <input
                type="time"
                value={settings.start_time}
                onChange={(e) => setSettings({ ...settings, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67] font-mono text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Jam Selesai Reguler (WIB)
              </label>
              <input
                type="time"
                value={settings.end_time}
                onChange={(e) => setSettings({ ...settings, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67] font-mono text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Toleransi Keterlambatan (Menit)
              </label>
              <input
                type="number"
                min={0}
                value={settings.late_tolerance_minutes}
                onChange={(e) =>
                  setSettings({ ...settings, late_tolerance_minutes: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67] font-mono"
              />
            </div>
          </div>

          {/* Overtime Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={settings.overtime_enabled}
                onChange={(e) => setSettings({ ...settings, overtime_enabled: e.target.checked })}
                className="w-4 h-4 rounded text-[#173B67]"
              />
              <div>
                <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>Aktifkan Modul Absensi Lembur</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Jika dinonaktifkan, karyawan dan operator tidak dapat memulai sesi lembur baru.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Section 3: Keamanan & PIN Administrator */}
        <div className="bg-white rounded-xl border border-[#D9E0E8] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-semibold text-sm text-slate-900">
            <Shield className="w-4 h-4 text-[#173B67]" />
            <span>Keamanan & PIN Master Admin</span>
          </div>

          <div className="text-xs text-slate-600">
            PIN Master Administrator digunakan untuk mengotorisasi kepulangan awal di Kios Absensi dan pembukaan kembali periode penggajian yang terkunci.
          </div>

          <div className="max-w-xs">
            <label className="block font-semibold text-slate-600 text-xs mb-1">
              Ganti PIN Master (Biarkan kosong jika tidak ingin diubah)
            </label>
            <input
              type="password"
              maxLength={10}
              value={newAdminPin}
              onChange={(e) => setNewAdminPin(e.target.value)}
              placeholder="PIN Baru (cth: 8899)"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono tracking-widest focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-[#173B67] hover:bg-[#122f52] rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
