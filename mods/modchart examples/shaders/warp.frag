// Automatically converted with https://github.com/TheLeerName/ShadertoyToFlixel

#pragma header

#define round(a) floor(a + 0.5)
#define iResolution vec3(openfl_TextureSize, 0.)
uniform float iTime;
uniform float GLITCH; // Nouvelle variable uniforme float pour contrôler le glitch
#define iChannel0 bitmap
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;
#define texture flixel_texture2D

// third argument fix
vec4 flixel_texture2D(sampler2D bitmap, vec2 coord, float bias) {
    vec4 color = texture2D(bitmap, coord, bias);
    if (!hasTransform)
    {
        return color;
    }
    if (color.a == 0.0)
    {
        return vec4(0.0, 0.0, 0.0, 0.0);
    }
    if (!hasColorTransform)
    {
        return color * openfl_Alphav;
    }
    color = vec4(color.rgb / color.a, color.a);
    mat4 colorMultiplier = mat4(0);
    colorMultiplier[0][0] = openfl_ColorMultiplierv.x;
    colorMultiplier[1][1] = openfl_ColorMultiplierv.y;
    colorMultiplier[2][2] = openfl_ColorMultiplierv.z;
    colorMultiplier[3][3] = openfl_ColorMultiplierv.w;
    color = clamp(openfl_ColorOffsetv + (color * colorMultiplier), 0.0, 1.0);
    if (color.a > 0.0)
    {
        return vec4(color.rgb * color.a * openfl_Alphav, color.a * openfl_Alphav);
    }
    return vec4(0.0, 0.0, 0.0, 0.0);
}

// variables which are empty, they just need to avoid crashing the shader
uniform float iTimeDelta;
uniform float iFrameRate;
uniform int iFrame;
#define iChannelTime float[4](iTime, 0., 0., 0.)
#define iChannelResolution vec3[4](iResolution, vec3(0.), vec3(0.), vec3(0.))
uniform vec4 iMouse;
uniform vec4 iDate;

float sat( float t ) {
    return clamp( t, 0.0, 1.0 );
}

vec2 sat( vec2 t ) {
    return clamp( t, 0.0, 1.0 );
}

//remaps interval [a;b] to [0;1]
float remap  ( float t, float a, float b ) {
    return sat( (t - a) / (b - a) );
}

//note: /\ t=[0;0.5;1], y=[0;1;0]
float linterp( float t ) {
    return sat( 1.0 - abs( 2.0*t - 1.0 ) );
}

vec3 spectrum_offset( float t ) {
    vec3 ret;
    float lo = step(t,0.5);
    float hi = 1.0-lo;
    float w = linterp( remap( t, 1.0/6.0, 5.0/6.0 ) );
    float neg_w = 1.0-w;
    ret = vec3(lo,1.0,hi) * vec3(neg_w, w, neg_w);
    return pow( ret, vec3(1.0/2.2) );
}

//note: [0;1]
float rand( vec2 n ) {
  return fract(sin(dot(n.xy, vec2(12.9898, 78.233)))* 43758.5453);
}

//note: [-1;1]
float srand( vec2 n ) {
    return rand(n) * 2.0 - 1.0;
}

float mytrunc( float x, float num_levels )
{
    return floor(x*num_levels) / num_levels;
}
vec2 mytrunc( vec2 x, float num_levels )
{
    return floor(x*num_levels) / num_levels;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy / iResolution.xy;
    uv.y = uv.y;
    
    float time = mod(iTime*100.0, 32.0)/110.0; // + modelmat[0].x + modelmat[0].z;

    float gnm = sat( GLITCH );
    float rnd0 = rand( mytrunc( vec2(time, time), 6.0 ) );
    float r0 = sat((1.0-gnm)*0.7 + rnd0);
    float rnd1 = rand( vec2(mytrunc( uv.x, 10.0*r0 ), time) ); //horz
    //float r1 = 1.0f - sat( (1.0f-gnm)*0.5f + rnd1 );
    float r1 = 0.5 - 0.5 * gnm + rnd1;
    r1 = 1.0 - max( 0.0, ((r1<1.0) ? r1 : 0.9999999) ); //note: weird ass bug on old drivers
    float rnd2 = rand( vec2(mytrunc( uv.y, 40.0*r1 ), time) ); //vert
    float r2 = sat( rnd2 );

    float rnd3 = rand( vec2(mytrunc( uv.y, 10.0*r0 ), time) );
    float r3 = (1.0-sat(rnd3+0.8)) - 0.1;

    float pxrnd = rand( uv + time );

    float ofs = 0.05 * r2 * GLITCH * ( rnd0 > 0.5 ? 1.0 : -1.0 );
    ofs += 0.5 * pxrnd * ofs;

    uv.y += 0.1 * r3 * GLITCH;

    const int NUM_SAMPLES = 20;
    const float RCP_NUM_SAMPLES_F = 1.0 / float(NUM_SAMPLES);
    
    vec4 sum = vec4(0.0);
    vec3 wsum = vec3(0.0);
    for( int i=0; i<NUM_SAMPLES; ++i )
    {
        float t = float(i) * RCP_NUM_SAMPLES_F;
        uv.x = sat