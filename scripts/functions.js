//#region //* Setup & Event Listeners
function setup() {
	// updateViewportSize()
	insert_default_cells(document.querySelector('[data-dom="board"]'))
	insert_gradients(document.querySelector('.gradients'))
	reset_data_attributes()
	set_modal_events()
	set_settings_events()

	// get_elements.query('.open-modal')[0].click()
}

function updateViewportSize() {
	const [vh, vw] = [window.innerHeight * 0.01, window.innerWidth * 0.01]
	document.documentElement.style.setProperty('--vmin', `${Math.min(vw, vh)}px`)
	document.documentElement.style.setProperty('--vmax', `${Math.max(vw, vh)}px`)
}

function insert_default_cells(board) {
	for (let i = 0; i < 12; i++) {
		for (let j = 0; j < 12; j++) {
			board.innerHTML += `
            <div data-dom="cell" data-occupied="false" data-x="${j}" data-y="${i}"
                data-player="${i < 6 ? PLAYER_TYPE.BLUE : PLAYER_TYPE.GREEN}"
                data-shade="${i % 2 === j % 2 ? 'light' : 'dark'}">
                <svg class="elemental" viewbox="0 0 100 100" data-dom="cell_svg">
                    <path class="elemental-shape" data-dom="cell_path"/>
                    <circle class="elemental-health-background" cx="50" cy="50" r="45" data-dom="cell_path"/>
                    <path class="elemental-health-life" data-dom="cell_path"/>
                    <path class="elemental-health-hit" data-dom="cell_path"/>
                    <circle class="elemental-health-boundary" cx="50" cy="50" r="45" data-dom="cell_path"/>
                </svg>
            </div>`
		}
	}
}

function insert_gradients(gradient_svg) {
	const elements = Object.values(ELEMENTS)
	for (var i = 0, gradients = ''; i < 6; i++) {
		gradients += `
        <radialgradient id="gradient-${elements[i]}">
            <stop offset="10%" stop-color="var(--gradient-${elements[i]}-1)" />
            <stop offset="90%" stop-color="var(--gradient-${elements[i]}-2)" />
        </radialgradient>`
	}
	gradient_svg.innerHTML += gradients
}

function set_modal_events() {
	const modal = document.querySelector('.modal')
	const openModal = document.querySelector('.open-modal')
	const closeModal = document.querySelector('.close-modal')

	openModal.addEventListener('click', () => {
		modal.dataset.active = true
	})
	closeModal.addEventListener('click', () => {
		modal.dataset.active = false
	})

	const buttons = Array.from(document.querySelectorAll('.tab-buttons > *'))
	const contents = Array.from(document.querySelectorAll('.tab-contents > *'))
	buttons.forEach((btn) => {
		btn.addEventListener('click', () => {
			buttons.forEach((button) => (button.dataset.active = false))
			contents.forEach((content) => (content.dataset.active = false))
			buttons.find((button) => button.dataset.name === btn.dataset.name).dataset.active = true
			contents.find((content) => content.dataset.name === btn.dataset.name).dataset.active = true
		})
	})
}

function set_settings_events() {
	const cells = get_cells()

	const inputs = Array.from(document.querySelectorAll('input'))
	const confirm_settings = document.querySelector('.submit-settings')
	confirm_settings.addEventListener('click', () => {
		const foo = (color) =>
			inputs
				.filter((input) => input.parentElement.parentElement.dataset.player === color)
				.map((input) => (input.checked ? input.dataset.type.toUpperCase() : ''))
				.filter((el) => el !== '')
				.map((e) => ELEMENTS[e])

		const elements = { green: foo(PLAYER_TYPE.GREEN), blue: foo(PLAYER_TYPE.BLUE) }

		clear_cells(cells)
		generate_cells(cells, elements)
		get_elements.query('.close-modal')[0].click()
	})
}

function reset_data_attributes() {
	//* Active States
	;['controller', 'spell', 'action', 'cell'].forEach((ec) => get_elements.dom(ec).forEach((e) => toggle_active(e, false)))

	//* Which Player
	Object.values(PLAYER_TYPE).forEach((c) => {
		get_elements.query(`[data-dom="controller"][data-player="${c}"] :is([data-dom="spell"],[data-dom="action"])`).forEach((e) => (e.dataset.player = c))
	})

	//* spell Charges
	get_elements.dom('spell').forEach((e) => {
		const type = e.dataset.type.replaceAll('-', '_').toUpperCase()
		set_data(e, 'charge', random.int(SPELL_MAX_CHARGE[type]))
		set_data(e, 'maxCharge', SPELL_MAX_CHARGE[type])
	})
}
//#endregion

//#region //* General
function insert_elemental({ cell, element, level = 1, health = 1, hit = 0 }) {
	cell.dataset.occupied = 'true'
	cell.dataset.element = element
	cell.dataset.level = level
	cell.dataset.health = health
	cell.dataset.hit = hit
}

function remove_elemental(cell) {
	cell.dataset.occupied = 'false'
	cell.dataset.element = null
	cell.dataset.level = null
	cell.dataset.health = null
	cell.dataset.hit = null
}

