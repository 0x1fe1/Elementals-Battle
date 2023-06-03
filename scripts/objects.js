const BOARD_SIZE = 12

/** @enum {string} */
const ELEMENT = {
	AIR: 'air',
	ROCK: 'rock',
	FIRE: 'fire',
	WATER: 'water',
	NATURE: 'nature',
	ENERGY: 'energy',
}

/** @enum {string} */
const ACTIONS = {
	ATTACK: 'attack',
	MOVE: 'move',
	SKIP: 'skip',
	CONFIRM: 'confirm',
}

/** @enum {string} */
const SPELLS = {
	FOREST_MASTER_STAFF: 'forest-master-staff',
	THE_LADY_OF_THE_LAKE_VIAL: 'the-lady-of-the-lake-vial',
	ANCIENT_FIGURINE: 'ancient-figurine',
	PENDULUM_OF_REVERSED_TIME: 'pendulum-of-reversed-time',
	METEOR_SHOWER: 'meteor-shower',
}
/** @enum {number} */
const LEVEL = {
	0: 1,
	1: 2,
	2: 3,
}

/** @enum {number} */
const MAX_HEALTH = {
	0: 1,
	1: 2,
	2: 6,
}

/** @enum {number} */
const DAMAGE = {
	0: 1,
	1: 2,
	2: 4,
}

/** @enum {number} */
const REACH = {
	0: 3,
	1: 5,
	2: 7,
}

/** @enum {number} */
const SPELL_MAX_CHARGE = {
	FOREST_MASTER_STAFF: 4,
	THE_LADY_OF_THE_LAKE_VIAL: 5,
	ANCIENT_FIGURINE: 7,
	PENDULUM_OF_REVERSED_TIME: 9,
	METEOR_SHOWER: 10,
}

/** @enum {number} */
const SPELL_DAMAGE = {
	THORN_VINES: 2,
	PYRAMID: 1,
	METEOR_SHOWER: 4,
}

/** @enum {string} */
const PLAYER_TYPE = {
	GREEN: 'green',
	BLUE: 'blue',
}

/** @enum {string} */
const GAME_STATE = {
	STARTED: 'started',
	WAITING: 'waiting', //? PLAYER INPUT
	RUNNING: 'running', //? GAME ANIMATIONS
	FINISHED: 'finished',
}

/** @enum {string} */
const DOM = {
	BOARD: 'board',
	CONTROLLER: 'controller',
	CELL: 'cell',
	SPELL: 'spell',
	ACTION: 'action',
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
				if (type === DOM.BOARD) closest_element = get_elements.closest_dom(e.target, DOM.CELL)
				if (type === DOM.CONTROLLER) closest_element = get_elements.closest_dom(e.target, DOM.SPELL) ?? get_elements.closest_dom(e.target, DOM.ACTION)

				if (type === DOM.CONTROLLER && get_data(get_elements.closest_dom(e.target, DOM.CONTROLLER)).active === 'false') return
				if (closest_element == null) return

				CLICK_LOG.history.push(CLICK_LOG.last)
				CLICK_LOG.last = closest_element
			})
		}

		fn(this.board.self, DOM.BOARD)
		fn(this.controllers.blue.self, DOM.CONTROLLER)
		fn(this.controllers.green.self, DOM.CONTROLLER)
	}

	game_loop() {
		if (this.state === GAME_STATE.STARTED && (this.state = GAME_STATE.WAITING)) {
			// console.log('GAME STARTED')

			this.board.insert_elementals()
			this.set_event_listeners()
		}

		if (this.state === GAME_STATE.WAITING && (this.state = GAME_STATE.RUNNING)) {
			// console.log('GAME WAITING')
		} else if (this.state === GAME_STATE.RUNNING && (this.state = GAME_STATE.WAITING)) {
			// console.log('GAME RUNNING')

			if (CLICK_LOG.last != null && get_data(CLICK_LOG.last).type === 'skip') {
				this.controllers.blue.toggle_active()
				this.controllers.green.toggle_active()
				this.active_player = this.active_player == PLAYER_TYPE.BLUE ? PLAYER_TYPE.GREEN : PLAYER_TYPE.BLUE
			}

			CLICK_LOG.update()
		}

		if (this.state === GAME_STATE.FINISHED) {
			console.log("GAME OVER - how in the Lord's name did you get here?")
			alert("GAME OVER - how in the Lord's name did you get here?")
		} else setTimeout(() => this.game_loop(), 1)
	}
}

class Controller {
	constructor(player) {
		this.color = player
		this.self = get_elements.dom_player(DOM.CONTROLLER, this.color)
		this.actions = get_elements.dom_player(DOM.ACTION, this.color)
		this.spells = get_elements.dom_player(DOM.SPELL, this.color)
		this.charges = Object.keys(SPELLS)
	}

	/**
	 * @param {boolean} forced_state
	 * @returns {Board}
	 */
	toggle_active(forced_state) {
		toggle_active(this.self, forced_state)
		return this
	}
}

class Board {
	static default() {
		return new Board(get_cells(), {
			green: [ELEMENT.WATER, ELEMENT.AIR],
			blue: [ELEMENT.NATURE, ELEMENT.ROCK],
		})
	}

	/**
	 * @param {Array<HTMLElement>} cells
	 * @param {Array<ELEMENT>} elements
	 * @returns {Board}
	 */
	constructor(cells, elements) {
		this.cells = cells
		this.self = get_elements.dom(DOM.BOARD)
		this.elements = elements
		this.elementals = this.generate_elementals()
	}

