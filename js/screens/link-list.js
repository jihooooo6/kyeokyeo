/* 켜켜 - K_IOS_APP_URL_001 링크 전체 화면 (v1.3: 월별 보기) */
import { navigate } from '../router.js';
import { renderTabbar } from '../app.js';
import { UrlStore } from '../url-storage.js';
import { openDatePicker } from '../components/date-picker.js';
import { openLinkEditSheet } from '../components/link-edit-sheet.js';
import {
  shiftMonth,
  todayYearMonth,
  toMonthLabel,
  toKoreanDate
} from '../date-utils.js';

let currentMonth = todayYearMonth();

// 외부 진입(라우트 매칭)용 - currentMonth를 오늘 기준으로 리셋
export function renderLinkList() {
  currentMonth = todayYearMonth();
  paint();
}

function paint() {
  const app = document.getElementById('app');
  const links = UrlStore.listByMonth(currentMonth);

  app.innerHTML = `
    <div class="screen-link-list screen">
      <div class="screen-header">
        <div class="title">링크</div>
        <div style="width:24px"></div>
      </div>

      <div class="month-nav">
        <button class="chev-btn" id="prev-month" aria-label="이전 달">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div class="month-label" id="month-label">${toMonthLabel(currentMonth)}</div>
        <button class="chev-btn" id="next-month" aria-label="다음 달">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      ${links.length === 0
        ? `<div class="empty-state">이 달의 링크가 없어요</div>`
        : `<div class="link-cards">
            ${links.map(renderCard).join('')}
          </div>`}

      <button class="fab" id="add-link" aria-label="새 링크">+</button>
    </div>

    ${renderTabbar()}
  `;

  document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth = shiftMonth(currentMonth, -1);
    paint();
  });
  document.getElementById('next-month').addEventListener('click', () => {
    currentMonth = shiftMonth(currentMonth, 1);
    paint();
  });
  document.getElementById('month-label').addEventListener('click', () => {
    openDatePicker(currentMonth + '-01', (iso) => {
      currentMonth = iso.substring(0, 7);
      paint();
    });
  });
  document.getElementById('add-link').addEventListener('click', () => {
    openLinkEditSheet({
      onSaved: () => paint()
    });
  });
  document.querySelectorAll('.link-card[data-id]').forEach((el) => {
    el.addEventListener('click', () => {
      navigate('/url/' + el.getAttribute('data-id'));
    });
  });
}

function renderCard(link) {
  const display = link.title ? link.title : link.url;
  return `
    <div class="link-card" data-id="${link.id}">
      <div class="link-title">${escapeHtml(display)}</div>
      <div class="link-url">${escapeHtml(link.url)}</div>
      <div class="link-date">${toKoreanDate(link.date)}</div>
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
