import { initTheme } from './theme.js'

const GRID_SIZE = 16
const CELL_SIZE = 32

const PALETTE = [
	'#000000', '#ffffff', '#808080', '#c0c0c0',
	'#ff0000', '#ff8000', '#ffff00', '#00ff00',
	'#00ffff', '#0000ff', '#ff00ff', '#8000ff',
	'#800000', '#804000', '#808000', '#008000',
	'#008080', '#000080', '#800080', '#400080',
	'#ff8080', '#ffb380', '#ffff80', '#80ff80',
	'#80ffff', '#8080ff', '#ff80ff', '#ffcc00',
	'#ff4500', '#32cd32', '#1e90ff', '#ff1493',
]

let pixels = Array(GRID_SIZE * GRID_SIZE).fill('')
let currentColor = PALETTE[0]
let eraserMode = false
let showGrid = true
let isPainting = false

const canvas = document.getElementById('pixel-canvas')
const ctx = canvas.getContext('2d')

// ── 팔레트 ───────────────────────────────────────────────────

function buildPalette() {
	const grid = document.getElementById('palette-grid')
	PALETTE.forEach(hex => {
		const btn = document.createElement('button')
		btn.className = 'swatch'
		btn.style.background = hex
		btn.dataset.color = hex
		btn.addEventListener('click', () => selectColor(hex))
		grid.appendChild(btn)
	})
}

function selectColor(hex) {
	currentColor = hex
	document.getElementById('color-preview').style.background = hex
	document.getElementById('color-custom').value = hex
	document.querySelectorAll('.swatch').forEach(s => {
		s.classList.toggle('swatch-active', s.dataset.color === hex)
	})
	if (eraserMode) toggleEraser()
}

// ── 좌표 변환 ────────────────────────────────────────────────

function getCanvasPos(clientX, clientY) {
	const rect = canvas.getBoundingClientRect()
	const scaleX = canvas.width / rect.width
	const scaleY = canvas.height / rect.height
	return {
		x: (clientX - rect.left) * scaleX,
		y: (clientY - rect.top) * scaleY,
	}
}

function getPixelIndex(x, y) {
	const col = Math.floor(x / CELL_SIZE)
	const row = Math.floor(y / CELL_SIZE)
	if (col < 0 || col >= GRID_SIZE || row < 0 || row >= GRID_SIZE) return -1
	return row * GRID_SIZE + col
}

// ── 렌더링 ───────────────────────────────────────────────────

function drawCell(idx) {
	const row = Math.floor(idx / GRID_SIZE)
	const col = idx % GRID_SIZE
	const x = col * CELL_SIZE
	const y = row * CELL_SIZE
	ctx.clearRect(x, y, CELL_SIZE, CELL_SIZE)
	if (pixels[idx]) {
		ctx.fillStyle = pixels[idx]
		ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
	}
}

function drawGrid() {
	if (!showGrid) return
	ctx.strokeStyle = 'rgba(128,128,128,0.35)'
	ctx.lineWidth = 0.5
	for (let i = 0; i <= GRID_SIZE; i++) {
		const pos = i * CELL_SIZE
		ctx.beginPath()
		ctx.moveTo(pos, 0)
		ctx.lineTo(pos, canvas.height)
		ctx.stroke()
		ctx.beginPath()
		ctx.moveTo(0, pos)
		ctx.lineTo(canvas.width, pos)
		ctx.stroke()
	}
}

function renderAll() {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	pixels.forEach((_, idx) => drawCell(idx))
	drawGrid()
}

// ── 도구 동작 ────────────────────────────────────────────────

function paint(clientX, clientY) {
	if (!isPainting) return
	const { x, y } = getCanvasPos(clientX, clientY)
	const idx = getPixelIndex(x, y)
	if (idx === -1) return
	pixels[idx] = eraserMode ? '' : currentColor
	drawCell(idx)
}

function stopPaint() {
	isPainting = false
	drawGrid()
}

function toggleEraser() {
	eraserMode = !eraserMode
	document.getElementById('btn-eraser').classList.toggle('tool-active', eraserMode)
}

function toggleGrid() {
	showGrid = !showGrid
	document.getElementById('btn-grid').classList.toggle('tool-active', showGrid)
	renderAll()
}

function clearAll() {
	pixels.fill('')
	renderAll()
}

// ── PNG 저장 ─────────────────────────────────────────────────

function saveAsPng() {
	const offscreen = document.createElement('canvas')
	offscreen.width = canvas.width
	offscreen.height = canvas.height
	const octx = offscreen.getContext('2d')
	pixels.forEach((color, idx) => {
		if (!color) return
		const row = Math.floor(idx / GRID_SIZE)
		const col = idx % GRID_SIZE
		octx.fillStyle = color
		octx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE)
	})
	const url = offscreen.toDataURL('image/png')
	const a = document.createElement('a')
	a.href = url
	a.download = 'pixel-art.png'
	a.click()
}

// ── 이벤트 등록 ──────────────────────────────────────────────

function registerEvents() {
	canvas.addEventListener('mousedown', e => {
		isPainting = true
		paint(e.clientX, e.clientY)
	})
	canvas.addEventListener('mousemove', e => paint(e.clientX, e.clientY))
	canvas.addEventListener('mouseup', stopPaint)
	canvas.addEventListener('mouseleave', stopPaint)

	canvas.addEventListener('touchstart', e => {
		e.preventDefault()
		isPainting = true
		paint(e.touches[0].clientX, e.touches[0].clientY)
	}, { passive: false })
	canvas.addEventListener('touchmove', e => {
		e.preventDefault()
		paint(e.touches[0].clientX, e.touches[0].clientY)
	}, { passive: false })
	canvas.addEventListener('touchend', e => {
		e.preventDefault()
		stopPaint()
	}, { passive: false })

	document.getElementById('btn-eraser').addEventListener('click', toggleEraser)
	document.getElementById('btn-grid').addEventListener('click', toggleGrid)
	document.getElementById('btn-clear').addEventListener('click', clearAll)
	document.getElementById('btn-save').addEventListener('click', saveAsPng)

	document.getElementById('color-custom').addEventListener('input', e => {
		selectColor(e.target.value)
	})
}

// ── 진입점 ───────────────────────────────────────────────────

function init() {
	initTheme()
	buildPalette()
	selectColor(PALETTE[0])
	registerEvents()
	renderAll()
}

init()
