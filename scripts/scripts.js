setup()

// Green plays first
const controller_green = get_elements.query('[data-dom="controller"][data-player="green"]')[0]
activate(controller_green)
// document.querySelector('.controller[data-player="blue"]').dataset.active = true
// const cells = get_cells()
// generate_cells(cells, { green: [ELEMENTS.AIR], blue: [ELEMENTS.FIRE] })
// debug_display_variants(ELEMENTS.AIR)

const cells_dom = get_elements.data_dom('cell')
const actions_dom = get_elements.data_dom('action')
const abilities_dom = get_elements.data_dom('ability')

let last_pointerId = 0
;[...cells_dom, ...actions_dom, ...abilities_dom].forEach((element) => {
	element.addEventListener('pointerdown', (e) => {
		last_pointerId = e.pointerId
	})
	element.addEventListener('pointerup', (e) => {
		console.log(e.target.dataset)
		if (last_pointerId !== e.pointerId) return

		get_elements.query(`[data-active="true"][data-dom=${get_data.dom(e.target)}]`).forEach(deactivate)
		activate(e.target)
	})
})
