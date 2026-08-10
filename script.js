const TOTAL_DAYS = 90;
const STORAGE_KEY = 'absensi-magang-90hari';

const gridEl = document.getElementById('grid');
const progressPercentEl = document.getElementById('progressPercent');
const progressFractionEl = document.getElementById('progressFraction');
const progressFillEl = document.getElementById('progressFill');
const progressNoteEl = document.getElementById('progressNote');
const stampTodayBtn = document.getElementById('stampToday');
const nextDayLabelEl = document.getElementById('nextDayLabel');
const resetBtn = document.getElementById('resetBtn');

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // storage unavailable, continue without persistence
  }
}

let state = loadState(); // { "1": true, "2": true, ... }

function buildGrid() {
  gridEl.innerHTML = '';
  for (let i = 1; i <= TOTAL_DAYS; i++) {
    const cell = document.createElement('div');
    cell.className = 'day';
    cell.dataset.num = i;
    cell.textContent = i;
    if (state[i]) cell.classList.add('done');
    cell.addEventListener('click', () => toggleDay(i));
    gridEl.appendChild(cell);
  }
}

function toggleDay(num) {
  if (state[num]) {
    delete state[num];
  } else {
    state[num] = true;
  }
  saveState(state);
  render();
}

function countDone() {
  return Object.keys(state).filter(k => state[k]).length;
}

function nextEmptyDay() {
  for (let i = 1; i <= TOTAL_DAYS; i++) {
    if (!state[i]) return i;
  }
  return null;
}

function render() {
  const done = countDone();
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
    nextDayLabelEl.textContent = 'Hari ke-' + next;
  }

  document.querySelectorAll('.day').forEach(cell => {
    const n = cell.dataset.num;
    cell.classList.toggle('done', !!state[n]);
  });
}

stampTodayBtn.addEventListener('click', () => {
  const next = nextEmptyDay();
  if (next !== null) toggleDay(next);
});

resetBtn.addEventListener('click', () => {
  const confirmReset = confirm('Yakin ingin menghapus semua data absensi?');
  if (confirmReset) {
    state = {};
    saveState(state);
    render();
  }
});

buildGrid();
render();