	/**
	 * @returns {Array<Elemental>}
	 */
	generate_elementals() {
		const elementals = []
		const num = 30 + random.sign() * random.int(4)
		for (let i = 0; i < num; i++) {
			Object.values(PLAYER_TYPE).forEach((player) => {
				if (this.elements[player].length === 0) return
				const cell = random.array(this.cells.filter((c) => get_data(c).occupied === 'false' && get_data(c).player === player))
				elementals.push(new Elemental(random.array(this.elements[player]), 1).bind(cell))
			})
		}
		return elementals
	}

	/**
	 * @param {ELEMENT} elements
	 * @returns {Board}
	 */
	set_elements(elements) {
		this.elements = elements
		return this
	}

	/**
	 * @returns {Board}
	 */
	insert_elementals() {
		this.elementals.forEach((e) => insert_elemental(e.data))
		return this
	}

	/**
	 * @param {HTMLElement} cell
	 * @returns {Elemental}
	 */
	find_elemental(cell) {
		return this.elementals.find((e) => e.pos.x === get_data(cell).x && e.pos.y === get_data(cell).y)
	}

	/**
	 * @param {HTMLElement} cell
	 * @param {Elemental} elemental
	 * @returns {Board}
	 */
	set_elemental(cell, elemental) {
		this.elementals.push(elemental.bind(cell))
		return this
	}

	/**
	 * @returns {Board}
	 */
	remove_elementals() {
		this.cells.forEach((cell) => {
			this.remove_elemental(cell)
		})
		return this
	}

	/**
	 * @param {HTMLElement} cell
	 * @param {Elemental} elemental
	 * @returns {Board}
	 */
	remove_elemental(cell, elemental) {
		const elemental_ = elemental ?? this.find_elemental(cell)
		this.elementals.splice(this.elementals.indexOf(elemental_), 1)
		reset_cell_elemental(cell, true)
		return this
	}

	/**
	 * @param {PLAYER_TYPE} player
	 * @returns {Board}
	 */
	merge_cells(player) {
		if (player !== PLAYER_TYPE.BLUE && player !== PLAYER_TYPE.GREEN) return console.error('invalid player: ', player)
		const cells = get_cells(player)
		const [y1, y2] = [0, 3]
		const [x1, x2] = [0, 9]
		const id_to_remove = new Set()
		const id_to_upgrade = new Set()

		for (let y = y1; y <= y2; y++) {
			for (let x = x1; x <= x2; x++) {
				const check_area = []
				for (let j = y; j < y + 3; j++) for (let i = x; i < x + 3; i++) check_area.push(cells[i + j * BOARD_SIZE])

				const result = this.check_merge(check_area)
				if (result.length === 0) continue

				result.forEach((config) => {
					id_to_remove.add(get_data(check_area[config[0]]).id)
					id_to_upgrade.add(get_data(check_area[config[1]]).id)
					id_to_remove.add(get_data(check_area[config[2]]).id)
				})
			}
		}

		for (const id of id_to_upgrade) id_to_remove.delete(id)

		console.log({ id_to_remove, id_to_upgrade })

		for (const id of id_to_remove) this.remove_elemental(get_elements.data(DOM.CELL, 'id', id))
		for (const id of id_to_upgrade) this.find_elemental(get_elements.data(DOM.CELL, 'id', id)).upgrade()

		return this
	}

	/**
	 * @param {Array<HTMLElement>} cells
	 * @returns {Array<number>}
	 */
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

			const elements_ok = config_elements.every((e) => e === config_elements[0] && e != null)
			const levels_ok = config_levels.every((l) => l !== LEVEL[2] && l === config_levels[0] && l != null)

			return elements_ok && levels_ok
		})

		return result
	}
}

class Elemental {
	/**
	 * @param {ELEMENT} default_element
	 * @returns {Elemental}
	 */
	static random(default_element = null) {
		const element = default_element ?? random(Object.values(ELEMENT))
		const level = random.weight([
			[LEVEL[0], 3],
			[LEVEL[1], 2],
			[LEVEL[2], 1],
		])
		return new Elemental(element, level)
	}

	/**
	 * @param {ELEMENT} element
	 * @param {LEVEL} level
	 * @returns {Elemental}
	 */
	constructor(element, level) {
		this.element = element
		this.level = parseInt(level)

		this.health = MAX_HEALTH[this.level - 1]
		this.damage = DAMAGE[this.level - 1]
		this.reach = REACH[this.level - 1]

		this.cell = null
		this.pos = { x: null, y: null }

		return this
	}

	/**
	 * @param {HTMLElement} cell
	 * @returns {Elemental}
	 */
	bind(cell) {
		set_data(cell, 'occupied', true)
		this.cell = cell
		this.pos.x = get_data(cell).x
		this.pos.y = get_data(cell).y
		return this
	}

	/**
	 * @returns {Elemental}
	 */
	upgrade() {
		this.level = Math.min(this.level + 1, LEVEL[2])
		this.damage = DAMAGE[this.level - 1]
		this.health = MAX_HEALTH[this.level - 1]
		this.update_cell()
		return this
	}

	/**
	 * @returns {Elemental}
	 */
	update_cell() {
		reset_cell_elemental(this.cell)
		insert_elemental(this.data)
		return this
	}

	/**
	 * @returns {Object<string, string>} `[[data]]` - all properties
	 */
	get data() {
		return {
			cell: this.cell,
			element: this.element,
			level: this.level,
			health: this.health,
			damage: this.damage,
			reach: this.reach,
		}
	}
}
