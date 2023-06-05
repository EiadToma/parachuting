import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Sky} from 'three/addons/objects/Sky.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 4000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);
let sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);
let sun = new THREE.Vector3();

const effectController = {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.7,
    elevation: 2,
    azimuth: 180,
    exposure: renderer.toneMappingExposure
};
//stats for sky
const uniforms = sky.material.uniforms;
uniforms['turbidity'].value = effectController.turbidity;
uniforms['rayleigh'].value = effectController.rayleigh;
uniforms['mieCoefficient'].value = effectController.mieCoefficient;
uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;

const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
const theta = THREE.MathUtils.degToRad(effectController.azimuth);

sun.setFromSphericalCoords(1, phi, theta);

uniforms['sunPosition'].value.copy(sun);


const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 0);

//variables for models
let human, helicopter, parachute

const CdHuman = 1;
let L = 1, W = 3;
let P0 = 101.325;
let M = 0.0289644;
let R = 8.31;
let T0 = 15;
let humanWeight = 80;
let parachuteWeight = 11;
let g = 9.82;
let h = 750;
let A = L * W;
let AHuman = 1.4;
let Cd = 1.2;


let Ci = 1;
let Vy = 0;
let Vx = 20;
let rho, T, P;

const Fg = (m, g) => {
    return m * g;
}
const FDrag = (Cd, A, rho, V) => {
    return 0.5 * Cd * A * rho * V ** 2;
}
const FLift = (Ci, A, rho, V) => {
    return 0.5 * Ci * A * rho * V ** 2;
}

const PCalculate = (h, T) => {
    return P0 * Math.exp((-M * g * h) / (R * T));
}

const TCalculate = (h) => {
    const temp = T0 - 0.0065 * h;
    return temp + 273.15;
}

const rhoCalculate = (P, T) => {
    return (P * M) / (R * T);
}

const loader = new GLTFLoader();

//loading models...
//Helicopter Model
// loader.load('./helicopterModel/scene.gltf', function (gltf) {
//     helicopter = gltf.scene
//     helicopter.scale.set(0.4, 0.4, 0.4)
//     helicopter.position.y = 1.5
//     helicopter.position.x = -2.5
//     helicopter.rotation.z = 0.2
//     scene.add(helicopter);
// });

//Parachute Model
// loader.load('./parachute/scene.gltf', function (gltf) {
//     parachute = gltf.scene
//     parachute.position.y = -2
//     parachute.position.z = 0
//     parachute.scale.set(0.1, 0.1, 0.1)
//     scene.add(parachute);
// });

// CJModel
loader.load('./CjModel/scene.gltf', function (gltf) {
    human = gltf.scene
    human.position.y = h
    human.position.z = 3
    human.rotation.x = 90
    human.scale.set(5, 5, 5)
    scene.add(human);
});


//ground
let groundGeometry = new THREE.PlaneGeometry(100, 100);
let groundMaterial = new THREE.MeshBasicMaterial({color: 0xFFB010});
let groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.position.y = 0;
groundMesh.rotation.x = -Math.PI / 2;

scene.add(groundMesh);


// //Create a cube geometry
// var geometry = new THREE.BoxGeometry(1, 1, 1);
//
// // Create a material
// var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
//
// // Create a mesh
// var cube = new THREE.Mesh(geometry, material);
// cube.scale.set(5, 5, 5)
// scene.add(cube);
// scene.add(light);
// camera.position.z = 10;


//handel resize
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    animate()

}

window.addEventListener('resize', onWindowResize);


camera.position.set(0, 10, 20);

camera.position.z = 500;

function animate() {
    if (h > -12.5) {
        if (human !== undefined) {
            camera.position.set(human.position.x, human.position.y + 75, human.position.z + 50);
            camera.lookAt(human.position)
            human.position.y = h
        }
        T = TCalculate(h);
        P = PCalculate(h, T);

        rho = rhoCalculate(P, T);
        let FnetY = Fg(humanWeight + parachuteWeight, g) - FDrag(CdHuman, AHuman, rho, Vy);
        let Ay = FnetY / (humanWeight + parachuteWeight);
        Vy = Vy + Ay;
        let hs = Vy / 1000;
        h -= hs;

        console.log(` 
        height: ${h + 13} m 
        speed: ${Vy} m/s 
        Temp: ${T} K 
        Pressure: ${P} Pa
        Acceleration: ${Ay} m/s^2`
        )

    }


    requestAnimationFrame(animate);

    renderer.render(scene, camera);
    controls.update();

}


animate();