/* 켜켜 - localStorage 기반 URL 저장소 */
const STORAGE_KEY = 'kyeokyeo.urls.v1';

function loadAll() {
  // URL 전체 목록 로드
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data.urls) ? data.urls : [];
  } catch (e) {
    return [];
  }
}

function saveAll(urls) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ urls }));
}

function newId() {
  return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export const UrlStore = {
  // 전체 URL (날짜 내림차순)
  list() {
    const urls = loadAll();
    return urls.slice().sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.createdAt - a.createdAt;
    });
  },

  // 특정 연/월(YYYY-MM)에 속하는 URL 목록
  listByMonth(yyyymm) {
    return this.list().filter((u) => u.date.startsWith(yyyymm));
  },

  // 특정 일자(YYYY-MM-DD)의 URL 목록 (최근 작성 순)
  listByDate(iso) {
    return this.list().filter((u) => u.date === iso);
  },

  // 특정 날짜의 가장 최신 1건 (오늘 요약 영역용)
  latestOnDate(date) {
    const same = loadAll()
      .filter((u) => u.date === date)
      .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
    return same[0] || null;
  },

  // 단건 조회
  get(id) {
    return loadAll().find((u) => u.id === id) || null;
  },

  // URL 생성
  create({ date, url, title }) {
    const urls = loadAll();
    const now = Date.now();
    const item = {
      id: newId(),
      date,
      url,
      title: title || '',
      createdAt: now,
      updatedAt: now
    };
    urls.push(item);
    saveAll(urls);
    return item;
  },

  // URL 수정
  update(id, patch) {
    const urls = loadAll();
    const idx = urls.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    urls[idx] = { ...urls[idx], ...patch, updatedAt: Date.now() };
    saveAll(urls);
    return urls[idx];
  },

  // URL 삭제
  remove(id) {
    const urls = loadAll();
    const next = urls.filter((u) => u.id !== id);
    saveAll(next);
    return urls.length !== next.length;
  },

  // 기록 있는 날짜 집합 - 캘린더 도트 표시용
  recordedDatesInMonth(yyyymm) {
    const set = new Set();
    this.listByMonth(yyyymm).forEach((u) => set.add(u.date));
    return set;
  }
};
