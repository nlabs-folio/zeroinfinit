// ============================================================
// ZERO INFINIT — node∅
//
// FIELD / EVENT / WAVE / MATTER / SOUND
//
// F# MINOR
//
// EARTH
//   F# 185 Hz
//
// BODY
//   F# 370 Hz
//
// SKY
//   F# 740 Hz
//
// RESONANCE
//   741 Hz
//
// The field exists before the observer.
// Movement introduces energy into the field.
// ============================================================


"use strict";


// ============================================================
// CANVAS
// ============================================================

const canvas =
    document.getElementById(
        "cosmos"
    );


const gl =
    canvas.getContext(
        "webgl",
        {
            antialias: false,
            alpha: false,
            powerPreference:
                "high-performance"
        }
    );


if (!gl) {

    throw new Error(
        "WebGL unavailable"
    );

}


// ============================================================
// SHADERS
// ============================================================

const vertexShaderSource = `

attribute vec2 position;

void main() {

    gl_Position =
        vec4(
            position,
            0.0,
            1.0
        );

}

`;


const fragmentShaderSource = `

precision highp float;

uniform vec2 resolution;
uniform float time;

#define MAX_EVENTS 20

uniform vec2 eventPosition[MAX_EVENTS];
uniform float eventTime[MAX_EVENTS];
uniform float eventStrength[MAX_EVENTS];
uniform float eventSize[MAX_EVENTS];
uniform float eventSeed[MAX_EVENTS];


// ============================================================
// HASH
// ============================================================

float hash(vec2 p) {

    return fract(
        sin(
            dot(
                p,
                vec2(
                    127.1,
                    311.7
                )
            )
        )
        *
        43758.5453
    );

}


// ============================================================
// NOISE
// ============================================================

float noise(vec2 p) {

    vec2 i =
        floor(p);

    vec2 f =
        fract(p);

    f =
        f *
        f *
        (
            3.0 -
            2.0 * f
        );

    float a =
        hash(i);

    float b =
        hash(
            i +
            vec2(
                1.0,
                0.0
            )
        );

    float c =
        hash(
            i +
            vec2(
                0.0,
                1.0
            )
        );

    float d =
        hash(
            i +
            vec2(
                1.0,
                1.0
            )
        );

    return mix(
        mix(a, b, f.x),
        mix(c, d, f.x),
        f.y
    );

}


// ============================================================
// FBM
// ============================================================

float fbm(vec2 p) {

    float value =
        0.0;

    float amplitude =
        0.5;

    for (
        int i = 0;
        i < 6;
        i++
    ) {

        value +=
            amplitude *
            noise(p);

        p *=
            2.0;

        amplitude *=
            0.5;

    }

    return value;

}


// ============================================================
// FLOW
// ============================================================

vec2 flowField(vec2 p) {

    float e =
        0.003;

    vec2 drift =
        vec2(
            time * 0.018,
            -time * 0.013
        );

    float n =
        fbm(
            p * 2.4 +
            drift
        );

    float nx =
        fbm(
            p * 2.4 +
            drift +
            vec2(
                e,
                0.0
            )
        );

    float ny =
        fbm(
            p * 2.4 +
            drift +
            vec2(
                0.0,
                e
            )
        );

    vec2 gradient =
        vec2(
            nx - n,
            ny - n
        )
        /
        e;

    return vec2(
        -gradient.y,
        gradient.x
    );

}


// ============================================================
// MAIN SHADER
// ============================================================

void main() {

    vec2 uv =
        gl_FragCoord.xy /
        resolution.xy;

    float aspect =
        resolution.x /
        resolution.y;

    vec2 p =
        uv -
        0.5;

    p.x *=
        aspect;


    // --------------------------------------------------------
    // BASE FIELD
    // --------------------------------------------------------

    vec2 flow =
        flowField(p);

    vec2 field =
        p +
        flow *
        0.075;

    field +=
        vec2(
            sin(
                time * 0.17 +
                p.y * 3.0
            ),
            cos(
                time * 0.13 +
                p.x * 2.4
            )
        )
        *
        0.014;


    float cloudA =
        fbm(
            field * 2.1 +
            vec2(
                time * 0.035,
                -time * 0.022
            )
        );


    float cloudB =
        fbm(
            field * 5.0 -
            vec2(
                time * 0.018,
                time * 0.027
            )
        );


    float matter =
        cloudA * 0.72 +
        cloudB * 0.28;


    matter =
        smoothstep(
            0.25,
            0.74,
            matter
        );


    // --------------------------------------------------------
    // EVENTS
    // --------------------------------------------------------

    float waveField =
        0.0;

    float eventMatter =
        0.0;

    float eventScatter =
        0.0;

    float eventGlow =
        0.0;


    for (
        int i = 0;
        i < MAX_EVENTS;
        i++
    ) {

        float age =
            time -
            eventTime[i];


        if (
            age > 0.0 &&
            age < 9.0
        ) {

            vec2 delta =
                p -
                eventPosition[i];

            float distance =
                length(delta);

            float strength =
                eventStrength[i];

            float size =
                eventSize[i];


            // ------------------------------------------------
            // WAVE
            // ------------------------------------------------

            float radius =
                age *
                (
                    0.10 +
                    size * 0.075
                );


            float width =
                0.010 +
                size * 0.014;


            float wave =
                1.0 -
                smoothstep(
                    0.0,
                    width,
                    abs(
                        distance -
                        radius
                    )
                );


            float fade =
                exp(
                    -age * 0.62
                );


            wave *=
                strength *
                fade;


            waveField +=
                wave;


            // ------------------------------------------------
            // MATTER CORE
            // ------------------------------------------------

            float centre =
                1.0 -
                smoothstep(
                    size * 0.16,
                    size,
                    distance
                );


            eventMatter +=
                centre *
                strength *
                exp(
                    -age * 1.35
                );


            // ------------------------------------------------
            // DISPERSION
            // ------------------------------------------------

            float scatter =
                smoothstep(
                    size * 1.9,
                    0.0,
                    distance
                );


            scatter *=
                strength *
                exp(
                    -age * 0.82
                );


            eventScatter +=
                scatter;


            // ------------------------------------------------
            // LIGHT
            // ------------------------------------------------

            eventGlow +=
                centre *
                strength *
                exp(
                    -age * 0.72
                );

        }

    }


    // --------------------------------------------------------
    // MULTIPLICATION
    // --------------------------------------------------------

    float multiplication =
        eventMatter *
        (
            0.22 +
            0.78 *
            waveField
        );


    matter +=
        multiplication *
        0.42;


    matter =
        clamp(
            matter,
            0.0,
            1.0
        );


    // --------------------------------------------------------
    // FRACTAL RESPONSE
    // --------------------------------------------------------

    float fractal =
        fbm(
            (
                field +
                flow *
                eventScatter *
                0.16
            )
            *
            (
                2.8 +
                eventScatter * 3.0
            )
            +
            vec2(
                time * 0.05,
                -time * 0.031
            )
        );


    fractal =
        smoothstep(
            0.34,
            0.76,
            fractal
        );


    // --------------------------------------------------------
    // PARTICLES
    // --------------------------------------------------------

    vec2 particleSpace =
        field *
        (
            100.0 +
            eventScatter * 38.0
        );


    vec2 cell =
        floor(
            particleSpace
        );


    vec2 local =
        fract(
            particleSpace
        )
        -
        0.5;


    float randomCell =
        hash(cell);


    float particleRadius =
        0.025 +
        randomCell * 0.038;


    float particle =
        smoothstep(
            particleRadius,
            0.0,
            length(local)
        );


    particle *=
        step(
            0.9945,
            randomCell
        );


    particle *=
        0.25 +
        0.75 *
        (
            0.5 +
            0.5 *
            sin(
                time * 0.65 +
                randomCell * 31.0
            )
        );


    particle *=
        0.15 +
        matter * 1.75;


    // --------------------------------------------------------
    // EVENT PARTICLES
    // --------------------------------------------------------

    float eventParticles =
        eventScatter *
        (
            0.25 +
            0.75 *
            fractal
        );


    particle +=
        eventParticles *
        step(
            0.9965,
            hash(
                cell +
                vec2(
                    eventScatter * 7.0
                )
            )
        )
        *
        0.90;


    // --------------------------------------------------------
    // FILAMENTS
    // --------------------------------------------------------

    float filament =
        sin(
            length(p) *
            (
                22.0 +
                eventScatter * 42.0
            )
            -
            time * 0.62
        );


    filament =
        0.5 +
        0.5 *
        filament;


    filament =
        smoothstep(
            0.78,
            0.97,
            filament
        );


    filament *=
        eventScatter *
        0.34;


    // --------------------------------------------------------
    // CENTRAL VOID
    // --------------------------------------------------------

    float r =
        length(p);


    float voidMask =
        smoothstep(
            0.105,
            0.020,
            r
        );


    matter *=
        1.0 -
        voidMask * 0.82;


    particle *=
        1.0 -
        voidMask * 0.75;


    // --------------------------------------------------------
    // COLOR
    // --------------------------------------------------------

    vec3 color =
        vec3(
            0.0015,
            0.002,
            0.009
        );


    vec3 deepBlue =
        vec3(
            0.030,
            0.045,
            0.19
        );


    vec3 violet =
        vec3(
            0.25,
            0.065,
            0.50
        );


    vec3 lilac =
        vec3(
            0.58,
            0.34,
            0.88
        );


    vec3 pink =
        vec3(
            0.95,
            0.32,
            0.72
        );


    vec3 cyan =
        vec3(
            0.46,
            0.80,
            1.0
        );


    vec3 whiteBlue =
        vec3(
            0.78,
            0.90,
            1.0
        );


    color +=
        deepBlue *
        matter *
        1.70;


    color +=
        violet *
        matter *
        matter *
        1.30;


    color +=
        lilac *
        fractal *
        0.28;


    color +=
        cyan *
        waveField *
        0.72;


    color +=
        pink *
        eventMatter *
        0.42;


    color +=
        lilac *
        particle *
        1.35;


    color +=
        cyan *
        filament *
        0.62;


    color +=
        pink *
        eventGlow *
        0.20;


    color +=
        whiteBlue *
        eventGlow *
        eventGlow *
        0.16;


    // --------------------------------------------------------
    // CENTRAL DEPTH
    // --------------------------------------------------------

    float centralGlow =
        exp(
            -r * 12.0
        );


    color +=
        vec3(
            0.12,
            0.16,
            0.34
        )
        *
        centralGlow
        *
        0.08;


    // --------------------------------------------------------
    // BLOOM
    // --------------------------------------------------------

    float bloom =
        smoothstep(
            1.65,
            0.12,
            r
        );


    color *=
        bloom;


    // --------------------------------------------------------
    // OUTER LIGHT
    // --------------------------------------------------------

    float outerGlow =
        smoothstep(
            1.35,
            0.42,
            r
        );


    color +=
        deepBlue *
        outerGlow *
        0.055;


    // --------------------------------------------------------
    // FINAL
    // --------------------------------------------------------

    color =
        pow(
            color,
            vec3(
                0.90
            )
        );


    gl_FragColor =
        vec4(
            color,
            1.0
        );

}

`;


