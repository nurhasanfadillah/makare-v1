# AI APP BUILDER PROMPT — MAKARE

## 1. PERAN DAN TUJUAN

Bertindak sebagai software architect, full-stack developer, database engineer, UI/UX designer, security engineer, dan QA engineer untuk membangun **MAKARE (Manajemen Karyawan Redone)**.

Bangun aplikasi web operasional untuk manajemen karyawan, absensi, lembur, penggajian, kasbon, penutupan periode, catatan karyawan, dan laporan PDF.

Aplikasi harus mobile-first, responsif, aman, dapat diaudit, dan mudah dipelihara.

Jangan hanya membuat mockup statis. Bangun alur kerja yang benar-benar berfungsi dengan database dan validasi server.

## 2. INSTRUKSI AWAL WAJIB

Sebelum mengubah atau membuat kode:

1. Periksa struktur proyek dan file yang sudah ada.
2. Periksa `AGENTS.md`, dokumentasi, konfigurasi, skema database, migration, dan komponen UI yang tersedia.
3. Pertahankan implementasi yang sudah benar dan gunakan pola proyek yang ada.
4. Jangan mengganti framework, dependency utama, atau arsitektur tanpa alasan yang jelas dan persetujuan.
5. Identifikasi konflik antara kode yang ada dan spesifikasi ini.
6. Laporkan blocker, asumsi, dan keputusan yang belum ditentukan.
7. Susun rencana implementasi bertahap dengan kriteria penerimaan sebelum mulai mengubah area yang berisiko.

Jika proyek masih kosong, buat fondasi yang sesuai dengan spesifikasi di bawah.

## 3. STACK YANG DIREKOMENDASIKAN

Gunakan stack berikut jika tidak ada constraint proyek yang bertentangan:

- Next.js dengan App Router.
- React dan TypeScript.
- Tailwind CSS.
- shadcn/ui atau komponen aksesibel yang sudah tersedia.
- Neon PostgreSQL.
- Drizzle ORM dan SQL migrations.
- Zod untuk validasi.
- Library autentikasi terpelihara dengan sesi aman dan otorisasi server-side.
- PWA manifest, ikon, dan service worker sesuai kebutuhan.
- Pustaka PDF server-side.
- Vitest untuk unit/integration test dan Playwright untuk alur end-to-end.

Pilihan library autentikasi, hosting, dan PDF harus diverifikasi kompatibilitasnya sebelum implementasi. Jangan mengklaim telah menghubungkan Neon, deployment, atau layanan eksternal sebelum benar-benar berhasil.

## 4. PRINSIP ARSITEKTUR

Pisahkan tanggung jawab:

- `app`: routing, layout, dan batas halaman.
- `features`: logika dan komponen berdasarkan domain.
- `lib/auth`: autentikasi dan otorisasi.
- `lib/db`: koneksi, skema, dan akses database.
- `lib/validation`: schema validasi.
- `lib/audit`: pencatatan tindakan sensitif.
- `tests`: unit, integrasi, dan end-to-end.
- `docs`: spesifikasi dan keputusan kanonis.

Gunakan struktur feature-oriented:

```text
src/
├── app/
│   ├── (auth)/
│   ├── (admin)/
│   ├── public-attendance/
│   └── api/
├── components/
│   ├── ui/
│   └── shared/
├── features/
│   ├── employees/
│   ├── attendance/
│   ├── overtime/
│   ├── payroll/
│   ├── cash-advances/
│   ├── closing/
│   ├── employee-notes/
│   ├── reports/
│   ├── settings/
│   └── users/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── validation/
│   └── audit/
└── tests/
```

Sesuaikan dengan proyek aktual bila sudah memiliki struktur yang sehat.

Buat atau perbarui `AGENTS.md` agar menjelaskan arsitektur, aturan bisnis, konvensi kode, perintah pengembangan, aturan desain, dan larangan perubahan destruktif.

## 5. ATURAN WAJIB SUMBER KEBENARAN

