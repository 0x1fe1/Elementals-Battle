const modal = document.querySelector('.modal')
const openModal = document.querySelector('.open-modal')
const closeModal = document.querySelector('.close-modal')

openModal.addEventListener('click', () => {
	modal.style.display = 'grid'
})

closeModal.onclick = function () {
	modal.style.display = 'none'
}

window.onclick = function (e) {
	if (e.target === modal) {
		modal.style.display = 'none'
	}
}

// console.clear()
setup()

const cells = Array.from(document.querySelectorAll('.cell'))
cells.forEach((cell, i) => {
	if (random() < 0.33) {
		const element = random(Object.values(ELEMENTS))
		const level = random(LEVELS)
		const health = random('i', 1, MAX_HEALTH[level - 1])
		const hit = random('i', 0, DAMAGE[level - 1])
		// console.log({ cell, dataset: cell.dataset, e, l, h })
		insert_elemental({ cell, element, level, health, hit })
	}
})

// cells[5].dataset.selectedCell = true

// insert_elemental(cells[0], ELEMENTS[0], 1, 1, 1)

// insert_elemental(cells[1], ELEMENTS[0], 2, 1, 1)
// insert_elemental(cells[13], ELEMENTS[0], 2, 2, 2)

// insert_elemental(cells[2], ELEMENTS[0], 3, 1, 1)

// insert_elemental(cells[14], ELEMENTS[0], 3, 2, 1)
// insert_elemental(cells[15], ELEMENTS[0], 3, 2, 2)

// insert_elemental(cells[26], ELEMENTS[0], 3, 3, 1)
// insert_elemental(cells[27], ELEMENTS[0], 3, 3, 2)

// insert_elemental(cells[38], ELEMENTS[0], 3, 4, 1)
// insert_elemental(cells[39], ELEMENTS[0], 3, 4, 2)
// insert_elemental(cells[40], ELEMENTS[0], 3, 4, 4)

// insert_elemental(cells[50], ELEMENTS[0], 3, 5, 1)
// insert_elemental(cells[51], ELEMENTS[0], 3, 5, 2)
// insert_elemental(cells[52], ELEMENTS[0], 3, 5, 4)

// insert_elemental(cells[62], ELEMENTS[0], 3, 6, 1)
// insert_elemental(cells[63], ELEMENTS[0], 3, 6, 2)
// insert_elemental(cells[64], ELEMENTS[0], 3, 6, 4)
