/* 켜켜 - localStorage 메모 저장소 래퍼 */
const STORAGE_KEY = 'kyeokyeo.memos.v1';

function loadAll() {
  // 메모 전체 목록 로드
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data.memos) ? data.memos : [];
  } catch (e) {
    return [];
  }
}

function saveAll(memos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ memos }));
}

function newId() {
  return 'm_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export const MemoStore = {
  // 전체 메모 목록 (날짜 내림차순)
  list() {
    const memos = loadAll();
    return memos.slice().sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.createdAt - a.createdAt;
    });
  },

  // 특정 연/월(YYYY-MM)에 속하는 메모 목록
  listByMonth(yyyymm) {
    return this.list().filter((m) => m.date.startsWith(yyyymm));
  },

  // 특정 ID의 메모 단건 조회
  get(id) {
    return loadAll().find((m) => m.id === id) || null;
  },

  // 특정 날짜의 가장 최신 1건 (오늘 요약 영역용)
  latestOnDate(date) {
    const same = loadAll()
      .filter((m) => m.date === date)
      .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
    return same[0] || null;
  },

  // 메모 생성
  create({ date, content }) {
    const memos = loadAll();
    const now = Date.now();
    const memo = {
      id: newId(),
      date,
      content,
      createdAt: now,
      updatedAt: now
    };
    memos.push(memo);
    saveAll(memos);
    return memo;
  },

  // 메모 수정
  update(id, patch) {
    const memos = loadAll();
    const idx = memos.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    memos[idx] = { ...memos[idx], ...patch, updatedAt: Date.now() };
    saveAll(memos);
    return memos[idx];
  },

  // 메모 삭제
  remove(id) {
    const memos = loadAll();
    const next = memos.filter((m) => m.id !== id);
    saveAll(next);
    return memos.length !== next.length;
  },

  // 기록(메모) 있는 날짜 집합 - 캘린더 도트 표시용
  recordedDatesInMonth(yyyymm) {
    const set = new Set();
    this.listByMonth(yyyymm).forEach((m) => set.add(m.date));
    return set;
  }
};
