# FULL APPLICATION PLAN
## MAKARE — Manajemen Karyawan Redone

**Versi:** 1.0  
**Tanggal:** 25 Oktober 2026  
**Status:** Ready with conditions — siap menjadi acuan implementasi dengan beberapa asumsi yang harus dikonfirmasi sebelum fitur terkait dirilis.

---

## 1. Ringkasan Eksekutif

MAKARE adalah aplikasi manajemen karyawan berbasis Progressive Web App (PWA) untuk satu perusahaan. Aplikasi mengintegrasikan data karyawan, absensi reguler, absensi lembur, penggajian, kasbon, penutupan periode, catatan karyawan, dan laporan PDF.

Aplikasi dirancang mobile-first agar dapat digunakan dari HP, tablet, maupun desktop. Perangkat bersama dapat menjalankan mode absensi publik dengan akses yang sangat terbatas.

### Tujuan utama

1. Memusatkan data karyawan.
2. Mencatat kehadiran dan jam kerja secara konsisten.
3. Menghitung gaji berdasarkan mode gaji per karyawan.
4. Mengelola kasbon dengan saldo dan riwayat transaksi yang dapat diaudit.
5. Menutup periode penggajian dengan mekanisme pratinjau, validasi, dan penguncian.
6. Menghasilkan laporan operasional dan penggajian dalam PDF.
7. Mencegah perubahan historis tanpa otorisasi dan jejak audit.

### Prinsip desain sistem

- Satu sumber logika untuk perhitungan penggajian.
- Data transaksi historis tidak berubah ketika tarif default diperbarui.
- Penutupan periode dan potongan kasbon diproses secara transaksional.
- Hak akses divalidasi di sisi server, bukan hanya melalui tampilan.
- Setiap tindakan sensitif dapat ditelusuri.
- Tidak ada klaim bahwa aplikasi telah dibuat, diuji, atau diterapkan sebelum hal tersebut benar-benar dilakukan.

## 2. Pengguna dan Hak Akses

### 2.1 Administrator

Memiliki akses penuh terhadap:

- Data karyawan dan departemen.
- Pengaturan absensi dan lembur.
- Akun pengguna dan hak akses.
- Absensi manual dan koreksi yang diizinkan.
- Penggajian dan komponen gaji.
- Kasbon dan transaksi penyesuaian.
- Penutupan dan pembukaan kembali periode.
- Catatan karyawan.
- Laporan, riwayat perubahan, dan audit.
- Otorisasi tindakan khusus.

### 2.2 Operator Input

Memiliki akses terbatas untuk mencatat absensi reguler dan absensi lembur melalui antarmuka internal sesuai izin yang diberikan.

Operator tidak boleh mengubah tarif gaji, mengelola kasbon, mengakses pengaturan, menutup periode, mengubah hak akses, atau membuka periode tertutup.

### 2.3 Pengguna Mode Publik

Mode publik digunakan pada perangkat bersama untuk melakukan absensi. Mode ini tidak memberikan akses ke dashboard, data gaji, alamat karyawan, nomor KTP, saldo kasbon, catatan karyawan, atau laporan.

Mode publik hanya boleh menjalankan tindakan absensi yang telah diizinkan oleh server.

## 3. Ruang Lingkup dan Prioritas

### P0 — Wajib untuk operasional inti

1. Autentikasi dan otorisasi.
2. Manajemen karyawan dan departemen.
3. Pengaturan jam kerja dan aturan keterlambatan.
4. Absensi reguler.
5. Mode absensi publik.
6. Pengaturan dan input tarif karyawan.
7. Penggajian mode per jam dan manual.
8. Buku kasbon.
9. Pratinjau dan penutupan periode penggajian.
10. Audit tindakan penting.

### P1 — Fitur penting untuk rilis awal

1. Absensi lembur.
2. Catatan karyawan.
3. Slip gaji PDF.
4. Rekap absensi dan analisis jam kerja.
5. Laporan daftar karyawan.
6. Ringkasan penggajian dan buku kasbon.
7. Riwayat penutupan dan penyesuaian.

### P2 — Pengembangan berikutnya

1. Analisis keterlambatan dan tren kehadiran.
2. Filter dan ekspor laporan lanjutan.
3. Analisis biaya tenaga kerja.
4. Peningkatan dashboard berdasarkan kebutuhan operasional.

### P3 — Opsional

1. Integrasi akuntansi.
2. Notifikasi otomatis.
3. Integrasi sistem eksternal lainnya.

Fitur P2 dan P3 tidak boleh menunda pembangunan fitur P0.

## 4. Modul dan Persyaratan Fungsional

### 4.1 Manajemen Karyawan

Setiap karyawan mempunyai:

