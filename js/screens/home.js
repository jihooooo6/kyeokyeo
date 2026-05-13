/* 켜켜 - K_IOS_APP_MAN_002 메인 캘린더 */
import { navigate } from '../router.js';
import { renderTabbar } from '../app.js';
import { MemoStore } from '../storage.js';
import { MediaStore } from '../media-storage.js';
import {
  buildMonthGrid,
  shiftMonth,
  todayYearMonth,
  todayISO,
  toMonthLabel
} from '../date-utils.js';

// 화면 상태(현재 보고 있는 연/월)
let currentMonth = todayYearMonth();

export async function renderHome() {
  const app = document.getElementById('app');
  const monthLabel = toMonthLabel(currentMonth);
  const cells = buildMonthGrid(currentMonth);
  // 기록 있는 날짜 집합 - 메모와 미디어 모두 포함
  const memoDates = MemoStore.recordedDatesInMonth(currentMonth);
  let mediaDates = new Set();
  try {
    mediaDates = await MediaStore.recordedDatesInMonth(currentMonth);
  } catch (e) {
    console.warn('[home] media dates fetch failed:', e);
  }
  const recordedDates = new Set([...memoDates, ...mediaDates]);
  const today = todayISO();

  app.innerHTML = `
    <div class="screen-home screen">
      <div class="top-bar">
        <div></div>
        <div class="month-nav-inline">
          <button id="prev-month" aria-label="이전 달">&lt;</button>
          <div class="month-label" id="month-label">${monthLabel}</div>
          <button id="next-month" aria-label="다음 달">&gt;</button>
        </div>
        <button class="settings-btn" id="settings-btn" aria-label="설정">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>

      <div class="calendar">
        <div class="weekdays">
          <div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div><div>일</div>
        </div>
        <div class="days">
          ${cells.map((c) => renderDayCell(c, recordedDates, today)).join('')}
        </div>
      </div>
    </div>

    ${renderTabbar()}
  `;

  document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth = shiftMonth(currentMonth, -1);
    renderHome();
  });
  document.getElementById('next-month').addEventListener('click', () => {
    currentMonth = shiftMonth(currentMonth, 1);
    renderHome();
  });

  // 연/월 라벨 터치 -> 데이트 피커
  document.getElementById('month-label').addEventListener('click', openMonthPicker);

  // 설정 페이지로 이동
  document.getElementById('settings-btn').addEventListener('click', () => {
    navigate('/settings');
  });

  // 날짜 셀 클릭 -> 해당 날짜의 메모 작성으로 이동(임시 동작)
  // (기획서는 "캘린더 상세" 화면으로 이동인데 그 화면은 아직 명세가 없으므로 메모 추가로 우회)
  document.querySelectorAll('.calendar .day[data-date]').forEach((el) => {
    el.addEventListener('click', () => {
      const d = el.getAttribute('data-date');
      navigate('/memo/new?date=' + encodeURIComponent(d));
    });
  });
}

function renderDayCell(cell, recordedDates, todayIso) {
  if (cell.date === null) {
    return `<div class="day empty"></div>`;
  }
  const classes = ['day'];
  if (recordedDates.has(cell.date)) classes.push('has-record');
  if (cell.date === todayIso) classes.push('today');
  return `<div class="${classes.join(' ')}" data-date="${cell.date}">${cell.day}</div>`;
}

// 연/월 직접 선택 (네이티브 input[type=month] 사용)
function openMonthPicker() {
  const input = document.createElement('input');
  input.type = 'month';
  input.value = currentMonth;
  input.style.position = 'fixed';
  input.style.opacity = '0';
  input.style.left = '-9999px';
  document.body.appendChild(input);
  input.addEventListener('change', () => {
    if (input.value) {
      currentMonth = input.value;
      renderHome();
    }
    document.body.removeChild(input);
  });
  // iOS Safari 대응 - showPicker 미지원 시 click
  if (typeof input.showPicker === 'function') {
    try { input.showPicker(); }
    catch (e) { input.click(); }
  } else {
    input.click();
  }
}
