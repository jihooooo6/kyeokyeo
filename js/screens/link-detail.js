/* 켜켜 - K_IOS_APP_URL_002 링크 상세 (v1.3: 인앱 브라우저) */
import { navigate } from '../router.js';
import { showToast } from '../app.js';
import { UrlStore } from '../url-storage.js';
import { openLinkEditSheet } from '../components/link-edit-sheet.js';

/**
 * 링크 상세 - 인앱 브라우저 형태
 * iframe으로 임베드 시도, X-Frame-Options 차단 사이트는 폴백 안내 + 새 탭 열기
 * @param {string} id - 링크 id
 */
export function renderLinkDetail(id) {
  const link = UrlStore.get(id);
  if (!link) {
    navigate('/url');
    return;
  }

  paint(link);
}

function paint(link) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen-link-detail screen no-tab">
      <div class="link-detail-topbar">
        <button class="back-btn" id="back-btn" aria-label="목록으로">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <span>링크</span>
        </button>
        <div class="link-detail-actions">
          <button class="text-btn" id="edit-btn">수정</button>
          <button class="text-btn danger" id="delete-btn">삭제</button>
        </div>
      </div>

      <div class="link-detail-addressbar">
        <div class="addr-url" title="${escapeAttr(link.url)}">${escapeHtml(link.url)}</div>
        <button class="addr-action" id="open-external" aria-label="외부 브라우저로 열기" title="외부 브라우저로 열기">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </button>
        <button class="addr-action" id="share-btn" aria-label="공유">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
        </button>
      </div>

      <div class="link-detail-frame-wrap" id="frame-wrap">
        <iframe
          id="page-frame"
          class="link-detail-frame"
          src="${escapeAttr(link.url)}"
          referrerpolicy="no-referrer"
          loading="lazy"
        ></iframe>
        <div class="link-detail-hint">
          페이지가 비어 있다면 사이트가 인앱 표시를 막은 경우예요. 위의 외부 열기 아이콘으로 새 탭에서 열어보세요.
        </div>
      </div>
    </div>
  `;

  document.getElementById('back-btn').addEventListener('click', () => {
    navigate('/url');
  });
  document.getElementById('edit-btn').addEventListener('click', () => {
    openLinkEditSheet({
      id: link.id,
      onSaved: () => {
        const refreshed = UrlStore.get(link.id);
        if (refreshed) paint(refreshed);
        else navigate('/url');
      }
    });
  });
  document.getElementById('delete-btn').addEventListener('click', () => {
    if (!confirm('이 링크를 삭제하시겠어요?')) return;
    UrlStore.remove(link.id);
    showToast('삭제 되었습니다.', () => navigate('/url'));
  });
  document.getElementById('share-btn').addEventListener('click', () => share(link));
  document.getElementById('open-external').addEventListener('click', () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  });
}

async function share(link) {
  const shareData = {
    title: link.title || link.url,
    text: link.title || '',
    url: link.url
  };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (e) {
      // 사용자 취소나 실패 시 폴백
      if (e && e.name === 'AbortError') return;
    }
  }
  // 폴백 - 클립보드 복사
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(link.url);
      showToast('링크가 복사되었어요.');
      return;
    } catch (e) {}
  }
  alert('공유 기능을 사용할 수 없는 환경이에요. 주소창의 URL을 직접 복사해주세요.');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
