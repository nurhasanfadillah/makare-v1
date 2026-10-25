import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Calendar,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Eye,
  FileText,
  DollarSign,
  ChevronRight,
  X,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { PayrollPeriod, PayrollRecord, ConsistencyAuditReport } from '../types/index.ts';
import { AdminPinModal } from './AdminPinModal.tsx';

interface PayrollViewProps {
  onViewSlipGaji?: (periodId: string, employeeId?: string) => void;
}

export const PayrollView: React.FC<PayrollViewProps> = ({ onViewSlipGaji }) => {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [closedRecords, setClosedRecords] = useState<PayrollRecord[]>([]);

  // Period Closing Wizard States
  const [isClosingWizardOpen, setIsClosingWizardOpen] = useState(false);
  const [periodStart, setPeriodStart] = useState('2026-10-11');
  const [periodEnd, setPeriodEnd] = useState('2026-10-25');
  const [closingNotes, setClosingNotes] = useState('Penutupan Periode Penggajian Reguler');
  const [previewData, setPreviewData] = useState<{
    records: Array<PayrollRecord & { current_kasbon_balance: number }>;
    open_attendance_count: number;
    open_overtime_count: number;
  } | null>(null);

  const [consistencyReport, setConsistencyReport] = useState<ConsistencyAuditReport | null>(null);
  const [adjustedDeductions, setAdjustedDeductions] = useState<Record<string, number>>({});
  const [previewLoading, setPreviewLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reopen Modal
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [reopenPeriodTarget, setReopenPeriodTarget] = useState<PayrollPeriod | null>(null);
  const [reopenPin, setReopenPin] = useState('');
  const [reopenReason, setReopenReason] = useState('');

  const loadData = async () => {
    try {
      setError(null);
      const prds = await api.getPayrollPeriods();
      setPeriods(prds);

      if (prds.length > 0) {
        const active = prds.find((p) => p.status === 'CLOSED') || prds[0];
        setSelectedPeriod(active);
        if (active.status === 'CLOSED') {
          const recs = await api.getPayrollRecords(active.id);
          setClosedRecords(recs);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data penggajian.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectPeriod = async (p: PayrollPeriod) => {
    setSelectedPeriod(p);
    if (p.status === 'CLOSED') {
      try {
        const recs = await api.getPayrollRecords(p.id);
        setClosedRecords(recs);
      } catch (err: any) {
        setError(err.message);
      }
    } else {
      setClosedRecords([]);
    }
  };

  const openCloseWizard = async () => {
    // Find last closed period to suggest next start date
    const lastClosed = periods.find((p) => p.status === 'CLOSED');
    let start = '2026-10-11';
    if (lastClosed) {
      const d = new Date(lastClosed.period_end);
      d.setDate(d.getDate() + 1);
      start = d.toISOString().split('T')[0];
    }

    const today = new Date().toISOString().split('T')[0];
    setPeriodStart(start);
    setPeriodEnd(today);
    setIsClosingWizardOpen(true);
    await fetchPreview(start, today);
  };

  const fetchPreview = async (start: string, end: string) => {
    try {
      setPreviewLoading(true);
      setError(null);
      const [prev, auditReport] = await Promise.all([
        api.previewPayroll(start, end),
        api.validatePeriodConsistency(start, end),
      ]);
      setPreviewData(prev);
      setConsistencyReport(auditReport);

      // Initialize default deductions
      const initialDeductions: Record<string, number> = {};
      for (const r of prev.records) {
        initialDeductions[r.employee_id] = r.cash_advance_deduction;
      }
      setAdjustedDeductions(initialDeductions);
    } catch (err: any) {
      setError(err.message || 'Gagal menghitung pratinjau penggajian.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDeductionChange = (empId: string, val: number, maxAllowed: number) => {
    if (val < 0) val = 0;
    if (val > maxAllowed) {
      setError(`Potongan kasbon tidak boleh melebihi batas gaji tersedia (Rp ${maxAllowed.toLocaleString('id-ID')}).`);
      val = maxAllowed;
    } else {
      setError(null);
    }
    setAdjustedDeductions((prev) => ({ ...prev, [empId]: val }));
  };

  const handleConfirmClose = async () => {
    try {
      setActionLoading(true);
      setError(null);
      await api.closePeriod(periodStart, periodEnd, closingNotes, adjustedDeductions);
      setSuccessMsg(`Periode ${periodStart} s/d ${periodEnd} berhasil ditutup dan slip gaji terkunci.`);
      setIsClosingWizardOpen(false);
      await loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Gagal menutup periode.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopenPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenPeriodTarget) return;
    try {
      setActionLoading(true);
      setError(null);
      await api.reopenPeriod(reopenPeriodTarget.id, reopenPin, reopenReason);
      setSuccessMsg(`Periode ${reopenPeriodTarget.period_start} s/d ${reopenPeriodTarget.period_end} berhasil dibuka kembali.`);
      setIsReopenModalOpen(false);
      setReopenPin('');
      setReopenReason('');
      await loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Gagal membuka kembali periode.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePaymentStatus = async (recordId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
      await api.setPaymentStatus(recordId, nextStatus);
      if (selectedPeriod) {
        const updated = await api.getPayrollRecords(selectedPeriod.id);
        setClosedRecords(updated);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Closing Trigger */}
      <div className="bg-white rounded-xl border border-[#D9E0E8] p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#173B67]">
            Penggajian & Penutupan Periode (Closing)
          </h2>
          <p className="text-xs text-slate-500">
            Kalkulasi kanonis upah per jam & bulanan, validasi potongan kasbon, penguncian data permanen, dan pencetakan slip gaji.
          </p>
        </div>

        <button
          onClick={openCloseWizard}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-[#173B67] hover:bg-[#122f52] rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer whitespace-nowrap"
        >
          <Lock className="w-4 h-4" />
          <span>Tutup Periode Baru (Closing)</span>
        </button>
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

      {/* Main Grid: Left Period Selector, Right Records & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Col: Periods History List */}
        <div className="bg-white rounded-xl border border-[#D9E0E8] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Daftar Periode
              </span>
              <button
                onClick={loadData}
                title="Muat ulang"
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {periods.map((p) => {
                const isSelected = selectedPeriod?.id === p.id;
                const isClosed = p.status === 'CLOSED';

                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPeriod(p)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#173B67] bg-blue-50/60 ring-1 ring-[#173B67]'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-slate-900">
                        {p.period_start} s/d {p.period_end}
                      </span>
                      {isClosed ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Terkunci</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{p.notes || 'Periode Penggajian'}</div>
                    {isClosed && (
                      <div className="text-[10px] text-slate-400 mt-1">
                        Ditutup oleh: {p.closed_by || 'Admin'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 3 Cols: Details & Payroll Records */}
        <div className="lg:col-span-3 space-y-4">
          {selectedPeriod ? (
            <div className="bg-white rounded-xl border border-[#D9E0E8] shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Periode: {selectedPeriod.period_start} s/d {selectedPeriod.period_end}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                        selectedPeriod.status === 'CLOSED'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {selectedPeriod.status === 'CLOSED' ? 'Status: Terkunci (CLOSED)' : 'Status: Berjalan (DRAFT)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedPeriod.notes}</p>
                </div>

                {selectedPeriod.status === 'CLOSED' && (
                  <button
                    onClick={() => {
                      setReopenPeriodTarget(selectedPeriod);
                      setIsReopenModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Buka Kembali Periode</span>
                  </button>
                )}
              </div>

              {selectedPeriod.status !== 'CLOSED' ? (
                <div className="p-12 text-center text-slate-500 space-y-3">
                  <Calculator className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-medium text-slate-700">
                    Periode ini masih dalam status DRAFT / Berjalan.
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Untuk menghitung slip gaji dan mengunci saldo kasbon, klik tombol &ldquo;Tutup Periode Baru (Closing)&rdquo; di atas.
                  </p>
                </div>
              ) : closedRecords.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Memuat rincian penggajian...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-[#D9E0E8] text-slate-600 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Karyawan</th>
                        <th className="py-3 px-4">Mode Gaji</th>
                        <th className="py-3 px-4 text-right">Jam Reguler</th>
                        <th className="py-3 px-4 text-right">Jam Lembur</th>
                        <th className="py-3 px-4 text-right">Gaji Kotor</th>
                        <th className="py-3 px-4 text-right text-red-600">Pot. Kasbon</th>
                        <th className="py-3 px-4 text-right font-bold text-slate-900">Gaji Bersih</th>
                        <th className="py-3 px-4 text-center">Status Bayar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {closedRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{rec.employee_name}</div>
                            <div className="text-[11px] font-mono text-slate-400">{rec.employee_code}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {rec.salary_mode === 'HOURLY' ? 'Per Jam' : 'Bulanan'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                            {rec.total_regular_hours} jam
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                            {rec.total_overtime_hours} jam
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-slate-900">
                            Rp {rec.gross_pay.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-red-600 font-semibold">
                            {rec.cash_advance_deduction > 0
                              ? `- Rp ${rec.cash_advance_deduction.toLocaleString('id-ID')}`
                              : '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 text-sm">
                            Rp {rec.net_pay.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleTogglePaymentStatus(rec.id, rec.payment_status)}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                                rec.payment_status === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              }`}
                            >
                              {rec.payment_status === 'PAID' ? 'Lunas / Dibayar' : 'Menunggu Bayar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-semibold border-t border-slate-200">
                      <tr>
                        <td colSpan={4} className="py-3 px-4 text-slate-700 uppercase tracking-wider">
                          Total Seluruh Karyawan:
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900">
                          Rp {closedRecords.reduce((s, r) => s + r.gross_pay, 0).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-red-600">
                          - Rp {closedRecords.reduce((s, r) => s + r.cash_advance_deduction, 0).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 font-bold text-sm">
                          Rp {closedRecords.reduce((s, r) => s + r.net_pay, 0).toLocaleString('id-ID')}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
              Pilih periode pada kolom sebelah kiri.
            </div>
          )}
        </div>
      </div>

      {/* Period Closing Wizard Modal */}
      {isClosingWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#173B67]" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Wizard Penutupan Periode Penggajian (Period Closing)
                </h3>
              </div>
              <button
                onClick={() => setIsClosingWizardOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Date boundary selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tanggal Awal Periode *
                  </label>
                  <input
                    type="date"
                    required
                    value={periodStart}
                    onChange={(e) => {
                      setPeriodStart(e.target.value);
                      fetchPreview(e.target.value, periodEnd);
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tanggal Akhir Periode *
                  </label>
                  <input
                    type="date"
                    required
                    value={periodEnd}
                    onChange={(e) => {
                      setPeriodEnd(e.target.value);
                      fetchPreview(periodStart, e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Consistency Audit Diagnostic Panel */}
              {consistencyReport && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                        Analisis Konsistensi & Validasi Integritas
                      </span>
                      {consistencyReport.can_close ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Lulus Validasi Konsistensi</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{consistencyReport.blockers_count} Blocker Terdeteksi</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {consistencyReport.can_close
                        ? 'Seluruh parameter validasi terpenuhi'
                        : 'Wajib diselesaikan sebelum closing'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {consistencyReport.checks.map((chk) => (
                      <div
                        key={chk.id}
                        className={`p-3 rounded-lg border text-xs space-y-1 ${
                          chk.status === 'PASS'
                            ? 'bg-white border-emerald-200 text-slate-700'
                            : chk.status === 'WARNING'
                            ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                            : 'bg-red-50/70 border-red-300 text-red-950'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="truncate pr-2">{chk.title}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                              chk.status === 'PASS'
                                ? 'bg-emerald-100 text-emerald-800'
                                : chk.status === 'WARNING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800 font-bold'
                            }`}
                          >
                            {chk.status}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-600">{chk.message}</p>
                        {chk.details && chk.details.length > 0 && (
                          <ul className="list-disc list-inside text-[10px] text-slate-500 pt-0.5 space-y-0.5">
                            {chk.details.slice(0, 3).map((d, i) => (
                              <li key={i} className="truncate">{d}</li>
                            ))}
                            {chk.details.length > 3 && (
                              <li className="italic">+ {chk.details.length - 3} lainnya</li>
                            )}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Table with Editable Kasbon Deductions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Pratinjau Kalkulasi & Penyesuaian Kasbon
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Potongan kasbon maksimal sebesar gaji yang tersedia untuk dipotong
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Karyawan</th>
                          <th className="py-2.5 px-3 text-right">Jam Reguler</th>
                          <th className="py-2.5 px-3 text-right">Jam Lembur</th>
                          <th className="py-2.5 px-3 text-right">Gaji Kotor</th>
                          <th className="py-2.5 px-3 text-right">Saldo Kasbon</th>
                          <th className="py-2.5 px-3 text-right">Potongan Kasbon (Sesuaikan)</th>
                          <th className="py-2.5 px-3 text-right font-bold text-slate-900">Gaji Bersih</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewLoading ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400">
                              Menghitung pratinjau payroll...
                            </td>
                          </tr>
                        ) : !previewData || previewData.records.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-500">
                              Tidak ada data karyawan aktif pada periode ini.
                            </td>
                          </tr>
                        ) : (
                          previewData.records.map((rec) => {
                            const availableSalary = rec.gross_pay - rec.other_deductions;
                            const maxDeduction = Math.min(availableSalary, rec.current_kasbon_balance);
                            const currentDeduction =
                              typeof adjustedDeductions[rec.employee_id] === 'number'
                                ? adjustedDeductions[rec.employee_id]
                                : rec.cash_advance_deduction;
                            const finalNet = Math.max(0, availableSalary - currentDeduction);

                            return (
                              <tr key={rec.employee_id} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3 font-semibold text-slate-900">
                                  {rec.employee_name}{' '}
                                  <span className="font-mono text-slate-400 font-normal">({rec.employee_code})</span>
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                                  {rec.total_regular_hours} j
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                                  {rec.total_overtime_hours} j
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium text-slate-900">
                                  Rp {rec.gross_pay.toLocaleString('id-ID')}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                                  Rp {rec.current_kasbon_balance.toLocaleString('id-ID')}
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <input
                                    type="number"
                                    min={0}
                                    max={maxDeduction}
                                    step={10000}
                                    value={currentDeduction}
                                    onChange={(e) =>
                                      handleDeductionChange(rec.employee_id, Number(e.target.value) || 0, maxDeduction)
                                    }
                                    className="w-28 px-2 py-1 text-right text-xs border border-slate-300 rounded-md font-mono tabular-nums focus:outline-hidden focus:ring-1 focus:ring-[#173B67] text-red-600 font-semibold"
                                  />
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                                  Rp {finalNet.toLocaleString('id-ID')}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Catatan / Keterangan Penutupan Periode
                </label>
                <input
                  type="text"
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  Data yang ditutup akan terkunci permanen dan transaksi potongan kasbon akan dicatat otomatis.
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsClosingWizardOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading || previewLoading || !consistencyReport?.can_close}
                    onClick={handleConfirmClose}
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#173B67] hover:bg-[#122f52] rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Memproses Penutupan...' : 'Konfirmasi & Kunci Periode'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Period Modal */}
      {isReopenModalOpen && reopenPeriodTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Unlock className="w-4 h-4 text-amber-700" />
                <h3 className="font-semibold text-slate-900 text-sm">Pembukaan Kembali Periode</h3>
              </div>
              <button
                onClick={() => setIsReopenModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReopenPeriod} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Membuka kembali periode tertutup ({reopenPeriodTarget.period_start} s/d {reopenPeriodTarget.period_end}) memerlukan verifikasi PIN Administrator dan pencatatan alasan wajib dalam jejak audit.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  PIN Master Administrator * (Default: 8899)
                </label>
                <input
                  type="password"
                  required
                  value={reopenPin}
                  onChange={(e) => setReopenPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-center font-mono tracking-widest text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Alasan Pembukaan Kembali (Minimal 5 karakter) *
                </label>
                <textarea
                  rows={2}
                  required
                  minLength={5}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Contoh: Koreksi jam lembur karyawan Ahmad Fauzi yang tertinggal"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReopenModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Membuka...' : 'Buka Kunci Periode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