- ID internal.
- Kode karyawan unik.
- Nama lengkap.
- Alamat.
- Jenis kelamin.
- Tanggal lahir.
- Nomor KTP opsional.
- Nomor WhatsApp.
- Departemen.
- Tanggal masuk kerja.
- Mode gaji: `HOURLY` atau `MANUAL`.
- Tarif reguler default.
- Tarif lembur default.
- Daftar komponen gaji manual default.
- Status aktif atau nonaktif.
- Riwayat perubahan data dan tarif.

Perubahan tarif atau nilai default harus menyimpan nilai sebelumnya, nilai baru, waktu perubahan, pengguna yang melakukan perubahan, dan alasan jika diwajibkan oleh kebijakan.

Karyawan nonaktif tidak muncul dalam pilihan absensi baru secara default, tetapi transaksi historisnya tetap tersedia.

### 4.2 Pengaturan Kehadiran

Administrator dapat mengatur:

- Hari kerja.
- Jam mulai dan selesai kerja.
- Batas toleransi keterlambatan.
- Parameter perhitungan keterlambatan.
- Aturan yang berkaitan dengan jadwal kerja.
- Status lembur aktif atau nonaktif.
- Zona waktu operasional, default `Asia/Jakarta`.

Perubahan pengaturan tidak boleh diam-diam mengubah hasil periode yang sudah ditutup.

### 4.3 Absensi Reguler

#### Mode karyawan bergaji manual

1. Tanggal default adalah tanggal hari ini.
2. Pilih karyawan.
3. Pilih status hadir, sakit, izin, atau absen.
4. Jika hadir, catat waktu kehadiran dengan waktu saat ini sebagai default.
5. Simpan catatan.
6. Jika tidak ada input absensi, sistem dapat menghasilkan status absen berdasarkan aturan periode.

Sistem harus membedakan status absen hasil default otomatis dengan status absen yang telah dikonfirmasi operator atau administrator.

#### Mode karyawan bergaji per jam

1. Pilih karyawan.
2. Tekan tombol Masuk untuk memulai sesi.
3. Sistem mencatat waktu masuk dan snapshot tarif reguler.
4. Tekan Keluar untuk menyelesaikan sesi.
5. Sistem menghitung durasi aktual.

Status sakit, izin, dan absen tidak menampilkan kontrol Masuk/Keluar.

Satu karyawan tidak boleh memiliki dua sesi aktif yang tumpang tindih. Keluar tidak boleh dilakukan sebelum Masuk, kecuali ada proses koreksi khusus yang terotorisasi.

### 4.4 Mode Absensi Publik

Tampilan utama menampilkan:

- Hari dan tanggal.
- Jam aktual.
- Pilihan absensi reguler atau lembur.
- Pencarian karyawan.
- Tombol Masuk dan Keluar.
- Konfirmasi sebelum pengiriman.
- Ringkasan hasil setelah absensi berhasil.

Keluar dinonaktifkan apabila tidak terdapat sesi aktif yang sesuai.

Jika Keluar dilakukan sebelum jam selesai yang berlaku, sistem meminta verifikasi password administrator. Password tidak boleh dikirim atau disimpan dalam log biasa, dan percobaan harus dibatasi.

Konfirmasi hasil memuat nama karyawan, jenis absensi, waktu, tanggal, dan durasi jika sesi sudah selesai.

Server wajib memeriksa sesi aktif, status karyawan, jadwal, dan validitas permintaan. Tombol yang dinonaktifkan di UI bukan pengganti validasi server.

### 4.5 Absensi Lembur

Modul lembur mengikuti pola Masuk/Keluar yang serupa dengan absensi reguler, tetapi terpisah secara logis.

- Hanya tersedia ketika lembur diaktifkan.
- Menyimpan waktu mulai dan selesai.
- Mengambil snapshot tarif lembur saat Masuk lembur dicatat.
- Memvalidasi sesi aktif dan urutan waktu.
- Menghitung durasi aktual.
- Menyediakan audit untuk koreksi.

Status lembur yang tidak aktif harus memblokir pembuatan sesi baru melalui UI maupun API.

### 4.6 Penggajian Mode Per Jam

Rumus dasar:

**Gaji kotor = (jam reguler × tarif reguler) + (jam lembur × tarif lembur) + tambahan manual.**

Gaji tersedia untuk potongan kasbon:

**Gaji tersedia = gaji kotor − potongan lain yang sah.**

Gaji bersih:

**Gaji bersih = gaji tersedia − potongan kasbon.**

Rumus akhir dan urutan pengurangan harus diterapkan secara konsisten. Jenis potongan lain yang diperbolehkan perlu ditetapkan melalui kebijakan perusahaan; sistem tidak boleh mengarang potongan.

Perhitungan menggunakan snapshot tarif dan durasi sesi yang sah. Tidak ada pembulatan jam otomatis kecuali aturan pembulatan secara eksplisit ditetapkan di kemudian hari.

### 4.7 Penggajian Mode Manual

Penggajian manual menggunakan item yang dimasukkan untuk periode terkait.

