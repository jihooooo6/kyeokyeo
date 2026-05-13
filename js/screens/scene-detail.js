/* 켜켜 - 장면 상세(전체화면 뷰) - 사진/동영상 공통 */
import { navigate } from '../router.js';
import { showToast } from '../app.js';
import { MediaStore, blobToObjectURL, revokeObjectURL } from '../media-storage.js';
import { toKoreanDate } from '../date-utils.js';

let currentObjectUrl = null;

function cleanup() {
  if (currentObjectUrl) {
    revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

export async function renderSceneDetail(id) {
  cleanup();
  const app = document.getElementById('app');
  let item;
  try {
    item = await MediaStore.get(id);
  } catch (e) {
    console.error('[scene-detail]', e);
  }

  if (!item) {
    app.innerHTML = `
      <div class="screen-scene-detail no-tab screen" style="background:#2E2B3D;color:#fff;">
        <div class="scene-detail-bar">
          <button class="back-btn" id="back-btn" style="color:#fff;">&lt; 장면</button>
        </div>
        <div class="empty-state" style="color:#cfc8e0;">장면을 찾을 수 없어요</div>
      </div>
    `;
    document.getElementById('back-btn').addEventListener('click', () => navigate('/scene'));
    return;
  }

  const isVideo = item.type === 'video';
  const url = blobToObjectURL(item.blob);
  currentObjectUrl = url;

  app.innerHTML = `
    <div class="screen-scene-detail screen no-tab ${isVideo ? 'is-video' : 'is-image'}">
      <div class="scene-detail-bar top">
        <button class="back-btn" id="back-btn">&lt; 장면</button>
        <button class="text-btn danger" id="delete-btn">삭제</button>
      </div>

      <div class="scene-detail-media">
        ${isVideo
          ? `<video src="${url}" controls playsinline></video>`
          : `<img src="${url}" alt="">`
        }
      </div>

      <div class="scene-detail-bar bottom">
        <span class="date-trigger" id="date-trigger">
          <span id="date-label">${toKoreanDate(item.date)}</span>
          <input type="date" id="date-input" value="${item.date}">
        </span>
      </div>
    </div>
  `;

  document.getElementById('back-btn').addEventListener('click', () => {
    cleanup();
    navigate('/scene');
  });

  document.getElementById('delete-btn').addEventListener('click', async () => {
    if (!confirm('이 장면을 삭제할까요?')) return;
    await MediaStore.remove(id);
    showToast('삭제 되었습니다.', () => {
      cleanup();
      navigate('/scene');
    });
  });

  document.getElementById('date-input').addEventListener('change', async (e) => {
    const v = e.target.value;
    if (!v) return;
    await MediaStore.updateDate(id, v);
    document.getElementById('date-label').textContent = toKoreanDate(v);
    showToast('저장 되었습니다.');
  });
}
