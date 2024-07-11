import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/loaders/GLTFLoader.js";
import { TransformControls } from "https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/controls/TransformControls.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.set(10, 20, 35);


//axeshelper
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const spotLight = new THREE.SpotLight(0xffffff, 5000, 100, 0.2, 1);
spotLight.position.set(0, 25, 0);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);

const spotLightTransformControl = new TransformControls(
  camera,
  renderer.domElement
);
spotLightTransformControl.addEventListener("dragging-changed", (event) => {
  controls.enabled = !event.value;
});

spotLightTransformControl.attach(spotLight);
scene.add(spotLightTransformControl);
//ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

//directional light
const directionalLight = new THREE.DirectionalLight(0xffffff,5);
directionalLight.position.set(10, 25, 0);
scene.add(directionalLight)

let mixer;
const gltfLoader = new GLTFLoader();
const url = "/public/humanoidRobo/scene.gltf";
// const url = "/test.gltf";
// const url = "/buster_drone/scene.gltf";
gltfLoader.load(url, (gltf) => {
  const root = gltf.scene;
  const animation = gltf.animations
  console.log(animation)
  root.scale.set(10, 10, 10);
  root.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  root.position.set(0, 0.5, 0);
  scene.add(root);
  mixer = new THREE.AnimationMixer(root);
  const clips = gltf.animations;
  // const clip = THREE.AnimationClip.findByName(clips, "Fly");
  // const action = mixer.clipAction(clip);
  // action.play();
  clips.forEach((clip) => {
    const action = mixer.clipAction(clip);
    action.play();
  });

});



const clock = new THREE.Clock();

document.getElementById("playButton").addEventListener("click", () => {
  if (mixer) {
    mixer.timeScale = 1;
  }
});

document.getElementById("pauseButton").addEventListener("click", () => {
  if (mixer) {
    mixer.timeScale = 0;
  }
});

function animate() {
  requestAnimationFrame(animate);
  if (mixer) {
    mixer.update(clock.getDelta());
  }

  controls.update();
  renderer.render(scene, camera);
  
}

animate();

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);




