/* 켜켜 - K_IOS_APP_MAN_001 런치 스크린 */
import { navigate } from '../router.js';

export function renderLaunch() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen-launch screen no-tab">
      <div class="title-block">
        <div class="app-name">'켜켜'</div>
        <div class="tagline">Every day, another piece</div>
      </div>
      <div class="logo-slot" aria-hidden="true"></div>
    </div>
  `;

  // 1.5초 후 자동으로 메인(캘린더)으로 이동
  setTimeout(() => {
    if (location.hash === '#/' || location.hash === '#') {
      navigate('/home');
    }
  }, 1500);
}
