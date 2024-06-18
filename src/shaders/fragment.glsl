uniform vec3 uColor;
uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;

void main()
{
    vec3 normal = normalize(vNormal);
    normal = mix(normal * -1.0, normal, float(gl_FrontFacing));

    float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
    stripes = pow(stripes, 3.);

    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = 1.0 - dot(normal, viewDir);
    fresnel = pow(fresnel, 2.0);

    float falloff = smoothstep(0.98, 0.0, fresnel);

    float holographic = stripes * fresnel + fresnel * 1.25 * falloff;
    
    gl_FragColor = vec4(uColor, holographic);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}