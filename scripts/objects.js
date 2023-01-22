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
111 -> 2 ~ +1 point
222 -> 3 ~ +2 points 

when a cell becomes inactive -> move the elemental up (does not trigger merge)
*/

class Elemental {
	static random(cell) {
		const element = random(Object.values(ELEMENTS))
		const level = random(LEVELS)
		return new Elemental(cell, element, level)
	}

	constructor(cell, element, level) {
		this.cell = cell
		this.element = element
		this.level = level
		this.health = MAX_HEALTH[level - 1]
		this.damage = DAMAGE[level - 1]
		this.reach = REACH[level - 1]
	}
}
