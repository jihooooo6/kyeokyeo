/* 켜켜 - K_IOS_APP_MAN_001 런치 스크린 */
import { navigate } from '../router.js';

// 현재 재생 중인 Lottie 인스턴스 (정리용)
let currentAnim = null;

export function renderLaunch() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen-launch screen no-tab">
      <div class="title-block">
        <div class="app-name">'켜켜'</div>
        <div class="tagline">Every day, another piece</div>
      </div>
      <div class="logo-slot" id="logo-slot" aria-hidden="true"></div>
    </div>
  `;

  // Lottie 애니메이션 로드 - lottie 전역 객체가 있을 때만
  const container = document.getElementById('logo-slot');
  if (container && typeof window.lottie !== 'undefined') {
    try {
      if (currentAnim) {
        currentAnim.destroy();
        currentAnim = null;
      }
      currentAnim = window.lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: './assets/lottie/kyeokyeo-logo.json'
      });
    } catch (e) {
      console.warn('[launch] lottie load failed:', e);
    }
  }

  // 약 3초 후 자동으로 메인(캘린더)으로 이동
  // (Lottie 한 사이클 약 4초이나 자연스러운 마무리 타이밍에 맞춤)
  setTimeout(() => {
    if (location.hash === '#/' || location.hash === '#') {
      if (currentAnim) {
        try { currentAnim.destroy(); } catch (e) {}
        currentAnim = null;
      }
      navigate('/home');
    }
  }, 3000);
}
