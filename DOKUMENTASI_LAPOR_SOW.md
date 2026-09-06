# DOKUMENTASI SISTEM LAPOR SOW

## 1. IDENTITAS SISTEM

Nama Sistem:
LAPOR SOW

Nama:
Sistem Laporan dan Permintaan Teknisi IT

Wilayah:
SOW IV Denpasar

Platform:
Web Application

Teknologi:
- HTML
- CSS
- JavaScript
- Google Apps Script
- Google Spreadsheet
- GitHub Pages
- WhatsApp Notification

Repository:
LaporSOW

---

# 2. TUJUAN SISTEM

Sistem LAPOR SOW dibuat untuk mempermudah proses pelaporan kendala IT dan permintaan teknisi.

Sistem menggantikan proses pelaporan manual dengan sistem terpusat sehingga:

- Pelapor dapat membuat laporan secara online.
- Setiap laporan mendapatkan Kode Order.
- Admin dapat memonitor seluruh laporan.
- Admin dapat menentukan teknisi/SOW.
- Status pekerjaan dapat dipantau.
- Riwayat perubahan dapat dicatat.
- Rekap laporan dapat dibuat.
- Notifikasi WhatsApp dapat dikirim secara otomatis.
- Pelapor mendapatkan informasi perkembangan pekerjaan.

---

# 3. ALUR SISTEM

Alur utama sistem:

PELANGGAN / PELAPOR
        ↓
FORM LAPOR SOW
        ↓
INPUT DATA LAPORAN
        ↓
SISTEM MEMBUAT KODE ORDER
        ↓
GOOGLE SPREADSHEET
        ↓
NOTIFIKASI WHATSAPP
        ↓
ADMIN
        ↓
PEMILIHAN TEKNISI / SOW
        ↓
PROSES PENGERJAAN
        ↓
UPDATE STATUS
        ↓
NOTIFIKASI PELAPOR
        ↓
SELESAI
        ↓
REKAP LAPORAN

---

# 4. STATUS ORDER

Sistem menggunakan status:

## OPEN

Laporan baru diterima dan belum mulai dikerjakan.

## PROSES

Laporan sedang dikerjakan oleh teknisi/SOW.

## SELESAI

Pekerjaan sudah selesai.

---

# 5. DATA LAPORAN

Data laporan yang digunakan antara lain:

- Kode Order
- Nama Pelapor
- NIP
- Kode Cabang
- Jenis Kendala
- Deskripsi Kendala
- Tanggal
- Jam
- Nomor WhatsApp
- Teknisi/SOW
- Status
- Catatan Admin
- Riwayat Perubahan

---

# 6. KODE ORDER

Setiap laporan mendapatkan kode order secara otomatis.

Contoh:

SOW-157683

Kode Order digunakan untuk:

- Mencari laporan
- Melihat detail laporan
- Melakukan update
- Melacak pekerjaan
- Membuat rekap

---

# 7. FITUR PELAPOR

Pelapor dapat:

1. Membuka Form LAPOR SOW.
2. Mengisi nama.
3. Mengisi NIP.
4. Memilih kode cabang.
5. Memilih jenis kendala.
6. Menjelaskan kendala.
7. Mengisi nomor WhatsApp.
8. Mengirim laporan.

Setelah laporan dikirim, sistem memproses laporan dan memberikan Kode Order.

---

# 8. FITUR ADMIN

Admin memiliki akses ke Dashboard Admin.

Fitur Admin:

- Login Admin
- Dashboard
- Melihat seluruh order
- Melihat statistik order
- Mencari berdasarkan Kode Order
- Filter berdasarkan cabang
- Filter berdasarkan tanggal
- Melihat detail order
- Mengubah status
- Menentukan teknisi/SOW
- Menambahkan catatan
- Melihat riwayat perubahan
- Rekap laporan
- Manajemen teknisi/SOW
- Logout

---

# 9. DASHBOARD ADMIN

Dashboard menampilkan statistik:

- Total Order
- OPEN
- PROSES
- SELESAI

Dashboard secara default menampilkan data bulan berjalan.

Pencarian dapat digunakan untuk menemukan order dari periode lainnya.

---

# 10. PENCARIAN ORDER

Admin dapat melakukan pencarian berdasarkan:

- Kode Order
- Tanggal
- Rentang tanggal
- Cabang

Contoh:

SOW-157683

Admin dapat membuka tombol:

DETAIL

untuk melihat informasi lengkap laporan.

---

# 11. MANAJEMEN TEKNISI / SOW

Admin dapat mengelola daftar teknisi/SOW.

Fitur:

- Melihat daftar teknisi
- Menambahkan teknisi
- Mengedit teknisi
- Mengaktifkan teknisi
- Menonaktifkan teknisi

Teknisi yang berstatus aktif dapat dipilih pada proses penanganan order.

---

# 12. UPDATE ORDER

Admin dapat memperbarui:

- Status
- Teknisi/SOW
- Catatan

Contoh alur:

OPEN
↓
Pilih Teknisi/SOW
↓
PROSES
↓
Pekerjaan selesai
↓
SELESAI

