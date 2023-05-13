import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement );

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );

document.body.appendChild( renderer.domElement );
// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
let sky = new Sky();
  sky.scale.setScalar( 450000 );
  scene.add( sky );
let	sun = new THREE.Vector3();

const effectController = {
  turbidity: 10,
  rayleigh: 3,
  mieCoefficient: 0.005,
  mieDirectionalG: 0.7,
  elevation: 2,
  azimuth: 180,
  exposure: renderer.toneMappingExposure
};

const uniforms = sky.material.uniforms;
					uniforms[ 'turbidity' ].value = effectController.turbidity;
					uniforms[ 'rayleigh' ].value = effectController.rayleigh;
					uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
					uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;

          const phi = THREE.MathUtils.degToRad( 90 - effectController.elevation );
					const theta = THREE.MathUtils.degToRad( effectController.azimuth );

					sun.setFromSphericalCoords( 1, phi, theta );

					uniforms[ 'sunPosition' ].value.copy( sun );


const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 0);

// scene.add( cube );
let nigga,helicopter,parachute
const loader = new GLTFLoader();

//loading models...
loader.load('./CjModel/scene.gltf', function(gltf) {
  nigga=gltf.scene
  gltf.scene.position.y= -2.5
  gltf.scene.position.z= 3

    scene.add(gltf.scene);
  });

loader.load('./helicopterModel/scene.gltf', function(gltf) {
  helicopter=gltf.scene
  gltf.scene.scale.set(0.4,0.4,0.4)
  gltf.scene.position.y= 1.5
scene.add(gltf.scene);
});

loader.load('./parachute/scene.gltf', function(gltf) {
  parachute=gltf.scene
  gltf.scene.position.y= -1
  gltf.scene.scale.set(0.1,0.1,0.1)
    scene.add(gltf.scene);
  });


scene.add(light);
camera.position.z = 5;


//handel resize
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
animate()
}
window.addEventListener( 'resize', onWindowResize );


function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
  controls.update();

}
animate();