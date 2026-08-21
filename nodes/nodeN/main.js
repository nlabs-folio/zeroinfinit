// ============================================================
// ZERO INFINIT · NODE 3 · MATÈRIA
//
// MOTOR MUSICAL + MATÈRIA MICROSCÒPICA + FOTONS
//
// MATÈRIA
//      ↓
// ESTAT
//      ↓
// CÀLCUL
//      ↓
// FENOMEN
//      ↓
// LLUM FOTÒNICA
//      ↙       ↘
// MATÈRIA     MÚSICA
//
// El punter no toca notes.
// Modifica un estat musical.
//
// El cercle de quintes és latent.
// La composició té memòria.
// El silenci és un estat.
// ============================================================


// ============================================================
// CANVAS
// ============================================================

const canvas =
    document.getElementById("cosmos");

const gl =
    canvas.getContext("webgl", {
        antialias: false,
        alpha: false,
        powerPreference: "high-performance"
    });

if (!gl) {
    throw new Error("WebGL no disponible");
}


// ============================================================
// VERTEX SHADER
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


// ============================================================
// FRAGMENT SHADER
//
// MATÈRIA MICROSCÒPICA VIVA
//
// Fractal iteratiu
// Domain warp
// membranes
// cristalls
// colònies
// filaments
// interferència
// fotons
// ============================================================