Rumus dasar:

**Subtotal item = nominal satuan × volume.**

**Gaji kotor = jumlah seluruh subtotal item gaji.**

**Gaji bersih = gaji kotor − potongan yang sah − potongan kasbon.**

Data default komponen gaji pada profil karyawan hanya menjadi acuan. Nilai aktual per periode disimpan sebagai item tersendiri dan tidak berubah ketika nilai default diperbarui.

Setiap item mempunyai deskripsi, jumlah, nominal satuan, volume, dan nilai total.

### 4.8 Buku Kasbon

Buku kasbon menggunakan ledger transaksi, bukan hanya satu angka saldo yang ditimpa.

Jenis transaksi yang diperlukan:

- `ISSUED`: kasbon diberikan kepada karyawan.
- `PAYROLL_DEDUCTION`: kasbon dipotong melalui penggajian.
- `REPAYMENT`: pembayaran kembali yang dicatat terpisah bila mekanisme ini digunakan.
- `REVERSAL`: pembalikan transaksi yang keliru melalui transaksi baru.

Nominal transaksi disimpan sebagai nilai positif, sementara jenis transaksi menentukan pengaruhnya terhadap saldo.

Saldo kasbon dihitung dari seluruh transaksi yang valid.

Potongan kasbon disarankan berdasarkan saldo yang masih terutang, lalu dapat disesuaikan sebelum penutupan. Potongan final tidak boleh melebihi gaji yang tersedia untuk dipotong.

Jika nilai potongan melebihi batas, sistem harus menolak konfirmasi dan menjelaskan batas yang berlaku. Sisa kasbon tetap terbawa ke periode selanjutnya.

Setiap potongan payroll harus memiliki referensi unik sehingga pengulangan permintaan tidak memotong saldo dua kali.

### 4.9 Penutupan Periode

Administrator menentukan tanggal akhir periode. Periode dimulai sehari setelah periode terakhir yang telah ditutup. Untuk periode pertama, tanggal awal harus ditetapkan administrator.

Alur:

1. Pilih tanggal akhir.
2. Isi catatan opsional.
3. Sistem memvalidasi rentang periode.
4. Sistem mendeteksi sesi absensi yang belum selesai, data yang tidak valid, dan pengecualian lain.
5. Administrator menyelesaikan masalah atau memberikan keputusan eksplisit yang diizinkan.
6. Sistem menghitung ulang gaji dan saldo kasbon.
7. Sistem menampilkan pratinjau per karyawan.
8. Administrator memeriksa dan menyesuaikan potongan kasbon dalam batas yang diizinkan.
9. Sistem memvalidasi seluruh data sekali lagi.
10. Administrator mengonfirmasi penutupan.
11. Sistem menyimpan snapshot payroll, ledger potongan, catatan penutupan, dan audit dalam transaksi database yang atomik.
12. Periode menjadi terkunci.

Konfirmasi ganda atau permintaan yang dikirim ulang tidak boleh membuat penggajian atau potongan kasbon ganda.

Status perhitungan, persetujuan, dan pembayaran harus dipisahkan. Status penutupan periode tidak dengan sendirinya berarti gaji sudah dibayar.

### 4.10 Koreksi dan Pembukaan Kembali

Koreksi normal menggunakan transaksi penyesuaian yang menyimpan:

- Data atau nilai sebelumnya.
- Nilai koreksi.
- Alasan.
- Waktu.
- Pelaku.
- Referensi transaksi atau periode terkait.

Periode tertutup tetap terkunci untuk input normal. Pembukaan kembali membutuhkan autentikasi administrator melalui password, pemeriksaan otorisasi, dan alasan wajib.

Pembukaan kembali harus dicatat dalam audit. Snapshot atau riwayat penutupan sebelumnya tidak boleh dihapus. Pemrosesan ulang gaji dan kasbon harus dikendalikan agar tidak menciptakan transaksi duplikat.

Kebijakan pembukaan kembali tidak boleh mengandalkan password yang disimpan sebagai teks biasa atau sekadar flag pada UI.

### 4.11 Catatan Karyawan

Administrator dapat menambahkan dan melihat catatan per karyawan. Catatan memuat isi, pembuat, waktu, dan metadata perubahan yang diperlukan.

Akses dibatasi berdasarkan peran. Catatan tidak ditampilkan dalam mode publik.

### 4.12 Laporan dan PDF

Laporan yang dibutuhkan:

1. Daftar karyawan.
2. Ringkasan penggajian per periode.
3. Slip gaji individual.
4. Rekap absensi.
5. Analisis jam kerja dan keterlambatan.
6. Buku transaksi dan saldo kasbon.
7. Riwayat penutupan dan penyesuaian.

PDF harus menggunakan sumber data resmi yang sama dengan aplikasi, bukan rumus alternatif yang ditulis ulang secara terpisah.

