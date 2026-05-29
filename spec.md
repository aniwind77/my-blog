# spec.md — 2048 게임 페이지 구현 명세

## 1. 추가/수정할 파일 목록

| 파일 | 역할 |
|------|------|
| `games/2048.html` | 2048 게임 단독 페이지 (새 파일) |
| `css/2048.css` | 게임 전용 스타일 (새 파일) |
| `js/2048.js` | 게임 로직 + UI 제어 (새 파일) |
| `index.html` | 헤더 네비게이션에 "2048" 링크 추가 (기존 파일 수정) |
| `css/style.css` | `.site-nav`, `.nav-link` 스타일 추가 (기존 파일 수정) |

---

## 2. 각 파일별 구현 세부사항

### 2-1. `games/2048.html`

기존 `index.html` / `post.html`과 동일한 헤더·푸터 구조를 유지한다.

```
DOCTYPE → html[lang="ko"]
  head
    meta charset, viewport
    title "2048 — My Blog"
    link css/style.css
    link css/2048.css
  body
    header.site-header
      .container
        a.site-title "My Blog" → ../index.html
        nav.site-nav
          a.nav-link "2048" → 2048.html
        button#theme-toggle
    main
      .container
        .game-header
          h1 "2048"
          p.game-desc "같은 숫자 타일을 합쳐 2048을 만드세요!"
        .scoreboard
          .score-box
            span.score-label "점수"
            span.score-value#score-display "0"
          .score-box
            span.score-label "최고"
            span.score-value#best-display "0"
        .game-controls
          button#new-game-btn "새 게임"
        .board-wrapper
          .board#board          ← 16개 .cell 자식 (4×4)
          .game-message#game-message
            p#game-message-text
            button#retry-btn "다시 시도"
    footer.site-footer
    script type="module" src="../js/theme.js"
    script type="module" src="../js/2048.js"
```

---

### 2-2. `css/2048.css`

기존 CSS 변수(`--bg`, `--bg-surface`, `--text`, `--accent`, `--border`)를 활용한다.

#### 추가 CSS 변수

```
--tile-empty:  var(--bg-surface)
--tile-2:      #eee4da  / dark: #3a3530
--tile-4:      #ede0c8  / dark: #47403a
--tile-8:      #f2b179  / dark: #8f4f20
--tile-16:     #f59563  / dark: #a0471a
--tile-32:     #f67c5f  / dark: #b03c22
--tile-64:     #f65e3b  / dark: #c0301a
--tile-128:    #edcf72  / dark: #9b8a1e
--tile-256:    #edcc61  / dark: #a09020
--tile-512:    #edc850  / dark: #a09420
--tile-1024:   #edc53f  / dark: #9c9020
--tile-2048:   #edc22e  / dark: #b09000
--tile-super:  #3c3a32  / dark: #c0b050
--tile-text-light: #776e65
--tile-text-dark:  #f9f6f2
```

다크모드 변수는 `[data-theme="dark"]` 및 `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` 두 곳에 선언한다.

#### 레이아웃

```
.scoreboard      — display: flex, gap: 0.75rem, margin-bottom: 1rem
.score-box       — background: var(--bg-surface), border: 1px solid var(--border)
                   border-radius: 8px, padding: 0.5rem 1rem, min-width: 80px, text-align: center
.score-label     — font-size: 0.7rem, text-transform: uppercase, color: var(--text-muted)
.score-value     — font-size: 1.25rem, font-weight: 700

.game-controls   — margin-bottom: 1rem
#new-game-btn    — background: var(--accent), color: #fff, border: none
                   border-radius: 8px, padding: 0.5rem 1.25rem, cursor: pointer

.board-wrapper   — position: relative
.board           — display: grid, grid-template-columns: repeat(4, 1fr)
                   gap: 10px, padding: 10px
                   background: var(--border), border-radius: 10px
                   width: min(460px, 92vw)

.cell            — background: var(--tile-empty), border-radius: 6px
                   aspect-ratio: 1/1, position: relative

.tile            — position: absolute, inset: 0
                   display: flex, align-items: center, justify-content: center
                   border-radius: 6px, font-weight: 700

.game-message    — position: absolute, inset: 0, border-radius: 10px
                   display: none (기본), flex (visible 시)
                   align-items: center, justify-content: center, flex-direction: column
.game-message.visible — display: flex

타일 폰트 크기:
  .fs-md (1~3자리): 1.75rem
  .fs-sm (4자리):   1.25rem
  .fs-xs (5자리+):  1rem

@media (max-width: 480px): gap/padding 7px, 폰트 일괄 축소
```

