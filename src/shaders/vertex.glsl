attribute vec4 tangent;

#include ./simplexNoise4d.glsl

float getWobble(vec3 position)
{
    return simplexNoise4d(vec4(position, 0.0));
}

void main() {
    vec3 biTangent = cross(normal, tangent.xyz);

    float shift = 0.01;
    vec3 positionA = csm_Position + tangent.xyz * shift;
    vec3 positionB = csm_Position + biTangent * shift;

    float wobble = getWobble(csm_Position);
    csm_Position += wobble * normal;
    positionA += getWobble(positionA) * normal;
    positionB += getWobble(positionB) * normal;

    vec3 toA = normalize(positionA - csm_Position);
    vec3 toB = normalize(positionB - csm_Position);
    csm_Normal = cross(toA, toB);
}