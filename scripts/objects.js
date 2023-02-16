const ELEMENTS = {
	AIR: 'air',
	FIRE: 'fire',
	ROCK: 'rock',
	WATER: 'water',
	NATURE: 'nature',
	ENERGY: 'energy',
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

const SPELL_DAMAGES = {
	THORN_VINES: 2,
	PYRAMID: 1,
	METEOR_SHOWER: 4,
}

/* additional rules: 
111 -> 020 ~ +1 point
222 -> 030 ~ +2 points 

when a cell becomes inactive -> move the elemental up (does not trigger merge)
*/

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

	static from_cell(cell) {
		return new Elemental(get_data(cell).element, get_data(cell).level).bind(cell)
	}

	constructor(element, level) {
		this.element = element
		this.level = level
		this.health = MAX_HEALTH[level - 1]
		this.hit = 0
		this.damage = DAMAGE[level - 1]
		this.reach = REACH[level - 1]

		return this
	}

	bind(cell) {
		this.cell = cell
		return this
	}

	upgrade() {
		return new Elemental(this.element, Math.min(this.level + 1, LEVELS[LEVELS.length - 1]))
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
