import * as THREE from 'three'

const lights = []

const light1 = new THREE.PointLight(0xff8822, 1)
light1.position.set(3, 5, 2)
lights.push(light1)

const light2 = new THREE.PointLight(0x2288ff, 1)
light2.position.set(-3, 5, -2)
lights.push(light2)

export default lights