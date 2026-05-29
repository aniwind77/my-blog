# Gemini Code Review — my-blog Project

> Reviewed by: Gemini CLI (gemini 0.44.0)
> Known bug excluded: `js/2048.js` `checkGameState()` skips `canMove()` when `won=true` (documented in review.md)

---

## 1. Security Vulnerabilities (Critical)

The project contains several critical Cross-Site Scripting (XSS) vulnerabilities where user-controlled or external data is injected into the DOM without sanitization.

### 1-1. Unsafe Markdown Rendering — `js/post.js` line 84

```javascript
bodyEl.innerHTML = window.marked.parse(body)
```

The `marked` library does not sanitize HTML by default. If a markdown file contains malicious `<script>` tags or `onload` attributes, they will execute in the browser.

**Fix:** Use a sanitization library like `DOMPurify` on the output of `marked.parse()`.

### 1-2. Unsafe Post Metadata Rendering — `js/main.js` lines 13–25

```javascript
a.innerHTML = `
    <div class="post-card-title">${post.title}</div>
    ...
    ${post.description ? `<div class="post-card-desc">${post.description}</div>` : ''}
`
```

Post titles and descriptions from `posts/index.json` are injected directly into `innerHTML`. If the JSON is compromised or generated from untrusted sources, this leads to XSS.

**Fix:** Use `textContent` for text content, or escape values before interpolation.

### 1-3. XSS in Error Handling — `js/post.js` lines 94–102

```javascript
function showError(heading, detail) {
    bodyEl.innerHTML = `... <p>${detail}</p> ...`
}
```

The `detail` parameter can contain the `slug` decoded from `location.hash` (line 42). A malicious URL like `post.html#<img src=x onerror=alert(1)>` would execute arbitrary script.

**Fix:** Escape or sanitize the `detail` string before injecting into `innerHTML`.

---

## 2. Accessibility (A11y) Problems

### 2-1. Canvas and Palette Inaccessibility — `js/pixel-art.js` lines 20–30

- The drawing canvas is opaque to screen readers with no fallback description or ARIA representation.
- Palette swatch buttons are created with background colors but no descriptive text or `aria-label`. Screen reader users cannot know what color they are selecting.

**Fix:** Add `aria-label="색상: #RRGGBB"` (or a descriptive color name) to each swatch button.

### 2-2. Non-Semantic Game Board — `js/2048.js`

The game board consists of bare `div` elements with no ARIA roles. Recommended additions:

- `role="application"` on the board container
- `aria-live="polite"` on the score element for score update announcements
- Keyboard instruction text visible to screen readers

### 2-3. Static Theme Toggle Label — `js/theme.js` line 5

When the theme changes, only the icon (`☀` / `🌙`) changes. The `aria-label` remains static ("테마 전환").

**Fix:** Update `aria-label` dynamically to describe the *next* state (e.g., "다크 모드로 전환" / "라이트 모드로 전환").

### 2-4. Keyboard Hijacking — `js/2048.js` line 129

The global `keydown` listener captures arrow keys unconditionally, preventing normal page scrolling even when the user is not actively playing.

**Fix:** Only intercept arrow keys when the game board has focus (e.g., check `document.activeElement` or scope the listener to the board wrapper).

---

## 3. Bugs & Logic Errors

### 3-1. Disappearing Grid Lines — `js/pixel-art.js`

The `paint()` function calls `drawCell()`, which uses `clearRect()`. This erases the grid lines covering the active cell while painting. Grid lines only reappear when the mouse is released (`stopPaint`).

**Fix:** Redraw the grid segment inside `drawCell()` after clearing and filling the cell.

### 3-2. No Path Interpolation — `js/pixel-art.js`

`paint()` only colors the pixel under the current mouse coordinate. If the mouse moves quickly, the drawing appears as disconnected dots rather than a continuous line.

**Fix:** Interpolate between the previous and current mouse positions in `mousemove` using Bresenham's line algorithm or similar.

### 3-3. Fragile Frontmatter Parser — `js/post.js` lines 15–32

The manual YAML-like parser will fail when:
- Frontmatter values contain a colon (e.g., `title: "My Blog: A New Start"`)
- Values have unexpected trailing whitespace

