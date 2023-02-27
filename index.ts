// switch those two lines to go from alpha build to stable or back
// import * as Matter from "matter-js"
import * as Matter from "./matter.alpha"
import {cycledRequestAnimationFrame} from "./utils"

main()

export async function main(): Promise<void> {
	const root = document.body
	root.style.cssText = "width: 100vw; height: 100vh; padding: 0; margin: 0; border: 0; overflow: hidden; position: relative;background-color: #222"

	physSimMain(root)
}

function physSimMain(root: HTMLElement): void {
	const Engine = Matter.Engine,
		Render = Matter.Render,
		Composite = Matter.Composite,
		Bodies = Matter.Bodies

	// create engine
	const engine = Engine.create({enableSleeping: true}),
		world = engine.world

	// create renderer
	const render = Render.create({
		element: root,
		engine: engine,
		options: {
			width: root.clientWidth,
			height: root.clientHeight,
			showAngleIndicator: true,
			showIds: true
		}
	})

	Render.run(render)

	let sensorOffset = -100
	let tickBudget = 0
	const tickTime = 1 / 60
	cycledRequestAnimationFrame(0.25, delta => {
		tickBudget += delta
		while(tickBudget > tickTime){
			tickBudget -= tickTime
			Engine.update(engine, tickTime * 1000)
		}
		Matter.Body.setPosition(sensor, {x: 5, y: sensorOffset})
		sensorOffset += 50 * delta
	})

	Matter.Events.on(engine, "collisionEnd", e => {
		console.log("Collisionend: " + e.pairs[0]!.id)
	})

	const sensor = Bodies.rectangle(0, sensorOffset, 50, 50, {
		isSensor: true,
		// Q: why don't make sensor a static object without this hack with zero mass?
		// A: static objects don't collide with other static objects ever
		// and that's bad if we want to use sensor for viewport culling
		mass: 0
	})

	Composite.add(world, [
		sensor,
		Bodies.rectangle(0, 0, 100, 10, {isStatic: true})
	])

	// fit the render viewport to the scene
	Render.lookAt(render, Composite.allBodies(world), {x: 10, y: 10})
}