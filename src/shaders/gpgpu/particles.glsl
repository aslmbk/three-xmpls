uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uBaseTexture;
uniform float uFlowFieldInfluence;
uniform float uFlowFieldSpeed;
uniform float uFlowFieldScale;
uniform float uFlowFieldStrength;
uniform float uFlowFieldFrequency;
uniform float uDeltaSpeed;

#include ../simplexNoise4d.glsl

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particle = texture(uParticles, uv);
    vec4 base = texture(uBaseTexture, uv);

    float time = uTime * uFlowFieldSpeed;

    float strength = simplexNoise4d(vec4(base.xyz * uFlowFieldStrength, time + 1.0));
    strength = smoothstep(1.0 - uFlowFieldInfluence, 1.0, strength);

    vec3 flowField = vec3(
        simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 0.0, time)),
        simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 1.0, time)),
        simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 2.0, time))
    );
    flowField = normalize(flowField);
    particle.xyz += flowField * uDeltaTime * strength * uFlowFieldScale;

    particle.a = mod(particle.a, 1.0);
    particle.a += uDeltaTime * uDeltaSpeed;
    float isDead = step(1.0, particle.a);

    particle.xyz = mix(particle.xyz, base.xyz, isDead);

    gl_FragColor = particle;
}