# My Blog — Markdown to Blog Converter

## Project Overview

A static blog website that reads Markdown files and renders them as a clean, readable blog. No frameworks — pure HTML, CSS, and JavaScript only.

**Core goals:**
- Parse and render Markdown files in the browser
- Clean, readable typography
- Dark mode support (respects system preference, toggleable)
- Mobile-first responsive layout

## Architecture

```
my-blog/
├── index.html          # Main entry point / post list
├── post.html           # Single post view
├── css/
│   ├── style.css       # Base styles, layout, typography
│   └── syntax.css      # Code block syntax highlighting
├── js/
│   ├── main.js         # Post list rendering, routing
│   ├── parser.js       # Markdown → HTML converter
│   └── theme.js        # Dark/light mode toggle
├── posts/
│   └── *.md            # Blog post Markdown files
└── CLAUDE.md
```

## Implementation Constraints

- **No frameworks or build tools.** No React, Vue, webpack, npm, etc.
- **No external runtime dependencies.** If a library is needed (e.g. a Markdown parser), load it via CDN `<script>` tag and document it here.
- **Vanilla ES modules** (`type="module"`) are fine.
- **No server required.** Must work when opened directly as `file://` or served by any static host.

## Markdown Parsing

The parser (`js/parser.js`) handles:
- Headings (`#`, `##`, `###`)
- Bold / italic (`**`, `_`)
- Inline code and fenced code blocks (`` ` ``, ```` ``` ````)
- Links and images
- Unordered and ordered lists
- Blockquotes
- Horizontal rules
- Frontmatter (`---` YAML block at top of file) for post metadata

### Post Frontmatter Format

```yaml
---
title: Post Title
date: 2026-05-29
description: Short summary shown in the post list.
tags: [tag1, tag2]
---
```

## Design System

### Typography
- Body: system-ui sans-serif stack for UI; serif stack for post body text
- Code: monospace stack
- Line length capped at ~70ch for readability

### Color tokens (CSS custom properties)

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#ffffff` | `#0f0f0f` |
| `--bg-surface` | `#f5f5f5` | `#1a1a1a` |
| `--text` | `#1a1a1a` | `#e8e8e8` |
| `--text-muted` | `#666666` | `#888888` |
| `--accent` | `#2563eb` | `#60a5fa` |
| `--border` | `#e0e0e0` | `#2a2a2a` |

Dark mode applied via `[data-theme="dark"]` on `<html>`, with `prefers-color-scheme` as the default.

### Breakpoints
- Mobile: `< 640px`
- Tablet: `640px – 1024px`
- Desktop: `> 1024px`

Layout is a single centered column. No sidebar.

## Key Behaviors

- **Post list** (`index.html`): reads all `.md` files from `posts/`, sorts by date descending, shows title + date + description.
- **Post view** (`post.html#slug`): loads the corresponding `.md` file, parses it, renders the HTML.
- **Theme toggle**: button in the header switches between light/dark. Preference is saved to `localStorage`.
- **Hash-based routing** — navigation uses `location.hash` (e.g. `post.html#hello-world`). Works with `file://` and all static hosts.

## File Naming Convention

Post files: `posts/YYYY-MM-DD-slug.md`

Example: `posts/2026-05-29-hello-world.md`

The slug is derived by stripping the date prefix from the filename.

## Code Style

- Tabs for indentation
- Single quotes for JS strings
- No semicolons in JS (ASI-safe code)
- CSS custom properties for all colors and spacing tokens
- Comments only where behavior is non-obvious
