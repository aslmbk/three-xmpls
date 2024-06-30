#define DURATION 0.6

uniform vec2 uResolution;
uniform float uSize;
uniform float uProgress;
uniform vec3 uColorA;
uniform vec3 uColorB;

attribute vec3 aPositionTarget;
attribute float aSize;

varying vec3 vColor;

#include ./simplex-noise.glsl

void main()
{
    float noiseOrigin = simplexNoise3d(position * 0.2);
    float noiseTartget = simplexNoise3d(aPositionTarget * 0.2);
    float noise = mix(noiseOrigin, noiseTartget, uProgress);
    noise = smoothstep(-1.0, 1.0, noise);

    float delay = (1.0 - DURATION) * noise;
    float end = delay + DURATION;
    float progress = smoothstep(delay, end, uProgress);

    vec3 mixedPosition = mix(position, aPositionTarget, progress);

    vec4 modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    
    gl_PointSize = aSize * uSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    vColor = mix(uColorA, uColorB, noise);
}