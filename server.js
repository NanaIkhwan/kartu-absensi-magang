require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ganti-secret-ini-di-env';
const TOTAL_DAYS = 90;

if (!process.env.DATABASE_URL) {
  console.warn('[DB] PERINGATAN: DATABASE_URL belum diset. Tambahkan PostgreSQL plugin di Railway.');
} else {
  console.log('[DB] Menggunakan DATABASE_URL (PostgreSQL)');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

let dbReady = null;
async function initDb() {
  if (dbReady) return dbReady;
  dbReady = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT '2026-07-27';
    `);
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS work_days INTEGER DEFAULT 6;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        day_number INTEGER NOT NULL,
        checked_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (user_id, day_number)
      );
    `);
  })();
  return dbReady;
}

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

function auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Belum login' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    req.username = payload.username;
    req.startDate = payload.startDate;
    req.workDays = payload.workDays;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Sesi tidak valid, silakan login lagi' });
  }
}

function setAuthCookie(res, user) {
  const token = jwt.sign({ 
    userId: user.id, 
    username: user.username,
    startDate: user.start_date,
    workDays: user.work_days
  }, JWT_SECRET, { expiresIn: '30d' });
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
}

// ---- Auth routes ----

app.post('/api/register', async (req, res) => {
  const { username, password, start_date, work_days } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username dan password wajib diisi' });
  if (username.length < 3) return res.status(400).json({ error: 'Username minimal 3 karakter' });
  if (password.length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter' });
  
  let validStartDate = '2026-07-27'; // default
  if (start_date && !isNaN(new Date(start_date).getTime())) {
    validStartDate = start_date;
  }
  
  let validWorkDays = 6;
  if (work_days === '5' || work_days === 5) validWorkDays = 5;

  try {
    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Username sudah dipakai' });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, start_date, work_days) VALUES ($1, $2, $3, $4) RETURNING id, username, start_date, work_days',
      [username, hash, validStartDate, validWorkDays]
    );
    const user = result.rows[0];
    setAuthCookie(res, user);
    res.json({ username: user.username, start_date: user.start_date, work_days: user.work_days });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal membuat akun, coba lagi' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username dan password wajib diisi' });

  try {
    const result = await pool.query('SELECT id, username, password_hash, start_date, work_days FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Username atau password salah' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Username atau password salah' });

    setAuthCookie(res, user);
    res.json({ username: user.username, start_date: user.start_date, work_days: user.work_days });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal login, coba lagi' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

app.get('/api/me', auth, (req, res) => {
  res.json({ username: req.username, start_date: req.startDate, work_days: req.workDays });
});

app.post('/api/forgot-password', async (req, res) => {
  const { username, new_password } = req.body || {};
  if (!username || !new_password) return res.status(400).json({ error: 'Username dan password baru wajib diisi' });
  if (new_password.length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter' });

  try {
    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Akun tidak ditemukan' });

    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE username = $2', [hash, username]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal reset password' });
  }
});

app.post('/api/change-password', auth, async (req, res) => {
  const { old_password, new_password } = req.body || {};
  if (!old_password || !new_password) return res.status(400).json({ error: 'Password lama dan baru wajib diisi' });
  if (new_password.length < 6) return res.status(400).json({ error: 'Password baru minimal 6 karakter' });

  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Akun tidak ditemukan' });

    const user = result.rows[0];
    const match = await bcrypt.compare(old_password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Password lama salah' });

    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.userId]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal mengubah password' });
  }
});

app.post('/api/delete-account', auth, async (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'Password wajib diisi untuk konfirmasi' });

  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Akun tidak ditemukan' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Password salah, gagal menghapus akun' });

    await pool.query('DELETE FROM users WHERE id = $1', [req.userId]);
    res.clearCookie('token');
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal menghapus akun' });
  }
});

// ---- Attendance routes ----

app.get('/api/attendance', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT day_number FROM attendance WHERE user_id = $1 ORDER BY day_number', [req.userId]);
    res.json({ days: result.rows.map(r => r.day_number) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal mengambil data' });
  }
});

const HOLIDAYS = {
  '2026-08-17': 'HUT RI ke-81',
  '2026-08-25': 'Cuti Bersama',
  '2026-09-04': 'Maulid Nabi', 
  '2026-12-25': 'Hari Natal'
};

function getWorkingDate(startDateStr, workDays, targetDayNumber) {
  let currDate = new Date(startDateStr);
  let dayCount = 1;
  while (dayCount <= targetDayNumber) {
    const yyyy = currDate.getFullYear();
    const mm = String(currDate.getMonth() + 1).padStart(2, '0');
    const dd = String(currDate.getDate()).padStart(2, '0');
    const str = `${yyyy}-${mm}-${dd}`;
    
    const dayOfWeek = currDate.getDay();
    let isWeekend = (workDays === 5) ? (dayOfWeek === 0 || dayOfWeek === 6) : (dayOfWeek === 0);
    
    if (!isWeekend && !HOLIDAYS[str]) {
      if (dayCount === targetDayNumber) return new Date(currDate);
      dayCount++;
    }
    currDate.setDate(currDate.getDate() + 1);
  }
  return null;
}

app.post('/api/attendance/:day/toggle', auth, async (req, res) => {
  const day = parseInt(req.params.day, 10);
  if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS) {
    return res.status(400).json({ error: 'Nomor hari tidak valid' });
  }

  // Backend Validation: prevent stamping future dates
  const targetDate = getWorkingDate(req.startDate, req.workDays || 6, day);
  if (targetDate) {
    const today = new Date();
    today.setHours(0,0,0,0);
    targetDate.setHours(0,0,0,0);
    if (targetDate > today) {
      return res.status(403).json({ error: 'Akses ditolak: Anda tidak bisa absen untuk masa depan' });
    }
  }

  try {
    const existing = await pool.query(
      'SELECT 1 FROM attendance WHERE user_id = $1 AND day_number = $2',
      [req.userId, day]
    );

    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM attendance WHERE user_id = $1 AND day_number = $2', [req.userId, day]);
    } else {
      await pool.query('INSERT INTO attendance (user_id, day_number) VALUES ($1, $2)', [req.userId, day]);
    }

    const result = await pool.query('SELECT day_number FROM attendance WHERE user_id = $1 ORDER BY day_number', [req.userId]);
    res.json({ days: result.rows.map(r => r.day_number) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal mengubah absen' });
  }
});

app.post('/api/attendance/reset', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM attendance WHERE user_id = $1', [req.userId]);
    res.json({ days: [] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gagal mereset absen' });
  }
});

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware untuk pastikan DB sudah siap sebelum handle request
app.use(async (req, res, next) => {
  try {
    await initDb();
    next();
  } catch (err) {
    console.error('DB init error:', err.message);
    res.status(500).json({ error: 'Database tidak tersedia' });
  }
});

// Vercel: export app sebagai serverless function
// Lokal / Railway: jalankan server biasa
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));
}

module.exports = app;
