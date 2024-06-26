varying float vPictureIntensity;

void main()
{
    vec2 uv = gl_PointCoord;
    float distanceToCenter = distance(uv, vec2(0.5));

    if (distanceToCenter > 0.5) discard;

    gl_FragColor = vec4(vec3(vPictureIntensity), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}