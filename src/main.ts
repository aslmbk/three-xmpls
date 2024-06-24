import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Timer } from "three/addons/misc/Timer.js";
import GUI from "lil-gui";
import VS from "./shaders/vertex.glsl";
import FS from "./shaders/fragment.glsl";
import "./style.css";

const gui = new GUI({ width: 340 });
const debugObject = {
  depthColor: "#ff4000",
  surfaceColor: "#151c37",
  fogColor: "#95ff14",
  fogDensity: 0.25,
};
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const scene = new THREE.Scene();

const planeGeometry = new THREE.PlaneGeometry(2, 2, 512, 512);
planeGeometry.deleteAttribute("normal");
planeGeometry.deleteAttribute("uv");
const planeMaterial = new THREE.ShaderMaterial({
  vertexShader: VS,
  fragmentShader: FS,
  uniforms: {
    uTime: { value: 0 },
    uBigWavesElevation: { value: 0.2 },
    uBigWavesFrequency: new THREE.Uniform(new THREE.Vector2(4, 1.5)),
    uBigWavesSpeed: { value: 0.75 },
    uSmallWavesElevation: { value: 0.15 },
    uSmallWavesFrequency: { value: 3 },
    uSmallWavesSpeed: { value: 0.2 },
    uSmallIterations: { value: 4 },
    uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
    uColorOffset: new THREE.Uniform(0.925),
    uColorMultiplier: new THREE.Uniform(1),
    fogColor: new THREE.Uniform(new THREE.Color(debugObject.fogColor)),
    fogDensity: new THREE.Uniform(debugObject.fogDensity),
  },
  transparent: true,
  fog: true,
});

scene.fog = new THREE.FogExp2(debugObject.fogColor, debugObject.fogDensity);

gui.addColor(debugObject, "depthColor").onChange(() => {
  planeMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor);
});
gui.addColor(debugObject, "surfaceColor").onChange(() => {
  planeMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
});
gui
  .add(planeMaterial.uniforms.uBigWavesElevation, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uBigWavesElevation");
gui
  .add(planeMaterial.uniforms.uBigWavesFrequency.value, "x")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uBigWavesFrequencyX");
gui
  .add(planeMaterial.uniforms.uBigWavesFrequency.value, "y")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uBigWavesFrequencyY");
gui
  .add(planeMaterial.uniforms.uBigWavesSpeed, "value")
  .min(0)
  .max(4)
  .step(0.001)
  .name("uBigWavesSpeed");
gui
  .add(planeMaterial.uniforms.uSmallWavesElevation, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uSmallWavesElevation");
gui
  .add(planeMaterial.uniforms.uSmallWavesFrequency, "value")
  .min(0)
  .max(30)
  .step(0.001)
  .name("uSmallWavesFrequency");
gui
  .add(planeMaterial.uniforms.uSmallWavesSpeed, "value")
  .min(0)
  .max(4)
  .step(0.001)
  .name("uSmallWavesSpeed");
gui
  .add(planeMaterial.uniforms.uSmallIterations, "value")
  .min(0)
  .max(5)
  .step(1)
  .name("uSmallIterations");
gui
  .add(planeMaterial.uniforms.uColorOffset, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uColorOffset");
gui
  .add(planeMaterial.uniforms.uColorMultiplier, "value")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uColorMultiplier");

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI * 0.5;
scene.add(plane);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(1, 1, 1);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(debugObject.fogColor);
renderer.toneMapping = THREE.ACESFilmicToneMapping;

gui.addColor(debugObject, "fogColor").onChange(() => {
  if (scene.fog) scene.fog.color.set(debugObject.fogColor);
  renderer.setClearColor(debugObject.fogColor);
});
gui
  .add(debugObject, "fogDensity")
  .min(0)
  .max(5)
  .step(0.001)
  .onChange(() => {
    scene.fog = new THREE.FogExp2(debugObject.fogColor, debugObject.fogDensity);
  });

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const timer = new Timer();

const tick = () => {
  timer.update();
  const elapsedTime = timer.getElapsed();

  planeMaterial.uniforms.uTime.value = elapsedTime;

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
