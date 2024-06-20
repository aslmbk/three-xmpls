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
  resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const textureLoader = new THREE.TextureLoader();
const scene = new THREE.Scene();

const textures = [
  textureLoader.load("./particles/1.png"),
  textureLoader.load("./particles/2.png"),
  textureLoader.load("./particles/3.png"),
  textureLoader.load("./particles/4.png"),
  textureLoader.load("./particles/5.png"),
  textureLoader.load("./particles/6.png"),
  textureLoader.load("./particles/7.png"),
  textureLoader.load("./particles/8.png"),
];

const createFireWork = (
  count: number,
  fwPosition: THREE.Vector3,
  size: number,
  texture: THREE.Texture,
  radius: number,
  color: THREE.Color
) => {
  const positions = new Float32Array(count * 3);
  const particleSizes = new Float32Array(count);
  const timeMultipliers = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    const spherical = new THREE.Spherical(
      radius * (0.75 + Math.random() * 0.25),
      Math.random() * Math.PI,
      Math.random() * Math.PI * 2
    );

    const position = new THREE.Vector3().setFromSpherical(spherical);
    position.toArray(positions, i3);

    particleSizes[i] = Math.random();

    timeMultipliers[i] = 1 + Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute(
    "aSize",
    new THREE.Float32BufferAttribute(particleSizes, 1)
  );
  geometry.setAttribute(
    "aTimeMultiplier",
    new THREE.Float32BufferAttribute(timeMultipliers, 1)
  );

  texture.flipY = false;
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uProgress: new THREE.Uniform(0),
      uSize: new THREE.Uniform(size),
      uResolution: new THREE.Uniform(
        sizes.resolution.clone().multiplyScalar(sizes.pixelRatio)
      ),
      uTexture: new THREE.Uniform(texture),
      uColor: new THREE.Uniform(color),
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.position.copy(fwPosition);

  scene.add(points);

  gsap.to(material.uniforms.uProgress, {
    value: 1,
    duration: 3,
    ease: "power2.out",
    onComplete: () => {
      scene.remove(points);
      geometry.dispose();
      material.dispose();
    },
  });
};

createFireWork(
  100,
  new THREE.Vector3(),
  0.5,
  textures[7],
  1,
  new THREE.Color(0x8affff)
);

window.addEventListener("click", (event) => {
  const count = Math.round(400 + Math.random() * 1000);
  const position = new THREE.Vector3(
    (Math.random() - 0.5) * 2,
    Math.random(),
    (Math.random() - 0.5) * 2
  );
  const size = 0.1 + Math.random() * 0.1;
  const texture = textures[Math.floor(Math.random() * textures.length)];
  const radius = 0.5 + Math.random();
  const color = new THREE.Color();
  color.setHSL(Math.random(), 1, 0.7);
  createFireWork(count, position, size, texture, radius, color);
});

const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(1.5, 0, 6);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);

const sun = new THREE.Vector3();

const skyParameters = {
  turbidity: 10,
  rayleigh: 3,
  mieCoefficient: 0.005,
  mieDirectionalG: 0.95,
  elevation: -2.2,
  azimuth: 180,
  exposure: renderer.toneMappingExposure,
};

const updateSky = () => {
  const uniforms = sky.material.uniforms;
  uniforms["turbidity"].value = skyParameters.turbidity;
  uniforms["rayleigh"].value = skyParameters.rayleigh;
  uniforms["mieCoefficient"].value = skyParameters.mieCoefficient;
  uniforms["mieDirectionalG"].value = skyParameters.mieDirectionalG;

  const phi = THREE.MathUtils.degToRad(90 - skyParameters.elevation);
  const theta = THREE.MathUtils.degToRad(skyParameters.azimuth);

  sun.setFromSphericalCoords(1, phi, theta);

  uniforms["sunPosition"].value.copy(sun);

  renderer.toneMappingExposure = skyParameters.exposure;
  renderer.render(scene, camera);
};

gui.add(skyParameters, "turbidity", 0.0, 20.0, 0.1).onChange(updateSky);
gui.add(skyParameters, "rayleigh", 0.0, 4, 0.001).onChange(updateSky);
gui.add(skyParameters, "mieCoefficient", 0.0, 0.1, 0.001).onChange(updateSky);
gui.add(skyParameters, "mieDirectionalG", 0.0, 1, 0.001).onChange(updateSky);
gui.add(skyParameters, "elevation", -3, 10, 0.01).onChange(updateSky);
gui.add(skyParameters, "azimuth", -180, 180, 0.1).onChange(updateSky);
gui.add(skyParameters, "exposure", 0, 1, 0.0001).onChange(updateSky);

updateSky();

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.resolution.set(sizes.width, sizes.height);
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
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
