
// ============================================================
// ZERO INFINIT
// NODE
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
// El ratolí no controla la matèria.
// Només la pertorba.
//
// No hi ha lent.
// No hi ha nucli.
// No hi ha esferes.
//
// La forma emergeix.
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
        f *
        f *
        (
            3.0 -
            2.0 * f
        );

    float a =
        hash(i);

    float b =
        hash(i + vec2(1.0, 0.0));

    float c =
        hash(i + vec2(0.0, 1.0));

    float d =
        hash(i + vec2(1.0, 1.0));

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
// MICROSCOPIC FIELD
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
// ORGANIC FLOW
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
    // ORGANIC MOTION
    // --------------------------------------------------------

    vec2 f =
        flow(p);

    vec2 q =
        p +
        f * (
            0.035 +
            coherence * 0.035
        );


    // --------------------------------------------------------
    // GENTLE DISTURBANCE
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


    q +=
        normalize(
            p - disturbance +
            vec2(0.0001)
        )
        *
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
            matterField(
                q * 2.0
            )
            -
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
    // CRYSTALLINE MICROSTRUCTURE
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
    // SOFT DEPTH
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
// STATE
// ============================================================

let mouseX = 0;
let mouseY = 0;

let targetX = 0;
let targetY = 0;

let disturbanceEnergy = 0;

let coherence = 0.45;
let excitation = 0.22;
let phase = 0;

let previousX = 0;
let previousY = 0;

let pointerEnergy = 0;


// ============================================================
// MATHEMATICAL STATE
// ============================================================

let density = 0.5;
let symmetry = 0.5;
let transition = 0.0;

let lastFormula =
    0;


// ============================================================
// MUSICAL ENGINE
// ============================================================

let audio = null;
let master = null;

let bassGain = null;
let padGain = null;
let airGain = null;

let bassOsc = null;
let padOscA = null;
let padOscB = null;
let airOsc = null;

let filter = null;

let nextNoteTime = 0;
let musicalIndex = 0;

let currentRoot = 220;

let modeName =
    "A DÒRIC";


// ============================================================
// TONAL CENTRES
// ============================================================

const tonalCentres = [

    {
        root: 220.00,
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
        root: 196.00,
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


// ============================================================
// AUDIO
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


    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;


    if (!AudioContext) {
        return;
    }


    audio =
        new AudioContext();


    await audio.resume();


    // --------------------------------------------------------
    // MASTER
    // --------------------------------------------------------

    master =
        audio.createGain();

    master.gain.value =
        6;


    // --------------------------------------------------------
    // FILTER
    // --------------------------------------------------------

    filter =
        audio.createBiquadFilter();

    filter.type =
        "lowpass";

    filter.frequency.value =
        950;

    filter.Q.value =
        0.3;


    filter.connect(
        master
    );

    master.connect(
        audio.destination
    );


    // --------------------------------------------------------
    // BASS
    // --------------------------------------------------------

    bassOsc =
        audio.createOscillator();

    bassOsc.type =
        "sine";

    bassGain =
        audio.createGain();

    bassGain.gain.value =
        0.3;


    bassOsc
        .connect(bassGain)
        .connect(filter);


    // --------------------------------------------------------
    // PAD
    // --------------------------------------------------------

    padOscA =
        audio.createOscillator();

    padOscB =
        audio.createOscillator();


    padOscA.type =
        "sine";

    padOscB.type =
        "triangle";


    padGain =
        audio.createGain();

    padGain.gain.value =
        0.18;


    padOscA
        .connect(padGain)
        .connect(filter);

    padOscB
        .connect(padGain)
        .connect(filter);


    // --------------------------------------------------------
    // AIR
    // --------------------------------------------------------

    airOsc =
        audio.createOscillator();

    airOsc.type =
        "sine";


    airGain =
        audio.createGain();

    airGain.gain.value =
        0.7;


    airOsc
        .connect(airGain)
        .connect(filter);


    // --------------------------------------------------------
    // START
    // --------------------------------------------------------

    const now =
        audio.currentTime;

    bassOsc.start(now);
    padOscA.start(now);
    padOscB.start(now);
    airOsc.start(now);


    master.gain
        .exponentialRampToValueAtTime(
            3,
            now + 5
        );


    nextNoteTime =
        now + 1;
}


// ============================================================
// NOTE
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
// MUSICAL DISCOVERY
// ============================================================

function musicalDiscovery() {

    if (!audio) {
        return;
    }


    const now =
        audio.currentTime;


    const scale =
        tonalState.scale;


    const degree =
        Math.floor(
            density *
            scale.length
        )
        %
        scale.length;


    const note =
        frequencyFromScale(
            tonalState.root,
            scale,
            degree
        );


    // --------------------------------------------------------
    // MELODIC VOICE
    // --------------------------------------------------------

    const voice =
        audio.createOscillator();

    const gain =
        audio.createGain();


    voice.type =
        "sine";


    voice.frequency.value =
        note;


    gain.gain.setValueAtTime(
        0.0001,
        now
    );


    gain.gain.exponentialRampToValueAtTime(
        0.018,
        now + 0.08
    );


    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 1.8
    );


    voice
        .connect(gain)
        .connect(filter);


    voice.start(now);

    voice.stop(
        now + 2
    );


    musicalIndex++;


    // --------------------------------------------------------
    // FORMULA
    // --------------------------------------------------------

    showFormula(
        musicalIndex % 3 === 0
            ? "ΔE → ♪"
            : "ρ + ∇ρ → excitation"
    );


    // --------------------------------------------------------
    // OCCASIONAL TONAL CHANGE
    // --------------------------------------------------------

    if (
        coherence > 0.72 &&
        transition > 0.55 &&
        Math.random() > 0.72
    ) {

        changeTonalCentre();
    }
}


