uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;

#include ./random2D.glsl // it's done by vite-plugin-glsl

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float glitchTime = uTime - modelPosition.y;
    float glitchStrength = sin(glitchTime) + sin(glitchTime * 2.34) +  sin(glitchTime * 5.67);
    glitchStrength /= 3.0;
    glitchStrength = smoothstep(0.3, 1.0, glitchStrength);
    glitchStrength *= 0.25;

    modelPosition.x += (random2D(modelPosition.xz + uTime) - 0.5) * glitchStrength;
    modelPosition.z += (random2D(modelPosition.zx + uTime) - 0.5) * glitchStrength;
    
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
    vPosition = modelPosition.xyz;
    vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
    // vNormal = normalMatrix * normal;
    // vNormal = normal;
}