//#region //* Setup & Event Listeners
function setup() {
	insert_default_cells(document.querySelector('.board'))
	insert_gradients(document.querySelector('.gradients'))
	reset_data_attributes()
	set_modal_events()
	configure_settings()

	// document.querySelector('.open-modal').click()
}

function insert_default_cells(board) {
	for (let i = 0; i < 12; i++) {
		for (let j = 0; j < 12; j++) {
			const ld = i % 2 === j % 2 ? 'light' : 'dark'
			const gb = i < 6 ? 'green' : 'blue'
			board.innerHTML += `
            <div class="cell" data-occupied="false" 
                data-player="${i < 6 ? 'green' : 'blue'}"
                data-pos-x="${j}" data-pos-y="${i}"
                style="background: var(--cc-${ld}-${gb})${i < 6 ? '; rotate: 180deg' : ''}">
                <svg class="elemental" viewbox="0 0 100 100">
                    <path class="elemental-shape" />
                    <circle class="elemental-health-background" cx="50" cy="50" r="45" />
                    <path class="elemental-health-life" />
                    <path class="elemental-health-hit" />
                    <circle class="elemental-health-boundary" cx="50" cy="50" r="45" />
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
            <stop offset="10%" stop-color="var(--cc-gradient-${elements[i]}-1)" />
            <stop offset="90%" stop-color="var(--cc-gradient-${elements[i]}-2)" />
        </radialgradient>`
	}
	gradient_svg.innerHTML += gradients
}

function set_modal_events() {
	const modal = document.querySelector('.modal')
	const openModal = document.querySelector('.open-modal')
	const closeModal = document.querySelector('.close-modal')

	openModal.addEventListener('click', () => {
		modal.style.display = 'grid'
	})
	closeModal.addEventListener('click', () => {
		modal.style.display = 'none'
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

function reset_data_attributes() {
	;['.controller', '.ability', '.action', '.cell'].forEach((ec) =>
		Array.from(document.querySelectorAll(ec)).forEach((e) => (e.dataset.active = false)),
	)
	Array.from(document.querySelectorAll('.ability')).forEach((e) => {
		e.dataset.charge = ABILITY_MAX_CHARGE[e.dataset.type.replace('-', '_').toUpperCase()]
	})
}

function configure_settings() {
	const cells = get_cells()

	const inputs = Array.from(document.querySelectorAll('input'))
	const confirm_settings = document.querySelector('.close-modal')
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
	const cells_raw = Array.from(document.querySelectorAll('.cell'))
	const cells = new Array(12).fill().map((_, i) => new Array(12).fill().map((_, j) => cells_raw[j + i * 12]))
	if (type === 'green') return cells.filter((_, i) => i < 6)
	if (type === 'blue') return cells.filter((_, i) => i >= 6)
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
			const elemental = Elemental.random(random.array(elements[col])).bind(cell)
			if (random.float() < 0.5) elemental.health = random.int(1, MAX_HEALTH[elemental.level - 1] + 1)
			if (random.float() < 0.5) elemental.hit = random.int(elemental.health + 1)
			insert_elemental(elemental.data)
		})
	}
}

//TODO
function merge_cells(old_cells) {
	const new_cells = new Array(12).fill().map(() => new Array(12).fill())
	// exclude the edges, as they cannot be leveled up
	for (let i = 1; i < 3; i++) {
		for (let j = 1; j < 3; j++) {
			// i+0,j+0 i+1,j+0 i+1,j+0   i+0,j+1 i+1,j+1 i+1,j+1   i+0,j+2 i+1,j+2 i+1,j+2
			const cells_to_check = cells.slice(i - 1, i + 2).map((row) => row.slice(j - 1, j + 2))
			console.log(cells_to_check)
		}
	}
}
//#endregion

//#region //* Helpers
function debug_display_variants(element) {
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
