import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Timer } from "three/addons/misc/Timer.js";
import GUI from "lil-gui";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import "./style.css";

const gui = new GUI({ width: 340 });
const parameters = {
  atmosphereDayColor: "#00aaff",
  atmosphereTwilightColor: "#f06e0a",
};
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const textureLoader = new THREE.TextureLoader();
const scene = new THREE.Scene();

const earthDayTexture = textureLoader.load("./earth/day.jpg");
earthDayTexture.colorSpace = THREE.SRGBColorSpace;
earthDayTexture.anisotropy = 8;

const earthNightTexture = textureLoader.load("./earth/night.jpg");
earthNightTexture.colorSpace = THREE.SRGBColorSpace;
earthNightTexture.anisotropy = 8;

const earthSpecularCloudsTexture = textureLoader.load(
  "./earth/specularClouds.jpg"
);
earthSpecularCloudsTexture.anisotropy = 8;

const geometry = new THREE.SphereGeometry(2, 64, 64);
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uDayTexture: new THREE.Uniform(earthDayTexture),
    uNightTexture: new THREE.Uniform(earthNightTexture),
    uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
    uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
    uAtmosphereDayColor: new THREE.Uniform(
      new THREE.Color(parameters.atmosphereDayColor)
    ),
    uAtmosphereTwilightColor: new THREE.Uniform(
      new THREE.Color(parameters.atmosphereTwilightColor)
    ),
  },
});
const earth = new THREE.Mesh(geometry, material);
scene.add(earth);

const atmosphereMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  transparent: true,
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main()
    {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewMatrix * modelPosition;

        vec3 modelNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

        vNormal = modelNormal;
        vPosition = modelPosition.xyz;
    }
  `,
  fragmentShader: `
    uniform vec3 uSunDirection;
    uniform vec3 uAtmosphereDayColor;
    uniform vec3 uAtmosphereTwilightColor;

    varying vec3 vNormal;
    varying vec3 vPosition;

    void main()
    {
        vec3 viewDirection = normalize(vPosition - cameraPosition);
        vec3 normal = normalize(vNormal);
        vec3 color = vec3(0.0);
        
        float sunOrientation = dot(uSunDirection, normal);
        
        float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
        vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
        color = mix(color, atmosphereColor, atmosphereDayMix);
        color += atmosphereColor;
        
        float edgeAlpha = dot(viewDirection, normal);
        edgeAlpha = smoothstep(0.0, 0.5, edgeAlpha);

        float dayAlpha = smoothstep(-0.5, 0.0, sunOrientation);

        float alpha = edgeAlpha * dayAlpha;
        
        gl_FragColor = vec4(color, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
    }
  `,
  uniforms: {
    uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
    uAtmosphereDayColor: new THREE.Uniform(
      new THREE.Color(parameters.atmosphereDayColor)
    ),
    uAtmosphereTwilightColor: new THREE.Uniform(
      new THREE.Color(parameters.atmosphereTwilightColor)
    ),
  },
});

const atmosphere = new THREE.Mesh(geometry, atmosphereMaterial);
atmosphere.scale.set(1.04, 1.04, 1.04);
scene.add(atmosphere);

const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.5);
const sunDirection = new THREE.Vector3();
const debugSun = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.1, 2),
  new THREE.MeshBasicMaterial()
);
scene.add(debugSun);

const updateSun = () => {
  sunDirection.setFromSpherical(sunSpherical);
  debugSun.position.copy(sunDirection).multiplyScalar(5);
  material.uniforms.uSunDirection.value.copy(sunDirection);
  atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection);
};

updateSun();

const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(12, 5, 4);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.setClearColor("#000011");

gui.addColor(parameters, "atmosphereDayColor").onChange(() => {
  material.uniforms.uAtmosphereDayColor.value.set(
    parameters.atmosphereDayColor
  );
  atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(
    parameters.atmosphereDayColor
  );
});
gui.addColor(parameters, "atmosphereTwilightColor").onChange(() => {
  material.uniforms.uAtmosphereTwilightColor.value.set(
    parameters.atmosphereTwilightColor
  );
  atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(
    parameters.atmosphereTwilightColor
  );
});
gui.add(sunSpherical, "phi").min(0).max(Math.PI).onChange(updateSun);

gui.add(sunSpherical, "theta").min(-Math.PI).max(Math.PI).onChange(updateSun);

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

const timer = new Timer();

const tick = () => {
  timer.update();
  const elapsedTime = timer.getElapsed();

  earth.rotation.y = elapsedTime * 0.1;

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
