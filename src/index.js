import './style.css'
import * as THREE from 'three'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js'
import Stats from 'three/examples/jsm/libs/stats.module'

import { renderer, camera } from './renderer'
import sky from './sky'
import lights from './lights'
import ChunkLoader from './ChunkLoader'
import gui from './gui'

// Time
const clock = new THREE.Clock()

const axesHelper = new THREE.AxesHelper(100)

// Stats
const stats = new Stats()
document.body.appendChild(stats.dom)

// Controls
const controls = new FlyControls(camera, renderer.domElement)
controls.movementSpeed = 70
controls.rollSpeed = .5
controls.dragToLook = true

// Scene
const scene = new THREE.Scene()

// Chunkloader
const chunkLoader = new ChunkLoader(scene, camera)

function init() {
    sky.update()
    scene.add(sky.mesh)
    scene.add(chunkLoader.group)
    scene.add(...lights.array)
    scene.add(camera)
}

// Loop
const animate = () => {
    controls.movementSpeed = 70 + camera.position.y / 3
    stats.update()
    controls.update(clock.getDelta())
    gui.updateDisplay()
    chunkLoader.update()

    lights.update(sky.sun, sky.config.elevation)

    renderer.render(scene, camera)
}

// Start
init()
renderer.setAnimationLoop(animate)