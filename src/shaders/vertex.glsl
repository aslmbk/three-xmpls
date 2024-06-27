uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
uniform sampler2D uDisplacementTexture;

attribute float aIntensity;
attribute float aAngle;

varying float vPictureIntensity;

void main()
{
    vec3 newPosition = position;
    float displacementIntensity = texture(uDisplacementTexture, uv).r;
    displacementIntensity = smoothstep(0.1, 0.3, displacementIntensity);

    vec3 displacement = vec3(
        cos(aAngle) * 0.2,
        sin(aAngle) * 0.2,
        1.0
    );
    displacement = normalize(displacement);
    displacement *= aIntensity * displacementIntensity * 3.0;

    newPosition += displacement;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    float pictureIntensity = texture(uPictureTexture, uv).r;
    
    gl_PointSize = 0.14 * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);
    gl_PointSize *= pictureIntensity;

    vPictureIntensity = pow(pictureIntensity, 2.0);
}