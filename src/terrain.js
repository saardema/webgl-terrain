import * as THREE from 'three'
import { Noise } from 'noisejs'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'
import { Vector2, Vector3 } from 'three'
import dist from 'webpack-merge'

const clock = new THREE.Clock()

class Chunk {
    constructor(chunk_x, chunk_z, config) {
        this.chunk_x = chunk_x
        this.chunk_z = chunk_z
        this.worldPosition = new Vector3(chunk_x * ChunkLoader.config.scale, 0, chunk_z * ChunkLoader.config.scale)
        this.config = config
        this.noiseGenerators = []
        this.createNoiseGenerators(this.config.noise.maxIterations)

        // Build base geometry with 1 vertex wide border
        // to allow edge normals to be calculated for proper seams
        this.geometry = new THREE.PlaneBufferGeometry(
            this.config.scale + this.config.scale / this.config.detail * 2,
            this.config.scale + this.config.scale / this.config.detail * 2,
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
        color: '#FFF',
        // wireframe: true,
    })

    destroy() {
        this.geometry.dispose()
    }

    build() {
        const index = this.geometry.getIndex()
        const posAttr = this.geometry.getAttribute('position')
        const normAttr = this.geometry.getAttribute('normal')

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
                const vA = index.getX(i);
                const vB = index.getX(i + 1);
                const vC = index.getX(i + 2);
                const pA = new Vector3().fromBufferAttribute(posAttr, vA)
                const pB = new Vector3().fromBufferAttribute(posAttr, vB)
                const pC = new Vector3().fromBufferAttribute(posAttr, vC)

                // Separate border triangles so they can be hidden
                const s = this.config.scale
                if (pC.x < 0 || pC.z < 0 || pA.x < 0 || pA.z < 0 || pC.x > s || pC.z > s || pB.x > s || pB.z > s) {
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
            const x2 = x / this.config.scale * freq
            const z2 = (z + this.config.noise.offset) / this.config.scale * freq

            h += this.noiseGenerators[i].perlin2(x2, z2) * scale
            freq *= this.config.noise.freqMult
            scale *= this.config.noise.scaleMult
        }

        h *= this.config.noise.terrainScale

        return h
    }

    static getNormalFromTriangle(pA, pB, pC) {
        cb.subVectors(pC, pB)
        ab.subVectors(pA, pB)
        cb.cross(ab)

        return cb
    }
}

class ChunkLoader {
    constructor(scene, camera) {
        this.camera = camera
        this.scene = scene
        this.chunks = []
        this.group = new THREE.Object3D()
        this.walker = new THREE.Vector2(this.camera.position.x, this.camera.position.z)
    }

    static config = {
        scale: 100,
        detail: 100,
        noise: {
            offset: 0,
            terrainScale: 24,
            baseFrequency: 2.2,
            iterations: 12,
            maxIterations: 16,
            scaleMult: 0.547,
            freqMult: 1.677,
            seed: 11
        }
    }

    update() {
        this.walker.set(this.camera.position.x, this.camera.position.z)
        const nearest_chunk_x = Math.round(this.camera.position.x / ChunkLoader.config.scale)
        const nearest_chunk_z = Math.round(this.camera.position.z / ChunkLoader.config.scale)

        for (let x = -5; x <= 5; x++) {
            for (let z = -5; z <= 5; z++) {
                const near_chunk_x = nearest_chunk_x + x
                const near_chunk_z = nearest_chunk_z + z

                if (!this.chunkExists(near_chunk_x, near_chunk_z)) {
                    const chunkPos2D = new Vector2(near_chunk_x * ChunkLoader.config.scale, near_chunk_z * ChunkLoader.config.scale)
                    const distance2D = chunkPos2D.sub(this.walker).length()
                   
                    if (distance2D < 500) {
                        this.createChunk(near_chunk_x, near_chunk_z, ChunkLoader.config)
                    }
                }
            }
        }

        for (const chunk of this.chunks) {
            const chunkPos2D = new Vector2(chunk.worldPosition.x, chunk.worldPosition.z)
            const distance2D = chunkPos2D.subVectors(chunkPos2D, this.walker).length()

            if (distance2D > 600) {
                this.destroyChunk(chunk)
            }
        }
    }

    createChunk(x, z) {
        clock.getDelta()
        const chunk = new Chunk(x, z, ChunkLoader.config)
        chunk.build()
        this.chunks.push(chunk)
        this.group.add(chunk.mesh)

        console.log(`Create chunk [${chunk.chunk_x}, ${chunk.chunk_z}] in ${parseInt(clock.getDelta() * 1000)}ms`)
    }

    destroyChunk(chunk) {
        chunk.destroy()
        this.chunks = this.chunks.filter(c => c !== chunk)
        this.group.remove(chunk.mesh)

        console.log(`Destroy chunk [${chunk.chunk_x}, ${chunk.chunk_z}]`);
    }

    chunkExists(x, z) {
        for (const c of this.chunks) {
            if (c.chunk_x === x && c.chunk_z === z) {
                return true
            }
        }

        return false
    }

    getMeshes() {
        const meshes = []

        for (const chunk of this.chunks) {
            meshes.push(chunk.mesh)
        }

        return meshes
    }
}

const terrain = {
    config: ChunkLoader.config,
    ChunkLoader
}

export default terrain