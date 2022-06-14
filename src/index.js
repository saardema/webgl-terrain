import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module'

import { renderer, camera } from './renderer'
import sky from './sky'
import lights from './lights'
import terrain from './terrain'
import gui from './gui'

// Time
const clock = new THREE.Clock()

// Stats
const stats = new Stats()
document.body.appendChild(stats.dom)

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
// controls.autoRotate = true

// Scene
const scene = new THREE.Scene()
scene.add(sky.mesh)
scene.add(terrain.mesh)
scene.add(...lights.array)
scene.add(camera)

const init = () => {
    sky.update()
}

// Loop
const animate = () => {
    stats.update()

    // terrain.config.noise.offset -= 1
    // terrain.config.offset += clock.getDelta()
    // terrain.build()

    // camera.position.z -= .01
    // camera.rotateOnAxis(new THREE.Vector3(0, .4, .1), 0.003)

    controls.update()
    gui.updateDisplay()

    renderer.render(scene, camera)
}

// Start
init()
renderer.setAnimationLoop(animate)