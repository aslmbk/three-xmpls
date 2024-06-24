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
  color: "#ff5050",
  ambientColor: "#ffffff",
  directionalColor: "#ffe01a",
  directionalLightPosition: new THREE.Vector3(0, 0, 3),
  pointColor: "#00ffb3",
  pointLightPosition: new THREE.Vector3(-2, 3, 1),
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
    uColor: new THREE.Uniform(new THREE.Color(parameters.color)),

    uAmbientLightColor: new THREE.Uniform(
      new THREE.Color(parameters.ambientColor)
    ),
    uAmbientLightIntensity: new THREE.Uniform(0.1),

    uDirectionalLightColor: new THREE.Uniform(
      new THREE.Color(parameters.directionalColor)
    ),
    uDirectionalLightIntensity: new THREE.Uniform(1),
    uDirectionalLightPosition: new THREE.Uniform(
      parameters.directionalLightPosition
    ),
    uDirectionalLightSpecularIntensity: new THREE.Uniform(10),
    uDirectionalLightSpecularPower: new THREE.Uniform(20),

    uPointLightColor: new THREE.Uniform(new THREE.Color(parameters.pointColor)),
    uPointLightIntensity: new THREE.Uniform(10),
    uPointLightPosition: new THREE.Uniform(parameters.pointLightPosition),
    uPointLightSpecularIntensity: new THREE.Uniform(1),
    uPointLightSpecularPower: new THREE.Uniform(32),
    uPointLightDecay: new THREE.Uniform(0.25),
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

const directionalLightHelper = new THREE.Mesh(
  new THREE.PlaneGeometry(),
  new THREE.MeshBasicMaterial({
    color: parameters.directionalColor,
    side: THREE.DoubleSide,
  })
);
directionalLightHelper.position.copy(parameters.directionalLightPosition);
scene.add(directionalLightHelper);

const pointLightHelper = new THREE.Mesh(
  new THREE.SphereGeometry(0.1),
  new THREE.MeshBasicMaterial({ color: parameters.pointColor })
);
pointLightHelper.position.copy(parameters.pointLightPosition);
scene.add(pointLightHelper);

gui.addColor(parameters, "color").onChange(() => {
  material.uniforms.uColor.value.set(parameters.color);
});

gui.addColor(parameters, "ambientColor").onChange(() => {
  material.uniforms.uAmbientLightColor.value.set(parameters.ambientColor);
});
gui
  .add(material.uniforms.uAmbientLightIntensity, "value")
  .min(0)
  .max(10)
  .step(0.01)
  .name("ambientIntensity");

gui.addColor(parameters, "directionalColor").onChange(() => {
  material.uniforms.uDirectionalLightColor.value.set(
    parameters.directionalColor
  );
  directionalLightHelper.material.color.set(parameters.directionalColor);
});
gui
  .add(material.uniforms.uDirectionalLightIntensity, "value")
  .min(0)
  .max(10)
  .step(0.01)
  .name("directionalIntensity");
gui
  .add(material.uniforms.uDirectionalLightSpecularIntensity, "value")
  .min(0)
  .max(50)
  .step(0.01)
  .name("directionalSpecularIntensity");
gui
  .add(material.uniforms.uDirectionalLightSpecularPower, "value")
  .min(1)
  .max(50)
  .step(0.01)
  .name("directionalSpecularPower");
gui
  .add(parameters.directionalLightPosition, "x")
  .min(-10)
  .max(10)
  .step(0.01)
  .onChange(() => {
    material.uniforms.uDirectionalLightPosition.value.copy(
      parameters.directionalLightPosition
    );
    directionalLightHelper.position.copy(parameters.directionalLightPosition);
  })
  .name("directionalX");
gui
  .add(parameters.directionalLightPosition, "y")
  .min(-10)
  .max(10)
  .step(0.01)
  .onChange(() => {
    material.uniforms.uDirectionalLightPosition.value.copy(
      parameters.directionalLightPosition
    );
    directionalLightHelper.position.copy(parameters.directionalLightPosition);
  })
  .name("directionalY");
gui
  .add(parameters.directionalLightPosition, "z")
  .min(-10)
  .max(10)
  .step(0.01)
  .onChange(() => {
    material.uniforms.uDirectionalLightPosition.value.copy(
      parameters.directionalLightPosition
    );
    directionalLightHelper.position.copy(parameters.directionalLightPosition);
  })
  .name("directionalZ");

gui.addColor(parameters, "pointColor").onChange(() => {
  material.uniforms.uPointLightColor.value.set(parameters.pointColor);
  pointLightHelper.material.color.set(parameters.pointColor);
});
gui
  .add(material.uniforms.uPointLightIntensity, "value")
  .min(0)
  .max(20)
  .step(0.01)
  .name("pointIntensity");
gui
  .add(material.uniforms.uPointLightSpecularIntensity, "value")
  .min(0)
  .max(50)
  .step(0.01)
  .name("pointSpecularIntensity");
gui
  .add(material.uniforms.uPointLightSpecularPower, "value")
  .min(1)
  .max(50)
  .step(0.01)
  .name("pointSpecularPower");
gui
  .add(material.uniforms.uPointLightDecay, "value")
  .min(0)
  .max(1)
  .step(0.01)
  .name("pointDecay");
gui
  .add(parameters.pointLightPosition, "x")
  .min(-10)
  .max(10)
  .step(0.01)
  .onChange(() => {
    material.uniforms.uPointLightPosition.value.copy(
      parameters.pointLightPosition
    );
    pointLightHelper.position.copy(parameters.pointLightPosition);
  })
  .name("pointX");
gui
  .add(parameters.pointLightPosition, "y")
  .min(-10)
  .max(10)
  .step(0.01)
  .onChange(() => {
    material.uniforms.uPointLightPosition.value.copy(
      parameters.pointLightPosition
    );
    pointLightHelper.position.copy(parameters.pointLightPosition);
  })
  .name("pointY");
gui
  .add(parameters.pointLightPosition, "z")
  .min(-10)
  .max(10)
  .step(0.01)
  .onChange(() => {
    material.uniforms.uPointLightPosition.value.copy(
      parameters.pointLightPosition
    );
    pointLightHelper.position.copy(parameters.pointLightPosition);
  })
  .name("pointZ");

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
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
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
  if (suzanne) {
    suzanne.rotation.x = -elapsedTime * 0.1;
    suzanne.rotation.y = elapsedTime * 0.2;
  }

  sphere.rotation.x = -elapsedTime * 0.1;
  sphere.rotation.y = elapsedTime * 0.2;

  torusKnot.rotation.x = -elapsedTime * 0.1;
  torusKnot.rotation.y = elapsedTime * 0.2;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
