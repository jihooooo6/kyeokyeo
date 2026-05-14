/* 켜켜 - 연/월 선택 모달 (브라우저 input[type=month]의 호환성 문제 회피) */

let state = null;

/**
 * 연/월 선택 모달 열기
 * @param {string} initialYm - "YYYY-MM" 형식
 * @param {(ym: string) => void} onSelect - 선택 시 콜백
 */
export function openMonthPicker(initialYm, onSelect) {
  closeMonthPicker();

  const [initY, initM] = initialYm.split('-').map(Number);
  state = {
    viewYear: initY,
    selY: initY,
    selM: initM,
    onSelect
  };

  const host = document.getElementById('toast-root');
  const wrapper = document.createElement('div');
  wrapper.className = 'month-picker-overlay';
  wrapper.id = 'month-picker';
  host.appendChild(wrapper);
  state.wrapper = wrapper;

  paint();
  requestAnimationFrame(() => wrapper.classList.add('show'));

  wrapper.addEventListener('click', (e) => {
    if (e.target === wrapper) closeMonthPicker();
  });
}

export function closeMonthPicker() {
  const el = document.getElementById('month-picker');
  if (!el) return;
  el.classList.remove('show');
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 180);
  state = null;
}

function paint() {
  if (!state) return;
  const { wrapper, viewYear, selY, selM } = state;
  wrapper.innerHTML = `
    <div class="month-picker-panel" role="dialog" aria-label="연/월 선택">
      <div class="month-picker-head">
        <button class="chev-btn" data-act="prev-year" aria-label="이전 해">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div class="month-picker-year">${viewYear}</div>
        <button class="chev-btn" data-act="next-year" aria-label="다음 해">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
      <div class="month-picker-grid">
        ${Array.from({ length: 12 }, (_, i) => {
          const m = i + 1;
          const isSelected = viewYear === selY && m === selM;
          return `<button class="month-cell ${isSelected ? 'selected' : ''}" data-month="${m}">${m}월</button>`;
        }).join('')}
      </div>
      <button class="month-picker-cancel" data-act="cancel">취소</button>
    </div>
  `;

  wrapper.querySelector('[data-act="prev-year"]').addEventListener('click', () => {
    state.viewYear -= 1;
    paint();
  });
  wrapper.querySelector('[data-act="next-year"]').addEventListener('click', () => {
    state.viewYear += 1;
    paint();
  });
  wrapper.querySelectorAll('.month-cell').forEach((b) =>
    b.addEventListener('click', () => {
      const m = Number(b.getAttribute('data-month'));
      const ym = `${state.viewYear}-${String(m).padStart(2, '0')}`;
      const cb = state.onSelect;
      closeMonthPicker();
      cb(ym);
    })
  );
  wrapper.querySelector('[data-act="cancel"]').addEventListener('click', closeMonthPicker);
}
