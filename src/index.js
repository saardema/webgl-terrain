import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module'

import { renderer, camera, sizes } from './renderer'
import lights from './lights.js'
import gui from './gui.js'
import terrain from './terrain.js'

// Time
const clock = new THREE.Clock()

// Stats
const stats = new Stats()
document.body.appendChild(stats.dom)

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
// controls.autoRotate = true

// const axesHelper = new THREE.AxesHelper( 5 )
// scene.add( axesHelper )

// Camera
camera.position.set(3, 2, 7)
controls.update()

// Scene
const scene = new THREE.Scene()
scene.add(...lights)
scene.add(terrain.mesh)
scene.add(camera)

// Loop
const animate = () => {
    terrain.config.offset += clock.getDelta()

    // controls.update()
    stats.update()
    // mapCfg.noise.offset -= 1
    // terrain.build()

    gui.updateDisplay()

    renderer.render(scene, camera)
}

// Start
renderer.setAnimationLoop(animate)