// ============================================================
// SHADER COMPILATION
// ============================================================

function compileShader(
    type,
    source
) {

    const shader =
        gl.createShader(
            type
        );


    gl.shaderSource(
        shader,
        source
    );


    gl.compileShader(
        shader
    );


    if (
        !gl.getShaderParameter(
            shader,
            gl.COMPILE_STATUS
        )
    ) {

        console.error(
            gl.getShaderInfoLog(
                shader
            )
        );

        throw new Error(
            "node∅ shader compilation failed"
        );

    }


    return shader;

}


const vertexShader =
    compileShader(
        gl.VERTEX_SHADER,
        vertexShaderSource
    );


const fragmentShader =
    compileShader(
        gl.FRAGMENT_SHADER,
        fragmentShaderSource
    );


const program =
    gl.createProgram();


gl.attachShader(
    program,
    vertexShader
);


gl.attachShader(
    program,
    fragmentShader
);


gl.linkProgram(
    program
);


if (
    !gl.getProgramParameter(
        program,
        gl.LINK_STATUS
    )
) {

    throw new Error(
        "node∅ WebGL link failed"
    );

}


gl.useProgram(
    program
);


// ============================================================
// GEOMETRY
// ============================================================

const buffer =
    gl.createBuffer();


gl.bindBuffer(
    gl.ARRAY_BUFFER,
    buffer
);


gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([

        -1, -1,
         1, -1,
        -1,  1,

        -1,  1,
         1, -1,
         1,  1

    ]),
    gl.STATIC_DRAW
);


const position =
    gl.getAttribLocation(
        program,
        "position"
    );


gl.enableVertexAttribArray(
    position
);


gl.vertexAttribPointer(
    position,
    2,
    gl.FLOAT,
    false,
    0,
    0
);


// ============================================================
// UNIFORMS
// ============================================================

const U = {

    resolution:
        gl.getUniformLocation(
            program,
            "resolution"
        ),

    time:
        gl.getUniformLocation(
            program,
            "time"
        ),

    eventPosition:
        gl.getUniformLocation(
            program,
            "eventPosition"
        ),

    eventTime:
        gl.getUniformLocation(
            program,
            "eventTime"
        ),

    eventStrength:
        gl.getUniformLocation(
            program,
            "eventStrength"
        ),

    eventSize:
        gl.getUniformLocation(
            program,
            "eventSize"
        ),

    eventSeed:
        gl.getUniformLocation(
            program,
            "eventSeed"
        )

};


// ============================================================
// EVENT SYSTEM
// ============================================================

const MAX_EVENTS =
    20;


const events =
    new Array(
        MAX_EVENTS
    );


let eventCursor =
    0;


function createEvent(
    x,
    y,
    strength,
    size
) {

    const event = {

        x,
        y,

        time:
            0,

        strength,

        size,

        seed:
            Math.random()

    };


    events[eventCursor] =
        event;


    eventCursor =
        (
            eventCursor + 1
        )
        %
        MAX_EVENTS;


    return event;

}


// ============================================================
// POINTER POSITION
// ============================================================

function eventPositionFromPointer(
    event
) {

    const rect =
        canvas.getBoundingClientRect();


    const x =
        (
            event.clientX -
            rect.left
        )
        /
        rect.width;


    const y =
        (
            event.clientY -
            rect.top
        )
        /
        rect.height;


    const aspect =
        rect.width /
        rect.height;


    return {

        x:
            (
                x -
                0.5
            )
            *
            aspect,

        y:
            0.5 -
            y

    };

}


// ============================================================
// POINTER STATE
// ============================================================

let pointerInside =
    false;


let pointerActive =
    false;


let pointerX =
    0;


let pointerY =
    0;


let previousPointerX =
    0;


let previousPointerY =
    0;


let pointerSpeed =
    0;


let movementAccumulator =
    0;


let lastEventTime =
    0;


// ============================================================
// AUDIO
//
// 44.1 kHz requested explicitly.
//
// Web Audio's signal path uses floating point processing.
// AudioBuffer/sample data is Float32.
// ============================================================

let audio =
    null;


let audioStarted =
    false;


let master =
    null;


let compressor =
    null;


let lowpass =
    null;


let highpass =
    null;


let earthGain =
    null;


let bodyGain =
    null;


let skyGain =
    null;


let resonanceGain =
    null;


