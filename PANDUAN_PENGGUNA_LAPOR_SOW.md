# PANDUAN PENGGUNA LAPOR SOW

## 1. Tentang Sistem

LAPOR SOW adalah sistem berbasis web untuk melakukan:

- Pelaporan kendala IT
- Permintaan teknisi/SOW
- Monitoring status pekerjaan
- Penugasan teknisi
- Pencatatan catatan pekerjaan
- Rekap laporan
- Notifikasi WhatsApp
- Monitoring order melalui Admin Dashboard

---

# 2. HALAMAN PELAPOR

## Membuat Laporan

1. Buka halaman LAPOR SOW.
2. Isi:
   - Nama
   - NIP
   - Kode Cabang
   - Jenis Kendala
   - Deskripsi
   - Nomor WhatsApp
3. Pastikan data sudah benar.
4. Kirim laporan.
5. Sistem akan membuat Kode Order.
6. Simpan Kode Order untuk melakukan pengecekan.

---

# 3. NOTIFIKASI

Setelah laporan dibuat, sistem akan memproses notifikasi kepada pihak terkait.

Notifikasi dapat digunakan untuk memberikan informasi mengenai:

- Laporan baru
- Perubahan status
- Penugasan teknisi
- Catatan pekerjaan

Pelapor juga mendapatkan informasi melalui WhatsApp sesuai konfigurasi sistem.

---

# 4. ADMIN LOGIN

Admin membuka:

/admin/login.html

Masukkan:

- Username Admin
- Password Admin

Setelah berhasil login, Admin akan masuk ke Dashboard.

---

# 5. ADMIN DASHBOARD

Dashboard digunakan untuk melihat order yang masuk.

Informasi utama:

- Total Order
- OPEN
- PROSES
- SELESAI

Dashboard secara default menampilkan laporan pada periode bulan berjalan.

---

# 6. PENCARIAN ORDER

Admin dapat mencari berdasarkan:

## Kode Order

Contoh:

SOW-157683

Masukkan kode order kemudian tekan:

Cari

## Tanggal

Admin dapat menggunakan:

- Tanggal mulai
- Tanggal akhir

Pencarian tanggal menggunakan rentang tanggal.

## Cabang

Admin dapat memilih cabang tertentu untuk melihat laporan dari cabang tersebut.

## Reset Filter

Tekan:

Reset Filter

untuk mengembalikan tampilan Dashboard ke kondisi awal.

---

# 7. DETAIL ORDER

Pada kolom AKSI terdapat tombol:

Detail

Gunakan tombol tersebut untuk melihat informasi lengkap order.

Informasi dapat meliputi:

- Kode Order
- Nama
- NIP
- Cabang
- Jenis Kendala
- Deskripsi
- Tanggal
- Jam
- Nomor WhatsApp
- Status
- Teknisi/SOW
- Catatan
- Riwayat perubahan

---

# 8. UPDATE ORDER

Admin dapat melakukan perubahan pada order.

Status pekerjaan:

OPEN

PROSES

SELESAI

Admin juga dapat menentukan:

- Teknisi/SOW
- Catatan pekerjaan

Setelah disimpan, sistem akan memperbarui data order.

---

# 9. TEKNISI / SOW

Menu:

Manajemen Teknisi/SOW

digunakan untuk mengelola daftar teknisi.

Admin dapat:

- Menambah teknisi
- Mengubah nama teknisi
- Mengaktifkan teknisi
- Menonaktifkan teknisi

Teknisi yang aktif akan tersedia pada pilihan Teknisi/SOW ketika melakukan update order.

---

# 10. REKAP LAPORAN

Menu:

Rekap

digunakan untuk melihat ringkasan laporan.

Jenis rekap:

- Harian
- Mingguan
- Bulanan
- Tahunan

Rekap dapat menampilkan:

- Total laporan
- OPEN
- PROSES
- SELESAI
- Rekap berdasarkan cabang
- Rekap berdasarkan teknisi
- Detail laporan

---

# 11. ALUR STATUS PEKERJAAN

Alur umum pekerjaan:

OPEN
↓
PROSES
↓
SELESAI

## OPEN

Laporan baru masuk dan belum dikerjakan.

## PROSES

Laporan sedang ditangani oleh teknisi.

## SELESAI

Pekerjaan sudah selesai.

---

# 12. LOGOUT

Setelah selesai menggunakan Admin Dashboard:

1. Tekan tombol Logout.
2. Sistem akan mengakhiri sesi Admin.
3. Untuk menggunakan Dashboard kembali, Admin harus login kembali.

---

# 13. KEAMANAN

Akses Admin menggunakan sistem login.

Token sesi digunakan untuk mengamankan akses Dashboard dan fungsi administrasi.

Jangan membagikan:

- Username Admin
- Password Admin
- Token
- Konfigurasi backend
- Credential sistem

kepada pihak yang tidak berwenang.

---

# 14. BACKUP

Data utama laporan tersimpan pada sistem spreadsheet/backend.

Lakukan backup data secara berkala sesuai kebutuhan operasional.

Dokumentasi dan source code juga tersimpan pada repository GitHub.

---

# 15. PEMELIHARAAN

Sebelum melakukan perubahan sistem:

1. Pastikan sistem yang sedang berjalan sudah berfungsi.
2. Simpan backup.
3. Lakukan perubahan secara bertahap.
4. Uji kembali:
   - Form laporan
   - WhatsApp
   - Dashboard
   - Update status
   - Teknisi
   - Rekap
   - Login
5. Pastikan GitHub Pages kembali normal setelah deployment.

---

# 16. CHECKLIST OPERASIONAL

| No | Pemeriksaan | Status |
|---|---|---|
| 1 | Form laporan dapat dibuka | ✅ |
| 2 | Order dapat dibuat | ✅ |
| 3 | Kode Order terbentuk | ✅ |
| 4 | Data masuk ke spreadsheet | ✅ |
| 5 | Notifikasi WhatsApp berjalan | ✅ |
| 6 | Admin dapat login | ✅ |
| 7 | Dashboard dapat dibuka | ✅ |
| 8 | Pencarian order berjalan | ✅ |
| 9 | Filter tanggal berjalan | ✅ |
| 10 | Filter cabang berjalan | ✅ |
| 11 | Detail order berjalan | ✅ |
| 12 | Update status berjalan | ✅ |
| 13 | Penugasan teknisi berjalan | ✅ |
| 14 | Notifikasi pelapor berjalan | ✅ |
| 15 | Rekap berjalan | ✅ |
| 16 | Manajemen teknisi berjalan | ✅ |
| 17 | Logout berjalan | ✅ |
| 18 | GitHub Pages aktif | ✅ |

---

# 17. STATUS SISTEM

Nama Sistem:

LAPOR SOW

Deskripsi:

Sistem Laporan dan Permintaan Teknisi IT

Status:

PRODUCTION / SIAP DIGUNAKAN

Repository:

https://github.com/sowdps/LaporSOW

Website:

https://sowdps.github.io/LaporSOW/

Admin:

https://sowdps.github.io/LaporSOW/admin/login.html

---

# 18. CATATAN

Dokumen ini dibuat sebagai panduan penggunaan sistem LAPOR SOW.

Setiap perubahan besar pada sistem sebaiknya didokumentasikan dan diuji sebelum digunakan dalam operasional.