import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module'

import { renderer, camera } from './renderer'
import gui from './gui.js'
import lights from './lights.js'
import terrain from './terrain.js'

// Time
const clock = new THREE.Clock()

// Stats
const stats = new Stats()
document.body.appendChild(stats.dom)

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
// controls.autoRotate = true

// Camera
// camera.position.set(3, 2, 7)

// Scene
const scene = new THREE.Scene()
scene.add(terrain.mesh)
scene.add(...lights)
scene.add(camera)

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
renderer.setAnimationLoop(animate)