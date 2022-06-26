import Chunk from './Chunk'

onmessage = function(message) {
    if (message.data.instruction === 'build') {
        const x = message.data.coordinates.x
        const z = message.data.coordinates.z
        const config = message.data.config
        const chunk = new Chunk(x, z, config)
        chunk.build()

        chunk.geometry.attributes.uv.array = null

        this.postMessage({
            result: 'built',
            coordinates: {x, z},
            geometry: chunk.geometry
        })
    }
}