1. Logika payroll harus memiliki satu implementasi kanonis di sisi server/domain.
2. Jangan menyalin rumus payroll ke komponen UI, endpoint, dan generator PDF secara terpisah.
3. Database harus menegakkan constraint penting yang tidak cukup dijamin oleh UI.
4. Semua input dari browser dianggap tidak tepercaya.
5. Validasi hak akses dilakukan di server.
6. Nilai uang menggunakan tipe decimal/database numeric, bukan floating point biner.
7. Semua perubahan tarif, komponen default, dan tindakan sensitif harus memiliki jejak audit.
8. Data periode tertutup tidak boleh berubah akibat perubahan default atau perhitungan ulang biasa.
9. PDF harus menggunakan data resmi dari database dan logika yang sama dengan aplikasi.
10. Penutupan periode dan potongan kasbon harus atomik, idempoten, dan aman terhadap permintaan bersamaan.

## 6. PENGGUNA DAN PERMISSION

### Administrator

Akses penuh ke karyawan, pengaturan, absensi, lembur, payroll, kasbon, penutupan, catatan, laporan, akun, audit, dan koreksi yang diotorisasi.

### Operator Input

Hanya boleh melakukan input absensi yang diizinkan. Tidak boleh mengakses payroll, kasbon, pengaturan, akun, atau penutupan periode.

### Mode Publik

Hanya boleh melakukan tindakan absensi publik yang telah diizinkan. Tidak boleh mengakses data administratif, data gaji, KTP, catatan karyawan, saldo kasbon, atau laporan.

Setiap endpoint harus memverifikasi autentikasi dan otorisasi. Menyembunyikan menu tidak dianggap sebagai kontrol keamanan yang memadai.

## 7. FITUR PRODUK

### A. Manajemen Karyawan

Simpan:

- ID internal.
- Kode karyawan unik.
- Nama lengkap.
- Alamat.
- Jenis kelamin.
- Tanggal lahir.
- Nomor KTP opsional dan dilindungi.
- Nomor WhatsApp.
- Departemen.
- Tanggal masuk.
- Mode gaji `HOURLY` atau `MANUAL`.
- Tarif reguler default.
- Tarif lembur default.
- Daftar komponen gaji manual default.
- Status aktif/nonaktif.
- Timestamp dan riwayat perubahan.

Simpan riwayat perubahan tarif dan komponen default. Perubahan nilai default tidak boleh mengubah transaksi historis.

### B. Pengaturan

Administrator dapat mengatur:

- Hari kerja.
- Jam mulai dan selesai.
- Toleransi keterlambatan.
- Parameter perhitungan keterlambatan.
- Status lembur aktif/nonaktif.
- Zona waktu default `Asia/Jakarta`.

Perubahan pengaturan tidak boleh mengubah hasil periode yang sudah ditutup.

### C. Absensi Reguler

Mode gaji manual:
- Default tanggal hari ini.
- Pilih karyawan.
- Pilih hadir, sakit, izin, atau absen.
- Jika hadir, catat waktu kehadiran.
- Simpan sumber dan pelaku input.
- Bedakan absen otomatis dari absen yang dikonfirmasi.

Mode gaji per jam:
- Pilih karyawan.
- Masuk memulai sesi.
- Keluar menyelesaikan sesi.
- Ambil snapshot tarif saat Masuk dicatat.
- Hitung durasi dari timestamp aktual.
- Tolak sesi aktif ganda dan urutan waktu yang tidak valid.

### D. Absensi Lembur

- Modul terpisah dari absensi reguler.
- Tersedia hanya ketika lembur aktif.
- Masuk lembur mengambil snapshot tarif lembur.
- Keluar menyelesaikan sesi.
- Validasi sesi aktif, timestamp, dan izin.
- Audit koreksi.
- Jika lembur nonaktif, blokir input baru pada server.

### E. Mode Absensi Publik

Tampilkan:
- Jam dan tanggal.
- Jenis absensi reguler/lembur.
- Pencarian karyawan.
- Tombol Masuk/Keluar.
- Konfirmasi tindakan.
- Hasil absensi setelah server mengonfirmasi penyimpanan.

Keluar dinonaktifkan jika tidak ada sesi aktif yang sesuai.

Jika Keluar sebelum jam selesai yang berlaku, minta verifikasi password administrator melalui mekanisme server yang aman. Batasi percobaan, jangan mencatat password dalam log, dan audit hasil verifikasi.

Jangan mengklaim absensi berhasil jika server belum mengonfirmasi transaksi. Jika jaringan terputus, tampilkan status belum terkonfirmasi dan sediakan cara aman untuk memeriksa hasil sebelum mengulang permintaan.

