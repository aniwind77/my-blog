# 2048 게임 구현 리뷰

## 결과: PASS (경미한 권고사항 있음)

---

## 확인된 문제

### [BUG] `checkGameState` — 2048 달성 후 게임 오버 체크 누락 (js/2048.js, 116~128번째 줄)

`won = true` 상태에서는 `checkGameState`가 `board.includes(2048)` 조건을 건너뛰어 게임 오버 체크(`canMove()`)도 함께 건너뜁니다. 2048 달성 이후 계속 플레이하다 더 이상 이동할 수 없는 상황이 되어도 게임 오버 오버레이가 표시되지 않습니다.

```js
// 현재 코드
function checkGameState() {
    if (!won && board.includes(2048)) {   // won=true면 이 블록 전체 skip
        won = true
        saveBest()
        showMessage('win')
        return
    }
    if (!canMove()) {                      // won=true일 때 도달하지 못함
        over = true
        saveBest()
        showMessage('over')
    }
}
```

수정 방법:

```js
function checkGameState() {
    if (!won && board.includes(2048)) {
        won = true
        saveBest()
        showMessage('win')
        return          // win 오버레이 표시 후 리턴 (계속 플레이는 허용)
    }
    if (!canMove()) {   // won 여부와 무관하게 항상 확인
        over = true
        saveBest()
        showMessage('over')
    }
}
```

---

## 검토 항목별 결과

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | 이동 로직 (ArrowLeft/Right/Up/Down) | ✅ | `getLines`에서 방향별로 인덱스 순서를 올바르게 뒤집음 |
| 2 | 합치기 로직 — 이중 합치기 방지 | ✅ | `merge`에서 합친 직후 `i++`로 건너뜀 (js/2048.js 55번째 줄) |
| 3 | 점수 계산 | ✅ | `line[i] *= 2` 이후 증가된 값(`line[i]`)을 `score`에 누적 |
| 4 | spawnTile — 빈 칸 스폰 + 90%/10% | ✅ | `empties` 배열 필터링 후 랜덤 선택, `Math.random() < 0.9 ? 2 : 4` |
| 5 | canMove — 이동 가능 여부 | ✅ | 빈 칸 존재 및 인접 동일값 확인 모두 처리 |
| 6 | checkGameState — 2048 달성 / 게임 오버 | ⚠️ | 2048 달성 후 계속 플레이 시 게임 오버 미감지 (위 BUG 항목 참조) |
| 7 | localStorage — best score 저장/불러오기 | ✅ | `initGame`에서 불러오기, `saveBest`에서 갱신 후 저장 |
| 8 | 터치 스와이프 방향 판별 | ✅ | `Math.abs(dx) > Math.abs(dy)`로 축 우선순위 결정, 10px 임계값 |
| 9 | 게임 오버 후 입력 차단 (`over && !won`) | ✅ | keydown·touchend 양쪽에서 동일 조건 사용 |
| 10 | 2048 달성 후 계속 플레이 가능 | ✅ | `over && !won` 조건이므로 `won=true`이면 입력 차단되지 않음 |
| 11 | id/class 이름 JS↔HTML 일치 | ✅ | `board`, `score-display`, `best-display`, `game-message`, `game-message-text`, `new-game-btn`, `retry-btn` 모두 일치 |
| 12 | 타일 CSS 클래스 정의 완비 | ✅ | `tile-2` ~ `tile-2048`, `tile-super` 모두 정의 (css/2048.css 143~154번째 줄) |
| 13 | 다크모드 변수 재정의 | ✅ | `[data-theme="dark"]` 및 `@media (prefers-color-scheme: dark)` 양쪽에서 타일 색상 재정의 |
| 14 | 반응형 (max-width: 480px) | ✅ | `board` 크기·gap·padding·글자 크기 조정 모두 적용 |
| 15 | game-message 오버레이 위치 | ✅ | `.board-wrapper { position: relative }`, `.game-message { position: absolute; inset: 0 }` |
| 16 | theme.js import 경로 | ✅ | `import { initTheme } from './theme.js'` — js/ 기준 상대 경로 |
| 17 | HTML에서 CSS/JS 경로 | ✅ | `../css/style.css`, `../css/2048.css`, `../js/theme.js`, `../js/2048.js` — games/ 기준 `../` |
| 18 | index.html 네비 링크 | ✅ | `href="games/2048.html"` — 루트 기준 정확 |

---

## 권고사항

1. **[필수] `checkGameState` 게임 오버 체크 조건 수정** — 위 BUG 항목 수정안 적용. `won=true` 이후에도 `!canMove()` 체크가 실행되어야 합니다.

2. **[선택] 2048 달성 후 계속 플레이 UI 개선** — 현재 2048 달성 오버레이에 "다시 시도" 버튼만 있습니다. "계속 플레이" 버튼을 별도로 추가하면 사용자가 오버레이를 닫고 계속할 수 있습니다. 지금은 오버레이가 표시된 채로 입력이 허용되는 상태입니다.

3. **[선택] `compress` 함수에서 `push` 대신 `padEnd` 방식 고려** — `while (filtered.length < 4) filtered.push(0)` 은 항상 정확히 동작하지만, 4×4 이외 크기 확장 시 하드코딩된 `4`가 유지보수 부담이 됩니다. 현재 구현 범위에서는 문제없습니다.

4. **[선택] `render`에서 타일 교체 방식** — 현재 매 렌더마다 기존 타일 DOM을 제거하고 새로 생성합니다. 이동 애니메이션(CSS transition)을 추가할 계획이 있다면 DOM 재사용 혹은 CSS animation 클래스 방식 도입이 필요합니다.