Setiap laporan periode menampilkan rentang tanggal, waktu pembuatan, dan identitas periode yang relevan. Akses unduh harus melalui otorisasi server.

## 5. Aturan Bisnis Kanonis

### 5.1 Tarif dan snapshot

- Tarif reguler yang digunakan adalah tarif pada saat absensi Masuk dicatat.
- Tarif lembur yang digunakan adalah tarif pada saat Masuk lembur dicatat.
- Snapshot disimpan sebagai bagian dari transaksi terkait.
- Perubahan tarif default tidak mengubah snapshot transaksi lama.
- Nilai uang menggunakan `NUMERIC(14,2)` atau presisi setara, bukan floating point biner.

### 5.2 Tanggal kerja dan waktu input

- Timestamp disimpan lengkap, dengan zona waktu yang jelas.
- Tanggal kerja sesi yang melewati tengah malam mengikuti tanggal Masuk.
- Tanggal/waktu pencatatan disimpan secara terpisah dari tanggal kerja.
- Durasi sesi dihitung dari timestamp Masuk dan Keluar aktual.
- Input yang ditujukan ke periode yang sudah ditutup harus ditolak melalui seluruh jalur input normal.
- Jika sesi melintasi batas periode, sistem harus mendeteksi kondisi tersebut dan meminta keputusan administrator sesuai kebijakan sebelum penutupan.
- Sistem tidak boleh membagi durasi lintas tanggal atau periode secara diam-diam.

### 5.3 Ketepatan periode

- Periode pertama memerlukan tanggal awal eksplisit.
- Periode berikutnya dimulai sehari setelah tanggal akhir periode terakhir yang ditutup.
- Periode tidak boleh tumpang tindih.
- Data periode tertutup tidak boleh berubah akibat perhitungan ulang biasa.

### 5.4 Batas potongan kasbon

- Potongan kasbon final tidak boleh melebihi gaji tersedia untuk potongan.
- Jika melebihi batas, sistem menolak konfirmasi.
- Saldo kasbon yang tersisa dibawa ke periode berikutnya.
- Potongan harus idempoten dan terikat pada payroll record yang tepat.

### 5.5 Audit

Tindakan sensitif mencakup perubahan tarif, koreksi absensi, perubahan item gaji, pencatatan kasbon, penutupan periode, penyesuaian, pembayaran, perubahan hak akses, dan pembukaan kembali periode.

Audit menyimpan pelaku, waktu, tindakan, objek terkait, dan metadata perubahan yang aman. Audit tidak boleh menyimpan password, token sesi, atau rahasia autentikasi.

## 6. Rancangan Data dan ERD Konseptual

Skema berikut adalah usulan desain, bukan database yang sudah dibuat.

### 6.1 Tabel utama

| Tabel | Tujuan |
|---|---|
| `departments` | Master departemen |
| `employees` | Profil dan status karyawan |
| `employee_rate_history` | Riwayat perubahan tarif reguler dan lembur |
| `employee_default_pay_items` | Komponen gaji manual default per karyawan |
| `employee_default_pay_item_history` | Riwayat perubahan komponen default |
| `attendance_sessions` | Sesi absensi reguler |
| `attendance_status_records` | Status hadir, sakit, izin, absen dan sumber konfirmasinya |
| `overtime_sessions` | Sesi absensi lembur |
| `work_schedules` | Jadwal dan aturan kerja |
| `company_settings` | Pengaturan perusahaan dan absensi |
| `overtime_settings` | Status dan aturan lembur |
| `users` | Identitas akun internal |
| `roles` / `user_roles` | Hak akses akun |
| `public_attendance_devices` | Konfigurasi perangkat publik bila diperlukan |
| `employee_notes` | Catatan per karyawan |
| `payroll_periods` | Rentang periode dan status penutupan |
| `payroll_records` | Ringkasan payroll per karyawan per periode |
| `payroll_items` | Komponen pendapatan dan potongan |
| `cash_advance_transactions` | Ledger kasbon |
| `payroll_adjustments` | Penyesuaian payroll |
| `period_reopen_requests` | Permintaan dan keputusan pembukaan kembali |
| `payroll_payments` | Catatan status pembayaran |
| `audit_logs` | Riwayat tindakan penting |

### 6.2 Relasi utama

- Satu departemen memiliki banyak karyawan.
- Satu karyawan memiliki banyak sesi absensi dan sesi lembur.
- Satu karyawan memiliki banyak riwayat tarif dan komponen default.
- Satu periode penggajian memiliki banyak payroll record.
- Satu karyawan memiliki paling banyak satu payroll record per periode.
- Satu payroll record memiliki banyak payroll item.
- Satu karyawan memiliki banyak transaksi kasbon.
- Potongan kasbon terhubung ke payroll record yang menjadi sumbernya.
- Penyesuaian dan pembukaan kembali terhubung ke periode dan aktor yang melakukan tindakan.
- Tindakan sensitif direkam pada audit log.

