/* 켜켜 - 재사용 가능 바텀 시트 컴포넌트 */

/**
 * 바텀 시트 열기
 * @param {Object} options
 * @param {string} options.title - 시트 상단 제목
 * @param {Array<{label, sublabel?, onClick}>} options.actions - 옵션 목록
 */
export function openBottomSheet({ title, actions }) {
  // 기존 시트가 있다면 먼저 정리
  closeBottomSheet();

  const host = document.getElementById('toast-root');
  const wrapper = document.createElement('div');
  wrapper.className = 'bottom-sheet-overlay';
  wrapper.id = 'bottom-sheet';
  wrapper.innerHTML = `
    <div class="bottom-sheet-panel" role="dialog" aria-label="${escapeHtml(title || '')}">
      ${title ? `<div class="bottom-sheet-title">${escapeHtml(title)}</div>` : ''}
      <div class="bottom-sheet-actions">
        ${actions.map((a, i) => `
          <button class="bottom-sheet-action" data-idx="${i}">
            <span class="label">${escapeHtml(a.label)}</span>
            ${a.sublabel ? `<span class="sublabel">${escapeHtml(a.sublabel)}</span>` : ''}
          </button>
        `).join('')}
      </div>
      <button class="bottom-sheet-cancel" id="bottom-sheet-cancel">취소</button>
    </div>
  `;
  host.appendChild(wrapper);

  // 트랜지션을 위해 다음 프레임에 show 클래스 추가
  requestAnimationFrame(() => wrapper.classList.add('show'));

  // 액션 클릭
  wrapper.querySelectorAll('.bottom-sheet-action').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-idx'));
      const action = actions[idx];
      closeBottomSheet();
      if (action && typeof action.onClick === 'function') action.onClick();
    });
  });

  // 취소 / 배경 클릭으로 닫기
  document.getElementById('bottom-sheet-cancel').addEventListener('click', closeBottomSheet);
  wrapper.addEventListener('click', (e) => {
    if (e.target === wrapper) closeBottomSheet();
  });
}

export function closeBottomSheet() {
  const el = document.getElementById('bottom-sheet');
  if (!el) return;
  el.classList.remove('show');
  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 200);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
