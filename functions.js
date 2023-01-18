function insert_elemental({ cell, element, level, health }) {
	cell.dataset['occupied'] = 'true'
	cell.dataset['element'] = `${element}`
	cell.dataset['level'] = `${level}`
	cell.dataset['health'] = `${health}`
}

function generate_cells(board) {
	for (let i = 0; i < 144; i++) {
		board.innerHTML += `
            <div 
                class="cell" 
                data-occupied="false" 
                data-element="none" 
                data-level="0" 
                data-health="0">
                <svg
                    class="elemental"
                    viewbox="0 0 1 1"
                    xmlns="http://www.w3.org/2000/svg">
                        <path class="elemental-shape"></path>
                        <path class="elemental-health-boundary"></path>
                        <path class="elemental-health-life"></path>
                        <path class="elemental-health-hit"></path>
                </svg>
            </div>`
	}
}

function random() {
	const args = Array.from(arguments)
	if (args.length === 0) return Math.random()

	if (args.length === 1) {
		if (typeof args[0] === 'number') return Math.random() * args[0]
		if (Array.isArray(args[0]))
			return args[0][Math.floor(Math.random() * args[0].length)]
		return console.error('random function error: ', args)
	}

	if (args[0] === 'shuffle' || args[0] === 's') {
		const array = args[1]
		let currentIndex = array.length,
			randomIndex

		while (currentIndex != 0) {
			randomIndex = Math.floor(Math.random() * currentIndex)
			currentIndex--
			;[array[currentIndex], array[randomIndex]] = [
				array[randomIndex],
				array[currentIndex],
			]
		}

		return array
	}

	if (args[0] === 'int' || args[0] === 'i') {
		return Math.floor(random(...args.slice(1)))
	}

	if (args[0] === 'weights' || args[0] === 'w') {
		const weights = args[1]
		const sum = weights.reduce((a, b) => a + b)
		const value = random(sum)
		for (let i = 0, t = 0; i < weights.length; i++) {
			if (value < t) return i - 1
			t += weights[i]
		}
		return weights.length - 1
	}

	if (args[0] === 'divide' || args[0] === 'd') {
		const num = args[2] ?? 1
		let value = (args[1] ?? 1) / num

		// const points = new Array(num - 1)
		// 	.fill()
		// 	.map((_) => random(value))
		// 	.sort()
		// const result = points.map((p, i) => (i === 0 ? p : p - points[i - 1]))
		// result[num - 1] = value - points[num - 2]

		const result = new Array(num).fill(-1)
		const n = getNoise(args[3])
		for (let i = 0; i < num; i++) {
			value -= result[i] = i === num - 1 ? value : value * n
		}

		return random('s', result)
	}

	if (args.length === 2) {
		if (typeof args[0] === 'number' && typeof args[1] === 'number')
			return args[0] + (args[1] - args[0]) * Math.random()
		return console.error('random function error: ', args)
	}

	return console.error('random function error: ', args)
}
