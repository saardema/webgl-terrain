import './style.css'
import * as THREE from 'three'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls'
import Stats from 'three/examples/jsm/libs/stats.module'

import { renderer, camera } from './renderer'
import sky from './sky'
import lights from './lights'
import terrain from './terrain'
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
// controls.target = new THREE.Vector3(150, 0, 150)

// Scene
const scene = new THREE.Scene()

const chunkLoader = new terrain.ChunkLoader(scene, camera)
camera.position.set(0, 400, 0)
function init() {
    // controls.update()
    // controls.listenToKeyEvents(window)
    sky.update()
    // terrain.build()
    
    // scene.add(axesHelper)
    // scene.add(...terrain.normalsHelpers)
    scene.add(sky.mesh)
    scene.add(chunkLoader.group)
    scene.add(...lights.array)
    scene.add(camera)
}

// Loop
const animate = () => {
    stats.update()
    controls.update(clock.getDelta())
    gui.updateDisplay()
    chunkLoader.update()

    renderer.render(scene, camera)
}

// Start
init()
renderer.setAnimationLoop(animate)