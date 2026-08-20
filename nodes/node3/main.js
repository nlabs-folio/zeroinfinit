// ============================================================
// ZERO INFINIT
// NODE 3 · MATÈRIA
//
// MATÈRIA
//     ↓
// CAMP
//     ↓
// FENOMEN
//
// MÚSICA
//     ↓
// CERCLE DE QUINTES
//     ↓
// HARMONIA
//     ↓
// COMPOSICIÓ
//
// El punter només perturba l'espai musical.
//
// La matèria és autònoma.
//
// La llum fotònica és el pont.
// ============================================================


// ============================================================
// CANVAS
// ============================================================

const canvas =
    document.getElementById("cosmos");

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
        "WebGL no disponible"
    );

}


// ============================================================
// VERTEX
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
// FRAGMENT
// ============================================================

const fragmentShaderSource = `

precision highp float;

uniform vec2 resolution;
uniform float time;

uniform vec2 photon;
uniform float photonEnergy;

uniform float coherence;
uniform float excitation;
uniform float phase;


// ------------------------------------------------------------
// HASH
// ------------------------------------------------------------

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
        * 43758.5453
    );

}


// ------------------------------------------------------------
// NOISE
// ------------------------------------------------------------

float noise(vec2 p) {

    vec2 i =
        floor(p);

    vec2 f =
        fract(p);

    f =
        f * f *
        (
            3.0 -
            2.0 * f
        );

    float a =
        hash(i);

    float b =
        hash(
            i +
            vec2(1.0, 0.0)
        );

    float c =
        hash(
            i +
            vec2(0.0, 1.0)
        );

    float d =
        hash(
            i +
            vec2(1.0, 1.0)
        );

    return mix(
        mix(a, b, f.x),
        mix(c, d, f.x),
        f.y
    );

}


// ------------------------------------------------------------
// FBM
// ------------------------------------------------------------

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


// ------------------------------------------------------------
// MATTER
//
// Mistura de:
// microscopia
// geografia
// cristallografia
// ------------------------------------------------------------

float matterField(vec2 p) {

    float continental =
        fbm(
            p * 1.8 +
            vec2(
                time * 0.008,
                -time * 0.006
            )
        );

    float microscopic =
        fbm(
            p * 5.5 -
            vec2(
                time * 0.014,
                time * 0.009
            )
        );

    float crystalline =
        fbm(
            p * 15.0 +
            vec2(
                -time * 0.007,
                time * 0.012
            )
        );

    return
        continental * 0.48 +
        microscopic * 0.34 +
        crystalline * 0.18;

}


// ------------------------------------------------------------
// FLOW
// ------------------------------------------------------------

vec2 flow(vec2 p) {

    float e =
        0.0025;

    float n =
        matterField(p);

    float nx =
        matterField(
            p +
            vec2(e, 0.0)
        );

    float ny =
        matterField(
            p +
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

    p.x *=
        aspect;


    // --------------------------------------------------------
    // MATÈRIA
    // --------------------------------------------------------

    vec2 f =
        flow(p);

    vec2 q =
        p +
        f *
        (
            0.025 +
            coherence * 0.035
        );


    float matter =
        matterField(q);


    float continent =
        smoothstep(
            0.30,
            0.70,
            matter
        );


    // --------------------------------------------------------
    // MICROESTRUCTURA
    // --------------------------------------------------------

    float micro =
        abs(
            matterField(q * 3.0) -
            matterField(
                q * 3.0 +
                vec2(0.018)
            )
        );

    micro =
        smoothstep(
            0.018,
            0.075,
            micro
        );


    // --------------------------------------------------------
    // CRISTALLS
    // --------------------------------------------------------

    vec2 crystalSpace =
        q * 46.0;

    vec2 cell =
        floor(
            crystalSpace
        );

    vec2 localCell =
        fract(
            crystalSpace
        ) -
        0.5;

    float cellRandom =
        hash(cell);

    float crystal =
        smoothstep(
            0.095,
            0.012,
            length(
                localCell
            )
        );

    crystal *=
        step(
            0.90,
            cellRandom
        );


    // --------------------------------------------------------
    // PHOTON
    //
    // El fenomen no és al punter.
    // És un esdeveniment separat.
    // --------------------------------------------------------

    float photonDistance =
        length(
            p -
            photon
        );

    float photonField =
        smoothstep(
            0.32,
            0.0,
            photonDistance
        );

    float photonWave =
        sin(
            photonDistance * 65.0 -
            time * 3.0
        );

    photonWave =
        0.5 +
        0.5 *
        photonWave;

    photonWave *=
        photonField *
        photonEnergy;


    // --------------------------------------------------------
    // PHOTONIC LATTICE
    // --------------------------------------------------------

    float lattice =
        abs(
            sin(
                q.x * 72.0 +
                q.y * 19.0
            )
        );

    lattice =
        smoothstep(
            0.94,
            0.995,
            lattice
        );

    lattice *=
        photonField *
        0.7;


    // --------------------------------------------------------
    // PARTICLES
    // --------------------------------------------------------

    vec2 particleSpace =
        q * 115.0;

    vec2 particleCell =
        floor(
            particleSpace
        );

    vec2 particleLocal =
        fract(
            particleSpace
        ) -
        0.5;

    float particleRandom =
        hash(
            particleCell
        );

    float particle =
        smoothstep(
            0.05,
            0.0,
            length(
                particleLocal
            )
        );

    particle *=
        step(
            0.987,
            particleRandom
        );

    particle *=
        continent *
        (
            0.18 +
            excitation * 0.8
        );


    // --------------------------------------------------------
    // COLOUR FIELD
    // --------------------------------------------------------

    vec3 background =
        vec3(
            0.004,
            0.007,
            0.006
        );

    vec3 mineral =
        vec3(
            0.075,
            0.15,
            0.13
        );

    vec3 biological =
        vec3(
            0.23,
            0.48,
            0.36
        );

    vec3 crystalColor =
        vec3(
            0.58,
            0.78,
            0.70
        );

    vec3 photonColor =
        vec3(
            0.84,
            0.94,
            0.88
        );


    vec3 color =
        background;


    color +=
        mineral *
        continent *
        1.7;


    color +=
        biological *
        continent *
        continent *
        1.25;


    color +=
        biological *
        micro *
        0.32;


    color +=
        crystalColor *
        crystal *
        (
            0.35 +
            excitation
        );


    color +=
        crystalColor *
        particle;


    color +=
        photonColor *
        photonWave *
        1.7;


    color +=
        photonColor *
        lattice *
        0.45;


    // --------------------------------------------------------
    // DEPTH
    // --------------------------------------------------------

    float depth =
        smoothstep(
            1.25,
            0.05,
            length(p)
        );

    color *=
        0.50 +
        depth * 0.70;


    // --------------------------------------------------------
    // SOFT GAMMA
    // --------------------------------------------------------

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

function compileShader(
    type,
    source
) {

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
    program
);

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

const uPhase =
    gl.getUniformLocation(
        program,
        "phase"
    );


// ============================================================
// MATHEMATICAL STATE
// ============================================================

let density =
    0.5;

let symmetry =
    0.5;

let transition =
    0.0;

let coherence =
    0.65;

let excitation =
    0.12;

let phase =
    0;


// ============================================================
// MUSICAL MODEL
// ============================================================
//
// Circle of fifths:
//
// C
// G
// D
// A
// E
// B
// F#/Gb
// Db
// Ab
// Eb
// Bb
// F
//
// The actual names are NOT displayed.
// The structure exists internally.
// ============================================================

const fifthCircle = [

    {
        pc: 0,
        ratio: 1
    },

    {
        pc: 7,
        ratio: 3 / 2
    },

    {
        pc: 2,
        ratio: 3 / 2
    },

    {
        pc: 9,
        ratio: 3 / 2
    },

    {
        pc: 4,
        ratio: 3 / 2
    },

    {
        pc: 11,
        ratio: 3 / 2
    },

    {
        pc: 6,
        ratio: 3 / 2
    },

    {
        pc: 1,
        ratio: 3 / 2
    },

    {
        pc: 8,
        ratio: 3 / 2
    },

    {
        pc: 3,
        ratio: 3 / 2
    },

    {
        pc: 10,
        ratio: 3 / 2
    },

    {
        pc: 5,
        ratio: 3 / 2
    }

];


// ============================================================
// NOTE STATE
// ============================================================

let currentCircleIndex =
    Math.floor(
        Math.random() *
        fifthCircle.length
    );

let targetCircleIndex =
    currentCircleIndex;

let previousCircleIndex =
    currentCircleIndex;

let musicalDirection =
    0;

let harmonicPressure =
    0;

let phraseEnergy =
    0.45;

let phraseAge =
    0;

let restProbability =
    0.22;

let lastNoteTime =
    -Infinity;

let nextDecisionTime =
    0;


// ============================================================
// TONAL MODE
// ============================================================

let mode =
    "major";


// ============================================================
// AUDIO
// ============================================================

let audio =
    null;

let master =
    null;

let compressor =
    null;

let filter =
    null;

let audioStarting =
    false;


// ============================================================
// CONTINUOUS VOICES
// ============================================================

let bassOsc =
    null;

let bassGain =
    null;

let padA =
    null;

let padB =
    null;

let padGain =
    null;

let textureOsc =
    null;

let textureGain =
    null;


// ============================================================
// PHOTON
// ============================================================

let photonX =
    0.45;

let photonY =
    0.15;

let photonEnergy =
    0.0;

let photonTargetX =
    photonX;

let photonTargetY =
    photonY;


// ============================================================
// POINTER
// ============================================================

let pointerX =
    0;

let pointerY =
    0;

let previousPointerX =
    0;

let previousPointerY =
    0;

let pointerVelocity =
    0;

let pointerActive =
    false;

let pointerIntent =
    0;


// ============================================================
// FORMULA
// ============================================================

const formulaLayer =
    document.getElementById(
        "formula-layer"
    );

const visualFormula =
    document.getElementById(
        "visual-formula"
    );

const musicalFormula =
    document.getElementById(
        "musical-formula"
    );

const stateSymbol =
    document.getElementById(
        "state-symbol"
    );


let formulaTimer =
    null;


// ============================================================
// FORMULA HELPERS
// ============================================================

function showVisualFormula(
    text
) {

    if (!visualFormula) {
        return;
    }

    visualFormula.textContent =
        text;

    formulaLayer.classList.add(
        "visible"
    );

    clearTimeout(
        formulaTimer
    );

    formulaTimer =
        setTimeout(
            () => {

                formulaLayer.classList.remove(
                    "visible"
                );

            },
            2200
        );

}


function showMusicalFormula(
    text
) {

    if (!musicalFormula) {
        return;
    }

    musicalFormula.textContent =
        text;

    formulaLayer.classList.add(
        "visible"
    );

    clearTimeout(
        formulaTimer
    );

    formulaTimer =
        setTimeout(
            () => {

                formulaLayer.classList.remove(
                    "visible"
                );

            },
            2200
        );

}


// ============================================================
// AUDIO START
// ============================================================

async function startAudio() {

    if (audio) {

        if (
            audio.state ===
            "suspended"
        ) {

            await audio.resume();

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

        audioStarting =
            false;

        return;

    }


    const ctx =
        new AudioContext();


    try {

        await ctx.resume();


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
            18;

        newCompressor.ratio.value =
            3;

        newCompressor.attack.value =
            0.03;

        newCompressor.release.value =
            0.25;


        // ----------------------------------------------------
        // FILTER
        // ----------------------------------------------------

        const newFilter =
            ctx.createBiquadFilter();

        newFilter.type =
            "lowpass";

        newFilter.frequency.value =
            850;

        newFilter.Q.value =
            0.5;


        newFilter.connect(
            newCompressor
        );

        newCompressor.connect(
            newMaster
        );

        newMaster.connect(
            ctx.destination
        );


        // ----------------------------------------------------
        // BASS
        // ----------------------------------------------------

        const newBassOsc =
            ctx.createOscillator();

        const newBassGain =
            ctx.createGain();

        newBassOsc.type =
            "sine";

        newBassGain.gain.value =
            0.0001;


        newBassOsc
            .connect(newBassGain)
            .connect(newFilter);


        // ----------------------------------------------------
        // PAD
        // ----------------------------------------------------

        const newPadA =
            ctx.createOscillator();

        const newPadB =
            ctx.createOscillator();

        const newPadGain =
            ctx.createGain();

        newPadA.type =
            "triangle";

        newPadB.type =
            "sine";

        newPadGain.gain.value =
            0.0001;


        newPadA
            .connect(newPadGain)
            .connect(newFilter);

        newPadB
            .connect(newPadGain)
            .connect(newFilter);


        // ----------------------------------------------------
        // AIR / TEXTURE
        // ----------------------------------------------------

        const newTextureOsc =
            ctx.createOscillator();

        const newTextureGain =
            ctx.createGain();

        newTextureOsc.type =
            "sine";

        newTextureGain.gain.value =
            0.0001;


        newTextureOsc
            .connect(newTextureGain)
            .connect(newFilter);


        // ----------------------------------------------------
        // START
        // ----------------------------------------------------

        const now =
            ctx.currentTime;


        const rootFrequency =
            circleFrequency(
                currentCircleIndex,
                110
            );


        newBassOsc.frequency.value =
            rootFrequency / 2;


        newPadA.frequency.value =
            rootFrequency;


        newPadB.frequency.value =
            rootFrequency * 1.5;


        newTextureOsc.frequency.value =
            rootFrequency * 2.0;


        newBassOsc.start(now);
        newPadA.start(now);
        newPadB.start(now);
        newTextureOsc.start(now);


        // ----------------------------------------------------
        // VERY SLOW ENTRY
        // ----------------------------------------------------

        newMaster.gain
            .exponentialRampToValueAtTime(
                0.13,
                now + 5
            );


        newBassGain.gain
            .exponentialRampToValueAtTime(
                0.022,
                now + 4
            );


        newPadGain.gain
            .exponentialRampToValueAtTime(
                0.012,
                now + 6
            );


        newTextureGain.gain
            .exponentialRampToValueAtTime(
                0.002,
                now + 7
            );


        // ----------------------------------------------------
        // EXPOSE COMPLETE GRAPH
        // ----------------------------------------------------

        audio =
            ctx;

        master =
            newMaster;

        compressor =
            newCompressor;

        filter =
            newFilter;

        bassOsc =
            newBassOsc;

        bassGain =
            newBassGain;

        padA =
            newPadA;

        padB =
            newPadB;

        padGain =
            newPadGain;

        textureOsc =
            newTextureOsc;

        textureGain =
            newTextureGain;


        nextDecisionTime =
            now + 3;


        showMusicalFormula(
            "∫ → ∴"
        );


    } catch (error) {

        console.error(
            "Audio:",
            error
        );

        try {

            await ctx.close();

        } catch (_) {}

    }


    audioStarting =
        false;

}


// ============================================================
// CIRCLE FREQUENCY
// ============================================================

function circleFrequency(
    index,
    base = 110
) {

    const pc =
        fifthCircle[
            (
                index +
                fifthCircle.length
            ) %
            fifthCircle.length
        ].pc;


    return (
        base *
        Math.pow(
            2,
            pc / 12
        )
    );

}


// ============================================================
// PITCH FROM CIRCLE
// ============================================================

function pitchFromCircle(
    circleIndex,
    degree,
    octave = 0
) {

    const centre =
        fifthCircle[
            (
                circleIndex +
                fifthCircle.length
            ) %
            fifthCircle.length
        ].pc;


    // --------------------------------------------------------
    // Major / minor interval logic
    // --------------------------------------------------------

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


    const scale =
        mode === "major"
            ? majorScale
            : minorScale;


    const interval =
        scale[
            degree %
            scale.length
        ];


    return (
        110 *
        Math.pow(
            2,
            (
                centre +
                interval +
                octave * 12
            ) / 12
        )
    );

}


// ============================================================
// MAJOR / MINOR LOGIC
//
// No és una decisió arbitrària.
// Depèn de la relació entre graus.
// ============================================================

function determineMode() {

    const distance =
        Math.abs(
            targetCircleIndex -
            currentCircleIndex
        );


    const wrapped =
        Math.min(
            distance,
            fifthCircle.length -
            distance
        );


    const pressure =
        harmonicPressure;


    if (
        (
            wrapped <= 2 &&
            pressure > 0.56
        ) ||
        (
            symmetry >
            density &&
            coherence >
            0.58
        )
    ) {

        return "major";

    }


    if (
        wrapped >= 4 ||
        (
            transition >
            0.38 &&
            excitation >
            0.22
        )
    ) {

        return "minor";

    }


    return mode;

}


// ============================================================
// POINTER → MUSICAL SPACE
//
// Important:
//
// X determines tendency:
//
// left  → flatward
// right → sharpward
//
// Angle determines which region
// of the hidden circle is being approached.
// ============================================================

function updateMusicalIntent() {

    const angle =
        Math.atan2(
            pointerY,
            pointerX
        );


    let normalized =
        (
            angle +
            Math.PI
        ) /
        (
            Math.PI * 2
        );


    normalized =
        (
            normalized +
            0.5
        ) %
        1;


    const sector =
        Math.floor(
            normalized *
            fifthCircle.length
        );


    targetCircleIndex =
        sector;


    musicalDirection =
        Math.sign(
            pointerX
        );


    harmonicPressure =
        Math.min(
            1,
            (
                0.25 +
                pointerVelocity *
                0.35 +
                pointerIntent *
                0.45
            )
        );


    mode =
        determineMode();

}


// ============================================================
// AUDIO NOTE
// ============================================================

function playNote(
    frequency,
    duration,
    velocity,
    type = "sine"
) {

    if (
        !audio ||
        audio.state !==
        "running" ||
        !filter
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
        type;

    oscillator.frequency
        .setValueAtTime(
            frequency,
            now
        );


    // --------------------------------------------------------
    // Very soft attack
    // --------------------------------------------------------

    gain.gain.setValueAtTime(
        0.0001,
        now
    );


    gain.gain
        .exponentialRampToValueAtTime(
            Math.max(
                0.001,
                velocity
            ),
            now + 0.12
        );


    // --------------------------------------------------------
    // Organic release
    // --------------------------------------------------------

    gain.gain
        .exponentialRampToValueAtTime(
            0.0001,
            now + duration
        );


    oscillator
        .connect(gain)
        .connect(filter);


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
// COMPOSITION ENGINE
//
// No sequence.
// A recursive decision system.
//
// State → tendency → interval → rest → return.
// ============================================================

function composeMoment() {

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
        now -
        lastNoteTime <
        1.2
    ) {

        return;

    }


    // --------------------------------------------------------
    // REST
    // --------------------------------------------------------

    const dynamicRest =
        restProbability +
        (
            1 -
            coherence
        ) * 0.16;


    if (
        Math.random() <
        dynamicRest
    ) {

        phraseEnergy *=
            0.92;

        lastNoteTime =
            now;

        nextDecisionTime =
            now +
            1.5 +
            Math.random() * 3;


        showMusicalFormula(
            "∅"
        );

        return;

    }


    // --------------------------------------------------------
    // HARMONIC MOVEMENT
    // --------------------------------------------------------

    const distance =
        targetCircleIndex -
        currentCircleIndex;


    const wrappedForward =
        (
            distance +
            fifthCircle.length
        ) %
        fifthCircle.length;


    const wrappedBackward =
        (
            -distance +
            fifthCircle.length
        ) %
        fifthCircle.length;


    // Prefer the shorter route.
    // Directional tendency breaks ties.

    let step;


    if (
        wrappedForward <
        wrappedBackward
    ) {

        step =
            1;

    } else if (
        wrappedBackward <
        wrappedForward
    ) {

        step =
            -1;

    } else {

        step =
            musicalDirection >= 0
                ? 1
                : -1;

    }


    // Sometimes remain on current point.
    if (
        Math.random() <
        0.28
    ) {

        step =
            0;

    }


    previousCircleIndex =
        currentCircleIndex;


    currentCircleIndex =
        (
            currentCircleIndex +
            step +
            fifthCircle.length
        ) %
        fifthCircle.length;


    // --------------------------------------------------------
    // MODE
    // --------------------------------------------------------

    mode =
        determineMode();


    // --------------------------------------------------------
    // DEGREE
    //
    // Musical logic rather than random notes.
    // --------------------------------------------------------

    let degree;


    const r =
        Math.random();


    if (
        r < 0.34
    ) {

        degree =
            0;

    } else if (
        r < 0.54
    ) {

        degree =
            2;

    } else if (
        r < 0.73
    ) {

        degree =
            4;

    } else if (
        r < 0.88
    ) {

        degree =
            3;

    } else {

        degree =
            1;

    }


    // --------------------------------------------------------
    // Phrase memory
    // --------------------------------------------------------

    phraseAge++;


    if (
        phraseAge >
        7
    ) {

        degree =
            Math.random() <
            0.6
                ? 0
                : 4;

        phraseAge =
            0;

    }


    // --------------------------------------------------------
    // OCTAVE
    // --------------------------------------------------------

    let octave =
        0;


    if (
        excitation >
        0.55
    ) {

        octave =
            Math.random() <
            0.35
                ? 1
                : 0;

    }


    if (
        coherence <
        0.45
    ) {

        octave =
            Math.random() <
            0.5
                ? -1
                : 0;

    }


    const frequency =
        pitchFromCircle(
            currentCircleIndex,
            degree,
            octave
        );


    // --------------------------------------------------------
    // DURATION
    // --------------------------------------------------------

    const duration =
        coherence >
        0.72

            ? 2.4 +
              Math.random() * 1.6

            : 1.5 +
              Math.random() * 1.5;


    // --------------------------------------------------------
    // VELOCITY
    // --------------------------------------------------------

    const velocity =
        0.008 +
        coherence * 0.010 +
        phraseEnergy * 0.006;


    playNote(
        frequency,
        duration,
        velocity,
        Math.random() <
        0.18
            ? "triangle"
            : "sine"
    );


    lastNoteTime =
        now;


    nextDecisionTime =
        now +
        duration *
        (
            0.65 +
            Math.random() *
            0.55
        );


    phraseEnergy =
        Math.min(
            1,
            phraseEnergy +
            0.04
        );


    // --------------------------------------------------------
    // Harmonic event → photon
    // --------------------------------------------------------

    if (
        step !== 0 &&
        Math.random() <
        0.48
    ) {

        triggerPhoton();

    }


    // --------------------------------------------------------
    // Formula
    // --------------------------------------------------------

    if (
        step > 0
    ) {

        showMusicalFormula(
            "→ ♯"
        );

    } else if (
        step < 0
    ) {

        showMusicalFormula(
            "← ♭"
        );

    } else {

        showMusicalFormula(
            "∴"
        );

    }

}


// ============================================================
// PHOTON
//
// Never occupies pointer position.
// It is displaced from the user's intention.
// ============================================================

function triggerPhoton() {

    const angle =
        Math.random() *
        Math.PI *
        2;


    const radius =
        0.28 +
        Math.random() *
        0.38;


    let x =
        Math.cos(angle) *
        radius;

    let y =
        Math.sin(angle) *
        radius;


    // --------------------------------------------------------
    // Never too close to pointer.
    // --------------------------------------------------------

    const dx =
        x -
        pointerX;

    const dy =
        y -
        pointerY;


    if (
        Math.sqrt(
            dx * dx +
            dy * dy
        ) <
        0.24
    ) {

        x =
            -x;

        y =
            -y;

    }


    photonTargetX =
        x;

    photonTargetY =
        y;


    photonEnergy =
        0.0;


    // Slowly emerges.
    requestAnimationFrame(
        () => {

            photonEnergy =
                0.85;

        }
    );


    showVisualFormula(
        "∇ · Φ = ΔE"
    );

}


// ============================================================
// MATHEMATICS
//
// Independent from music.
// ============================================================

function updateMathematics() {

    const t =
        performance.now() *
        0.00008;


    density =
        0.5 +
        0.22 *
        Math.sin(
            t * 1.31
        );


    symmetry =
        0.5 +
        0.28 *
        Math.cos(
            t * 0.73
        );


    transition =
        Math.abs(
            density -
            symmetry
        );


    coherence =
        1 -
        transition;


    excitation +=
        photonEnergy *
        0.0008;


    excitation *=
        0.997;


    excitation =
        Math.max(
            0.035,
            Math.min(
                1,
                excitation
            )
        );


    phase +=
        0.0015 +
        excitation *
        0.002;


    phraseEnergy *=
        0.999;


    photonEnergy *=
        0.985;

}


// ============================================================
// AUDIO TEXTURE UPDATE
//
// The harmonic centre moves continuously,
// but never creates a permanent drone.
// ============================================================

function updateAudioTexture() {

    if (
        !audio ||
        audio.state !==
        "running" ||
        !bassOsc ||
        !padA ||
        !padB ||
        !textureOsc
    ) {

        return;

    }


    const now =
        audio.currentTime;


    const root =
        circleFrequency(
            currentCircleIndex,
            110
        );


    // --------------------------------------------------------
    // Harmonic root
    // --------------------------------------------------------

    bassOsc.frequency
        .linearRampToValueAtTime(
            root / 2,
            now + 2.5
        );


    // --------------------------------------------------------
    // Mode changes colour the texture.
    // --------------------------------------------------------

    const third =
        mode === "major"
            ? 4
            : 3;


    const fifth =
        7;


    const chordRoot =
        root;


    const thirdFrequency =
        chordRoot *
        Math.pow(
            2,
            third / 12
        );


    const fifthFrequency =
        chordRoot *
        Math.pow(
            2,
            fifth / 12
        );


    padA.frequency
        .linearRampToValueAtTime(
            chordRoot,
            now + 3
        );


    padB.frequency
        .linearRampToValueAtTime(
            fifthFrequency,
            now + 3.5
        );


    textureOsc.frequency
        .linearRampToValueAtTime(
            thirdFrequency * 2,
            now + 4
        );


    // --------------------------------------------------------
    // Dynamic silence
    // --------------------------------------------------------

    const body =
        0.004 +
        coherence * 0.008;


    bassGain.gain
        .linearRampToValueAtTime(
            body,
            now + 1.2
        );


    padGain.gain
        .linearRampToValueAtTime(
            0.004 +
            coherence * 0.006,
            now + 2
        );


    textureGain.gain
        .linearRampToValueAtTime(
            0.0005 +
            excitation * 0.002,
            now + 3
        );


    // --------------------------------------------------------
    // Filter breathing
    // --------------------------------------------------------

    if (filter) {

        const frequency =
            420 +
            coherence * 1050 +
            excitation * 750;


        filter.frequency
            .linearRampToValueAtTime(
                frequency,
                now + 1.5
            );

    }

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


        pointerX =
            event.clientX /
            width -
            0.5;


        pointerY =
            0.5 -
            event.clientY /
            height;


        pointerX *=
            aspect;


        const dx =
            event.clientX -
            previousPointerX;

        const dy =
            event.clientY -
            previousPointerY;


        const velocity =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        pointerVelocity =
            Math.min(
                1,
                velocity / 55
            );


        pointerIntent =
            Math.min(
                1,
                pointerIntent +
                pointerVelocity *
                0.08
            );


        previousPointerX =
            event.clientX;

        previousPointerY =
            event.clientY;


        pointerActive =
            true;


        updateMusicalIntent();

    },
    {
        passive: true
    }
);


// ============================================================
// POINTER REST
// ============================================================

window.addEventListener(
    "pointerleave",
    () => {

        pointerActive =
            false;

    }
);


// ============================================================
// FIRST GESTURE
// ============================================================

window.addEventListener(
    "pointerdown",
    () => {

        startAudio();

    },
    {
        passive: true,
        once: true
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

const start =
    performance.now();


function render(now) {

    const elapsed =
        (
            now -
            start
        ) /
        1000;


    // --------------------------------------------------------
    // MATHEMATICS
    // --------------------------------------------------------

    updateMathematics();


    // --------------------------------------------------------
    // USER INTENTION DECAY
    // --------------------------------------------------------

    pointerIntent *=
        0.994;

    pointerVelocity *=
        0.96;


    // --------------------------------------------------------
    // PHOTON MOTION
    // --------------------------------------------------------

    photonX +=
        (
            photonTargetX -
            photonX
        ) *
        0.012;


    photonY +=
        (
            photonTargetY -
            photonY
        ) *
        0.012;


    // --------------------------------------------------------
    // AUDIO
    // --------------------------------------------------------

    updateAudioTexture();


    if (
        audio &&
        audio.state ===
        "running" &&
        now / 1000 >=
        nextDecisionTime
    ) {

        composeMoment();

    }


    // --------------------------------------------------------
    // SHADER
    // --------------------------------------------------------

    gl.uniform1f(
        uTime,
        elapsed
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
        uCoherence,
        coherence
    );


    gl.uniform1f(
        uExcitation,
        excitation
    );


    gl.uniform1f(
        uPhase,
        phase
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
// STATE SYMBOL
//
// No descriptive text.
// ============================================================

setInterval(
    () => {

        if (!stateSymbol) {
            return;
        }


        if (
            photonEnergy >
            0.45
        ) {

            stateSymbol.textContent =
                "◌";

        } else if (
            coherence >
            0.78
        ) {

            stateSymbol.textContent =
                "∴";

        } else if (
            transition >
            0.35
        ) {

            stateSymbol.textContent =
                "∿";

        } else if (
            pointerActive &&
            pointerIntent >
            0.25
        ) {

            stateSymbol.textContent =
                "·";

        } else {

            stateSymbol.textContent =
                "∅";

        }

    },
    700
);