/* 켜켜 - 해시 기반 SPA 라우터 */
const routes = [];

/**
 * 라우트 등록
 * @param {string|RegExp} pattern - 정적 경로(예: "/home") 또는 동적 경로(예: "/memo/:id")
 * @param {Function} handler - (params, query) => void
 */
export function addRoute(pattern, handler) {
  if (typeof pattern === 'string') {
    const keys = [];
    const regexStr = pattern.replace(/:([^/]+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    });
    routes.push({ regex: new RegExp(`^${regexStr}$`), keys, handler });
  } else {
    routes.push({ regex: pattern, keys: [], handler });
  }
}

// 현재 해시 경로(예: "#/memo/abc?x=1") -> { path, query }
function parseHash() {
  let hash = location.hash || '#/';
  if (!hash.startsWith('#')) hash = '#/' + hash;
  const raw = hash.slice(1) || '/';
  const [path, qs] = raw.split('?');
  const query = {};
  if (qs) {
    qs.split('&').forEach((p) => {
      const [k, v = ''] = p.split('=');
      if (k) query[decodeURIComponent(k)] = decodeURIComponent(v);
    });
  }
  return { path: path || '/', query };
}

function dispatch() {
  const { path, query } = parseHash();
  for (const r of routes) {
    const match = path.match(r.regex);
    if (match) {
      const params = {};
      r.keys.forEach((k, i) => { params[k] = decodeURIComponent(match[i + 1]); });
      try {
        r.handler(params, query);
      } catch (err) {
        console.error('[router] handler error:', err);
      }
      return;
    }
  }
  // 매칭 실패 시 홈으로
  navigate('/home');
}

// 프로그램적 이동
export function navigate(path) {
  if (location.hash === '#' + path) {
    dispatch();
  } else {
    location.hash = '#' + path;
  }
}

// 라우터 시작
export function startRouter() {
  window.addEventListener('hashchange', dispatch);
  dispatch();
}

// 현재 경로 (탭바 활성 표시 등에 사용)
export function currentPath() {
  return parseHash().path;
}