---

### 2-3. `js/2048.js`

`type="module"` 스크립트.

#### 상수

```js
const STORAGE_KEY_BEST = '2048-best'
const SIZE = 16
```

#### 상태

```js
let board   // number[16], 0 = 빈 칸
let score
let best
let over
let won
```

#### 핵심 함수

**initGame()**
- board = Array(16).fill(0), score/over/won 초기화
- best = localStorage 읽기
- spawnTile() × 2, render(), hideMessage()

**spawnTile()**
- 빈 칸 목록에서 랜덤 선택, 90% 확률로 2, 10%로 4 배치

**move(dir)**
- 방향별로 4개 선(line) 추출 → compress → merge → compress → 기록
- LEFT: 행별 col 0→3, RIGHT: 행별 col 3→0, UP: 열별 row 0→3, DOWN: 열별 row 3→0
- 변경 있으면 spawnTile() → render() → checkGameState()

**compress(line)**: 0 제거 후 앞으로 정렬, 뒤 0 패딩

**merge(line)**: 인접 동일값 합치기, score 누적, 같은 타일 이중 합치기 방지

**checkGameState()**
- 2048 있으면 won = true, showMessage('win'), saveBest()
- canMove() false면 over = true, showMessage('over'), saveBest()

**canMove()**: 빈 칸 있거나 인접 동일값 있으면 true

**render()**
- board 순회, .tile div 생성하여 .cell에 append
- 값에 따라 tile-N 클래스 부여 (>2048은 tile-super)
- 자릿수에 따라 fs-md/fs-sm/fs-xs 클래스 부여
- 점수판 업데이트

**이벤트 리스너**
- keydown: ArrowUp/Down/Left/Right → move()
- touchstart/touchend: dx, dy 10px 이상 시 방향 판별 후 move()
- #new-game-btn, #retry-btn: initGame()

---

### 2-4. `index.html` + `css/style.css` 수정

헤더에 `<nav class="site-nav"><a href="games/2048.html" class="nav-link">2048</a></nav>` 추가.

`css/style.css`에 추가:
```css
.site-nav { display: flex; gap: 1rem; }
.nav-link { font-size: 0.9rem; color: var(--text-muted); }
.nav-link:hover { color: var(--accent); text-decoration: none; }
```

---

## 3. 화면 레이아웃

```
┌─────────────────────────────────────────┐
│  My Blog      [2048]          [🌙]      │
├─────────────────────────────────────────┤
│  2048                                   │
│  같은 숫자 타일을 합쳐 2048을 만드세요!    │
│                                         │
│  ┌──────┐  ┌──────┐                     │
│  │ 점수  │  │ 최고  │                     │
│  │  0   │  │  0   │                     │
│  └──────┘  └──────┘                     │
│                                         │
│  [새 게임]                               │
│                                         │
│  ┌────────────────────────────┐         │
│  │ ┌───┐ ┌───┐ ┌───┐ ┌───┐  │         │
│  │ │   │ │   │ │   │ │   │  │         │
│  │ └───┘ └───┘ └───┘ └───┘  │         │
│  │         …(4×4)…           │         │
│  └────────────────────────────┘         │
│     (게임 오버/달성 시 오버레이)           │
└─────────────────────────────────────────┘
```

---

## 4. 구현 순서

1. `css/2048.css` — 레이아웃, 보드, 타일 색상, 오버레이, 반응형
2. `games/2048.html` — HTML 골격, 16개 `.cell`, 스크립트 로드
3. `js/2048.js` — initGame/render → move → checkGameState → 이벤트
4. `index.html` + `css/style.css` — 네비게이션 링크 추가