### 6.3 Field dan constraint penting

**employees**
- `id`: UUID, primary key.
- `employee_code`: unik.
- `name`: wajib.
- `address`: sesuai kebutuhan.
- `gender`: enum atau nilai terkontrol.
- `birth_date`: date, opsional jika tidak diperlukan.
- `national_id_encrypted`: opsional dan dienkripsi bila disimpan.
- `phone`: nomor WhatsApp.
- `department_id`: foreign key.
- `join_date`: date.
- `salary_mode`: `HOURLY` atau `MANUAL`.
- `default_hourly_rate`: tarif reguler default.
- `default_overtime_rate`: tarif lembur default.
- `is_active`: boolean.
- Timestamp pembuatan dan perubahan.

Komponen default gaji manual disimpan di tabel anak agar jumlah komponen tidak dibatasi kolom tetap.

**attendance_sessions**
- `id`: UUID.
- `employee_id`: foreign key.
- `work_date`: tanggal kerja berdasarkan tanggal Masuk.
- `check_in_at`: timestamp with time zone.
- `check_out_at`: timestamp with time zone, nullable selama sesi aktif.
- `hourly_rate_snapshot`: snapshot tarif reguler.
- `source`: internal, publik, atau sumber lain yang diizinkan.
- `created_by` dan metadata audit.

**overtime_sessions**
- Struktur serupa dengan absensi reguler, dengan `overtime_rate_snapshot`.

**payroll_periods**
- `id`, `period_start`, `period_end`.
- `status`: `DRAFT`, `REVIEW`, `CLOSED`, dan status tambahan yang diperlukan untuk alur pembukaan kembali.
- `closed_at`, `closed_by`, catatan.
- Constraint yang mencegah rentang periode bertumpang tindih.

**payroll_records**
- `payroll_period_id`, `employee_id`.
- Snapshot mode gaji.
- Total jam reguler dan lembur.
- Gaji kotor, potongan kasbon, potongan lain yang sah, gaji bersih.
- Status perhitungan, persetujuan, dan pembayaran yang terpisah.
- Unique constraint pada `(payroll_period_id, employee_id)`.

**cash_advance_transactions**
- `employee_id`, tanggal transaksi, jenis transaksi, nominal.
- Referensi payroll jika terkait penggajian.
- Referensi reversal bila diperlukan.
- Deskripsi, pembuat, timestamp.
- Constraint idempotensi untuk mencegah potongan yang sama diterapkan dua kali.

### 6.4 Integritas database

- Gunakan foreign key untuk relasi utama.
- Gunakan unique constraint untuk kode karyawan dan payroll per karyawan per periode.
- Gunakan transaksi database untuk penutupan periode.
- Gunakan row locking atau mekanisme konkurensi yang sesuai saat memproses saldo dan penutupan.
- Gunakan idempotency key atau constraint unik untuk tindakan yang dapat dikirim ulang.
- Perubahan skema dilakukan melalui migration yang dapat ditinjau.
- Jangan menghapus data historis secara otomatis ketika karyawan dinonaktifkan.

## 7. Arsitektur dan Stack yang Direkomendasikan

### 7.1 Teknologi

| Area | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js + React + TypeScript | Satu aplikasi untuk UI dan endpoint server |
| UI | Tailwind CSS + shadcn/ui | Komponen konsisten dan dapat diakses |
| Database | Neon PostgreSQL | Relasional, constraint kuat, transaksi |
| ORM | Drizzle ORM | Skema dan akses data bertipe |
| Validasi | Zod | Validasi konsisten di batas input |
| Autentikasi | Library terpelihara dengan sesi aman; Better Auth dapat dievaluasi | Hak akses server-side dan sesi terkelola |
| PWA | Web app manifest dan service worker | Instalasi di perangkat dan pengalaman seperti aplikasi |
| PDF | Pustaka PDF server-side yang sesuai kebutuhan | Dokumen berasal dari data resmi |
| Pengujian | Vitest, pengujian integrasi, dan Playwright | Uji logika, database, dan alur pengguna |
| Hosting | Penyedia yang kompatibel dengan Next.js dan Neon | Pilihan final masih terbuka |

Pilihan autentikasi, hosting, dan pustaka PDF belum dikonfirmasi sebagai keputusan final. Evaluasi kompatibilitas dan dokumentasi resmi diperlukan sebelum implementasi.

### 7.2 Batas arsitektur

- UI bertanggung jawab atas presentasi dan interaksi.
- Validasi server bertanggung jawab atas input dan otorisasi.
- Modul domain menghitung payroll, durasi, saldo, dan validasi periode.
- Lapisan data menangani query, transaksi, constraint, dan migration.
- Modul laporan menggunakan hasil resmi dari modul domain/data.
- Komponen UI tidak boleh menjadi sumber perhitungan gaji.
- Endpoint publik tidak boleh membuka fungsi administratif.
- Secret dan credential hanya tersedia di sisi server.

