// ===== login.js =====
// Handles all auth logic: login, register, forgot password

// ---------- API helpers ----------
async function apiPost(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
  return data;
}

async function apiGet(url) {
  const res = await fetch(url, { credentials: 'same-origin' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
  return data;
}

// ---------- DOM Elements ----------
const authScreen      = document.getElementById('authScreen');
const loadingOverlay  = document.getElementById('loadingOverlay');
const tabLogin        = document.getElementById('tabLogin');
const tabRegister     = document.getElementById('tabRegister');
const loginForm       = document.getElementById('loginForm');
const registerForm    = document.getElementById('registerForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const authError       = document.getElementById('authError');
const btnShowForgot   = document.getElementById('btnShowForgot');
const btnBackToLogin  = document.getElementById('btnBackToLogin');
const regPasswordInput = document.getElementById('regPasswordInput');
const critLength      = document.getElementById('critLength');
const critNumber      = document.getElementById('critNumber');

// ---------- Password Visibility Toggle ----------
document.querySelectorAll('.eye-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁️';
    }
  });
});

// ---------- Password Strength Checker ----------
if (regPasswordInput) {
  regPasswordInput.addEventListener('input', (e) => {
    const val = e.target.value;
    if (val.length >= 6) critLength.classList.add('valid');
    else critLength.classList.remove('valid');
    if (/\d/.test(val)) critNumber.classList.add('valid');
    else critNumber.classList.remove('valid');
  });
}

// ---------- Auth Tab Switching ----------
tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginForm.style.display = 'flex';
  registerForm.style.display = 'none';
  forgotPasswordForm.style.display = 'none';
  authError.textContent = '';
});

tabRegister.addEventListener('click', () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerForm.style.display = 'flex';
  loginForm.style.display = 'none';
  forgotPasswordForm.style.display = 'none';
  authError.textContent = '';
  if (critLength) critLength.classList.remove('valid');
  if (critNumber) critNumber.classList.remove('valid');
});

btnShowForgot.addEventListener('click', () => {
  loginForm.style.display = 'none';
  forgotPasswordForm.style.display = 'flex';
  authError.textContent = '';
});

btnBackToLogin.addEventListener('click', () => {
  forgotPasswordForm.style.display = 'none';
  loginForm.style.display = 'flex';
  authError.textContent = '';
});

// ---------- Form Submissions ----------
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';
  const fd = new FormData(loginForm);
  try {
    await apiPost('/api/login', {
      username: fd.get('username'),
      password: fd.get('password')
    });
    window.location.href = '/absensi';
  } catch (err) {
    authError.textContent = err.message;
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';
  const fd = new FormData(registerForm);
  try {
    await apiPost('/api/register', {
      username: fd.get('username'),
      password: fd.get('password'),
      start_date: fd.get('start_date'),
      work_days: fd.get('work_days')
    });
    window.location.href = '/absensi';
  } catch (err) {
    authError.textContent = err.message;
  }
});

forgotPasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';
  const fd = new FormData(forgotPasswordForm);
  try {
    await apiPost('/api/forgot-password', {
      username: fd.get('username'),
      new_password: fd.get('new_password')
    });
    alert('Password berhasil direset. Silakan login kembali.');
    btnBackToLogin.click();
    forgotPasswordForm.reset();
  } catch (err) {
    authError.textContent = err.message;
  }
});

// ---------- Init: cek sesi, jika sudah login langsung ke absensi ----------
(async function init() {
  try {
    await apiGet('/api/me');
    // Sudah login → langsung ke halaman absensi
    window.location.href = '/absensi';
  } catch (err) {
    // Belum login → tampilkan form
    authScreen.style.display = 'block';
  } finally {
    if (loadingOverlay) loadingOverlay.style.display = 'none';
  }
})();
