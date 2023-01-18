//* INITIALIZATION
generate_cells(document.querySelector('.board'))

const cells = Array.from(document.querySelectorAll('.cell'))
cells.forEach((cell, i) => {
	const [x, y] = [(i % 12) % 2, ((i - (i % 12)) / 12) % 2]

	if (i < 72) {
		if (x === y) cell.style.backgroundColor = 'var(--cc-light-green)'
		if (x !== y) cell.style.backgroundColor = 'var(--cc-dark-green)'
		cell.style.transform += 'rotate(180deg)'
	} else {
		if (x === y) cell.style.backgroundColor = 'var(--cc-light-blue)'
		if (x !== y) cell.style.backgroundColor = 'var(--cc-dark-blue)'
	}
})

cells.forEach((cell, i) => {
	if (random() < 0.33) {
		const element = random(Object.values(ELEMENTS))
		const level = random(LEVELS)
		const health = random('i', 1, MAX_HEALTH[level - 1])
		// console.log({ cell, dataset: cell.dataset, e, l, h })
		insert_elemental({ cell, element, level, health })
	}
})

// console.log(cells)

// insert_elemental({
// 	cell: cells[0],
// 	element: ELEMENTS.AIR,
// 	level: LEVELS[2],
// 	health: MAX_HEALTH[2],
// })
// insert_elemental({
// 	cell: cells[0],
// 	element: ELEMENTS.AIR,
// 	level: LEVELS[2],
// 	health: MAX_HEALTH[2],
// })
