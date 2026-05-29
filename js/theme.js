const STORAGE_KEY = 'blog-theme'

const HLJS_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/'

function applyTheme(theme) {
	document.documentElement.setAttribute('data-theme', theme)
	const btn = document.getElementById('theme-toggle')
	if (btn) {
		btn.textContent = theme === 'dark' ? '☀' : '🌙'
		btn.setAttribute('aria-label', theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환')
	}
	const hljsLink = document.getElementById('hljs-theme')
	if (hljsLink) {
		hljsLink.href = HLJS_BASE + (theme === 'dark' ? 'github-dark.min.css' : 'github.min.css')
	}
}

function getSystemTheme() {
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function initTheme() {
	const saved = localStorage.getItem(STORAGE_KEY)
	applyTheme(saved ?? getSystemTheme())

	const btn = document.getElementById('theme-toggle')
	if (!btn) return

	btn.addEventListener('click', () => {
		const current = document.documentElement.getAttribute('data-theme')
		const next = current === 'dark' ? 'light' : 'dark'
		applyTheme(next)
		localStorage.setItem(STORAGE_KEY, next)
	})
}