### 7.3 Struktur proyek yang disarankan

```text
makare/
├── AGENTS.md
├── docs/
│   ├── product-requirements.md
│   ├── business-rules.md
│   ├── database-erd.md
│   ├── roles-permissions.md
│   ├── ui-design-system.md
│   └── testing-acceptance.md
├── public/
│   ├── manifest.json
│   └── icons/
├── drizzle/
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (admin)/
│   │   ├── public-attendance/
│   │   └── api/
│   ├── components/
│   │   ├── ui/
│   │   └── shared/
│   ├── features/
│   │   ├── employees/
│   │   ├── attendance/
│   │   ├── overtime/
│   │   ├── payroll/
│   │   ├── cash-advances/
│   │   ├── closing/
│   │   ├── employee-notes/
│   │   ├── reports/
│   │   ├── settings/
│   │   └── users/
│   ├── lib/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── validation/
│   │   └── audit/
│   └── tests/
└── package.json
```

Struktur dapat disesuaikan setelah builder memeriksa proyek aktual. Jangan membuat lapisan kosong atau mengganti struktur yang sudah baik tanpa alasan.

## 8. Spesifikasi UI/UX

### 8.1 Konsep visual: Operational Clarity

MAKARE adalah aplikasi operasional. Tampilan harus mengutamakan kejelasan, kecepatan, keterbacaan angka, dan keamanan tindakan, bukan dekorasi yang berlebihan.

Arah visual:
- Latar abu-abu terang.
- Permukaan putih.
- Teks utama gelap.
- Biru tua sebagai warna primer.
- Hijau untuk sukses, kuning untuk peringatan, merah untuk kesalahan.
- Font sans-serif seperti Inter.
- Ruang putih terukur dan tipografi yang konsisten.
- Ikon dari satu keluarga ikon.
- Tanpa animasi yang tidak diperlukan.

### 8.2 Token desain awal

| Token | Nilai awal |
|---|---|
| Background | `#F4F6F9` |
| Surface | `#FFFFFF` |
| Primary | `#173B67` |
| Text | `#172033` |
| Muted text | `#667085` |
| Border | `#D9E0E8` |
| Success | `#217A4B` |
| Warning | `#9A6700` |
| Error | `#B42318` |
| Radius | 8–12 px |
| Target sentuh | 44–48 px minimum |

Nilai ini merupakan rekomendasi awal, bukan identitas merek final. Kontras harus diuji dan status tidak boleh dibedakan hanya melalui warna.

### 8.3 Navigasi

**Desktop:** sidebar dengan navigasi utama, header untuk periode aktif, identitas akun, dan area konten.

**Mobile:** navigasi ringkas dan mudah dijangkau; gunakan bottom navigation untuk tujuan utama bila sesuai, dan menu tambahan untuk modul administratif.

Menu disesuaikan dengan hak akses. Operator hanya melihat fitur absensi yang diizinkan.

### 8.4 Layar utama

1. **Login** — autentikasi internal dan pesan kesalahan yang aman.
2. **Dashboard** — ringkasan operasional, absensi hari ini, peringatan sesi terbuka, dan status periode.
3. **Daftar karyawan** — pencarian, filter departemen/status, detail karyawan, dan aksi tambah/edit.
4. **Detail karyawan** — profil, tarif, komponen default, catatan, riwayat, dan transaksi relevan.
5. **Absensi reguler** — pencarian karyawan, status, Masuk/Keluar, dan sesi aktif.
6. **Absensi lembur** — antarmuka terpisah dengan status aktif/nonaktif.
7. **Mode publik** — jam dan tanggal, pilihan jenis absensi, pencarian, tombol Masuk/Keluar, konfirmasi.
8. **Input gaji manual** — daftar komponen, nominal, volume, subtotal, dan total.
9. **Penggajian** — daftar karyawan, rincian item, kalkulasi, status, dan pratinjau.
10. **Buku kasbon** — saldo per karyawan, transaksi, dan riwayat potongan.
11. **Penutupan periode** — pemilihan rentang, validasi, pratinjau, penyesuaian kasbon, dan konfirmasi.
12. **Laporan** — pemilihan jenis laporan, periode, filter, pratinjau, dan PDF.
13. **Pengaturan** — jam kerja, toleransi keterlambatan, lembur, dan parameter perusahaan.
14. **Akun dan audit** — akun, peran, riwayat tindakan, dan kontrol administratif.

### 8.5 Keadaan antarmuka

Semua alur penting harus menangani:

- Loading.
- Data kosong.
- Validasi gagal.
- Hak akses ditolak.
- Gangguan jaringan.
- Permintaan duplikat.
- Konflik data atau sesi.
- Penyimpanan berhasil.
- Kesalahan server.
- Konfirmasi tindakan berisiko.

