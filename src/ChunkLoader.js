import * as THREE from 'three'
import { Vector2, Vector3 } from 'three'

import Chunk from './Chunk'

const clock = new THREE.Clock()

class ShovelerManager {
    shovelers = []
    currentShovelerIndex = 0

    constructor(count, callback, context) {
        for (let i = 0; i < count; i++) {
            const shoveler = new Worker(new URL('./shoveler.js', import.meta.url))
            shoveler.onmessage = (response) => callback(response, context)
            this.shovelers.push(shoveler)
        }
    }

    getNextShoveler() {
        this.currentShovelerIndex++
        if (this.currentShovelerIndex >= this.shovelers.length) this.currentShovelerIndex = 0

        return this.shovelers[this.currentShovelerIndex]
    }
}

class ChunkLoader {
    constructor(scene, camera) {
        this.camera = camera
        this.scene = scene
        this.chunks = []
        this.group = new THREE.Object3D()
        this.buildQueue = []
        this.walker = new Vector2()
        this.shovelerManager = new ShovelerManager(5, this.onShovelerResponse, this)
    }

    static config = {
        scale: 5000,
        detail: 500,
        noise: {
            offset: 0,
            terrainScale: 851,
            baseFrequency: 5,
            iterations: 10,
            maxIterations: 16,
            scaleMult: 0.442,
            freqMult: 1.797,
            seed: 11
        }
    }

    update() {
        // Represent camera as 2D vector on the ground
        this.walker.set(this.camera.position.x, this.camera.position.z)

        const nearest_chunk_x = Math.round(this.walker.x / ChunkLoader.config.scale)
        const nearest_chunk_z = Math.round(this.walker.y / ChunkLoader.config.scale)

        for (let x = -5; x <= 5; x++) {
            for (let z = -5; z <= 5; z++) {
                const near_chunk_x = nearest_chunk_x + x
                const near_chunk_z = nearest_chunk_z + z

                if (!this.getChunkByCoordinates(near_chunk_x, near_chunk_z)) {
                    if (!this.isChunkBeingBuilt(near_chunk_x, near_chunk_z)) {
                        // if (near_chunk_x == -70 && near_chunk_z == -9) debugger
                        const chunkPos2D = new Vector2(
                            near_chunk_x * ChunkLoader.config.scale,
                            near_chunk_z * ChunkLoader.config.scale
                        )
                        const distance2D = chunkPos2D.sub(this.walker).length()

                        if (distance2D < 10000) {
                            // this.createChunk(near_chunk_x, near_chunk_z)
                            this.createChunkParalel(near_chunk_x, near_chunk_z)
                        }
                    }
                }
            }
        }

        for (const chunk of this.chunks) {
            const chunkPos2D = new Vector2(chunk.worldPosition.x, chunk.worldPosition.z)
            const distance2D = chunkPos2D.subVectors(chunkPos2D, this.walker).length()

            if (distance2D > 20000) {
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

    createChunkParalel(x, z) {
        console.log('creating chunk', x, z);
        clock.getDelta()

        this.buildQueue.push({ x, z })

        this.shovelerManager.getNextShoveler().postMessage({
            instruction: 'build',
            config: ChunkLoader.config,
            coordinates: { x, z }
        })
    }

    onShovelerResponse(response, context) {
        if (response.data.result === 'built') {
            // if (response.data.coordinates.x == -70 && response.data.coordinates.z == -9) debugger
            const x = response.data.coordinates.x
            const z = response.data.coordinates.z
            const geometry = response.data.geometry
            const chunk = new Chunk(x, z, ChunkLoader.config)
            chunk.geometry.attributes.normal.array = geometry.attributes.normal.array
            
            chunk.geometry.attributes.position.array = geometry.attributes.position.array
            
            chunk.geometry.index.array = geometry.index.array
            
            chunk.geometry.drawRange = geometry.drawRange
            
            context.chunks.push(chunk)
            context.group.add(chunk.mesh)
            context.buildQueue.splice(context.buildQueue.indexOf(response.data.coordinates))
            console.log(`Create chunk paralel [${chunk.chunk_x}, ${chunk.chunk_z}] in ${parseInt(clock.getDelta() * 1000)}ms`)
        }
    }

    destroyChunk(chunk) {
        chunk.destroy()
        this.chunks = this.chunks.filter(c => c !== chunk)
        this.group.remove(chunk.mesh)

        console.log(`Destroy chunk [${chunk.chunk_x}, ${chunk.chunk_z}]`);
    }

    getChunkByCoordinates(x, z) {
        for (const c of this.chunks) {
            if (c.chunk_x === x && c.chunk_z === z) {
                return c
            }
        }

        return false
    }

    isChunkBeingBuilt(x, z) {
        for (const coords of this.buildQueue) {
            if (coords.x == x && coords.z == z) return true
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

export default ChunkLoader