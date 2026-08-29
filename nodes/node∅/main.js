
// ============================================================
// ZERO INFINIT — nodeN
//
// MATÈRIA → ESDEVENIMENT → ONA → DISPERSIÓ → MÚSICA
//
// El camp existeix abans que l'observador.
// El punter no observa una partícula concreta.
// El moviment introdueix esdeveniments en el camp.
//
// Cada gest pot produir:
//   · una ona local
//   · una multiplicació temporal de la matèria
//   · una dispersió de partícules
//   · un esdeveniment sonor
//
// L'àudio s'activa amb el primer clic.
// El moviment només és actiu dins del canvas.
// Sense llibreries externes.
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
// SHADERS
// ============================================================

const vertexShaderSource = `
attribute vec2 position;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
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
// HASH / NOISE
// ============================================================

float hash(vec2 p) {

    return fract(
        sin(
            dot(
                p,
                vec2(127.1, 311.7)
            )
        ) *
        43758.5453
    );
}


float hash1(float n) {

    return fract(
        sin(n * 127.1) *
        43758.5453
    );
}


float noise(vec2 p) {

    vec2 i = floor(p);
    vec2 f = fract(p);

    f =
        f *
        f *
        (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(
        mix(a, b, f.x),
        mix(c, d, f.x),
        f.y
    );
}


float fbm(vec2 p) {

    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 6; i++) {

        value +=
            amplitude *
            noise(p);

        p *= 2.0;
        amplitude *= 0.5;
    }

    return value;
}


// ============================================================
// ORGANIC FLOW
// ============================================================

vec2 flowField(vec2 p) {

    float e = 0.003;

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
            vec2(e, 0.0)
        );

    float ny =
        fbm(
            p * 2.4 +
            drift +
            vec2(0.0, e)
        );

    vec2 gradient =
        vec2(
            nx - n,
            ny - n
        ) / e;

    return vec2(
        -gradient.y,
        gradient.x
    );
}


// ============================================================
// MAIN
// ============================================================

void main() {

    vec2 uv =
        gl_FragCoord.xy /
        resolution.xy;

    float aspect =
        resolution.x /
        resolution.y;

    vec2 p =
        uv - 0.5;

    p.x *= aspect;


    // --------------------------------------------------------
    // BASE MATTER
    // --------------------------------------------------------

    vec2 flow =
        flowField(p);

    vec2 field =
        p +
        flow * 0.075;

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
        ) *
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
            0.27,
            0.76,
            matter
        );


    // --------------------------------------------------------
    // EVENT FIELD
    //
    // Cada esdeveniment és una petita pertorbació.
    // Les ones s'expandeixen i desapareixen.
    // --------------------------------------------------------

    float waveField = 0.0;
    float eventMatter = 0.0;
    float eventScatter = 0.0;
    float eventGlow = 0.0;


    for (int i = 0; i < MAX_EVENTS; i++) {

        float age =
            time -
            eventTime[i];

        if (age > 0.0 && age < 8.0) {

            vec2 delta =
                p -
                eventPosition[i];

            float distance =
                length(delta);

            float strength =
                eventStrength[i];

            float size =
                eventSize[i];

            // --------------------------------------------
            // ONA EXPANSIVA
            // --------------------------------------------

            float radius =
                age *
                (
                    0.10 +
                    size * 0.075
                );

            float width =
                0.012 +
                size * 0.012;

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
                    -age * 0.72
                );

            wave *=
                strength *
                fade;

            waveField +=
                wave;


            // --------------------------------------------
            // CENTRE DE L'ESDEVENIMENT
            // --------------------------------------------

            float centre =
                1.0 -
                smoothstep(
                    size * 0.18,
                    size,
                    distance
                );

            eventMatter +=
                centre *
                strength *
                exp(-age * 1.5);


            // --------------------------------------------
            // DISPERSIÓ
            //
            // L'ona arrossega la matèria cap enfora.
            // --------------------------------------------

            float scatter =
                smoothstep(
                    size * 1.8,
                    0.0,
                    distance
                );

            scatter *=
                strength *
                exp(-age * 0.95);

            eventScatter +=
                scatter;


            // --------------------------------------------
            // HALO
            // --------------------------------------------

            eventGlow +=
                centre *
                strength *
                exp(-age * 0.9);
        }
    }


    // --------------------------------------------------------
    // MATTER MULTIPLICATION
    // --------------------------------------------------------

    float multiplication =
        eventMatter *
        (
            0.25 +
            0.75 * waveField
        );

    matter +=
        multiplication *
        0.38;

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
                flow * eventScatter * 0.15
            ) *
            (
                3.0 +
                eventScatter * 2.8
            ) +
            vec2(
                time * 0.05,
                -time * 0.031
            )
        );

    fractal =
        smoothstep(
            0.38,
            0.78,
            fractal
        );


    // --------------------------------------------------------
    // PARTICLE FIELD
    // --------------------------------------------------------

    vec2 particleSpace =
        field *
        (
            105.0 +
            eventScatter * 34.0
        );

    vec2 cell =
        floor(
            particleSpace
        );

    vec2 local =
        fract(
            particleSpace
        ) -
        0.5;

    float randomCell =
        hash(cell);

    float particleRadius =
        0.028 +
        randomCell * 0.035;

    float particle =
        smoothstep(
            particleRadius,
            0.0,
            length(local)
        );


    // Només una petita fracció de les cel·les conté partícules.
    particle *=
        step(
            0.995,
            randomCell
        );


    // Pulsació temporal subtil.
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


    // La matèria alimenta les partícules.
    particle *=
        0.15 +
        matter * 1.65;


    // Els esdeveniments fan aparèixer partícules addicionals.
    float eventParticles =
        eventScatter *
        (
            0.3 +
            0.7 *
            fractal
        );


    particle +=
        eventParticles *
        step(
            0.997,
            hash(
                cell +
                vec2(
                    eventScatter * 7.0
                )
            )
        ) *
        0.75;


    // --------------------------------------------------------
    // DUST / WAVE FILAMENTS
    // --------------------------------------------------------

    float filament =
        sin(
            length(p) *
            (
                25.0 +
                eventScatter * 38.0
            )
            -
            time * 0.65
        );

    filament =
        0.5 +
        0.5 * filament;

    filament =
        smoothstep(
            0.76,
            0.96,
            filament
        );

    filament *=
        eventScatter *
        0.30;


    // --------------------------------------------------------
    // CENTRAL VOID
    //
    // Manté una zona de profunditat, però ja no és una lent.
    // --------------------------------------------------------

    float r =
        length(p);

    float voidMask =
        smoothstep(
            0.12,
            0.025,
            r
        );

    matter *=
        1.0 -
        voidMask * 0.88;

    particle *=
        1.0 -
        voidMask * 0.82;


    // --------------------------------------------------------
    // COLOR
    //
    // Blau profund → lila → violeta → rosa → blau clar
    // --------------------------------------------------------

    vec3 color =
        vec3(
            0.002,
            0.003,
            0.012
        );


    vec3 deepBlue =
        vec3(
            0.025,
            0.035,
            0.15
        );


    vec3 violet =
        vec3(
            0.24,
            0.075,
            0.48
        );


    vec3 lilac =
        vec3(
            0.52,
            0.30,
            0.82
        );


    vec3 pink =
        vec3(
            0.92,
            0.30,
            0.70
        );


    vec3 cyan =
        vec3(
            0.45,
            0.78,
            1.0
        );


    // Massa base.
    color +=
        deepBlue *
        matter *
        1.55;

    color +=
        violet *
        matter *
        matter *
        1.20;


    // Fractal.
    color +=
        lilac *
        fractal *
        0.22;


    // Ones.
    color +=
        cyan *
        waveField *
        0.65;


    // Multiplicació de matèria.
    color +=
        pink *
        eventMatter *
        0.35;


    // Partícules.
    color +=
        lilac *
        particle *
        1.15;


    // Filaments.
    color +=
        cyan *
        filament *
        0.55;


    // Halo d'esdeveniment.
    color +=
        pink *
        eventGlow *
        0.16;


    // --------------------------------------------------------
    // CINEMATIC BLOOM
    // --------------------------------------------------------

    float cinematic =
        smoothstep(
            1.55,
            0.25,
            r
        );

    color *=
        cinematic;


    // Lleugera separació de llum.
    color +=
        cyan *
        eventGlow *
        0.045;


    color =
        pow(
            color,
            vec3(0.92)
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

function compileShader(type, source) {

    const shader =
        gl.createShader(type);

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
            gl.getShaderInfoLog(shader)
        );

        throw new Error(
            "Zero Infinit: shader compilation failed"
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
        "Zero Infinit: WebGL link failed"
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

const MAX_EVENTS = 20;

const events = [];

let eventCursor = 0;


function createEvent(
    x,
    y,
    strength,
    size
) {

    const event = {

        x,
        y,

        time: 0,

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
        ) %
        MAX_EVENTS;


    return event;
}


function eventPositionFromPointer(
    event
) {

    const rect =
        canvas.getBoundingClientRect();

    const x =
        (
            event.clientX -
            rect.left
        ) /
        rect.width;

    const y =
        (
            event.clientY -
            rect.top
        ) /
        rect.height;


    const aspect =
        rect.width /
        rect.height;


    return {

        x:
            (
                x - 0.5
            ) *
            aspect,

        y:
            0.5 - y
    };
}


// ============================================================
// POINTER STATE
// ============================================================

let pointerInside = false;

let pointerActive = false;

let pointerX = 0;
let pointerY = 0;

let previousPointerX = 0;
let previousPointerY = 0;

let pointerSpeed = 0;

let movementAccumulator = 0;

let lastEventTime = 0;


// ============================================================
// AUDIO STATE
// ============================================================

let audio = null;

let audioStarted = false;

let master = null;

let compressor = null;

let ambienceFilter = null;

let ambienceGain = null;

let pulseGain = null;

let melodyGain = null;

let noiseGain = null;

let droneOsc = null;

let droneGain = null;

let ambienceOsc = null;

let ambienceOscGain = null;

let audioEventCooldown = 0;


// ============================================================
// TONAL SYSTEM
// ============================================================

const tonalCenters = [

    {
        name: "A minor",
        root: 220.00,
        scale: [0, 2, 3, 5, 7, 8, 10]
    },

    {
        name: "C major",
        root: 261.63,
        scale: [0, 2, 4, 5, 7, 9, 11]
    },

    {
        name: "E minor",
        root: 164.81,
        scale: [0, 2, 3, 5, 7, 8, 10]
    },

    {
        name: "D major",
        root: 293.66,
        scale: [0, 2, 4, 5, 7, 9, 11]
    },

    {
        name: "F# minor",
        root: 185.00,
        scale: [0, 2, 3, 5, 7, 9, 10]
    }
];


let tonalIndex = 0;

let tonalPressure = 0;

let lastTonalChange = 0;


// ============================================================
// SCALE NOTE
// ============================================================

function getFractalFrequency(
    intensity = 0.5
) {

    const tonal =
        tonalCenters[
            tonalIndex
        ];

    const scale =
        tonal.scale;


    const degree =
        Math.floor(
            Math.random() *
            scale.length
        );


    const octave =
        intensity > 0.72
            ? (
                Math.random() > 0.55
                    ? 2
                    : 1
            )
            : 1;


    const semitone =
        scale[degree] +
        octave * 12;


    return (
        tonal.root *
        Math.pow(
            2,
            semitone / 12
        )
    );
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

            await audio.resume();
        }

        return;
    }


    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;


    if (!AudioContext) {

        console.warn(
            "Web Audio API no disponible"
        );

        return;
    }


    try {

        audio =
            new AudioContext();

        await audio.resume();

    } catch (error) {

        console.warn(
            "Zero Infinit audio:",
            error
        );

        audio = null;

        return;
    }


    // --------------------------------------------------------
    // MASTER
    // --------------------------------------------------------

    master =
        audio.createGain();

    master.gain.value =
        0.0001;


    // --------------------------------------------------------
    // COMPRESSOR
    // --------------------------------------------------------

    compressor =
        audio.createDynamicsCompressor();

    compressor.threshold.value =
        -24;

    compressor.knee.value =
        18;

    compressor.ratio.value =
        2.2;

    compressor.attack.value =
        0.015;

    compressor.release.value =
        0.35;


    // --------------------------------------------------------
    // AMBIENCE FILTER
    // --------------------------------------------------------

    ambienceFilter =
        audio.createBiquadFilter();

    ambienceFilter.type =
        "lowpass";

    ambienceFilter.frequency.value =
        1250;

    ambienceFilter.Q.value =
        0.35;


    // --------------------------------------------------------
    // AMBIENCE
    // --------------------------------------------------------

    ambienceGain =
        audio.createGain();

    ambienceGain.gain.value =
        0.035;


    // --------------------------------------------------------
    // DRONE
    // --------------------------------------------------------

    droneOsc =
        audio.createOscillator();

    droneOsc.type =
        "sine";

    droneOsc.frequency.value =
        tonalCenters[
            tonalIndex
        ].root / 2;


    droneGain =
        audio.createGain();

    droneGain.gain.value =
        0.028;


    droneOsc
        .connect(droneGain)
        .connect(ambienceFilter);


    // --------------------------------------------------------
    // SECOND AMBIENT OSCILLATOR
    // --------------------------------------------------------

    ambienceOsc =
        audio.createOscillator();

    ambienceOsc.type =
        "triangle";

    ambienceOsc.frequency.value =
        tonalCenters[
            tonalIndex
        ].root;


    ambienceOscGain =
        audio.createGain();

    ambienceOscGain.gain.value =
        0.006;


    ambienceOsc
        .connect(ambienceOscGain)
        .connect(ambienceFilter);


    // --------------------------------------------------------
    // EVENT BUS
    // --------------------------------------------------------

    pulseGain =
        audio.createGain();

    pulseGain.gain.value =
        0.0;


    melodyGain =
        audio.createGain();

    melodyGain.gain.value =
        0.65;


    noiseGain =
        audio.createGain();

    noiseGain.gain.value =
        0.018;


    // --------------------------------------------------------
    // ROUTING
    // --------------------------------------------------------

    ambienceFilter
        .connect(ambienceGain)
        .connect(compressor);


    pulseGain.connect(
        compressor
    );

    melodyGain.connect(
        compressor
    );

    noiseGain.connect(
        compressor
    );


    compressor.connect(
        master
    );


    master.connect(
        audio.destination
    );


    // --------------------------------------------------------
    // START
    // --------------------------------------------------------

    const now =
        audio.currentTime;


    droneOsc.start(now);

    ambienceOsc.start(now);


    master.gain.setValueAtTime(
        0.0001,
        now
    );


    master.gain.exponentialRampToValueAtTime(
        0.055,
        now + 4
    );


    audioStarted = true;
}


// ============================================================
// AUDIO EVENT
//
// Cada esdeveniment visual pot convertir-se en:
// · un atac curt
// · una nota
// · una petita component inharmònica
//
// No hi ha un loop musical obligatori.
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


    const now =
        audio.currentTime;


    const frequency =
        getFractalFrequency(
            strength
        );


    // --------------------------------------------------------
    // MAIN PULSE
    // --------------------------------------------------------

    const osc =
        audio.createOscillator();

    const gain =
        audio.createGain();


    osc.type =
        strength > 0.72
            ? "triangle"
            : "sine";


    osc.frequency.setValueAtTime(
        frequency,
        now
    );


    osc.detune.setValueAtTime(
        (
            Math.random() - 0.5
        ) *
        (
            8 +
            speed * 14
        ),
        now
    );


    const attack =
        0.015 +
        Math.random() * 0.035;


    const duration =
        0.55 +
        strength * 1.35 +
        Math.random() * 0.8;


    const level =
        0.010 +
        strength * 0.026;


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


    osc
        .connect(gain)
        .connect(melodyGain);


    osc.start(now);

    osc.stop(
        now +
        duration +
        0.08
    );


    // --------------------------------------------------------
    // LOWER ATOMIC IMPULSE
    // --------------------------------------------------------

    if (
        strength > 0.55
    ) {

        const subOsc =
            audio.createOscillator();

        const subGain =
            audio.createGain();


        subOsc.type =
            "sine";


        subOsc.frequency.setValueAtTime(
            frequency * 0.5,
            now
        );


        subGain.gain.setValueAtTime(
            0.0001,
            now
        );


        subGain.gain.exponentialRampToValueAtTime(
            0.008 +
            strength * 0.012,
            now + 0.025
        );


        subGain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 0.9
        );


        subOsc
            .connect(subGain)
            .connect(pulseGain);


        subOsc.start(now);

        subOsc.stop(
            now + 1.0
        );
    }


    // --------------------------------------------------------
    // SMALL AIR COMPONENT
    // --------------------------------------------------------

    if (
        speed > 0.35
    ) {

        const air =
            audio.createOscillator();

        const airGain =
            audio.createGain();


        air.type =
            "sine";


        air.frequency.setValueAtTime(
            frequency * 2,
            now
        );


        airGain.gain.setValueAtTime(
            0.0001,
            now
        );


        airGain.gain.exponentialRampToValueAtTime(
            0.002 +
            speed * 0.004,
            now + 0.025
        );


        airGain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 0.35
        );


        air
            .connect(airGain)
            .connect(noiseGain);


        air.start(now);

        air.stop(
            now + 0.4
        );
    }
}


// ============================================================
// TONAL MIGRATION
// ============================================================

function updateTonalCenter(
    elapsed
) {

    if (
        !audioStarted
    ) {
        return;
    }


    tonalPressure +=
        pointerSpeed *
        0.002;


    tonalPressure *=
        0.996;


    if (
        elapsed -
        lastTonalChange <
        22
    ) {
        return;
    }


    if (
        tonalPressure >
        0.18
    ) {

        const direction =
            Math.random() > 0.5
                ? 1
                : -1;


        tonalIndex =
            (
                tonalIndex +
                direction +
                tonalCenters.length
            ) %
            tonalCenters.length;


        tonalPressure =
            0;


        lastTonalChange =
            elapsed;
    }
}


// ============================================================
// UPDATE AUDIO ENVIRONMENT
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


    const tonal =
        tonalCenters[
            tonalIndex
        ];


    const activity =
        Math.min(
            1,
            pointerSpeed * 0.65 +
            events.length * 0.012
        );


    droneOsc.frequency.linearRampToValueAtTime(
        tonal.root * 0.5,
        now + 2.5
    );


    ambienceOsc.frequency.linearRampToValueAtTime(
        tonal.root,
        now + 3.0
    );


    ambienceFilter.frequency.linearRampToValueAtTime(
        850 +
        activity * 1500,
        now + 0.8
    );


    ambienceGain.gain.linearRampToValueAtTime(
        0.030 +
        activity * 0.025,
        now + 0.7
    );
}


// ============================================================
// POINTER DOWN
//
// Primer clic = activa l'àudio.
// També pot crear un primer esdeveniment.
// ============================================================

canvas.addEventListener(
    "pointerdown",
    async event => {

        await startAudio();


        pointerInside = true;

        pointerActive = true;


        const point =
            eventPositionFromPointer(
                event
            );


        pointerX =
            event.clientX;

        pointerY =
            event.clientY;

        previousPointerX =
            pointerX;

        previousPointerY =
            pointerY;


        const initial =
            createEvent(
                point.x,
                point.y,
                0.72,
                0.75
            );


        initial.time =
            performance.now() / 1000;


        triggerAudioEvent(
            0.72,
            0.25
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
//
// Només respon mentre el punter és físicament dins del canvas.
// El moviment no és una coordenada contínua de la visualització:
// és energia que entra al sistema.
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
            performance.now() / 1000;


        // ----------------------------------------------------
        // GENERACIÓ D'ESDEVENIMENTS
        //
        // No creem una ona per frame.
        // Esperem que el moviment acumuli prou energia.
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
            // TRADUCCIÓ SONORA
            // ------------------------------------------------

            if (
                now >
                audioEventCooldown
            ) {

                triggerAudioEvent(
                    strength,
                    pointerSpeed
                );


                audioEventCooldown =
                    now +
                    (
                        0.16 +
                        Math.random() * 0.20
                    );
            }
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

        pointerInside = true;

        pointerActive = true;

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
//
// Important: fora de pantalla no hi ha activitat.
// ============================================================

canvas.addEventListener(
    "pointerleave",
    () => {

        pointerInside = false;

        pointerActive = false;

        pointerSpeed = 0;

        movementAccumulator = 0;
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

        pointerInside = false;

        pointerActive = false;

        pointerSpeed = 0;
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
            window.devicePixelRatio || 1,
            2
        );


    const width =
        window.innerWidth;


    const height =
        window.innerHeight;


    canvas.width =
        Math.floor(
            width * dpr
        );


    canvas.height =
        Math.floor(
            height * dpr
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
// RENDER
// ============================================================

const start =
    performance.now();


function render(now) {

    const elapsed =
        (
            now -
            start
        ) / 1000;


    pointerSpeed *=
        0.91;


    updateTonalCenter(
        elapsed
    );


    updateAudio(
        elapsed
    );


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
            ] = 0;


            positionData[
                i * 2 + 1
            ] = 0;


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
