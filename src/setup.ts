import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { Timer } from "three/addons/misc/Timer.js";
import GUI from "lil-gui";
import "./style.css";

export const gui = new GUI({ width: 340 });

const parameters = {
  clearColor: "#160920",
};

export const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

export const rgbeLoader = new RGBELoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./draco/");
export const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

export const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(13, -3, -5);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.setClearColor(parameters.clearColor);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

gui.addColor(parameters, "clearColor").onChange(() => {
  renderer.setClearColor(parameters.clearColor);
});

export const resizeSubscribers: Array<(s: typeof sizes) => void> = [];

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  resizeSubscribers.forEach((subscriber) => {
    subscriber(sizes);
  });

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

const timer = new Timer();

export const tickSubscribers: Array<
  (elapsedTime: number, deltaTime: number) => void
> = [];

const tick = () => {
  timer.update();
  const elapsedTime = timer.getElapsed();
  const deltaTime = timer.getDelta();

  tickSubscribers.forEach((subscriber) => {
    subscriber(elapsedTime, deltaTime);
  });

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
