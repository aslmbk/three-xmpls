import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import { gpgpu, baseGeometry } from "./gpgpu";
import { sizes, scene, resizeSubscribers, tickSubscribers } from "./setup";

const particles = {
  geometry: new THREE.BufferGeometry(),
  material: new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uSize: new THREE.Uniform(0.1),
      uResolution: new THREE.Uniform(
        new THREE.Vector2(
          sizes.width * sizes.pixelRatio,
          sizes.height * sizes.pixelRatio
        )
      ),
      uParticlesTexture: new THREE.Uniform(gpgpu.getRenderTexture()),
    },
  }),
  points: {} as THREE.Points,
};

const particlesUvArray = new Float32Array(baseGeometry.count * 2);
const sizesArray = new Float32Array(baseGeometry.count);

for (let y = 0; y < gpgpu.size; y++) {
  for (let x = 0; x < gpgpu.size; x++) {
    const i = y * gpgpu.size + x;
    const i2 = i * 2;
    const uvX = (x + 0.5) / gpgpu.size;
    const uvY = (y + 0.5) / gpgpu.size;

    particlesUvArray[i2] = uvX;
    particlesUvArray[i2 + 1] = uvY;

    sizesArray[i] = Math.random();
  }
}
particles.geometry.setAttribute(
  "aParticlesUv",
  new THREE.Float32BufferAttribute(particlesUvArray, 2)
);
particles.geometry.setAttribute(
  "aSize",
  new THREE.Float32BufferAttribute(sizesArray, 1)
);
particles.geometry.setAttribute(
  "aColor",
  baseGeometry.instance.attributes.color
);
particles.geometry.setDrawRange(0, baseGeometry.count);
particles.points = new THREE.Points(particles.geometry, particles.material);
particles.points.position.x = -(
  baseGeometry.instance.boundingBox?.getCenter(new THREE.Vector3()).x ?? 0
);
particles.points.frustumCulled = false;
scene.add(particles.points);

resizeSubscribers.push((s) => {
  particles.material.uniforms.uResolution.value.set(
    s.width * s.pixelRatio,
    s.height * s.pixelRatio
  );
});

tickSubscribers.push(() => {
  particles.material.uniforms.uParticlesTexture.value =
    gpgpu.getRenderTexture();
});
