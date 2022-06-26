import * as THREE from 'three'

const lights = {}

lights.array = []

const ambientLight = new THREE.AmbientLight()
ambientLight.color = new THREE.Color('rgb(125, 186, 255)')
ambientLight.name = 'AmbientLight'
lights.array.push(ambientLight)

const sunLight = new THREE.DirectionalLight()
sunLight.name = 'SunLight'
lights.array.push(sunLight)

const counterSunLight = new THREE.DirectionalLight('rgb(158, 177, 255)', .24)
counterSunLight.name = 'CounterSunlight'
lights.array.push(counterSunLight)

lights.update = (sun, elevation) => {
    let intensity = 3
    let hue = 15
    let sat = 10
    let lig = 50
    let amb = 0
    const sunsetThresh = 6
    const sunsetAmount = (sunsetThresh - elevation) / sunsetThresh
    
    if (sunsetAmount > 0) {
        sat += (100 - sat) * sunsetAmount
        // amb -= .25 * sunsetAmount
    }
    
    const hsl = `hsl(${parseInt(hue)}, ${parseInt(sat)}%, ${parseInt(lig)}%)`
    sunLight.color = new THREE.Color(hsl)
    ambientLight.intensity = amb
    sunLight.intensity = intensity
    sunLight.position.copy(sun)
    counterSunLight.position.set(
        -sunLight.position.x,
        counterSunLight.position.x,
        -sunLight.position.z
    )
}

export default lights