let earthOsc =
    null;


let bodyOsc =
    null;


let skyOsc =
    null;


let resonanceOsc =
    null;


let earthPan =
    null;


let bodyPan =
    null;


let skyPan =
    null;


let resonancePan =
    null;


let eventBus =
    null;


let eventReverb =
    null;


let eventReverbGain =
    null;


let spatialDelayL =
    null;


let spatialDelayR =
    null;


let spatialGainL =
    null;


let spatialGainR =
    null;


let harmonicBus =
    null;


let tonalRoot =
    185.00;


const SAMPLE_RATE =
    44100;


// ============================================================
// TONAL WORLD
// ============================================================
//
// F# minor:
//
// F#  G#  A  B  C#  D  E
// 0   2   3  5   7  8 10
//
// Chord material:
//
// i  = F#m
// VI = D
// III= A
// VII= E
// V  = C#
//
// The system never leaves F# minor.
// ============================================================

const SCALE =
    [
        0,
        2,
        3,
        5,
        7,
        8,
        10
    ];


const HARMONIES = [

    {
        name:
            "F#m",

        degrees:
            [0, 2, 4],

        weight:
            0.42
    },

    {
        name:
            "D",

        degrees:
            [5, 0, 2],

        weight:
            0.20
    },

    {
        name:
            "A",

        degrees:
            [2, 4, 6],

        weight:
            0.18
    },

    {
        name:
            "E",

        degrees:
            [6, 1, 3],

        weight:
            0.13
    },

    {
        name:
            "C#",

        degrees:
            [4, 6, 1],

        weight:
            0.07
    }

];


let harmonicIndex =
    0;


let harmonicPressure =
    0;


let lastHarmonyChange =
    0;


let lastHarmonyEvent =
    0;


// ============================================================
// FREQUENCY FROM SCALE
// ============================================================

function scaleFrequency(
    degree,
    octave = 0
) {

    const wrapped =
        (
            degree %
            SCALE.length +
            SCALE.length
        )
        %
        SCALE.length;


    const semitone =
        SCALE[wrapped] +
        octave * 12;


    return (
        tonalRoot *
        Math.pow(
            2,
            semitone / 12
        )
    );

}


// ============================================================
// RANDOM TONAL FREQUENCY
// ============================================================

function fieldFrequency(
    intensity
) {

    const degree =
        Math.floor(
            Math.random() *
            SCALE.length
        );


    let octave =
        0;


    if (
        intensity > 0.70 &&
        Math.random() > 0.42
    ) {

        octave =
            1;

    }


    return scaleFrequency(
        degree,
        octave
    );

}


// ============================================================
// REVERB
// ============================================================

function createReverbImpulse(
    context,
    duration = 4.8,
    decay = 3.4
) {

    const length =
        Math.floor(
            context.sampleRate *
            duration
        );


    const impulse =
        context.createBuffer(
            2,
            length,
            context.sampleRate
        );


    for (
        let channel = 0;
        channel < 2;
        channel++
    ) {

        const data =
            impulse.getChannelData(
                channel
            );


        for (
            let i = 0;
            i < length;
            i++
        ) {

            const t =
                i /
                length;


            const early =
                Math.exp(
                    -t * 10
                );


            const diffuse =
                (
                    Math.random() * 2 -
                    1
                );


            data[i] =
                diffuse *
                Math.pow(
                    1 - t,
                    decay
                )
                *
                (
                    0.72 +
                    early * 0.28
                );

        }

    }


    return impulse;

}


// ============================================================
// AUDIO INITIALISATION
// ============================================================