const fragmentShaderSource = `

precision highp float;

uniform vec2 resolution;
uniform float time;

uniform vec2 disturbance;
uniform float disturbanceEnergy;

uniform float coherence;
uniform float excitation;

uniform vec2 photon;
uniform float photonEnergy;

uniform float phase;


// ============================================================
// HASH
// ============================================================

float hash(vec2 p) {

    p =
        fract(
            p *
            vec2(
                123.34,
                456.21
            )
        );

    p +=
        dot(
            p,
            p + 45.32
        );

    return fract(
        p.x * p.y
    );

}


// ============================================================
// ROTACIÓ
// ============================================================

mat2 rot(float a) {

    float c =
        cos(a);

    float s =
        sin(a);

    return mat2(
        c,
        -s,
        s,
        c
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
            2.0 *
            f
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
        mix(
            a,
            b,
            f.x
        ),
        mix(
            c,
            d,
            f.x
        ),
        f.y
    );

}


// ============================================================
// FRACTAL VIU
// ============================================================

float livingFractal(vec2 p) {

    vec2 z =
        p;

    float value =
        0.0;

    float weight =
        0.56;


    for (
        int i = 0;
        i < 8;
        i++
    ) {

        float fi =
            float(i);

        z =
            abs(
                z
            );


        float localTime =
            time *
            (
                0.012 +
                fi *
                0.0025
            );


        z -=
            vec2(
                0.34 +
                sin(
                    localTime +
                    fi
                )
                *
                0.055,

                0.25 +
                cos(
                    localTime *
                    0.83 +
                    fi
                )
                *
                0.038
            );


        z =
            rot(
                0.38 +
                sin(
                    time *
                    0.014 +
                    fi
                )
                *
                0.09
            )
            *
            z;


        float radius =
            length(z);


        value +=
            exp(
                -radius *
                (
                    5.0 +
                    coherence *
                    1.9
                )
            )
            *
            weight;


        z *=
            1.58 +
            coherence *
            0.19;


        weight *=
            0.51;

    }


    return value;

}


// ============================================================
// DOMAIN WARP
// ============================================================

vec2 warp(vec2 p) {

    float t =
        time;

    vec2 q =
        p;


    q +=
        vec2(
            sin(
                q.y *
                3.3 +
                t *
                0.21
            ),

            cos(
                q.x *
                2.8 -
                t *
                0.17
            )
        )
        *
        0.045;


    q +=
        vec2(
            sin(
                q.y *
                8.0 -
                t *
                0.31
            ),

            sin(
                q.x *
                7.0 +
                t *
                0.27
            )
        )
        *
        0.014;


    return q;

}


// ============================================================
// FORMA EXTERIOR
// ============================================================

float organismMask(vec2 p) {

    float angle =
        atan(
            p.y,
            p.x
        );


    float radius =
        length(p);


    float lobes =
        0.055 *
        sin(
            angle *
            5.0 +
            time *
            0.11
        );


    lobes +=
        0.038 *
        sin(
            angle *
            9.0 -
            time *
            0.07
        );


    lobes +=
        0.025 *
        sin(
            angle *
            14.0 +
            time *
            0.17
        );


    float boundary =
        0.60 +
        lobes;


    return
        1.0 -
        smoothstep(
            boundary * 0.78,
            boundary,
            radius
        );

}


// ============================================================
// CRISTALLS
// ============================================================

float crystalField(vec2 p) {

    vec2 lattice =
        p *
        (
            26.0 +
            coherence *
            12.0
        );


    lattice +=
        vec2(
            sin(
                time *
                0.019
            )
            *
            1.7,

            cos(
                time *
                0.014
            )
            *
            1.4
        );


    vec2 cell =
        floor(
            lattice
        );


    vec2 local =
        fract(
            lattice
        )
        -
        0.5;


    float random =
        hash(cell);


    float crystal =
        smoothstep(
            0.105,
            0.012,
            length(
                local
            )
        );


    crystal *=
        step(
            0.74,
            random
        );


    crystal *=
        0.60 +
        0.40 *
        (
            0.5 +
            0.5 *
            sin(
                time *
                0.17 +
                random *
                6.283
            )
        );


    return crystal;

}


// ============================================================
// MEMBRANES
// ============================================================

float membraneField(vec2 p) {

    float a =
        livingFractal(
            p *
            2.0
        );


    float b =
        livingFractal(
            (
                p +
                vec2(
                    0.031,
                    -0.022
                )
            )
            *
            2.0
        );


    return
        smoothstep(
            0.010,
            0.070,
            abs(
                a -
                b
            )
        );

}


// ============================================================
// COLÒNIES MICROSCÒPIQUES
// ============================================================

float colonyField(vec2 p) {

    vec2 grid =
        p *
        98.0;


    grid +=
        vec2(
            time *
            0.13,

            -time *
            0.087
        );


    vec2 cell =
        floor(
            grid
        );


    vec2 local =
        fract(
            grid
        )
        -
        0.5;


    float random =
        hash(cell);


    float colony =
        smoothstep(
            0.043,
            0.0,
            length(
                local
            )
        );


    float activity =
        0.5 +
        0.5 *
        sin(
            time *
            (
                0.22 +
                random *
                0.18
            )
            +
            random *
            15.0
        );


    colony *=
        smoothstep(
            0.20,
            0.78,
            activity
        );


    colony *=
        step(
            0.90,
            random
        );


    return colony;

}


// ============================================================
// FILAMENTS
// ============================================================

float filamentField(vec2 p) {

    float a =
        livingFractal(
            p *
            5.5
        );


    float b =
        livingFractal(
            (
                p +
                vec2(
                    0.09,
                    -0.06
                )
            )
            *
            5.5
        );


    return
        smoothstep(
            0.007,
            0.040,
            abs(
                a -
                b
            )
        );

}


// ============================================================
// FOTÓ
//
// Nucli
// camp proper
// anells de difracció
// distribució angular
// caustiques
// ============================================================

float photonCluster(vec2 p) {

    vec2 d =
        p -
        photon;


    float radius =
        length(d);


    float core =
        exp(
            -radius *
            88.0
        );


    float nearField =
        exp(
            -radius *
            28.0
        );


    float rings =
        sin(
            radius *
            138.0 -
            time *
            2.6
        );


    rings =
        smoothstep(
            0.62,
            0.98,
            0.5 +
            0.5 *
            rings
        );


    float angular =
        sin(
            atan(
                d.y,
                d.x
            )
            *
            11.0 +
            phase
        );


    angular =
        0.5 +
        0.5 *
        angular;


    float caustic =
        sin(
            d.x *
            76.0 +
            sin(
                d.y *
                9.0
            )
        );


    caustic =
        smoothstep(
            0.78,
            0.99,
            0.5 +
            0.5 *
            caustic
        );


    float secondary =
        nearField *
        rings *
        angular;


    return
        (
            core *
            1.00
            +
            secondary *
            0.46
            +
            caustic *
            nearField *
            0.18
        )
        *
        photonEnergy;

}


// ============================================================
// MAIN
// ============================================================

void main() {

    vec2 uv =
        gl_FragCoord.xy /
        resolution.xy;


    vec2 p =
        uv -
        0.5;


    p.x *=
        resolution.x /
        resolution.y;


    // --------------------------------------------------------
    // ORGANISME
    // --------------------------------------------------------

    vec2 q =
        warp(p);


    float mask =
        organismMask(q);


    // --------------------------------------------------------
    // MATÈRIA
    // --------------------------------------------------------

    float large =
        livingFractal(
            q *
            1.5
        );


    float medium =
        livingFractal(
            q *
            3.3
        );


    float fine =
        livingFractal(
            q *
            7.4
        );


    float matter =
        large *
        0.48
        +
        medium *
        0.34
        +
        fine *
        0.18;


    matter =
        smoothstep(
            0.18,
            0.93,
            matter
        );


    // --------------------------------------------------------
    // PERTORBACIÓ
    // --------------------------------------------------------

    vec2 pointerVector =
        q -
        disturbance;


    float pointerDistance =
        length(
            pointerVector
        );


    float disturbanceField =
        exp(
            -pointerDistance *
            7.5
        )
        *
        disturbanceEnergy;


    vec2 pointerDirection =
        normalize(
            pointerVector +
            vec2(
                0.00001
            )
        );


    vec2 perturbed =
        q +
        pointerDirection *
        disturbanceField *
        0.020;


    // --------------------------------------------------------
    // MICROESTRUCTURES
    // --------------------------------------------------------

    float membranes =
        membraneField(
            perturbed
        );


    float crystals =
        crystalField(
            perturbed
        );


    float colonies =
        colonyField(
            perturbed
        );


    float filaments =
        filamentField(
            perturbed
        );


    // --------------------------------------------------------
    // FOTÓ
    // --------------------------------------------------------

    float photon =
        photonCluster(
            perturbed
        );


    // --------------------------------------------------------
    // REORGANITZACIÓ LOCAL
    // --------------------------------------------------------

    float photonMatter =
        smoothstep(
            0.04,
            0.36,
            photon
        );


    float localReorganization =
        photon *
        (
            0.32 +
            excitation *
            0.6
        );


    // --------------------------------------------------------
    // INTERFERÈNCIA
    // --------------------------------------------------------

    float interference =
        sin(
            perturbed.x *
            57.0 +
            matter *
            9.0 +
            phase
        )
        *
        sin(
            perturbed.y *
            71.0 -
            matter *
            6.0 -
            phase *
            0.67
        );


    interference =
        smoothstep(
            0.73,
            0.985,
            0.5 +
            0.5 *
            interference
        );


    interference *=
        0.06 +
        photon *
        0.48;


    // --------------------------------------------------------
    // ESPECTRE FOTÒNIC
    // --------------------------------------------------------

    float spectrum =
        sin(
            perturbed.x *
            101.0 +
            perturbed.y *
            47.0 -
            time *
            1.6
        );


    spectrum =
        smoothstep(
            0.76,
            0.995,
            0.5 +
            0.5 *
            spectrum
        );


    spectrum *=
        photon;


    // --------------------------------------------------------
    // TRANSICIÓ
    // --------------------------------------------------------

    float transition =
        abs(
            large -
            medium
        );


    transition =
        smoothstep(
            0.035,
            0.23,
            transition
        );


    // --------------------------------------------------------
    // COLORS
    // --------------------------------------------------------

    vec3 black =
        vec3(
            0.004,
            0.003,
            0.006
        );


    vec3 deepViolet =
        vec3(
            0.095,
            0.043,
            0.14
        );


    vec3 violet =
        vec3(
            0.28,
            0.13,
            0.35
        );


    vec3 magenta =
        vec3(
            0.45,
            0.075,
            0.26
        );


    vec3 ochre =
        vec3(
            0.53,
            0.30,
            0.11
        );


    vec3 amber =
        vec3(
            0.82,
            0.57,
            0.23
        );


    vec3 photonWhite =
        vec3(
            1.0,
            0.91,
            0.73
        );


    vec3 colour =
        black;


    colour +=
        deepViolet *
        matter *
        1.38;


    colour +=
        violet *
        matter *
        matter *
        1.50;


    colour +=
        magenta *
        membranes *
        0.84;


    colour +=
        ochre *
        filaments *
        0.48;


    colour +=
        amber *
        crystals *
        (
            0.56 +
            excitation *
            0.82
        );


    colour +=
        ochre *
        colonies *
        0.92;


    colour +=
        magenta *
        transition *
        0.78;


    colour +=
        amber *
        localReorganization;


    colour +=
        violet *
        interference *
        0.84;


    colour +=
        amber *
        spectrum *
        0.68;


    colour +=
        photonWhite *
        photon *
        1.85;


    // --------------------------------------------------------
    // MÀSCARA
    // --------------------------------------------------------

    float interior =
        smoothstep(
            0.05,
            0.42,
            mask
        );


    colour *=
        0.04 +
        interior *
        0.96;


    // --------------------------------------------------------
    // PROFUNDITAT
    // --------------------------------------------------------

    float depth =
        smoothstep(
            1.38,
            0.05,
            length(p)
        );


    colour *=
        0.62 +
        depth *
        0.50;


    // --------------------------------------------------------
    // TONEMAP
    // --------------------------------------------------------

    colour =
        colour /
        (
            1.0 +
            colour
        );


    colour =
        pow(
            colour,
            vec3(
                0.88
            )
        );


    gl_FragColor =
        vec4(
            colour,
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
            "Shader compilation failed"
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
    program );


if (
    !gl.getProgramParameter(
        program,
        gl.LINK_STATUS
    )
) {

    throw new Error(
        "Program link failed"
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

const uResolution =
    gl.getUniformLocation(
        program,
        "resolution"
    );


const uTime =
    gl.getUniformLocation(
        program,
        "time"
    );


const uDisturbance =
    gl.getUniformLocation(
        program,
        "disturbance"
    );


const uDisturbanceEnergy =
    gl.getUniformLocation(
        program,
        "disturbanceEnergy"
    );


const uCoherence =
    gl.getUniformLocation(
        program,
        "coherence"
    );


const uExcitation =
    gl.getUniformLocation(
        program,
        "excitation"
    );


const uPhoton =
    gl.getUniformLocation(
        program,
        "photon"
    );


const uPhotonEnergy =
    gl.getUniformLocation(
        program,
        "photonEnergy"
    );


const uPhase =
    gl.getUniformLocation(
        program,
        "phase"
    );


// ============================================================
// VISUAL STATE
// ============================================================

let visualCoherence =
    0.58;

let visualExcitation =
    0.12;

let visualDensity =
    0.45;

let visualTransition =
    0;

let visualPhase =
    Math.random() *
    Math.PI *
    2;


// ============================================================
// PHOTON
// ============================================================

let photonX =
    -0.22;

let photonY =
    0.18;

let photonTargetX =
    0.30;

let photonTargetY =
    -0.16;

let photonEnergy =
    0.035;

let photonClock =
    0;


// ============================================================
// POINTER
// ============================================================

let pointerX = 0;
let pointerY = 0;

let targetPointerX = 0;
let targetPointerY = 0;

let pointerVelocity = 0;

let previousPointerX = 0;
let previousPointerY = 0;

let musicalPerturbation =
    0;


// ============================================================
// CIRCLE OF FIFTHS
// ============================================================

const circleOfFifths = [

    {
        name: "C",
        root: 261.6256,
        up: 1,
        down: 11
    },

    {
        name: "G",
        root: 391.9954,
        up: 2,
        down: 0
    },

    {
        name: "D",
        root: 293.6648,
        up: 3,
        down: 1
    },

    {
        name: "A",
        root: 440,
        up: 4,
        down: 2
    },

    {
        name: "E",
        root: 329.6276,
        up: 5,
        down: 3
    },

    {
        name: "B",
        root: 493.8833,
        up: 6,
        down: 4
    },

    {
        name: "F#/Gb",
        root: 369.9944,
        up: 7,
        down: 5
    },

    {
        name: "Db",
        root: 277.1826,
        up: 8,
        down: 6
    },

    {
        name: "Ab",
        root: 415.3047,
        up: 9,
        down: 7
    },

    {
        name: "Eb",
        root: 311.127,
        up: 10,
        down: 8
    },

    {
        name: "Bb",
        root: 466.1638,
        up: 11,
        down: 9
    },

    {
        name: "F",
        root: 349.2282,
        up: 0,
        down: 10
    }

];


let circleIndex =
    Math.floor(
        Math.random() *
        circleOfFifths.length
    );


let previousCircleIndex =
    circleIndex;


let harmonicDirection =
    0;


let directionConfidence =
    0;


// ============================================================
// MUSICAL STATE
// ============================================================

let mode =
    Math.random() >
    0.5
        ? "major"
        : "minor";


let musicalDegree =
    Math.floor(
        Math.random() *
        7
    );


let harmonicTension =
    0.18;


let harmonicStability =
    0.76;


let melodicMemory = [];

let compositionCycle =
    0;

let phraseProgress =
    0;

let phraseTarget =
    3 +
    Math.floor(
        Math.random() *
        3
    );


let lastHarmonicMove =
    -Infinity;


// ============================================================
// SCALES
// ============================================================

const majorScale = [
    0,
    2,
    4,
    5,
    7,
    9,
    11
];


const minorScale = [
    0,
    2,
    3,
    5,
    7,
    8,
    10
];


// ============================================================
// AUDIO GRAPH
// ============================================================

let audio =
    null;

let master =
    null;

let output =
    null;

let compressor =
    null;

let highPass =
    null;

let lowPass =
    null;

let reverb =
    null;

let reverbGain =
    null;


// ============================================================
// VOICES
// ============================================================

let bassOsc =
    null;

let bassGain =
    null;


let midBassOsc =
    null;

let midBassGain =
    null;


let padOscA =
    null;

let padOscB =
    null;

let padGain =
    null;


let airOsc =
    null;

let airGain =
    null;


let textureSource =
    null;

let textureGain =
    null;


let audioStarting =
    false;


// ============================================================
// AUDIO CLOCK
// ============================================================

let nextCompositionTime =
    0;

let nextTextureTime =
    0;

let silenceUntil =
    0;

let currentSilence =
    null;


// ============================================================
// SILENCE TYPES
// ============================================================

const silenceTypes = {

    breath: {

        min: 0.45,
        max: 1.15,

        body: 0.58,
        harmony: 0.72,
        air: 0.55,
        texture: 0.42

    },

    suspension: {

        min: 1.2,
        max: 2.8,

        body: 0.22,
        harmony: 0.30,
        air: 0.22,
        texture: 0.08

    },

    retention: {

        min: 1.7,
        max: 3.6,

        body: 0.34,
        harmony: 0.44,
        air: 0.30,
        texture: 0.06

    },

    dissolution: {

        min: 2.3,
        max: 4.8,

        body: 0.07,
        harmony: 0.10,
        air: 0.05,
        texture: 0.015

    },

    absence: {

        min: 3.5,
        max: 6.8,

        body: 0.0,
        harmony: 0.0,
        air: 0.0,
        texture: 0.0

    },

    resolution: {

        min: 1.1,
        max: 3.1,

        body: 0.14,
        harmony: 0.20,
        air: 0.12,
        texture: 0.02

    }

};


// ============================================================
// SILENCE SELECTION
// ============================================================

function chooseSilenceType() {

    if (
        harmonicTension >
        0.78
    ) {

        return "resolution";

    }


    if (
        harmonicStability >
        0.86
    ) {

        return "retention";

    }


    if (
        musicalPerturbation >
        0.56
    ) {

        return "suspension";

    }


    if (
        visualTransition >
        0.055
    ) {

        return "dissolution";

    }


    if (
        compositionCycle %
        7 ===
        0
    ) {

        return "absence";

    }


    return "breath";

}


// ============================================================
// ENTER SILENCE
// ============================================================

function enterSilence(
    forcedType = null
) {

    if (!audio) {
        return;
    }


    const type =
        forcedType ||
        chooseSilenceType();


    const definition =
        silenceTypes[type];


    const duration =
        definition.min +
        Math.random() *
        (
            definition.max -
            definition.min
        );


    silenceUntil =
        audio.currentTime +
        duration;


    currentSilence =
        type;

}


// ============================================================
// AUDIO SUPPORT
// ============================================================

function createNoiseBuffer(
    ctx
) {

    const length =
        ctx.sampleRate *
        2;


    const buffer =
        ctx.createBuffer(
            1,
            length,
            ctx.sampleRate
        );


    const data =
        buffer.getChannelData(
            0
        );


    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        data[i] =
            Math.random() *
            2 -
            1;

    }


    return buffer;

}


// ============================================================
// REVERB
// ============================================================

function createReverbBuffer(
    ctx,
    duration,
    decay
) {

    const length =
        Math.floor(
            ctx.sampleRate *
            duration
        );


    const buffer =
        ctx.createBuffer(
            2,
            length,
            ctx.sampleRate
        );


    for (
        let channel = 0;
        channel < 2;
        channel++
    ) {

        const data =
            buffer.getChannelData(
                channel
            );


        for (
            let i = 0;
            i < length;
            i++
        ) {

            const fade =
                Math.pow(
                    1 -
                    i / length,
                    decay
                );


            data[i] =
                (
                    Math.random() *
                    2 -
                    1
                )
                *
                fade;

        }

    }


    return buffer;

}


// ============================================================
// START AUDIO
// ============================================================

async function startAudio() {

    if (audio) {

        if (
            audio.state ===
            "suspended"
        ) {

            try {

                await audio.resume();

            }
            catch (error) {

                console.warn(
                    "Audio resume failed",
                    error
                );

            }

        }

        return;

    }


    if (audioStarting) {
        return;
    }


    audioStarting =
        true;


    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;


    if (!AudioContext) {

        console.warn(
            "Web Audio API no disponible"
        );

        audioStarting =
            false;

        return;

    }


    const ctx =
        new AudioContext();


    try {

        await ctx.resume();


        // ----------------------------------------------------
        // OUTPUT
        // ----------------------------------------------------

        const newOutput =
            ctx.createGain();


        newOutput.gain.value =
            1.0;


        // ----------------------------------------------------
        // MASTER
        // ----------------------------------------------------

        const newMaster =
            ctx.createGain();


        newMaster.gain.value =
            0.0001;


        // ----------------------------------------------------
        // COMPRESSOR
        // ----------------------------------------------------

        const newCompressor =
            ctx.createDynamicsCompressor();


        newCompressor.threshold.value =
            -20;


        newCompressor.knee.value =
            14;


        newCompressor.ratio.value =
            3.2;


        newCompressor.attack.value =
            0.012;


        newCompressor.release.value =
            0.28;


        // ----------------------------------------------------
        // HIGH PASS
        // ----------------------------------------------------

        const newHighPass =
            ctx.createBiquadFilter();


        newHighPass.type =
            "highpass";


        newHighPass.frequency.value =
            42;


        newHighPass.Q.value =
            0.34;


        // ----------------------------------------------------
        // LOW PASS
        // ----------------------------------------------------

        const newLowPass =
            ctx.createBiquadFilter();


        newLowPass.type =
            "lowpass";


        newLowPass.frequency.value =
            5200;


        newLowPass.Q.value =
            0.35;


        // ----------------------------------------------------
        // REVERB
        // ----------------------------------------------------

        const newReverb =
            ctx.createConvolver();


        newReverb.buffer =
            createReverbBuffer(
                ctx,
                4.0,
                2.8
            );


        const newReverbGain =
            ctx.createGain();


        newReverbGain.gain.value =
            0.11;


        // ----------------------------------------------------
        // GRAPH
        // ----------------------------------------------------

        newHighPass
            .connect(
                newLowPass
            )
            .connect(
                newCompressor
            )
            .connect(
                newMaster
            );


        newCompressor.connect(
            newReverb
        );


        newReverb
            .connect(
                newReverbGain
            )
            .connect(
                newMaster
            );


        newMaster
            .connect(
                newOutput
            );


        newOutput.connect(
            ctx.destination
        );


        // ====================================================
        // BASS
        // ====================================================

        const newBassOsc =
            ctx.createOscillator();


        const newBassGain =
            ctx.createGain();


        newBassOsc.type =
            "sine";


        newBassGain.gain.value =
            0.0001;


        newBassOsc
            .connect(
                newBassGain
            )
            .connect(
                newHighPass
            );


        // ====================================================
        // MID BASS
        // ====================================================

        const newMidBassOsc =
            ctx.createOscillator();


        const newMidBassGain =
            ctx.createGain();


        newMidBassOsc.type =
            "triangle";


        newMidBassGain.gain.value =
            0.0001;


        newMidBassOsc
            .connect(
                newMidBassGain
            )
            .connect(
                newHighPass
            );


        // ====================================================
        // PAD
        // ====================================================

        const newPadOscA =
            ctx.createOscillator();


        const newPadOscB =
            ctx.createOscillator();


        const newPadGain =
            ctx.createGain();


        newPadOscA.type =
            "triangle";


        newPadOscB.type =
            "sine";


        newPadGain.gain.value =
            0.0001;


        newPadOscA
            .connect(
                newPadGain
            )
            .connect(
                newHighPass
            );


        newPadOscB
            .connect(
                newPadGain
            )
            .connect(
                newHighPass
            );


        // ====================================================
        // AIR
        // ====================================================

        const newAirOsc =
            ctx.createOscillator();


        const newAirGain =
            ctx.createGain();


        newAirOsc.type =
            "sine";


        newAirGain.gain.value =
            0.0001;


        newAirOsc
            .connect(
                newAirGain
            )
            .connect(
                newHighPass
            );


        // ====================================================
        // TEXTURE
        // ====================================================

        const noise =
            ctx.createBufferSource();


        noise.buffer =
            createNoiseBuffer(
                ctx
            );


        noise.loop =
            true;


        const noiseFilter =
            ctx.createBiquadFilter();


        noiseFilter.type =
            "bandpass";


        noiseFilter.frequency.value =
            1150;


        noiseFilter.Q.value =
            0.58;


        const newTextureGain =
            ctx.createGain();


        newTextureGain.gain.value =
            0.0001;


        noise
            .connect(
                noiseFilter
            )
            .connect(
                newTextureGain
            )
            .connect(
                newHighPass
            );


        // ====================================================
        // INITIAL HARMONIC STATE
        // ====================================================

        const root =
            circleOfFifths[
                circleIndex
            ].root;


        const now =
            ctx.currentTime;


        newBassOsc.frequency.value =
            root / 2;


        newMidBassOsc.frequency.value =
            root;


        newPadOscA.frequency.value =
            root;


        newPadOscB.frequency.value =
            root * 1.498;


        newAirOsc.frequency.value =
            root * 2;


        // ====================================================
        // START
        // ====================================================

        newBassOsc.start(now);

        newMidBassOsc.start(now);

        newPadOscA.start(now);

        newPadOscB.start(now);

        newAirOsc.start(now);

        noise.start(now);


        // ====================================================
        // ENTRY
        // ====================================================

        newMaster.gain
            .exponentialRampToValueAtTime(
                0.82,
                now + 4.5
            );


        newBassGain.gain
            .exponentialRampToValueAtTime(
                0.085,
                now + 3.5
            );


        newMidBassGain.gain
            .exponentialRampToValueAtTime(
                0.070,
                now + 3.8
            );


        newPadGain.gain
            .exponentialRampToValueAtTime(
                0.050,
                now + 4.5
            );


        newAirGain.gain
            .exponentialRampToValueAtTime(
                0.013,
                now + 5.5
            );


        newTextureGain.gain
            .exponentialRampToValueAtTime(
                0.004,
                now + 6.5
            );


        // ====================================================
        // EXPOSE
        // ====================================================

        audio =
            ctx;


        master =
            newMaster;


        output =
            newOutput;


        compressor =
            newCompressor;


        highPass =
            newHighPass;


        lowPass =
            newLowPass;


        reverb =
            newReverb;


        reverbGain =
            newReverbGain;


        bassOsc =
            newBassOsc;


        bassGain =
            newBassGain;


        midBassOsc =
            newMidBassOsc;


        midBassGain =
            newMidBassGain;


        padOscA =
            newPadOscA;


        padOscB =
            newPadOscB;


        padGain =
            newPadGain;


        airOsc =
            newAirOsc;


        airGain =
            newAirGain;


        textureSource =
            noise;


        textureGain =
            newTextureGain;


        nextCompositionTime =
            now +
            3.5;


        nextTextureTime =
            now +
            6.0;


        console.log(
            "[AUDIO] started",
            {
                state:
                    audio.state,

                sampleRate:
                    audio.sampleRate,

                output:
                    output.gain.value
            }
        );


        // Únicament el llindar d'entrada.
        playEntryResonance();

    }
    catch (error) {

        console.error(
            "Audio initialization failed:",
            error
        );


        try {

            await ctx.close();

        }
        catch (_) {}

    }


    audioStarting =
        false;

}


// ============================================================
// ENTRY RESONANCE
// ============================================================

function playEntryResonance() {

    if (
        !audio ||
        !lowPass
    ) {

        return;

    }


    const now =
        audio.currentTime;


    const oscillator =
        audio.createOscillator();


    const gain =
        audio.createGain();


    const filter =
        audio.createBiquadFilter();


    oscillator.type =
        "sine";


    oscillator.frequency.value =
        110;


    filter.type =
        "lowpass";


    filter.frequency.value =
        780;


    filter.Q.value =
        0.6;


    gain.gain.setValueAtTime(
        0.0001,
        now
    );


    gain.gain
        .exponentialRampToValueAtTime(
            0.045,
            now + 0.18
        );


    gain.gain
        .exponentialRampToValueAtTime(
            0.0001,
            now + 1.7
        );


    oscillator
        .connect(
            filter
        )
        .connect(
            gain
        )
        .connect(
            lowPass
        );


    oscillator.start(
        now
    );


    oscillator.stop(
        now + 1.9
    );

}


// ============================================================
// SCALE
// ============================================================

function currentScale() {

    return mode ===
        "major"
        ? majorScale
        : minorScale;

}


// ============================================================
// FREQUENCY
// ============================================================

function frequencyFromDegree(
    degree,
    octave = 0
) {

    const scale =
        currentScale();


    const index =
        (
            degree %
            scale.length +
            scale.length
        )
        %
        scale.length;


    const scaleOctave =
        Math.floor(
            degree /
            scale.length
        );


    const semitone =
        scale[index] +
        (
            scaleOctave +
            octave
        )
        *
        12;


    const root =
        circleOfFifths[
            circleIndex
        ].root;


    return (
        root *
        Math.pow(
            2,
            semitone /
            12
        )
    );

}


// ============================================================
// MODE
// ============================================================

function evaluateMode() {

    const distance =
        Math.min(
            Math.abs(
                circleIndex -
                previousCircleIndex
            ),
            12 -
            Math.abs(
                circleIndex -
                previousCircleIndex
            )
        );


    const minorPressure =
        harmonicTension *
        0.60
        +
        (
            musicalDegree === 2
                ? 0.15
                : 0
        )
        +
        (
            distance > 1
                ? 0.09
                : 0
        );


    const majorPressure =
        harmonicStability *
        0.44
        +
        (
            musicalDegree === 0
                ? 0.18
                : 0
        );


    if (
        minorPressure >
        majorPressure +
        0.10
    ) {

        mode =
            "minor";

    }
    else if (
        majorPressure >
        minorPressure +
        0.10
    ) {

        mode =
            "major";

    }

}


// ============================================================
// CIRCLE MOVEMENT
// ============================================================

function moveAroundCircle(
    direction
) {

    if (
        direction === 0
    ) {

        return;

    }


    const current =
        circleOfFifths[
            circleIndex
        ];


    const next =
        direction > 0
            ? current.up
            : current.down;


    if (
        next ===
        circleIndex
    ) {

        return;

    }


    previousCircleIndex =
        circleIndex;


    circleIndex =
        next;


    harmonicTension =
        Math.min(
            1,
            harmonicTension +
            0.12
        );


    harmonicStability =
        Math.max(
            0.20,
            harmonicStability -
            0.07
        );


    evaluateMode();


    if (
        Math.random() <
        0.60
    ) {

        triggerPhotonicBridge(
            "harmonic"
        );

    }

}


// ============================================================
// POINTER → MUSICAL STATE
// ============================================================

function updateMusicalPointer() {

    const speed =
        pointerVelocity;


    if (
        speed <
        0.012
    ) {

        directionConfidence *=
            0.968;


        musicalPerturbation *=
            0.986;


        return;

    }


    const direction =
        targetPointerX >
        0.055
            ? 1
            : targetPointerX <
                -0.055
                ? -1
                : 0;


    if (
        direction !==
        harmonicDirection
    ) {

        directionConfidence =
            0;

    }


    harmonicDirection =
        direction;


    directionConfidence +=
        speed *
        0.17;


    directionConfidence =
        Math.min(
            1,
            directionConfidence
        );


    musicalPerturbation =
        Math.min(
            1,
            musicalPerturbation +
            speed *
            0.14
        );


    const normalized =
        Math.max(
            0,
            Math.min(
                0.999,
                0.5 -
                targetPointerY
            )
        );


    musicalDegree =
        Math.floor(
            normalized *
            7
        );


    const now =
        performance.now()
        /
        1000;


    if (
        direction !== 0 &&
        directionConfidence >
        0.35 &&
        speed >
        0.035 &&
        now -
        lastHarmonicMove >
        6.5
    ) {

        moveAroundCircle(
            direction
        );


        lastHarmonicMove =
            now;


        directionConfidence =
            0;

    }


    harmonicTension +=
        speed *
        0.0035;


    harmonicTension *=
        0.9985;


    harmonicTension =
        Math.max(
            0.05,
            Math.min(
                0.96,
                harmonicTension
            )
        );


    harmonicStability =
        1 -
        harmonicTension *
        0.67;

}


// ============================================================
// PLAY NOTE
// ============================================================

function playNote(
    frequency,
    duration,
    velocity,
    waveform = "sine"
) {

    if (
        !audio ||
        audio.state !==
        "running"
        ||
        !lowPass
    ) {

        return;

    }


    const now =
        audio.currentTime;


    const oscillator =
        audio.createOscillator();


    const gain =
        audio.createGain();


    oscillator.type =
        waveform;


    oscillator.frequency
        .setValueAtTime(
            frequency,
            now
        );


    gain.gain.setValueAtTime(
        0.0001,
        now
    );


    const attack =
        Math.min(
            0.16,
            duration *
            0.20
        );


    gain.gain
        .exponentialRampToValueAtTime(
            Math.max(
                0.002,
                velocity
            ),
            now +
            attack
        );


    gain.gain
        .exponentialRampToValueAtTime(
            0.0001,
            now +
            duration
        );


    oscillator
        .connect(
            gain
        )
        .connect(
            lowPass
        );


    oscillator.start(
        now
    );


    oscillator.stop(
        now +
        duration +
        0.08
    );

}


// ============================================================
// SILENCE PROBABILITY
// ============================================================

function silenceProbability() {

    let probability =
        0.14;


    probability +=
        harmonicStability *
        0.13;


    probability +=
        (
            1 -
            musicalPerturbation
        )
        *
        0.10;


    if (
        phraseProgress >=
        phraseTarget -
        1
    ) {

        probability +=
            0.14;

    }


    if (
        compositionCycle %
        7 ===
        0
    ) {

        probability +=
            0.10;

    }


    return Math.min(
        probability,
        0.48
    );

}


// ============================================================
// NOTE DURATION
// ============================================================

function chooseNoteDuration() {

    const values = [

        0.58,
        0.82,
        1.12,
        1.55,
        2.10,
        3.00

    ];


    let duration =
        values[
            Math.floor(
                Math.random() *
                values.length
            )
        ];


    if (
        harmonicStability >
        0.82
    ) {

        duration *=
            1.28;

    }


    if (
        harmonicTension >
        0.74
    ) {

        duration *=
            0.72;

    }


    return duration;

}


// ============================================================
// MUSIC COHERENCE
// ============================================================

function coherenceForMusic() {

    return (
        harmonicStability *
        0.67
    )
    +
    (
        visualCoherence *
        0.13
    )
    +
    (
        1 -
        harmonicTension
    )
    *
    0.20;

}


// ============================================================
// COMPOSITION
// ============================================================

function generateMusicalEvent() {

    if (
        !audio ||
        audio.state !==
        "running"
    ) {

        return;

    }


    const now =
        audio.currentTime;


    if (
        now <
        silenceUntil
    ) {

        return;

    }


    if (
        Math.random() <
        silenceProbability()
    ) {

        enterSilence();

        return;

    }


    let degree;


    if (
        melodicMemory.length &&
        Math.random() <
        0.46
    ) {

        const remembered =
            melodicMemory[
                Math.floor(
                    Math.random() *
                    melodicMemory.length
                )
            ];


        const direction =
            Math.random() >
            0.5
                ? 1
                : -1;


        const step =
            Math.random() >
            0.76
                ? 2
                : 1;


        degree =
            remembered +
            direction *
            step;

    }
    else {

        degree =
            musicalDegree;

    }


    if (
        harmonicDirection !== 0 &&
        Math.random() <
        0.42
    ) {

        degree +=
            harmonicDirection;

    }


    let resolved =
        false;


    if (
        harmonicTension >
        0.74 &&
        Math.random() >
        0.43
    ) {

        degree =
            Math.random() >
            0.5
                ? 0
                : 4;


        harmonicTension *=
            0.50;


        harmonicStability =
            Math.min(
                0.94,
                harmonicStability +
                0.20
            );


        resolved =
            true;

    }


    degree =
        Math.max(
            -7,
            Math.min(
                14,
                degree
            )
        );


    let octave =
        0;


    if (
        harmonicTension >
        0.64
    ) {

        octave =
            Math.random() >
            0.55
                ? 1
                : 0;

    }


    if (
        coherenceForMusic() >
        0.84 &&
        Math.random() >
        0.80
    ) {

        octave =
            2;

    }


    const frequency =
        frequencyFromDegree(
            degree,
            octave
        );


    const duration =
        chooseNoteDuration();


    const velocity =
        0.085
        +
        harmonicStability *
        0.065
        +
        musicalPerturbation *
        0.028;


    const waveform =
        harmonicTension >
        0.58
            ? "triangle"
            : "sine";


    playNote(
        frequency,
        duration,
        velocity,
        waveform
    );


    melodicMemory.push(
        degree
    );


    if (
        melodicMemory.length >
        12
    ) {

        melodicMemory.shift();

    }


    musicalDegree =
        degree;


    compositionCycle++;
    phraseProgress++;


    // --------------------------------------------------------
    // UPPER VOICE
    // --------------------------------------------------------

    if (
        phraseProgress >=
        2
        &&
        Math.random() >
        0.32
    ) {

        playNote(
            frequency *
            (
                Math.random() >
                0.5
                    ? 2
                    : 4
            ),
            duration *
            0.68,
            velocity *
            0.40,
            "sine"
        );

    }


    // --------------------------------------------------------
    // LOW RESONANCE
    // --------------------------------------------------------

    if (
        harmonicStability >
        0.55
        &&
        Math.random() >
        0.54
    ) {

        playNote(
            frequency /
            2,
            duration *
            1.4,
            velocity *
            0.36,
            "sine"
        );

    }


    // --------------------------------------------------------
    // MUSICAL SYMBOL
    // --------------------------------------------------------

    if (
        harmonicStability >
        0.67
        &&
        Math.random() >
        0.46
    ) {

        showMusicalRelation();

    }


    // --------------------------------------------------------
    // PHRASE
    // --------------------------------------------------------

    if (
        phraseProgress >=
        phraseTarget
        ||
        resolved
    ) {

        phraseProgress =
            0;


        phraseTarget =
            2 +
            Math.floor(
                Math.random() *
                4
            );


        if (
            resolved
        ) {

            enterSilence(
                "resolution"
            );

        }
        else if (
            Math.random() >
            0.34
        ) {

            enterSilence();

        }


        if (
            resolved &&
            Math.random() >
            0.28
        ) {

            triggerPhotonicBridge(
                "resolution"
            );

        }

    }

}


// ============================================================
// COMPOSITION CLOCK
// ============================================================

function updateComposition() {

    if (
        !audio ||
        audio.state !==
        "running"
    ) {

        return;

    }


    const now =
        audio.currentTime;


    if (
        now <
        nextCompositionTime
    ) {

        return;

    }


    generateMusicalEvent();


    let interval =
        1.55 +
        Math.random() *
        2.85;


    interval *=
        0.83 +
        harmonicStability *
        0.43;


    if (
        harmonicTension >
        0.72
    ) {

        interval *=
            0.76;

    }


    if (
        silenceUntil >
        now
    ) {

        interval +=
            silenceUntil -
            now;

    }


    nextCompositionTime =
        now +
        interval;

}


// ============================================================
// AUDIO BODY
// ============================================================

function updateAudioBody() {

    if (
        !audio ||
        audio.state !==
        "running"
    ) {

        return;

    }


    const now =
        audio.currentTime;


    const root =
        circleOfFifths[
            circleIndex
        ].root;


    const chordRoot =
        frequencyFromDegree(
            musicalDegree,
            0
        );


    // --------------------------------------------------------
    // FREQUENCIES
    // --------------------------------------------------------

    const bassFrequency =
        root /
        (
            harmonicTension >
            0.72
                ? 1
                : 2
        );


    bassOsc.frequency
        .linearRampToValueAtTime(
            bassFrequency,
            now +
            1.5
        );


    midBassOsc.frequency
        .linearRampToValueAtTime(
            root,
            now +
            1.65
        );


    padOscA.frequency
        .linearRampToValueAtTime(
            chordRoot,
            now +
            1.9
        );


    padOscB.frequency
        .linearRampToValueAtTime(
            chordRoot *
            1.498,
            now +
            2.1
        );


    airOsc.frequency
        .linearRampToValueAtTime(
            chordRoot *
            (
                harmonicTension >
                0.55
                    ? 2
                    : 1.5
            ),
            now +
            2.6
        );


    // --------------------------------------------------------
    // RESPIRACIÓ
    // --------------------------------------------------------

    const a =
        0.5 +
        0.5 *
        Math.sin(
            now *
            0.13
        );


    const b =
        0.5 +
        0.5 *
        Math.sin(
            now *
            0.079 +
            1.8
        );


    const c =
        0.5 +
        0.5 *
        Math.sin(
            now *
            0.217 +
            3.4
        );


    const breath =
        a * 0.43 +
        b * 0.35 +
        c * 0.22;


    // --------------------------------------------------------
    // SILENCE FACTORS
    // --------------------------------------------------------

    const definition =
        currentSilence
            ? silenceTypes[
                currentSilence
            ]
            : null;


    const bodyFactor =
        definition
            ? definition.body
            : 1;


    const harmonyFactor =
        definition
            ? definition.harmony
            : 1;


    const airFactor =
        definition
            ? definition.air
            : 1;


    const textureFactor =
        definition
            ? definition.texture
            : 1;


    // --------------------------------------------------------
    // LEVELS
    // --------------------------------------------------------

    const bassLevel =
        (
            0.020 +
            breath *
            0.032
        )
        *
        bodyFactor;


    const midBassLevel =
        (
            0.015 +
            breath *
            0.024
        )
        *
        bodyFactor;


    const padLevel =
        (
            0.011 +
            breath *
            0.017
        )
        *
        harmonyFactor;


    const airLevel =
        (
            0.0015 +
            visualExcitation *
            0.006
        )
        *
        airFactor;


    const textureLevel =
        (
            0.0011 +
            visualExcitation *
            0.004
        )
        *
        textureFactor;


    bassGain.gain
        .linearRampToValueAtTime(
            bassLevel,
            now +
            1.2
        );


    midBassGain.gain
        .linearRampToValueAtTime(
            midBassLevel,
            now +
            1.3
        );


    padGain.gain
        .linearRampToValueAtTime(
            padLevel,
            now +
            1.6
        );


    airGain.gain
        .linearRampToValueAtTime(
            airLevel,
            now +
            1.9
        );


    textureGain.gain
        .linearRampToValueAtTime(
            textureLevel,
            now +
            1.5
        );


    // --------------------------------------------------------
    // FILTRE
    // --------------------------------------------------------

    const filterTarget =
        1050
        +
        harmonicStability *
        2050
        +
        visualExcitation *
        2600;


    lowPass.frequency
        .linearRampToValueAtTime(
            filterTarget,
            now +
            1.15
        );


    // --------------------------------------------------------
    // REVERB
    // --------------------------------------------------------

    if (
        reverbGain
    ) {

        reverbGain.gain
            .linearRampToValueAtTime(
                0.075
                +
                harmonicStability *
                0.065
                +
                visualExcitation *
                0.035,
                now +
                1.5
            );

    }

}


// ============================================================
// TEXTURE EVENTS
// ============================================================

function updateTextureEvents() {

    if (
        !audio ||
        audio.state !==
        "running"
    ) {

        return;

    }


    const now =
        audio.currentTime;


    if (
        now <
        nextTextureTime
    ) {

        return;

    }


    const definition =
        currentSilence
            ? silenceTypes[
                currentSilence
            ]
            : null;


    if (
        definition &&
        definition.texture ===
        0
    ) {

        nextTextureTime =
            now +
            3.5;

        return;

    }


    const scale =
        currentScale();


    const degree =
        Math.floor(
            Math.random() *
            7
        );


    const octave =
        2 +
        Math.floor(
            Math.random() *
            3
        );


    const frequency =
        circleOfFifths[
            circleIndex
        ].root
        *
        Math.pow(
            2,
            (
                scale[degree] +
                octave *
                12
            )
            /
            12
        );


    const oscillator =
        audio.createOscillator();


    const gain =
        audio.createGain();


    const filter =
        audio.createBiquadFilter();


    oscillator.type =
        Math.random() >
        0.72
            ? "triangle"
            : "sine";


    oscillator.frequency.value =
        frequency;


    filter.type =
        "bandpass";


    filter.frequency.value =
        Math.min(
            frequency,
            5500
        );


    filter.Q.value =
        2.8;


    const duration =
        1.3 +
        Math.random() *
        3.6;


    gain.gain
        .setValueAtTime(
            0.0001,
            now
        );


    gain.gain
        .exponentialRampToValueAtTime(
            0.015,
            now +
            0.68
        );


    gain.gain
        .exponentialRampToValueAtTime(
            0.0001,
            now +
            duration
        );


    oscillator
        .connect(
            filter
        )
        .connect(
            gain
        )
        .connect(
            lowPass
        );


    oscillator.start(
        now
    );


    oscillator.stop(
        now +
        duration +
        0.1
    );


    nextTextureTime =
        now +
        3.5 +
        Math.random() *
        6.0;

}


// ============================================================
// PHOTONIC BRIDGE
// ============================================================

function triggerPhotonicBridge(
    reason = "harmonic"
) {

    let probability =
        0.52;


    if (
        reason ===
        "resolution"
    ) {

        probability =
            0.74;

    }


    if (
        Math.random() >
        probability
    ) {

        return;

    }


    const baseAngle =
        (
            circleIndex /
            12
        )
        *
        Math.PI *
        2;


    const angle =
        baseAngle +
        (
            Math.random() -
            0.5
        )
        *
        2.5;


    const radius =
        0.16 +
        Math.random() *
        0.56;


    let x =
        Math.cos(angle) *
        radius;


    let y =
        Math.sin(angle) *
        radius;


    if (
        Math.hypot(
            x -
            targetPointerX,
            y -
            targetPointerY
        )
        <
        0.28
    ) {

        x *=
            -1;

        y *=
            -1;

    }


    photonTargetX =
        x;


    photonTargetY =
        y;


    photonEnergy =
        reason ===
        "resolution"
            ? 0.56 +
              Math.random() *
              0.40
            : 0.32 +
              Math.random() *
              0.46;


    photonClock =
        0;


    activateResonance();


    if (
        Math.random() >
        0.18
    ) {

        showFormula(
            reason ===
            "resolution"
                ? "Δφ → interferència"
                : "E = hν"
        );

    }


    if (
        Math.random() >
        0.32
    ) {

        showMusicalRelation();

    }

}


// ============================================================
// AUTONOMOUS PHOTON
// ============================================================

function triggerAutonomousPhoton() {

    const angle =
        Math.random()
        *
        Math.PI *
        2;


    const radius =
        0.20 +
        Math.random() *
        0.50;


    let x =
        Math.cos(angle) *
        radius;


    let y =
        Math.sin(angle) *
        radius;


    if (
        Math.hypot(
            x -
            targetPointerX,
            y -
            targetPointerY
        )
        <
        0.28
    ) {

        x *=
            -1;

        y *=
            -1;

    }


    photonTargetX =
        x;


    photonTargetY =
        y;


    photonEnergy =
        0.11 +
        Math.random() *
        0.24;


    photonClock =
        0;

}


// ============================================================
// PHOTON UPDATE
// ============================================================

function updatePhoton(dt) {

    photonClock +=
        dt;


    photonX +=
        (
            photonTargetX -
            photonX
        )
        *
        Math.min(
            1,
            dt *
            0.68
        );


    photonY +=
        (
            photonTargetY -
            photonY
        )
        *
        Math.min(
            1,
            dt *
            0.68
        );


    const drift =
        photonClock *
        0.17;


    photonX +=
        Math.sin(
            drift
        )
        *
        dt *
        0.013;


    photonY +=
        Math.cos(
            drift *
            0.71
        )
        *
        dt *
        0.009;


    photonEnergy *=
        Math.pow(
            0.985,
            dt *
            60
        );


    photonEnergy =
        Math.max(
            0.018,
            photonEnergy
        );


    if (
        photonClock >
        16 +
        Math.random() *
        20
    ) {

        photonClock =
            0;


        if (
            Math.random() >
            0.42
        ) {

            triggerAutonomousPhoton();

        }

    }

}


// ============================================================
// VISUAL STATE
// ============================================================

function updateVisualState(
    elapsed
) {

    const a =
        0.5 +
        0.5 *
        Math.sin(
            elapsed *
            0.081
        );


    const b =
        0.5 +
        0.5 *
        Math.sin(
            elapsed *
            0.169 +
            1.4
        );


    const c =
        0.5 +
        0.5 *
        Math.sin(
            elapsed *
            0.287 +
            4.1
        );


    const density =
        a * 0.46 +
        b * 0.35 +
        c * 0.19;


    const excitation =
        0.08 +
        (
            0.5 +
            0.5 *
            Math.sin(
                elapsed *
                0.129
            )
        )
        *
        0.31;


    const coherence =
        0.55 +
        0.34 *
        (
            0.5 +
            0.5 *
            Math.sin(
                elapsed *
                0.044 +
                2.2
            )
        );


    visualTransition =
        Math.abs(
            density -
            visualDensity
        );


    visualDensity =
        density;


    visualExcitation =
        excitation;


    visualCoherence =
        coherence;


    visualPhase +=
        0.0018 +
        excitation *
        0.0032;


    if (
        visualTransition >
        0.048 &&
        Math.random() >
        0.997
    ) {

        triggerAutonomousPhoton();

    }

}


// ============================================================
// FORMULES
// ============================================================

const formulas = [

    "∇ρ ≠ 0",
    "Δφ",
    "E = hν",
    "ΔE · Δt ≳ ħ / 2",
    "ψ → |ψ|²",
    "k = 2π / λ",
    "∂ρ / ∂t ≠ 0",
    "∇ · J + ∂ρ / ∂t = 0",
    "Δx · Δp ≳ ħ / 2",
    "φ(t + T) ≈ φ(t)",
    "∇²ψ",
    "iℏ ∂ψ / ∂t = Ĥψ"

];


const musicalRelations = [

    "3 : 2",
    "5 : 4",
    "2 : 1",
    "6 : 5",
    "9 : 8",
    "3 : 2 : 4",
    "2ⁿ⁄¹²",
    "f₂ / f₁",
    "Δf",
    "φ₁ → φ₂"

];


let lastFormulaTime =
    -Infinity;


let lastNotationTime =
    -Infinity;


// ============================================================
// FORMULA
// ============================================================

function showFormula(
    preferred = null
) {

    const now =
        performance.now()
        /
        1000;


    if (
        now -
        lastFormulaTime <
        5.8
    ) {

        return;

    }


    lastFormulaTime =
        now;


    const element =
        document.getElementById(
            "formula"
        );


    if (!element) {

        return;

    }


    element.textContent =
        preferred ||
        formulas[
            Math.floor(
                Math.random() *
                formulas.length
            )
        ];


    element.style.left =
        `${7 + Math.random() * 84}%`;


    element.style.top =
        `${9 + Math.random() * 82}%`;


    const scale =
        0.75 +
        Math.random() *
        0.72;


    const rotation =
        -4 +
        Math.random() *
        8;


    element.style.transform =
        `
        translate(-50%, -50%)
        rotate(${rotation}deg)
        scale(${scale})
        `;


    element.classList.remove(
        "visible"
    );


    void element.offsetWidth;


    element.classList.add(
        "visible"
    );


    setTimeout(
        () => {

            element.classList.remove(
                "visible"
            );

        },
        3500 +
        Math.random() *
        2200
    );

}


// ============================================================
// MUSICAL RELATION
// ============================================================

function showMusicalRelation(
    preferred = null
) {

    const now =
        performance.now()
        /
        1000;


    if (
        now -
        lastNotationTime <
        6.0
    ) {

        return;

    }


    lastNotationTime =
        now;


    const element =
        document.getElementById(
            "notation"
        );


    if (!element) {

        return;

    }


    element.textContent =
        preferred ||
        musicalRelations[
            Math.floor(
                Math.random() *
                musicalRelations.length
            )
        ];


    element.style.left =
        `${7 + Math.random() * 84}%`;


    element.style.top =
        `${10 + Math.random() * 80}%`;


    const scale =
        0.74 +
        Math.random() *
        0.70;


    const rotation =
        -5 +
        Math.random() *
        10;


    element.style.transform =
        `
        translate(-50%, -50%)
        rotate(${rotation}deg)
        scale(${scale})
        `;


    element.classList.remove(
        "visible"
    );


    void element.offsetWidth;


    element.classList.add(
        "visible"
    );


    setTimeout(
        () => {

            element.classList.remove(
                "visible"
            );

        },
        2800 +
        Math.random() *
        1900
    );

}


// ============================================================
// RESONANCE DOM
// ============================================================

let resonanceTimeout =
    null;


function activateResonance() {

    const element =
        document.getElementById(
            "resonance"
        );


    if (!element) {

        return;

    }


    element.style.setProperty(
        "--resonance-x",
        `${8 + Math.random() * 84}%`
    );


    element.style.setProperty(
        "--resonance-y",
        `${8 + Math.random() * 84}%`
    );


    element.classList.remove(
        "active"
    );


    void element.offsetWidth;


    element.classList.add(
        "active"
    );


    clearTimeout(
        resonanceTimeout
    );


    resonanceTimeout =
        setTimeout(
            () => {

                element.classList.remove(
                    "active"
                );

            },
            2900
        );

}


// ============================================================
// POINTER
// ============================================================

window.addEventListener(
    "pointermove",
    event => {

        const width =
            window.innerWidth;


        const height =
            window.innerHeight;


        const aspect =
            width /
            height;


        targetPointerX =
            (
                event.clientX /
                width -
                0.5
            )
            *
            aspect;


        targetPointerY =
            0.5 -
            event.clientY /
            height;


        const dx =
            event.clientX -
            previousPointerX;


        const dy =
            event.clientY -
            previousPointerY;


        pointerVelocity =
            Math.min(
                1,
                Math.hypot(
                    dx,
                    dy
                ) /
                100
            );


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
// FIRST GESTURE
//
// Únicament activa Web Audio.
// No és un esdeveniment musical.
// ============================================================

window.addEventListener(
    "pointerdown",
    () => {

        startAudio();


        const threshold =
            document.getElementById(
                "threshold"
            );


        if (threshold) {

            threshold.classList.add(
                "hidden"
            );

        }

    },
    {
        once: true,
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


    canvas.width =
        window.innerWidth *
        dpr;


    canvas.height =
        window.innerHeight *
        dpr;


    gl.viewport(
        0,
        0,
        canvas.width,
        canvas.height
    );


    gl.uniform2f(
        uResolution,
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
// RENDER
// ============================================================

const startTime =
    performance.now();


let previousFrame =
    startTime;


function render(now) {

    const elapsed =
        (
            now -
            startTime
        )
        /
        1000;


    const dt =
        Math.min(
            0.05,
            (
                now -
                previousFrame
            )
            /
            1000
        );


    previousFrame =
        now;


    // --------------------------------------------------------
    // VISUAL
    // --------------------------------------------------------

    updateVisualState(
        elapsed
    );


    updatePhoton(
        dt
    );


    // --------------------------------------------------------
    // MUSICAL
    // --------------------------------------------------------

    updateMusicalPointer();

    updateComposition();

    updateTextureEvents();

    updateAudioBody();


    // --------------------------------------------------------
    // POINTER INERTIA
    // --------------------------------------------------------

    pointerX +=
        (
            targetPointerX -
            pointerX
        )
        *
        0.042;


    pointerY +=
        (
            targetPointerY -
            pointerY
        )
        *
        0.042;


    pointerVelocity *=
        0.94;


    musicalPerturbation *=
        0.992;


    // --------------------------------------------------------
    // SHADER
    // --------------------------------------------------------

    gl.uniform1f(
        uTime,
        elapsed
    );


    gl.uniform2f(
        uDisturbance,
        pointerX,
        pointerY
    );


    gl.uniform1f(
        uDisturbanceEnergy,
        musicalPerturbation
    );


    gl.uniform1f(
        uCoherence,
        visualCoherence
    );


    gl.uniform1f(
        uExcitation,
        visualExcitation
    );


    gl.uniform2f(
        uPhoton,
        photonX,
        photonY
    );


    gl.uniform1f(
        uPhotonEnergy,
        photonEnergy
    );


    gl.uniform1f(
        uPhase,
        visualPhase
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


// ============================================================
// FIRST FORMULA
// ============================================================

setTimeout(
    () => {

        showFormula(
            "∂ρ / ∂t"
        );

    },
    5200
);


// ============================================================
// PHENOMENOLOGY CLOCK
// ============================================================

setInterval(
    () => {

        const r =
            Math.random();


        if (
            r >
            0.20
        ) {

            showFormula();

        }


        if (
            r <
            0.72
        ) {

            showMusicalRelation();

        }

    },
    8500
);


// ============================================================
// AUDIO DIAGNOSTIC
// ============================================================

function audioStatus() {

    if (!audio) {

        console.log(
            "[AUDIO] context absent"
        );

        return;

    }


    console.log(
        "[AUDIO]",
        {
            state:
                audio.state,

            currentTime:
                audio.currentTime
                    .toFixed(2),

            master:
                master?.gain.value
                    ?.toFixed(4),

            output:
                output?.gain.value
                    ?.toFixed(4),

            bass:
                bassGain?.gain.value
                    ?.toFixed(4),

            midBass:
                midBassGain?.gain.value
                    ?.toFixed(4),

            pad:
                padGain?.gain.value
                    ?.toFixed(4),

            air:
                airGain?.gain.value
                    ?.toFixed(4),

            silence:
                currentSilence

        }
    );

}


setInterval(
    audioStatus,
    4000
);