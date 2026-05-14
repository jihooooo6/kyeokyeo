/* 켜켜 - 날짜 선택 모달 (캘린더 그리드 - 일자까지 선택 가능) */
import { buildMonthGrid, shiftMonth, toMonthLabel, todayISO } from '../date-utils.js';

let state = null;

/**
 * 날짜 선택 모달 열기
 * @param {string} initialIso - "YYYY-MM-DD" 초기 표시/선택 날짜
 * @param {(iso: string) => void} onSelect - 선택한 ISO 날짜 콜백
 */
export function openDatePicker(initialIso, onSelect) {
  closeDatePicker();

  const safe = /^\d{4}-\d{2}-\d{2}$/.test(initialIso) ? initialIso : todayISO();
  state = {
    viewMonth: safe.substring(0, 7),
    selDate: safe,
    onSelect
  };

  const host = document.getElementById('toast-root');
  const wrapper = document.createElement('div');
  wrapper.className = 'date-picker-overlay';
  wrapper.id = 'date-picker';
  host.appendChild(wrapper);
  state.wrapper = wrapper;

  paint();
  requestAnimationFrame(() => wrapper.classList.add('show'));

  wrapper.addEventListener('click', (e) => {
    if (e.target === wrapper) closeDatePicker();
  });
}

export function closeDatePicker() {
  const el = document.getElementById('date-picker');
  if (!el) return;
  el.classList.remove('show');
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 180);
  state = null;
}

function paint() {
  if (!state) return;
  const { wrapper, viewMonth, selDate } = state;
  const cells = buildMonthGrid(viewMonth);
  const today = todayISO();

  wrapper.innerHTML = `
    <div class="date-picker-panel" role="dialog" aria-label="날짜 선택">
      <div class="date-picker-head">
        <button class="chev-btn" data-act="prev" aria-label="이전 달">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div class="date-picker-month">${toMonthLabel(viewMonth)}</div>
        <button class="chev-btn" data-act="next" aria-label="다음 달">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
      <div class="date-picker-weekdays">
        <div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div><div class="sun">일</div>
      </div>
      <div class="date-picker-grid">
        ${cells.map((c, i) => renderCell(c, selDate, today, i)).join('')}
      </div>
      <div class="date-picker-actions">
        <button class="date-picker-today" data-act="today">오늘</button>
        <button class="date-picker-cancel" data-act="cancel">취소</button>
      </div>
    </div>
  `;

  wrapper.querySelector('[data-act="prev"]').addEventListener('click', () => {
    state.viewMonth = shiftMonth(state.viewMonth, -1);
    paint();
  });
  wrapper.querySelector('[data-act="next"]').addEventListener('click', () => {
    state.viewMonth = shiftMonth(state.viewMonth, 1);
    paint();
  });
  wrapper.querySelectorAll('.date-cell[data-date]').forEach((b) =>
    b.addEventListener('click', () => {
      const iso = b.getAttribute('data-date');
      const cb = state.onSelect;
      closeDatePicker();
      cb(iso);
    })
  );
  wrapper.querySelector('[data-act="today"]').addEventListener('click', () => {
    const iso = todayISO();
    const cb = state.onSelect;
    closeDatePicker();
    cb(iso);
  });
  wrapper.querySelector('[data-act="cancel"]').addEventListener('click', closeDatePicker);
}

function renderCell(cell, selDate, todayIso, idx) {
  const isSunday = (idx % 7) === 6;
  if (cell.date === null) {
    return `<div class="date-cell empty ${isSunday ? 'sun' : ''}"></div>`;
  }
  const classes = ['date-cell'];
  if (isSunday) classes.push('sun');
  if (cell.date === todayIso) classes.push('today');
  if (cell.date === selDate) classes.push('selected');
  return `<button class="${classes.join(' ')}" data-date="${cell.date}">${cell.day}</button>`;
}
