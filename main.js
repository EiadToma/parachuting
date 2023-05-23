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
//stats for sky
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

let nigga,helicopter,parachute//variables for models
const loader = new GLTFLoader();

//loading models...
loader.load('./helicopterModel/scene.gltf', function(gltf) {
  helicopter=gltf.scene
  helicopter.scale.set(0.4,0.4,0.4)
  helicopter.position.y= 1.5
  helicopter.position.x=16
  helicopter.rotation.z = 0.2
scene.add(helicopter);
});

loader.load('./CjModel/scene.gltf', function(gltf) {
nigga=gltf.scene
nigga.position.y= -2.5
nigga.position.z= 4

    scene.add(nigga);
  });

loader.load('./parachute/scene.gltf', function(gltf) {
  parachute=gltf.scene
  parachute.position.y= -2
  parachute.scale.set(0.1,0.1,0.1)
    scene.add(parachute);
  });

  //ground
var groundGeometry = new THREE.PlaneGeometry(100, 100);
var groundMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
var groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.position.y = -40;
groundMesh.rotation.x = -Math.PI / 2; 
scene.add(groundMesh);


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
  //helicopter movment
if (helicopter !== undefined) {
  if(helicopter.position.x >0 ){
    helicopter.position.x -= 0.01;
}
if(helicopter.position.x <2){
  if(helicopter.rotation.z >0)
    helicopter.rotation.z -= 0.001
 }
  }
  //
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
  controls.update();

}
animate();