Input pengguna harus dipertahankan saat terjadi kesalahan yang dapat diperbaiki. Penutupan periode dan tindakan yang tidak dapat dibatalkan memerlukan konfirmasi eksplisit.

## 9. Keamanan dan Privasi

### Kontrol wajib

- Sesi autentikasi aman.
- Otorisasi berbasis peran di server.
- Validasi input pada semua endpoint.
- Pembatasan percobaan verifikasi password administrator.
- Penyimpanan password menggunakan mekanisme hashing yang sesuai dari library autentikasi.
- Perlindungan terhadap CSRF dan penyalahgunaan endpoint sesuai model autentikasi.
- Rate limiting untuk endpoint publik dan tindakan sensitif.
- HTTPS pada lingkungan produksi.
- Secret tidak disimpan dalam repository atau dikirim ke browser.
- Nomor KTP bersifat opsional; bila disimpan, akses dibatasi dan enkripsi diterapkan sesuai rancangan.
- Audit untuk perubahan sensitif.
- Backup database dan prosedur pemulihan.
- Pengelolaan migration yang aman.
- Mode publik tidak memberikan akses ke data administratif.
- Error kepada pengguna tidak membocorkan detail internal.

### Risiko dan mitigasi

| Risiko | Tingkat | Mitigasi |
|---|---|---|
| Potongan kasbon ganda | Tinggi | Transaksi atomik, constraint unik, idempotensi |
| Perubahan payroll tertutup | Tinggi | Snapshot, penguncian periode, audit |
| Pemalsuan absensi publik | Tinggi | Validasi server, rate limit, kontrol perangkat sesuai kebutuhan |
| Penyalahgunaan password admin | Tinggi | Pembatasan percobaan, audit, verifikasi server |
| Salah hitung lintas tengah malam | Tinggi | Timestamp lengkap, tanggal kerja terpisah, uji batas periode |
| Data KTP bocor | Tinggi | Minimasi data, enkripsi, akses terbatas |
| Karyawan memiliki sesi ganda | Tinggi | Validasi sesi aktif dan constraint yang sesuai |
| Perhitungan berbeda antara PDF dan UI | Tinggi | Satu sumber logika dan sumber data resmi |
| Kehilangan data | Tinggi | Backup, pemulihan, pengujian restore |

## 10. Rencana Pengujian dan Kriteria Penerimaan

### 10.1 Unit test

- Perhitungan gaji per jam.
- Perhitungan gaji manual.
- Pengurangan potongan lain yang diizinkan.
- Perhitungan saldo kasbon.
- Batas potongan kasbon.
- Perhitungan durasi sesi.
- Penghitungan keterlambatan.
- Validasi rentang periode.
- Penentuan tanggal kerja lintas tengah malam.

### 10.2 Integration test

- Penyimpanan absensi dan snapshot tarif.
- Pencatatan transaksi kasbon.
- Penutupan periode dalam transaksi atomik.
- Penolakan input untuk periode tertutup.
- Pencegahan potongan ganda.
- Verifikasi otorisasi endpoint.
- Pembuatan PDF dari data resmi.
- Audit perubahan dan pembukaan kembali.

### 10.3 End-to-end test

- Administrator membuat karyawan dan menetapkan tarif.
- Operator mencatat Masuk dan Keluar.
- Pengguna publik melakukan absensi.
- Tarif diubah setelah Masuk dan snapshot lama tetap sama.
- Administrator memasukkan komponen gaji manual.
- Administrator memberikan kasbon.
- Administrator menutup periode dan menyesuaikan potongan.
- Sistem menolak potongan yang melebihi gaji tersedia.
- Sistem menolak input biasa ke periode tertutup.
- Administrator membuka kembali periode menggunakan password dan alasan.
- Pengguna tanpa izin tidak dapat mengakses modul terlarang.
- Laporan PDF konsisten dengan data yang tampil di aplikasi.

### 10.4 Kriteria penerimaan

Rilis inti belum dapat dianggap siap sebelum:

1. Seluruh perhitungan kritis memiliki unit test.
2. Penutupan periode aman terhadap permintaan ganda.
3. Input periode tertutup benar-benar ditolak oleh server.
4. Tidak ada akses administratif melalui mode publik.
5. Perubahan tarif tidak mengubah snapshot historis.
6. PDF konsisten dengan sumber data resmi.
7. Pengujian backup dan pemulihan berhasil dilakukan.
8. Alur utama berfungsi pada ukuran layar mobile dan desktop.
9. Tidak ada kontrol penting yang hanya bersifat dekoratif.
10. Hasil pengujian dan keterbatasan didokumentasikan.

Kriteria ini adalah target pengujian, bukan hasil pengujian yang telah dicapai.

## 11. Operasional dan Deployment

