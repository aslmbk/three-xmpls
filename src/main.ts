import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { Timer } from "three/addons/misc/Timer.js";
import gsap from "gsap";
import GUI from "lil-gui";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import "./style.css";

const gui = new GUI({ width: 340 });
const parameters = {
  clearColor: "#160920",
};
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./draco/");
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
const scene = new THREE.Scene();

const particles = {
  geometry: new THREE.BufferGeometry(),
  material: new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uSize: new THREE.Uniform(0.4),
      uResolution: new THREE.Uniform(
        new THREE.Vector2(
          sizes.width * sizes.pixelRatio,
          sizes.height * sizes.pixelRatio
        )
      ),
      uProgress: new THREE.Uniform(0),
      uColorA: new THREE.Uniform(new THREE.Color("#ff7300")),
      uColorB: new THREE.Uniform(new THREE.Color("#0091ff")),
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }),
  points: {} as THREE.Points,
  modelPositions: {} as Record<string, THREE.BufferAttribute>,
  maxPositionCount: 0,
  morphingMethods: {} as Record<string, () => void>,
  morphingDuraion: 1,
};
particles.geometry.setIndex(null);
particles.points = new THREE.Points(particles.geometry, particles.material);
particles.points.frustumCulled = false;
scene.add(particles.points);

gltfLoader.load("./models.glb", (gltf) => {
  gltf.scene.children.forEach((child) => {
    if (child instanceof THREE.Mesh) {
      particles.modelPositions[child.name] = child.geometry.attributes
        .position as THREE.BufferAttribute;

      particles.maxPositionCount = Math.max(
        particles.maxPositionCount,
        particles.modelPositions[child.name].count
      );
    }
  });

  const sizes = new Float32Array(particles.maxPositionCount);
  for (let i = 0; i < particles.maxPositionCount; i++) {
    sizes[i] = Math.random();
  }

  Object.keys(particles.modelPositions).forEach((key) => {
    const positions = particles.modelPositions[key];
    const newArray = new Float32Array(
      particles.maxPositionCount * positions.itemSize
    );
    newArray.set(positions.array);
    // newArray.fill(9999, positions.array.length);
    for (let i = positions.count; i < particles.maxPositionCount; i++) {
      const i3 = i * 3;
      const randomIndex = Math.floor(Math.random() * positions.count) * 3;
      newArray[i3] = positions.array[randomIndex];
      newArray[i3 + 1] = positions.array[randomIndex + 1];
      newArray[i3 + 2] = positions.array[randomIndex + 2];
    }
    particles.modelPositions[key] = new THREE.Float32BufferAttribute(
      newArray,
      positions.itemSize
    );
  });

  particles.geometry.setAttribute(
    "position",
    particles.modelPositions["Suzanne"]
  );
  particles.geometry.setAttribute(
    "aPositionTarget",
    particles.modelPositions["Suzanne"]
  );
  particles.geometry.setAttribute(
    "aSize",
    new THREE.Float32BufferAttribute(sizes, 1)
  );

  Object.keys(particles.modelPositions).forEach((key) => {
    const methodName = `goTo${key}`;
    particles.morphingMethods[methodName] = () => {
      if (
        particles.modelPositions[key] ===
        particles.geometry.attributes.aPositionTarget
      ) {
        return;
      }
      particles.geometry.attributes.position =
        particles.geometry.attributes.aPositionTarget;
      particles.geometry.attributes.aPositionTarget =
        particles.modelPositions[key];

      gsap.fromTo(
        particles.material.uniforms.uProgress,
        { value: 0 },
        { value: 1, duration: particles.morphingDuraion, ease: "linear" }
      );
    };
    gui.add(particles.morphingMethods, methodName);
  });
});

const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, 16);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.setClearColor(parameters.clearColor);

gui.addColor(parameters, "clearColor").onChange(() => {
  renderer.setClearColor(parameters.clearColor);
});
gui.addColor(particles.material.uniforms.uColorA, "value");
gui.addColor(particles.material.uniforms.uColorB, "value");
gui
  .add(particles.material.uniforms.uProgress, "value")
  .min(0)
  .max(1)
  .step(0.01)
  .listen()
  .name("Progress");
gui.add(particles, "morphingDuraion").min(0).max(5).step(1).name("Duration");

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  particles.material.uniforms.uResolution.value.set(
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

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
