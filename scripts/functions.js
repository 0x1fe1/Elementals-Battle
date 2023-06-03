//#region //* Setup & Event Listeners
function setup() {
	// updateViewportSize()
	insert_default_cells(get_elements.dom(DOM.BOARD))
	insert_gradients(document.querySelector('.gradients'))
	reset_data_attributes()
	set_modal_events()
	set_settings_events()

	// get_elements.query('.open-modal').click()
}

function updateViewportSize() {
	const [vh, vw] = [window.innerHeight * 0.01, window.innerWidth * 0.01]
	document.documentElement.style.setProperty('--vmin', `${Math.min(vw, vh)}px`)
	document.documentElement.style.setProperty('--vmax', `${Math.max(vw, vh)}px`)
}

function insert_default_cells(board) {
	for (let i = 0; i < BOARD_SIZE; i++)
		for (let j = 0; j < BOARD_SIZE; j++)
			board.innerHTML += `
            <div data-dom="cell" data-occupied="false" 
                data-x="${j}" data-y="${i}" data-id="${j}-${i}"  
                data-player="${i < 6 ? PLAYER_TYPE.BLUE : PLAYER_TYPE.GREEN}" 
                data-shade="${i % 2 === j % 2 ? 'light' : 'dark'}"></div>`

	get_elements.dom(DOM.CELL).forEach((cell) => {
		cell.innerHTML += `
        <svg class="elemental" viewbox="0 0 100 100" data-dom="cell_svg">
            <path class="elemental-shape" data-dom="cell_path"/>
            <circle class="elemental-health-background" cx="50" cy="50" r="45" data-dom="cell_path"/>
            <path class="elemental-health-life" data-dom="cell_path"/>
            <path class="elemental-health-hit" data-dom="cell_path"/>
            <circle class="elemental-health-boundary" cx="50" cy="50" r="45" data-dom="cell_path"/>
        </svg>`
	})
}

