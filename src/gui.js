import * as dat from 'dat.gui'
import lights from './lights.js'
import terrain from './terrain.js'

const gui = new dat.GUI()

// Light GUI
const guiLight1 = gui.addFolder('light1')
guiLight1.add(lights[0].position, 'x').step(1)
guiLight1.add(lights[0].position, 'y').step(1)
guiLight1.add(lights[0].position, 'z').step(1)
guiLight1.add(lights[0], 'intensity').step(.01)

// Camera GUI
// const guiCameraPosition = gui.addFolder('camera.position')
// guiCameraPosition.add(camera.position, 'x').step(.01)
// guiCameraPosition.add(camera.position, 'y').step(.01)
// guiCameraPosition.add(camera.position, 'z').step(.01)

// Terrain GUI
const guiNoise = gui.addFolder('noise')
guiNoise.open()
guiNoise.add(terrain.config.noise, 'terrainScale', 0, 10).onFinishChange(() => terrain.build())
guiNoise.add(terrain.config.noise, 'baseFrequency', 0, 20).onFinishChange(() => terrain.build(true))
guiNoise.add(terrain.config.noise, 'scaleMult').step(.001).onFinishChange(() => terrain.build(true))
guiNoise.add(terrain.config.noise, 'freqMult').step(.001).onFinishChange(() => terrain.build(true))
guiNoise.add(terrain.config.noise, 'iterations', 1, terrain.config.noise.maxIterations, 1).onFinishChange(() => terrain.build(true))
guiNoise.add(terrain.config.noise, 'offset').step(.01).onFinishChange(() => terrain.build(true))

export default gui