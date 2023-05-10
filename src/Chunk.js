import * as THREE from 'three'
import { Vector2, Vector3 } from 'three'
import { Noise } from 'noisejs'

class Chunk {
    constructor(chunk_x, chunk_z, config) {
        this.chunk_x = chunk_x
        this.chunk_z = chunk_z
        this.worldPosition = new Vector3(
            chunk_x * config.scale,
            0,
            chunk_z * config.scale
        )
        this.config = config
        this.noiseGenerators = []
        this.createNoiseGenerators(this.config.noise.maxIterations)

        // Build base geometry with 1 vertex wide border
        // to allow edge normals to be calculated for proper seams
        this.geometry = new THREE.PlaneBufferGeometry(
            this.config.scale + (this.config.scale / this.config.detail) * 2,
            this.config.scale + (this.config.scale / this.config.detail) * 2,
            this.config.detail + 2,
            this.config.detail + 2
        )

        // Flatten
        this.geometry.rotateX(-Math.PI / 2)

        // Set origin to top left corner
        this.geometry.translate(this.config.scale / 2, 0, this.config.scale / 2)

        this.mesh = new THREE.Mesh(this.geometry, Chunk.material)
        this.mesh.position.add(this.worldPosition)
    }

    static material = new THREE.MeshStandardMaterial({
        color: '#FFF'
        // wireframe: true,
    })

    destroy() {
        this.geometry.dispose()
    }

    build() {
        const index = this.geometry.getIndex()
        const posAttr = this.geometry.getAttribute('position')

        // Positions
        for (let i = 0; i < posAttr.array.length; i += 3) {
            const x = posAttr.array[i] + this.worldPosition.x
            const z = posAttr.array[i + 2] + this.worldPosition.z
            const y = this.getHeight(x, z)

            posAttr.array[i + 1] = y
        }

        this.geometry.computeVertexNormals()

        if (index.version == 0) {
            const indexArray = []
            const borderIndexArray = []

            for (let i = 0; i < index.count; i += 3) {
                const vA = index.getX(i)
                const vB = index.getX(i + 1)
                const vC = index.getX(i + 2)
                const pA = new Vector3().fromBufferAttribute(posAttr, vA)
                const pB = new Vector3().fromBufferAttribute(posAttr, vB)
                const pC = new Vector3().fromBufferAttribute(posAttr, vC)

                // Separate border triangles so they can be hidden
                const s = this.config.scale
                if (
                    pC.x < 0 ||
                    pC.z < 0 ||
                    pA.x < 0 ||
                    pA.z < 0 ||
                    pC.x > s ||
                    pC.z > s ||
                    pB.x > s ||
                    pB.z > s
                ) {
                    borderIndexArray.push(vA)
                    borderIndexArray.push(vB)
                    borderIndexArray.push(vC)
                } else {
                    indexArray.push(vA)
                    indexArray.push(vB)
                    indexArray.push(vC)
                }
            }

            for (let i = 0; i < index.array.length; i++) {
                if (i < indexArray.length) {
                    index.array[i] = indexArray[i]
                } else {
                    index.array[i] = borderIndexArray[i - indexArray.length]
                }
                this.geometry.setDrawRange(0, indexArray.length)
            }

            index.needsUpdate = true
        }

        this.geometry.attributes.position.needsUpdate = true
        this.geometry.attributes.normal.needsUpdate = true
    }

    createNoiseGenerators(amount) {
        for (let i = 0; i < amount; i++) {
            this.noiseGenerators[i] = new Noise(this.config.noise.seed + i)
        }
    }

    getHeight(x, z) {
        let h = 0
        let scale = 1
        let freq = this.config.noise.baseFrequency

        for (let i = 0; i < this.config.noise.iterations; i++) {
            const x2 = (x / this.config.scale) * freq
            const z2 = ((z + this.config.noise.offset) / this.config.scale) * freq

            h += this.noiseGenerators[i].perlin2(x2, z2) * scale
            freq *= this.config.noise.freqMult
            scale *= this.config.noise.scaleMult
        }

        h *= this.config.noise.terrainScale

        return h
    }
}

export default Chunk
