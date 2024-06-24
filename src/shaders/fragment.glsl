uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

uniform vec3 uFogColor;
uniform float uFogDensity;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;
// varying float vFogDepth;

#include <fog_pars_fragment>

#include ./directional-light.glsl
#include ./point-light.glsl

void main()
{
    vec3 normal = normalize(vNormal);

    vec3 viewDirection = normalize(vPosition - cameraPosition);

    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    mixStrength = smoothstep(0.0, 1.0, mixStrength);
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

    vec3 light = vec3(0.0);

    light += directionalLight(
        vec3(1.0, 0.8, 0.5),
        1.0,
        normal,
        vec3(-1.0, 0.5, 0.0),
        viewDirection,
        10.0,
        32.0
    );

    light += pointLight(
        vec3(0.2, 0.5, 0.5),
        13.0,
        normal,
        vec3(2.0, 3.0, 1.0),
        vPosition,
        viewDirection,
        2.0,
        20.0,
        0.281
    );

    color *= light;
    
    gl_FragColor = vec4(color, 1.0);
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}