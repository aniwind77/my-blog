import { initTheme } from './theme.js'

initTheme()

const listEl = document.getElementById('post-list')

function formatDate(dateStr) {
	const d = new Date(dateStr + 'T00:00:00')
	return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function renderCard(post) {
	const a = document.createElement('a')
	a.className = 'post-card'
	a.href = `post.html#${encodeURIComponent(post.slug)}`

	const tags = (post.tags ?? []).map(t => `<span class="tag">${t}</span>`).join('')

	a.innerHTML = `
		<div class="post-card-title">${post.title}</div>
		<div class="post-card-meta">
			<span>${formatDate(post.date)}</span>
		</div>
		${post.description ? `<div class="post-card-desc">${post.description}</div>` : ''}
		${tags ? `<div class="post-tags">${tags}</div>` : ''}
	`
	return a
}

async function loadPosts() {
	listEl.innerHTML = '<div class="loading">불러오는 중…</div>'

	let posts
	try {
		const res = await fetch('posts/index.json')
		if (!res.ok) throw new Error('fetch failed')
		posts = await res.json()
	} catch {
		listEl.innerHTML = '<div class="empty-state">포스트를 불러올 수 없습니다.</div>'
		return
	}

	if (!posts.length) {
		listEl.innerHTML = '<div class="empty-state">아직 포스트가 없습니다.</div>'
		return
	}

	posts.sort((a, b) => (a.date < b.date ? 1 : -1))

	listEl.innerHTML = ''
	posts.forEach(post => listEl.appendChild(renderCard(post)))
}

loadPosts()
