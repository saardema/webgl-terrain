import * as THREE from 'three'
import lights from './lights'
import { Sky } from 'three/examples/jsm/objects/Sky'

const sky = {}

sky.mesh = new Sky()

sky.sun = new THREE.Vector3()

sky.config = {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.016,
    mieDirectionalG: 0.8,
    elevation: 50,
    azimuth: 180,
}

sky.update = function () {
    const uniforms = sky.mesh.material.uniforms
    uniforms['turbidity'].value = sky.config.turbidity
    uniforms['rayleigh'].value = sky.config.rayleigh
    uniforms['mieCoefficient'].value = sky.config.mieCoefficient
    uniforms['mieDirectionalG'].value = sky.config.mieDirectionalG

    const phi = THREE.MathUtils.degToRad(90 - sky.config.elevation)
    const theta = THREE.MathUtils.degToRad(sky.config.azimuth)

    sky.sun.setFromSphericalCoords(1, phi, theta)

    uniforms['sunPosition'].value.copy(sky.sun)
    lights.setLightFromSun(sky.sun)
}

sky.mesh.scale.setScalar(450000)

// export { mesh as sky, sun, skyConfig, updateSky }
export default sky