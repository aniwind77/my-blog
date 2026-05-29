const STORAGE_KEY = 'blog-theme'

function applyTheme(theme) {
	document.documentElement.setAttribute('data-theme', theme)
	const btn = document.getElementById('theme-toggle')
	if (btn) btn.textContent = theme === 'dark' ? '☀' : '🌙'
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
