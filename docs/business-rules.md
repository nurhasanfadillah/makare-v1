# Aturan Bisnis Kanonis MAKARE

## 1. Perhitungan Penggajian (Payroll Engine)

### Mode Karyawan Per Jam (Hourly)
```
Gaji Reguler = Total Jam Reguler × Tarif Reguler Snapshot
Upah Lembur  = Total Jam Lembur × Tarif Lembur Snapshot
Gaji Kotor   = Gaji Reguler + Upah Lembur + Tambahan Manual
```

### Mode Karyawan Manual / Bulanan
```
Subtotal Item = Nominal Satuan × Volume
Gaji Kotor    = Jumlah Seluruh Komponen Pendapatan
```

### Rumus Gaji Bersih & Batas Potongan Kasbon
```
Gaji Tersedia = Gaji Kotor - Potongan Lain yang Sah
Maksimal Potongan Kasbon = Min(Saldo Kasbon Terutang, Gaji Tersedia)
Gaji Bersih = Gaji Tersedia - Potongan Kasbon
```

*Aturan*: Gaji bersih tidak boleh bernilai negatif akibat pemotongan kasbon.

## 2. Integritas Sesi & Tarif
- Snapshot tarif reguler diambil saat Masuk.
- Snapshot tarif lembur diambil saat Masuk Lembur.
- Perubahan default tarif di profil karyawan hanya berlaku untuk sesi baru ke depan.
- Sesi tidak boleh memiliki waktu Keluar sebelum waktu Masuk.
- Karyawan tidak boleh memiliki 2 sesi aktif bersamaan.

## 3. Penutupan & Pembukaan Periode
- Periode baru dimulai sehari setelah periode sebelumnya yang berstatus CLOSED.
- Sesi absensi yang belum ditutup (open session) harus diselesaikan sebelum penutupan.
- Penutupan mencatat `PAYROLL_DEDUCTION` ke buku kasbon secara atomik.
- Pembukaan kembali memerlukan PIN Administrator & alasan wajib.
