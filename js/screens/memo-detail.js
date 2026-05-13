/* 켜켜 - K_IOS_APP_MMO_002 메모 상세 */
import { navigate } from '../router.js';
import { renderTabbar, showToast } from '../app.js';
import { MemoStore } from '../storage.js';
import { toKoreanDate } from '../date-utils.js';

let editMode = false;

export function renderMemoDetail(id) {
  // 해당 ID 메모 단건 조회
  const memo = MemoStore.get(id);
  const app = document.getElementById('app');

  if (!memo) {
    app.innerHTML = `
      <div class="screen-memo-detail screen">
        <div class="detail-header">
          <button class="back-btn" id="back-btn">&lt; 메모</button>
        </div>
        <div class="empty-state">메모를 찾을 수 없어요</div>
      </div>
      ${renderTabbar()}
    `;
    document.getElementById('back-btn').addEventListener('click', () => navigate('/memo'));
    return;
  }

  app.innerHTML = `
    <div class="screen-memo-detail screen">
      <div class="detail-header">
        <button class="back-btn" id="back-btn">&lt; 메모</button>
      </div>

      <div class="memo-date-big">${toKoreanDate(memo.date)}</div>

      ${editMode
        ? `<textarea class="memo-body-edit" id="edit-body">${escapeForTextarea(memo.content)}</textarea>`
        : `<div class="memo-body">${escapeHtml(memo.content)}</div>`
      }

      <div class="action-row">
        ${editMode
          ? `<button class="btn-outline" id="cancel-btn">취소</button>
             <button class="btn-outline" id="save-btn" style="color: var(--color-accent); font-weight:600;">저장</button>`
          : `<button class="btn-outline" id="edit-btn">수정</button>
             <button class="btn-outline danger" id="delete-btn">삭제</button>`
        }
      </div>
    </div>

    ${renderTabbar()}
  `;

  document.getElementById('back-btn').addEventListener('click', () => {
    editMode = false;
    navigate('/memo');
  });

  if (editMode) {
    document.getElementById('cancel-btn').addEventListener('click', () => {
      editMode = false;
      renderMemoDetail(id);
    });
    document.getElementById('save-btn').addEventListener('click', () => {
      const newContent = document.getElementById('edit-body').value;
      MemoStore.update(id, { content: newContent });
      editMode = false;
      showToast('저장 되었습니다.', () => renderMemoDetail(id));
    });
    // 편집 textarea에 자동 포커스 + 커서 마지막 위치
    const ta = document.getElementById('edit-body');
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
  } else {
    document.getElementById('edit-btn').addEventListener('click', () => {
      editMode = true;
      renderMemoDetail(id);
    });
    document.getElementById('delete-btn').addEventListener('click', () => {
      // 삭제 확인 후 처리
      if (!confirm('이 메모를 삭제할까요?')) return;
      MemoStore.remove(id);
      showToast('삭제 되었습니다.', () => navigate('/memo'));
    });
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

function escapeForTextarea(str) {
  // textarea 안의 텍스트는 &, <만 이스케이프
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;');
}
