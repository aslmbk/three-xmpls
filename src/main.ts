import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Timer } from "three/addons/misc/Timer.js";
import GUI from "lil-gui";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import "./style.css";

const gui = new GUI({ width: 340 });
const parameters = {};
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const textureLoader = new THREE.TextureLoader();
const scene = new THREE.Scene();

const displacement = {
  canvas: document.createElement("canvas"),
  context: {} as CanvasRenderingContext2D,
  texture: {} as THREE.Texture,
  glowImage: new Image(),
  interactivePlane: new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({ color: "red", side: THREE.DoubleSide })
  ),
  raycaster: new THREE.Raycaster(),
  screenCursor: new THREE.Vector2(9999, 9999),
  canvasCursor: new THREE.Vector2(9999, 9999),
  canvasCursorPrevious: new THREE.Vector2(9999, 9999),
};

displacement.context = displacement.canvas.getContext("2d")!;
displacement.texture = new THREE.CanvasTexture(displacement.canvas);
displacement.glowImage.src = "./glow.png";
displacement.canvas.width = 128;
displacement.canvas.height = 128;
displacement.canvas.style.position = "fixed";
displacement.canvas.style.width = "256px";
displacement.canvas.style.height = "256px";
displacement.canvas.style.top = "0";
displacement.canvas.style.left = "0";
displacement.canvas.style.zIndex = "10";
document.body.append(displacement.canvas);

displacement.context.fillRect(
  0,
  0,
  displacement.canvas.width,
  displacement.canvas.height
);

scene.add(displacement.interactivePlane);
displacement.interactivePlane.visible = false;

const particlesGeometry = new THREE.PlaneGeometry(10, 10, 128, 128);
particlesGeometry.setIndex(null);
particlesGeometry.deleteAttribute("normal");

const intensitiesArray = new Float32Array(
  particlesGeometry.attributes.position.count
);
const anglesArray = new Float32Array(
  particlesGeometry.attributes.position.count
);
for (let i = 0; i < intensitiesArray.length; i++) {
  intensitiesArray[i] = Math.random();
  anglesArray[i] = Math.random() * Math.PI * 2;
}
particlesGeometry.setAttribute(
  "aIntensity",
  new THREE.BufferAttribute(intensitiesArray, 1)
);
particlesGeometry.setAttribute(
  "aAngle",
  new THREE.BufferAttribute(anglesArray, 1)
);

const particlesMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio
      )
    ),
    uPictureTexture: new THREE.Uniform(textureLoader.load("./picture-2.png")),
    uDisplacementTexture: new THREE.Uniform(displacement.texture),
  },
  transparent: true,
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, 18);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.setClearColor("#181818");

window.addEventListener("pointermove", (event) => {
  displacement.screenCursor.x = (event.clientX / sizes.width) * 2 - 1;
  displacement.screenCursor.y = -(event.clientY / sizes.height) * 2 + 1;
});

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  particlesMaterial.uniforms.uResolution.value.set(
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

  displacement.raycaster.setFromCamera(displacement.screenCursor, camera);
  const intersects = displacement.raycaster.intersectObject(
    displacement.interactivePlane
  );

  if (intersects.length) {
    const { x, y } = intersects[0].uv!;
    displacement.canvasCursor.x = x * displacement.canvas.width;
    displacement.canvasCursor.y = (1 - y) * displacement.canvas.height;
  }

  displacement.context.globalCompositeOperation = "source-over";
  displacement.context.globalAlpha = 0.02;
  displacement.context.fillRect(
    0,
    0,
    displacement.canvas.width,
    displacement.canvas.height
  );

  const cursorDistance = displacement.canvasCursorPrevious.distanceTo(
    displacement.canvasCursor
  );
  displacement.canvasCursorPrevious.copy(displacement.canvasCursor);
  const alpha = Math.min(cursorDistance * 0.05, 1);

  const glowSize = displacement.canvas.width * 0.25;
  displacement.context.globalCompositeOperation = "lighten";
  displacement.context.globalAlpha = alpha;
  displacement.context.drawImage(
    displacement.glowImage,
    displacement.canvasCursor.x - glowSize * 0.5,
    displacement.canvasCursor.y - glowSize * 0.5,
    glowSize,
    glowSize
  );

  displacement.texture.needsUpdate = true;

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
