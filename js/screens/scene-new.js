/* 켜켜 - K_IOS_APP_GAL_002 장면 추가 */
import { navigate } from '../router.js';
import { renderTabbar, showToast } from '../app.js';
import { MediaStore } from '../media-storage.js';
import { todayISO } from '../date-utils.js';

export function renderSceneNew() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen-scene-new screen">
      <div class="scene-new-preview" id="preview-area">
        <span class="preview-hint">선택한 장면이 여기에 표시됩니다</span>
      </div>

      <div class="scene-new-options">
        <div class="section-title">장면 추가</div>

        <label class="scene-option" for="camera-input">
          <span class="icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </span>
          <span class="label">카메라로 찍기</span>
          <input id="camera-input" type="file" accept="image/*,video/*" capture="environment" hidden>
        </label>

        <label class="scene-option" for="gallery-input">
          <span class="icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <path d="M21 15l-5-5L5 21"></path>
            </svg>
          </span>
          <span class="label">갤러리에서 가져오기</span>
          <input id="gallery-input" type="file" accept="image/*,video/*" hidden>
        </label>

        <p class="scene-permission-hint">
          최초 선택 시 브라우저가 카메라/사진 접근 권한을 요청할 수 있어요. 거부하면 설정에서 권한을 허용해야 사용할 수 있습니다.
        </p>
      </div>
    </div>
    ${renderTabbar()}
  `;

  ['camera-input', 'gallery-input'].forEach((inputId) => {
    document.getElementById(inputId).addEventListener('change', (e) => handleFile(e.target.files));
  });
}

async function handleFile(files) {
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
      date: todayISO(),
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
