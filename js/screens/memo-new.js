/* 켜켜 - K_IOS_APP_MMO_003 새 메모 작성 */
import { navigate } from '../router.js';
import { showToast } from '../app.js';
import { MemoStore } from '../storage.js';
import { toKoreanDate, todayISO } from '../date-utils.js';

export function renderMemoNew(initialDate) {
  const app = document.getElementById('app');
  // 쿼리로 전달된 날짜가 있으면 그걸, 없으면 오늘
  const date = initialDate || todayISO();

  app.innerHTML = `
    <div class="screen-memo-new screen no-tab">
      <div class="compose-header">
        <button class="text-btn left" id="cancel-btn">취소</button>
        <div class="center-title">메모</div>
        <button class="text-btn right primary" id="save-btn">저장</button>
      </div>

      <div class="date-row">
        <span class="icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="3" width="12" height="11" rx="1.5"></rect>
            <line x1="2" y1="6.5" x2="14" y2="6.5"></line>
            <line x1="5.5" y1="2" x2="5.5" y2="4.5"></line>
            <line x1="10.5" y1="2" x2="10.5" y2="4.5"></line>
          </svg>
        </span>
        <span class="date-trigger" id="date-trigger">
          <span id="date-label">${toKoreanDate(date)}</span>
          <span aria-hidden="true">▾</span>
          <input type="date" id="date-input" value="${date}" />
        </span>
      </div>

      <div class="compose-body">
        <textarea id="content-input" placeholder="내용을 입력하세요"></textarea>
      </div>
    </div>
  `;

  let currentDate = date;

  document.getElementById('cancel-btn').addEventListener('click', () => {
    navigate('/memo');
  });

  document.getElementById('date-input').addEventListener('change', (e) => {
    if (e.target.value) {
      currentDate = e.target.value;
      document.getElementById('date-label').textContent = toKoreanDate(currentDate);
    }
  });

  document.getElementById('save-btn').addEventListener('click', () => {
    const content = document.getElementById('content-input').value.trim();
    if (!content) {
      // 빈 메모는 저장하지 않음
      alert('내용을 입력해주세요.');
      return;
    }
    MemoStore.create({ date: currentDate, content });
    showToast('저장 되었습니다.', () => navigate('/memo'));
  });

  // 본문 textarea 자동 포커스 - 키보드 노출 시도
  setTimeout(() => {
    const ta = document.getElementById('content-input');
    if (ta) ta.focus();
  }, 50);
}
