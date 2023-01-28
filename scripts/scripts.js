// console.clear()
setup()

const cells = get_cells()
// cells[1][2].dataset.active = true
// console.dir({ cell: cells[0][0], dataset: cells[0][0].dataset })

const inputs = Array.from(document.querySelectorAll('input'))
const confirm_settings = document.querySelector('.close-modal')
confirm_settings.addEventListener('click', () => {
	function foo(color) {
		return inputs
			.filter((input) => input.parentElement.parentElement.dataset.player === color)
			.map((input) => (input.checked ? input.dataset.type.toUpperCase() : ''))
			.filter((el) => el !== '')
			.map((e) => ELEMENTS[e])
	}
	const elements_green = foo('green')
	const elements_blue = foo('blue')

	clear_cells(cells)
	generate_cells(cells, elements_green, elements_blue)
})

// console.log({ num, count: cells.flat().filter((cell) => cell.dataset.occupied === 'true').length })
// for (let i = 0; i < 12; i++) {
// 	for (let j = 0; j < 12; j++) {
// 		if (i === 5 || i === 6) continue
// 		if (random() > 0.5) continue

// 		const elemental = Elemental.random().bind(cells[i][j])
// 		insert_elemental(elemental.data)
// 	}
// }
