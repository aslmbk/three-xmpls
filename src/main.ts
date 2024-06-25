import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Timer } from "three/addons/misc/Timer.js";
import GUI from "lil-gui";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import "./style.css";

const gui = new GUI({ width: 340 });
const parameters = {
  clearColor: "#26132f",
  color: "#ff794d",
  shadowColor: "#8e19b8",
  lightColor: "#e5ffe0",
};
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const gltfLoader = new GLTFLoader();
const scene = new THREE.Scene();

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uColor: { value: new THREE.Color(parameters.color) },
    uShadowColor: { value: new THREE.Color(parameters.shadowColor) },
    uLightColor: { value: new THREE.Color(parameters.lightColor) },
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio
      )
    ),
    uShadowRepetitions: new THREE.Uniform(100),
    uLightRepetitions: new THREE.Uniform(150),
  },
});

const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32),
  material
);
torusKnot.position.x = 3;
scene.add(torusKnot);

// Sphere
const sphere = new THREE.Mesh(new THREE.SphereGeometry(), material);
sphere.position.x = -3;
scene.add(sphere);

// Suzanne
let suzanne: THREE.Object3D;
gltfLoader.load("./suzanne.glb", (gltf) => {
  suzanne = gltf.scene;
  suzanne.traverse((child) => {
    const obj = child as THREE.Mesh;
    if (obj.isMesh) obj.material = material;
  });
  scene.add(suzanne);
});

const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(7, 7, 7);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setClearColor(parameters.clearColor);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

gui.addColor(parameters, "clearColor").onChange(() => {
  renderer.setClearColor(parameters.clearColor);
});
gui.addColor(parameters, "color").onChange(() => {
  material.uniforms.uColor.value.set(parameters.color);
});
gui.addColor(parameters, "shadowColor").onChange(() => {
  material.uniforms.uShadowColor.value.set(parameters.shadowColor);
});
gui.addColor(parameters, "lightColor").onChange(() => {
  material.uniforms.uLightColor.value.set(parameters.lightColor);
});
gui
  .add(material.uniforms.uShadowRepetitions, "value")
  .min(1)
  .max(300)
  .step(1)
  .name("Shadow Repetitions");
gui
  .add(material.uniforms.uLightRepetitions, "value")
  .min(1)
  .max(300)
  .step(1)
  .name("Light Repetitions");

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  material.uniforms.uResolution.value.set(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio
  );

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

const timer = new Timer();

const tick = () => {
  timer.update();
  const elapsedTime = timer.getElapsed();
  if (suzanne) {
    suzanne.rotation.x = -elapsedTime * 0.1;
    suzanne.rotation.y = elapsedTime * 0.2;
  }

  sphere.rotation.x = -elapsedTime * 0.1;
  sphere.rotation.y = elapsedTime * 0.2;

  torusKnot.rotation.x = -elapsedTime * 0.1;
  torusKnot.rotation.y = elapsedTime * 0.2;

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