### F. Penggajian Per Jam

Rumus:

`gaji_kotor = jam_reguler × tarif_reguler_snapshot + jam_lembur × tarif_lembur_snapshot + tambahan_manual`

`gaji_tersedia = gaji_kotor - potongan_lain_yang_sah`

`gaji_bersih = gaji_tersedia - potongan_kasbon`

Gunakan tarif snapshot dari transaksi absensi yang sah. Jangan melakukan pembulatan jam otomatis. Jenis dan urutan potongan lain harus mengikuti kebijakan yang telah dikonfirmasi; jangan mengarang kebijakan tersebut.

### G. Penggajian Manual

- Simpan item aktual per periode.
- Setiap item memiliki deskripsi, nominal satuan, volume, dan total.
- Total item adalah nominal satuan dikali volume.
- Gaji kotor merupakan jumlah item pendapatan.
- Gaji bersih dikurangi potongan yang diizinkan dan potongan kasbon.

Nilai default komponen pada profil karyawan hanya menjadi acuan. Nilai aktual payroll disimpan terpisah dan tidak berubah ketika default diperbarui.

### H. Kasbon

Gunakan ledger transaksi dengan jenis:
- `ISSUED`
- `PAYROLL_DEDUCTION`
- `REPAYMENT` bila mekanisme pembayaran kembali terpisah digunakan.
- `REVERSAL`

Saldo berasal dari transaksi yang valid. Jangan mengandalkan angka saldo yang dapat ditimpa tanpa riwayat.

Potongan kasbon final tidak boleh melebihi gaji tersedia untuk dipotong. Jika melebihi, tolak konfirmasi dan tampilkan batas yang berlaku. Sisa saldo kasbon tetap dibawa ke periode berikutnya.

Gunakan constraint unik dan/atau idempotency key untuk mencegah pemotongan ganda.

### I. Penutupan Periode

- Administrator memilih tanggal akhir.
- Periode dimulai sehari setelah periode tertutup sebelumnya.
- Periode pertama membutuhkan tanggal awal yang ditentukan administrator.
- Validasi rentang periode.
- Deteksi absensi yang belum selesai dan pengecualian.
- Pratinjau payroll dan kasbon.
- Penyesuaian potongan kasbon sebelum konfirmasi.
- Tolak potongan di atas gaji tersedia.
- Konfirmasi penutupan dengan otorisasi administrator.
- Simpan payroll snapshot, transaksi kasbon, dan audit dalam satu transaksi atomik.
- Kunci periode setelah penutupan berhasil.
- Tolak permintaan duplikat dan cegah pemrosesan ulang.

Status payroll dihitung, disetujui, dan dibayar harus dipisahkan. Status periode tertutup tidak otomatis berarti gaji telah dibayar.

### J. Tanggal Kerja Lintas Tengah Malam

- Simpan timestamp Masuk dan Keluar secara lengkap.
- Tanggal kerja sesi mengikuti tanggal Masuk.
- Simpan tanggal/waktu pencatatan secara terpisah.
- Durasi dihitung dari timestamp aktual.
- Sesi lintas tengah malam tetap satu sesi.
- Deteksi sesi yang melintasi batas periode dan minta keputusan administrator sesuai kebijakan.
- Tolak input biasa yang ditujukan ke periode tertutup.
- Jangan membagi jam atau memindahkan sesi secara diam-diam.

### K. Koreksi dan Pembukaan Kembali

Periode tertutup hanya dapat dikoreksi melalui penyesuaian yang tercatat atau alur pembukaan kembali yang sah.

Pembukaan kembali:
- Memerlukan verifikasi password administrator di server.
- Memerlukan alasan.
- Mencatat aktor dan waktu.
- Mempertahankan histori penutupan sebelumnya.
- Tidak boleh menghapus audit.
- Tidak boleh menggandakan payroll atau potongan kasbon.

Jangan menyimpan password dalam teks biasa atau menganggap flag UI sebagai otorisasi.

### L. Catatan Karyawan

Administrator dapat menambah dan melihat catatan per karyawan. Simpan pembuat dan waktu. Batasi akses sesuai peran.

### M. Laporan PDF

Sediakan:
- Daftar karyawan.
- Ringkasan payroll.
- Slip gaji individual.
- Rekap absensi.
- Analisis jam kerja dan keterlambatan.
- Buku kasbon.
- Riwayat penutupan dan penyesuaian.

