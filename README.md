# 켜켜 (kyeokyeo)

> Every day, another piece - 날짜별로 메모·장면·URL을 타입별로 분리해서 쌓아 올리는 개인 아카이브 앱

[라이브 데모](https://jihooooo6.github.io/kyeokyeo/) - 브라우저에서 바로 사용 가능

---

## 컨셉

"켜켜이 쌓다"는 한국어 표현에서 따온 이름입니다. 매일 한 조각씩 기록을 쌓아 올린다는 의미예요. 일반 메모 앱처럼 한 곳에 모든 게 섞이는 대신, **캘린더가 중심**에 있고 **메모·사진/동영상·URL**이 타입별로 분리되어 보관됩니다.

---

## 주요 기능

| 영역 | 내용 |
|------|------|
| 메인(캘린더) | 오늘 기록 요약(메모/장면/URL 최신 1건씩) + 월별 캘린더. 기록이 있는 날엔 도트 표시 |
| 메모 | 첫 줄을 자동으로 제목 처리. 월별 카드 리스트 |
| 장면 | 사진·동영상 3×3 그리드. 카메라/갤러리에서 즉시 추가 |
| URL | 링크를 날짜와 함께 저장. 짧은 메모 첨부 가능 |
| 빈 상태 | 오늘 기록이 없으면 + 버튼 한 번으로 바텀 시트에서 종류 선택 |
| 오프라인 | PWA Service Worker로 정적 자원 캐싱. 비행기 모드에서도 동작 |

---

## 데이터 보관 방식

> 본인이 입력한 모든 데이터는 **본인 브라우저에만 저장**되며 외부로 전송되지 않습니다.

| 데이터 | 위치 |
|--------|------|
| 메모 | 브라우저의 localStorage |
| 사진·동영상 | 브라우저의 IndexedDB (Blob 그대로) |
| URL | 브라우저의 localStorage |

같은 PC + 같은 브라우저로 다시 접속해야 자기 기록이 보입니다. 다른 브라우저나 다른 PC에는 동기화되지 않습니다.

---

## 기술 스택

- **언어**: Vanilla HTML / CSS / JavaScript (ES Modules)
- **라우팅**: 해시 기반 SPA 라우터 (자체 구현)
- **저장소**: localStorage + IndexedDB
- **PWA**: Web App Manifest + Service Worker
- **애니메이션**: [lottie-web](https://github.com/airbnb/lottie-web) (런치 스크린 로고)
- **빌드 도구**: 없음 (브라우저가 ES Modules 직접 처리)

---

## 폴더 구조

```
make-won-app/
├─ index.html
├─ manifest.json              # PWA 메타정보
├─ service-worker.js          # 오프라인 캐싱
├─ assets/
│  └─ lottie/                 # Lottie 애니메이션 자원
├─ css/
│  ├─ tokens.css              # 색상 변수
│  ├─ base.css                # 공통 레이아웃·탭바·토스트
│  └─ screens.css             # 화면별 스타일
└─ js/
   ├─ app.js                  # 부트스트랩, 라우트 등록
   ├─ router.js               # 해시 라우터
   ├─ storage.js              # localStorage 메모 CRUD
   ├─ media-storage.js        # IndexedDB 미디어 CRUD
   ├─ url-storage.js          # localStorage URL CRUD
   ├─ date-utils.js           # 날짜 포맷·캘린더 계산
   ├─ vendor/
   │  └─ lottie.min.js        # Lottie 라이브러리
   ├─ components/
   │  └─ bottom-sheet.js      # 바텀 시트 컴포넌트
   └─ screens/
      ├─ launch.js            # 런치 스크린
      ├─ home.js              # 메인 (캘린더 + 오늘 요약)
      ├─ memo-list.js         # 메모 전체
      ├─ memo-detail.js       # 메모 상세
      ├─ memo-new.js          # 새 메모 작성
      ├─ scene-list.js        # 장면 그리드
      ├─ scene-detail.js      # 장면 전체화면 뷰
      ├─ scene-new.js         # 장면 추가
      └─ url-new.js           # URL 입력
```

---

## 라우팅

| 해시 경로 | 화면 |
|----------|------|
| `#/` | 런치 스크린 (약 3초 후 자동으로 `#/home`) |
| `#/home` | 메인 (오늘 요약 + 캘린더) |
| `#/memo` | 메모 전체 |
| `#/memo/new` | 새 메모 작성 (`?date=YYYY-MM-DD` 쿼리로 날짜 지정 가능) |
| `#/memo/:id` | 메모 상세 |
| `#/scene` | 장면 3×3 그리드 |
| `#/scene/new` | 장면 추가 (카메라/갤러리) |
| `#/scene/:id` | 장면 전체화면 뷰 |
| `#/url/new` | URL 입력 |
| `#/url` | URL 전체 (기획 진행 중) |
| `#/settings` | 설정 (기획 진행 중) |

---

## 로컬에서 실행하기

ES Modules 보안 정책상 `index.html`을 더블클릭하면 작동하지 않습니다. 로컬 HTTP 서버가 필요해요.

### 방법 1. Node.js가 있을 경우

```bash
npx --yes serve@latest -l 5173 .
```

브라우저에서 <http://localhost:5173> 접속.

### 방법 2. Python이 있을 경우

```bash
python -m http.server 5173
```

### 방법 3. VS Code 사용

VS Code 확장 "Live Server"를 설치하고 `index.html` 우클릭 → "Open with Live Server".

---

## PWA로 설치하기

### iOS (사파리)

1. 사파리로 [사이트](https://jihooooo6.github.io/kyeokyeo/) 접속
2. 하단 공유 버튼(네모 + 화살표) 탭
3. "홈 화면에 추가" 선택
4. 홈 화면 아이콘 탭하면 풀스크린으로 실행

### Android (Chrome)

1. Chrome으로 사이트 접속
2. 주소창 우측 메뉴 → "앱 설치" 또는 "홈 화면에 추가"

### Desktop (Chrome/Edge)

1. 브라우저로 사이트 접속
2. 주소창 우측 설치 아이콘 클릭

---

## 데이터 초기화

브라우저의 개발자 도구(F12) 콘솔에 입력:

```javascript
localStorage.removeItem('kyeokyeo.memos.v1');
localStorage.removeItem('kyeokyeo.urls.v1');
indexedDB.deleteDatabase('kyeokyeo');
location.reload();
```

---

## 디자인 토큰

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-bg-ivory` | `#F5F0E8` | 런치 배경 |
| `--color-accent-deep` | `#5C52B8` | 타이틀, 포인트 |
| `--color-accent` | `#7F77DD` | 액션 버튼, 활성 탭 |
| `--color-tint` | `#EEEDFE` | 카드 배경, 도트 |
| `--color-badge-scene-bg` | `#E1F5EE` | 장면 뱃지 |
| `--color-badge-url-bg` | `#E6F1FB` | URL 뱃지 |
| `--color-bg-scene` | `#2E2B3D` | 사진 전체화면 배경 |

---

## 차수별 진행 상황

- 1차: 런치 + 캘린더 + 메모 3종
- 2차: 장면(사진/동영상) 기능 + IndexedDB 도입
- 3차 a: 메인 화면에 오늘 기록 요약 영역 신설, URL 저장소, 바텀 시트
- 로고: Lottie 애니메이션 통합
- 3차 b (예정): URL 전체/상세, 캘린더 상세 화면

---

## 기획

- 기획: 올리브
- 기획서 버전: v1.2

---

## 라이선스

미정 (개인 프로젝트)