function insert_gradients(gradient_svg) {
	const elements = Object.values(ELEMENT)
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
				.map((e) => ELEMENT[e])

		const elements = { green: foo(PLAYER_TYPE.GREEN), blue: foo(PLAYER_TYPE.BLUE) }

		clear_cells(cells)
		generate_cells(cells, elements)
		get_elements.query('.close-modal').click()
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
/**
 * @param {Elemental}
 */
function insert_elemental({ cell, element, level = 1, health = 1 }) {
	cell.dataset.occupied = 'true'
	cell.dataset.element = element
	cell.dataset.level = level
	cell.dataset.health = health
}

/**
 * @param {Element} cell
 * @param {boolean} animate
 */
function reset_cell_elemental(cell, animate) {
	cell.dataset.occupied = 'false'
	// cell.dataset.element = null
	// cell.dataset.level = null
	cell.dataset.health = null
	cell.dataset.hit = null
	cell.dataset.animate = 'true'
}

/**
 * @param {PLAYER_TYPE} type
 */
function get_cells(type) {
	const cells_raw = get_elements.dom('cell')
	if (type === PLAYER_TYPE.BLUE) return cells_raw.slice(0, 72)
	if (type === PLAYER_TYPE.GREEN) return cells_raw.slice(72, 144)
	return cells_raw
}

/**
 * @param {Array<Element>} cells
 */
function clear_cells(cells) {
	cells.flat().forEach((cell) => reset_cell_elemental(cell))
}

/**
 * @param {Array<Element>} elements
 * @param {boolean} forced_state
 */
function toggle_active(elements, forced_state) {
	;[elements].flat(100).forEach((e) => set_data(e, 'active', forced_state ?? !(e.dataset.active == 'true')))
}

/**
 ** BOARD: row_0/row_1/row_2/row_3/row_4/row_5/row_6/row_7/row_8/row_9/row_10/row_11/
 ** ROW: Element+Level+Health|Empty: Element=[a|e|f|n|r|w] Level=[1..3]  Health=[1..6] ?Empty:_[1..BOARD_SIZE]?
 ** Debug: 6|a31|r31|f31|w31|n31|e31/a11|r11|f11|w11|n11|e11|a32|r32|f32|w32|n32|e32/6|a33|r33|f33|w33|n33|e33/a21|r21|f21|w21|n21|e21|a34|r34|f34|w34|n34|e34/a22|r22|f22|w22|n22|e22|a35|r35|f35|w35|n35|e35/6|a36|r36|f36|w36|n36|e36/6|a31|r31|f31|w31|n31|e31/a11|r11|f11|w11|n11|e11|a32|r32|f32|w32|n32|e32/6|a33|r33|f33|w33|n33|e33/a21|r21|f21|w21|n21|e21|a34|r34|f34|w34|n34|e34/a22|r22|f22|w22|n22|e22|a35|r35|f35|w35|n35|e35/6|a36|r36|f36|w36|n36|e36
 * @param {Board} board
 * @returns {string}
 */
function get_board_state(board) {
	let state = ''
	for (let j = 0; j < BOARD_SIZE; j++) {
		let empty_count = 0
		for (let i = 0; i < BOARD_SIZE; i++) {
			const cell = board.cells[i + j * BOARD_SIZE]
			const elemental = board.find_elemental(cell)

			if (elemental != null && empty_count > 0) empty_count = 0 + (0 === (state += empty_count.toString(16) + '|')) //? update state & set empty_count to 0
			if (elemental != null) state += `${elemental.element[0]}${elemental.level}${elemental.health}|`
			if (elemental == null) empty_count++
		}
		if (empty_count > 0) state += `${empty_count}`
		if (state.at(-1) === '|') state = state.slice(0, -1) //? removes last '|' from state
		if (j < BOARD_SIZE - 1) state += '/'
	}

	return state
}
// get_board_state.RANDOM = () => {
// 	const num = 30 + random.sign() * random.int(4)
// 	const elementals = []
// 	for (let i = 0; i < num; i++) {
// 		const elemental = random.array(Object.values(ELEMENT))
// 		elementals.push()
// 	}
// }

/**
 * @param {Board} board
 * @param {string} state
 */
function set_board_state(board, state) {
	board.remove_elementals()
	const rows = state.split('/').map((row) => row.split('|'))
	rows.length = BOARD_SIZE

	rows.forEach((row, y) => {
		let x = 0
		row.forEach((data) => {
			if (data.length === 3) {
				const cell = board.cells[x + y * BOARD_SIZE]

				const element = Object.values(ELEMENT).find((e) => e[0] === data[0])
				const level = parseInt(data[1])
				const health = parseInt(data[2])

				const elemental = new Elemental(element, level)

				board.set_elemental(cell, elemental)
			}
			x += data.length === 1 ? parseInt(data, 16) : 1
		})
	})

	board.insert_elementals()
}
set_board_state.DEBUG = () => {
	set_board_state(
		game.board,
		'6|a31|r31|f31|w31|n31|e31/a11|r11|f11|w11|n11|e11|a32|r32|f32|w32|n32|e32/6|a33|r33|f33|w33|n33|e33/a21|r21|f21|w21|n21|e21|a34|r34|f34|w34|n34|e34/a22|r22|f22|w22|n22|e22|a35|r35|f35|w35|n35|e35/6|a36|r36|f36|w36|n36|e36/6|a31|r31|f31|w31|n31|e31/a11|r11|f11|w11|n11|e11|a32|r32|f32|w32|n32|e32/6|a33|r33|f33|w33|n33|e33/a21|r21|f21|w21|n21|e21|a34|r34|f34|w34|n34|e34/a22|r22|f22|w22|n22|e22|a35|r35|f35|w35|n35|e35/6|a36|r36|f36|w36|n36|e36',
	)
}

/**
 * @param {Board} board
 * @param {string} state
 * @returns {string}
 */
function prettify_board_state(board_state) {
	const [cw, ch] = [6, 2] //? log_cell_width, log_cell_height
	const [bw, bh] = [cw * BOARD_SIZE + 1, ch * BOARD_SIZE + 1] //? log_board_width, log_board_height
	const log_board = new Array(bh).fill().map(() => new Array(bw).fill(' '))

	for (let y = 0; y < bh; y++) {
		for (let x = 0; x < bw; x++) {
			if (x % cw === 0 && y % ch === 0) log_board[y][x] = '┼'
			if (x === 000000 && y % ch === 0) log_board[y][x] = '├'
			if (x === bw - 1 && y % ch === 0) log_board[y][x] = '┤'
			if (x % cw === 0 && y === 000000) log_board[y][x] = '┬'
			if (x % cw === 0 && y === bh - 1) log_board[y][x] = '┴'
			if (x === 000000 && y === 000000) log_board[y][x] = '┌'
			if (x === 000000 && y === bh - 1) log_board[y][x] = '└'
			if (x === bw - 1 && y === bh - 1) log_board[y][x] = '┘'
			if (x === bw - 1 && y === 000000) log_board[y][x] = '┐'

			if (x % cw !== 0 && y % ch === 00000000000000000) log_board[y][x] = '─'
			if (x % cw !== 0 && (y + 1) % (cw * 2 + 1) === 0) log_board[y][x] = '━'
			if (x % cw === 0 && (y + 1) % (cw * 2 + 1) === 0) log_board[y][x] = '┿'
			if (x === bw - 1 && (y + 1) % (cw * 2 + 1) === 0) log_board[y][x] = '┥'
			if (x === 000000 && (y + 1) % (cw * 2 + 1) === 0) log_board[y][x] = '┝'

			if (x % cw === 0 && y % ch !== 0) log_board[y][x] = '│'
		}
	}

	const log_cells = board_state.split('/').map((row) => row.split('|'))
	log_cells.forEach((row, y) => {
		let x = 0
		row.forEach((cell) => {
			if (cell.length === 3) {
				log_board[y * ch + 1][x * cw + 2 + 0] = cell[0]
				log_board[y * ch + 1][x * cw + 2 + 1] = cell[1]
				log_board[y * ch + 1][x * cw + 2 + 2] = cell[2]
			}
			x += cell.length === 1 ? parseInt(cell) : 1
		})
	})

	return log_board.map((row) => row.join('')).join('\n')
}
//#endregion

//#region //* Helpers
const get_elements = {
	/**
	 * @param {string} query
	 * @returns {(Element|Array<Element>)}
	 */
	dom: (query) => get_elements._helper(Array.from(document.querySelectorAll(`[data-dom="${query}"]`))),

	/**
	 * @param {string} query
	 * @param {PLAYER_TYPE} player
	 * @returns {(Element|Array<Element>)}
	 */
	dom_player: (query, player) => get_elements._helper(Array.from(document.querySelectorAll(`[data-player="${player}"][data-dom="${query}"]`))),

	/**
	 * query: `dom=DOM data-TYPE=VALUE`
	 * @param {string} dom
	 * @param {string} type
	 * @param {string} value
	 * @returns {(Element|Array<Element>)}
	 */
	data: (dom, type, value) => get_elements._helper(Array.from(document.querySelectorAll(`[data-${type}="${value}"][data-dom="${dom}"]`))),

	/**
	 * @param {string} query
	 * @returns {(Element|Array<Element>)}
	 */
	query: (query) => get_elements._helper(Array.from(document.querySelectorAll(`${query}`))),

	/**
	 * @param {Element} element
	 * @param {DOM} dom
	 * @returns {(Element|Array<Element>)}
	 */
	closest_dom: (element, dom) => element.closest(`[data-dom="${dom}"]`),

	/**
	 * @param {(Element|Array<Element>)} result
	 * @returns {(Element|Array<Element>)}
	 */
	_helper: (result) => (result.length === 1 ? result[0] : result),
}

/**
 * @param {Element} element
 * @returns {string}
 */
function get_data(element) {
	if (element == null) return console.error('Invalid element', element)
	return JSON.parse(JSON.stringify(element?.dataset))
}

/**
 * @param {Element} element
 * @param {string} type
 * @param {string} data
 */
function set_data(element, type, data) {
	element.dataset[type] = data
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
		return Math.round(Math.random()) * 2 - 1
	}
	rng.array = function (a) {
		if (a == null || !Array.isArray(a)) return console.error('random function error: ', arguments)
		return a[rng.int(a.length)]
	}
	rng.object = function (o) {
		if (o == null || typeof o !== 'object') return console.error('random function error: ', arguments)
		return rng.array(Object.values(o))
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
