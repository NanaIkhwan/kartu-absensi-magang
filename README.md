# Kartu Absensi Magang — 90 Hari Kerja

Web sederhana buat checklist kehadiran magang, dengan progress % dan target 90 hari kerja.

## Isi folder
- `index.html` — halaman utama
- `style.css` — semua styling
- `script.js` — logika checklist & penyimpanan data
- `vercel.json` — konfigurasi deploy Vercel

## Cara Deploy ke Vercel

### Opsi 1 — Lewat website Vercel (paling gampang, tanpa install apa-apa)
1. Buat akun/login di https://vercel.com (bisa pakai akun GitHub)
2. Upload folder ini ke repo GitHub baru (drag & drop lewat github.com juga bisa)
3. Di dashboard Vercel, klik **Add New → Project**
4. Pilih repo GitHub tadi, lalu klik **Deploy**
5. Framework Preset pilih **Other** (karena ini static HTML biasa, tanpa build step)
6. Tunggu proses deploy selesai, nanti dapat link seperti `https://nama-project.vercel.app`

### Opsi 2 — Lewat Vercel CLI (kalau punya Node.js)
```bash
npm install -g vercel
cd folder-absensi-ini
vercel
```
Ikuti pertanyaan yang muncul (login, nama project, dst), lalu jalankan `vercel --prod` untuk deploy ke production.

## Catatan penting
Data kehadiran disimpan di **localStorage browser**, artinya:
- Data tersimpan per browser/device, bukan di server
- Kalau buka dari HP dan laptop, datanya beda (tidak otomatis sinkron)
- Kalau hapus cache/data browser, checklist akan ikut hilang

Kalau nanti mau data tersimpan di server dan bisa diakses dari device mana pun, kasih tahu ya — bisa ditambahkan penyimpanan berbasis database.
