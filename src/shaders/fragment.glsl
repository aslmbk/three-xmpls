uniform vec3 uColor;

uniform vec3 uAmbientLightColor;
uniform float uAmbientLightIntensity;

uniform vec3 uDirectionalLightColor;
uniform float uDirectionalLightIntensity;
uniform vec3 uDirectionalLightPosition;
uniform float uDirectionalLightSpecularIntensity;
uniform float uDirectionalLightSpecularPower;

uniform vec3 uPointLightColor;
uniform float uPointLightIntensity;
uniform vec3 uPointLightPosition;
uniform float uPointLightSpecularIntensity;
uniform float uPointLightSpecularPower;
uniform float uPointLightDecay;

varying vec3 vNormal;
varying vec3 vPosition;

#include ./ambient-light.glsl
#include ./directional-light.glsl
#include ./point-light.glsl

void main()
{
    vec3 normal = normalize(vNormal);
    vec3 color = uColor;
    vec3 light = vec3(0.0);
    vec3 viewDirection = normalize(vPosition - cameraPosition);

    vec3 ambient = ambientLight(uAmbientLightColor, uAmbientLightIntensity);
    light += ambient;

    vec3 directional = directionalLight(
        uDirectionalLightColor,
        uDirectionalLightIntensity,
        normal,
        uDirectionalLightPosition,
        viewDirection,
        uDirectionalLightSpecularIntensity,
        uDirectionalLightSpecularPower
    );
    light += directional;

    vec3 point = pointLight(
        uPointLightColor,
        uPointLightIntensity,
        normal,
        uPointLightPosition,
        vPosition,
        viewDirection,
        uPointLightSpecularIntensity,
        uPointLightSpecularPower,
        uPointLightDecay
    );
    light += point;

    color *= light;

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}