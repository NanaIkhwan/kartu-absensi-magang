const TOTAL_DAYS = 90;

const START_DATE = new Date(2026, 6, 27); // 27 July 2026
const HOLIDAYS = ['2026-08-17', '2026-08-25'];
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function toDateStr(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const validWorkingDays = [];
const dateToDayNumber = {};

function initCalendar() {
  let currDate = new Date(START_DATE);
  let dayCount = 1;
  while (dayCount <= TOTAL_DAYS) {
    const str = toDateStr(currDate);
    if (currDate.getDay() !== 0 && !HOLIDAYS.includes(str)) {
      validWorkingDays.push(new Date(currDate));
      dateToDayNumber[str] = dayCount;
      dayCount++;
    }
    currDate.setDate(currDate.getDate() + 1);
  }
}
initCalendar();

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

// ---------- Auth tab switching ----------

tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginForm.style.display = 'flex';
  registerForm.style.display = 'none';
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
    await enterApp(data.username);
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
      password: fd.get('password')
    });
    await enterApp(data.username);
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
});

// ---------- App logic ----------

async function enterApp(username) {
  userChip.textContent = username;
  authScreen.style.display = 'none';
  appScreen.style.display = 'block';
  await loadAttendance();
}

async function loadAttendance() {
  try {
    const data = await apiGet('/api/attendance');
    doneDays = new Set(data.days);
    buildGrid();
    render();
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

  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    const str = toDateStr(cellDate);

    const cell = document.createElement('div');
    cell.className = 'day';

    const isSunday = cellDate.getDay() === 0;
    const isHoliday = HOLIDAYS.includes(str);
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
      cell.addEventListener('click', () => toggleDay(dayNum));
    } else {
      cell.classList.add('disabled');
      const dateSpan = document.createElement('span');
      dateSpan.className = 'cal-date';
      dateSpan.textContent = d;
      cell.appendChild(dateSpan);

      const labelSpan = document.createElement('span');
      labelSpan.className = 'cal-label';
      if ((isHoliday || isSunday) && (cellDate >= startDate && cellDate <= endDate)) {
        labelSpan.textContent = 'Libur';
        cell.classList.add('libur');
      }
      cell.appendChild(labelSpan);
    }

    calGrid.appendChild(cell);
  }

  monthBlock.appendChild(calGrid);
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

function render() {
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
  } else {
    stampTodayBtn.disabled = false;
    const nextDate = validWorkingDays[next - 1];
    nextDayLabelEl.textContent = `Hari ke-${next} (${formatDateShort(nextDate)})`;
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

(async function init() {
  try {
    const me = await apiGet('/api/me');
    await enterApp(me.username);
  } catch (err) {
    authScreen.style.display = 'block';
    appScreen.style.display = 'none';
  }
})();