- Pisahkan lingkungan development, staging, dan production.
- Gunakan konfigurasi environment untuk credential.
- Gunakan migration database yang dapat ditinjau dan dilacak.
- Jangan menjalankan perubahan destruktif pada data produksi tanpa persetujuan eksplisit dan rencana pemulihan.
- Lakukan backup terjadwal dan verifikasi pemulihan.
- Catat error server dan kejadian keamanan tanpa mencatat rahasia.
- Pantau kegagalan penutupan periode, error absensi, dan kegagalan pembuatan PDF.
- Pastikan deployment hanya menerima konfigurasi produksi yang valid.
- PWA harus memerlukan koneksi untuk mengonfirmasi absensi. Jangan menyatakan absensi berhasil ketika server belum mengonfirmasi transaksi.
- Hosting, kebijakan retensi, dan jadwal backup final perlu ditentukan sebelum produksi.

## 12. Roadmap Implementasi

### Tahap 1 — Fondasi

- Setup Next.js, TypeScript, UI, dan Neon.
- Setup autentikasi dan otorisasi.
- Migration database awal.
- Design system dan layout responsif.
- Dokumentasi `AGENTS.md`.

### Tahap 2 — Data dan absensi

- Departemen dan karyawan.
- Riwayat tarif dan komponen default.
- Pengaturan jadwal.
- Absensi reguler.
- Mode publik.
- Absensi lembur.

### Tahap 3 — Penggajian dan kasbon

- Input gaji manual.
- Kalkulasi gaji per jam.
- Buku kasbon.
- Payroll record dan item.
- Unit dan integration test untuk aturan finansial.

### Tahap 4 — Penutupan dan audit

- Pratinjau penutupan.
- Validasi data.
- Penyesuaian kasbon.
- Transaksi atomik.
- Penguncian periode.
- Koreksi dan pembukaan kembali terotorisasi.
- Audit lengkap.

### Tahap 5 — Laporan dan penyempurnaan

- Daftar karyawan PDF.
- Ringkasan payroll.
- Slip gaji.
- Rekap absensi dan keterlambatan.
- Buku kasbon.
- Pengujian end-to-end.
- Uji responsif dan aksesibilitas.
- Uji backup dan pemulihan.

Urutan dapat disesuaikan berdasarkan dependensi nyata yang ditemukan selama implementasi. Fitur finansial tidak boleh dirilis sebelum integritas data dan pengujian kritis terpenuhi.

## 13. Asumsi dan Keputusan yang Masih Terbuka

### Sudah dikonfirmasi

- Satu perusahaan.
- PWA mobile-first.
- Database Neon PostgreSQL.
- Administrator memiliki akses penuh.
- Operator terbatas pada input absensi.
- Mode publik pada perangkat bersama.
- Periode penggajian fleksibel dengan penutupan manual.
- Tarif reguler mengikuti waktu absensi Masuk.
- Tarif lembur direkomendasikan mengikuti waktu Masuk lembur.
- Komponen gaji manual memiliki nilai default dan nilai aktual per periode.
- Tanggal kerja sesi lintas tengah malam mengikuti tanggal Masuk.
- Tanggal/waktu pencatatan disimpan terpisah.
- Input biasa ke periode tertutup ditolak.
- Potongan kasbon tidak boleh melebihi gaji tersedia.
- Pembukaan kembali periode memerlukan password administrator.
- Periode tertutup mempertahankan jejak audit dan riwayatnya.

### Asumsi yang perlu dikonfirmasi sebelum implementasi terkait

1. Apakah snapshot tarif lembur saat Masuk lembur disetujui sebagai aturan final.
2. Definisi persis “gaji tersedia untuk dipotong” ketika terdapat potongan lain.
3. Apakah semua koreksi periode tertutup harus melalui penyesuaian, atau sebagian membutuhkan pembukaan kembali.
4. Apakah perangkat publik akan menggunakan kode/perangkat terdaftar atau hanya halaman publik yang dibatasi.
5. Penyedia autentikasi, hosting, dan pustaka PDF.
6. Kebijakan jam malam, pembagian durasi saat melintasi batas periode, dan penanganan sesi yang belum selesai.
7. Kebijakan penyimpanan dan penghapusan data personal.

Asumsi tersebut tidak boleh diisi dengan keputusan bisnis yang dikarang oleh AI builder.

## 14. Kesimpulan

MAKARE direncanakan sebagai aplikasi operasional terintegrasi dengan penekanan pada akurasi absensi, perhitungan payroll, kontrol kasbon, dan keamanan penutupan periode.

Dokumen ini menjadi sumber acuan tunggal bagi spesifikasi produk, desain data, implementasi, dan pengujian. Perubahan kebutuhan harus diperbarui pada dokumen kanonis sebelum diterapkan ke kode.

**Status akhir perencanaan: Ready with conditions.** Tidak ada klaim bahwa aplikasi sudah dibangun, diuji, atau diterapkan.
