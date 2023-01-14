// function updateViewportSize() {
// 	const [vh, vw] = [window.innerHeight * 0.01, window.innerWidth * 0.01]
// 	document.documentElement.style.setProperty('--vw', `${vw}px`)
// 	document.documentElement.style.setProperty('--vh', `${vh}px`)
// 	document.documentElement.style.setProperty(
// 		'--vmin',
// 		`${Math.min(vw, vh)}px`,
// 	)
// 	document.documentElement.style.setProperty(
// 		'--vmax',
// 		`${Math.max(vw, vh)}px`,
// 	)
// }
// updateViewportSize()
// window.addEventListener('resize', updateViewportSize)

const cells = Array.from(document.querySelectorAll('.cell'))

cells.forEach((cell, i) => {
	const [x, y] = [i % 12, (i - (i % 12)) / 12]
	cell.style.backgroundColor = `var(--cc-${
		x % 2 === y % 2 ? 'light' : 'dark'
	}-${i < 72 ? 'green' : 'blue'})`
})

// console.log(cells)