Semua laporan harus mengambil data dari sumber resmi yang sama dengan aplikasi. Batasi akses download di server.

## 8. MODEL DATA

Buat skema relasional dengan foreign key, constraint, migration, dan indeks yang sesuai.

Tabel yang direncanakan:

- `departments`
- `employees`
- `employee_rate_history`
- `employee_default_pay_items`
- `employee_default_pay_item_history`
- `attendance_sessions`
- `attendance_status_records`
- `overtime_sessions`
- `work_schedules`
- `company_settings`
- `overtime_settings`
- `users`
- `roles`
- `user_roles`
- `public_attendance_devices` bila diperlukan
- `employee_notes`
- `payroll_periods`
- `payroll_records`
- `payroll_items`
- `cash_advance_transactions`
- `payroll_adjustments`
- `period_reopen_requests`
- `payroll_payments`
- `audit_logs`

Gunakan UUID sebagai primary key bila sesuai. Gunakan `NUMERIC(14,2)` atau tipe decimal setara untuk uang, `DATE` untuk tanggal bisnis, dan `TIMESTAMPTZ` untuk timestamp.

Constraint minimal:
- Kode karyawan unik.
- Satu payroll record per karyawan per periode.
- Periode tidak tumpang tindih.
- Referensi transaksi kasbon valid.
- Potongan payroll idempoten.
- Sesi tidak memiliki waktu keluar sebelum masuk.
- Tidak ada sesi aktif ganda yang tidak diizinkan.
- Relasi menggunakan foreign key.

Jangan menghapus data historis saat karyawan dinonaktifkan. Jangan melakukan migration destruktif tanpa persetujuan eksplisit.

## 9. UI/UX

Gunakan konsep **Operational Clarity**.

Visual:
- Latar abu-abu terang `#F4F6F9`.
- Surface putih.
- Teks gelap `#172033`.
- Primary biru tua `#173B67`.
- Border `#D9E0E8`.
- Warna status hijau, kuning, dan merah yang aksesibel.
- Tipografi sans-serif seperti Inter.
- Spacing konsisten, radius moderat, dan ikon dari satu keluarga.

Jangan membuat tampilan generik yang penuh kartu atau dekorasi. Prioritaskan keterbacaan angka, hierarchy, whitespace, dan tindakan utama.

Buat UI mobile-first dengan target sentuh minimal 44–48 px. Desktop dapat menggunakan sidebar. Mobile menggunakan navigasi yang ringkas dan mudah dijangkau.

Implementasikan layar:
1. Login.
2. Dashboard.
3. Daftar dan detail karyawan.
4. Absensi reguler.
5. Absensi lembur.
6. Mode publik.
7. Input gaji manual.
8. Payroll dan rincian.
9. Buku kasbon.
10. Penutupan periode.
11. Laporan.
12. Pengaturan.
13. Akun dan audit.

Setiap alur penting harus mempunyai loading, empty state, validasi, error, permission denied, success, dan recoverable failure states. Jangan menyisakan tombol dekoratif tanpa fungsi.

Gunakan label form yang jelas, navigasi keyboard, focus indicator, kontras memadai, pesan error yang membantu, dan konfirmasi untuk tindakan berisiko.

## 10. KEAMANAN DAN OPERASIONAL

Wajib:
- Server-side authentication dan authorization.
- Validasi input di server.
- Rate limiting pada endpoint publik dan autentikasi sensitif.
- Perlindungan terhadap permintaan duplikat.
- HTTPS untuk produksi.
- Secrets hanya di environment server.
- Audit tindakan sensitif.
- Proteksi data KTP dan minimisasi pengumpulan data.
- Database migrations yang dapat ditinjau.
- Backup dan prosedur restore.
- Penanganan error tanpa membocorkan informasi internal.
- Tidak ada akses administratif melalui mode publik.

Jangan pernah menampilkan secret, password, token, atau credential pada UI maupun log.

## 11. TAHAPAN IMPLEMENTASI

Bangun secara bertahap dan jangan mengimplementasikan semua fitur sekaligus tanpa validasi.

### Tahap 1 — Fondasi
- Periksa proyek dan dokumentasi.
- Setup stack dan environment.
- Autentikasi dan roles.
- Database dan migration.
- Layout, komponen, design tokens.
- Dokumentasi dan test setup.

