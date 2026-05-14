/* 켜켜 - K_IOS_APP_GAL_002 장면 추가 (v1.2.1: 단일 진입점) */
import { navigate } from '../router.js';
import { renderTabbar, showToast } from '../app.js';
import { MediaStore } from '../media-storage.js';
import { todayISO } from '../date-utils.js';

/**
 * 장면 추가 화면
 * 기존 카메라/갤러리 두 버튼이 iOS 네이티브 메뉴(보관함/촬영/파일)와 중복돼서
 * 단일 진입점(`장면 추가하기`)으로 통합. accept="image/*,video/*" 만 두면
 * iOS가 알아서 보관함/촬영/파일을 골라서 띄움.
 * @param {string} [dateParam] - 캘린더에서 날짜를 골라 진입한 경우의 ISO 날짜
 */
export function renderSceneNew(dateParam) {
  const targetDate = dateParam || todayISO();
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen-scene-new screen">
      <div class="scene-new-preview" id="preview-area">
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
          <span class="label">장면 추가하기</span>
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
    handleFile(e.target.files, targetDate);
  });
}

async function handleFile(files, targetDate) {
  if (!files || !files[0]) return;
  const file = files[0];
  const type = file.type.startsWith('video/') ? 'video' :
               file.type.startsWith('image/') ? 'image' : null;
  if (!type) {
    alert('이미지나 동영상만 선택 가능해요.');
    return;
  }

  // 사용자에게 미리보기 즉시 제공
  const previewUrl = URL.createObjectURL(file);
  const preview = document.getElementById('preview-area');
  preview.innerHTML = type === 'video'
    ? `<video src="${previewUrl}" controls playsinline></video>`
    : `<img src="${previewUrl}" alt="">`;

  try {
    // 파일 자체를 그대로 Blob으로 저장 (File은 Blob의 서브클래스)
    await MediaStore.create({
      date: targetDate,
      type,
      blob: file,
      mimeType: file.type
    });
    showToast('저장 되었습니다.', () => {
      URL.revokeObjectURL(previewUrl);
      navigate('/scene');
    });
  } catch (e) {
    console.error('[scene-new]', e);
    alert('저장에 실패했어요. 콘솔 로그를 확인해주세요.');
  }
}
