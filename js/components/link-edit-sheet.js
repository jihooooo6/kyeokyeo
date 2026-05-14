/* 켜켜 - 링크 추가/수정 바텀 시트 (기획서 v1.3 URL_002 디스크립션 1) */
import { UrlStore } from '../url-storage.js';
import { openDatePicker } from './date-picker.js';
import { toKoreanDate, todayISO } from '../date-utils.js';

let state = null;

/**
 * 링크 추가/수정 시트 열기
 * @param {Object} options
 * @param {string} [options.id] - 수정 모드일 때 링크 id
 * @param {string} [options.initialDate] - 추가 모드일 때 초기 날짜(없으면 오늘)
 * @param {() => void} options.onSaved - 저장 완료 시 콜백
 */
export function openLinkEditSheet({ id, initialDate, onSaved }) {
  closeLinkEditSheet();

  let date, url, title;
  if (id) {
    const existing = UrlStore.get(id);
    if (!existing) return;
    date = existing.date;
    url = existing.url;
    title = existing.title || '';
  } else {
    date = initialDate || todayISO();
    url = '';
    title = '';
  }

  state = { id, date, url, title, onSaved };

  const host = document.getElementById('toast-root');
  const wrapper = document.createElement('div');
  wrapper.className = 'link-sheet-overlay';
  wrapper.id = 'link-sheet';
  host.appendChild(wrapper);
  state.wrapper = wrapper;

  paint();
  requestAnimationFrame(() => wrapper.classList.add('show'));

  wrapper.addEventListener('click', (e) => {
    if (e.target === wrapper) closeLinkEditSheet();
  });
}

export function closeLinkEditSheet() {
  const el = document.getElementById('link-sheet');
  if (!el) return;
  el.classList.remove('show');
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 220);
  state = null;
}

function paint() {
  if (!state) return;
  const { wrapper, id, date, url, title } = state;
  const isEdit = !!id;

  wrapper.innerHTML = `
    <div class="link-sheet-panel" role="dialog" aria-label="${isEdit ? '링크 수정' : '링크 추가'}">
      <div class="link-sheet-header">
        <button class="text-btn left" data-act="cancel">취소</button>
        <div class="center-title">링크</div>
        <button class="text-btn right primary" data-act="save">저장</button>
      </div>

      <div class="link-sheet-body">
        <div class="link-sheet-date-row">
          <span class="icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="3" width="12" height="11" rx="1.5"></rect>
              <line x1="2" y1="6.5" x2="14" y2="6.5"></line>
              <line x1="5.5" y1="2" x2="5.5" y2="4.5"></line>
              <line x1="10.5" y1="2" x2="10.5" y2="4.5"></line>
            </svg>
          </span>
          <button class="date-trigger" data-act="date">
            <span>${toKoreanDate(date)}</span>
            <span aria-hidden="true">▾</span>
          </button>
        </div>

        <label class="field-label" for="sheet-url">링크 주소</label>
        <input
          id="sheet-url"
          type="url"
          inputmode="url"
          placeholder="https://"
          value="${escapeAttr(url)}"
          autocapitalize="off"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        />

        <label class="field-label" for="sheet-title">메모 (선택)</label>
        <input
          id="sheet-title"
          type="text"
          placeholder="페이지 제목이나 한 줄 메모"
          value="${escapeAttr(title)}"
        />
      </div>
    </div>
  `;

  wrapper.querySelector('[data-act="cancel"]').addEventListener('click', closeLinkEditSheet);
  wrapper.querySelector('[data-act="date"]').addEventListener('click', () => {
    openDatePicker(state.date, (iso) => {
      state.date = iso;
      paint();
    });
  });
  wrapper.querySelector('[data-act="save"]').addEventListener('click', () => {
    const urlInput = wrapper.querySelector('#sheet-url').value.trim();
    const titleInput = wrapper.querySelector('#sheet-title').value.trim();
    if (!urlInput) {
      alert('URL을 입력해주세요.');
      return;
    }
    const normalized = /^https?:\/\//i.test(urlInput) ? urlInput : 'https://' + urlInput;
    try {
      new URL(normalized);
    } catch (e) {
      alert('유효한 URL을 입력해주세요. (예: https://example.com)');
      return;
    }

    if (state.id) {
      UrlStore.update(state.id, { date: state.date, url: normalized, title: titleInput });
    } else {
      UrlStore.create({ date: state.date, url: normalized, title: titleInput });
    }
    const cb = state.onSaved;
    closeLinkEditSheet();
    if (cb) cb();
  });
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
