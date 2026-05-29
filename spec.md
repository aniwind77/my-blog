# 픽셀 아트 에디터 구현 Spec

## 1. 추가/수정할 파일 목록

| 파일 | 역할 | 신규/수정 |
|---|---|---|
| `games/pixel-art.html` | 에디터 페이지 HTML 뼈대 | 신규 |
| `css/pixel-art.css` | 에디터 전용 레이아웃 및 스타일 | 신규 |
| `js/pixel-art.js` | 에디터 전체 로직 (ES module) | 신규 |
| `index.html` | 헤더 nav에 픽셀 아트 링크 추가 | 수정 |
| `games/2048.html` | 헤더 nav에 픽셀 아트 링크 추가 | 수정 |

---

## 2. 각 파일별 구현 세부사항

### 2-1. `games/pixel-art.html`

**주요 ID/class**:
```
#pixel-canvas     — <canvas> 512×512 (16셀 × 32px)
.editor-layout    — 좌(캔버스) + 우(팔레트) flex 래퍼
.canvas-area      — 캔버스 + 툴바 컨테이너
.toolbar          — 상단 도구 버튼 행
#btn-eraser       — 지우개 토글
#btn-grid         — 격자선 토글
#btn-clear        — 전체 지우기
#btn-save         — PNG 저장
.palette-panel    — 우측 색상 팔레트 패널
.palette-grid     — 색상 스와치 그리드
.swatch           — 개별 색상 버튼 (32개, JS 생성)
#color-preview    — 현재 선택 색상 미리보기
#color-custom     — <input type="color"> 커스텀 피커
.tool-active      — 활성 도구 버튼 클래스
.swatch-active    — 활성 스와치 클래스
```

### 2-2. `css/pixel-art.css`

- `.editor-layout`: `display: flex; gap: 1.5rem; align-items: flex-start`
- `.palette-panel`: `flex: 0 0 160px`
- `#pixel-canvas`: `cursor: crosshair; touch-action: none; max-width: min(512px, 90vw); height: auto`
- `.toolbar button` 기본/hover/`.tool-active` 스타일
- `.palette-grid`: `grid-template-columns: repeat(4, 1fr); gap: 4px`
- `.swatch`: `aspect-ratio: 1; border: 2px solid transparent`; hover scale(1.15)
- `@media (max-width: 640px)`: layout column, palette-grid 8열

### 2-3. `js/pixel-art.js`

**상수**:
```
GRID_SIZE = 16
CELL_SIZE = 32   (canvas.width = GRID_SIZE * CELL_SIZE = 512)
PALETTE   = 32색 배열 (흑백4 + 기본12 + 파스텔8 + 형광8)
```

**상태**:
```
pixels[]      — string[256], '' = 빈 셀, '#rrggbb' = 채워진 셀
currentColor  — string (현재 선택 색상)
eraserMode    — boolean
showGrid      — boolean (초기 true)
isPainting    — boolean
```

**함수 목록**:

| 함수 | 역할 |
|---|---|
| `init()` | initTheme, buildPalette, 이벤트 등록, renderAll |
| `buildPalette()` | swatch 버튼 동적 생성 |
| `selectColor(hex)` | currentColor 갱신, preview 업데이트, swatch-active 이동, 지우개 해제 |
| `getCanvasPos(e)` | 클라이언트 좌표 → canvas 좌표 (scale 보정 포함) |
| `getPixelIndex(x, y)` | canvas 좌표 → pixels 배열 인덱스 |
| `paint(e)` | isPainting 체크 → pixels 갱신 → drawCell |
| `drawCell(idx)` | 단일 셀 재렌더 |
| `drawGrid()` | showGrid가 true일 때 격자선 그리기 |
| `renderAll()` | 전체 셀 재렌더 + drawGrid |
| `toggleEraser()` | eraserMode 토글 + btn-eraser active 클래스 |
| `toggleGrid()` | showGrid 토글 + renderAll |
| `clearAll()` | pixels.fill('') + renderAll |
| `saveAsPng()` | 오프스크린 캔버스로 격자선 없는 PNG 저장 |

**핵심 로직**:

- `getCanvasPos`: `rect = canvas.getBoundingClientRect()`, `scaleX = canvas.width / rect.width`, `canvasX = (clientX - rect.left) * scaleX`
- `paint`: mouseup/touchend에서 `drawGrid()` 한 번 호출 (매 paint마다 호출 안 함)
- `saveAsPng`: `document.createElement('canvas')` → 격자선 없이 픽셀만 렌더 → `toDataURL('image/png')` → `<a download="pixel-art.png">` 트릭

**이벤트 흐름**:
```
mousedown  → isPainting=true  → paint
mousemove  → paint (isPainting 체크)
mouseup    → isPainting=false → drawGrid
mouseleave → isPainting=false → drawGrid

touchstart → isPainting=true  → paint(touches[0]) + preventDefault
touchmove  → paint(touches[0]) + preventDefault
touchend   → isPainting=false → drawGrid
```

### 2-4. 네비게이션 수정

`index.html`, `games/2048.html` 양쪽 `.site-nav`에 픽셀 아트 링크 추가.

---

## 3. 화면 레이아웃

```
┌──────────────────────────────────────────────────────────┐
│  My Blog       [2048] [픽셀 아트]              [🌙]      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  픽셀 아트                                               │
│  16×16 격자에 도트를 찍어 그림을 그려보세요.            │
│                                                          │
│  ┌─ canvas-area ─────────────────┐  ┌─ palette (160px)─┐│
│  │ [지우개][격자선][전체지우기]  │  │ ┌──────────────┐ ││
│  │ [저장]                        │  │ │color-preview │ ││
│  │ ┌──────────────────────────┐  │  │ └──────────────┘ ││
│  │ │                          │  │  │ [color-custom]   ││
│  │ │     pixel-canvas         │  │  │                  ││
│  │ │     (512×512, 16×16)     │  │  │ ■ ■ ■ ■  (4열)  ││
│  │ │                          │  │  │ ■ ■ ■ ■  32색   ││
│  │ └──────────────────────────┘  │  │ ■ ■ ■ ■         ││
│  └───────────────────────────────┘  └──────────────────┘│
└──────────────────────────────────────────────────────────┘
```

---

## 4. 구현 순서

1. `css/pixel-art.css` — 레이아웃, 캔버스, 툴바, 팔레트 스타일
2. `games/pixel-art.html` — HTML 골격
3. `js/pixel-art.js` — 상수/상태 → buildPalette → drawCell/renderAll → 이벤트 → saveAsPng → init
4. `index.html`, `games/2048.html` — 네비게이션 링크 추가

---

## 주의사항

- `saveAsPng`: 메인 canvas 아닌 별도 canvas 사용 → 격자선 PNG 포함 방지
- `getCanvasPos`: scale 보정 필수 (CSS 축소 시 좌표 오프셋)
- touch 이벤트: `{ passive: false }` + `preventDefault()` (스크롤 방지)
- theme.js import 경로: `'../js/theme.js'` (games/ 디렉터리 기준)
