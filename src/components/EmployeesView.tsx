import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  History,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Trash2,
  DollarSign,
} from 'lucide-react';
import { api } from '../services/api.ts';
import {
  Employee,
  Department,
  SalaryMode,
  EmployeeDefaultPayItem,
  EmployeeRateHistory,
  EmployeeNote,
} from '../types/index.ts';

export const EmployeesView: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    employee_code: '',
    name: '',
    address: '',
    gender: 'L' as 'L' | 'P',
    birth_date: '1995-01-01',
    national_id_masked: '',
    phone: '',
    department_id: '',
    join_date: new Date().toISOString().split('T')[0],
    salary_mode: 'HOURLY' as SalaryMode,
    default_hourly_rate: 25000,
    default_overtime_rate: 35000,
    is_active: true,
  });

  const [payItems, setPayItems] = useState<Array<{ id?: string; description: string; amount: number; item_type: 'ALLOWANCE' | 'DEDUCTION' }>>([]);

  // Rate history modal
  const [historyModalEmp, setHistoryModalEmp] = useState<Employee | null>(null);
  const [rateHistories, setRateHistories] = useState<EmployeeRateHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Notes modal
  const [notesModalEmp, setNotesModalEmp] = useState<Employee | null>(null);
  const [notes, setNotes] = useState<EmployeeNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [emps, depts] = await Promise.all([api.getEmployees(), api.getDepartments()]);
      setEmployees(emps);
      setDepartments(depts);
      if (depts.length > 0 && !formData.department_id) {
        setFormData((prev) => ({ ...prev, department_id: depts[0].id }));
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data karyawan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      employee_code: `MK-${String(employees.length + 1).padStart(3, '0')}`,
      name: '',
      address: '',
      gender: 'L',
      birth_date: '1995-01-01',
      national_id_masked: '',
      phone: '',
      department_id: departments[0]?.id || '',
      join_date: new Date().toISOString().split('T')[0],
      salary_mode: 'HOURLY',
      default_hourly_rate: 25000,
      default_overtime_rate: 35000,
      is_active: true,
    });
    setPayItems([]);
    setIsFormOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      employee_code: emp.employee_code,
      name: emp.name,
      address: emp.address,
      gender: emp.gender,
      birth_date: emp.birth_date,
      national_id_masked: emp.national_id_masked,
      phone: emp.phone,
      department_id: emp.department_id,
      join_date: emp.join_date,
      salary_mode: emp.salary_mode,
      default_hourly_rate: emp.default_hourly_rate,
      default_overtime_rate: emp.default_overtime_rate,
      is_active: emp.is_active,
    });
    setPayItems(emp.default_pay_items || []);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await api.saveEmployee({
        ...(editingEmployee ? { id: editingEmployee.id } : {}),
        ...formData,
        default_pay_items:
          formData.salary_mode === 'MANUAL'
            ? payItems.map((p) => ({
                id: p.id || '',
                employee_id: editingEmployee?.id || '',
                description: p.description,
                amount: p.amount,
                item_type: p.item_type,
              }))
            : [],
      });
      setSuccessMsg(
        editingEmployee
          ? `Data karyawan ${formData.name} berhasil diperbarui.`
          : `Karyawan baru ${formData.name} berhasil ditambahkan.`
      );
      setIsFormOpen(false);
      await loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data karyawan');
    }
  };

  const addPayItemRow = () => {
    setPayItems((prev) => [
      ...prev,
      { description: 'Tunjangan Operasional', amount: 300000, item_type: 'ALLOWANCE' },
    ]);
  };

  const removePayItemRow = (index: number) => {
    setPayItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePayItem = (index: number, field: string, value: any) => {
    setPayItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Open rate history
  const openRateHistory = async (emp: Employee) => {
    setHistoryModalEmp(emp);
    try {
      setHistoryLoading(true);
      const histories = await api.getRateHistory(emp.id);
      setRateHistories(histories);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Open employee notes
  const openNotesModal = async (emp: Employee) => {
    setNotesModalEmp(emp);
    setNewNoteText('');
    try {
      setNotesLoading(true);
      const data = await api.getNotes(emp.id);
      setNotes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesModalEmp || !newNoteText.trim()) return;
    try {
      await api.addNote(notesModalEmp.id, newNoteText.trim());
      setNewNoteText('');
      const updated = await api.getNotes(notesModalEmp.id);
      setNotes(updated);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(search.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || emp.department_id === departmentFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && emp.is_active) ||
      (statusFilter === 'INACTIVE' && !emp.is_active);
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="bg-white rounded-xl border border-[#D9E0E8] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#173B67]">
            Manajemen Karyawan & Tarif
          </h2>
          <p className="text-xs text-slate-500">
            Kelola data profil, mode gaji per jam vs bulanan, riwayat perubahan tarif, dan catatan internal.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#173B67] hover:bg-[#122f52] rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Karyawan Baru</span>
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#D9E0E8] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau kode karyawan..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
          >
            <option value="ALL">Semua Departemen</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Hanya Aktif</option>
            <option value="INACTIVE">Hanya Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-[#D9E0E8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-[#D9E0E8] text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Departemen</th>
                <th className="py-3 px-4">Mode Gaji</th>
                <th className="py-3 px-4 text-right">Tarif Reguler</th>
                <th className="py-3 px-4 text-right">Tarif Lembur</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Memuat data karyawan...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Tidak ditemukan karyawan yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">{emp.employee_code}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{emp.name}</div>
                      <div className="text-[11px] text-slate-400">{emp.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{emp.department_name}</td>
                    <td className="py-3 px-4">
                      {emp.salary_mode === 'HOURLY' ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#173B67] font-semibold text-[11px] border border-blue-200">
                          Per Jam (Hourly)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[11px] border border-purple-200">
                          Manual / Bulanan
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">
                      {emp.salary_mode === 'HOURLY' ? (
                        `Rp ${emp.default_hourly_rate.toLocaleString('id-ID')}/jam`
                      ) : (
                        <span className="text-slate-400">
                          {emp.default_pay_items && emp.default_pay_items.length > 0
                            ? `Rp ${emp.default_pay_items.reduce((s, i) => s + i.amount, 0).toLocaleString('id-ID')}`
                            : '—'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">
                      Rp {emp.default_overtime_rate.toLocaleString('id-ID')}/jam
                    </td>
                    <td className="py-3 px-4 text-center">
                      {emp.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          <XCircle className="w-3 h-3" />
                          <span>Nonaktif</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(emp)}
                          title="Edit Data & Tarif"
                          className="p-1.5 text-slate-600 hover:text-[#173B67] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openRateHistory(emp)}
                          title="Riwayat Perubahan Tarif"
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openNotesModal(emp)}
                          title="Catatan Karyawan"
                          className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-900 text-sm">
                {editingEmployee ? `Edit Karyawan: ${editingEmployee.name}` : 'Tambah Karyawan Baru'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Kode Karyawan (Unik) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employee_code}
                    onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Departemen *
                  </label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nomor WhatsApp / HP *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Jenis Kelamin
                  </label>
                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.gender === 'L'}
                        onChange={() => setFormData({ ...formData, gender: 'L' })}
                      />
                      <span>Laki-laki (L)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.gender === 'P'}
                        onChange={() => setFormData({ ...formData, gender: 'P' })}
                      />
                      <span>Perempuan (P)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tanggal Masuk Kerja
                  </label>
                  <input
                    type="date"
                    value={formData.join_date}
                    onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
                />
              </div>

              {/* Mode Gaji Configuration */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Struktur & Mode Penggajian
                </label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, salary_mode: 'HOURLY' })}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      formData.salary_mode === 'HOURLY'
                        ? 'border-[#173B67] bg-blue-50/50 ring-1 ring-[#173B67]'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-900">Gaji Per Jam (Hourly)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Upah dihitung dari durasi jam aktual absensi dikali tarif snapshot saat Masuk.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, salary_mode: 'MANUAL' })}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      formData.salary_mode === 'MANUAL'
                        ? 'border-[#173B67] bg-blue-50/50 ring-1 ring-[#173B67]'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-900">Manual / Komponen Bulanan</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Gaji pokok & tunjangan tetap/potongan yang dimasukkan per periode.
                    </div>
                  </button>
                </div>

                {formData.salary_mode === 'HOURLY' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Tarif Reguler Per Jam (Rp) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={formData.default_hourly_rate}
                        onChange={(e) =>
                          setFormData({ ...formData, default_hourly_rate: Number(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67] font-mono tabular-nums bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Tarif Lembur Per Jam (Rp) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={formData.default_overtime_rate}
                        onChange={(e) =>
                          setFormData({ ...formData, default_overtime_rate: Number(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67] font-mono tabular-nums bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">
                        Komponen Gaji Default
                      </span>
                      <button
                        type="button"
                        onClick={addPayItemRow}
                        className="text-xs text-[#173B67] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Komponen</span>
                      </button>
                    </div>

                    {payItems.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">
                        Belum ada komponen default. Klik &ldquo;Tambah Komponen&rdquo; untuk menambahkan gaji pokok atau tunjangan.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {payItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updatePayItem(idx, 'description', e.target.value)}
                              placeholder="Nama Komponen (cth: Gaji Pokok)"
                              className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                            />
                            <select
                              value={item.item_type}
                              onChange={(e) => updatePayItem(idx, 'item_type', e.target.value)}
                              className="px-2 py-1.5 text-xs border border-slate-200 rounded-md"
                            >
                              <option value="ALLOWANCE">Tunjangan / Pendapatan (+)</option>
                              <option value="DEDUCTION">Potongan Sah (-)</option>
                            </select>
                            <input
                              type="number"
                              min={0}
                              value={item.amount}
                              onChange={(e) => updatePayItem(idx, 'amount', Number(e.target.value) || 0)}
                              placeholder="Nominal"
                              className="w-32 px-2.5 py-1.5 text-xs border border-slate-200 rounded-md font-mono tabular-nums"
                            />
                            <button
                              type="button"
                              onClick={() => removePayItemRow(idx)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status Aktif */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-[#173B67]"
                  />
                  <span className="text-xs font-semibold text-slate-700">Karyawan Aktif Bekerja</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#173B67] hover:bg-[#122f52] rounded-lg shadow-xs cursor-pointer"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rate History Modal */}
      {historyModalEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Riwayat Perubahan Tarif: {historyModalEmp.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">Kode: {historyModalEmp.employee_code}</p>
              </div>
              <button
                onClick={() => setHistoryModalEmp(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {historyLoading ? (
                <p className="text-xs text-slate-400 text-center py-4">Memuat riwayat tarif...</p>
              ) : rateHistories.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  Belum ada perubahan tarif historis untuk karyawan ini. Tarif awal masih berlaku.
                </p>
              ) : (
                <div className="space-y-3">
                  {rateHistories.map((h) => (
                    <div key={h.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between font-semibold text-slate-900">
                        <span>{h.rate_type === 'HOURLY' ? 'Tarif Reguler' : 'Tarif Lembur'}</span>
                        <span className="font-mono tabular-nums">
                          Rp {h.old_rate.toLocaleString('id-ID')} → Rp {h.new_rate.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="text-slate-500 flex justify-between text-[11px]">
                        <span>Oleh: {h.changed_by}</span>
                        <span>{new Date(h.effective_date).toLocaleDateString('id-ID')}</span>
                      </div>
                      {h.reason && <div className="text-slate-600 italic text-[11px]">&ldquo;{h.reason}&rdquo;</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {notesModalEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Catatan Karyawan: {notesModalEmp.name}
                </h3>
                <p className="text-xs text-slate-500">Catatan performa, kedisiplinan & evaluasi</p>
              </div>
              <button
                onClick={() => setNotesModalEmp(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={3}
                  required
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Tulis catatan internal perihal kinerja, izin lisan, evaluasi..."
                  className="w-full p-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#173B67] hover:bg-[#122f52] rounded-lg transition-colors cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </form>

              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Riwayat Catatan
                </h4>
                {notesLoading ? (
                  <p className="text-xs text-slate-400 text-center py-4">Memuat catatan...</p>
                ) : notes.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">Belum ada catatan.</p>
                ) : (
                  <div className="space-y-2.5">
                    {notes.map((n) => (
                      <div key={n.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                        <p className="text-slate-800 leading-relaxed mb-1.5">{n.note}</p>
                        <div className="text-[11px] text-slate-400 flex justify-between">
                          <span>Oleh: {n.author}</span>
                          <span>{new Date(n.created_at).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
