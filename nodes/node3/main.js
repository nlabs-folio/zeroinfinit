// ============================================================
// ZERO INFINIT
// NODE 3 · MATÈRIA
//
// MATÈRIA
//     ↓
// ESTAT
//     ↓
// MATEMÀTICA
//     ↓
// INTENCIÓ MUSICAL
//     ↓
// SO
//
// El punter no controla la forma.
// Només la pertorba.
//
// El so emergeix de l'estat.
// La música no és una capa externa.
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
// SHADER
// ============================================================

const vertexShaderSource = `

attribute vec2 position;

void main() {

    gl_Position =
        vec4(position, 0.0, 1.0);

}

`;


const fragmentShaderSource = `

precision highp float;

uniform vec2 resolution;
uniform float time;

uniform vec2 disturbance;
uniform float disturbanceEnergy;

uniform float coherence;
uniform float excitation;
uniform float phase;


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
        * 43758.5453
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


// ============================================================
// FBM
// ============================================================

float fbm(vec2 p) {

    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 7; i++) {

        value +=
            amplitude *
            noise(p);

        p *= 2.0;

        amplitude *= 0.5;

    }

    return value;

}


// ============================================================
// MATTER FIELD
// ============================================================

float matterField(vec2 p) {

    float a =
        fbm(
            p * 2.2 +
            vec2(
                time * 0.018,
                -time * 0.011
            )
        );

    float b =
        fbm(
            p * 5.0 -
            vec2(
                time * 0.026,
                time * 0.014
            )
        );

    float c =
        fbm(
            p * 11.0 +
            vec2(
                -time * 0.012,
                time * 0.019
            )
        );

    return
        a * 0.58 +
        b * 0.29 +
        c * 0.13;

}


// ============================================================
// FLOW
// ============================================================

vec2 flow(vec2 p) {

    float e = 0.003;

    float n =
        matterField(p);

    float nx =
        matterField(
            p + vec2(e, 0.0)
        );

    float ny =
        matterField(
            p + vec2(0.0, e)
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
        uv - 0.5;

    p.x *= aspect;


    // --------------------------------------------------------
    // FLOW
    // --------------------------------------------------------

    vec2 f =
        flow(p);

    vec2 q =
        p +
        f *
        (
            0.035 +
            coherence * 0.035
        );


    // --------------------------------------------------------
    // DISTURBANCE
    // --------------------------------------------------------

    float d =
        length(
            p - disturbance
        );

    float local =
        smoothstep(
            0.38,
            0.0,
            d
        );

    local *=
        disturbanceEnergy;

    vec2 direction =
        normalize(
            p -
            disturbance +
            vec2(0.0001)
        );

    q +=
        direction *
        local *
        0.035;


    // --------------------------------------------------------
    // MATTER
    // --------------------------------------------------------

    float matter =
        matterField(q);

    matter =
        smoothstep(
            0.36,
            0.72,
            matter
        );


    // --------------------------------------------------------
    // EXCITATION
    // --------------------------------------------------------

    float excitationWave =
        sin(
            length(q) * 34.0 -
            time * 0.7 +
            matter * 7.0 +
            phase
        );

    excitationWave =
        0.5 +
        0.5 *
        excitationWave;

    excitationWave =
        smoothstep(
            0.78,
            0.96,
            excitationWave
        );

    excitationWave *=
        excitation *
        0.55;


    // --------------------------------------------------------
    // MEMBRANES
    // --------------------------------------------------------

    float membrane =
        abs(
            matterField(q * 2.0) -
            matterField(
                q * 2.0 +
                vec2(0.03)
            )
        );

    membrane =
        smoothstep(
            0.025,
            0.09,
            membrane
        );

    membrane *=
        0.28;


    // --------------------------------------------------------
    // CRYSTALS
    // --------------------------------------------------------

    vec2 crystalSpace =
        q * 42.0;

    vec2 cell =
        floor(crystalSpace);

    vec2 localCell =
        fract(crystalSpace) -
        0.5;

    float r =
        hash(cell);

    float crystal =
        smoothstep(
            0.10,
            0.015,
            length(localCell)
        );

    crystal *=
        step(
            0.90,
            r
        );

    crystal *=
        0.25 +
        excitation * 1.5;


    // --------------------------------------------------------
    // FILAMENTS
    // --------------------------------------------------------

    float filament =
        abs(
            sin(
                q.x * 48.0 +
                matter * 8.0
            )
        );

    filament =
        smoothstep(
            0.91,
            0.99,
            filament
        );

    filament *=
        smoothstep(
            0.25,
            0.75,
            matter
        );

    filament *=
        0.18;


    // --------------------------------------------------------
    // PARTICLES
    // --------------------------------------------------------

    vec2 particleSpace =
        q * 100.0;

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
            0.045,
            0.0,
            length(
                particleLocal -
                f * 0.012
            )
        );

    particle *=
        step(
            0.985,
            particleRandom
        );

    particle *=
        matter *
        (
            0.25 +
            excitation
        );


    // --------------------------------------------------------
    // COLOUR
    // --------------------------------------------------------

    vec3 background =
        vec3(
            0.008,
            0.012,
            0.011
        );

    vec3 mineral =
        vec3(
            0.10,
            0.19,
            0.16
        );

    vec3 living =
        vec3(
            0.34,
            0.62,
            0.49
        );

    vec3 crystalline =
        vec3(
            0.70,
            0.84,
            0.76
        );

    vec3 amber =
        vec3(
            0.78,
            0.60,
            0.34
        );


    vec3 color =
        background;

    color +=
        mineral *
        matter *
        1.45;

    color +=
        living *
        matter *
        matter *
        1.2;

    color +=
        living *
        membrane;

    color +=
        crystalline *
        crystal *
        0.9;

    color +=
        crystalline *
        particle *
        0.8;

    color +=
        amber *
        excitationWave;

    color +=
        crystalline *
        filament;


    // --------------------------------------------------------
    // DEPTH
    // --------------------------------------------------------

    float depth =
        smoothstep(
            1.35,
            0.05,
            length(p)
        );

    color *=
        0.55 +
        depth * 0.65;

    color =
        pow(
            color,
            vec3(0.94)
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

gl.useProgram(program);


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

const uPhase =
    gl.getUniformLocation(
        program,
        "phase"
    );


// ============================================================
// POINTER / FIELD STATE
// ============================================================

let mouseX = 0;
let mouseY = 0;

let targetX = 0;
let targetY = 0;

let disturbanceEnergy = 0;

let pointerEnergy = 0;

let previousX = 0;
let previousY = 0;


// ============================================================
// MATHEMATICAL STATE
// ============================================================

let density = 0.5;
let symmetry = 0.5;
let transition = 0.0;

let coherence = 0.5;
let excitation = 0.18;

let phase = 0;

let lastFormula = null;


// ============================================================
// MUSICAL STATE
// ============================================================

const tonalCentres = [

    {
        root: 220,
        name: "A DÒRIC",
        scale: [
            0,
            2,
            3,
            5,
            7,
            9,
            10
        ]
    },

    {
        root: 196,
        name: "G JÒNIC",
        scale: [
            0,
            2,
            4,
            5,
            7,
            9,
            11
        ]
    },

    {
        root: 174.61,
        name: "F LIDI",
        scale: [
            0,
            2,
            4,
            6,
            7,
            9,
            11
        ]
    },

    {
        root: 146.83,
        name: "D DÒRIC",
        scale: [
            0,
            2,
            3,
            5,
            7,
            9,
            10
        ]
    }

];


let tonalState =
    tonalCentres[0];

let musicalIndex = 0;

let nextNoteTime = 0;

let lastNoteTime = -Infinity;


// ============================================================
// AUDIO STATE
// ============================================================

let audio = null;

let master = null;
let filter = null;

let bassOsc = null;
let bassGain = null;

let padOscA = null;
let padOscB = null;
let padGain = null;

let airOsc = null;
let airGain = null;

let audioStarting = false;


// ============================================================
// START AUDIO
//
// IMPORTANT:
//
// Nothing is exposed as "audio active"
// until the complete graph exists.
//
// This prevents:
//     audio != null
//     filter == null
//
// ============================================================

async function startAudio() {

    if (audio) {

        if (
            audio.state ===
            "suspended"
        ) {

            try {
                await audio.resume();
            } catch (error) {
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

    audioStarting = true;


    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;


    if (!AudioContext) {

        console.warn(
            "Web Audio API no disponible"
        );

        audioStarting = false;

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
        // FILTER
        // ----------------------------------------------------

        const newFilter =
            ctx.createBiquadFilter();

        newFilter.type =
            "lowpass";

        newFilter.frequency.value =
            900;

        newFilter.Q.value =
            0.45;


        newFilter.connect(
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

        const newPadOscA =
            ctx.createOscillator();

        const newPadOscB =
            ctx.createOscillator();

        const newPadGain =
            ctx.createGain();

        newPadOscA.type =
            "sine";

        newPadOscB.type =
            "triangle";

        newPadGain.gain.value =
            0.0001;


        newPadOscA
            .connect(newPadGain)
            .connect(newFilter);

        newPadOscB
            .connect(newPadGain)
            .connect(newFilter);


        // ----------------------------------------------------
        // AIR
        // ----------------------------------------------------

        const newAirOsc =
            ctx.createOscillator();

        const newAirGain =
            ctx.createGain();

        newAirOsc.type =
            "sine";

        newAirGain.gain.value =
            0.0001;


        newAirOsc
            .connect(newAirGain)
            .connect(newFilter);


        // ----------------------------------------------------
        // START CONTINUOUS TEXTURES
        // ----------------------------------------------------

        const now =
            ctx.currentTime;

        newBassOsc.frequency.value =
            tonalState.root / 2;

        newPadOscA.frequency.value =
            tonalState.root;

        newPadOscB.frequency.value =
            tonalState.root * 1.5;

        newAirOsc.frequency.value =
            tonalState.root * 2;


        newBassOsc.start(now);
        newPadOscA.start(now);
        newPadOscB.start(now);
        newAirOsc.start(now);


        // ----------------------------------------------------
        // FADE IN
        // ----------------------------------------------------

        newMaster.gain
            .exponentialRampToValueAtTime(
                0.16,
                now + 4
            );


        newBassGain.gain
            .exponentialRampToValueAtTime(
                0.035,
                now + 3
            );

        newPadGain.gain
            .exponentialRampToValueAtTime(
                0.018,
                now + 4
            );

        newAirGain.gain
            .exponentialRampToValueAtTime(
                0.004,
                now + 5
            );


        // ----------------------------------------------------
        // ONLY NOW EXPOSE AUDIO
        // ----------------------------------------------------

        audio =
            ctx;

        master =
            newMaster;

        filter =
            newFilter;

        bassOsc =
            newBassOsc;

        bassGain =
            newBassGain;

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


        nextNoteTime =
            now + 2.5;


        showFormula(
            "ρ → f(t)"
        );


    } catch (error) {

        console.error(
            "No s'ha pogut iniciar l'àudio:",
            error
        );

        try {
            await ctx.close();
        } catch (_) {}

    }


    audioStarting = false;

}


// ============================================================
// FREQUENCY FROM SCALE
// ============================================================

function frequencyFromScale(
    root,
    scale,
    index
) {

    const degree =
        index %
        scale.length;

    const octave =
        Math.floor(
            index /
            scale.length
        );

    const semitone =
        scale[degree] +
        octave * 12;

    return (
        root *
        Math.pow(
            2,
            semitone / 12
        )
    );

}


// ============================================================
// SHORT MELODIC NOTE
//
// Each note owns its oscillator.
// It starts and stops exactly once.
//
// ============================================================

function playNote(
    frequency,
    duration,
    velocity
) {

    if (
        !audio ||
        audio.state !== "running" ||
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
        "sine";

    oscillator.frequency.setValueAtTime(
        frequency,
        now
    );


    gain.gain.setValueAtTime(
        0.0001,
        now
    );


    gain.gain.exponentialRampToValueAtTime(
        Math.max(
            0.001,
            velocity
        ),
        now + 0.08
    );


    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + duration
    );


    oscillator
        .connect(gain)
        .connect(filter);


    oscillator.start(now);

    oscillator.stop(
        now + duration + 0.05
    );

}


// ============================================================
// MUSICAL DISCOVERY
// ============================================================

function musicalDiscovery() {

    if (
        !audio ||
        !filter
    ) {
        return;
    }


    const scale =
        tonalState.scale;


    const degree =
        Math.floor(
            density *
            scale.length
        )
        %
        scale.length;


    const octaveLift =
        coherence > 0.78
            ? 12
            : 0;


    const note =
        frequencyFromScale(
            tonalState.root,
            scale,
            degree
        ) *
        Math.pow(
            2,
            octaveLift / 12
        );


    const velocity =
        0.010 +
        coherence * 0.008;


    const duration =
        coherence > 0.78
            ? 1.8
            : 1.35;


    playNote(
        note,
        duration,
        velocity
    );


    musicalIndex++;


    if (
        musicalIndex % 3 === 0
    ) {

        showFormula(
            "ΔE → ♪"
        );

    } else {

        showFormula(
            "ρ + ∇ρ → excitation"
        );

    }


    // --------------------------------------------------------
    // TONAL TRANSITION
    // --------------------------------------------------------

    if (
        coherence > 0.76 &&
        transition > 0.42 &&
        Math.random() > 0.90
    ) {

        changeTonalCentre();

    }

}


// ============================================================
// TONAL CENTRE
// ============================================================

function changeTonalCentre() {

    if (!audio) {
        return;
    }


    const candidates =
        tonalCentres.filter(
            centre =>
                centre !== tonalState
        );


    const next =
        candidates[
            Math.floor(
                Math.random() *
                candidates.length
            )
        ];


    tonalState =
        next;


    const now =
        audio.currentTime;


    if (bassOsc) {

        bassOsc.frequency
            .linearRampToValueAtTime(
                next.root / 2,
                now + 4
            );

    }


    showFormula(
        "C(t) → " +
        next.name
    );

}


// ============================================================
// FORMULA
// ============================================================

function showFormula(text) {

    const layer =
        document.getElementById(
            "formula-layer"
        );

    const formula =
        document.getElementById(
            "formula"
        );

    const state =
        document.getElementById(
            "musical-state"
        );


    if (
        !layer ||
        !formula ||
        !state
    ) {
        return;
    }


    formula.textContent =
        text;

    state.textContent =
        tonalState.name;


    layer.classList.add(
        "visible"
    );


    clearTimeout(
        lastFormula
    );


    lastFormula =
        setTimeout(
            () => {

                layer.classList.remove(
                    "visible"
                );

            },
            1800
        );

}


// ============================================================
// MATHEMATICS
// ============================================================

function updateMathematics() {

    const t =
        performance.now() *
        0.0001;


    density =
        0.5 +
        0.25 *
        Math.sin(
            t * 1.7
        ) +
        pointerEnergy *
        0.25;


    density =
        Math.max(
            0,
            Math.min(
                1,
                density
            )
        );


    symmetry =
        0.5 +
        0.35 *
        Math.cos(
            t * 0.91
        );


    symmetry =
        Math.max(
            0,
            Math.min(
                1,
                symmetry
            )
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
        pointerEnergy *
        0.012;


    excitation *=
        0.994;


    excitation =
        Math.max(
            0.05,
            Math.min(
                excitation,
                1
            )
        );


    phase +=
        0.002 +
        excitation * 0.004;

}


// ============================================================
// AUDIO UPDATE
// ============================================================

function updateMusic() {

    if (
        !audio ||
        audio.state !== "running" ||
        !filter ||
        !bassGain ||
        !padGain ||
        !airGain ||
        !bassOsc ||
        !padOscA ||
        !padOscB ||
        !airOsc
    ) {
        return;
    }


    const now =
        audio.currentTime;


    // --------------------------------------------------------
    // FILTER
    // --------------------------------------------------------

    const targetFilter =
        520 +
        coherence * 780 +
        excitation * 520;


    filter.frequency
        .linearRampToValueAtTime(
            targetFilter,
            now + 0.35
        );


    // --------------------------------------------------------
    // CONTINUOUS TEXTURES
    // --------------------------------------------------------

    bassGain.gain
        .linearRampToValueAtTime(
            0.025 +
            coherence * 0.025,
            now + 0.5
        );


    padGain.gain
        .linearRampToValueAtTime(
            0.010 +
            coherence * 0.010,
            now + 0.7
        );


    airGain.gain
        .linearRampToValueAtTime(
            0.001 +
            excitation * 0.004,
            now + 0.9
        );


    // --------------------------------------------------------
    // TONAL BODY
    // --------------------------------------------------------

    bassOsc.frequency
        .linearRampToValueAtTime(
            tonalState.root / 2,
            now + 1.5
        );


    const chordDegree =
        Math.floor(
            symmetry * 5
        );


    const chordRoot =
        frequencyFromScale(
            tonalState.root,
            tonalState.scale,
            chordDegree
        );


    padOscA.frequency
        .linearRampToValueAtTime(
            chordRoot,
            now + 1.8
        );


    padOscB.frequency
        .linearRampToValueAtTime(
            chordRoot * 1.5,
            now + 1.8
        );


    airOsc.frequency
        .linearRampToValueAtTime(
            chordRoot * 2,
            now + 2
        );


    // --------------------------------------------------------
    // MELODY
    //
    // Minimum interval deliberately enforced.
    // --------------------------------------------------------

    if (
        now >= nextNoteTime &&
        coherence > 0.56 &&
        now - lastNoteTime > 1.05
    ) {

        musicalDiscovery();


        const duration =
            coherence > 0.78
                ? 2.4
                : 1.7;


        nextNoteTime =
            now +
            duration;

        lastNoteTime =
            now;

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


        targetX =
            event.clientX /
            width -
            0.5;

        targetY =
            0.5 -
            event.clientY /
            height;


        targetX *=
            aspect;


        const dx =
            event.clientX -
            previousX;

        const dy =
            event.clientY -
            previousY;


        const velocity =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        pointerEnergy =
            Math.min(
                velocity / 45,
                1
            );


        previousX =
            event.clientX;

        previousY =
            event.clientY;


        disturbanceEnergy +=
            pointerEnergy *
            0.06;


        disturbanceEnergy =
            Math.min(
                disturbanceEnergy,
                1
            );

    },
    {
        passive: true
    }
);


// ============================================================
// FIRST USER GESTURE
//
// This is the ONLY place where audio starts.
// Works with mouse and touch.
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
            window.devicePixelRatio || 1,
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
        ) / 1000;


    // --------------------------------------------------------
    // MATTER
    // --------------------------------------------------------

    updateMathematics();


    // --------------------------------------------------------
    // FIELD INERTIA
    // --------------------------------------------------------

    mouseX +=
        (
            targetX -
            mouseX
        ) *
        0.025;


    mouseY +=
        (
            targetY -
            mouseY
        ) *
        0.025;


    // --------------------------------------------------------
    // DECAY
    // --------------------------------------------------------

    disturbanceEnergy *=
        0.985;

    pointerEnergy *=
        0.93;


    // --------------------------------------------------------
    // AUDIO
    // --------------------------------------------------------

    updateMusic();


    // --------------------------------------------------------
    // SHADER
    // --------------------------------------------------------

    gl.uniform1f(
        uTime,
        elapsed
    );

    gl.uniform2f(
        uDisturbance,
        mouseX,
        mouseY
    );

    gl.uniform1f(
        uDisturbanceEnergy,
        disturbanceEnergy
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
// STATE LABEL
// ============================================================

setInterval(
    () => {

        const label =
            document.getElementById(
                "state-name"
            );


        if (!label) {
            return;
        }


        if (
            coherence > 0.78
        ) {

            label.textContent =
                "COHERENT";

        } else if (
            excitation > 0.55
        ) {

            label.textContent =
                "EXCITED";

        } else if (
            transition > 0.45
        ) {

            label.textContent =
                "TRANSITION";

        } else {

            label.textContent =
                "OBSERVANT";

        }

    },
    800
);