function get_cells(type) {
	const cells_raw = get_elements.dom('cell')
	if (type === PLAYER_TYPE.BLUE) return cells_raw.slice(0, 72)
	if (type === PLAYER_TYPE.GREEN) return cells_raw.slice(72, 144)
	return cells_raw
}

function clear_cells(cells) {
	cells.flat().forEach((cell) => remove_elemental(cell))
}

function toggle_active(elements, forced_state) {
	;[elements].flat(100).forEach((e) => set_data(e, 'active', forced_state ?? !(e.dataset.active == 'true')))
}

/**
 ** BOARD: row_0/row_1/row_2/row_3/row_4/row_5/row_6/row_7/row_8/row_9/row_10/row_11/
 ** ROW: Element+Level+Health|Empty: Element=[a|e|f|n|r|w] Level=[1..3]  Health=[1..6] ?Empty:_[1..12]?
 ** Example: a11|11/1|a21|10/2|a21|9/3|a21|8/4|a21|7/5|a21|6/6|a21|5/7|a21|4/8|a21|3/9|a21|2/10|a21|1/11|a21
 */
function get_board_state(board) {
	let state = ''
	for (let j = 0; j < 12; j++) {
		let empty_count = 0
		for (let i = 0; i < 12; i++) {
			const cell = board.cells[i + j * 12]
			const elemental = board.find_elemental(cell)

			if (elemental != null) {
				if (empty_count > 0) {
					state += `${empty_count}|`
					empty_count = 0
				}
				state += `${elemental.element[0]}${elemental.level}${elemental.health}|` // `${elemental.element[0]}${i.toString(16)}${j.toString(16)}|`
			}
			if (elemental == null) empty_count++
		}
		if (empty_count > 0) state += `${empty_count}`
		if (state.at(-1) === '|') state = state.slice(0, -1) //? removes last '|' from state
		state += '/'
	}

	return state
}

function set_board_state(board, board_state) {}

function prettify_board_state(board_state) {
	let state_log = '-----+'.repeat(12) + '\n ' + board_state.replaceAll('/', `|\n${'-----+'.repeat(12)}\n `).replaceAll('|', ' | ')
	for (let i = 1; i <= 12; i++) state_log = state_log.replaceAll(` ${i} `, '     |'.repeat(i).slice(0, -1))
	state_log = state_log.substring(0, 882) + '=====+'.repeat(12) + state_log.substring(953 + 1)
	return state_log
		.split('\n')
		.map((s, i) => (i % 2 === 0 ? '+' : '|') + s.trimEnd())
		.join('\n')
		.slice(0, -1)
}
//#endregion

//#region //* Helpers
const get_elements = {
	dom: (query) => Array.from(document.querySelectorAll(`[data-dom="${query}"]`)),
	dom_active: (query) => Array.from(document.querySelectorAll(`[data-active="true"][data-dom="${query}"]`)),
	dom_player: (query, player) => Array.from(document.querySelectorAll(`[data-player="${player}"][data-dom="${query}"]`)),
	data: (data, query) => Array.from(document.querySelectorAll(`[data-${data}="${query}"]`)),
	query: (query) => Array.from(document.querySelectorAll(`${query}`)),
	closest_dom: (element, dom) => element.closest(`[data-dom="${dom}"]`),
}

function get_data(element) {
	if (element == null) return console.error('Invalid element', element)
	return JSON.parse(JSON.stringify(element?.dataset))
}

function set_data(element, type, data) {
	element.dataset[type] = data
}

function allEqualNotNull(array) {
	return array.every((v) => v === array[0] && v != null && v !== 'null')
}

;(function (global) {
	const rng = (global.random = {})

	rng.float = function (b = 1, a = 0) {
		if (typeof a !== 'number' || typeof b !== 'number') return console.error('random function error: ', arguments)
		return a + (b - a) * Math.random()
	}
	rng.int = function (b = 1, a = 0) {
		if (typeof a !== 'number' || typeof b !== 'number') return console.error('random function error: ', arguments)
		return Math.floor(rng.float(a, b))
	}
	rng.sign = function () {
		return rng.array([1, -1])
	}
	rng.array = function (a) {
		if (!Array.isArray(a)) return console.error('random function error: ', arguments)
		return a[rng.int(a.length)]
	}
	rng.weight = function (a) {
		// a = [['a', 1], ['b', 2], ['c', 3]]; <-> a: [[value, weight]; N]
		if (!Array.isArray(a) || a.length === 0 || a.some((v) => !Array.isArray(v) || v.length === 0))
			return console.error('random function error: ', arguments)

		const values = a.map((value) => value[0])
		const weights = a.map((value) => value[1])
		const sum = weights.reduce((a, b) => a + b)

		const r = rng.int(sum)
		for (let i = 0, current = 0; i < a.length; i++) {
			if (r < current) return values[i - 1]
			current += weights[i]
		}

		return values[a.length - 1]
	}
})(this)
//#endregion
