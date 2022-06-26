import * as dat from 'dat.gui'

import { renderer, camera } from './renderer'
import lights from './lights'
import ChunkLoader from './ChunkLoader'
import sky from './sky'

const gui = new dat.GUI()
gui.useLocalStorage = true

// LIGHTS
const mapColor = (color, toGui) => {
    if (toGui) return { r: color.r * 255, g: color.g * 255, b: color.b * 255 }
    else return { r: color.r / 255, g: color.g / 255, b: color.b / 255 }
}

const lightsFolder = gui.addFolder('lights')
lights.array.map((light, i) => {
    const lightFolder = lightsFolder.addFolder(`${i + 1} ${light.name}`)

    if (light.name === 'CounterSunlight') {
        gui.remember(light)
        gui.remember(light.position)
        gui.remember(light.rotation)
    }

    lightFolder.add(light, 'intensity').step(.01)
    light.guiColor = mapColor(light.color, true)

    lightFolder.addColor(light, 'guiColor').name('color').onChange((value) => {
        light.color = mapColor(value, false)
    })
    light.color = mapColor(light.guiColor, false)

    const lightPositionFolder = lightFolder.addFolder('position')
    lightPositionFolder.add(light.position, 'x').step(1)
    lightPositionFolder.add(light.position, 'y').step(1)
    lightPositionFolder.add(light.position, 'z').step(1)

    const lightRotationFolder = lightFolder.addFolder('rotation')
    lightRotationFolder.add(light.rotation, 'x').step(1)
    lightRotationFolder.add(light.rotation, 'y').step(1)
    lightRotationFolder.add(light.rotation, 'z').step(1)

    // lightFolder.open()
})

// SKY
const skyFolder = gui.addFolder('sky')
gui.remember(sky.config)
skyFolder.add(sky.config, 'turbidity', 0.0, 20.0, 0.1).onChange(sky.update)
skyFolder.add(sky.config, 'rayleigh', 0.0, 4, 0.001).onChange(sky.update)
skyFolder.add(sky.config, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(sky.update)
skyFolder.add(sky.config, 'mieDirectionalG', 0.0, 1, 0.001).onChange(sky.update)
skyFolder.add(sky.config, 'elevation', 0, 90, 0.1).onChange(sky.update)
skyFolder.add(sky.config, 'azimuth', - 180, 180, 0.1).onChange(sky.update)
// skyFolder.open()

// CAMERA
const cameraFolder = gui.addFolder('camera')
gui.remember(camera.position)
const cameraPositionFolder = cameraFolder.addFolder('position')
cameraPositionFolder.add(camera.position, 'x',).step(.1)
cameraPositionFolder.add(camera.position, 'y').step(.1)
cameraPositionFolder.add(camera.position, 'z').step(.1)
gui.remember(camera.rotation)
const cameraRotationFolder = cameraFolder.addFolder('rotation')
cameraRotationFolder.add(camera.rotation, 'x',).step(.01)
cameraRotationFolder.add(camera.rotation, 'y').step(.01)
cameraRotationFolder.add(camera.rotation, 'z').step(.01)

// TERRAIN
const noiseFolder = gui.addFolder('noise')
// gui.remember(ChunkLoader.config)
// gui.remember(ChunkLoader.config.noise)
noiseFolder.add(ChunkLoader.config.noise, 'terrainScale', 0)
noiseFolder.add(ChunkLoader.config.noise, 'baseFrequency', 0).step(.1)
noiseFolder.add(ChunkLoader.config.noise, 'scaleMult').step(.001)
noiseFolder.add(ChunkLoader.config.noise, 'freqMult').step(.001)
noiseFolder.add(ChunkLoader.config.noise, 'iterations', 1, ChunkLoader.config.noise.maxIterations, 1)
noiseFolder.add(ChunkLoader.config.noise, 'offset').step(.01)

// RENDERER
gui.remember(renderer)
gui.add(renderer, 'toneMappingExposure', 0, 1, 0.0001).name('exposure').onChange(sky.update)

// lightsFolder.open()
// guiNoise.open()

export default gui