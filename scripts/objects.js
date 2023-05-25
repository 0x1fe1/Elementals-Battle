const ELEMENTS = {
	AIR: 'air',
	ENERGY: 'energy',
	FIRE: 'fire',
	NATURE: 'nature',
	ROCK: 'rock',
	WATER: 'water',
}

const ACTIONS = {
	ATTACK: 'attack',
	MOVE: 'move',
	SKIP: 'skip',
	CONFIRM: 'confirm',
}

const SPELLS = {
	FOREST_MASTER_STAFF: 'forest-master-staff',
	THE_LADY_OF_THE_LAKE_VIAL: 'the-lady-of-the-lake-vial',
	ANCIENT_FIGURINE: 'ancient-figurine',
	PENDULUM_OF_REVERSED_TIME: 'pendulum-of-reversed-time',
	METEOR_SHOWER: 'meteor-shower',
}

const LEVELS = [1, 2, 3]
const MAX_HEALTH = [1, 2, 6]
const DAMAGE = [1, 2, 4]
const REACH = [3, 5, 7]

const SPELL_MAX_CHARGE = {
	FOREST_MASTER_STAFF: 4,
	THE_LADY_OF_THE_LAKE_VIAL: 5,
	ANCIENT_FIGURINE: 7,
	PENDULUM_OF_REVERSED_TIME: 9,
	METEOR_SHOWER: 10,
}

const SPELL_DAMAGE = {
	THORN_VINES: 2,
	PYRAMID: 1,
	METEOR_SHOWER: 4,
}

const PLAYER_TYPE = {
	GREEN: 'green',
	BLUE: 'blue',
}

const GAME_STATE = {
	STARTED: 'started',
	WAITING: 'waiting', //? PLAYER INPUT
	RUNNING: 'running', //? GAME ANIMATIONS
	FINISHED: 'finished',
}

/** //* additional rules:
 ** 111 -> 020 ~ +1 point
 ** 222 -> 030 ~ +2 points
 **
 ** when a cell becomes inactive -> move the elemental up (does not trigger merge)
 */

const CLICK_LOG = {
	history: [],
	last: undefined,
}
CLICK_LOG.__proto__.update = function foo() {
	CLICK_LOG.history.push(CLICK_LOG.last)
	CLICK_LOG.last = null
}

class Game {
	constructor() {
		this.state = GAME_STATE.STARTED
		this.active_player = PLAYER_TYPE.GREEN

		this.controllers = {
			blue: new Controller(PLAYER_TYPE.BLUE).toggle_active(this.active_player === PLAYER_TYPE.BLUE),
			green: new Controller(PLAYER_TYPE.GREEN).toggle_active(this.active_player === PLAYER_TYPE.GREEN),
		}
		this.board = Board.default()

		this.game_loop()
	}

	set_event_listeners() {
		const fn = (element, type) => {
			let last_pointer_id = 0,
				has_moved = false

			//* prevent drag to another element causing it to activate
			element.addEventListener('pointerdown', (e) => {
				last_pointer_id = e.pointerId
			})

			//* prevent dragging over the element
			element.addEventListener('pointermove', (e) => {
				if (e.pointerType === 'mouse') return
				has_moved = true
			})

			//* actual event
			element.addEventListener('pointerup', (e) => {
				if (last_pointer_id !== e.pointerId) return
				if (has_moved) return (has_moved = false)

				let closest_element //? cell | spell | action
				if (type === 'board') closest_element = get_elements.closest_dom(e.target, 'cell')
				if (type === 'controller') closest_element = get_elements.closest_dom(e.target, 'spell') ?? get_elements.closest_dom(e.target, 'action')

				if (type === 'controller' && get_data(get_elements.closest_dom(e.target, 'controller')).active === 'false') return
				if (closest_element == null) return

				CLICK_LOG.history.push(CLICK_LOG.last)
				CLICK_LOG.last = closest_element
			})
		}

		fn(this.board.self, 'board')
		fn(this.controllers.blue.self, 'controller')
		fn(this.controllers.green.self, 'controller')
	}

	game_loop() {
		if (this.state === GAME_STATE.STARTED && (this.state = GAME_STATE.WAITING)) {
			console.log('GAME STARTED')

			this.board.insert_elementals()
			this.set_event_listeners()
		}

		if (this.state === GAME_STATE.WAITING && (this.state = GAME_STATE.RUNNING)) {
			console.log('GAME WAITING')
		} else if (this.state === GAME_STATE.RUNNING && (this.state = GAME_STATE.WAITING)) {
			console.log('GAME RUNNING')

			if (CLICK_LOG.last != null && get_data(CLICK_LOG.last).type === 'skip') {
				this.controllers.blue.toggle_active()
				this.controllers.green.toggle_active()
				this.active_player = this.active_player == PLAYER_TYPE.BLUE ? PLAYER_TYPE.GREEN : PLAYER_TYPE.BLUE
			}

			CLICK_LOG.update()
		}

		if (this.state === GAME_STATE.FINISHED) {
			console.log("GAME OVER - how in the Lord's name did you get here?")
		} //else setTimeout(() => this.game_loop(), 100)
	}
}

