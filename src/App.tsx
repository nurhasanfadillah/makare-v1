/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { EmployeesView } from './components/EmployeesView.tsx';
import { AttendanceView } from './components/AttendanceView.tsx';
import { OvertimeView } from './components/OvertimeView.tsx';
import { KasbonView } from './components/KasbonView.tsx';
import { PayrollView } from './components/PayrollView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { AuditView } from './components/AuditView.tsx';
import { KioskMode } from './components/KioskMode.tsx';
import { Menu, X } from 'lucide-react';

function MainApp() {
  const { role, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // If Operator tries to access Admin tabs, redirect to Dashboard
  React.useEffect(() => {
    const adminOnlyTabs = ['employees', 'kasbon', 'payroll', 'reports', 'settings', 'audit'];
    if (role === 'OPERATOR' && adminOnlyTabs.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [role, activeTab]);

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#172033] flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenKiosk={() => setIsKioskOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Mobile Menu Toggle Button */}
      <div className="lg:hidden bg-white border-b border-[#D9E0E8] px-4 py-2.5 flex items-center justify-between text-xs">
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer"
        >
          {isMobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Menu Navigasi</span>
        </button>
        <span className="text-[11px] font-mono text-slate-500">
          Mode: {isAdmin ? 'Admin' : 'Operator'}
        </span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openKioskModal={() => setIsKioskOpen(true)}
          isMobileOpen={isMobileNavOpen}
          setIsMobileOpen={setIsMobileNavOpen}
        />

        {/* Backdrop for mobile drawer */}
        {isMobileNavOpen && (
          <div
            onClick={() => setIsMobileNavOpen(false)}
            className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                onNavigate={(tab) => setActiveTab(tab)}
                onOpenKiosk={() => setIsKioskOpen(true)}
              />
            )}

            {activeTab === 'attendance' && <AttendanceView />}

            {activeTab === 'overtime' && <OvertimeView />}

            {activeTab === 'employees' && isAdmin && <EmployeesView />}

            {activeTab === 'kasbon' && isAdmin && <KasbonView />}

            {activeTab === 'payroll' && isAdmin && (
              <PayrollView
                onViewSlipGaji={() => setActiveTab('reports')}
              />
            )}

            {activeTab === 'reports' && isAdmin && <ReportsView />}

            {activeTab === 'settings' && isAdmin && <SettingsView />}

            {activeTab === 'audit' && isAdmin && <AuditView />}
          </div>
        </main>
      </div>

      {/* Fullscreen Public Attendance Kiosk Modal */}
      {isKioskOpen && (
        <KioskMode
          onClose={() => setIsKioskOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
