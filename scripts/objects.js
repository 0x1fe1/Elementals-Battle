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

const ABILITY_COSTS = {
	FOREST_MASTER_STAFF: 4,
	THE_LADY_OF_THE_LAKE_VIAL: 5,
	ANCIENT_FIGURINE: 7,
	PENDULUM_OF_REVERSED_TIME: 9,
	METEOR_SHOWER: 10,
}

const ABILITY_DAMAGES = {
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
		const level = random() < 0.67 ? LEVELS[0] : random() < 0.67 ? LEVELS[1] : LEVELS[2]
		return new Elemental(element, level)
	}

	constructor(element, level) {
		this.element = element
		this.level = level
		this.health = MAX_HEALTH[level - 1]
		this.hit = 0

		return this
	}

	bind(cell) {
		this.cell = cell
		return this
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
