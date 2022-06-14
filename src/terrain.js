import * as THREE from 'three'
import { Noise } from 'noisejs'

const terrain = {}

terrain.config = {
    scale: 100,
    detail: 128,
    noise: {
        offset: 0,
        terrainScale: 24,
        baseFrequency: 2.2,
        iterations: 8,
        maxIterations: 16,
        scaleMult: 0.547,
        freqMult: 1.677,
        seed: 11
    }
}

const geometry = new THREE.PlaneBufferGeometry(
    terrain.config.scale,
    terrain.config.scale,
    terrain.config.detail - 1,
    terrain.config.detail - 1
)

// const texture = new THREE.DataTexture(clrData, terrain.config.detail, terrain.config.detail)
// texture.flipY = true
// texture.anisotropy = 2

const material = new THREE.MeshStandardMaterial({
    color: '#FFF',
    // map: texture,
    // opacity: .1,
    // transparent: true,
    // wireframe: true,
})

terrain.mesh = new THREE.Mesh(geometry, material)
terrain.mesh.rotateX(-Math.PI / 2)

// const clrDataSize = terrain.config.detail * terrain.config.detail
// let clrData = new Uint8Array(4 * clrDataSize)


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

const clock = new THREE.Clock()
terrain.build = () => {
    const position = geometry.attributes.position
    clock.getDelta()
    for (let vIndex = 0; vIndex < position.count; vIndex++) {
        const x = vIndex % terrain.config.detail
        const y = Math.floor(vIndex / terrain.config.detail)
        position.array[vIndex * 3 + 2] = getHeight(x, y) * terrain.config.noise.terrainScale
    }

    geometry.computeVertexNormals()
    position.needsUpdate = true
    console.log(`Terrain build: ${parseInt(clock.getDelta() * 1000)}ms`);
}

let noiseGens = []
for (let i = 0; i < terrain.config.noise.maxIterations; i++) {
    noiseGens[i] = new Noise(terrain.config.noise.seed + i)
}

const getHeight = (x, y) => {
    let v = 0
    let scale = 1
    let freq = terrain.config.noise.baseFrequency

    for (let i = 0; i < terrain.config.noise.iterations; i++) {
        const x2 = x / terrain.config.detail * freq
        const y2 = (y + terrain.config.noise.offset) / terrain.config.detail * freq
        v += noiseGens[i].perlin2(x2, y2) * scale
        freq *= terrain.config.noise.freqMult
        scale *= terrain.config.noise.scaleMult
    }

    return v
}

terrain.build()

export default terrain