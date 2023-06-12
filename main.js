import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const controls = new OrbitControls(camera, renderer.domElement);

//physics
const CdHuman = 1; // انسيابية جسم الإنسان
const L = 8, W = 5;  // طول و عرض المظلة 
const P0 = 101.325;  // قيمة الضغط عند سطح البحر
const M = 0.0289644; // الكتلة المولية للهواء
const R = 8.31;  // ثابت الغازات العام
const T0 = 15;  // درجة الحرارة عند سطخ الارض بالسيليسويس 
const humanWeight = 80;  // وزن الانسان   Variable
const parachuteWeight = 5;  // وزن الباراشوت   Variable
const g = 9.82;         //ثابت الجاذبية الأرضية  
const A = L * W;        // مقطع السطح العرضي للباراشوت
const AHuman = 1.4; // مقطع سطح العرضي للانسان 
const Cd = 2; //انسيابية الباراشوت
const Ci = 1; // قوة الرفع 

let Ay
let Ax
let Vwy = 10
let Vwx = 10
let Xdistance = 0;

let h = 4500;          // الأرتفاع الإبتدائي
let Vy = 0; //السرعة الإبتدائية على المحور العمودي
let Vx = 0; // السرعة الابتدائية على المحور الافقي
let rho, T, P; //درجة الحرارة و كثافة الهواء و الضغط الجوي 
let Az = 0;
let Vz = 1;
let Vwz = 10;
let Zdistance = 0;

let Te=800;

const h0 = h;

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

const Tens = (m) =>{
  return m*g;
} 

const rhoCalculate = (P, T) => {
  return (P * M) / (R * T) * 100;
}

const FWind = (Cd, A, rho, V) => {
  return 0.5 * Cd * A * rho * V ** 2;
}



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

let human, helicopter, parachute//variables for models
const loader = new GLTFLoader();

//loading models...
loader.load('./helicopterModel/scene.gltf', function (gltf) {
  helicopter = gltf.scene
  helicopter.scale.set(0.4, 0.4, 0.4)
  helicopter.position.y = h0
  helicopter.position.x = 16
  helicopter.rotation.z = 0.2
  helicopter.scale.set(5, 5, 5)
  scene.add(helicopter);

});

let cjnumber = 0

loader.load('./CjModel/scene.gltf', function (gltf) {
  human = gltf.scene
  human.position.y = h
  human.position.z = 0
  human.rotation.x = 90
  human.scale.set(10, 10, 10)
  scene.add(human);
});

// function jumb(){
// if(cjnumber ==0){
//   loader.load('./CjModel/scene.gltf', function(gltf) {
//     human=gltf.scene
//     human.position.x = helicopter?.position.x
//     human.position.y= helicopter?.position.y-5
//     human.position.z= 4

//         scene.add(human);

//       })

//     cjnumber+=1;

//   }
//       else
//       console.log('cjalreadyexist')

// }

let opened = false
function pJumb() {
  if (human) {

    loader.load('./parachute/scene.gltf', function (gltf) {
      parachute = gltf.scene;
      parachute.position.x = human.position.x;
      parachute.position.y = human.position.y + 7;
      parachute.position.z = human.position.z - 32;
      opened = true;
      scene.add(parachute);
    })
  }

  // else{
  // loader.load('./CjModel/scene.gltf', function(gltf) {
  //   human=gltf.scene
  //   human.position.x = helicopter?.position.x
  //   human.position.y= -2.5
  //   human.position.z= 4

  //       scene.add(human);
  // })
  // loader.load('./parachute/scene.gltf', function(gltf) {
  //   parachute=gltf.scene;
  //   parachute.position.x=human.position.x;
  //   parachute.position.y= human.position.y + 0.5;
  //   parachute.scale.set(0.1,0.1,0.1)
  //     scene.add(parachute);
  //   })
  // }

}


// document.getElementById("btn").addEventListener("click", jumb);

document.getElementById("pbtn").addEventListener("click", pJumb);



//ground
var groundGeometry = new THREE.PlaneGeometry(300, 300);
const groundtext = new THREE.TextureLoader().load('atlas.png');
groundtext.colorSpace = THREE.SRGBColorSpace;
groundtext.magFilter = THREE.NearestFilter;
groundtext.wrapS = THREE.RepeatWrapping;
groundtext.wrapT = THREE.RepeatWrapping;
groundtext.repeat.set(1, 1);
const ground = new THREE.Mesh(groundGeometry, new THREE.MeshLambertMaterial({ map: groundtext, side: THREE.DoubleSide }));
scene.add(ground);
ground.position.y = -12.5;
ground.rotation.x = -Math.PI / 2;


