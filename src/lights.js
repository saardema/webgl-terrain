import * as THREE from 'three'
import sky from './sky'

const lights = {}

lights.array = []
const ambientLight = new THREE.AmbientLight()
ambientLight.color = new THREE.Color('rgb(125, 186, 255)')
lights.array.push(ambientLight)

const directionalLight = new THREE.DirectionalLight()
lights.array.push(directionalLight)

lights.setLightFromSun = () => {
    const elev = sky.config.elevation
    let intensity = 3
    let hue = 8
    let sat = 0
    let lig = 50
    let amb = .3
    const sunsetThresh = 6
    const sunsetAmount = (sunsetThresh - elev) / sunsetThresh
    
    if (sunsetAmount > 0) {
        sat += (100 - sat) * sunsetAmount
        amb -= .25 * sunsetAmount
    }
    // console.log(sunsetAmount)
    
    const hsl = `hsl(${parseInt(hue)}, ${parseInt(sat)}%, ${parseInt(lig)}%)`
    directionalLight.color = new THREE.Color(hsl)
    
    // const p1 = 0
    // const p2 = .2
    // const sunsetColor = new THREE.Color('orange')
    // const noonColor = new THREE.Color('white')
    // let lerp = elev / 90
    // lerp = THREE.MathUtils.mapLinear(lerp, p1, p2, 0, 1)
    // lerp = THREE.MathUtils.clamp(lerp, 0, 1)
    // directionalLight.color = new THREE.Color().lerpColors(sunsetColor, noonColor, lerp)
    ambientLight.intensity = amb
    directionalLight.intensity = intensity
    directionalLight.position.copy(sky.sun)
}

export default lights