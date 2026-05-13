/* 켜켜 - K_IOS_APP_MAN_002 메인 캘린더 (v1.2: 오늘 기록 요약 영역 추가) */
import { navigate } from '../router.js';
import { renderTabbar } from '../app.js';
import { MemoStore } from '../storage.js';
import { MediaStore, blobToObjectURL, revokeObjectURL } from '../media-storage.js';
import { UrlStore } from '../url-storage.js';
import { openBottomSheet } from '../components/bottom-sheet.js';
import {
  buildMonthGrid,
  shiftMonth,
  todayYearMonth,
  todayISO,
  toMonthLabel
} from '../date-utils.js';

// 화면 상태(현재 보고 있는 연/월)
let currentMonth = todayYearMonth();

// 미리 만든 object URL을 해제하기 위한 목록
let activeUrls = [];

function clearActiveUrls() {
  activeUrls.forEach(revokeObjectURL);
  activeUrls = [];
}

export async function renderHome() {
  clearActiveUrls();
  const app = document.getElementById('app');
  const monthLabel = toMonthLabel(currentMonth);
  const cells = buildMonthGrid(currentMonth);
  const today = todayISO();

  // 캘린더 도트 - 메모/미디어/URL 합집합
  const memoDates = MemoStore.recordedDatesInMonth(currentMonth);
  let mediaDates = new Set();
  try {
    mediaDates = await MediaStore.recordedDatesInMonth(currentMonth);
  } catch (e) {
    console.warn('[home] media dates fetch failed:', e);
  }
  const urlDates = UrlStore.recordedDatesInMonth(currentMonth);
  const recordedDates = new Set([...memoDates, ...mediaDates, ...urlDates]);

  // 오늘 기록 최신 1건씩 (v1.2 신규)
  const memo = MemoStore.latestOnDate(today);
  let media = null;
  try {
    media = await MediaStore.latestOnDate(today);
  } catch (e) {
    console.warn('[home] media latest fetch failed:', e);
  }
  const url = UrlStore.latestOnDate(today);

  const summaryItems = [];
  if (memo) summaryItems.push({ type: 'memo', data: memo });
  if (media) summaryItems.push({ type: 'scene', data: media });
  if (url) summaryItems.push({ type: 'url', data: url });

  app.innerHTML = `
    <div class="screen-home screen">
      <div class="today-summary" id="today-summary">
        ${summaryItems.length === 0
          ? renderEmptySummary()
          : renderSummaryCards(summaryItems)
        }
      </div>

      <div class="top-bar">
        <div></div>
        <div class="month-nav-inline">
          <button class="chev-btn" id="prev-month" aria-label="이전 달">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div class="month-label" id="month-label">${monthLabel}</div>
          <button class="chev-btn" id="next-month" aria-label="다음 달">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
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

  // 이벤트 바인딩
  document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth = shiftMonth(currentMonth, -1);
    renderHome();
  });
  document.getElementById('next-month').addEventListener('click', () => {
    currentMonth = shiftMonth(currentMonth, 1);
    renderHome();
  });
  document.getElementById('month-label').addEventListener('click', openMonthPicker);
  document.getElementById('settings-btn').addEventListener('click', () => {
    navigate('/settings');
  });

  // 빈 상태 추가 버튼 → 바텀 시트
  const emptyAddBtn = document.getElementById('summary-empty-add');
  if (emptyAddBtn) {
    emptyAddBtn.addEventListener('click', openAddBottomSheet);
  }

  // 요약 카드 클릭 → 해당 타입 상세로 이동
  document.querySelectorAll('.summary-card[data-route]').forEach((el) => {
    el.addEventListener('click', () => {
      const route = el.getAttribute('data-route');
      if (route) navigate(route);
    });
  });

  // 날짜 셀 클릭 → 임시로 새 메모 작성 (캘린더 상세 미정의)
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

function renderEmptySummary() {
  return `
    <div class="summary-empty">
      <div class="summary-empty-text">기록이 아직 없어요.<br>같이 기록을 시작해볼까요?</div>
      <button class="summary-empty-add" id="summary-empty-add" aria-label="기록 추가">+</button>
    </div>
  `;
}

function renderSummaryCards(items) {
  // 1개면 영역 전체, 2개면 2분할, 3개면 3분할
  return `
    <div class="summary-cards count-${items.length}">
      ${items.map((it) => renderSummaryCard(it)).join('')}
    </div>
  `;
}

function renderSummaryCard({ type, data }) {
  if (type === 'memo') {
    const firstLine = (data.content || '').split('\n')[0].trim() || '(제목 없음)';
    return `
      <div class="summary-card type-memo" data-route="/memo/${data.id}">
        <span class="type-badge memo">메모</span>
        <div class="summary-body">${escapeHtml(firstLine)}</div>
      </div>
    `;
  }
  if (type === 'scene') {
    const url = blobToObjectURL(data.blob);
    activeUrls.push(url);
    const isVideo = data.type === 'video';
    return `
      <div class="summary-card type-scene" data-route="/scene/${data.id}">
        <span class="type-badge scene">장면</span>
        <div class="summary-thumb ${isVideo ? 'is-video' : ''}">
          ${isVideo
            ? `<video src="${url}" muted preload="metadata" playsinline></video>
               <span class="play-mark" aria-hidden="true">▶</span>`
            : `<img src="${url}" alt="">`
          }
        </div>
      </div>
    `;
  }
  if (type === 'url') {
    const display = data.title ? data.title : data.url;
    return `
      <div class="summary-card type-url" data-route="/url">
        <span class="type-badge url">URL</span>
        <div class="summary-body url-line">${escapeHtml(display)}</div>
      </div>
    `;
  }
  return '';
}

function openAddBottomSheet() {
  const today = todayISO();
  openBottomSheet({
    title: '무엇을 기록할까요?',
    actions: [
      {
        label: '메모',
        sublabel: '오늘 있었던 일을 글로',
        onClick: () => navigate('/memo/new?date=' + encodeURIComponent(today))
      },
      {
        label: '장면',
        sublabel: '사진이나 동영상으로',
        onClick: () => navigate('/scene/new')
      },
      {
        label: 'URL',
        sublabel: '오늘 본 링크 저장',
        onClick: () => navigate('/url/new?date=' + encodeURIComponent(today))
      }
    ]
  });
}

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
  if (typeof input.showPicker === 'function') {
    try { input.showPicker(); }
    catch (e) { input.click(); }
  } else {
    input.click();
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
