/* 켜켜 - K_IOS_APP_URL_001 링크 전체 화면 (v1.3.1: 일별 보기) */
import { navigate } from '../router.js';
import { renderTabbar } from '../app.js';
import { UrlStore } from '../url-storage.js';
import { openDatePicker } from '../components/date-picker.js';
import { openLinkEditSheet } from '../components/link-edit-sheet.js';
import {
  shiftDay,
  todayISO,
  toKoreanDate
} from '../date-utils.js';

let currentDate = todayISO();

// 외부 진입(라우트 매칭)용 - currentDate를 오늘로 리셋
export function renderLinkList() {
  currentDate = todayISO();
  paint();
}

function paint() {
  const app = document.getElementById('app');
  const links = UrlStore.listByDate(currentDate);

  app.innerHTML = `
    <div class="screen-link-list screen">
      <div class="screen-header">
        <div class="title">링크</div>
        <div style="width:24px"></div>
      </div>

      <div class="day-nav">
        <button class="chev-btn" id="prev-day" aria-label="이전 일">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div class="day-label" id="day-label">${toKoreanDate(currentDate)}</div>
        <button class="chev-btn" id="next-day" aria-label="다음 일">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      ${links.length === 0
        ? `<div class="empty-state">이 날의 링크가 없어요</div>`
        : `<div class="link-cards">
            ${links.map(renderCard).join('')}
          </div>`}

      <button class="fab" id="add-link" aria-label="새 링크">+</button>
    </div>

    ${renderTabbar()}
  `;

  document.getElementById('prev-day').addEventListener('click', () => {
    currentDate = shiftDay(currentDate, -1);
    paint();
  });
  document.getElementById('next-day').addEventListener('click', () => {
    currentDate = shiftDay(currentDate, 1);
    paint();
  });
  document.getElementById('day-label').addEventListener('click', () => {
    openDatePicker(currentDate, (iso) => {
      currentDate = iso;
      paint();
    });
  });
  document.getElementById('add-link').addEventListener('click', () => {
    openLinkEditSheet({
      initialDate: currentDate,
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
