//#region //* Setup
function setup() {
	generate_default_cells(document.querySelector('.board'))
	generate_gradients(document.querySelector('.gradients'))
	set_modal()
	reset_active_data(['.controller', '.ability', '.action', '.cell'])

	// document.querySelector('.open-modal').click()
}

function generate_default_cells(board) {
	for (let i = 0; i < 12; i++) {
		for (let j = 0; j < 12; j++) {
			const ld = i % 2 === j % 2 ? 'light' : 'dark'
			const gb = i < 6 ? 'green' : 'blue'
			board.innerHTML += `
            <div class="cell" data-occupied="false" 
                data-player="${i < 6 ? 'green' : 'blue'}"
                data-pos-x="${j}" data-pos-y="${i}"
                style="background: var(--cc-${ld}-${gb})${i < 6 ? '; rotate: 180deg' : ''}">
                <svg class="elemental" viewbox="0 0 1 1">
                    <path class="elemental-shape"/>
                    <path class="elemental-health-background"/>
                    <path class="elemental-health-life"/>
                    <path class="elemental-health-hit"/>
                    <path class="elemental-health-boundary"/>
                </svg>
            </div>`
		}
	}
}

function generate_gradients(gradient_svg) {
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

function set_modal() {
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

function reset_active_data(classes) {
	classes.forEach((ec) => Array.from(document.querySelectorAll(ec)).forEach((e) => (e.dataset.active = false)))
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

function generate_cells(cells, elements_green, elements_blue) {
	const foo = (cell, elements) => {
		const elemental = Elemental.random(random(elements)).bind(cell)
		elemental.health = random('i', 1, elemental.health)
		if (random() < 0.25) elemental.hit = random('i', 0, elemental.health + 1)
		insert_elemental(elemental.data)
	}

	const num = random('i', 27, 33)
	for (let i = 0; i < num; i++) {
		if (elements_green.length > 0) {
			const cell_green = random(cells.flat().filter((c) => c.dataset.occupied === 'false' && c.dataset.posY < 5))
			foo(cell_green, elements_green)
		}
		if (elements_blue.length > 0) {
			const cell_blue = random(cells.flat().filter((c) => c.dataset.occupied === 'false' && c.dataset.posY > 6))
			foo(cell_blue, elements_blue)
		}
	}
}
//#endregion

//#region //* Helpers
function random() {
	const args = Array.from(arguments)
	if (args.length === 0) return Math.random()

	if (args.length === 1) {
		if (typeof args[0] === 'number') return Math.random() * args[0]
		if (Array.isArray(args[0])) return args[0][Math.floor(Math.random() * args[0].length)]
		return console.error('random function error: ', args)
	}

	if (args[0] === 'shuffle' || args[0] === 's') {
		const array = args[1]
		let currentIndex = array.length,
			randomIndex

		while (currentIndex != 0) {
			randomIndex = Math.floor(Math.random() * currentIndex)
			currentIndex--
			;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
		}

		return array
	}

	if (args[0] === 'int' || args[0] === 'i') {
		return Math.floor(random(...args.slice(1)))
	}

	if (args[0] === 'weights' || args[0] === 'w') {
		const weights = args[1]
		const sum = weights.reduce((a, b) => a + b)
		const value = random(sum)
		for (let i = 0, t = 0; i < weights.length; i++) {
			if (value < t) return i - 1
			t += weights[i]
		}
		return weights.length - 1
	}

	if (args[0] === 'divide' || args[0] === 'd') {
		const num = args[2] ?? 1
		let value = (args[1] ?? 1) / num

		// const points = new Array(num - 1)
		// 	.fill()
		// 	.map((_) => random(value))
		// 	.sort()
		// const result = points.map((p, i) => (i === 0 ? p : p - points[i - 1]))
		// result[num - 1] = value - points[num - 2]

		const result = new Array(num).fill(-1)
		const n = getNoise(args[3])
		for (let i = 0; i < num; i++) {
			value -= result[i] = i === num - 1 ? value : value * n
		}

		return random('s', result)
	}

	if (args.length === 2) {
		if (typeof args[0] === 'number' && typeof args[1] === 'number')
			return args[0] + (args[1] - args[0]) * Math.random()
		return console.error('random function error: ', args)
	}

	return console.error('random function error: ', args)
}
//#endregion