class Controller {
	constructor(player) {
		this.color = player
		this.self = get_elements.dom_player('controller', this.color)[0]
		this.spells = get_elements.dom_player('spell', this.color)
		this.actions = get_elements.dom_player('action', this.color)
	}

	toggle_active(forced_state) {
		toggle_active(this.self, forced_state)
		return this
	}
}

class Board {
	static default() {
		return new Board(get_cells().flat(), {
			green: [ELEMENTS.WATER, ELEMENTS.AIR],
			blue: [ELEMENTS.NATURE, ELEMENTS.ROCK],
		})
	}

	constructor(cells, elements) {
		this.cells = cells
		this.self = get_elements.dom('board')[0]
		this.elements = elements
		this.elementals = this.generate_elementals()
	}

	set_elements(elements) {
		this.elements = elements
	}

	generate_elementals() {
		const elementals = []
		const num = 30 - random.int(4, 6)

		for (let i = 0; i < num; i++) {
			Object.values(PLAYER_TYPE).forEach((player) => {
				if (this.elements[player].length === 0) return
				const cell = random.array(this.cells.flat().filter((c) => get_data(c).occupied === 'false' && get_data(c).player === player))
				elementals.push(new Elemental(random.array(this.elements[player]), 1).bind(cell))
			})
		}

		return elementals
	}

	insert_elementals() {
		this.elementals.forEach((e) => insert_elemental(e.data))
	}

	remove_elementals() {
		this.cells.forEach(remove_elemental)
	}

	find_elemental(cell) {
		return this.elementals.find((e) => get_data(e.cell).x === get_data(cell).x && get_data(e.cell).y === get_data(cell).y)
	}

	merge_cells(player) {
		if (player !== PLAYER_TYPE.BLUE && player !== PLAYER_TYPE.GREEN) return console.error('invalid player: ', player)
		const cells = get_cells(player)
		const [y1, y2] = [0, 4]
		const [x1, x2] = [0, 10]
		const cells_to_remove = new Set()
		const cells_to_upgrade = new Set()

		for (let y = y1; y < y2; y++) {
			for (let x = x1; x < x2; x++) {
				const check_area = []
				for (let j = y; j < y + 3; j++) for (let i = x; i < x + 3; i++) check_area.push(cells[i + j * 12])

				const result = this.check_merge(check_area)
				if (result.length === 0) continue
				// console.log({ area: { x, y }, check_area, result })
				// console.log(result.map((r) => check_area[r[1]]))

				result.forEach((config) => {
					cells_to_remove.add(check_area[config[0]])
					cells_to_upgrade.add(check_area[config[1]])
					cells_to_remove.add(check_area[config[2]])
				})
			}
		}

		console.log({ cells_to_remove, cells_to_upgrade })

		// cells_to_remove.forEach((pos) => remove_elemental(new_cells[pos.y][pos.x]))
	}

	check_merge(cells) {
		const elementals = cells.map((cell) => this.find_elemental(cell))

		const elements = elementals.map((e) => e?.element)
		const levels = elementals.map((e) => e?.level)
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
}

class Elemental {
	static random(default_element = null) {
		const element = default_element ?? random(Object.values(ELEMENTS))
		const level = random.weight([
			[LEVELS[0], 3],
			[LEVELS[1], 2],
			[LEVELS[2], 1],
		])
		return new Elemental(element, level)
	}

	constructor(element, level, health) {
		this.element = element
		this.level = level
		this.health = health ?? MAX_HEALTH[level - 1]

		this.hit = 0
		this.damage = DAMAGE[level - 1]
		this.reach = REACH[level - 1]

		this.cell = null
		this.pos = { x: null, y: null }

		return this
	}

	bind(cell) {
		set_data(cell, 'occupied', true)
		this.cell = cell
		this.pos.x = get_data(cell).x
		this.pos.y = get_data(cell).y
		return this
	}

	upgrade() {
		return new Elemental(this.element, Math.min(this.level + 1, LEVELS.at(-1)))
	}

	get data() {
		return {
			cell: this.cell,
			element: this.element,
			level: this.level,
			health: this.health,
			hit: this.hit,
			damage: this.damage,
			reach: this.reach,
		}
	}
}
