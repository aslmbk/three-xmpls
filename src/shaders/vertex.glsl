uniform vec2 uResolution;
uniform sampler2D uParticlesTexture;
uniform float uSize;

attribute vec2 aParticlesUv;
attribute float aSize;
attribute vec3 aColor;

varying vec3 vColor;

void main()
{
    vec4 particle = texture(uParticlesTexture, aParticlesUv);

    vec4 modelPosition = modelMatrix * vec4(particle.xyz, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    float sizeIn = smoothstep(0.1, 1.0, particle.a);
    float sizeOut = 1.0 - smoothstep(0.7, 1.0, particle.a);
    float size = min(sizeIn, sizeOut);
    
    gl_PointSize = size * aSize * uSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);
    
    vColor = aColor;
}