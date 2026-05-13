/* 켜켜 - URL 입력 화면 (기획서 미정의, 임시 구성) */
import { navigate } from '../router.js';
import { showToast } from '../app.js';
import { UrlStore } from '../url-storage.js';
import { toKoreanDate, todayISO } from '../date-utils.js';

export function renderUrlNew(initialDate) {
  const app = document.getElementById('app');
  const date = initialDate || todayISO();

  app.innerHTML = `
    <div class="screen-url-new screen no-tab">
      <div class="compose-header">
        <button class="text-btn left" id="cancel-btn">취소</button>
        <div class="center-title">URL</div>
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

      <div class="url-form">
        <label class="field-label" for="url-input">링크 주소</label>
        <input
          id="url-input"
          type="url"
          inputmode="url"
          placeholder="https://"
          autocapitalize="off"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        />

        <label class="field-label" for="title-input">메모 (선택)</label>
        <input
          id="title-input"
          type="text"
          placeholder="이 링크에 대한 설명"
        />

        <p class="form-hint">
          기획서 v1.2에 URL 입력 화면 명세가 아직 정의되지 않아 임시로 만든 화면입니다. 친구의 추가 기획 후 최종 디자인이 적용될 예정입니다.
        </p>
      </div>
    </div>
  `;

  let currentDate = date;

  document.getElementById('cancel-btn').addEventListener('click', () => {
    history.length > 1 ? history.back() : navigate('/home');
  });

  document.getElementById('date-input').addEventListener('change', (e) => {
    if (e.target.value) {
      currentDate = e.target.value;
      document.getElementById('date-label').textContent = toKoreanDate(currentDate);
    }
  });

  document.getElementById('save-btn').addEventListener('click', () => {
    const urlInput = document.getElementById('url-input').value.trim();
    const titleInput = document.getElementById('title-input').value.trim();
    if (!urlInput) {
      alert('URL을 입력해주세요.');
      return;
    }
    // 간단한 URL 형식 검증
    const normalized = /^https?:\/\//i.test(urlInput) ? urlInput : 'https://' + urlInput;
    try {
      new URL(normalized);
    } catch (e) {
      alert('유효한 URL을 입력해주세요. (예: https://example.com)');
      return;
    }

    UrlStore.create({ date: currentDate, url: normalized, title: titleInput });
    showToast('저장 되었습니다.', () => navigate('/home'));
  });

  setTimeout(() => {
    const el = document.getElementById('url-input');
    if (el) el.focus();
  }, 50);
}
