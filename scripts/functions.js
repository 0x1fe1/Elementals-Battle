//#region //* Setup & Event Listeners
function setup() {
	// updateViewportSize()
	insert_default_cells(document.querySelector('[data-dom="board"]'))
	insert_gradients(document.querySelector('.gradients'))
	reset_data_attributes()
	set_modal_events()
	set_cell_spell_action_events()
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
            <div data-dom="cell" data-occupied="false" 
                data-player="${i < 6 ? 'blue' : 'green'}"
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
            <stop offset="100%" stop-color="var(--gradient-${elements[i]}-2)" />
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

function set_cell_spell_action_events() {
	const cells_dom = get_elements.dom('cell')
	const actions_dom = get_elements.dom('action')
	const abilities_dom = get_elements.dom('spell')

	;[...cells_dom, ...actions_dom, ...abilities_dom].forEach((element) => {
		let last_pointerId = 0,
			has_moved = false
		element.addEventListener('pointerdown', (e) => {
			last_pointerId = e.pointerId
		})
		element.addEventListener('pointermove', (e) => {
			if (e.pointerType === 'mouse') return
			has_moved = true
		})
		element.addEventListener('pointerup', (e) => {
			if (last_pointerId !== e.pointerId) return
			if (has_moved) return (has_moved = false)

			const element_dom = get_data(e.target).dom
			if (!/cell|action|spell/.test(element_dom)) return console.error(element_dom, e)

			let target, true_dom
			if (/\b(cell|action|spell)\b/.test(element_dom)) [target, true_dom] = [e.target, element_dom]
			if (element_dom === 'cell_svg') [target, true_dom] = [e.target.parentElement, 'cell']
			if (element_dom === 'cell_path') [target, true_dom] = [e.target.parentElement.parentElement, 'cell']
			if (element_dom === 'spell_img') [target, true_dom] = [e.target.parentElement, 'spell']

			handle_click(target, true_dom)
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

		const elements = { green: foo('green'), blue: foo('blue') }

		clear_cells(cells)
		generate_cells(cells, elements)
	})
}

function reset_data_attributes() {
	//* Active States
	;['controller', 'spell', 'action', 'cell'].forEach((ec) => get_elements.dom(ec).forEach(deactivate))

	//* Which Player
	;['green', 'blue'].forEach((c) => {
		get_elements
			.query(`[data-dom="controller"][data-player="${c}"] :is([data-dom="spell"],[data-dom="action"])`)
			.forEach((e) => (e.dataset.player = c))
	})

	//* Ability Charges
	get_elements.dom('spell').forEach((e) => {
		const type = e.dataset.type.replaceAll('-', '_').toUpperCase()
		set_data(e, 'charge', random.int(SPELL_MAX_CHARGE[type]))
		set_data(e, 'maxCharge', SPELL_MAX_CHARGE[type])
	})
}
//#endregion

//#region //* General
function insert_elemental({ cell, element, level = 1, health = 1, hit = 0 }) {
	cell.dataset.occupied = true
	cell.dataset.element = element
	cell.dataset.level = level
	cell.dataset.health = health
	cell.dataset.hit = hit
}

function remove_elemental(cell) {
	cell.dataset['occupied'] = 'false'
}

function get_cells(type) {
	const cells_raw = get_elements.dom('cell')
	const cells = new Array(12).fill().map((_, i) => new Array(12).fill().map((_, j) => cells_raw[j + i * 12]))
	if (type === 'green') return cells.slice(0, 6)
	if (type === 'blue') return cells.slice(6, 12)
	return cells
}

function clear_cells(cells) {
	cells.flat().forEach((cell) => remove_elemental(cell))
}

function generate_cells(cells, elements) {
	const num = 30 + random.sign() * 3
	for (let i = 0; i < num; i++) {
		;['green', 'blue'].forEach((col) => {
			if (elements[col].length === 0) return
			const cell = random.array(
				cells.flat().filter((c) => c.dataset.occupied === 'false' && c.dataset.player === col),
			)
			const elemental = new Elemental(random.array(elements[col]), 1).bind(cell)
			insert_elemental(elemental.data)
		})
	}
}

function activate(element) {
	element.dataset.active = true
}
function deactivate(element) {
	element.dataset.active = false
}

function merge_cells(old_cells) {
	const new_cells = new Array(12).fill().map(() => new Array(12).fill())
	for (let y = 1; y < 11; y++) {
		for (let x = 1; x < 11; x++) {
			if (y === 5 || y === 6) continue
			const cells_to_check = old_cells
				.slice(y - 1, y + 2)
				.map((row) => row.slice(x - 1, x + 2))
				.flat()
			const result = check_merge(cells_to_check)
			if (result.length === 0) continue

			result.forEach((config) => {
				// remove_elemental(cells_to_check[config[0]])
				// remove_elemental(cells_to_check[config[2]])
				activate(cells_to_check[config[1]])
				// console.dir(cells_to_check[config[1]])
			})
		}
	}
}

function check_merge(cells) {
	const elements = cells.map((cell) => get_data(cell).element ?? null)
	const levels = cells.map((cell) => get_data(cell).level ?? null)
	const configurations = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	]
	const result = configurations.filter((config) => {
		const config_elements = config.map((i) => elements[i])
		const config_levels = config.map((i) => levels[i])
		return allEqualNotNull(config_elements) && allEqualNotNull(config_levels)
	})
	return result
}

function handle_click(target) {
	const target_dom = get_data(target).dom
	get_elements.query(`[data-active="true"][data-dom="${target_dom}"]`).forEach(deactivate)
	activate(target)

	// console.dir(target.dataset)
	if (target_dom === 'action') {
		const action_type = get_data(target).type
		if (action_type === 'confirm') {
			merge_cells(get_cells())
		}
	}
}
//#endregion

//#region //* Helpers

const get_elements = {
	dom: (query) => Array.from(document.querySelectorAll(`[data-dom="${query}"]`)),
	data: (data, query) => Array.from(document.querySelectorAll(`[data-${data}="${query}"]`)),
	query: (query) => Array.from(document.querySelectorAll(`${query}`)),
}
function get_data(element) {
	return JSON.parse(JSON.stringify(element.dataset))
}

function allEqualNotNull(array) {
	return array.every((v) => v === array[0] && v !== null)
}

function set_data(element, type, data) {
	element.dataset[type] = data
}

function debug_display_variants(element) {
	const cells = get_cells()
	// level 1
	insert_elemental({ cell: cells[0][0], element, level: 1, health: 1, hit: 0 })
	insert_elemental({ cell: cells[1][0], element, level: 1, health: 1, hit: 1 })

	// level 2
	insert_elemental({ cell: cells[0][2], element, level: 2, health: 1, hit: 0 })
	insert_elemental({ cell: cells[1][2], element, level: 2, health: 1, hit: 1 })

	insert_elemental({ cell: cells[3][2], element, level: 2, health: 2, hit: 0 })
	insert_elemental({ cell: cells[4][2], element, level: 2, health: 2, hit: 1 })
	insert_elemental({ cell: cells[5][2], element, level: 2, health: 2, hit: 2 })

	// level 3
	insert_elemental({ cell: cells[0][4], element, level: 3, health: 1, hit: 0 })
	insert_elemental({ cell: cells[1][4], element, level: 3, health: 1, hit: 1 })

	insert_elemental({ cell: cells[3][4], element, level: 3, health: 2, hit: 0 })
	insert_elemental({ cell: cells[4][4], element, level: 3, health: 2, hit: 1 })
	insert_elemental({ cell: cells[5][4], element, level: 3, health: 2, hit: 2 })

	insert_elemental({ cell: cells[7][4], element, level: 3, health: 3, hit: 0 })
	insert_elemental({ cell: cells[8][4], element, level: 3, health: 3, hit: 1 })
	insert_elemental({ cell: cells[9][4], element, level: 3, health: 3, hit: 2 })

	insert_elemental({ cell: cells[0][6], element, level: 3, health: 4, hit: 0 })
	insert_elemental({ cell: cells[1][6], element, level: 3, health: 4, hit: 1 })
	insert_elemental({ cell: cells[2][6], element, level: 3, health: 4, hit: 2 })
	insert_elemental({ cell: cells[3][6], element, level: 3, health: 4, hit: 4 })

	insert_elemental({ cell: cells[5][6], element, level: 3, health: 5, hit: 0 })
	insert_elemental({ cell: cells[6][6], element, level: 3, health: 5, hit: 1 })
	insert_elemental({ cell: cells[7][6], element, level: 3, health: 5, hit: 2 })
	insert_elemental({ cell: cells[8][6], element, level: 3, health: 5, hit: 4 })

	insert_elemental({ cell: cells[0][8], element, level: 3, health: 6, hit: 0 })
	insert_elemental({ cell: cells[1][8], element, level: 3, health: 6, hit: 1 })
	insert_elemental({ cell: cells[2][8], element, level: 3, health: 6, hit: 2 })
	insert_elemental({ cell: cells[3][8], element, level: 3, health: 6, hit: 4 })
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
