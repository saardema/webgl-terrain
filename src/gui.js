import * as dat from 'dat.gui'
import lights from './lights.js'
import terrain from './terrain.js'
import { camera } from './renderer.js'

const gui = new dat.GUI()
gui.useLocalStorage = true

const mapColor = (color, toGui) => {
    if (toGui) return { r: color.r * 255, g: color.g * 255, b: color.b * 255 }
    else return { r: color.r / 255, g: color.g / 255, b: color.b / 255 }
}

// Light GUI
const lightsFolder = gui.addFolder('lights')
lights.map((light, i) => {
    const lightFolder = lightsFolder.addFolder(`Light ${i + 1}`)
    gui.remember(light)
    gui.remember(light.position)
    lightFolder.add(light.position, 'x').step(1)
    lightFolder.add(light.position, 'y').step(1)
    lightFolder.add(light.position, 'z').step(1)
    lightFolder.add(light, 'intensity').step(.01)
    light.guiColor = mapColor(light.color, true)
    lightFolder.addColor(light, 'guiColor').onChange((value) => {
        light.color = mapColor(value, false)
    })
    light.color = mapColor(light.guiColor, false)
    lightFolder.open()
})

// Camera GUI
const guiCameraPosition = gui.addFolder('camera.position')
gui.remember(camera.position)
guiCameraPosition.add(camera.position, 'x').step(.01)
guiCameraPosition.add(camera.position, 'y').step(.01)
guiCameraPosition.add(camera.position, 'z').step(.01)

// Terrain GUI
const guiNoise = gui.addFolder('noise')
gui.remember(terrain.config.noise)
guiNoise.add(terrain.config.noise, 'terrainScale', 0, 10).onChange(() => terrain.build())
guiNoise.add(terrain.config.noise, 'baseFrequency', 0, 20).onChange(() => terrain.build(true))
guiNoise.add(terrain.config.noise, 'scaleMult').step(.001).onChange(() => terrain.build(true))
guiNoise.add(terrain.config.noise, 'freqMult').step(.001).onChange(() => terrain.build(true))
guiNoise.add(terrain.config.noise, 'iterations', 1, terrain.config.noise.maxIterations, 1).onChange(() => terrain.build(true))
guiNoise.add(terrain.config.noise, 'offset').step(.01).onChange(() => terrain.build(true))

lightsFolder.open()
// guiNoise.open()

export default gui