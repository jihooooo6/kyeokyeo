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
import { renderLinkList } from './screens/link-list.js';
import { renderLinkDetail } from './screens/link-detail.js';

// 라우트 등록
addRoute('/', () => renderLaunch());
addRoute('/home', () => renderHome());
addRoute('/memo', () => renderMemoList());
addRoute('/memo/new', (_p, q) => renderMemoNew(q.date));
addRoute('/memo/:id', (p) => renderMemoDetail(p.id));
addRoute('/scene', () => renderSceneList());
addRoute('/scene/new', (_p, q) => renderSceneNew(q.date));
addRoute('/scene/:id', (p) => renderSceneDetail(p.id));
addRoute('/url', () => renderLinkList());
addRoute('/url/:id', (p) => renderLinkDetail(p.id));
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

// 탭바 아이콘 - lucide 스타일 SVG
const TAB_ICONS = {
  home: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"></path></svg>`,
  memo: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  scene: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
  link: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`
};

// 탭바 (홈/메모/장면/링크) - 공통 모듈 형태로 export
export function renderTabbar() {
  const path = location.hash.slice(1) || '/';
  const tabs = [
    { href: '#/home', label: '홈', icon: TAB_ICONS.home, match: ['/home', '/'] },
    { href: '#/memo', label: '메모', icon: TAB_ICONS.memo, match: ['/memo'] },
    { href: '#/scene', label: '장면', icon: TAB_ICONS.scene, match: ['/scene'] },
    { href: '#/url', label: '링크', icon: TAB_ICONS.link, match: ['/url'] }
  ];
  return `
    <nav class="tabbar">
      ${tabs.map((t) => {
        const active = t.match.some((m) => path === m || path.startsWith(m + '/')) ? 'active' : '';
        return `
          <a href="${t.href}" class="tab ${active}">
            <span class="tab-icon">${t.icon}</span>
            <span class="tab-label">${t.label}</span>
          </a>
        `;
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
