import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Timer } from "three/addons/misc/Timer.js";
import GUI from "lil-gui";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import gsap from "gsap";
import { Sky } from "three/addons/objects/Sky.js";
import "./style.css";

const gui = new GUI({ width: 340 });
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const textureLoader = new THREE.TextureLoader();
const scene = new THREE.Scene();

const createFireWork = (count: number, fwPosition: THREE.Vector3) => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = Math.random() - 0.5;
    positions[i3 + 1] = Math.random() - 0.5;
    positions[i3 + 2] = Math.random() - 0.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
  });

  const points = new THREE.Points(geometry, material);
  points.position.copy(fwPosition);

  scene.add(points);
};

createFireWork(100, new THREE.Vector3(0, 0, 0));

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(3, 6, 4);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const timer = new Timer();

const tick = () => {
  timer.update();
  const elapsedTime = timer.getElapsed();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