Setiap perubahan dapat menghasilkan notifikasi kepada pihak terkait.

---

# 13. NOTIFIKASI WHATSAPP

Sistem terintegrasi dengan layanan WhatsApp Gateway.

Notifikasi digunakan untuk:

- Memberitahukan adanya laporan baru.
- Memberitahukan perubahan status.
- Memberitahukan teknisi/SOW.
- Memberikan informasi kepada pelapor.

Nomor WhatsApp pelapor dinormalisasi sebelum digunakan.

Format nomor mendukung nomor Indonesia seperti:

08xxxxxxxxxx

dan

628xxxxxxxxxx

---

# 14. REKAP LAPORAN

Admin dapat membuat rekap berdasarkan periode:

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
- Rekap berdasarkan teknisi/SOW
- Rincian laporan

Rekap dapat digunakan sebagai bahan laporan pekerjaan.

---

# 15. KEAMANAN ADMIN

Sistem menggunakan login Admin.

Akses Admin menggunakan:

- Username
- Password
- Session Token

Session token memiliki masa berlaku.

Akses data dan perubahan order Admin dilindungi dengan autentikasi.

Halaman Admin tidak dapat digunakan tanpa session login yang valid.

---

# 16. KEAMANAN DATA

Data sistem disimpan pada Google Spreadsheet.

Informasi rahasia seperti:

- Password Admin
- Token WhatsApp
- Konfigurasi rahasia
- Kode Google Apps Script

TIDAK BOLEH dimasukkan ke repository GitHub.

File backend Google Apps Script juga tidak boleh dipublikasikan ke repository apabila berisi credential atau token.

---

# 17. STRUKTUR PROJECT

Struktur utama project:

Lapor_SOW/
│
├── admin/
│   ├── admin.css
│   ├── admin.js
│   ├── index.html
│   ├── login.css
│   └── login.html
│
├── css/
│   └── style.css
│
├── images/
│   └── logo-sow-iv-dps-compact.png
│
├── js/
│   └── script.js
│
├── .gitignore
└── index.html

---

# 18. HALAMAN PUBLIC

Halaman utama:

FORM ORDER SOW

Fungsinya sebagai halaman untuk membuat laporan baru.

---

# 19. HALAMAN ADMIN

Halaman Admin:

ADMIN SOW IV DENPASAR

Fungsinya untuk:

- Monitoring
- Pengelolaan order
- Pengelolaan teknisi/SOW
- Rekap
- Update pekerjaan

---

# 20. HASIL PENGUJIAN

Sistem telah diuji pada beberapa fungsi utama.

### Pengujian Order

- Membuat order baru
- Kode Order berhasil dibuat
- Data masuk ke Spreadsheet
- WhatsApp berhasil dikirim

### Pengujian Dashboard

- Total Order
- OPEN
- PROSES
- SELESAI
- Pencarian kode order
- Pencarian tanggal
- Filter cabang
- Reset filter

### Pengujian Update

- OPEN → PROSES
- Penentuan teknisi/SOW
- Penambahan catatan
- Notifikasi WhatsApp

### Pengujian Rekap

- Harian
- Mingguan
- Bulanan
- Tahunan
- Cabang
- Teknisi/SOW
- Detail laporan

### Pengujian Login

- Login berhasil
- Logout berhasil
- Akses Admin tanpa login dibatasi
- Login melalui komputer
- Login melalui HP

---

# 21. URL SISTEM

Website:

https://sowdps.github.io/LaporSOW/

Admin:

https://sowdps.github.io/LaporSOW/admin/index.html

Repository:

https://github.com/sowdps/LaporSOW

---

# 22. OPERASIONAL HARIAN

Admin cukup melakukan:

1. Login Admin.
2. Membuka Dashboard.
3. Memeriksa order baru.
4. Membuka Detail.
5. Menentukan Teknisi/SOW.
6. Mengubah status menjadi PROSES.
7. Mengisi catatan jika diperlukan.
8. Setelah pekerjaan selesai, ubah status menjadi SELESAI.
9. Gunakan Rekap untuk laporan pekerjaan.

---

# 23. BACKUP

Data utama berada pada Google Spreadsheet.

Backup data dilakukan secara berkala untuk menjaga keamanan data.

Repository GitHub digunakan untuk menyimpan source code frontend.

Data sensitif tidak boleh dimasukkan ke repository.

---

# 24. KESIMPULAN

Sistem LAPOR SOW telah menyediakan proses terintegrasi mulai dari:

PEMBUATAN LAPORAN
→
PENCATATAN
→
NOTIFIKASI
→
MONITORING
→
PENENTUAN TEKNISI
→
UPDATE STATUS
→
NOTIFIKASI PELAPOR
→
REKAP

Sistem siap digunakan untuk mendukung proses monitoring laporan dan permintaan teknisi IT SOW IV Denpasar.

---

# 25. VERSI SISTEM

Nama:
LAPOR SOW

Versi:
v1.0

Status:
FINAL

Dokumentasi:
Tahap Finalisasi

Tanggal:
September 2026