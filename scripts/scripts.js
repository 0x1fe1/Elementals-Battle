// console.clear()
setup()

const cells = get_cells()
// cells[1][2].dataset.selected = true
// console.dir({ cell: cells[0][0], dataset: cells[0][0].dataset })

generate_cells(cells, [ELEMENTS.AIR, ELEMENTS.WATER, ELEMENTS.NATURE], [ELEMENTS.FIRE, ELEMENTS.ROCK, ELEMENTS.ENERGY])

// console.log({ num, count: cells.flat().filter((cell) => cell.dataset.occupied === 'true').length })

// for (let i = 0; i < 12; i++) {
// 	for (let j = 0; j < 12; j++) {
// 		if (i === 5 || i === 6) continue
// 		if (random() > 0.5) continue

// 		const elemental = Elemental.random().bind(cells[i][j])
// 		insert_elemental(elemental.data)
// 	}
// }
