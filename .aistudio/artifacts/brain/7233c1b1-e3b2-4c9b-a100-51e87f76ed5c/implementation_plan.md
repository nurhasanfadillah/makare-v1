# MAKARE — Analisis Konsistensi Penutupan Periode, Metrik Keterlambatan & Bundel Laporan Lengkap

Enhance MAKARE with an advanced pre-closing data consistency and integrity analysis engine, automated late-arrival tracking based on shift tolerance thresholds, and a consolidated multi-document printable reporting packet.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following directions were confirmed during interactive clarification:

- **Confirmed Decision 1 (Closing Data Consistency & Validation)**: Implement a deep integrity audit engine in the Period Closing module that systematically evaluates 6 critical criteria before closing: open attendance sessions, cross-boundary shifts, snapshot rate integrity, kasbon ledger balance reconciliations, negative net pay guards, and duplicate record checks with clear status indicators (PASS, WARNING, BLOCKER).
- **Confirmed Decision 2 (Late Arrival Calculation)**: Compute and display exact late arrival durations in minutes whenever an employee checks in past the shift start time plus tolerance buffer (e.g. 08:00 + 15 min = 08:15), visible on the Kiosk, Attendance dashboard, and timesheets.
- **Confirmed Decision 3 (Consolidated Printable Packet)**: Provide a comprehensive "Bundel Laporan Periode Lengkap" that merges the executive cover page, master payroll summary, attendance/lateness analysis, kasbon ledger, and all individual payslips into a single printable document with standard A4 page breaks.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Pre-Closing Consistency Audit**: Provides administrators with an interactive diagnostic panel before period closing that runs deep integrity queries and blocks closing if critical invariants are violated.
  2. **Late Arrival & Schedule Tracking**: Automatically flags check-ins after the shift tolerance window (e.g. 08:15), calculating exact minutes late and summarizing punctual vs. late shifts.
  3. **Consolidated Executive Report Packet**: Single-click generation of the entire operational closing binder ready for management sign-off and filing.
- **Target Audience**: Business owners, HR directors, and payroll administrators who require audit compliance and zero calculation discrepancies.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Pre-Closing Diagnostic & Consistency Audit**:
   - In **Penggajian & Penutupan**, clicking "Tutup Periode Baru" automatically runs the automated Diagnostic Engine.
   - A structured diagnostic card displays:
     - *Validasi Sesi Aktif*: Checks for incomplete check-ins. If detected, shows employee names with a direct button to close the session.
     - *Validasi Batas Tanggal*: Ensures no overlapping closed periods.
     - *Rekonsiliasi Kasbon*: Compares proposed payroll deductions against live ledger balances to ensure $0 \le \text{potongan} \le \text{gaji\_tersedia}$.
     - *Validasi Snapshot*: Confirms all sessions have non-zero snapshot rates locked.
     - *Pencegahan Gaji Negatif*: Validates that gross earnings exceed all deductions.
   - If any BLOCKER is found, the "Konfirmasi & Kunci Periode" button remains locked with an actionable resolution guide.
2. **Late Arrival Metrics & Shift Monitoring**:
   - In **Absensi Reguler** and **Mode Kios**:
     - Check-in before 08:15: marked as "Tepat Waktu" with clean badge.
     - Check-in at 08:35: flagged with "Terlambat 20 mnt (Toleransi 15 mnt)" in amber tabular figures.
   - In **Rekap Kehadiran**: Summarizes total tardiness minutes and on-time percentage per employee.
3. **Consolidated Report Packet (Bundel Laporan Lengkap)**:
   - In **Laporan & Slip Gaji**, select "Bundel Laporan Lengkap (Semua Dokumen)".
   - Renders a multi-page operational binder:
     - Page 1: Cover Sheet & Lembar Pengesahan (Executive summary, total payroll disbursement, sign-off blocks).
     - Page 2: Rekapitulasi Penggajian Master.
     - Page 3: Rekapitulasi Kehadiran & Analisis Keterlambatan.
     - Page 4: Buku Saldo Kasbon Perusahaan.
     - Page 5+: All individual Employee Payslips sequentially formatted with `@media print` page breaks.

### Visual Architecture & Theme Tokens

- Retains strict **Operational Clarity**:
  - Dominant Neutral: `#F4F6F9`, Surface: `#FFFFFF`, Navy: `#173B67`.
  - Semantic Audits: Emerald `#16A34A` (Pass), Amber `#D97706` (Warning), Crimson `#DC2626` (Blocker).
  - All numerical values, timestamps, and minutes use monospace tabular figures (`font-mono tabular-nums`).

---

## 3. Technical Architecture & Data Strategy

```
┌───────────────────────────────────────────────────────────────────────────┐
│                       PERIOD CLOSING ENGINE                               │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                   Consistency Audit Validator                       │  │
│  │  1. Check open unclosed check-ins (BLOCKER)                         │  │
│  │  2. Validate period start/end non-overlap (BLOCKER)                 │  │
│  │  3. Reconcile kasbon ledger balances vs proposed deductions         │  │
│  │  4. Enforce Net Pay non-negative invariant: net >= 0 (BLOCKER)      │  │
│  │  5. Verify rate snapshots exist on all sessions                     │  │
│  └──────────────────────────────────┬──────────────────────────────────┘  │
│                                     │ Passes All Critical Invariants      │
│                                     ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │              Atomic Commit Transaction (DB Storage)                 │  │
│  │  - Freeze Payroll Records & Items                                   │  │
│  │  - Append PAYROLL_DEDUCTION to Kasbon Ledger                        │  │
│  │  - Transition Period Status to CLOSED                               │  │
│  │  - Write Full Immutable Audit Log Entry                             │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

### Data Layer Enhancements

1. **Late Arrival Calculation**:
   - Compares session `check_in_at` against `company_settings.start_time` + `company_settings.late_tolerance_minutes`.
   - Computes `late_minutes = Math.max(0, checkInMinutes - (startMinutes + toleranceMinutes))`.
2. **Audit Validator API Endpoint** (`POST /api/payroll/validate-consistency`):
   - Returns structured report: `{ can_close: boolean, checks: AuditCheckItem[], summary: string }`.
3. **Consolidated Report Generator**:
   - Formats complete printable bundle with CSS print controls (`page-break-after: always`).

---

## 4. Implementation Steps

1. **Server Consistency Service**:
   - Add `validatePeriodConsistency(start, end)` to `src/server/db.ts` implementing the 6 strict invariant audits.
   - Expose `POST /api/payroll/validate-consistency` in `server.ts`.
2. **Late Arrival Engine**:
   - Add tardiness computation helper in `src/server/db.ts` and expose late minutes in attendance endpoints.
   - Display late indicators on `AttendanceView.tsx` and `KioskMode.tsx`.
3. **Interactive Consistency Diagnostic Panel**:
   - Update `PayrollView.tsx` with live diagnostic audit checklist inside the closing modal.
4. **Consolidated Report Packet**:
   - Update `ReportsView.tsx` to include "Bundel Laporan Lengkap" combining Cover Sheet, Master Register, Attendance & Tardiness Recap, Kasbon Ledger, and all Payslips.
5. **Verification**:
   - Verify with `compile_applet` and `lint_applet`.
