import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Shield, UserCheck, Monitor, Clock } from 'lucide-react';
import { UserRole } from '../types/index.ts';

interface NavbarProps {
  onOpenKiosk: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenKiosk, activeTab, setActiveTab }) => {
  const { role, setRole } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-[#D9E0E8] px-4 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Zone 1: Brand wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('dashboard');
          }}
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#173B67] whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <span className="w-8 h-8 rounded-lg bg-[#173B67] text-white flex items-center justify-center font-black text-sm tracking-normal">
            M
          </span>
          <span>MAKARE</span>
        </a>
        <span className="hidden md:inline text-xs text-slate-500 border-l border-slate-300 pl-3 py-0.5">
          Manajemen Karyawan Redone
        </span>
      </div>

      {/* Zone 2: Navigation Links (Clean single-line prose) */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`hover:text-[#173B67] transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'dashboard' ? 'text-[#173B67] font-semibold' : ''
          }`}
        >
          Ringkasan
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`hover:text-[#173B67] transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'attendance' ? 'text-[#173B67] font-semibold' : ''
          }`}
        >
          Absensi
        </button>
        {role === 'ADMIN' && (
          <>
            <button
              onClick={() => setActiveTab('employees')}
              className={`hover:text-[#173B67] transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'employees' ? 'text-[#173B67] font-semibold' : ''
              }`}
            >
              Karyawan
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className={`hover:text-[#173B67] transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'payroll' ? 'text-[#173B67] font-semibold' : ''
              }`}
            >
              Penggajian
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`hover:text-[#173B67] transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'reports' ? 'text-[#173B67] font-semibold' : ''
              }`}
            >
              Laporan & Slip
            </button>
          </>
        )}
      </nav>

      {/* Zone 3: Interactive Role Switcher & Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setRole('ADMIN')}
            title="Masuk sebagai Administrator"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
              role === 'ADMIN'
                ? 'bg-[#173B67] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
          <button
            onClick={() => setRole('OPERATOR')}
            title="Masuk sebagai Operator Input"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
              role === 'OPERATOR'
                ? 'bg-[#173B67] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Operator</span>
          </button>
        </div>

        <button
          onClick={onOpenKiosk}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-[#173B67] hover:bg-[#122f52] rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Buka Kios Absensi</span>
        </button>
      </div>
    </header>
  );
};
