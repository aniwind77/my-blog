---
invocation: manual
---

# webapp-harness

이 프로젝트의 작업 하네스를 불러옵니다. 새 기능을 개발하거나 리뷰 루프를 돌릴 때 이 스킬을 먼저 호출해 컨텍스트를 설정하세요.

---

## 1. 프로젝트 개요

- **종류**: 정적 파일 개인 블로그 (서버 없음)
- **루트**: `/Users/aniwind/Desktop/Claude/my-blog/`
- **배포**: GitHub Pages (main 브랜치 push = 즉시 반영)
- **구조**:
  ```
  index.html          — 포스트 목록
  post.html           — 포스트 뷰어
  css/style.css       — 글로벌 CSS 변수·레이아웃 (모든 웹앱이 참조)
  js/theme.js         — 다크모드 토글 (ES module, 공유)
  js/main.js          — 포스트 목록 렌더
  js/post.js          — 마크다운 파싱·렌더
  games/2048.html     — 2048 게임
  games/pixel-art.html — 픽셀 아트 에디터
  css/2048.css        — 2048 전용
  css/pixel-art.css   — 픽셀 아트 전용
  js/2048.js          — 2048 로직 (ES module)
  js/pixel-art.js     — 픽셀 아트 로직 (ES module)
  posts/              — 마크다운 포스트 + index.json
  scripts/            — 빌드 스크립트 (index.json 생성 등)
  ```

---

## 2. 기술 스택

| 영역 | 선택 | 비고 |
|------|------|------|
| 마크업 | 순수 HTML5 | 프레임워크 없음 |
| 스타일 | 순수 CSS3 | CSS 변수, Flexbox, Grid |
| 스크립트 | 순수 JS ES modules | 번들러 없음, `type="module"` |
| 마크다운 렌더 | marked.js (CDN) | `window.marked.parse()` |
| 신택스 하이라이팅 | highlight.js (CDN) | 테마를 `theme.js`에서 동적 교체 |
| 다크모드 | CSS 변수 + localStorage | `data-theme` attribute |
| 빌드 | 없음 | GitHub Actions 또는 수동 scripts/ 실행 |

### CSS 변수 (모든 웹앱이 반드시 참조)
```css
--bg            /* 배경 */
--bg-surface    /* 카드·패널 배경 */
--text          /* 본문 텍스트 */
--text-muted    /* 보조 텍스트 */
--accent        /* 링크·강조 */
--border        /* 경계선 */
```
`css/style.css`에 정의. 신규 웹앱은 독자적인 색상값 대신 이 변수를 사용한다.

### 코드 컨벤션
- 들여쓰기: **탭**
- 문자열: **싱글 쿼트**
- 세미콜론: **없음**
- 주석: 비자명한 동작에만 (what이 아니라 why)

---

## 3. 작업 사이클

```
Plan → Work → Review → Commit
```

### Plan
- 서브에이전트를 생성해 `spec.md`를 작성시킨다.
- 사용자 승인 후 Work 단계로 진행한다. 승인 없이 구현 시작 금지.

### Work
- 서브에이전트를 생성해 구현한다.
- 화면이 3개 이상이면 화면별로 서브에이전트를 나눈다.
- 서브에이전트에게 전용 지침 파일(`.claude/instructions/<name>.md`)을 만들어 전달한다.
- 각 서브에이전트는 지침 파일에 명시된 범위만 수정한다 (범위 중복 금지).

### Review
- 서브에이전트를 생성해 테스트하고 `review.md`를 작성시킨다.
- 이후 Gemini 리뷰 루프를 돌린다 (아래 §4 참조).

### Commit
- 기능마다 git commit 후 GitHub push.
- 커밋 메시지: 한국어, 제목 + 빈 줄 + 변경 내용 bullet.
- `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>` 항상 포함.

### 웹앱 추가 규칙
- 모든 웹앱에 **사용법 안내 문구** 포함 (`.editor-hint` 또는 `<p>` 등).
- 다크모드 필수: `theme.js`의 `initTheme()` 호출, CSS 변수 사용.
- games/ 하위 HTML의 CSS/JS 경로는 `../css/`, `../js/` 기준.

---

## 4. Gemini 리뷰 루프

신기능 구현 후 `review.md` 작성이 끝나면 Gemini 헤드리스 리뷰를 돌린다.

### 실행 방법
```bash
# 프로젝트 루트에서
gemini -p "<프롬프트>" --yolo
```

### 표준 리뷰 프롬프트
```
Please do a thorough code review of this web blog project.
Review all HTML, CSS, and JavaScript files.
Look for: bugs, logic errors, security issues (XSS, injection),
accessibility problems (missing alt, ARIA, keyboard nav),
CSS issues (broken layouts, missing dark mode variables),
JS issues (error handling, edge cases, memory leaks, event listener cleanup),
cross-browser compatibility, and any other code quality issues.
Be specific with file names and line numbers where possible.
Format your response as a structured markdown report.
```

### 결과 처리
1. 출력을 `gemini-review.md`에 저장.
2. 각 항목을 검토해 **수정 / 스킵(이유 명시) / 오진단** 중 하나로 분류.
3. 타당한 지적은 즉시 수정, 스킵 항목은 이유를 `gemini-review.md` 하단에 기록.
4. 수정 후 커밋.

### 스킵 판단 기준
- 개인 블로그 특성상 외부 업로드 경로가 없는 XSS → 스킵 가능
- 게임 전용 페이지의 의도된 키보드 동작 → 스킵 가능
- 복잡한 알고리즘 교체가 필요한 UX 개선 → 별도 태스크로 분리

---

## 5. 퍼미션 설정 (`.claude/settings.json`)

현재 설정:

```json
{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(npm test)",
      "Bash(npx live-server*)"
    ],
    "deny": [
      "Bash(rm -rf*)",
      "Bash(sudo *)",
      "Bash(sudo)",
      "Bash(chmod 777*)",
      "Bash(git push --force*)",
      "Bash(git push -f*)",
      "Bash(git reset --hard*)",
      "Edit(.claude/settings.json)",
      "Write(.claude/settings.json)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "curl/wget 파이프 실행 차단 훅 (settings.json 참조)"
          }
        ]
      }
    ]
  }
}
```

**추가 허용이 필요한 경우**: `/update-config` 스킬 사용 또는 `.claude/settings.json` 직접 편집 (단, settings.json 자체는 deny 목록에 있으므로 사용자가 직접 편집해야 함).

---

## 6. 자주 쓰는 명령

```bash
# 로컬 서버 (live-server)
npx live-server --port=8080

# index.json 재생성 (포스트 추가 후)
node scripts/build-index.js   # 또는 프로젝트 내 빌드 스크립트 확인

# Gemini 헤드리스 리뷰
gemini -p "..." --yolo

# 전체 커밋·푸시
git add <파일> && git commit -m "..." && git push
```

---

## 7. 알려진 이슈 및 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| `marked.parse()` XSS | 수정 안 함 | 로컬 파일만 처리, 외부 업로드 없음 |
| 2048 화살표 키 전역 캡처 | 유지 | 게임 전용 페이지, 의도된 UX |
| 픽셀아트 Bresenham 보간 | 적용됨 | `js/pixel-art.js`의 `bresenham()` 참조 |
| hljs 테마 동적 교체 | 적용됨 | `theme.js`의 `applyTheme()`이 `#hljs-theme` href 교체 |