**Fix:** Split only on the *first* colon using `/^([^:]+):\s*(.*)$/` or adopt a minimal YAML library.

### 3-4. Timezone Offset Risk — `js/main.js` line 7

```javascript
new Date(dateStr + 'T00:00:00')
```

This creates a local-timezone date. Depending on the host environment and date format, the date can resolve to the previous calendar day due to UTC/local conversion.

**Fix:** Append `Z` to parse as UTC, or explicitly handle the timezone.

---

## 4. CSS & UI/UX Issues

### 4-1. Inconsistent Syntax Highlighting — `css/syntax.css`

`post.html` loads a dark-theme highlight.js CSS from a CDN, but `syntax.css` overrides only the `.hljs` background for light mode. Syntax token colors (keywords, strings, etc.) retain their dark-theme values, causing poor contrast on light backgrounds.

**Fix:** Ensure the correct light-mode highlight.js theme is loaded in light mode, or override all token color rules in `syntax.css`.

### 4-2. Non-responsive Table and Code Blocks — `css/style.css`

Markdown-generated tables and large `<pre>` code blocks lack `overflow-x: auto` within the `.post-body` context, causing layout overflow on narrow mobile screens.

Images in `.post-body` have `max-width: 100%` but are missing `height: auto`, which can cause distortion when explicit dimensions are present.

**Fix:**
```css
.post-body table,
.post-body pre { overflow-x: auto; }
.post-body img { max-width: 100%; height: auto; }
```

### 4-3. Pixel Art Dark Mode Gaps — `css/pixel-art.css`

The file lacks specific dark mode overrides for its unique UI elements. The canvas border and grid contrast are not adjusted for dark mode, reducing visibility.

**Fix:** Add `[data-theme="dark"]` overrides for canvas border color and grid line color.

---

## 5. JavaScript & Code Quality

### 5-1. Redundant `renderTags` Call — `js/post.js`

`renderTags(tags)` is called twice inside the `metaEl.innerHTML` template literal — once to check for existence and once to render. This executes the function unnecessarily and generates DOM strings that are discarded.

**Fix:** Cache the result in a variable before interpolation.

### 5-2. Undifferentiated Error Handling — `js/post.js`, `js/main.js`

`fetch` calls in `loadPosts` and `loadPost` catch all errors with a single handler. A 404 (post not found) and a network failure produce the same generic error message, making debugging difficult.

**Fix:** Check `response.ok` / `response.status` before throwing, and provide distinct error messages per status code.

### 5-3. Heavy DOM Thrashing in Render — `js/2048.js`

`render()` removes and recreates all tile DOM nodes on every move. For a 4×4 grid this is acceptable, but it prevents CSS transitions on tiles (animations require stable DOM nodes).

**Note:** Low-priority for this project size, but relevant if tile animations are planned.

---

## Summary Table

| # | Severity | File | Finding |
|---|----------|------|---------|
| 1 | Critical | `js/post.js:84` | XSS via unsanitized `marked.parse()` output |
| 2 | Critical | `js/main.js:13-25` | XSS via `innerHTML` with raw post metadata |
| 3 | Critical | `js/post.js:94-102` | XSS via `location.hash` slug in error display |
| 4 | High | `js/pixel-art.js` | Palette swatches have no `aria-label` |
| 5 | High | `js/post.js:15-32` | Frontmatter parser breaks on colons in values |
| 6 | Medium | `js/theme.js:5` | Theme toggle `aria-label` is static |
| 7 | Medium | `js/2048.js:129` | Arrow keys hijacked globally (blocks page scroll) |
| 8 | Medium | `js/pixel-art.js` | Grid lines erased while painting |
| 9 | Medium | `js/pixel-art.js` | No path interpolation → dotted strokes |
| 10 | Medium | `css/syntax.css` | Dark-theme token colors leak into light mode |
| 11 | Low | `css/style.css` | Tables/pre blocks overflow on mobile |
| 12 | Low | `js/main.js:7` | Date timezone offset may shift day by -1 |
| 13 | Low | `js/post.js` | `renderTags()` called twice redundantly |
