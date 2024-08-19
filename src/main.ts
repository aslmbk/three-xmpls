import * as THREE from "three";
import { scene, rgbeLoader, tickSubscribers, gui } from "./setup";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import { Brush, Evaluator, SUBTRACTION } from "three-bvh-csg";

const directionalLight = new THREE.DirectionalLight("#ffffff", 4);
directionalLight.position.set(6.25, 3, 4);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 30;
directionalLight.shadow.camera.top = 8;
directionalLight.shadow.camera.right = 8;
directionalLight.shadow.camera.bottom = -8;
directionalLight.shadow.camera.left = -8;
scene.add(directionalLight);

rgbeLoader.load("/spruit_sunrise.hdr", (environmentMap) => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping;

  scene.background = environmentMap;
  scene.backgroundBlurriness = 0.5;
  scene.environment = environmentMap;
});

const boardFill = new Brush(new THREE.BoxGeometry(11, 2, 11));
const boardHole = new Brush(new THREE.BoxGeometry(10, 2.1, 10));

const evaluator = new Evaluator();
const board = evaluator.evaluate(boardFill, boardHole, SUBTRACTION);
board.geometry.clearGroups();
board.material = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  metalness: 0,
  roughness: 0.3,
});
board.castShadow = true;
board.receiveShadow = true;
scene.add(board);

const geometry = new THREE.PlaneGeometry(10, 10, 500, 500);
geometry.rotateX(-Math.PI * 0.5);
geometry.deleteAttribute("uv");
geometry.deleteAttribute("normal");

const uniforms = {
  uTime: new THREE.Uniform(0),
  uPositionFrequency: new THREE.Uniform(0.2),
  uStrength: new THREE.Uniform(2.0),
  uWarpFrequency: new THREE.Uniform(5),
  uWarpStrength: new THREE.Uniform(0.5),
  uColorWaterDeep: new THREE.Uniform(new THREE.Color("#002b3d")),
  uColorWaterSurface: new THREE.Uniform(new THREE.Color("#66a8ff")),
  uColorSand: new THREE.Uniform(new THREE.Color("#ffe894")),
  uColorGrass: new THREE.Uniform(new THREE.Color("#85d534")),
  uColorSnow: new THREE.Uniform(new THREE.Color("#ffffff")),
  uColorRock: new THREE.Uniform(new THREE.Color("#bfbd8d")),
};

const material = new CustomShaderMaterial({
  baseMaterial: THREE.MeshStandardMaterial,
  vertexShader,
  fragmentShader,
  silent: true,
  metalness: 0,
  roughness: 0.5,
  color: "#85d534",
  uniforms,
});

const depthMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshDepthMaterial,
  vertexShader,
  uniforms: uniforms,
  silent: true,
  depthPacking: THREE.RGBADepthPacking,
});

const terrain = new THREE.Mesh(geometry, material);
terrain.customDepthMaterial = depthMaterial;
terrain.receiveShadow = true;
terrain.castShadow = true;
scene.add(terrain);

const water = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 1, 1),
  new THREE.MeshPhysicalMaterial({
    transmission: 1,
    roughness: 0.3,
  })
);
water.rotation.x = -Math.PI * 0.5;
water.position.y = -0.1;
scene.add(water);

gui
  .add(uniforms.uPositionFrequency, "value", 0, 1, 0.001)
  .name("uPositionFrequency");
gui.add(uniforms.uStrength, "value", 0, 10, 0.001).name("uStrength");
gui.add(uniforms.uWarpFrequency, "value", 0, 10, 0.001).name("uWarpFrequency");
gui.add(uniforms.uWarpStrength, "value", 0, 1, 0.001).name("uWarpStrength");
gui.addColor(uniforms.uColorWaterDeep, "value").name("uColorWaterDeep");
gui.addColor(uniforms.uColorWaterSurface, "value").name("uColorWaterSurface");
gui.addColor(uniforms.uColorSand, "value").name("uColorSand");
gui.addColor(uniforms.uColorGrass, "value").name("uColorGrass");
gui.addColor(uniforms.uColorSnow, "value").name("uColorSnow");
gui.addColor(uniforms.uColorRock, "value").name("uColorRock");

tickSubscribers.push((time) => {
  uniforms.uTime.value = time;
});
