/* 켜켜 - IndexedDB 미디어 저장소 (사진·동영상 Blob) */
const DB_NAME = 'kyeokyeo';
const DB_VERSION = 1;
const STORE = 'media';

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
  return dbPromise;
}

function tx(mode = 'readonly') {
  return openDB().then((db) => db.transaction(STORE, mode).objectStore(STORE));
}

function newId() {
  return 's_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function req2promise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const MediaStore = {
  // 미디어 추가 - Blob과 메타 정보 저장
  async create({ date, type, blob, mimeType }) {
    const store = await tx('readwrite');
    const now = Date.now();
    const item = {
      id: newId(),
      date,           // YYYY-MM-DD
      type,           // 'image' | 'video'
      blob,           // File / Blob
      mimeType,
      createdAt: now,
      updatedAt: now
    };
    await req2promise(store.add(item));
    return item;
  },

  // 단건 조회
  async get(id) {
    const store = await tx();
    return req2promise(store.get(id));
  },

  // 특정 연/월(YYYY-MM)에 속하는 미디어 (createdAt 내림차순)
  async listByMonth(yyyymm) {
    const store = await tx();
    return new Promise((resolve, reject) => {
      const items = [];
      const cursorReq = store.openCursor();
      cursorReq.onerror = () => reject(cursorReq.error);
      cursorReq.onsuccess = (e) => {
        const cursor = e.target.result;
        if (!cursor) {
          items.sort((a, b) => b.createdAt - a.createdAt);
          resolve(items);
          return;
        }
        const v = cursor.value;
        if (v.date && v.date.startsWith(yyyymm)) items.push(v);
        cursor.continue();
      };
    });
  },

  // 기록(미디어) 있는 날짜 집합 - 캘린더 도트 표시용
  async recordedDatesInMonth(yyyymm) {
    const items = await this.listByMonth(yyyymm);
    const set = new Set();
    items.forEach((m) => set.add(m.date));
    return set;
  },

  // 날짜 수정
  async updateDate(id, newDate) {
    const store = await tx('readwrite');
    const existing = await req2promise(store.get(id));
    if (!existing) return null;
    existing.date = newDate;
    existing.updatedAt = Date.now();
    await req2promise(store.put(existing));
    return existing;
  },

  // 삭제
  async remove(id) {
    const store = await tx('readwrite');
    await req2promise(store.delete(id));
    return true;
  }
};

/**
 * Blob → object URL 생성 (한 번 쓰고 폐기)
 * 사용 후 revokeObjectURL로 해제 권장
 */
export function blobToObjectURL(blob) {
  return URL.createObjectURL(blob);
}

export function revokeObjectURL(url) {
  try { URL.revokeObjectURL(url); } catch (e) {}
}
