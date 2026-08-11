const TOTAL_DAYS = 90;

const HOLIDAYS = {
  '2026-01-01': 'Tahun Baru Masehi',
  '2026-01-16': 'Isra Mikraj',
  '2026-02-16': 'Cuti Bersama Imlek',
  '2026-02-17': 'Tahun Baru Imlek',
  '2026-03-18': 'Cuti Bersama Nyepi',
  '2026-03-19': 'Hari Suci Nyepi',
  '2026-03-20': 'Cuti Bersama Idul Fitri',
  '2026-03-21': 'Hari Raya Idul Fitri',
  '2026-03-22': 'Hari Raya Idul Fitri',
  '2026-03-23': 'Cuti Bersama Idul Fitri',
  '2026-03-24': 'Cuti Bersama Idul Fitri',
  '2026-04-03': 'Wafat Yesus Kristus',
  '2026-04-05': 'Paskah',
  '2026-05-01': 'Hari Buruh Internasional',
  '2026-05-14': 'Kenaikan Yesus Kristus',
  '2026-05-15': 'Cuti Kenaikan Yesus',
  '2026-05-27': 'Hari Raya Idul Adha',
  '2026-05-28': 'Cuti Bersama Idul Adha',
  '2026-05-31': 'Hari Raya Waisak',
  '2026-06-01': 'Hari Lahir Pancasila',
  '2026-06-16': 'Tahun Baru Islam',
  '2026-08-17': 'HUT Kemerdekaan RI',
  '2026-08-25': 'Maulid Nabi Muhammad',
  '2026-12-24': 'Cuti Bersama Natal',
  '2026-12-25': 'Hari Raya Natal'
};
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function toDateStr(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

let validWorkingDays = [];
let dateToDayNumber = {};

function initCalendar(startDateStr, workDays = 6) {
  validWorkingDays = [];
  dateToDayNumber = {};

  let currDate = new Date(startDateStr);
  let dayCount = 1;
  while (dayCount <= TOTAL_DAYS) {
    const str = toDateStr(currDate);
    const dayOfWeek = currDate.getDay();
    
    let isWeekend = false;
    if (workDays === 5) {
      isWeekend = (dayOfWeek === 0 || dayOfWeek === 6); // Minggu dan Sabtu
    } else {
      isWeekend = (dayOfWeek === 0); // Hanya Minggu
    }

    if (!isWeekend && !HOLIDAYS[str]) {
      validWorkingDays.push(new Date(currDate));
      dateToDayNumber[str] = dayCount;
      dayCount++;
    }
    currDate.setDate(currDate.getDate() + 1);
  }
}

function formatDateShort(d) {
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)}`;
}

const authScreen = document.getElementById('authScreen');
const appScreen = document.getElementById('appScreen');

const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authError = document.getElementById('authError');

const userChip = document.getElementById('userChip');
const logoutBtn = document.getElementById('logoutBtn');

const gridEl = document.getElementById('grid');
const progressPercentEl = document.getElementById('progressPercent');
const progressFractionEl = document.getElementById('progressFraction');
const progressFillEl = document.getElementById('progressFill');
const progressNoteEl = document.getElementById('progressNote');
const stampTodayBtn = document.getElementById('stampToday');
const nextDayLabelEl = document.getElementById('nextDayLabel');
const resetBtn = document.getElementById('resetBtn');

let doneDays = new Set();

const btnShowForgot = document.getElementById('btnShowForgot');
const btnBackToLogin = document.getElementById('btnBackToLogin');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');

const btnSettings = document.getElementById('btnSettings');
const settingsModal = document.getElementById('settingsModal');
const btnCloseSettings = document.getElementById('btnCloseSettings');

const tabChangePwd = document.getElementById('tabChangePwd');
const tabDeleteAcc = document.getElementById('tabDeleteAcc');
const changePasswordForm = document.getElementById('changePasswordForm');
const deleteAccountForm = document.getElementById('deleteAccountForm');
const changePwdError = document.getElementById('changePwdError');
const deleteAccError = document.getElementById('deleteAccError');

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
const regPasswordInput = document.getElementById('regPasswordInput');
const critLength = document.getElementById('critLength');
const critNumber = document.getElementById('critNumber');

if (regPasswordInput) {
  regPasswordInput.addEventListener('input', (e) => {
    const val = e.target.value;
    
    if (val.length >= 6) critLength.classList.add('valid');
    else critLength.classList.remove('valid');

    if (/\d/.test(val)) critNumber.classList.add('valid');
    else critNumber.classList.remove('valid');
  });
}

// ---------- Auth tab switching ----------

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
  // Reset UI criteria
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

tabRegister.addEventListener('click', () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerForm.style.display = 'flex';
  loginForm.style.display = 'none';
  authError.textContent = '';
});

// ---------- Auth requests ----------

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

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';
  const fd = new FormData(loginForm);
  try {
    const data = await apiPost('/api/login', {
      username: fd.get('username'),
      password: fd.get('password')
    });
    await enterApp(data);
  } catch (err) {
    authError.textContent = err.message;
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';
  const fd = new FormData(registerForm);
  try {
    const data = await apiPost('/api/register', {
      username: fd.get('username'),
      password: fd.get('password'),
      start_date: fd.get('start_date'),
      work_days: fd.get('work_days')
    });
    await enterApp(data);
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

logoutBtn.addEventListener('click', async () => {
  await apiPost('/api/logout');
  doneDays = new Set();
  appScreen.style.display = 'none';
  authScreen.style.display = 'block';
  loginForm.reset();
  registerForm.reset();
  forgotPasswordForm.reset();
});

// ---------- Settings Modal ----------

btnSettings.addEventListener('click', () => {
  settingsModal.style.display = 'flex';
  changePwdError.textContent = '';
  deleteAccError.textContent = '';
});

btnCloseSettings.addEventListener('click', () => {
  settingsModal.style.display = 'none';
  changePasswordForm.reset();
  deleteAccountForm.reset();
});

tabChangePwd.addEventListener('click', () => {
  tabChangePwd.classList.add('active');
  tabDeleteAcc.classList.remove('active');
  changePasswordForm.style.display = 'flex';
  deleteAccountForm.style.display = 'none';
  changePwdError.textContent = '';
});

tabDeleteAcc.addEventListener('click', () => {
  tabDeleteAcc.classList.add('active');
  tabChangePwd.classList.remove('active');
  deleteAccountForm.style.display = 'flex';
  changePasswordForm.style.display = 'none';
  deleteAccError.textContent = '';
});

changePasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  changePwdError.textContent = '';
  const fd = new FormData(changePasswordForm);
  try {
    await apiPost('/api/change-password', {
      old_password: fd.get('old_password'),
      new_password: fd.get('new_password')
    });
    alert('Password berhasil diubah!');
    btnCloseSettings.click();
  } catch (err) {
    changePwdError.textContent = err.message;
  }
});

deleteAccountForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  deleteAccError.textContent = '';
  const fd = new FormData(deleteAccountForm);
  
  if (!confirm('Peringatan: Aksi ini tidak dapat dibatalkan! Yakin ingin menghapus akun?')) return;
  
  try {
    await apiPost('/api/delete-account', {
      password: fd.get('password')
    });
    alert('Akun berhasil dihapus secara permanen.');
    btnCloseSettings.click();
    
    // reset UI to login
    doneDays = new Set();
    appScreen.style.display = 'none';
    authScreen.style.display = 'block';
    loginForm.reset();
    registerForm.reset();
  } catch (err) {
    deleteAccError.textContent = err.message;
  }
});

// ---------- App logic ----------

async function enterApp(userData) {
  userChip.textContent = userData.username;
  initCalendar(userData.start_date || '2026-07-27', userData.work_days || 6);
  authScreen.style.display = 'none';
  appScreen.style.display = 'block';
  await loadAttendance();
}

async function loadAttendance() {
  try {
    const data = await apiGet('/api/attendance');
    doneDays = new Set(data.days);
    buildGrid();
    render(true);
  } catch (err) {
    authError.textContent = '';
    console.error(err);
  }
}

let currentMonthIndex = 0;
let monthBlocks = [];

const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const calMonthLabelEl = document.getElementById('calMonthLabel');

function buildMonthBlock(year, month) {
  const monthBlock = document.createElement('div');
  monthBlock.className = 'month-block';
  monthBlock.dataset.year = year;
  monthBlock.dataset.month = month;

  const weekDaysRow = document.createElement('div');
  weekDaysRow.className = 'week-days';
  WEEKDAYS.forEach(wd => {
    const el = document.createElement('div');
    el.textContent = wd;
    weekDaysRow.appendChild(el);
  });
  monthBlock.appendChild(weekDaysRow);

  const calGrid = document.createElement('div');
  calGrid.className = 'calendar-grid';

  const firstDay = new Date(year, month, 1);
  let firstDayIndex = (firstDay.getDay() + 6) % 7; // Mon=0
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'day empty';
    calGrid.appendChild(emptyCell);
  }

  const startDate = validWorkingDays[0];
  const endDate = validWorkingDays[validWorkingDays.length - 1];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const holidaysInMonth = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    const str = toDateStr(cellDate);

    const cell = document.createElement('div');
    cell.className = 'day';

    const isSunday = cellDate.getDay() === 0;
    const isSaturday = cellDate.getDay() === 6;
    const holidayName = HOLIDAYS[str];
    const dayNum = dateToDayNumber[str];

    if (dayNum) {
      cell.dataset.num = dayNum;

      const dateSpan = document.createElement('span');
      dateSpan.className = 'cal-date';
      dateSpan.textContent = d;

      const badgeSpan = document.createElement('span');
      badgeSpan.className = 'cal-badge';
      badgeSpan.textContent = `H-${dayNum}`;

      cell.appendChild(dateSpan);
      cell.appendChild(badgeSpan);

      if (doneDays.has(dayNum)) cell.classList.add('done');
    } else {
      cell.classList.add('disabled');
      const dateSpan = document.createElement('span');
      dateSpan.className = 'cal-date';
      dateSpan.textContent = d;
      cell.appendChild(dateSpan);

      const labelSpan = document.createElement('span');
      labelSpan.className = 'cal-label';
      // If it reaches here, it's NOT a valid working day (either weekend or holiday)
      // Check if it's within the internship period to color it red
      if (cellDate >= startDate && cellDate <= endDate) {
        labelSpan.textContent = 'Libur';
        cell.classList.add('libur');
        
        if (holidayName) {
          holidaysInMonth.push(`${d} ${MONTHS[month]}: ${holidayName}`);
        }
      }
      cell.appendChild(labelSpan);
    }

    calGrid.appendChild(cell);
  }

  monthBlock.appendChild(calGrid);
  
  if (holidaysInMonth.length > 0) {
    const legendDiv = document.createElement('div');
    legendDiv.className = 'month-legend';
    
    // Deduplicate array in case of multiple same holidays (though rare)
    const uniqueHolidays = [...new Set(holidaysInMonth)];
    
    uniqueHolidays.forEach(h => {
      const p = document.createElement('p');
      p.textContent = `• ${h}`;
      legendDiv.appendChild(p);
    });
    monthBlock.appendChild(legendDiv);
  }

  return monthBlock;
}

function buildGrid() {
  gridEl.innerHTML = '';
  monthBlocks = [];

  const startDate = validWorkingDays[0];
  const endDate = validWorkingDays[validWorkingDays.length - 1];

  let cur = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (cur <= end) {
    const block = buildMonthBlock(cur.getFullYear(), cur.getMonth());
    block.style.display = 'none';
    gridEl.appendChild(block);
    monthBlocks.push(block);
    cur.setMonth(cur.getMonth() + 1);
  }

  showMonth(0);
}

function showMonth(index) {
  monthBlocks.forEach((b, i) => {
    b.style.display = i === index ? 'block' : 'none';
  });
  currentMonthIndex = index;

  const block = monthBlocks[index];
  const y = block.dataset.year;
  const m = parseInt(block.dataset.month);
  calMonthLabelEl.textContent = `${MONTHS[m]} ${y}`;

  prevMonthBtn.disabled = index === 0;
  nextMonthBtn.disabled = index === monthBlocks.length - 1;
}

prevMonthBtn.addEventListener('click', () => {
  if (currentMonthIndex > 0) showMonth(currentMonthIndex - 1);
});

nextMonthBtn.addEventListener('click', () => {
  if (currentMonthIndex < monthBlocks.length - 1) showMonth(currentMonthIndex + 1);
});



async function toggleDay(num) {
  try {
    const data = await apiPost(`/api/attendance/${num}/toggle`);
    doneDays = new Set(data.days);
    render();
  } catch (err) {
    console.error(err);
  }
}

function nextEmptyDay() {
  for (let i = 1; i <= TOTAL_DAYS; i++) {
    if (!doneDays.has(i)) return i;
  }
  return null;
}

function render(isInitialLoad = false) {
  const done = doneDays.size;
  const percent = Math.round((done / TOTAL_DAYS) * 100);

  progressPercentEl.textContent = percent + '%';
  progressFractionEl.textContent = done + ' / ' + TOTAL_DAYS + ' hari';
  progressFillEl.style.width = percent + '%';

  const sisa = TOTAL_DAYS - done;
  if (done === 0) {
    progressNoteEl.textContent = 'Belum ada hari yang tercatat. Mulai dari hari ke-1.';
  } else if (done >= TOTAL_DAYS) {
    progressNoteEl.textContent = 'Selesai! 90 hari kerja sudah tercatat lengkap.';
  } else {
    progressNoteEl.textContent = 'Sisa ' + sisa + ' hari kerja lagi menuju target.';
  }

  const next = nextEmptyDay();
  if (next === null) {
    stampTodayBtn.disabled = true;
    nextDayLabelEl.textContent = 'Semua hari sudah dicap';
    
    // Auto focus to last month if completed
    if (isInitialLoad && monthBlocks.length > 0) {
      showMonth(monthBlocks.length - 1);
    }
  } else {
    const nextDate = validWorkingDays[next - 1];
    
    // Check if nextDate is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(nextDate);
    targetDate.setHours(0, 0, 0, 0);

    if (targetDate > today) {
      stampTodayBtn.disabled = true;
      nextDayLabelEl.textContent = `Hari ke-${next} belum tiba`;
    } else {
      stampTodayBtn.disabled = false;
      nextDayLabelEl.textContent = `Hari ke-${next} (${formatDateShort(nextDate)})`;
    }
    
    // Auto focus to the month containing nextDate
    if (isInitialLoad) {
      const targetYear = nextDate.getFullYear();
      const targetMonth = nextDate.getMonth();
      const targetIndex = monthBlocks.findIndex(b => 
        parseInt(b.dataset.year) === targetYear && parseInt(b.dataset.month) === targetMonth
      );
      if (targetIndex !== -1) showMonth(targetIndex);
    }
  }

  document.querySelectorAll('.day').forEach((cell) => {
    const n = parseInt(cell.dataset.num, 10);
    cell.classList.toggle('done', doneDays.has(n));
  });
}

stampTodayBtn.addEventListener('click', () => {
  const next = nextEmptyDay();
  if (next !== null) toggleDay(next);
});

resetBtn.addEventListener('click', async () => {
  const confirmReset = confirm('Yakin ingin menghapus semua data absensi?');
  if (!confirmReset) return;
  try {
    const data = await apiPost('/api/attendance/reset');
    doneDays = new Set(data.days);
    render();
  } catch (err) {
    console.error(err);
  }
});

// ---------- Init: check existing session ----------

const loadingOverlay = document.getElementById('loadingOverlay');

(async function init() {
  try {
    const me = await apiGet('/api/me');
    await enterApp(me);
  } catch (err) {
    authScreen.style.display = 'block';
    appScreen.style.display = 'none';
  } finally {
    if (loadingOverlay) loadingOverlay.style.display = 'none';
  }
})();
