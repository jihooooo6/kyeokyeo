/* 켜켜 - K_IOS_APP_GAL_002/003 장면 추가 (v1.3: 미리보기 컨펌 단계 추가) */
import { navigate } from '../router.js';
import { renderTabbar, showToast } from '../app.js';
import { MediaStore } from '../media-storage.js';
import { todayISO } from '../date-utils.js';

// 현재 화면의 미리보기 상태
let pendingFile = null;
let pendingType = null;
let pendingUrl = null;
let pendingDate = null;

function clearPending() {
  if (pendingUrl) {
    try { URL.revokeObjectURL(pendingUrl); } catch (e) {}
  }
  pendingFile = null;
  pendingType = null;
  pendingUrl = null;
  pendingDate = null;
}

/**
 * 장면 추가 화면
 * 갤러리/카메라 선택 → 미리보기 화면(컨펌) → 저장 → 장면 탭으로 이동
 * @param {string} [dateParam] - 캘린더에서 날짜를 골라 진입한 경우의 ISO 날짜
 */
export function renderSceneNew(dateParam) {
  clearPending();
  pendingDate = dateParam || todayISO();
  renderSelect();
}

function renderSelect() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen-scene-new screen">
      <div class="scene-new-preview">
        <span class="preview-hint">선택한 장면이 여기에 표시됩니다</span>
      </div>

      <div class="scene-new-options">
        <div class="section-title">장면 추가</div>

        <label class="scene-option" for="media-input">
          <span class="icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <path d="M21 15l-5-5L5 21"></path>
            </svg>
          </span>
          <span class="label">갤러리에서 가져오기</span>
          <input id="media-input" type="file" accept="image/*,video/*" hidden>
        </label>

        <p class="scene-permission-hint">
          탭하면 사진 보관함 / 촬영 / 파일 선택을 한 화면에서 고를 수 있어요.
          최초 1회 사진/카메라 접근 권한이 필요해요.
        </p>
      </div>
    </div>
    ${renderTabbar()}
  `;

  document.getElementById('media-input').addEventListener('change', (e) => {
    handleFileSelected(e.target.files);
  });
}

function handleFileSelected(files) {
  if (!files || !files[0]) return;
  const file = files[0];
  const type = file.type.startsWith('video/') ? 'video' :
               file.type.startsWith('image/') ? 'image' : null;
  if (!type) {
    alert('이미지나 동영상만 선택 가능해요.');
    return;
  }

  pendingFile = file;
  pendingType = type;
  pendingUrl = URL.createObjectURL(file);

  renderConfirm();
}

// K_IOS_APP_GAL_003 - 선택한 사진/동영상 미리보기 + 취소/저장
function renderConfirm() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen-scene-confirm screen no-tab">
      <div class="scene-confirm-media">
        ${pendingType === 'video'
          ? `<video src="${pendingUrl}" controls playsinline></video>`
          : `<img src="${pendingUrl}" alt="">`
        }
      </div>
      <div class="scene-confirm-actions">
        <button class="btn-outline" id="cancel-btn">취소</button>
        <button class="btn-outline primary" id="save-btn">저장</button>
      </div>
    </div>
  `;

  document.getElementById('cancel-btn').addEventListener('click', () => {
    clearPending();
    renderSelect();
  });

  document.getElementById('save-btn').addEventListener('click', saveAndExit);
}

async function saveAndExit() {
  if (!pendingFile) return;
  try {
    await MediaStore.create({
      date: pendingDate,
      type: pendingType,
      blob: pendingFile,
      mimeType: pendingFile.type
    });
    const savedUrl = pendingUrl;
    pendingUrl = null; // revoke는 showToast 이후
    clearPending();
    showToast('저장 되었습니다.', () => {
      if (savedUrl) {
        try { URL.revokeObjectURL(savedUrl); } catch (e) {}
      }
      navigate('/scene');
    });
  } catch (e) {
    console.error('[scene-new]', e);
    alert('저장에 실패했어요. 콘솔 로그를 확인해주세요.');
  }
}
