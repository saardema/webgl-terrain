import * as THREE from 'three'

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const renderer = new THREE.WebGLRenderer({antialias:true})
renderer.outputEncoding = THREE.LinearEncoding;
// renderer.toneMapping = THREE.NoToneMapping;
// renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 1000)

document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

export { renderer, camera, sizes }