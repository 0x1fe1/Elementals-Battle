const ELEMENTS = {
	0: 'air',
	1: 'fire',
	2: 'rock',
	3: 'water',
	4: 'nature',
	5: 'energy',
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
