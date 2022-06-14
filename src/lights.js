import * as THREE from 'three'

const lights = []

const light1 = new THREE.PointLight(0xff8822, 1.79)
light1.position.set(41, 45, 32)
lights.push(light1)

const light2 = new THREE.PointLight(0x2288ff, 1)
light2.position.set(-30, 4, -20)
lights.push(light2)

export default lights