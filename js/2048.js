import { initTheme } from './theme.js'

const STORAGE_KEY_BEST = '2048-best'

let board   // number[16], 0 = 빈 칸
let score
let best
let over
let won

const boardEl       = document.getElementById('board')
const cellEls       = boardEl.querySelectorAll('.cell')
const scoreEl       = document.getElementById('score-display')
const bestEl        = document.getElementById('best-display')
const messageEl     = document.getElementById('game-message')
const messageTextEl = document.getElementById('game-message-text')

// ── 초기화 ──────────────────────────────────────────────────

function initGame() {
	board = Array(16).fill(0)
	score = 0
	over = false
	won = false
	best = Number(localStorage.getItem(STORAGE_KEY_BEST)) || 0
	spawnTile()
	spawnTile()
	render()
	hideMessage()
}

// ── 타일 스폰 ────────────────────────────────────────────────

function spawnTile() {
	const empties = board.reduce((acc, v, i) => (v === 0 ? [...acc, i] : acc), [])
	if (empties.length === 0) return
	const idx = empties[Math.floor(Math.random() * empties.length)]
	board[idx] = Math.random() < 0.9 ? 2 : 4
}

// ── 이동 로직 ────────────────────────────────────────────────

function compress(line) {
	const filtered = line.filter(v => v !== 0)
	while (filtered.length < 4) filtered.push(0)
	return filtered
}

function merge(line) {
	for (let i = 0; i < 3; i++) {
		if (line[i] !== 0 && line[i] === line[i + 1]) {
			line[i] *= 2
			score += line[i]
			line[i + 1] = 0
			i++ // 같은 타일 이중 합치기 방지
		}
	}
	return line
}

// 방향별 인덱스 선 추출 헬퍼
function getLines(dir) {
	const lines = []
	for (let i = 0; i < 4; i++) {
		if (dir === 'ArrowLeft')  lines.push([i*4, i*4+1, i*4+2, i*4+3])
		if (dir === 'ArrowRight') lines.push([i*4+3, i*4+2, i*4+1, i*4])
		if (dir === 'ArrowUp')    lines.push([i, i+4, i+8, i+12])
		if (dir === 'ArrowDown')  lines.push([i+12, i+8, i+4, i])
	}
	return lines
}

function move(dir) {
	const prev = board.slice()
	const lines = getLines(dir)

	lines.forEach(indices => {
		let line = indices.map(i => board[i])
		line = compress(line)
		line = merge(line)
		line = compress(line)
		indices.forEach((boardIdx, lineIdx) => {
			board[boardIdx] = line[lineIdx]
		})
	})

	const changed = prev.some((v, i) => v !== board[i])
	if (!changed) return

	spawnTile()
	render()
	checkGameState()
}

// ── 게임 상태 ────────────────────────────────────────────────

function canMove() {
	if (board.includes(0)) return true
	for (let r = 0; r < 4; r++) {
		for (let c = 0; c < 4; c++) {
			const idx = r * 4 + c
			if (c < 3 && board[idx] === board[idx + 1]) return true
			if (r < 3 && board[idx] === board[idx + 4]) return true
		}
	}
	return false
}

function saveBest() {
	if (score > best) {
		best = score
		localStorage.setItem(STORAGE_KEY_BEST, String(best))
	}
}

function checkGameState() {
	if (!won && board.includes(2048)) {
		won = true
		saveBest()
		showMessage('win')
		return
	}
	if (!canMove()) {
		over = true
		saveBest()
		showMessage('over')
	}
}

// ── 렌더링 ───────────────────────────────────────────────────

function tileClass(val) {
	const base = val > 2048 ? 'tile-super' : `tile-${val}`
	const digits = String(val).length
	const fs = digits >= 5 ? 'fs-xs' : digits === 4 ? 'fs-sm' : 'fs-md'
	return `tile ${base} ${fs}`
}

function render() {
	board.forEach((val, idx) => {
		const cell = cellEls[idx]
		const existing = cell.querySelector('.tile')
		if (existing) cell.removeChild(existing)
		if (val === 0) return
		const tile = document.createElement('div')
		tile.className = tileClass(val)
		tile.textContent = String(val)
		cell.appendChild(tile)
	})
	scoreEl.textContent = String(score)
	bestEl.textContent = String(best)
}

// ── 메시지 오버레이 ──────────────────────────────────────────

function showMessage(type) {
	messageEl.className = `game-message visible game-message-${type}`
	messageTextEl.textContent = type === 'win' ? '2048 달성! 🎉' : '게임 오버'
}

function hideMessage() {
	messageEl.className = 'game-message'
}

// ── 이벤트 리스너 ────────────────────────────────────────────

document.addEventListener('keydown', e => {
	const dirs = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
	if (!dirs.includes(e.key)) return
	e.preventDefault()
	if (over && !won) return
	move(e.key)
})

let touchStartX = 0
let touchStartY = 0

document.addEventListener('touchstart', e => {
	touchStartX = e.touches[0].clientX
	touchStartY = e.touches[0].clientY
}, { passive: true })

document.addEventListener('touchend', e => {
	if (over && !won) return
	const dx = e.changedTouches[0].clientX - touchStartX
	const dy = e.changedTouches[0].clientY - touchStartY
	if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
	if (Math.abs(dx) > Math.abs(dy)) {
		move(dx > 0 ? 'ArrowRight' : 'ArrowLeft')
	} else {
		move(dy > 0 ? 'ArrowDown' : 'ArrowUp')
	}
})

document.getElementById('new-game-btn').addEventListener('click', initGame)
document.getElementById('retry-btn').addEventListener('click', initGame)

// ── 진입점 ───────────────────────────────────────────────────

initTheme()
initGame()