// ============================================================
// TONAL CHANGE
// ============================================================

function changeTonalCentre() {

    let next =
        tonalCentres[
            Math.floor(
                Math.random() *
                tonalCentres.length
            )
        ];


    if (
        next ===
        tonalState
    ) {
        return;
    }


    tonalState =
        next;

    currentRoot =
        next.root;

    modeName =
        next.name;


    const now =
        audio.currentTime;


    bassOsc.frequency
        .linearRampToValueAtTime(
            next.root / 2,
            now + 2.5
        );


    showFormula(
        "C(t) ↑  →  " +
        next.name
    );
}


// ============================================================
// FORMULA DISPLAY
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


    formula.textContent =
        text;

    state.textContent =
        modeName;


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
// MATHEMATICAL STATE
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


    symmetry =
        0.5 +
        0.35 *
        Math.cos(
            t * 0.91
        );


    transition =
        Math.abs(
            density -
            symmetry
        );


    coherence =
        1.0 -
        transition;


    excitation +=
        pointerEnergy *
        0.015;


    excitation *=
        0.992;


    excitation =
        Math.max(
            0.05,
            Math.min(
                excitation,
                1
            )
        );
}


// ============================================================
// AUDIO UPDATE
// ============================================================

function updateMusic() {

    if (!audio) {
        return;
    }


    const now =
        audio.currentTime;


    const targetFilter =
        600 +
        coherence * 900 +
        excitation * 650;


    filter.frequency
        .linearRampToValueAtTime(
            targetFilter,
            now + 0.4
        );


    bassGain.gain
        .linearRampToValueAtTime(
            0.035 +
            coherence * 0.025,
            now + 0.5
        );


    padGain.gain
        .linearRampToValueAtTime(
            0.012 +
            coherence * 0.014,
            now + 0.6
        );


    airGain.gain
        .linearRampToValueAtTime(
            0.001 +
            excitation * 0.006,
            now + 0.7
        );


    bassOsc.frequency
        .linearRampToValueAtTime(
            tonalState.root / 2,
            now + 1.5
        );


    const chordRoot =
        frequencyFromScale(
            tonalState.root,
            tonalState.scale,
            Math.floor(
                symmetry * 5
            )
        );


    padOscA.frequency
        .linearRampToValueAtTime(
            chordRoot,
            now + 2
        );


    padOscB.frequency
        .linearRampToValueAtTime(
            chordRoot * 1.5,
            now + 2
        );


    airOsc.frequency
        .linearRampToValueAtTime(
            chordRoot * 2,
            now + 2.5
        );


    // --------------------------------------------------------
    // AUTOGENERATED MELODY
    // --------------------------------------------------------

    if (
        now >= nextNoteTime &&
        coherence > 0.58
    ) {

        musicalDiscovery();


        const duration =
            coherence >
            0.78
                ? 2.2
                : 1.4;


        nextNoteTime =
            now +
            duration;
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
            (
                event.clientX /
                width
            ) -
            0.5;

        targetY =
            0.5 -
            (
                event.clientY /
                height
            );


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


        startAudio();
    },
    {
        passive: true
    }
);


window.addEventListener(
    "pointerdown",
    () => {

        startAudio();

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
    // MATÈRIA
    // --------------------------------------------------------

    updateMathematics();


    // --------------------------------------------------------
    // INÈRCIA DEL CAMP
    // --------------------------------------------------------

    mouseX +=
        (
            targetX -
            mouseX
        ) * 0.025;


    mouseY +=
        (
            targetY -
            mouseY
        ) * 0.025;


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
    // UNIFORMS
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

