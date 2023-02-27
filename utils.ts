export function cycledRequestAnimationFrame(skipLimit: number, callback: (delta: number) => void): () => void {
	let prevCallTime = 0
	let handle: number | null = null

	const wrappedHandler = (time: number) => {
		const delta = (time - prevCallTime) / 1000
		prevCallTime = time

		handle = requestAnimationFrame(wrappedHandler)

		if(delta < skipLimit){
			callback(delta)
		}
	}

	handle = requestAnimationFrame(wrappedHandler)

	return () => handle !== null && cancelAnimationFrame(handle)
}