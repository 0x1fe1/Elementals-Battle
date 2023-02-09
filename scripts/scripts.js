setup()

// Green plays first
const controller_blue = get_elements.query('[data-dom="controller"][data-player="blue"]')[0]
activate(controller_blue)
const controller_green = get_elements.query('[data-dom="controller"][data-player="green"]')[0]
activate(controller_green)

const cells = get_cells()
// generate_cells(cells, {
// 	green: [ELEMENTS.AIR, ELEMENTS.FIRE, ELEMENTS.ROCK],
// 	blue: [ELEMENTS.WATER, ELEMENTS.NATURE, ELEMENTS.ENERGY],
// })
generate_cells(cells, {
	green: [ELEMENTS.WATER],
	blue: [ELEMENTS.NATURE],
})
// debug_display_variants(ELEMENTS.AIR)

// get_elements.query('[data-player="green"][data-dom="action"]')[0].addEventListener('click', () => {})
