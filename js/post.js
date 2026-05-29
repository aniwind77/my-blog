import { initTheme } from './theme.js'

initTheme()

const titleEl = document.getElementById('post-title')
const metaEl = document.getElementById('post-meta')
const bodyEl = document.getElementById('post-body')
const pageTitleEl = document.querySelector('title')

function formatDate(dateStr) {
	const d = new Date(dateStr + 'T00:00:00')
	return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function parseFrontmatter(raw) {
	const fence = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/
	const match = raw.match(fence)
	if (!match) return { meta: {}, body: raw }

	const meta = {}
	match[1].split('\n').forEach(line => {
		const colon = line.indexOf(':')
		if (colon === -1) return
		const key = line.slice(0, colon).trim()
		let val = line.slice(colon + 1).trim()
		if (val.startsWith('[') && val.endsWith(']')) {
			val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''))
		}
		meta[key] = val
	})

	return { meta, body: raw.slice(match[0].length) }
}

function renderTags(tags) {
	if (!tags?.length) return ''
	return tags.map(t => `<span class="tag">${t}</span>`).join('')
}

async function loadPost() {
	const slug = decodeURIComponent(location.hash.slice(1)) || null

	if (!slug) {
		showError('포스트를 찾을 수 없습니다.', '슬러그가 지정되지 않았습니다.')
		return
	}

	bodyEl.innerHTML = '<div class="loading">불러오는 중…</div>'

	let raw
	try {
		const res = await fetch(`posts/${slug}.md`)
		if (!res.ok) throw new Error(`${res.status}`)
		raw = await res.text()
	} catch {
		showError('포스트를 찾을 수 없습니다.', `"${slug}" 포스트가 존재하지 않습니다.`)
		return
	}

	const { meta, body } = parseFrontmatter(raw)

	const title = meta.title ?? slug
	const dateStr = meta.date ? formatDate(meta.date) : ''
	const tags = Array.isArray(meta.tags) ? meta.tags : []

	if (pageTitleEl) pageTitleEl.textContent = `${title} — My Blog`
	titleEl.textContent = title

	metaEl.innerHTML = `
		${dateStr ? `<span>${dateStr}</span>` : ''}
		${renderTags(tags) ? `<span class="post-tags">${renderTags(tags)}</span>` : ''}
	`

	// marked.js is loaded via CDN script tag
	bodyEl.innerHTML = window.marked.parse(body)

	// Highlight.js — runs after marked inserts the DOM
	if (window.hljs) {
		document.querySelectorAll('pre code').forEach(block => {
			hljs.highlightElement(block)
		})
	}
}

function showError(heading, detail) {
	titleEl.textContent = ''
	metaEl.innerHTML = ''
	bodyEl.innerHTML = `
		<div class="error-state">
			<h2>${heading}</h2>
			<p>${detail}</p>
			<p><a href="index.html">목록으로 돌아가기</a></p>
		</div>
	`
}

loadPost()
