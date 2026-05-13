/* 켜켜 - K_IOS_APP_GAL_001 장면 전체 화면 (3×3 그리드) */
import { navigate } from '../router.js';
import { renderTabbar } from '../app.js';
import { MediaStore, blobToObjectURL, revokeObjectURL } from '../media-storage.js';
import {
  shiftMonth,
  todayYearMonth,
  toMonthLabel
} from '../date-utils.js';

let currentMonth = todayYearMonth();

// 화면 떠날 때 해제할 object URL 목록 (메모리 누수 방지)
let activeUrls = [];

function clearActiveUrls() {
  activeUrls.forEach(revokeObjectURL);
  activeUrls = [];
}

export async function renderSceneList() {
  clearActiveUrls();
  const app = document.getElementById('app');
  // 진입 직후 즉시 골격을 그려서 빈 화면을 막음
  app.innerHTML = `
    <div class="screen-scene-list screen">
      <div class="screen-header">
        <div class="title">장면</div>
        <div style="width:24px"></div>
      </div>
      <div class="month-nav">
        <button id="prev-month" aria-label="이전 달">&lt;</button>
        <div class="month-label">${toMonthLabel(currentMonth)}</div>
        <button id="next-month" aria-label="다음 달">&gt;</button>
      </div>
      <div id="scene-body" class="scene-body-loading">불러오는 중...</div>
      <button class="fab" id="add-scene" aria-label="장면 추가">+</button>
    </div>
    ${renderTabbar()}
  `;

  document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth = shiftMonth(currentMonth, -1);
    renderSceneList();
  });
  document.getElementById('next-month').addEventListener('click', () => {
    currentMonth = shiftMonth(currentMonth, 1);
    renderSceneList();
  });
  document.getElementById('add-scene').addEventListener('click', () => {
    navigate('/scene/new');
  });

  // 현재 월의 미디어 비동기 로드 후 그리드 렌더링
  let items;
  try {
    items = await MediaStore.listByMonth(currentMonth);
  } catch (e) {
    console.error('[scene-list]', e);
    document.getElementById('scene-body').innerHTML =
      '<div class="empty-state">불러오기에 실패했어요</div>';
    return;
  }

  const body = document.getElementById('scene-body');
  if (!body) return; // 화면이 이미 다른 데로 넘어갔으면 무시

  if (items.length === 0) {
    body.outerHTML = `<div class="empty-state">이 달의 장면이 없어요</div>`;
    return;
  }

  body.outerHTML = `
    <div class="scene-grid">
      ${items.map((m) => renderCell(m)).join('')}
    </div>
  `;

  document.querySelectorAll('.scene-cell').forEach((el) => {
    el.addEventListener('click', () => {
      navigate('/scene/' + el.getAttribute('data-id'));
    });
  });
}

function renderCell(item) {
  const url = blobToObjectURL(item.blob);
  activeUrls.push(url);
  const isVideo = item.type === 'video';
  return `
    <div class="scene-cell" data-id="${item.id}">
      ${isVideo
        ? `<video src="${url}" muted preload="metadata" playsinline></video>
           <div class="play-overlay" aria-hidden="true">
             <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
               <path d="M8 5v14l11-7z"></path>
             </svg>
           </div>`
        : `<img src="${url}" alt="" loading="lazy">`
      }
    </div>
  `;
}
