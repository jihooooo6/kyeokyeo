/* 켜켜 - K_IOS_APP_MMO_001 메모 전체 화면 */
import { navigate } from '../router.js';
import { renderTabbar } from '../app.js';
import { MemoStore } from '../storage.js';
import {
  shiftMonth,
  todayYearMonth,
  toMonthLabel,
  toKoreanDate
} from '../date-utils.js';

let currentMonth = todayYearMonth();

export function renderMemoList() {
  const app = document.getElementById('app');
  // 현재 월의 메모 카드 목록 (최근 작성 순)
  const memos = MemoStore.listByMonth(currentMonth);

  app.innerHTML = `
    <div class="screen-memo-list screen">
      <div class="screen-header">
        <div class="title">메모</div>
        <div style="width:24px"></div>
      </div>

      <div class="month-nav">
        <button class="chev-btn" id="prev-month" aria-label="이전 달">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div class="month-label">${toMonthLabel(currentMonth)}</div>
        <button class="chev-btn" id="next-month" aria-label="다음 달">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      ${memos.length === 0
        ? `<div class="empty-state">이 달의 메모가 없어요</div>`
        : `<div class="memo-cards">
            ${memos.map(renderCard).join('')}
          </div>`}

      <button class="fab" id="add-memo" aria-label="새 메모">+</button>
    </div>

    ${renderTabbar()}
  `;

  document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth = shiftMonth(currentMonth, -1);
    renderMemoList();
  });
  document.getElementById('next-month').addEventListener('click', () => {
    currentMonth = shiftMonth(currentMonth, 1);
    renderMemoList();
  });
  document.getElementById('add-memo').addEventListener('click', () => {
    navigate('/memo/new');
  });
  document.querySelectorAll('.memo-card[data-id]').forEach((el) => {
    el.addEventListener('click', () => {
      navigate('/memo/' + el.getAttribute('data-id'));
    });
  });
}

function renderCard(memo) {
  const lines = (memo.content || '').split('\n');
  const title = (lines[0] || '').trim() || '(제목 없음)';
  const rest = lines.slice(1).join('\n').trim();
  return `
    <div class="memo-card" data-id="${memo.id}">
      <div class="memo-date">${toKoreanDate(memo.date)}</div>
      <div class="memo-title">${escapeHtml(title)}</div>
      ${rest ? `<div class="memo-preview">${escapeHtml(rest)}</div>` : ''}
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
