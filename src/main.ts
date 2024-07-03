import * as THREE from "three";
import { scene, rgbeLoader, gui } from "./setup";
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

let geometry = new THREE.IcosahedronGeometry(2.5, 50);
geometry = mergeVertices(geometry) as THREE.IcosahedronGeometry;
geometry.computeTangents();

const material = new CustomShaderMaterial({
  baseMaterial: THREE.MeshPhysicalMaterial,
  vertexShader,
  fragmentShader,
  silent: true,
  metalness: 0,
  roughness: 0.5,
  color: "#ffffff",
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
});

const wobble = new THREE.Mesh(geometry, material);
wobble.receiveShadow = true;
wobble.castShadow = true;
wobble.customDepthMaterial = depthMaterial;
scene.add(wobble);

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(15, 15, 15),
  new THREE.MeshStandardMaterial()
);
plane.receiveShadow = true;
plane.rotation.y = Math.PI;
plane.position.y = -5;
plane.position.z = 5;
scene.add(plane);

gui.add(material, "metalness", 0, 1, 0.001);
gui.add(material, "roughness", 0, 1, 0.001);
gui.add(material, "transmission", 0, 1, 0.001);
gui.add(material, "ior", 0, 10, 0.001);
gui.add(material, "thickness", 0, 10, 0.001);
gui.addColor(material, "color");
