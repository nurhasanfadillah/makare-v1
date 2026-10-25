import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Users,
  Clock,
  Flame,
  Monitor,
  WalletCards,
  Calculator,
  FileSpreadsheet,
  Settings,
  History,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openKioskModal: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openKioskModal,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { role, isAdmin } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      id: 'attendance',
      label: 'Absensi Reguler',
      icon: Clock,
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      id: 'overtime',
      label: 'Absensi Lembur',
      icon: Flame,
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      id: 'kiosk',
      label: 'Mode Kios Publik',
      icon: Monitor,
      roles: ['ADMIN', 'OPERATOR'],
      action: openKioskModal,
    },
    {
      id: 'employees',
      label: 'Data Karyawan & Tarif',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      id: 'kasbon',
      label: 'Buku Kasbon',
      icon: WalletCards,
      roles: ['ADMIN'],
    },
    {
      id: 'payroll',
      label: 'Penggajian & Penutupan',
      icon: Calculator,
      roles: ['ADMIN'],
    },
    {
      id: 'reports',
      label: 'Laporan & Slip Gaji',
      icon: FileSpreadsheet,
      roles: ['ADMIN'],
    },
    {
      id: 'settings',
      label: 'Pengaturan Jam Kerja',
      icon: Settings,
      roles: ['ADMIN'],
    },
    {
      id: 'audit',
      label: 'Jejak Audit Sistem',
      icon: History,
      roles: ['ADMIN'],
    },
  ];

  const allowedItems = navItems.filter((item) => item.roles.includes(role));

  const handleItemClick = (item: typeof navItems[0]) => {
    if (item.action) {
      item.action();
    } else {
      setActiveTab(item.id);
    }
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <aside
      className={`fixed lg:static top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-[#D9E0E8] flex flex-col justify-between transition-transform duration-200 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="py-4 px-3 overflow-y-auto flex-1">
        <div className="px-3 mb-2">
          <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-600">
            Menu Operasional
          </p>
        </div>

        <nav className="space-y-1">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#173B67] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Role permission info card in footer */}
      <div className="p-3 border-t border-[#D9E0E8] bg-slate-50">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200 text-xs">
          <div
            className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
              isAdmin ? 'bg-blue-100 text-[#173B67]' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isAdmin ? <Settings className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-slate-900 truncate">
              {isAdmin ? 'Mode Administrator' : 'Operator Terbatas'}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {isAdmin ? 'Akses penuh seluruh modul' : 'Hanya input absensi'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