scene.add(light);
camera.position.z = 5;

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

var clock = new THREE.Clock();

function animate() {
  var deltaTime = clock.getDelta()



  if (h > -12.5 && !opened) {
    if (human !== undefined) {
      camera.position.set(human.position.x, human.position.y + 75, human.position.z + 50);
      camera.lookAt(human.position)
      human.position.y = h
      human.position.x = Xdistance
      human.position.z = Zdistance

    }
    T = TCalculate(h);
    P = PCalculate(h, T);

    rho = rhoCalculate(P, T);

    let FnetY = Fg(humanWeight + parachuteWeight, g)
    Ay = FnetY / (humanWeight + parachuteWeight);
    Vy += Ay * deltaTime;
    let hs = (Vy * deltaTime);
    h -= hs;


    let FnetX = FWind(CdHuman, AHuman, rho, Vwx) - FDrag(CdHuman, AHuman, rho, Vx)
    Ax = FnetX / (humanWeight + parachuteWeight);
    Vx += Ax * deltaTime;
    let distX = Vx * deltaTime;
    Xdistance += distX;


    let Fnetz = FWind(CdHuman, AHuman, rho, Vwz) - FDrag(CdHuman, AHuman, rho, Vz)
    Az = Fnetz / (humanWeight + parachuteWeight);
    Vz += Az * deltaTime;
    let distz = Vz * deltaTime;
    Zdistance += distz;


    console.log(` 
    height: ${h + 13} m 
    Vertical Velocity: ${Vy} m/s 
    Temp: ${T} K 
    Pressure: ${P} Pa
    Acceleration: ${Ay} m/s^2
    DeltaTime : ${deltaTime}
    Fnet : ${FnetY}
    FG : ${Fg(humanWeight + parachuteWeight, g)}
    Fdrag : ${FDrag(Cd, A, rho, Vy)}
    rho : ${rho}
    Horizantal X Velocity : ${Vx}
    Xposition : ${Xdistance}
    Horizantal Z Velocity : ${Vz}
    Zposition : ${Zdistance}
    Az: ${Az}
    tense : ${Tens(humanWeight)}

    
    `
    )

  } else if (h > -12.5 && opened) {
    if(Te < Tens(humanWeight)){
      opened = false;
      parachute
    }
    if (human !== undefined) {
      camera.position.set(human.position.x, human.position.y + 75, human.position.z + 50);
      camera.lookAt(human.position)
      human.position.y = h
      human.position.x = Xdistance
      human.position.z = Zdistance

    }
    if (parachute !== undefined) {
      parachute.position.x = human.position.x;
      parachute.position.y = human.position.y + 7;
      parachute.position.z = human.position.z - 32;
    }

    T = TCalculate(h);
    P = PCalculate(h, T);

    rho = rhoCalculate(P, T);
    let FnetY = Fg(humanWeight + parachuteWeight, g) - FDrag(Cd, A, rho, Vy + Vwy)
    Ay = FnetY / (humanWeight + parachuteWeight);
    Vy += Ay * deltaTime;


    let FnetX = FWind(Cd, A, rho, Vwx) - FDrag(Cd, A, rho, Vx)
    Ax = FnetX / (humanWeight + parachuteWeight);
    Vx += Ax * deltaTime;
    let distX = Vx * deltaTime;
    Xdistance += distX;

    let Fnetz = FWind(Cd, A, rho, Vwz) - FDrag(Cd, A, rho, Vz)
    Az = Fnetz / (humanWeight + parachuteWeight);
    Vz += Az * deltaTime;
    let distz = Vz * deltaTime;
    Zdistance += distz;



    let hs = Vy * deltaTime;
    h -= hs;


    console.log(` 
    height: ${h + 13} m 
    Vertical Velocity: ${Vy} m/s 
    Temp: ${T} K 
    Pressure: ${P} Pa
    Acceleration: ${Ay} m/s^2
    DeltaTime : ${deltaTime}
    Fnet : ${FnetY}
    FG : ${Fg(humanWeight + parachuteWeight, g)}
    Fdrag : ${FDrag(Cd, A, rho, Vy)}
    rho : ${rho}
    Horizantal Velocity : ${Vx}
    Xposition : ${Xdistance}
    Horizantal Z Velocity : ${Vz}
    Zposition : ${Zdistance}
    Az: ${Az}
    tense : ${Tens(humanWeight)}

    `)

    human.rotation.x = 0
  }


  requestAnimationFrame(animate);

  renderer.render(scene, camera);
  controls.update();
}
animate();

const ambientLight = new THREE.AmbientLight(0xeeeeee);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
directionalLight.position.set(1, 1, 0.5).normalize();
scene.add(directionalLight);

