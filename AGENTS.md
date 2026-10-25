# AGENTS.md — MAKARE (Manajemen Karyawan Redone)

## Arsitektur & Prinsip Sistem

Aplikasi ini adalah sistem operasional perusahaan terpadu untuk:
- Manajemen karyawan & riwayat tarif.
- Absensi reguler (per jam & status manual).
- Absensi lembur dengan snapshot tarif.
- Kios absensi publik mandiri dengan pengamanan verifikasi PIN Master Admin untuk kepulangan sebelum jam selesai.
- Buku kasbon transaksional (`ISSUED`, `PAYROLL_DEDUCTION`, `REPAYMENT`, `REVERSAL`).
- Penggajian & penutupan periode (Period Closing) atomik dan terkunci.
- Pembukaan kembali periode dengan verifikasi PIN Administrator dan jejak audit.
- Cetak laporan resmi dan Slip Gaji individual (PDF / Print A4).

## Aturan Bisnis Kanonis (Strict Invariants)

1. **Snapshot Tarif**: Tarif reguler dan tarif lembur di-snapshot dan dikunci ke dalam sesi absensi pada saat Masuk. Perubahan tarif default pada profil karyawan TIDAK PERNAH mengubah transaksi historis.
2. **Batas Potongan Kasbon**: Potongan kasbon pada penggajian tidak boleh melebihi gaji yang tersedia untuk dipotong (`gaji_kotor - potongan_lain_yang_sah`).
3. **Integritas Penutupan Periode**: Penutupan periode bersifat atomik: mengunci payroll record, memotong saldo kasbon melalui transaksi `PAYROLL_DEDUCTION`, dan mengunci periode. Periode yang tertutup menolak input baru.
4. **Pembukaan Kembali**: Memerlukan verifikasi PIN Administrator, alasan wajib, dan dicatat dalam audit log.
5. **Mode Kios Mandiri**: Pulang awal sebelum jam selesai kerja (`17:00`) memerlukan otorisasi PIN Master Administrator.

## Perintah Pengembangan

- `npm run dev` : Menjalankan server Express full-stack dengan middleware Vite (`tsx server.ts`)
- `npm run build` : Membangun bundel produksi Vite SPA
- `npm run lint` : Memvalidasi tipe TypeScript (`tsc --noEmit`)