async function startAudio() {

    if (
        audioStarted &&
        audio
    ) {

        if (
            audio.state ===
            "suspended"
        ) {

            try {

                await audio.resume();

            } catch (
                error
            ) {

                console.warn(
                    "Audio resume:",
                    error
                );

            }

        }

        return;

    }


    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;


    if (!AudioContext) {

        console.warn(
            "Web Audio API unavailable"
        );

        return;

    }


    try {

        audio =
            new AudioContext(
                {
                    sampleRate:
                        SAMPLE_RATE,

                    latencyHint:
                        "interactive"
                }
            );


        await audio.resume();

    } catch (
        error
    ) {

        console.warn(
            "node∅ audio:",
            error
        );

        audio =
            null;

        return;

    }


    // ========================================================
    // MASTER
    // ========================================================

    master =
        audio.createGain();


    master.gain.value =
        0.0001;


    // ========================================================
    // COMPRESSOR
    // ========================================================

    compressor =
        audio.createDynamicsCompressor();


    compressor.threshold.value =
        -24;


    compressor.knee.value =
        20;


    compressor.ratio.value =
        2.2;


    compressor.attack.value =
        0.018;


    compressor.release.value =
        0.55;


    // ========================================================
    // FILTER ARCHITECTURE
    // ========================================================

    lowpass =
        audio.createBiquadFilter();


    lowpass.type =
        "lowpass";


    lowpass.frequency.value =
        2600;


    lowpass.Q.value =
        0.30;


    highpass =
        audio.createBiquadFilter();


    highpass.type =
        "highpass";


    highpass.frequency.value =
        28;


    highpass.Q.value =
        0.20;


    // ========================================================
    // EARTH
    // ========================================================

    earthOsc =
        audio.createOscillator();


    earthOsc.type =
        "sine";


    earthOsc.frequency.value =
        185.0;


    earthGain =
        audio.createGain();


    earthGain.gain.value =
        0.040;


    earthPan =
        audio.createStereoPanner();


    earthPan.pan.value =
        -0.04;


    // ========================================================
    // BODY
    // ========================================================

    bodyOsc =
        audio.createOscillator();


    bodyOsc.type =
        "triangle";


    bodyOsc.frequency.value =
        370.0;


    bodyGain =
        audio.createGain();


    bodyGain.gain.value =
        0.012;


    bodyPan =
        audio.createStereoPanner();


    bodyPan.pan.value =
        0.04;


    // ========================================================
    // SKY
    // ========================================================

    skyOsc =
        audio.createOscillator();


    skyOsc.type =
        "sine";


    skyOsc.frequency.value =
        740.0;


    skyGain =
        audio.createGain();


    skyGain.gain.value =
        0.004;


    skyPan =
        audio.createStereoPanner();


    skyPan.pan.value =
        0.0;


    // ========================================================
    // 741 Hz RESONANCE
    // ========================================================

    resonanceOsc =
        audio.createOscillator();


    resonanceOsc.type =
        "sine";


    resonanceOsc.frequency.value =
        741.0;


    resonanceGain =
        audio.createGain();


    resonanceGain.gain.value =
        0.0012;


    resonancePan =
        audio.createStereoPanner();


    resonancePan.pan.value =
        0.0;


    // ========================================================
    // CONNECT TONAL LAYERS
    // ========================================================

    earthOsc
        .connect(
            earthGain
        )
        .connect(
            earthPan
        )
        .connect(
            highpass
        );


    bodyOsc
        .connect(
            bodyGain
        )
        .connect(
            bodyPan
        )
        .connect(
            highpass
        );


    skyOsc
        .connect(
            skyGain
        )
        .connect(
            skyPan
        )
        .connect(
            lowpass
        );


    resonanceOsc
        .connect(
            resonanceGain
        )
        .connect(
            resonancePan
        )
        .connect(
            lowpass
        );


    // ========================================================
    // EVENT BUS
    // ========================================================

    eventBus =
        audio.createGain();


    eventBus.gain.value =
        1.0;


    harmonicBus =
        audio.createGain();


    harmonicBus.gain.value =
        0.58;


    // ========================================================
    // REVERB
    // ========================================================

    eventReverb =
        audio.createConvolver();


    eventReverb.buffer =
        createReverbImpulse(
            audio
        );


    eventReverbGain =
        audio.createGain();


    eventReverbGain.gain.value =
        0.16;


    // ========================================================
    // SUBTLE SPATIAL DELAY
    // ========================================================
    //
    // This is deliberately slow and small.
    //
    // It is not an obvious echo.
    // It creates a tiny difference between
    // left and right spatial fields.
    // ========================================================

    spatialDelayL =
        audio.createDelay(
            0.05
        );


    spatialDelayR =
        audio.createDelay(
            0.05
        );


    spatialDelayL.delayTime.value =
        0.009;


    spatialDelayR.delayTime.value =
        0.013;


    spatialGainL =
        audio.createGain();


    spatialGainR =
        audio.createGain();


    spatialGainL.gain.value =
        0.18;


    spatialGainR.gain.value =
        0.18;


    // ========================================================
    // ROUTING
    // ========================================================

    highpass
        .connect(
            lowpass
        );


    lowpass
        .connect(
            compressor
        );


    eventBus
        .connect(
            compressor
        );


    eventBus
        .connect(
            eventReverb
        );


    eventReverb
        .connect(
            eventReverbGain
        )
        .connect(
            compressor
        );


    // spatial return
    eventBus
        .connect(
            spatialDelayL
        )
        .connect(
            spatialGainL
        )
        .connect(
            compressor
        );


    eventBus
        .connect(
            spatialDelayR
        )
        .connect(
            spatialGainR
        )
        .connect(
            compressor
        );


    compressor
        .connect(
            master
        );


    master
        .connect(
            audio.destination
        );


    // ========================================================
    // START
    // ========================================================

    const now =
        audio.currentTime;


    earthOsc.start(
        now
    );


    bodyOsc.start(
        now
    );


    skyOsc.start(
        now
    );


    resonanceOsc.start(
        now
    );


    master.gain.setValueAtTime(
        0.0001,
        now
    );


    master.gain.exponentialRampToValueAtTime(
        0.15,
        now + 5.5
    );


    audioStarted =
        true;

}


// ============================================================
// SPATIAL MODULATION
// ============================================================

function updateSpatialField(
    x,
    speed
) {

    if (
        !audioStarted ||
        !audio
    ) {
        return;
    }


    const now =
        audio.currentTime;


    const normalized =
        Math.max(
            -1,
            Math.min(
                1,
                x
            )
        );


    const width =
        Math.min(
            1,
            speed
        );


    const slow =
        Math.sin(
            now * 0.11
        );


    earthPan.pan.linearRampToValueAtTime(
        normalized * 0.10 +
        slow * 0.035,
        now + 0.35
    );


    bodyPan.pan.linearRampToValueAtTime(
        normalized * 0.20 -
        slow * 0.055,
        now + 0.45
    );


    skyPan.pan.linearRampToValueAtTime(
        normalized * 0.42 +
        slow * 0.10 * width,
        now + 0.65
    );


    resonancePan.pan.linearRampToValueAtTime(
        normalized * 0.56 -
        slow * 0.14 * width,
        now + 0.80
    );

}


