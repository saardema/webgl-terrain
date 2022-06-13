import * as THREE from 'three'
import { Noise } from 'noisejs'

const terrain = {}

terrain.config = {
    scale: 15,
    width: 512,
    height: 512,
    noise: {
        offset: 0,
        terrainScale: 2.1,
        baseFrequency: 2.7,
        iterations: 10,
        maxIterations: 16,
        scaleMult: 0.36,
        freqMult: 2.551,
        seed: Math.random()
    }
}

const planeGeometry = new THREE.PlaneBufferGeometry(
    terrain.config.scale,
    terrain.config.scale,
    terrain.config.width - 1,
    terrain.config.height - 1
)

let noiseGens = []
for (let i = 0; i < terrain.config.noise.maxIterations; i++) {
    noiseGens[i] = new Noise(terrain.config.noise.seed + i)
}

const clrDataSize = terrain.config.width * terrain.config.height
let clrData = new Uint8Array(4 * clrDataSize)

const texture = new THREE.DataTexture(clrData, terrain.config.width, terrain.config.height,)
texture.flipY = true
// texture.anisotropy = 2

// Materials
const material = new THREE.MeshStandardMaterial({
    color: '#FFF',
    // map: texture,
    // opacity: .1,
    // transparent: true,
    wireframe: true,
})

// Mesh
terrain.mesh = new THREE.Mesh(planeGeometry, material)
terrain.mesh.rotateX(-Math.PI / 2)

const generateTextureFromNoiseMap = (normalize = false) => {
    let lowest = - 1
    let highest = 1

    if (normalize) {
        lowest = Number.MAX_SAFE_INTEGER
        highest = -Number.MAX_SAFE_INTEGER

        for (let i = 0; i < clrDataSize; i++) {
            const x = i % config.width
            const y = Math.floor(i / config.width)
            let h = getHeight(x, y)
            if (h > highest) highest = h
            if (h < lowest) lowest = h
        }
    }

    for (let i = 0; i < clrDataSize; i++) {
        const stride = i * 4
        const x = i % config.width
        const y = Math.floor(i / config.width)
        let c = getHeight(x, y)
        c = THREE.MathUtils.mapLinear(c, lowest, highest, 0, 255)
        c = parseInt(c)
        clrData[stride + 0] = c
        clrData[stride + 1] = c
        clrData[stride + 2] = c
        clrData[stride + 3] = 255
    }

    texture.needsUpdate = true
}

terrain.build = (regenerateNoiseMap = false) => {
    const position = planeGeometry.attributes.position

    if (regenerateNoiseMap) {
        // generateTextureFromNoiseMap(true)
    }

    for (let vIndex = 0; vIndex < position.count; vIndex++) {
        const x = vIndex % terrain.config.width
        const y = Math.floor(vIndex / terrain.config.width)
        position.array[vIndex * 3 + 2] = getHeight(x, y) * terrain.config.noise.terrainScale
    }
    position.needsUpdate = true
}

const getHeight = (x, y) => {
    let v = 0
    let scale = 1
    let freq = terrain.config.noise.baseFrequency

    for (let i = 0; i < terrain.config.noise.iterations; i++) {
        const x2 = x / terrain.config.width * freq
        const y2 = (y + terrain.config.noise.offset) / terrain.config.height * freq
        v += noiseGens[i].perlin2(x2, y2) * scale
        freq *= terrain.config.noise.freqMult
        scale *= terrain.config.noise.scaleMult
    }

    return v
}

terrain.build(true)

export default terrain