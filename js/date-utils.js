/* 켜켜 - 날짜 포맷 및 캘린더 계산 유틸 */

// YYYY-MM-DD 포맷
export function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// YYYY-MM 포맷
export function toYearMonth(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// "2026년 5월 13일" 한글 포맷
export function toKoreanDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

// "2026 - 05" 헤더 라벨 포맷
export function toMonthLabel(yyyymm) {
  const [y, m] = yyyymm.split('-');
  return `${y} - ${m}`;
}

// 현재 시각 기준 YYYY-MM-DD
export function todayISO() {
  return toISODate(new Date());
}

// 현재 시각 기준 YYYY-MM
export function todayYearMonth() {
  return toYearMonth(new Date());
}

// 월 이동: yyyymm + delta(개월)
export function shiftMonth(yyyymm, delta) {
  const [y, m] = yyyymm.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return toYearMonth(date);
}

// 일 이동: YYYY-MM-DD + delta(일)
export function shiftDay(iso, delta) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d + delta);
  return toISODate(date);
}

/**
 * 캘린더 그리드(월-일 7열) 계산
 * 기획서: 월 화 수 목 금 토 일 (월요일 시작)
 * @param {string} yyyymm
 * @returns {Array<{date: string|null, day: number|null}>} 7×N 그리드, 빈 칸은 null
 */
export function buildMonthGrid(yyyymm) {
  const [y, m] = yyyymm.split('-').map(Number);
  const firstDay = new Date(y, m - 1, 1);
  const lastDay = new Date(y, m, 0);
  const daysInMonth = lastDay.getDate();

  // 월요일 = 0, 일요일 = 6 으로 변환
  const jsDay = firstDay.getDay(); // 일=0, 월=1, ..., 토=6
  const mondayBased = (jsDay + 6) % 7;

  const cells = [];
  for (let i = 0; i < mondayBased; i++) {
    cells.push({ date: null, day: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      day: d
    });
  }
  // 마지막 주 마지막 칸까지 채우기
  while (cells.length % 7 !== 0) {
    cells.push({ date: null, day: null });
  }
  return cells;
}