// ============================================================
// PLAY NOTE
// ============================================================

function playNote(
    frequency,
    intensity,
    panValue = 0,
    durationScale = 1
) {

    if (
        !audioStarted ||
        !audio
    ) {
        return;
    }


    const now =
        audio.currentTime;


    const osc =
        audio.createOscillator();


    const gain =
        audio.createGain();


    const pan =
        audio.createStereoPanner();


    // --------------------------------------------------------
    // TIMBRE
    // --------------------------------------------------------

    osc.type =
        intensity > 0.68
            ? "triangle"
            : "sine";


    osc.frequency.setValueAtTime(
        frequency,
        now
    );


    osc.detune.setValueAtTime(
        (
            Math.random() -
            0.5
        )
        *
        5,
        now
    );


    // --------------------------------------------------------
    // ENVELOPE
    // --------------------------------------------------------

    const attack =
        0.035 +
        Math.random() *
        0.055;


    const duration =
        (
            1.6 +
            intensity * 2.2 +
            Math.random() * 1.0
        )
        *
        durationScale;


    const level =
        0.010 +
        intensity * 0.026;


    gain.gain.setValueAtTime(
        0.0001,
        now
    );


    gain.gain.exponentialRampToValueAtTime(
        level,
        now + attack
    );


    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + duration
    );


    pan.pan.setValueAtTime(
        Math.max(
            -0.80,
            Math.min(
                0.80,
                panValue
            )
        ),
        now
    );


    // --------------------------------------------------------
    // ROUTE
    // --------------------------------------------------------

    osc
        .connect(
            gain
        )
        .connect(
            pan
        )
        .connect(
            eventBus
        );


    osc.start(
        now
    );


    osc.stop(
        now +
        duration +
        0.15
    );

}


// ============================================================
// HARMONIC CHORD
// ============================================================

function playHarmony(
    intensity,
    panValue
) {

    if (
        !audioStarted ||
        !audio
    ) {
        return;
    }


    const harmony =
        HARMONIES[
            harmonicIndex
        ];


    const frequencies =
        harmony.degrees.map(
            degree =>
                scaleFrequency(
                    degree,
                    0
                )
        );


    // root / third / fifth
    frequencies.forEach(
        (
            frequency,
            index
        ) => {

            const delay =
                index *
                0.085;


            window.setTimeout(
                () => {

                    if (
                        !audioStarted
                    ) {
                        return;
                    }


                    playNote(
                        frequency,
                        intensity *
                        (
                            0.48 +
                            index *
                            0.08
                        ),
                        panValue +
                        (
                            index -
                            1
                        )
                        *
                        0.09,
                        1.15
                    );

                },
                delay * 1000
            );

        }
    );

}


// ============================================================
// HARMONIC SELECTION
// ============================================================

function selectHarmony(
    strength
) {

    harmonicPressure +=
        strength *
        0.11;


    if (
        strength < 0.40
    ) {
        return;
    }


    if (
        harmonicPressure < 0.62
    ) {
        return;
    }


    const now =
        performance.now()
        /
        1000;


    if (
        now -
        lastHarmonyChange
        <
        11
    ) {
        return;
    }


    const current =
        harmonicIndex;


    const random =
        Math.random();


    if (
        random < 0.50
    ) {

        harmonicIndex =
            0;

    } else if (
        random < 0.68
    ) {

        harmonicIndex =
            1;

    } else if (
        random < 0.84
    ) {

        harmonicIndex =
            2;

    } else if (
        random < 0.94
    ) {

        harmonicIndex =
            3;

    } else {

        harmonicIndex =
            4;

    }


    if (
        harmonicIndex !==
        current
    ) {

        lastHarmonyChange =
            now;

    }


    harmonicPressure *=
        0.22;

}


// ============================================================
// AUDIO EVENT
// ============================================================

function triggerAudioEvent(
    strength,
    speed
) {

    if (
        !audioStarted ||
        !audio
    ) {
        return;
    }


    const normalizedX =
        (
            pointerX /
            canvas.clientWidth
        )
        *
        2 -
        1;


    const frequency =
        fieldFrequency(
            strength
        );


    // --------------------------------------------------------
    // MAIN TONAL EVENT
    // --------------------------------------------------------

    playNote(
        frequency,
        strength,
        normalizedX,
        0.90 +
        speed * 0.50
    );


    // --------------------------------------------------------
    // IMPORTANT EVENTS OPEN HARMONY
    // --------------------------------------------------------

    const now =
        performance.now()
        /
        1000;


    if (
        strength > 0.58 &&
        now -
        lastHarmonyEvent >
        1.4
    ) {

        if (
            Math.random() <
            0.32
        ) {

            playHarmony(
                strength,
                normalizedX
            );


            lastHarmonyEvent =
                now;

        }

    }


    // --------------------------------------------------------
    // REVERB
    // --------------------------------------------------------

    const audioNow =
        audio.currentTime;


    const amount =
        0.13 +
        strength * 0.28;


    eventReverbGain.gain.cancelScheduledValues(
        audioNow
    );


    eventReverbGain.gain.linearRampToValueAtTime(
        amount,
        audioNow + 0.05
    );


    eventReverbGain.gain.exponentialRampToValueAtTime(
        0.105,
        audioNow +
        2.2 +
        strength * 2.0
    );


    // --------------------------------------------------------
    // SPATIAL DELAY
    // --------------------------------------------------------

    spatialGainL.gain.setValueAtTime(
        0.12 +
        strength * 0.10,
        audioNow
    );


    spatialGainR.gain.setValueAtTime(
        0.12 +
        strength * 0.10,
        audioNow
    );

}


