# Kartu Absensi Magang — 90 Hari Kerja (dengan Login & Database)

Web app buat checklist kehadiran magang. Sekarang sudah pakai:
- **Login & daftar akun** (password di-hash pakai bcrypt, sesi pakai cookie httpOnly)
- **Database PostgreSQL** — jadi data absensi tersimpan di server, bukan cuma di browser
- Progress % otomatis, target 90 hari kerja

## Struktur folder
```
absensi-app/
├── server.js          # backend Express + API
├── package.json
├── .env.example        # contoh environment variable
├── public/
│   ├── index.html      # halaman login + halaman absensi
│   ├── style.css
│   └── script.js
```

## Cara Deploy ke Railway

### 1. Push folder ini ke GitHub
Buat repo baru, push semua file di folder ini (kecuali `node_modules` dan `.env`, sudah di-ignore lewat `.gitignore`).

### 2. Buat project di Railway
1. Login ke https://railway.app
2. Klik **New Project → Deploy from GitHub repo**
3. Pilih repo yang tadi kamu push
4. Railway otomatis mendeteksi ini project Node.js (baca `package.json`, jalankan `npm start`)

### 3. Tambahkan database PostgreSQL
1. Di dalam project yang sama, klik **+ New → Database → Add PostgreSQL**
2. Railway otomatis membuat variabel `DATABASE_URL` dan menghubungkannya ke service kamu (biasanya otomatis linked; kalau belum, buka tab **Variables** di service backend dan tambahkan reference ke `DATABASE_URL` dari service Postgres)

### 4. Set environment variable
Di tab **Variables** service backend, tambahkan:
- `JWT_SECRET` — isi string acak yang panjang & rahasia (contoh bisa generate pakai `openssl rand -hex 32` di terminal)
- `NODE_ENV` = `production`

`DATABASE_URL` dan `PORT` biasanya sudah otomatis diisi Railway.

### 5. Deploy
Railway otomatis build & jalankan tiap kali kamu push ke GitHub. Setelah deploy sukses, buka tab **Settings → Networking** untuk generate domain publik (misalnya `https://absensi-magang.up.railway.app`).

## Coba di lokal (opsional, sebelum deploy)
```bash
npm install
cp .env.example .env
# isi DATABASE_URL pakai Postgres lokal atau dari Railway, isi JWT_SECRET bebas
npm start
```
Buka `http://localhost:3000`.

## Cara kerja datanya
- Tabel `users` — menyimpan username & password (sudah di-hash, bukan plain text)
- Tabel `attendance` — menyimpan hari ke berapa yang sudah dicap, per user
- Tiap user cuma bisa lihat & ubah data absensinya sendiri (dicek lewat cookie login)

Kalau nanti mau ditambah fitur, misal supervisor punya akun khusus buat lihat progres semua intern sekaligus, tinggal bilang ya.
