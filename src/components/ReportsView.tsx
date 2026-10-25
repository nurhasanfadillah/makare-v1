import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Users,
  WalletCards,
  CheckCircle2,
  AlertCircle,
  Building2,
  Search,
} from 'lucide-react';
import { api } from '../services/api.ts';
import {
  PayrollPeriod,
  PayrollRecord,
  Employee,
  CompanySettings,
  KasbonEmployeeBalance,
  AttendanceSession,
} from '../types/index.ts';

export const ReportsView: React.FC = () => {
  const [reportType, setReportType] = useState<
    'SLIP_GAJI' | 'REKAP_PAYROLL' | 'BUKU_KASBON' | 'BUNDEL_LENGKAP'
  >('SLIP_GAJI');

  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [kasbonBalances, setKasbonBalances] = useState<KasbonEmployeeBalance[]>([]);
  const [allAttendance, setAllAttendance] = useState<AttendanceSession[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prds, setts, bals, emps, att] = await Promise.all([
        api.getPayrollPeriods(),
        api.getSettings(),
        api.getKasbonBalances(),
        api.getEmployees(),
        api.getAttendance(),
      ]);

      setPeriods(prds);
      setSettings(setts);
      setKasbonBalances(bals);
      setEmployees(emps);
      setAllAttendance(att);

      const closed = prds.find((p) => p.status === 'CLOSED') || prds[0];
      if (closed) {
        setSelectedPeriodId(closed.id);
        const recs = await api.getPayrollRecords(closed.id);
        setRecords(recs);
        if (recs.length > 0) {
          setSelectedRecordId(recs[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePeriodChange = async (periodId: string) => {
    setSelectedPeriodId(periodId);
    try {
      const recs = await api.getPayrollRecords(periodId);
      setRecords(recs);
      if (recs.length > 0) {
        setSelectedRecordId(recs[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);
  const selectedRecord = records.find((r) => r.id === selectedRecordId);

  // Helper to spell out numbers in Indonesian
  const terbilang = (n: number): string => {
    const angka = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
    if (n < 12) return angka[n];
    if (n < 20) return terbilang(n - 10) + ' Belas';
    if (n < 100) return terbilang(Math.floor(n / 10)) + ' Puluh ' + terbilang(n % 10);
    if (n < 200) return 'Seratus ' + terbilang(n - 100);
    if (n < 1000) return terbilang(Math.floor(n / 100)) + ' Ratus ' + terbilang(n % 100);
    if (n < 2000) return 'Seribu ' + terbilang(n - 1000);
    if (n < 1000000) return terbilang(Math.floor(n / 1000)) + ' Ribu ' + terbilang(n % 1000);
    if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + ' Juta ' + terbilang(n % 1000000);
    return String(n);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Report Selector */}
      <div className="bg-white rounded-xl border border-[#D9E0E8] p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#173B67]">
            Laporan & Slip Gaji PDF
          </h2>
          <p className="text-xs text-slate-500">
            Cetak dokumen slip gaji individual, rekap penggajian, absensi, dan buku kasbon siap cetak (A4 format).
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-[#173B67] hover:bg-[#122f52] rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer whitespace-nowrap"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan PDF</span>
        </button>
      </div>

      {/* Navigation Filter Tabs (Print Hidden) */}
      <div className="bg-white p-3 rounded-xl border border-[#D9E0E8] shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setReportType('SLIP_GAJI')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              reportType === 'SLIP_GAJI'
                ? 'bg-[#173B67] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Slip Gaji Individual
          </button>
          <button
            onClick={() => setReportType('REKAP_PAYROLL')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              reportType === 'REKAP_PAYROLL'
                ? 'bg-[#173B67] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Rekap Penggajian Periode
          </button>
          <button
            onClick={() => setReportType('BUKU_KASBON')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              reportType === 'BUKU_KASBON'
                ? 'bg-[#173B67] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Buku Kasbon Karyawan
          </button>
          <button
            onClick={() => setReportType('BUNDEL_LENGKAP')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              reportType === 'BUNDEL_LENGKAP'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            Bundel Laporan Lengkap (Semua Dokumen)
          </button>
        </div>

        {/* Period Selector */}
        {reportType !== 'BUKU_KASBON' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Pilih Periode:</span>
            <select
              value={selectedPeriodId}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-hidden"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.period_start} s/d {p.period_end} ({p.status})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Employee Selector for Individual Payslip */}
        {reportType === 'SLIP_GAJI' && records.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Karyawan:</span>
            <select
              value={selectedRecordId}
              onChange={(e) => setSelectedRecordId(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-hidden"
            >
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.employee_name} ({r.employee_code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Printable Paper Canvas Area (A4 layout styling) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-10 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* REPORT 1: INDIVIDUAL PAYSLIP */}
        {reportType === 'SLIP_GAJI' && (
          <div>
            {!selectedRecord ? (
              <div className="py-12 text-center text-slate-400">
                Belum ada data slip gaji pada periode terpilih. Pastikan periode telah ditutup.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Payslip Header */}
                <div className="border-b-2 border-slate-800 pb-4 flex justify-between items-start">
                  <div>
                    <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                      {settings?.company_name || 'PT MAKARE NUSANTARA INDONESIA'}
                    </h1>
                    <p className="text-xs text-slate-600 mt-0.5">{settings?.company_address}</p>
                    <p className="text-xs text-slate-500">Telp: {settings?.company_phone}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold tracking-wider text-slate-900 uppercase bg-slate-100 px-3 py-1 rounded">
                      SLIP GAJI KARYAWAN
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-1">
                      No. Slip: {selectedRecord.id.replace('rec-', 'SLIP-')}
                    </div>
                  </div>
                </div>

                {/* Employee Meta Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div className="space-y-1.5">
                    <div className="flex">
                      <span className="w-28 text-slate-500">Nama Karyawan</span>
                      <span className="font-bold text-slate-900">: {selectedRecord.employee_name}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-500">Kode Karyawan</span>
                      <span className="font-mono text-slate-800">: {selectedRecord.employee_code}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-500">Departemen</span>
                      <span className="text-slate-800">: {selectedRecord.department_name}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex">
                      <span className="w-28 text-slate-500">Periode Gaji</span>
                      <span className="font-semibold text-slate-900">
                        : {selectedPeriod?.period_start} s/d {selectedPeriod?.period_end}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-500">Sistem Penggajian</span>
                      <span className="text-slate-800">
                        : {selectedRecord.salary_mode === 'HOURLY' ? 'Per Jam (Hourly)' : 'Bulanan / Manual'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-500">Status Pembayaran</span>
                      <span className="font-semibold text-emerald-800">: {selectedRecord.payment_status}</span>
                    </div>
                  </div>
                </div>

                {/* Earnings & Deductions Tables in 2 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  {/* Earnings Column */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 px-3 py-2 font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200">
                      Penerimaan (Earnings)
                    </div>
                    <div className="p-3 space-y-2">
                      {selectedRecord.salary_mode === 'HOURLY' ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-600">
                              Upah Jam Kerja Reguler ({selectedRecord.total_regular_hours} jam)
                            </span>
                            <span className="font-mono tabular-nums text-slate-900">
                              Rp {selectedRecord.regular_pay.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Gaji Pokok & Tunjangan Tetap</span>
                          <span className="font-mono tabular-nums text-slate-900">
                            Rp {selectedRecord.manual_allowances.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}

                      {selectedRecord.overtime_pay > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">
                            Upah Lembur ({selectedRecord.total_overtime_hours} jam)
                          </span>
                          <span className="font-mono tabular-nums text-slate-900">
                            Rp {selectedRecord.overtime_pay.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                        <span>Total Gaji Kotor</span>
                        <span className="font-mono tabular-nums">
                          Rp {selectedRecord.gross_pay.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions Column */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 px-3 py-2 font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200">
                      Potongan (Deductions)
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Potongan Kasbon Periode Ini</span>
                        <span className="font-mono tabular-nums text-red-600 font-semibold">
                          {selectedRecord.cash_advance_deduction > 0
                            ? `- Rp ${selectedRecord.cash_advance_deduction.toLocaleString('id-ID')}`
                            : 'Rp 0'}
                        </span>
                      </div>

                      {selectedRecord.other_deductions > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Potongan Lain yang Sah</span>
                          <span className="font-mono tabular-nums text-red-600">
                            - Rp {selectedRecord.other_deductions.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-red-700">
                        <span>Total Potongan</span>
                        <span className="font-mono tabular-nums">
                          - Rp{' '}
                          {(
                            selectedRecord.cash_advance_deduction + selectedRecord.other_deductions
                          ).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Pay Grand Box */}
                <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-300">
                      Gaji Bersih Diterima (Take Home Pay)
                    </span>
                    <div className="text-xs italic text-blue-200 mt-0.5">
                      Terbilang: {terbilang(selectedRecord.net_pay)} Rupiah
                    </div>
                  </div>
                  <div className="text-2xl font-black font-mono tracking-tight tabular-nums text-emerald-400">
                    Rp {selectedRecord.net_pay.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Signature Blocks */}
                <div className="grid grid-cols-2 gap-12 pt-8 text-center text-xs text-slate-700">
                  <div>
                    <p className="mb-14 text-slate-500">Penerima (Karyawan),</p>
                    <p className="font-bold border-b border-slate-400 pb-1 mx-12">
                      {selectedRecord.employee_name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Tanda Tangan & Tanggal</p>
                  </div>
                  <div>
                    <p className="mb-14 text-slate-500">Bagian Keuangan / HRD,</p>
                    <p className="font-bold border-b border-slate-400 pb-1 mx-12">
                      Administrator MAKARE
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">PT MAKARE NUSANTARA INDONESIA</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* REPORT 2: MASTER PAYROLL REGISTER */}
        {reportType === 'REKAP_PAYROLL' && (
          <div className="space-y-4">
            <div className="border-b-2 border-slate-800 pb-3">
              <h1 className="text-base font-bold text-slate-900 uppercase">
                {settings?.company_name || 'PT MAKARE NUSANTARA'}
              </h1>
              <h2 className="text-xs font-semibold text-slate-600 uppercase">
                Rekapitulasi Penggajian Karyawan
              </h2>
              <p className="text-xs text-slate-500">
                Periode: {selectedPeriod?.period_start} s/d {selectedPeriod?.period_end}
              </p>
            </div>

            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">No</th>
                  <th className="py-2 px-3">Kode</th>
                  <th className="py-2 px-3">Nama Karyawan</th>
                  <th className="py-2 px-3">Departemen</th>
                  <th className="py-2 px-3 text-right">Jam Reg</th>
                  <th className="py-2 px-3 text-right">Jam Lembur</th>
                  <th className="py-2 px-3 text-right">Gaji Kotor</th>
                  <th className="py-2 px-3 text-right text-red-600">Pot. Kasbon</th>
                  <th className="py-2 px-3 text-right font-bold">Gaji Bersih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r, i) => (
                  <tr key={r.id}>
                    <td className="py-2 px-3">{i + 1}</td>
                    <td className="py-2 px-3 font-mono">{r.employee_code}</td>
                    <td className="py-2 px-3 font-medium">{r.employee_name}</td>
                    <td className="py-2 px-3">{r.department_name}</td>
                    <td className="py-2 px-3 text-right font-mono">{r.total_regular_hours}</td>
                    <td className="py-2 px-3 text-right font-mono">{r.total_overtime_hours}</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums">
                      Rp {r.gross_pay.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-red-600">
                      Rp {r.cash_advance_deduction.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums font-bold">
                      Rp {r.net_pay.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
                <tr>
                  <td colSpan={6} className="py-2.5 px-3 uppercase">Total Penggajian:</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    Rp {records.reduce((s, r) => s + r.gross_pay, 0).toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-red-600">
                    - Rp {records.reduce((s, r) => s + r.cash_advance_deduction, 0).toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    Rp {records.reduce((s, r) => s + r.net_pay, 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* REPORT 3: BUKU KASBON */}
        {reportType === 'BUKU_KASBON' && (
          <div className="space-y-4">
            <div className="border-b-2 border-slate-800 pb-3">
              <h1 className="text-base font-bold text-slate-900 uppercase">
                {settings?.company_name || 'PT MAKARE NUSANTARA'}
              </h1>
              <h2 className="text-xs font-semibold text-slate-600 uppercase">
                Buku Saldo Kasbon Karyawan
              </h2>
              <p className="text-xs text-slate-500">
                Dicetak pada: {new Date().toLocaleString('id-ID')}
              </p>
            </div>

            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">No</th>
                  <th className="py-2 px-3">Kode</th>
                  <th className="py-2 px-3">Nama Karyawan</th>
                  <th className="py-2 px-3">Departemen</th>
                  <th className="py-2 px-3 text-right">Total Pinjaman (ISSUED)</th>
                  <th className="py-2 px-3 text-right">Potongan Payroll</th>
                  <th className="py-2 px-3 text-right">Pelunasan Mandiri</th>
                  <th className="py-2 px-3 text-right font-bold">Sisa Saldo Terutang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kasbonBalances.map((b, i) => (
                  <tr key={b.employee_id}>
                    <td className="py-2 px-3">{i + 1}</td>
                    <td className="py-2 px-3 font-mono">{b.employee_code}</td>
                    <td className="py-2 px-3 font-medium">{b.employee_name}</td>
                    <td className="py-2 px-3">{b.department_name}</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums">
                      Rp {b.total_issued.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                      Rp {b.total_deducted.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                      Rp {b.total_repaid.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums font-bold">
                      {b.current_balance > 0 ? (
                        <span className="text-red-600">Rp {b.current_balance.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-emerald-700">Lunas</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
                <tr>
                  <td colSpan={7} className="py-2.5 px-3 uppercase">Total Saldo Terutang Perusahaan:</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                    Rp {kasbonBalances.reduce((s, b) => s + Math.max(0, b.current_balance), 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* REPORT 4: BUNDEL LAPORAN OPERASIONAL & PENGGAJIAN LENGKAP */}
        {reportType === 'BUNDEL_LENGKAP' && (
          <div className="space-y-12">
            {/* Sheet 1: Executive Cover Page & Lembar Pengesahan */}
            <div className="min-h-[85vh] flex flex-col justify-between border-b-2 border-slate-300 pb-10 print:min-h-screen print:border-none print:pb-0" style={{ pageBreakAfter: 'always' }}>
              <div className="space-y-6">
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                      {settings?.company_name || 'PT MAKARE NUSANTARA INDONESIA'}
                    </h1>
                    <p className="text-xs text-slate-600 mt-1">{settings?.company_address}</p>
                    <p className="text-xs text-slate-500">Telp: {settings?.company_phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-[#173B67] text-white font-bold text-xs uppercase rounded">
                      DOKUMEN RESMI
                    </span>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      KODE BUNDEL: BNDL-{selectedPeriod?.id || 'PERIOD'}
                    </p>
                  </div>
                </div>

                <div className="text-center py-8">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase mb-2">
                    BUNDEL LAPORAN OPERASIONAL & PENGGAJIAN
                  </h2>
                  <p className="text-sm font-semibold text-slate-700">
                    Periode: {selectedPeriod?.period_start} s/d {selectedPeriod?.period_end}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Dokumen Berita Acara Rekapitulasi Gaji, Rekap Kehadiran, Buku Kasbon & Seluruh Slip Gaji Sah
                  </p>
                </div>

                {/* Executive Summary Grid */}
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto text-xs bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <div className="space-y-2">
                    <div className="text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                      Total Karyawan Terbayar
                    </div>
                    <div className="text-2xl font-bold font-mono text-slate-900">
                      {records.length} Karyawan
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                      Total Gaji Kotor Disalurkan
                    </div>
                    <div className="text-2xl font-bold font-mono text-slate-900">
                      Rp {records.reduce((s, r) => s + r.gross_pay, 0).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                      Total Potongan Kasbon
                    </div>
                    <div className="text-2xl font-bold font-mono text-red-600">
                      - Rp {records.reduce((s, r) => s + r.cash_advance_deduction, 0).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                      Total Gaji Bersih (Take Home Pay)
                    </div>
                    <div className="text-2xl font-bold font-mono text-emerald-700">
                      Rp {records.reduce((s, r) => s + r.net_pay, 0).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3-Party Signatory Approval Blocks */}
              <div className="grid grid-cols-3 gap-6 text-center text-xs text-slate-700 pt-12 border-t border-slate-300">
                <div>
                  <p className="text-slate-500 mb-16">Dibuat Oleh (Admin Payroll),</p>
                  <p className="font-bold border-b border-slate-400 pb-1 mx-4">
                    Staf Payroll MAKARE
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-16">Diperiksa Oleh (Finance/HR),</p>
                  <p className="font-bold border-b border-slate-400 pb-1 mx-4">
                    Supervisor HRD & GA
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-16">Disetujui Oleh (Direksi),</p>
                  <p className="font-bold border-b border-slate-400 pb-1 mx-4">
                    Direktur Operasional
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">PT MAKARE NUSANTARA INDONESIA</p>
                </div>
              </div>
            </div>

            {/* Sheet 2: Master Rekapitulasi Penggajian */}
            <div className="border-b-2 border-slate-300 pb-10 print:border-none print:pb-0" style={{ pageBreakAfter: 'always' }}>
              <div className="border-b-2 border-slate-800 pb-3 mb-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase">
                  BAGIAN 1: REKAPITULASI PENGGAJIAN MASTER PERIODE
                </h2>
                <p className="text-xs text-slate-500">
                  Periode: {selectedPeriod?.period_start} s/d {selectedPeriod?.period_end}
                </p>
              </div>

              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">No</th>
                    <th className="py-2 px-3">Kode</th>
                    <th className="py-2 px-3">Nama Karyawan</th>
                    <th className="py-2 px-3">Departemen</th>
                    <th className="py-2 px-3 text-right">Jam Reg</th>
                    <th className="py-2 px-3 text-right">Jam Lembur</th>
                    <th className="py-2 px-3 text-right">Gaji Kotor</th>
                    <th className="py-2 px-3 text-right text-red-600">Pot. Kasbon</th>
                    <th className="py-2 px-3 text-right font-bold">Gaji Bersih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((r, i) => (
                    <tr key={r.id}>
                      <td className="py-2 px-3">{i + 1}</td>
                      <td className="py-2 px-3 font-mono">{r.employee_code}</td>
                      <td className="py-2 px-3 font-medium">{r.employee_name}</td>
                      <td className="py-2 px-3">{r.department_name}</td>
                      <td className="py-2 px-3 text-right font-mono">{r.total_regular_hours}</td>
                      <td className="py-2 px-3 text-right font-mono">{r.total_overtime_hours}</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">
                        Rp {r.gross_pay.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-red-600">
                        Rp {r.cash_advance_deduction.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums font-bold">
                        Rp {r.net_pay.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
                  <tr>
                    <td colSpan={6} className="py-2.5 px-3 uppercase">Total Penggajian:</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      Rp {records.reduce((s, r) => s + r.gross_pay, 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-red-600">
                      - Rp {records.reduce((s, r) => s + r.cash_advance_deduction, 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      Rp {records.reduce((s, r) => s + r.net_pay, 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Sheet 3: Rekap Kehadiran, Jam Kerja & Analisis Keterlambatan */}
            <div className="border-b-2 border-slate-300 pb-10 print:border-none print:pb-0" style={{ pageBreakAfter: 'always' }}>
              <div className="border-b-2 border-slate-800 pb-3 mb-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase">
                  BAGIAN 2: REKAPITULASI KEHADIRAN & ANALISIS KETERLAMBATAN
                </h2>
                <p className="text-xs text-slate-500">
                  Jadwal Masuk: {settings?.start_time || '08:00'} WIB · Batas Toleransi: {settings?.late_tolerance_minutes || 15} Menit
                </p>
              </div>

              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">No</th>
                    <th className="py-2 px-3">Kode</th>
                    <th className="py-2 px-3">Nama Karyawan</th>
                    <th className="py-2 px-3">Departemen</th>
                    <th className="py-2 px-3 text-center">Total Sesi Masuk</th>
                    <th className="py-2 px-3 text-center text-emerald-800">Tepat Waktu</th>
                    <th className="py-2 px-3 text-center text-amber-800">Sesi Terlambat</th>
                    <th className="py-2 px-3 text-right">Total Menit Terlambat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp, i) => {
                    const empSessions = allAttendance.filter(
                      (s) =>
                        s.employee_id === emp.id &&
                        selectedPeriod &&
                        s.work_date >= selectedPeriod.period_start &&
                        s.work_date <= selectedPeriod.period_end
                    );
                    const onTimeCount = empSessions.filter((s) => !s.is_late).length;
                    const lateCount = empSessions.filter((s) => s.is_late).length;
                    const totalLateMins = empSessions.reduce((sum, s) => sum + (s.late_minutes || 0), 0);

                    return (
                      <tr key={emp.id}>
                        <td className="py-2 px-3">{i + 1}</td>
                        <td className="py-2 px-3 font-mono">{emp.employee_code}</td>
                        <td className="py-2 px-3 font-medium">{emp.name}</td>
                        <td className="py-2 px-3">{emp.department_name}</td>
                        <td className="py-2 px-3 text-center font-mono">{empSessions.length} sesi</td>
                        <td className="py-2 px-3 text-center font-mono font-semibold text-emerald-800">
                          {onTimeCount}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-semibold text-amber-800">
                          {lateCount > 0 ? `${lateCount} kali` : '0'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">
                          {totalLateMins > 0 ? (
                            <span className="text-amber-800 font-semibold">{totalLateMins} menit</span>
                          ) : (
                            <span className="text-slate-400">0 mnt</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Sheet 4: Buku Saldo Kasbon Karyawan */}
            <div className="border-b-2 border-slate-300 pb-10 print:border-none print:pb-0" style={{ pageBreakAfter: 'always' }}>
              <div className="border-b-2 border-slate-800 pb-3 mb-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase">
                  BAGIAN 3: BUKU KASBON & SISA SALDO TERUTANG
                </h2>
                <p className="text-xs text-slate-500">
                  Daftar Saldo Kasbon Karyawan Terkini
                </p>
              </div>

              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">No</th>
                    <th className="py-2 px-3">Kode</th>
                    <th className="py-2 px-3">Nama Karyawan</th>
                    <th className="py-2 px-3">Departemen</th>
                    <th className="py-2 px-3 text-right">Total Pinjaman (ISSUED)</th>
                    <th className="py-2 px-3 text-right">Potongan Payroll</th>
                    <th className="py-2 px-3 text-right">Pelunasan Mandiri</th>
                    <th className="py-2 px-3 text-right font-bold">Sisa Saldo Terutang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kasbonBalances.map((b, i) => (
                    <tr key={b.employee_id}>
                      <td className="py-2 px-3">{i + 1}</td>
                      <td className="py-2 px-3 font-mono">{b.employee_code}</td>
                      <td className="py-2 px-3 font-medium">{b.employee_name}</td>
                      <td className="py-2 px-3">{b.department_name}</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">
                        Rp {b.total_issued.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                        Rp {b.total_deducted.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                        Rp {b.total_repaid.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums font-bold">
                        {b.current_balance > 0 ? (
                          <span className="text-red-600">Rp {b.current_balance.toLocaleString('id-ID')}</span>
                        ) : (
                          <span className="text-emerald-700">Lunas</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
                  <tr>
                    <td colSpan={7} className="py-2.5 px-3 uppercase">Total Saldo Terutang Perusahaan:</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                      Rp {kasbonBalances.reduce((s, b) => s + Math.max(0, b.current_balance), 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Sheet 5+: All Individual Payslips Sequentially */}
            <div className="space-y-12">
              <div className="border-b-2 border-slate-800 pb-2">
                <h2 className="text-sm font-bold text-slate-900 uppercase">
                  BAGIAN 4: SLIP GAJI INDIVIDUAL KARYAWAN (LAMPIRAN RESMI)
                </h2>
              </div>

              {records.map((r) => (
                <div key={r.id} className="border border-slate-200 p-6 rounded-xl space-y-4 print:border-none print:p-0 print:m-0" style={{ pageBreakAfter: 'always' }}>
                  <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-black text-slate-900 uppercase">
                        {settings?.company_name || 'PT MAKARE NUSANTARA'}
                      </h3>
                      <p className="text-xs text-slate-500">{settings?.company_address}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 uppercase bg-slate-100 px-2 py-0.5 rounded">
                        SLIP GAJI KARYAWAN
                      </span>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                        NO: {r.id.replace('rec-', 'SLIP-')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div>
                      <div><span className="text-slate-500">Nama:</span> <span className="font-bold">{r.employee_name}</span></div>
                      <div><span className="text-slate-500">Kode:</span> <span className="font-mono">{r.employee_code}</span></div>
                      <div><span className="text-slate-500">Dept:</span> <span>{r.department_name}</span></div>
                    </div>
                    <div>
                      <div><span className="text-slate-500">Periode:</span> <span>{selectedPeriod?.period_start} s/d {selectedPeriod?.period_end}</span></div>
                      <div><span className="text-slate-500">Mode:</span> <span>{r.salary_mode === 'HOURLY' ? 'Per Jam' : 'Bulanan'}</span></div>
                      <div><span className="text-slate-500">Status:</span> <span className="font-semibold text-emerald-800">{r.payment_status}</span></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="border border-slate-200 rounded-lg p-3 space-y-1.5">
                      <div className="font-bold text-slate-800 border-b pb-1">PENERIMAAN</div>
                      <div className="flex justify-between">
                        <span>Gaji Pokok / Reguler ({r.total_regular_hours} jam)</span>
                        <span className="font-mono">Rp {(r.regular_pay || r.manual_allowances).toLocaleString('id-ID')}</span>
                      </div>
                      {r.overtime_pay > 0 && (
                        <div className="flex justify-between">
                          <span>Upah Lembur ({r.total_overtime_hours} jam)</span>
                          <span className="font-mono">Rp {r.overtime_pay.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div className="pt-1.5 border-t font-bold flex justify-between">
                        <span>Total Gaji Kotor</span>
                        <span className="font-mono">Rp {r.gross_pay.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-3 space-y-1.5">
                      <div className="font-bold text-slate-800 border-b pb-1">POTONGAN</div>
                      <div className="flex justify-between">
                        <span>Potongan Kasbon Periode Ini</span>
                        <span className="font-mono text-red-600 font-semibold">
                          {r.cash_advance_deduction > 0 ? `- Rp ${r.cash_advance_deduction.toLocaleString('id-ID')}` : 'Rp 0'}
                        </span>
                      </div>
                      {r.other_deductions > 0 && (
                        <div className="flex justify-between">
                          <span>Potongan Lain yang Sah</span>
                          <span className="font-mono text-red-600">- Rp {r.other_deductions.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div className="pt-1.5 border-t font-bold text-red-700 flex justify-between">
                        <span>Total Potongan</span>
                        <span className="font-mono">- Rp {(r.cash_advance_deduction + r.other_deductions).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white p-3 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-slate-300">Gaji Bersih Diterima:</span>
                      <div className="italic text-blue-200 text-[10px]">Terbilang: {terbilang(r.net_pay)} Rupiah</div>
                    </div>
                    <div className="text-xl font-bold font-mono text-emerald-400">
                      Rp {r.net_pay.toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-4 text-center text-xs">
                    <div>
                      <p className="text-slate-500 mb-10">Penerima (Karyawan),</p>
                      <p className="font-bold border-b border-slate-400 pb-0.5 mx-8">{r.employee_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-10">Bagian Keuangan,</p>
                      <p className="font-bold border-b border-slate-400 pb-0.5 mx-8">Administrator MAKARE</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
