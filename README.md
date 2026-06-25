# Smart Menstrual Care

Aplikasi pembelajaran kesehatan menstruasi (mobile-first) untuk perempuan disabilitas.

**Backend:** Laravel 12 · **Frontend:** React (Vite) · **Database:** MySQL / MariaDB
React di-build menyatu ke Laravel (single deploy).

---

## Fitur Utama
- **Autentikasi sederhana & aman:** Murid/Ortu login dengan **Nama + Kelas**; Admin/Guru dengan **Email + Password**. OTP email **hanya saat registrasi**.
- **Modul pembelajaran 4 tahap** (materi teks, video YouTube, langkah berilustrasi, galeri gambar) dengan tampilan accordion + **Text-to-Speech**.
- **Mini game:** Roda Keberuntungan (Tahap 1) & Memory Card (Tahap 2).
- **Tracker menstruasi (Kalender)** dengan **assessment harian** selama menstruasi + **grafik kemandirian bulanan (persen)** & interpretasi otomatis.
- **Dashboard Ortu/Guru** memantau perkembangan murid (siklus, grafik, badge).
- **Panel Admin:** kelola materi (upload gambar), soal Assessment & Roda, dan relasi murid–pengawas.

---

## 1. Prasyarat

| Tool | Versi minimal |
|------|---------------|
| PHP | 8.2 – 8.3 (disarankan 8.3) |
| Composer | 2.x |
| Node.js | 18+ |
| npm | 9+ |
| MySQL / MariaDB | 5.7+ / 10.4+ |

Ekstensi PHP: `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `bcmath`, `curl`, `zip` (umumnya sudah aktif di Laragon/XAMPP).

---

## 2. Instalasi (sekali saja)

```bash
# 1. Salin environment
cp .env.example .env       # Windows PowerShell: Copy-Item .env.example .env

# 2. Buat database MySQL (sesuaikan user/password)
#    mysql -u root -p  lalu:
#    CREATE DATABASE smart_menstrual CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 3. Set kredensial DB di .env (lihat bagian di bawah)

# 4. Dependency backend
composer install

# 5. Kunci aplikasi
php artisan key:generate

# 6. Symlink storage (agar gambar upload bisa diakses)
php artisan storage:link

# 7. Migrasi + isi data awal
php artisan migrate:fresh --seed

# 8. Frontend
npm install
npm run build
```

### Konfigurasi `.env` (bagian database)
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=smart_menstrual
DB_USERNAME=root
DB_PASSWORD=          # Laragon default kosong; sesuaikan punya Anda

CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

# Lokal: OTP ditulis ke storage/logs/laravel.log. Produksi: ganti ke smtp.
MAIL_MAILER=log
```

---

## 3. Menjalankan

```bash
# Cara cepat (pakai hasil build)
php artisan serve              # buka http://localhost:8000

# Mode development (hot-reload) — 2 terminal:
npm run dev                    # terminal 1
php artisan serve              # terminal 2
```

---

## 4. Akun Login (hasil seeder)

| Role | Cara login | Halaman |
|------|-----------|---------|
| **Admin** | Email `admin@smartmenstrual.test` + password `password` | `/admin` |
| **Murid** | Nama `Siti Murid` + Kelas `7A` | `/murid` |
| **Ortu** | Nama `Ibu Ani` + Kelas `7A` | `/guardian` |

> Login: pilih **"Murid / Orang Tua"** (nama+kelas) atau **"Admin / Guru"** (email+password). OTP hanya saat **mendaftar**.

---

## 5. Kode OTP saat Registrasi

Karena `MAIL_MAILER=log` (lokal), kode tidak dikirim ke email tetapi ditulis ke `storage/logs/laravel.log`:
```bash
# Windows PowerShell
Get-Content storage/logs/laravel.log -Tail 20
```
Cari baris `Kode verifikasi Smart Menstrual Care Anda: 123456`. OTP berlaku 5 menit.
Di **produksi**, set `MAIL_MAILER=smtp` + kredensial agar OTP dikirim ke email asli.

---

## 6. Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `composer` error "requires php >= 8.4" | Pastikan PHP CLI = versi yang dipakai (8.2/8.3). Bila pindah versi PHP, jalankan `composer update`. |
| Tidak bisa konek DB | Pastikan MySQL menyala & kredensial `.env` benar; database `smart_menstrual` sudah dibuat. |
| Login error tabel `personal_access_tokens` | `php artisan vendor:publish --tag=sanctum-migrations` lalu `php artisan migrate`. |
| Gambar materi tidak muncul | Jalankan `php artisan storage:link`. |
| Halaman putih / aset tak termuat | `npm run build` ulang, atau `npm run dev`. |
| Reset data | `php artisan migrate:fresh --seed`. |

---

## 7. Deploy ke Produksi (ringkas)
- Set `.env`: `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://...`, DB MySQL produksi, `MAIL_MAILER=smtp`, `SESSION_SECURE_COOKIE=true`.
- `composer install --no-dev --optimize-autoloader`
- `php artisan migrate --force`
- `npm ci && npm run build`
- `php artisan storage:link`
- `php artisan config:cache route:cache view:cache`
- Web server (Nginx) arahkan root ke folder **`public/`** + pasang HTTPS.
