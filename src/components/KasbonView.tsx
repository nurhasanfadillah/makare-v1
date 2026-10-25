import React, { useState, useEffect } from 'react';
import {
  WalletCards,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { KasbonEmployeeBalance, CashAdvanceTransaction, Employee } from '../types/index.ts';

export const KasbonView: React.FC = () => {
  const [balances, setBalances] = useState<KasbonEmployeeBalance[]>([]);
  const [transactions, setTransactions] = useState<CashAdvanceTransaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('ALL');

  // Modal Issue Kasbon
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueEmpId, setIssueEmpId] = useState('');
  const [issueAmount, setIssueAmount] = useState<number>(500000);
  const [issueNotes, setIssueNotes] = useState('Pinjaman operasional darurat');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal Repayment
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [repayEmpId, setRepayEmpId] = useState('');
  const [repayAmount, setRepayAmount] = useState<number>(200000);
  const [repayNotes, setRepayNotes] = useState('Pelunasan tunai di kantor kasir');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bals, txs, emps] = await Promise.all([
        api.getKasbonBalances(),
        api.getKasbonTransactions(),
        api.getEmployees(),
      ]);
      setBalances(bals);
      setTransactions(txs);
      setEmployees(emps.filter((e) => e.is_active));
      if (emps.length > 0 && !issueEmpId) {
        setIssueEmpId(emps[0].id);
        setRepayEmpId(emps[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat buku kasbon.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueKasbon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueEmpId) return;
    try {
      setError(null);
      await api.addKasbonTransaction({
        employee_id: issueEmpId,
        date: issueDate,
        type: 'ISSUED',
        amount: Number(issueAmount),
        notes: issueNotes,
      });
      setSuccessMsg('Pemberian kasbon berhasil dicatat dalam buku kasbon.');
      setIsIssueModalOpen(false);
      await loadData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRepayKasbon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayEmpId) return;
    try {
      setError(null);
      await api.addKasbonTransaction({
        employee_id: repayEmpId,
        date: new Date().toISOString().split('T')[0],
        type: 'REPAYMENT',
        amount: Number(repayAmount),
        notes: repayNotes,
      });
      setSuccessMsg('Pelunasan mandiri kasbon berhasil dicatat.');
      setIsRepayModalOpen(false);
      await loadData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const totalOutstanding = balances.reduce((sum, b) => sum + Math.max(0, b.current_balance), 0);
  const totalIssuedAll = balances.reduce((sum, b) => sum + b.total_issued, 0);
  const totalDeductedAll = balances.reduce((sum, b) => sum + b.total_deducted, 0);

  const filteredBalances = balances.filter(
    (b) =>
      b.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      b.employee_code.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTransactions = transactions.filter((t) => {
    const matchesEmp = selectedEmployeeId === 'ALL' || t.employee_id === selectedEmployeeId;
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchesSearch =
      (t.employee_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.employee_code || '').toLowerCase().includes(search.toLowerCase()) ||
      t.notes.toLowerCase().includes(search.toLowerCase());
    return matchesEmp && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Buttons */}
      <div className="bg-white rounded-xl border border-[#D9E0E8] p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#173B67]">
            Buku Kasbon & Ledger Transaksi
          </h2>
          <p className="text-xs text-slate-500">
            Pencatatan pinjaman karyawan berbasis ledger transaksional. Terkoneksi otomatis dengan potongan gaji penutupan periode.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setIsRepayModalOpen(true)}
            className="flex-1 md:flex-none px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            <span>Catat Pelunasan Mandiri</span>
          </button>
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="flex-1 md:flex-none px-4 py-2 text-xs font-semibold text-white bg-[#173B67] hover:bg-[#122f52] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Beri Kasbon Baru</span>
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

      {/* KPI Cards: Kasbon Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#D9E0E8] p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Total Sisa Kasbon Terutang
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-red-600">
            Rp {totalOutstanding.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Saldo aktif yang belum terlunasi</div>
        </div>

        <div className="bg-white rounded-xl border border-[#D9E0E8] p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Total Pinjaman Diberikan (Historis)
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            Rp {totalIssuedAll.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Akumulasi transaksi ISSUED</div>
        </div>

        <div className="bg-white rounded-xl border border-[#D9E0E8] p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Total Terpotong Melalui Gaji
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600">
            Rp {totalDeductedAll.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Akumulasi potongan payroll resmi</div>
        </div>
      </div>

      {/* Section 1: Saldo Kasbon per Karyawan */}
      <div className="bg-white rounded-xl border border-[#D9E0E8] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Ringkasan Saldo per Karyawan</h3>
            <p className="text-xs text-slate-500">Saldo bersumber dari seluruh transaksi ledger yang valid</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-[#D9E0E8] text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-4">Departemen</th>
                <th className="py-3 px-4 text-right">Total Pinjaman (ISSUED)</th>
                <th className="py-3 px-4 text-right">Potongan Gaji (DEDUCTION)</th>
                <th className="py-3 px-4 text-right">Pelunasan Mandiri (REPAYMENT)</th>
                <th className="py-3 px-4 text-right">Sisa Saldo Terutang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBalances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    Tidak ada data saldo karyawan.
                  </td>
                </tr>
              ) : (
                filteredBalances.map((b) => (
                  <tr key={b.employee_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{b.employee_name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{b.employee_code}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{b.department_name}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">
                      Rp {b.total_issued.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                      Rp {b.total_deducted.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                      Rp {b.total_repaid.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                      {b.current_balance > 0 ? (
                        <span className="text-red-600">Rp {b.current_balance.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-emerald-700">Lunas (Rp 0)</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Buku Ledger Transaksi Lengkap */}
      <div className="bg-white rounded-xl border border-[#D9E0E8] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Buku Ledger Riwayat Transaksi</h3>
            <p className="text-xs text-slate-500">Catatan kronologis seluruh mutasi kasbon</p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* Filter by Employee */}
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">Semua Karyawan</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>

            {/* Filter by Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="ISSUED">Pemberian (ISSUED)</option>
              <option value="PAYROLL_DEDUCTION">Potongan Gaji (DEDUCTION)</option>
              <option value="REPAYMENT">Pelunasan (REPAYMENT)</option>
              <option value="REVERSAL">Pembalik (REVERSAL)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-[#D9E0E8] text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-4">Jenis Mutasi</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4">Keterangan / Referensi</th>
                <th className="py-3 px-4">Oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Tidak ada transaksi kasbon yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-700">{tx.date}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {tx.employee_name} <span className="font-mono text-slate-400 text-[11px]">({tx.employee_code})</span>
                    </td>
                    <td className="py-3 px-4">
                      {tx.type === 'ISSUED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                          <ArrowUpRight className="w-3 h-3" /> Pinjaman Baru (+)
                        </span>
                      ) : tx.type === 'PAYROLL_DEDUCTION' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <ArrowDownLeft className="w-3 h-3" /> Potongan Payroll (-)
                        </span>
                      ) : tx.type === 'REPAYMENT' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          <CheckCircle2 className="w-3 h-3" /> Pelunasan Mandiri (-)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          <RotateCcw className="w-3 h-3" /> Pembalikan (Reversal)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                      Rp {tx.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm truncate">{tx.notes}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{tx.created_by}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Pemberian Kasbon Baru */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-900 text-sm">Pemberian Kasbon Baru</h3>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueKasbon} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Pilih Karyawan Penerima *
                </label>
                <select
                  value={issueEmpId}
                  onChange={(e) => setIssueEmpId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.employee_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tanggal Pencairan *
                </label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nominal Pinjaman (Rp) *
                </label>
                <input
                  type="number"
                  min={10000}
                  step={10000}
                  required
                  value={issueAmount}
                  onChange={(e) => setIssueAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67] font-mono tabular-nums text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Keperluan / Alasan Pinjaman *
                </label>
                <textarea
                  rows={2}
                  required
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  placeholder="Contoh: Biaya berobat keluarga mendesak"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#173B67] hover:bg-[#122f52] rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Cairkan Kasbon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pelunasan Mandiri Kasbon */}
      {isRepayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-900 text-sm">Catat Pelunasan Mandiri</h3>
              <button
                onClick={() => setIsRepayModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRepayKasbon} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Pilih Karyawan *
                </label>
                <select
                  value={repayEmpId}
                  onChange={(e) => setRepayEmpId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
                >
                  {employees.map((e) => {
                    const bal = balances.find((b) => b.employee_id === e.id)?.current_balance || 0;
                    return (
                      <option key={e.id} value={e.id}>
                        {e.name} (Saldo: Rp {bal.toLocaleString('id-ID')})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nominal Pelunasan (Rp) *
                </label>
                <input
                  type="number"
                  min={10000}
                  step={10000}
                  required
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67] font-mono tabular-nums text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Keterangan Pembayaran
                </label>
                <input
                  type="text"
                  value={repayNotes}
                  onChange={(e) => setRepayNotes(e.target.value)}
                  placeholder="Contoh: Tunai via Kasir"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRepayModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Simpan Pelunasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
