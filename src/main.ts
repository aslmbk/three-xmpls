import * as THREE from "three";
import { scene, rgbeLoader, gltfLoader, tickSubscribers, gui } from "./setup";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";

rgbeLoader.load("./aerodynamics_workshop.hdr", (environmentMap) => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping;

  scene.background = environmentMap;
  scene.backgroundBlurriness = 0.5;
  scene.environment = environmentMap;
});

const directionalLight = new THREE.DirectionalLight("#ffffff", 4);
directionalLight.position.set(6.25, 3, 4);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 30;
directionalLight.shadow.normalBias = 0.05;
directionalLight.shadow.camera.top = 8;
directionalLight.shadow.camera.right = 8;
directionalLight.shadow.camera.bottom = -8;
directionalLight.shadow.camera.left = -8;
scene.add(directionalLight);

const material = new THREE.MeshStandardMaterial({
  metalness: 0.5,
  roughness: 0.25,
  envMapIntensity: 0.5,
  color: "#858080",
});

const uniforms = {
  uSliceStart: new THREE.Uniform(1.75),
  uSliceArc: new THREE.Uniform(1.25),
};

const patchMap = {
  csm_Slice: {
    "#include <colorspace_fragment>": `
          #include <colorspace_fragment>

          gl_FragColor = mix(vec4(0.75, 0.15, 0.3, 1.0), gl_FragColor, float(gl_FrontFacing));
      `,
  },
};

const slicedMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshStandardMaterial,
  silent: true,
  vertexShader,
  fragmentShader,
  metalness: 0.5,
  roughness: 0.25,
  envMapIntensity: 0.5,
  color: "#858080",
  uniforms,
  side: THREE.DoubleSide,
  patchMap,
});

const slicedDepthMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshDepthMaterial,
  silent: true,
  vertexShader,
  fragmentShader,
  uniforms,
  patchMap,
  depthPacking: THREE.RGBADepthPacking,
});

let model: THREE.Object3D;

gltfLoader.load("./gears.glb", (gltf) => {
  model = gltf.scene;
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.name === "outerHull") {
        child.material = slicedMaterial;
        child.customDepthMaterial = slicedDepthMaterial;
      } else {
        child.material = material;
      }
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(model);
});

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 10),
  new THREE.MeshStandardMaterial({ color: "#aaaaaa" })
);
plane.receiveShadow = true;
plane.position.x = -4;
plane.position.y = -3;
plane.position.z = -4;
plane.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(plane);

gui
  .add(uniforms.uSliceStart, "value", -Math.PI, Math.PI, 0.001)
  .name("uSliceStart");
gui.add(uniforms.uSliceArc, "value", 0, Math.PI * 2, 0.001).name("uSliceArc");

tickSubscribers.push((elapsed) => {
  if (model) {
    model.rotation.y = elapsed * 0.1;
  }
});
