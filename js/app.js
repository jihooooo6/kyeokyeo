/* 켜켜 - 앱 부트스트랩 */
import { addRoute, startRouter, navigate } from './router.js';
import { renderLaunch } from './screens/launch.js';
import { renderHome } from './screens/home.js';
import { renderMemoList } from './screens/memo-list.js';
import { renderMemoDetail } from './screens/memo-detail.js';
import { renderMemoNew } from './screens/memo-new.js';
import { renderSceneList } from './screens/scene-list.js';
import { renderSceneDetail } from './screens/scene-detail.js';
import { renderSceneNew } from './screens/scene-new.js';

// 라우트 등록
addRoute('/', () => renderLaunch());
addRoute('/home', () => renderHome());
addRoute('/memo', () => renderMemoList());
addRoute('/memo/new', (_p, q) => renderMemoNew(q.date));
addRoute('/memo/:id', (p) => renderMemoDetail(p.id));
addRoute('/scene', () => renderSceneList());
addRoute('/scene/new', () => renderSceneNew());
addRoute('/scene/:id', (p) => renderSceneDetail(p.id));
addRoute('/url', () => renderPlaceholder('URL', '링크 모아보기는 추후 추가될 예정이에요.'));
addRoute('/settings', () => renderPlaceholder('설정', '설정 화면은 친구의 추가 기획 후 만들어요.'));

function renderPlaceholder(title, desc) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen-placeholder">
      <div class="title">${title}</div>
      <div class="desc">${desc}</div>
    </div>
    ${renderTabbar()}
  `;
  bindTabbar();
}

// 탭바 (홈/메모/장면/URL) - 공통 모듈 형태로 export
export function renderTabbar() {
  const path = location.hash.slice(1) || '/';
  const tabs = [
    { href: '#/home', label: '홈', match: ['/home', '/'] },
    { href: '#/memo', label: '메모', match: ['/memo'] },
    { href: '#/scene', label: '장면', match: ['/scene'] },
    { href: '#/url', label: 'URL', match: ['/url'] }
  ];
  return `
    <nav class="tabbar">
      ${tabs.map((t) => {
        const active = t.match.some((m) => path === m || path.startsWith(m + '/')) ? 'active' : '';
        return `<a href="${t.href}" class="${active}">${t.label}</a>`;
      }).join('')}
    </nav>
  `;
}

// 탭바 클릭 - 이미 활성 탭을 다시 눌러도 재렌더가 되도록 navigate() 경유
document.body.addEventListener('click', (e) => {
  const link = e.target.closest('.tabbar a');
  if (!link) return;
  const href = link.getAttribute('href') || '';
  if (!href.startsWith('#')) return;
  e.preventDefault();
  navigate(href.slice(1));
});

export function bindTabbar() {}

// 토스트 알럿 - "저장 되었습니다", "삭제 되었습니다"
export function showToast(message, onClose) {
  const root = document.getElementById('toast-root');
  root.innerHTML = `
    <div class="toast-overlay show" id="toast-overlay">
      <div class="toast">
        <button class="close" id="toast-close" aria-label="닫기">×</button>
        <div class="message">${message}</div>
      </div>
    </div>
  `;
  const close = () => {
    const overlay = document.getElementById('toast-overlay');
    if (overlay) overlay.classList.remove('show');
    setTimeout(() => {
      root.innerHTML = '';
      if (onClose) onClose();
    }, 200);
  };
  document.getElementById('toast-close').addEventListener('click', close);
  setTimeout(close, 1400);
}

// 라우터 시작
startRouter();

// 서비스 워커 등록 - file:// 환경에서는 동작 안함
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((err) => {
      console.warn('[sw] register failed:', err);
    });
  });
}

// 사용자가 직접 #로 진입한 경우 처리
if (!location.hash || location.hash === '#') {
  navigate('/');
}