// ============================================================
// CONTINUOUS AUDIO FIELD
// ============================================================

function updateAudio(
    elapsed
) {

    if (
        !audioStarted ||
        !audio
    ) {
        return;
    }


    const now =
        audio.currentTime;


    const activity =
        Math.min(
            1,
            pointerSpeed * 0.85
        );


    const breathing =
        0.5 +
        0.5 *
        Math.sin(
            elapsed * 0.17
        );


    // --------------------------------------------------------
    // EARTH
    // --------------------------------------------------------

    earthGain.gain.linearRampToValueAtTime(
        0.034 +
        activity * 0.015 +
        breathing * 0.004,
        now + 1.2
    );


    // --------------------------------------------------------
    // BODY
    // --------------------------------------------------------

    bodyGain.gain.linearRampToValueAtTime(
        0.009 +
        activity * 0.015 +
        breathing * 0.003,
        now + 1.0
    );


    // --------------------------------------------------------
    // SKY
    // --------------------------------------------------------

    skyGain.gain.linearRampToValueAtTime(
        0.0025 +
        activity * 0.010 +
        breathing * 0.0025,
        now + 1.4
    );


    // --------------------------------------------------------
    // 741 RESONANCE
    //
    // Almost inaudible.
    // More felt as spectral presence than pitch.
    // --------------------------------------------------------

    resonanceGain.gain.linearRampToValueAtTime(
        0.0007 +
        activity * 0.0032 +
        breathing * 0.0008,
        now + 1.8
    );


    // --------------------------------------------------------
    // FILTER
    // --------------------------------------------------------

    lowpass.frequency.linearRampToValueAtTime(
        1500 +
        activity * 2200 +
        breathing * 250,
        now + 1.1
    );


    // --------------------------------------------------------
    // SPATIAL FIELD
    // --------------------------------------------------------

    const normalizedX =
        pointerX /
        Math.max(
            1,
            canvas.clientWidth
        )
        *
        2 -
        1;


    updateSpatialField(
        normalizedX,
        pointerSpeed
    );

}


// ============================================================
// POINTER DOWN
// ============================================================

canvas.addEventListener(
    "pointerdown",
    async event => {

        await startAudio();


        pointerInside =
            true;


        pointerActive =
            true;


        pointerX =
            event.clientX;


        pointerY =
            event.clientY;


        previousPointerX =
            pointerX;


        previousPointerY =
            pointerY;


        const point =
            eventPositionFromPointer(
                event
            );


        const initial =
            createEvent(
                point.x,
                point.y,
                0.76,
                0.82
            );


        initial.time =
            performance.now()
            /
            1000;


        triggerAudioEvent(
            0.76,
            0.30
        );


        canvas.setPointerCapture?.(
            event.pointerId
        );

    },
    {
        passive: true
    }
);


// ============================================================
// POINTER MOVE
// ============================================================

canvas.addEventListener(
    "pointermove",
    event => {

        if (
            !pointerInside
        ) {
            return;
        }


        const dx =
            event.clientX -
            previousPointerX;


        const dy =
            event.clientY -
            previousPointerY;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        pointerSpeed =
            Math.min(
                1,
                distance / 32
            );


        pointerX =
            event.clientX;


        pointerY =
            event.clientY;


        previousPointerX =
            event.clientX;


        previousPointerY =
            event.clientY;


        movementAccumulator +=
            distance;


        const now =
            performance.now()
            /
            1000;


        // ----------------------------------------------------
        // MOVEMENT THRESHOLD
        //
        // The mechanical selection of the pointer remains
        // the physical trigger of the field.
        // ----------------------------------------------------

        const threshold =
            24 -
            pointerSpeed * 10;


        if (
            movementAccumulator >
            threshold &&
            now -
            lastEventTime >
            0.055
        ) {

            const point =
                eventPositionFromPointer(
                    event
                );


            const strength =
                Math.min(
                    1,
                    0.18 +
                    pointerSpeed * 0.75 +
                    Math.random() * 0.18
                );


            const size =
                0.35 +
                pointerSpeed * 0.75 +
                Math.random() * 0.35;


            const created =
                createEvent(
                    point.x,
                    point.y,
                    strength,
                    size
                );


            created.time =
                now;


            movementAccumulator =
                0;


            lastEventTime =
                now;


            // ------------------------------------------------
            // SOUND
            // ------------------------------------------------

            triggerAudioEvent(
                strength,
                pointerSpeed
            );


            // ------------------------------------------------
            // HARMONIC PRESSURE
            // ------------------------------------------------

            selectHarmony(
                strength
            );

        }

    },
    {
        passive: true
    }
);


