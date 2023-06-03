const BOARD_SIZE = 12

//#region //* Types

/**
 * @typedef  {Object}         BOARD_ELEMENTS
 * @property {Array<ELEMENT>} green
 * @property {Array<ELEMENT>} blue
 */

/**
 * * `CELL_ID := "X-Y"`
 * @typedef {string} CELL_ID
 */

/**
 * @typedef  {Object}          DOMElement
 * @property {Element}         self
 * @property {DOM}             dom
 * @property {?(ACTION|SPELL)} type
 * @property {PLAYER_TYPE}     player
 */

/**
 * @typedef {Object}  POSITION
 * @property {number} x
 * @property {number} y
 */

const DOM = {
	BOARD: 'board',
	CONTROLLER: 'controller',
	CELL: 'cell',
	SPELL: 'spell',
	ACTION: 'action',
}
const DIRECTION = {
	NULL: 'null',
	N: 'n',
	NE: 'ne',
	E: 'e',
	SE: 'se',
	S: 's',
	SW: 'sw',
	W: 'w',
	NW: 'nw',
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
const ELEMENT = {
	AIR: 'air',
	ROCK: 'rock',
	FIRE: 'fire',
	WATER: 'water',
	NATURE: 'nature',
	ENERGY: 'energy',
}
const ACTION = {
	ATTACK: 'attack',
	MOVE: 'move',
	SKIP: 'skip',
	CONFIRM: 'confirm',
}
const SPELL = {
	FOREST_MASTER_STAFF: 'forest-master-staff',
	THE_LADY_OF_THE_LAKE_VIAL: 'the-lady-of-the-lake-vial',
	ANCIENT_FIGURINE: 'ancient-figurine',
	PENDULUM_OF_REVERSED_TIME: 'pendulum-of-reversed-time',
	METEOR_SHOWER: 'meteor-shower',
}
const LEVEL = {
	0: 1,
	1: 2,
	2: 3,
}
const MAX_HEALTH = {
	0: 1,
	1: 2,
	2: 6,
}
const DAMAGE = {
	0: 1,
	1: 2,
	2: 4,
}
const REACH = {
	0: 3,
	1: 5,
	2: 7,
}
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

//#endregion

/*
 * additional rules:
 * 111 -> 020 ~ +1 point
 * 222 -> 030 ~ +2 points
 *
 * when a cell becomes inactive -> move the elemental up (does not trigger merge)
 */

const CLICK_LOG = {
	/** @type {Array<?DOMElement>} */
	history: [],

	/** @type {?DOMElement} - {@link DOMElement} */
	last: null,
}
CLICK_LOG.__proto__.last_is_some = () => {
	return CLICK_LOG.last != null // && CLICK_LOG.last.self != null && CLICK_LOG.last.player != null
}

CLICK_LOG.__proto__.last_is_none = () => {
	return CLICK_LOG.last == null // || CLICK_LOG.last.self == null || CLICK_LOG.last.player == null
}

/**
 * @param {?DOMElement} new_last
 */
CLICK_LOG.__proto__.update_last = (new_last) => {
	CLICK_LOG.update_history()
	if (new_last == null) return

	CLICK_LOG.last = new_last
	toggle_active(CLICK_LOG.last.self, true)
}

CLICK_LOG.__proto__.update_history = () => {
	if (CLICK_LOG.last == null) return

	toggle_active(CLICK_LOG.last.self, false)

	CLICK_LOG.history.push(CLICK_LOG.last)
	CLICK_LOG.last = null

	console.log(CLICK_LOG)
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
				if (type === DOM.BOARD) closest_element = document_get.closest_dom(e.target, DOM.CELL)
				if (type === DOM.CONTROLLER)
					closest_element =
						document_get.closest_dom(e.target, DOM.SPELL) ?? document_get.closest_dom(e.target, DOM.ACTION)

				if (
					type === DOM.CONTROLLER &&
					get_data(document_get.closest_dom(e.target, DOM.CONTROLLER)).active === 'false'
				)
					return
				if (closest_element == null) return

				CLICK_LOG.update_last({
					self: closest_element ?? null,
					player: get_data(closest_element).player ?? null,
					type: get_data(closest_element).type ?? null,
					dom: get_data(closest_element).dom ?? null,
				})
			})
		}

		fn(this.board.self, DOM.BOARD)
		fn(this.controllers.blue.self, DOM.CONTROLLER)
		fn(this.controllers.green.self, DOM.CONTROLLER)
	}

	/**
	 * * Main Loop Function
	 *
	 * Workflow: `START -> [(WAIT|RUN); N] -> END`
	 */
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

			if (CLICK_LOG.last_is_some()) {
				if (CLICK_LOG.last.type === 'skip') {
					this.controllers.blue.toggle_active()
					this.controllers.green.toggle_active()
					this.active_player = this.active_player == PLAYER_TYPE.BLUE ? PLAYER_TYPE.GREEN : PLAYER_TYPE.BLUE
				}
				// if (CLICK_LOG.last.type === 'confirm') {
				// 	this.controllers.blue.toggle_active()
				// 	this.controllers.green.toggle_active()
				// 	this.active_player = this.active_player == PLAYER_TYPE.BLUE ? PLAYER_TYPE.GREEN : PLAYER_TYPE.BLUE
				// }
			}
			CLICK_LOG.update_history()
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
		this.self = document_get.dom_player(DOM.CONTROLLER, this.color)
		this.actions = document_get.dom_player(DOM.ACTION, this.color)
		this.spells = document_get.dom_player(DOM.SPELL, this.color)
		this.charges = Object.entries(SPELL).map((entry) => [entry[0], SPELL_MAX_CHARGE[entry[0]]])
	}

	/**
	 * @param {boolean} forced_state
	 * @returns {Board}
	 */
	toggle_active(forced_state) {
		toggle_active(this.self, forced_state)
		return this
	}

	add_charge(charge) {
		this.charges.forEach((key, i) => {
			this.charges[i][1] = Math.min(this.charges[i][1] + charge, SPELL_MAX_CHARGE[key])
		})

		// this.spells.forEach(spell => {

		// })
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
		this.self = document_get.dom(DOM.BOARD)
		this.elements = elements
		this.elementals = this.generate_elementals()
	}

	/** @returns {Array<Elemental>} */
	generate_elementals() {
		const elementals = []
		const num = 30 + random.sign() * random.int(4)
		for (let i = 0; i < num; i++) {
			Object.values(PLAYER_TYPE).forEach((player) => {
				if (this.elements[player].length === 0) return
				const cell = random.array(
					this.cells.filter((c) => get_data(c).occupied === 'false' && get_data(c).player === player),
				)
				elementals.push(new Elemental(random.array(this.elements[player]), 1).bind(cell))
			})
		}
		return elementals
	}

	/**
	 * @param {BOARD_ELEMENTS} elements
	 * @returns {Board}
	 */
	set_elements(elements) {
		this.elements = elements
		return this
	}

	/** @returns {Board} */
	insert_elementals() {
		this.elementals.forEach((e) => insert_elemental(e.data))
		return this
	}

	/**
	 * @param {CELL_ID} cell_id
	 * @returns {?Elemental}
	 */
	find_elemental(cell_id) {
		const cell = document_get.data(DOM.CELL, 'id', cell_id)
		return this.elementals.find((e) => e.pos.x === get_data(cell).x && e.pos.y === get_data(cell).y)
	}

	/**
	 * @param {CELL_ID} cell_id
	 * @param {Elemental} elemental
	 * @returns {Board}
	 */
	set_elemental(cell_id, elemental) {
		const cell = document_get.data(DOM.CELL, 'id', cell_id)
		reset_cell_elemental(cell)
		this.elementals.push(elemental.bind(cell))
		insert_elemental(elemental.data)
		return this
	}

	/** @returns {Board} */
	remove_all_elementals() {
		this.cells.forEach((cell) => {
			this.remove_elemental(get_data(cell).id)
		})
		return this
	}

	/**
	 * @param {CELL_ID} cell_id
	 * @param {?DIRECTION} dir
	 * @returns {Board}
	 */
	remove_elemental(cell_id, dir = null) {
		const cell = document_get.data(DOM.CELL, 'id', cell_id)
		const elemental = this.find_elemental(cell_id)
		if (elemental == null) {
			reset_cell_elemental(cell, dir)
			return this
		}

		for (var index = 0; index < this.elementals.length; index++)
			if (this.elementals[index].id === elemental.id) break

		this.elementals.splice(index, 1)
		reset_cell_elemental(cell, dir)
		return this
	}

	/**
	 * @param {PLAYER_TYPE} player
	 * @returns {Board}
	 */
	merge_cells(player) {
		if (player !== PLAYER_TYPE.BLUE && player !== PLAYER_TYPE.GREEN)
			return console.error('invalid player: ', player)

		/** @type {Array<CELL_ID>} */
		const ids = get_cells(player).map((cell) => get_data(cell).id)

		const [y1, y2] = [0, 3]
		const [x1, x2] = [0, 9]

		const to_remove = {
			/** @type {Array<CELL_ID>} */
			id: [],
			/** @type {Array<DIRECTION>} */
			dir: [],
		}

		const to_ascend = {
			/** @type {Array<CELL_ID>} */
			id: [],
		}

		for (let y = y1; y <= y2; y++) {
			for (let x = x1; x <= x2; x++) {
				const check_area = []
				for (let j = y; j < y + 3; j++) for (let i = x; i < x + 3; i++) check_area.push(ids[i + j * BOARD_SIZE])

				const results = this.check_merge(check_area)
				if (results.length === 0) continue

				results.forEach((result) => {
					to_remove.id.push(check_area[result.config[0]])
					to_remove.dir.push(check_area[result.dir[0]])

					to_ascend.id.push(check_area[result.config[1]])

					to_remove.id.push(check_area[result.config[2]])
					to_remove.dir.push(check_area[result.dir[1]])
				})
			}
		}

		//? remove duplicates inside
		to_remove.id.forEach((id, i) => {
			if (to_remove.id.indexOf(id) !== i) {
				const index = to_remove.id.indexOf(id)
				to_remove.id.splice(index, 1)
			}
		})

		//? remove duplicates inside
		to_ascend.id.forEach((id, i) => {
			if (to_ascend.id.indexOf(id) !== i) {
				const index = to_ascend.id.indexOf(id)
				to_ascend.id.splice(index, 1)
			}
		})

		//? remove duplicates outside
		to_ascend.id.forEach((id, i) => {
			if (to_remove.id.includes(id)) {
				const index = to_remove.id.indexOf(id)
				to_remove.id.splice(index, 1)
				to_remove.dir.splice(index, 1)
			}
		})

		const ascended = []

		to_remove.id.forEach((id) => {
			this.remove_elemental(id, id.dir)
		})
		to_ascend.id.forEach((id) => {
			ascended.push(this.find_elemental(id).ascend().level)
		})

		// console.log({ to_remove, to_ascend, ascended })
		ascended.forEach((level) => {
			game.controllers.player.add_charge(level === 2 ? 1 : level === 3 ? 2 : 0)
		})

		return this
	}

	/**
	 * @param {Array<CELL_ID>} ids
	 * @returns {Array<number>}
	 */
	check_merge(ids) {
		const elementals = ids.map((id) => this.find_elemental(id))
		const elements = elementals.map((e) => e?.element)
		const levels = elementals.map((e) => e?.level)
		const configurations = [
			{ config: [0, 1, 2], dir: [DIRECTION.E, DIRECTION.W] },
			{ config: [3, 4, 5], dir: [DIRECTION.E, DIRECTION.W] },
			{ config: [6, 7, 8], dir: [DIRECTION.E, DIRECTION.W] },
			{ config: [0, 3, 6], dir: [DIRECTION.S, DIRECTION.N] },
			{ config: [1, 4, 7], dir: [DIRECTION.S, DIRECTION.N] },
			{ config: [2, 5, 8], dir: [DIRECTION.S, DIRECTION.N] },
			{ config: [0, 4, 8], dir: [DIRECTION.SE, DIRECTION.NW] },
			{ config: [2, 4, 6], dir: [DIRECTION.SW, DIRECTION.NE] },
		]

		const result = configurations.filter((configuration) => {
			const config_elements = configuration.config.map((i) => elements[i])
			const config_levels = configuration.config.map((i) => levels[i])

			const elements_ok = config_elements.every((e) => e === config_elements[0] && e != null)
			const levels_ok = config_levels.every((l) => l !== LEVEL[2] && l === config_levels[0] && l != null)

			return elements_ok && levels_ok
		})

		return result
	}

	/** @returns {Array<Array<number>>} */
	get_board_occupied_map() {
		const map = new Array(BOARD_SIZE).fill().map(() => new Array(BOARD_SIZE).fill(0))
		const ids = this.cells
			.map((cell) => get_data(cell).id)
			.filter((id) => this.find_elemental(id) != null)
			.map((id) => ({ x: parseInt(id[0], 16), y: parseInt(id[2], 16) }))
		ids.forEach((id) => {
			map[id.y][id.x] = 1
		})
		return map
	}

	/**
	 * @param {CELL_ID} id_from
	 * @param {CELL_ID} id_to
	 * @returns {Board}
	 */
	move_elemental(id_from, id_to) {
		if (this.find_elemental(id_from) == null || this.find_elemental(id_to) != null) return this
		const map = this.get_board_occupied_map()
		const pos_from = { x: parseInt(id_from[0], 16), y: parseInt(id_from[2], 16) }
		const pos_to = { x: parseInt(id_to[0], 16), y: parseInt(id_to[2], 16) }

		const possible = MazeSolver.solve(map, pos_from, pos_to)
		if (!possible) return this

		const elemental = this.find_elemental(id_from).copy()
		this.remove_elemental(id_from)
		this.set_elemental(id_to, elemental, true)

		console.warn({ map, id_from, id_to, pos_from, pos_to, possible, elemental })
	}

	attack_elemental(id_from, id_to) {
		if (this.find_elemental(id_from) == null || this.find_elemental(id_to) == null) return
		this.find_elemental(id_from).attack(this.find_elemental(id_to))
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

		this.cell = null
		this.pos = { x: null, y: null }

		this.id = random.float()

		return this
	}

	/**
	 * equality operator for {@link Elemental}
	 * @param {Elementa} other
	 * @returns
	 */
	equal(other) {
		return this.id === other.id
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

	attack(that) {
		const dmg = DAMAGE[this.level - 1]
		const reach = REACH[this.level - 1]

		const dx = Math.abs(this.pos.x - that.pos.x)
		const dy = Math.abs(this.pos.y - that.pos.y)

		const player_this = this.pos.y < BOARD_SIZE / 2 ? PLAYER_TYPE.BLUE : PLAYER_TYPE.GREEN
		const player_that = that.pos.y < BOARD_SIZE / 2 ? PLAYER_TYPE.BLUE : PLAYER_TYPE.GREEN

		// console.log({ this: this, that, player_this, player_that, dx, dy })

		if (dx > 1 || dy > reach || player_this === player_that) return

		that.recieve(dmg)
	}

	recieve(dmg) {
		this.health -= dmg

		this.descent()
	}

	descent() {
		if (this.level === LEVEL[0]) {
			game.board.remove_elemental(get_data(this.cell).id)
			return null
		}

		this.level = Math.max(this.level - 1, LEVEL[0])
		this.health = MAX_HEALTH[this.level - 1]
		this.update_cell()
		return this
	}

	/** @returns {Elemental} */
	ascend() {
		this.level = Math.min(this.level + 1, LEVEL[2])
		this.health = MAX_HEALTH[this.level - 1]
		this.update_cell()
		return this
	}

	/** @returns {Elemental} */
	update_cell() {
		reset_cell_elemental(this.cell)
		insert_elemental(this.data)
		return this
	}

	/** @returns {Elemental} */
	copy() {
		const clone = new Elemental(this.element, this.level)
		clone.id = this.id
		clone.health = this.health
		clone.cell = this.cell
		clone.pos = deep.copy(this.pos)
		return clone
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
		}
	}
}
