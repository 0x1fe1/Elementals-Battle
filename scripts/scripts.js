setup()

// Green plays first
const controller_blue = get_elements.query('[data-dom="controller"][data-player="blue"]')[0]
activate(controller_blue)
const cells = get_cells()
generate_cells(cells, {
	green: [ELEMENTS.AIR, ELEMENTS.FIRE, ELEMENTS.ROCK],
	blue: [ELEMENTS.WATER, ELEMENTS.NATURE, ELEMENTS.ENERGY],
})
// debug_display_variants(ELEMENTS.AIR)