// ============================================================
// POINTER ENTER
// ============================================================

canvas.addEventListener(
    "pointerenter",
    event => {

        pointerInside =
            true;


        pointerActive =
            true;


        pointerX =
            event.clientX;


        pointerY =
            event.clientY;


        previousPointerX =
            event.clientX;


        previousPointerY =
            event.clientY;

    },
    {
        passive: true
    }
);


// ============================================================
// POINTER LEAVE
// ============================================================

canvas.addEventListener(
    "pointerleave",
    () => {

        pointerInside =
            false;


        pointerActive =
            false;


        pointerSpeed =
            0;


        movementAccumulator =
            0;

    },
    {
        passive: true
    }
);


// ============================================================
// POINTER CANCEL
// ============================================================

canvas.addEventListener(
    "pointercancel",
    () => {

        pointerInside =
            false;


        pointerActive =
            false;


        pointerSpeed =
            0;

    },
    {
        passive: true
    }
);


// ============================================================
// RESIZE
// ============================================================

function resize() {

    const dpr =
        Math.min(
            window.devicePixelRatio ||
            1,
            2
        );


    const width =
        window.innerWidth;


    const height =
        window.innerHeight;


    canvas.width =
        Math.floor(
            width *
            dpr
        );


    canvas.height =
        Math.floor(
            height *
            dpr
        );


    gl.viewport(
        0,
        0,
        canvas.width,
        canvas.height
    );


    gl.uniform2f(
        U.resolution,
        canvas.width,
        canvas.height
    );

}


window.addEventListener(
    "resize",
    resize
);


resize();


// ============================================================
// UI
// ============================================================

const coordinateX =
    document.getElementById(
        "coordX"
    );


const coordinateY =
    document.getElementById(
        "coordY"
    );


const frequencyDisplay =
    document.getElementById(
        "frequency"
    );


const statusDisplay =
    document.getElementById(
        "status"
    );


// ============================================================
// UI UPDATE
// ============================================================

function updateInterface() {

    if (!pointerInside) {

        statusDisplay.textContent =
            "FIELD";


        frequencyDisplay.textContent =
            "F# · 185 Hz";


        return;

    }


    const x =
        (
            pointerX /
            canvas.clientWidth
        )
        *
        2 -
        1;


    const y =
        1 -
        (
            pointerY /
            canvas.clientHeight
        )
        *
        2;


    coordinateX.textContent =
        x.toFixed(3);


    coordinateY.textContent =
        y.toFixed(3);


    if (
        pointerSpeed < 0.12
    ) {

        frequencyDisplay.textContent =
            "F# · 185 Hz";


        statusDisplay.textContent =
            "TERRA";

    } else if (
        pointerSpeed < 0.45
    ) {

        frequencyDisplay.textContent =
            "F# · 370 Hz";


        statusDisplay.textContent =
            "MATÈRIA";

    } else {

        frequencyDisplay.textContent =
            "F# · 740 / 741 Hz";


        statusDisplay.textContent =
            "SKY";

    }

}


// ============================================================
// RENDER
// ============================================================

const start =
    performance.now();


const positionData =
    new Float32Array(
        MAX_EVENTS * 2
    );


const timeData =
    new Float32Array(
        MAX_EVENTS
    );


const strengthData =
    new Float32Array(
        MAX_EVENTS
    );


const sizeData =
    new Float32Array(
        MAX_EVENTS
    );


const seedData =
    new Float32Array(
        MAX_EVENTS
    );


function render(now) {

    const elapsed =
        (
            now -
            start
        )
        /
        1000;


    pointerSpeed *=
        0.91;


    updateAudio(
        elapsed
    );


    updateInterface();


    for (
        let i = 0;
        i < MAX_EVENTS;
        i++
    ) {

        const event =
            events[i];


        if (
            event
        ) {

            positionData[
                i * 2
            ] =
                event.x;


            positionData[
                i * 2 + 1
            ] =
                event.y;


            timeData[i] =
                event.time;


            strengthData[i] =
                event.strength;


            sizeData[i] =
                event.size;


            seedData[i] =
                event.seed;

        } else {

            positionData[
                i * 2
            ] =
                0;


            positionData[
                i * 2 + 1
            ] =
                0;


            timeData[i] =
                -100;


            strengthData[i] =
                0;


            sizeData[i] =
                0;


            seedData[i] =
                0;

        }

    }


    gl.uniform1f(
        U.time,
        elapsed
    );


    gl.uniform2fv(
        U.eventPosition,
        positionData
    );


    gl.uniform1fv(
        U.eventTime,
        timeData
    );


    gl.uniform1fv(
        U.eventStrength,
        strengthData
    );


    gl.uniform1fv(
        U.eventSize,
        sizeData
    );


    gl.uniform1fv(
        U.eventSeed,
        seedData
    );


    gl.drawArrays(
        gl.TRIANGLES,
        0,
        6
    );


    requestAnimationFrame(
        render
    );

}


requestAnimationFrame(
    render
);