### Tahap 2 — Karyawan dan absensi
- CRUD karyawan/departemen.
- Riwayat tarif dan komponen default.
- Pengaturan jadwal.
- Absensi reguler.
- Mode publik.
- Lembur.
- Validasi sesi dan timestamp.

### Tahap 3 — Payroll dan kasbon
- Input gaji manual.
- Kalkulasi per jam.
- Payroll items.
- Ledger kasbon.
- Snapshot dan audit.
- Unit/integration test finansial.

### Tahap 4 — Penutupan dan koreksi
- Validasi periode.
- Pratinjau payroll.
- Batas potongan kasbon.
- Penutupan atomik.
- Penguncian.
- Penyesuaian dan pembukaan kembali.
- Uji idempotensi dan konkurensi.

### Tahap 5 — Laporan dan hardening
- PDF dan rekap.
- Pengujian end-to-end.
- Pengujian responsif dan aksesibilitas.
- Uji otorisasi.
- Backup dan restore.
- Persiapan deployment.

Setelah setiap tahap:
1. Jalankan test yang relevan.
2. Periksa perubahan database dan migration.
3. Periksa regresi pada fitur sebelumnya.
4. Perbarui dokumentasi.
5. Laporkan apa yang benar-benar berhasil dan apa yang belum.

## 12. KRITERIA PENERIMAAN

Jangan menandai fitur selesai sebelum:
- Acceptance criteria fitur terpenuhi.
- Unit/integration test relevan lulus.
- Otorisasi diuji.
- Error state diuji.
- Perubahan database aman.
- Tidak ada data historis yang berubah tanpa izin.
- UI berfungsi pada ukuran layar umum.
- Tidak ada kontrol utama yang tidak berfungsi.

Khusus fitur finansial:
- Snapshot tarif tetap konsisten.
- Saldo kasbon dapat ditelusuri.
- Potongan melebihi gaji tersedia ditolak.
- Penutupan tidak memproses data dua kali.
- Periode tertutup menolak input biasa.
- Pembukaan kembali tercatat dan terotorisasi.
- PDF konsisten dengan data resmi.

## 13. MUST NOT ASSUME / MUST NOT CHANGE

Jangan:
- Mengarang aturan bisnis yang belum disetujui.
- Mengubah rumus payroll tanpa persetujuan.
- Mengubah snapshot historis ketika tarif default diperbarui.
- Mengizinkan potongan kasbon melebihi gaji tersedia.
- Mengizinkan input normal pada periode tertutup.
- Membuka periode tertutup tanpa verifikasi administrator.
- Menghapus audit atau transaksi historis untuk memperbaiki kesalahan.
- Menggandakan logika payroll pada UI dan PDF.
- Membuka data administratif melalui mode publik.
- Menggunakan data KTP tanpa kebutuhan.
- Menyimpan password sebagai teks biasa.
- Mengekspos secret ke browser.
- Menghapus, mereset, atau menimpa database produksi.
- Mengubah stack atau dependency besar tanpa alasan dan persetujuan.
- Mengklaim test, deployment, integrasi, atau backup berhasil jika belum dilakukan.
- Menganggap absensi berhasil saat server belum mengonfirmasi transaksi.

Jika keputusan penting belum ditentukan, berhenti pada bagian yang terdampak, jelaskan pilihan dan konsekuensinya, lalu minta keputusan. Untuk detail berisiko rendah, usulkan default dan tandai sebagai asumsi.

## 14. DOKUMENTASI DAN LAPORAN PROGRES

Buat dan pertahankan dokumen:
- `docs/product-requirements.md`
- `docs/business-rules.md`
- `docs/database-erd.md`
- `docs/roles-permissions.md`
- `docs/ui-design-system.md`
- `docs/testing-acceptance.md`

Dokumentasikan:
- Keputusan yang sudah dikonfirmasi.
- Asumsi yang belum dikonfirmasi.
- Migration yang dibuat.
- Test yang benar-benar dijalankan.
- Hasil test yang sebenarnya.
- Blocker.
- Fitur yang belum selesai.
- Langkah berikutnya.

Mulai dengan inspeksi proyek dan rencana tahap pertama. Jangan langsung melakukan perubahan besar sebelum memahami kondisi repository dan risiko data.
