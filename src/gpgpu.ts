import * as THREE from "three";
import {
  GPUComputationRenderer,
  Variable,
} from "three/addons/misc/GPUComputationRenderer.js";
import { renderer, gltf, tickSubscribers, scene, gui } from "./setup";
import shader from "./shaders/gpgpu/particles.glsl";

export const baseGeometry = {
  instance: (gltf.scene.children[0] as THREE.Mesh).geometry,
  count: 0,
};

baseGeometry.count = baseGeometry.instance.attributes.position.count;

export const gpgpu = {
  size: Math.ceil(Math.sqrt(baseGeometry.count)),
  computation: {} as GPUComputationRenderer,
  particlesTexture: {} as THREE.DataTexture,
  particlesVariable: {} as Variable,
  debug: {
    geometry: new THREE.PlaneGeometry(3, 3),
    material: new THREE.MeshBasicMaterial(),
    mesh: new THREE.Mesh(),
  },
  getRenderTexture: {} as () => THREE.Texture,
};

gpgpu.computation = new GPUComputationRenderer(
  gpgpu.size,
  gpgpu.size,
  renderer
);
gpgpu.particlesTexture = gpgpu.computation.createTexture();

for (let i = 0; i < baseGeometry.count; i++) {
  const i3 = i * 3;
  const i4 = i * 4;
  gpgpu.particlesTexture.image.data[i4] =
    baseGeometry.instance.attributes.position.array[i3];
  gpgpu.particlesTexture.image.data[i4 + 1] =
    baseGeometry.instance.attributes.position.array[i3 + 1];
  gpgpu.particlesTexture.image.data[i4 + 2] =
    baseGeometry.instance.attributes.position.array[i3 + 2];
  gpgpu.particlesTexture.image.data[i4 + 3] = Math.random();
}

console.log(baseGeometry.count, gpgpu.size, gpgpu.size * gpgpu.size);

gpgpu.particlesVariable = gpgpu.computation.addVariable(
  "uParticles",
  shader,
  gpgpu.particlesTexture
);

gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [
  gpgpu.particlesVariable,
]);

gpgpu.particlesVariable.material.uniforms.uTime = new THREE.Uniform(0);
gpgpu.particlesVariable.material.uniforms.uDeltaTime = new THREE.Uniform(0);
gpgpu.particlesVariable.material.uniforms.uBaseTexture = new THREE.Uniform(
  gpgpu.particlesTexture
);

gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence =
  new THREE.Uniform(1);
gpgpu.particlesVariable.material.uniforms.uFlowFieldSpeed = new THREE.Uniform(
  0.1
);
gpgpu.particlesVariable.material.uniforms.uFlowFieldScale = new THREE.Uniform(
  1
);
gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength =
  new THREE.Uniform(0.2);
gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency =
  new THREE.Uniform(0.5);
gpgpu.particlesVariable.material.uniforms.uDeltaSpeed = new THREE.Uniform(0.5);

gpgpu.computation.init();

gpgpu.getRenderTexture = () => {
  return gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable)
    .texture;
};

gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence, "value")
  .min(0)
  .max(2)
  .step(0.01)
  .name("Flow Field Influence");
gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldSpeed, "value")
  .min(0)
  .max(2)
  .step(0.001)
  .name("Flow Field Speed");
gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldScale, "value")
  .min(0)
  .max(10)
  .step(0.01)
  .name("Flow Field Scale");
gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength, "value")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Flow Field Strength");
gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency, "value")
  .min(0)
  .max(2)
  .step(0.01)
  .name("Flow Field Frequency");
gui
  .add(gpgpu.particlesVariable.material.uniforms.uDeltaSpeed, "value")
  .min(0)
  .max(2)
  .step(0.01)
  .name("Delta Speed");

gpgpu.debug.mesh.geometry = gpgpu.debug.geometry;
gpgpu.debug.mesh.material = gpgpu.debug.material;
gpgpu.debug.mesh.position.set(3, 0, 0);

scene.add(gpgpu.debug.mesh);
gpgpu.debug.mesh.visible = false;

tickSubscribers.push((elapsedTime, deltaTime) => {
  gpgpu.particlesVariable.material.uniforms.uTime.value = elapsedTime;
  gpgpu.particlesVariable.material.uniforms.uDeltaTime.value = deltaTime;
  gpgpu.computation.compute();
  gpgpu.debug.material.map = gpgpu.getRenderTexture();
});
