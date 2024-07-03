import * as THREE from "three";
import { scene, rgbeLoader, gui, tickSubscribers, gltfLoader } from "./setup";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

rgbeLoader.load("./urban_alley_01_1k.hdr", (environmentMap) => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping;

  scene.background = environmentMap;
  scene.environment = environmentMap;
});

const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 2, -2.25);
scene.add(directionalLight);

const uniforms = {
  uTime: new THREE.Uniform(0),
  uPositionFrequency: new THREE.Uniform(0.5),
  uTimeFrequency: new THREE.Uniform(0.4),
  uStrength: new THREE.Uniform(0.3),
  uWarpPositionFrequency: new THREE.Uniform(0.38),
  uWarpTimeFrequency: new THREE.Uniform(0.12),
  uWarpStrength: new THREE.Uniform(1.7),
  uColorA: new THREE.Uniform(new THREE.Color("#0000ff")),
  uColorB: new THREE.Uniform(new THREE.Color("#ff0000")),
};

const material = new CustomShaderMaterial({
  baseMaterial: THREE.MeshPhysicalMaterial,
  vertexShader,
  fragmentShader,
  silent: true,
  uniforms,
  metalness: 0,
  roughness: 0.5,
  transmission: 0,
  ior: 1.5,
  thickness: 1.5,
  transparent: true,
  wireframe: false,
});

const depthMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshDepthMaterial,
  vertexShader,
  silent: true,
  depthPacking: THREE.RGBADepthPacking,
  uniforms,
});

gltfLoader.load("./suzanne.glb", (gltf) => {
  const wobble = gltf.scene.children[0] as THREE.Mesh;
  wobble.receiveShadow = true;
  wobble.castShadow = true;
  wobble.material = material;
  wobble.customDepthMaterial = depthMaterial;

  scene.add(wobble);
});

// let geometry = new THREE.IcosahedronGeometry(2.5, 50);
// geometry = mergeVertices(geometry) as THREE.IcosahedronGeometry;
// geometry.computeTangents();

// const wobble = new THREE.Mesh(geometry, material);
// wobble.receiveShadow = true;
// wobble.castShadow = true;
// wobble.customDepthMaterial = depthMaterial;
// scene.add(wobble);

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(15, 15, 15),
  new THREE.MeshStandardMaterial()
);
plane.receiveShadow = true;
plane.rotation.y = Math.PI;
plane.position.y = -5;
plane.position.z = 5;
scene.add(plane);

gui
  .add(uniforms.uPositionFrequency, "value", 0, 2, 0.001)
  .name("uPositionFrequency");
gui.add(uniforms.uTimeFrequency, "value", 0, 2, 0.001).name("uTimeFrequency");
gui.add(uniforms.uStrength, "value", 0, 2, 0.001).name("uStrength");
gui
  .add(uniforms.uWarpPositionFrequency, "value", 0, 2, 0.001)
  .name("uWarpPositionFrequency");
gui
  .add(uniforms.uWarpTimeFrequency, "value", 0, 2, 0.001)
  .name("uWarpTimeFrequency");
gui.add(uniforms.uWarpStrength, "value", 0, 2, 0.001).name("uWarpStrength");
gui.addColor(uniforms.uColorA, "value").name("uColorA");
gui.addColor(uniforms.uColorB, "value").name("uColorB");

gui.add(material, "metalness", 0, 1, 0.001);
gui.add(material, "roughness", 0, 1, 0.001);
gui.add(material, "transmission", 0, 1, 0.001);
gui.add(material, "ior", 0, 10, 0.001);
gui.add(material, "thickness", 0, 10, 0.001);

tickSubscribers.push((elapsedTime) => {
  uniforms.uTime.value = elapsedTime;
});
