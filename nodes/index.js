
// ============================================================
// ZERO INFINIT — HARMONIC FIELD
//
// EXPERIÈNCIA AUDIOVISUAL INTERACTIVA
//
// GEST
//   ↓
// FIELD
//   ↓
// MATÈRIA
//   ↓
// HARMONIA
//   ↓
// BASS / DRONE / VOICE FIELD
//   ↓
// ESPAI
//
// ------------------------------------------------------------
//
// CENTRE TONAL
//
// F# menor
//
// F#  = tònica
// A   = tercera menor / relativa major
// B   = subdominant
// C#  = dominant
// D   = color
// E   = extensió / tensió
//
// ------------------------------------------------------------
//
// PRINCIPI:
//
// El ratolí pot modificar l'expressió,
// però NO pot desafinar l'organisme.
//
// El moviment controla:
//
//   energia
//   densitat
//   filtre
//   wobble
//   textura
//   espai
//   articulació
//
// Però totes les freqüències musicals
// provenen de la gramàtica harmònica.
//
// ------------------------------------------------------------
//
// NODES:
//
// Els nodes són portes.
//
// No alimenten l'àudio.
// No modifiquen l'harmonia.
// No formen part del motor musical.
//
// Són accessibles des del camp.
//
// ============================================================


// ============================================================
// CANVAS
// ============================================================

const canvas =
    document.getElementById("canvas");

const ctx =
    canvas.getContext("2d");


// ============================================================
// VIEWPORT
// ============================================================

let width = 0;
let height = 0;
let dpr = 1;

let time = 0;


// ============================================================
// POINTER
// ============================================================

const pointer = {

    x: 0,
    y: 0,

    px: 0,
    py: 0,

    vx: 0,
    vy: 0,

    speed: 0,

    active: false,

    age: 999

};


// ============================================================
// FIELD
// ============================================================

const field = {

    energy: 0.08,
    targetEnergy: 0.08,

    velocity: 0,
    radial: 0,

    angle: 0,

    rotation: 0,

    turbulence: 0.12,
    density: 0.22,

    pulse: 0,

    feedback: 0,
    distortion: 0,

    artifact: 0,
    sonic: 0,

    bass: 0,
    kick: 0,

    flow: 0,
    memory: 0

};


// ============================================================
// HARMONIC SYSTEM
//
// Tot està expressat respecte de F# menor.
//
// El ratolí NO determina directament cap pitch.
//
// ============================================================

const HARMONY = {

    F2: 92.4986,

    A2: 110.0000,

    B2: 123.4708,

    C3: 130.8128,

    Csharp3: 138.5913,

    D3: 146.8324,

    E3: 164.8138,

    F3: 174.6141,

    A3: 220.0000,

    Csharp4: 277.1826,

    E4: 329.6276

};


// ============================================================
// CHORDS
//
// Progressió orgànica:
//
// F#m → D → A → E
//
// No és un loop rígid.
// L'estat del camp determina quan
// es produeix la convergència.
//
// ============================================================

const CHORDS = [

    {

        name: "F#m",

        root: HARMONY.F2,

        bass: HARMONY.F2,

        voice: [
            HARMONY.A3,
            HARMONY.Csharp4
        ]

    },

    {

        name: "D",

        root: HARMONY.D3,

        bass: HARMONY.D3 / 2,

        voice: [
            HARMONY.F3,
            HARMONY.A3
        ]

    },

    {

        name: "A",

        root: HARMONY.A2,

        bass: HARMONY.A2,

        voice: [
            HARMONY.Csharp4,
            HARMONY.E4
        ]

    },

    {

        name: "E",

        root: HARMONY.E3,

        bass: HARMONY.E3 / 2,

        voice: [
            HARMONY.FsharpSafe ||
            HARMONY.F2 * 2,
            HARMONY.B2 * 2
        ]

    }

];


// Evitem dependències estranyes
// dins la definició d'E.

CHORDS[3].voice = [

    HARMONY.F2 * 4,
    HARMONY.B2 * 2

];


// ============================================================
// HARMONIC STATE
// ============================================================

const harmonicState = {

    current: 0,

    target: 0,

    lastChange: 0,

    transition: 0,

    convergence: 0,

    hold: 0

};


// ============================================================
// PARTICLES
// ============================================================

const particles = [];

const PARTICLE_COUNT = 1700;


// ============================================================
// ARTIFACTS
// ============================================================

const artifacts = [];

const ARTIFACT_COUNT = 220;


// ============================================================
// NODES
// ============================================================

let nodes = [];

let nodeVisibility = 0;


// ============================================================
// AUDIO
// ============================================================

let audioStarted = false;

let audioContext = null;


// ============================================================
// MASTER
// ============================================================

let master = null;

let limiter = null;


// ============================================================
// BUSSES
// ============================================================

let voiceBus = null;

let dryBus = null;

let spaceBus = null;

let bassBus = null;

let subBus = null;

let kickBus = null;

let fxBus = null;


// ============================================================
// SPACE
// ============================================================

let reverb = null;

let reverbGain = null;

let delay = null;

let delayGain = null;


// ============================================================
// VOICE
// ============================================================

let voiceA3 = null;

let voiceA2 = null;

let voiceBody = null;

let voiceFormant = null;

let voiceFormantHigh = null;

let voiceGain = null;

let voiceVibrato = null;

let voiceVibratoGain = null;


// ============================================================
// BASS
// ============================================================

let bassOsc = null;

let bassGain = null;

let bassFilter = null;

let bassLFO = null;

let bassLFOGain = null;


// ============================================================
// SUB
// ============================================================

let subOsc = null;

let subGain = null;


// ============================================================
// DRONE
// ============================================================

let droneVoices = [];


// ============================================================
// GAS
// ============================================================

let noiseSource = null;

let noiseFilter = null;

let noiseGain = null;


// ============================================================
// GRANULAR
// ============================================================

let granularBuffer = null;

let lastGrain = 0;


// ============================================================
// KICK
// ============================================================

let lastKick = 0;


// ============================================================
// CRISP
// ============================================================

let lastBassCrisp = 0;


// ============================================================
// AUDIO STATE
// ============================================================

let audioEnergy = 0;


// ============================================================
// RESIZE
// ============================================================

function resize() {

    dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    width =
        window.innerWidth;

    height =
        window.innerHeight;

    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;

    canvas.style.width =
        width + "px";

    canvas.style.height =
        height + "px";

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    createParticles();

    createArtifacts();

}


window.addEventListener(
    "resize",
    resize
);


// ============================================================
// POINTER
// ============================================================

window.addEventListener(
    "pointermove",
    event => {

        if (!pointer.active) {

            pointer.x =
                event.clientX;

            pointer.y =
                event.clientY;

            pointer.px =
                pointer.x;

            pointer.py =
                pointer.y;

        }

        pointer.px =
            pointer.x;

        pointer.py =
            pointer.y;

        pointer.x =
            event.clientX;

        pointer.y =
            event.clientY;

        pointer.vx =
            pointer.x -
            pointer.px;

        pointer.vy =
            pointer.y -
            pointer.py;

        pointer.speed =
            Math.sqrt(
                pointer.vx *
                pointer.vx +
                pointer.vy *
                pointer.vy
            );

        pointer.active = true;

        pointer.age = 0;

    }
);


window.addEventListener(
    "pointerleave",
    () => {

        pointer.active = false;

    }
);


window.addEventListener(
    "pointerdown",
    event => {

        startAudio();

        field.energy =
            Math.max(
                field.energy,
                0.42
            );

        const node =
            findNodeAt(
                event.clientX,
                event.clientY
            );

        if (node) {

            openNode(node);

        }

    }
);


// ============================================================
// LOAD NODES
// ============================================================

async function loadNodes() {

    try {

        const response =
            await fetch(
                "./index.json"
            );

        if (!response.ok) {

            throw new Error(
                "index.json no disponible"
            );

        }

        const registry =
            await response.json();

        const entries =
            Array.isArray(
                registry
            )
                ? registry
                : registry.nodes || [];

        nodes =
            entries.map(
                (node, index) => {

                    return {

                        ...node,

                        angle:
                            (
                                index /
                                Math.max(
                                    entries.length,
                                    1
                                )
                            )
                            *
                            Math.PI *
                            2,

                        distance:
                            150 +
                            index * 48,

                        phase:
                            Math.random() *
                            Math.PI *
                            2,

                        influence: 0,

                        protected: true

                    };

                }
            );

    }

    catch (error) {

        console.warn(
            "Nodes no disponibles:",
            error
        );

        nodes = [];

    }

}


loadNodes();


// ============================================================
// PARTICLES
// ============================================================

function createParticles() {

    particles.length = 0;

    const scale =
        Math.max(
            width,
            height
        );

    for (
        let i = 0;
        i < PARTICLE_COUNT;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI *
            2;

        const radius =
            Math.pow(
                Math.random(),
                0.62
            )
            *
            scale
            *
            0.82;

        particles.push({

            x:
                width * 0.5 +
                Math.cos(angle) *
                radius,

            y:
                height * 0.5 +
                Math.sin(angle) *
                radius *
                0.65,

            vx: 0,
            vy: 0,

            size:
                0.25 +
                Math.random() *
                2.1,

            alpha:
                0.018 +
                Math.random() *
                0.11,

            phase:
                Math.random() *
                Math.PI *
                2,

            speed:
                0.15 +
                Math.random() *
                1.15

        });

    }

}


// ============================================================
// ARTIFACTS
// ============================================================

function createArtifacts() {

    artifacts.length = 0;

    for (
        let i = 0;
        i < ARTIFACT_COUNT;
        i++
    ) {

        artifacts.push({

            x:
                Math.random(),

            y:
                Math.random(),

            phase:
                Math.random() *
                Math.PI *
                2,

            scale:
                0.2 +
                Math.random() *
                1.8,

            type:
                Math.floor(
                    Math.random() * 4
                )

        });

    }

}


// ============================================================
// FIELD
// ============================================================

function updateField() {

    const cx =
        width * 0.5;

    const cy =
        height * 0.5;

    const dx =
        pointer.x -
        cx;

    const dy =
        pointer.y -
        cy;

    const maxRadius =
        Math.sqrt(
            cx * cx +
            cy * cy
        );

    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    field.radial =
        Math.min(
            distance /
            maxRadius,
            1
        );

    field.angle =
        Math.atan2(
            dy,
            dx
        );

    const movement =
        Math.min(
            pointer.speed / 22,
            1
        );

    const radialEnergy =
        0.10 +
        Math.sin(
            field.radial *
            Math.PI
        )
        *
        0.40;

    field.targetEnergy =
        Math.min(
            1,
            radialEnergy +
            movement * 0.65 +
            field.feedback * 0.28
        );

    field.energy +=
        (
            field.targetEnergy -
            field.energy
        )
        *
        0.035;

    field.velocity +=
        (
            movement -
            field.velocity
        )
        *
        0.08;

    field.flow +=
        (
            (
                field.velocity * 0.9 +
                field.energy * 0.25
            )
            -
            field.flow
        )
        *
        0.06;

    const turbulenceWave =
        Math.sin(
            time * 0.17 +
            field.angle * 3
        );

    field.turbulence =
        Math.max(
            0.05,
            0.12 +
            field.energy * 0.68 +
            turbulenceWave * 0.08
        );

    field.density +=
        (
            (
                0.20 +
                field.energy * 0.78
            )
            -
            field.density
        )
        *
        0.025;

    field.rotation +=
        0.0006 +
        field.velocity * 0.004;

    field.pulse =
        (
            Math.sin(
                time *
                Math.PI *
                2 *
                0.12
            )
            +
            1
        )
        *
        0.5;

    field.distortion =
        field.energy *
        (
            0.35 +
            field.velocity * 1.4
        );

    field.memory +=
        (
            field.energy -
            field.memory
        )
        *
        0.012;

    pointer.age +=
        0.016;

}


// ============================================================
// HARMONIC FIELD
//
// El moviment del ratolí només influeix
// en QUAN canvia l'harmonia.
//
// No determina mai una freqüència arbitrària.
//
// ============================================================

function updateHarmony() {

    if (!audioStarted) {

        return;

    }

    const now =
        audioContext.currentTime;

    const pressure =
        field.energy * 0.55 +
        field.flow * 0.30 +
        field.memory * 0.15;

    /*
     * Temps mínim entre moviments harmònics.
     */

    const interval =
        4.5 -
        pressure * 1.8;

    if (
        pressure > 0.40 &&
        now -
        harmonicState.lastChange >
        interval
    ) {

        /*
         * F#m apareix amb més freqüència.
         *
         * D / A / E donen moviment.
         */

        const choices = [

            0,
            0,
            0,

            1,

            2,

            3

        ];

        harmonicState.target =
            choices[
                Math.floor(
                    Math.random() *
                    choices.length
                )
            ];

        harmonicState.lastChange =
            now;

        harmonicState.hold =
            1;

    }

    /*
     * Transició lenta.
     */

    harmonicState.current +=
        (
            harmonicState.target -
            harmonicState.current
        )
        *
        0.008;

    /*
     * Convergència:
     *
     * només apareix quan l'estat
     * s'acosta prou a l'acord objectiu.
     */

    const distance =
        Math.abs(
            harmonicState.target -
            harmonicState.current
        );

    const convergence =
        Math.max(
            0,
            1 -
            distance * 2.4
        );

    harmonicState.convergence +=
        (
            convergence -
            harmonicState.convergence
        )
        *
        0.025;

}


// ============================================================
// CURRENT CHORD
// ============================================================

function getCurrentChord() {

    const index =
        Math.round(
            harmonicState.current
        );

    return CHORDS[
        Math.max(
            0,
            Math.min(
                CHORDS.length - 1,
                index
            )
        )
    ];

}


// ============================================================
// NODES FIELD
// ============================================================

function updateNodes() {

    if (!nodes.length) {

        return;

    }

    nodes.forEach(
        node => {

            const pos =
                getNodePosition(
                    node
                );

            const dx =
                pointer.x -
                pos.x;

            const dy =
                pointer.y -
                pos.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            const target =
                pointer.active
                    ? Math.max(
                        0,
                        1 -
                        distance / 190
                    )
                    : 0;

            node.influence +=
                (
                    target -
                    node.influence
                )
                *
                0.06;

        }
    );

    const targetVisibility =
        Math.min(
            1,
            0.15 +
            field.memory * 1.9
        );

    nodeVisibility +=
        (
            targetVisibility -
            nodeVisibility
        )
        *
        0.025;

}


// ============================================================
// PARTICLE FIELD
// ============================================================

function updateParticles() {

    const cx =
        width * 0.5;

    const cy =
        height * 0.5;

    particles.forEach(
        particle => {

            const dx =
                particle.x -
                cx;

            const dy =
                particle.y -
                cy;

            const radius =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            const angle =
                Math.atan2(
                    dy,
                    dx
                );

            const noiseA =
                Math.sin(
                    radius * 0.006 +
                    angle * 4 +
                    time * 0.32 +
                    particle.phase
                );

            const noiseB =
                Math.cos(
                    radius * 0.012 -
                    angle * 7 -
                    time * 0.19
                );

            const swirl =
                (
                    0.00028 +
                    field.energy * 0.00145
                )
                *
                (
                    1 +
                    noiseA * 0.65
                );

            particle.vx +=
                -Math.sin(angle) *
                swirl *
                radius;

            particle.vy +=
                Math.cos(angle) *
                swirl *
                radius;

            particle.vx +=
                noiseA *
                field.turbulence *
                0.010;

            particle.vy +=
                noiseB *
                field.turbulence *
                0.010;

            particle.vx +=
                -dx *
                0.000007 *
                field.energy;

            particle.vy +=
                -dy *
                0.000007 *
                field.energy;

            if (
                pointer.active
            ) {

                const px =
                    particle.x -
                    pointer.x;

                const py =
                    particle.y -
                    pointer.y;

                const pd =
                    Math.sqrt(
                        px * px +
                        py * py
                    );

                const influence =
                    Math.max(
                        0,
                        1 -
                        pd / 440
                    );

                const force =
                    influence *
                    field.velocity *
                    0.060;

                particle.vx +=
                    -py /
                    Math.max(
                        pd,
                        1
                    )
                    *
                    force;

                particle.vy +=
                    px /
                    Math.max(
                        pd,
                        1
                    )
                    *
                    force;

            }

            particle.vx *=
                0.982;

            particle.vy *=
                0.982;

            particle.x +=
                particle.vx *
                particle.speed;

            particle.y +=
                particle.vy *
                particle.speed;

            const margin =
                180;

            if (
                particle.x < -margin ||
                particle.x >
                    width + margin ||
                particle.y < -margin ||
                particle.y >
                    height + margin
            ) {

                resetParticle(
                    particle
                );

            }

        }
    );

}


// ============================================================
// RESET PARTICLE
// ============================================================

function resetParticle(
    particle
) {

    const angle =
        Math.random() *
        Math.PI *
        2;

    const radius =
        Math.min(
            width,
            height
        )
        *
        (
            0.25 +
            Math.random() * 0.62
        );

    particle.x =
        width * 0.5 +
        Math.cos(angle) *
        radius;

    particle.y =
        height * 0.5 +
        Math.sin(angle) *
        radius *
        0.64;

    particle.vx = 0;

    particle.vy = 0;

}


// ============================================================
// AUDIO START
// ============================================================

function startAudio() {

    if (audioStarted) {

        if (
            audioContext.state ===
            "suspended"
        ) {

            audioContext.resume();

        }

        return;

    }

    audioContext =
        new AudioContext();

    audioStarted = true;

    createAudio();

}


// ============================================================
// AUDIO GRAPH
// ============================================================

function createAudio() {

    master =
        audioContext.createGain();

    master.gain.value =
        0.65;

    limiter =
        audioContext
            .createDynamicsCompressor();

    limiter.threshold.value =
        -3;

    limiter.knee.value =
        2;

    limiter.ratio.value =
        12;

    limiter.attack.value =
        0.003;

    limiter.release.value =
        0.18;

    master
        .connect(limiter)
        .connect(
            audioContext.destination
        );

    voiceBus =
        audioContext.createGain();

    dryBus =
        audioContext.createGain();

    spaceBus =
        audioContext.createGain();

    bassBus =
        audioContext.createGain();

    subBus =
        audioContext.createGain();

    kickBus =
        audioContext.createGain();

    fxBus =
        audioContext.createGain();

    voiceBus.gain.value =
        1;

    dryBus.gain.value =
        1;

    spaceBus.gain.value =
        0.68;

    bassBus.gain.value =
        1;

    subBus.gain.value =
        0.95;

    kickBus.gain.value =
        0.85;

    fxBus.gain.value =
        0.65;

    voiceBus.connect(
        dryBus
    );

    dryBus.connect(
        master
    );

    voiceBus.connect(
        spaceBus
    );

    spaceBus.connect(
        master
    );

    bassBus.connect(
        master
    );

    subBus.connect(
        master
    );

    kickBus.connect(
        master
    );

    fxBus.connect(
        spaceBus
    );

    createSpace();

    createVoice();

    createBass();

    createSub();

    createDrone();

    createGas();

    createGranular();

}


// ============================================================
// SPACE
// ============================================================

function createSpace() {

    reverb =
        audioContext.createConvolver();

    const seconds =
        3.8;

    const length =
        audioContext.sampleRate *
        seconds;

    const impulse =
        audioContext.createBuffer(
            2,
            length,
            audioContext.sampleRate
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

            data[i] =
                (
                    Math.random() * 2 -
                    1
                )
                *
                Math.pow(
                    1 -
                    i / length,
                    3.1
                );

        }

    }

    reverb.buffer =
        impulse;

    reverbGain =
        audioContext.createGain();

    reverbGain.gain.value =
        0.10;

    delay =
        audioContext.createDelay(
            1
        );

    delay.delayTime.value =
        0.31;

    delayGain =
        audioContext.createGain();

    delayGain.gain.value =
        0.045;

    spaceBus.connect(
        reverb
    );

    reverb
        .connect(reverbGain)
        .connect(master);

    spaceBus.connect(
        delay
    );

    delay
        .connect(delayGain)
        .connect(master);

}


// ============================================================
// VOICE
//
// De moment és una veu espectral molt discreta.
//
// La seva harmonia serà governada
// pel sistema F# menor.
//
// ============================================================

function createVoice() {

    voiceA3 =
        audioContext.createOscillator();

    voiceA3.type =
        "triangle";

    voiceA3.frequency.value =
        HARMONY.A3;

    voiceA2 =
        audioContext.createOscillator();

    voiceA2.type =
        "sine";

    voiceA2.frequency.value =
        HARMONY.F2;

    voiceFormant =
        audioContext.createBiquadFilter();

    voiceFormant.type =
        "bandpass";

    voiceFormant.frequency.value =
        280;

    voiceFormant.Q.value =
        2.4;

    voiceFormantHigh =
        audioContext.createBiquadFilter();

    voiceFormantHigh.type =
        "bandpass";

    voiceFormantHigh.frequency.value =
        720;

    voiceFormantHigh.Q.value =
        2.5;

    voiceBody =
        audioContext.createBiquadFilter();

    voiceBody.type =
        "lowpass";

    voiceBody.frequency.value =
        600;

    voiceGain =
        audioContext.createGain();

    voiceGain.gain.value =
        0.028;

    const a3Gain =
        audioContext.createGain();

    a3Gain.gain.value =
        0.65;

    voiceA3
        .connect(a3Gain)
        .connect(voiceFormant);

    const a2Gain =
        audioContext.createGain();

    a2Gain.gain.value =
        0.55;

    voiceA2
        .connect(a2Gain)
        .connect(voiceFormant);

    voiceFormant
        .connect(voiceFormantHigh)
        .connect(voiceGain);

    const bodyGain =
        audioContext.createGain();

    bodyGain.gain.value =
        0.42;

    voiceA2
        .connect(voiceBody)
        .connect(bodyGain)
        .connect(voiceGain);

    voiceGain.connect(
        voiceBus
    );

    voiceVibrato =
        audioContext.createOscillator();

    voiceVibrato.type =
        "sine";

    voiceVibrato.frequency.value =
        4.8;

    voiceVibratoGain =
        audioContext.createGain();

    voiceVibratoGain.gain.value =
        0.18;

    voiceVibrato
        .connect(voiceVibratoGain)
        .connect(voiceA3.detune);

    const partials = [

        [HARMONY.F3, 0.004],

        [HARMONY.Csharp4, 0.003],

        [HARMONY.E4, 0.0015]

    ];

    partials.forEach(
        partial => {

            const osc =
                audioContext
                    .createOscillator();

            osc.type =
                "sine";

            osc.frequency.value =
                partial[0];

            const gain =
                audioContext
                    .createGain();

            gain.gain.value =
                partial[1];

            osc
                .connect(gain)
                .connect(voiceBus);

            osc.start();

        }
    );

    voiceA3.start();

    voiceA2.start();

    voiceVibrato.start();

}


// ============================================================
// BASS
// ============================================================

function createBass() {

    bassOsc =
        audioContext.createOscillator();

    bassOsc.type =
        "sawtooth";

    bassOsc.frequency.value =
        HARMONY.F2;

    bassFilter =
        audioContext.createBiquadFilter();

    bassFilter.type =
        "lowpass";

    bassFilter.frequency.value =
        220;

    bassFilter.Q.value =
        2.8;

    bassGain =
        audioContext.createGain();

    bassGain.gain.value =
        0;

    bassLFO =
        audioContext.createOscillator();

    bassLFO.type =
        "sine";

    bassLFO.frequency.value =
        0.13;

    bassLFOGain =
        audioContext.createGain();

    bassLFOGain.gain.value =
        40;

    bassLFO
        .connect(bassLFOGain)
        .connect(
            bassFilter.frequency
        );

    bassOsc
        .connect(bassFilter)
        .connect(bassGain)
        .connect(bassBus);

    bassOsc.start();

    bassLFO.start();

}


// ============================================================
// SUB
// ============================================================

function createSub() {

    subOsc =
        audioContext.createOscillator();

    subOsc.type =
        "sine";

    subOsc.frequency.value =
        HARMONY.F2 / 2;

    subGain =
        audioContext.createGain();

    subGain.gain.value =
        0;

    subOsc
        .connect(subGain)
        .connect(subBus);

    subOsc.start();

}


// ============================================================
// DRONE
// ============================================================

function createDrone() {

    const frequencies = [

        HARMONY.F3,

        HARMONY.A3,

        HARMONY.Csharp4

    ];

    frequencies.forEach(
        (
            frequency,
            index
        ) => {

            const osc =
                audioContext
                    .createOscillator();

            osc.type =
                index === 0
                    ? "sine"
                    : "triangle";

            osc.frequency.value =
                frequency;

            const filter =
                audioContext
                    .createBiquadFilter();

            filter.type =
                "lowpass";

            filter.frequency.value =
                500;

            const gain =
                audioContext
                    .createGain();

            gain.gain.value =
                0;

            osc
                .connect(filter)
                .connect(gain)
                .connect(spaceBus);

            osc.start();

            droneVoices.push({

                osc,
                filter,
                gain,

                phase:
                    Math.random() *
                    Math.PI *
                    2

            });

        }
    );

}


// ============================================================
// GAS
//
// Molt més discret.
// No volem white noise dominant.
//
// ============================================================

function createGas() {

    const buffer =
        audioContext.createBuffer(
            1,
            audioContext.sampleRate * 2,
            audioContext.sampleRate
        );

    const data =
        buffer.getChannelData(0);

    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        data[i] =
            Math.random() * 2 -
            1;

    }

    noiseSource =
        audioContext.createBufferSource();

    noiseSource.buffer =
        buffer;

    noiseSource.loop =
        true;

    noiseFilter =
        audioContext.createBiquadFilter();

    noiseFilter.type =
        "bandpass";

    noiseFilter.frequency.value =
        520;

    noiseFilter.Q.value =
        0.45;

    noiseGain =
        audioContext.createGain();

    noiseGain.gain.value =
        0;

    noiseSource
        .connect(noiseFilter)
        .connect(noiseGain)
        .connect(fxBus);

    noiseSource.start();

}


// ============================================================
// GRANULAR
// ============================================================

function createGranular() {

    const duration =
        2;

    const length =
        audioContext.sampleRate *
        duration;

    granularBuffer =
        audioContext.createBuffer(
            1,
            length,
            audioContext.sampleRate
        );

    const data =
        granularBuffer.getChannelData(
            0
        );

    for (
        let i = 0;
        i < length;
        i++
    ) {

        const envelope =
            Math.sin(
                Math.PI *
                i /
                length
            );

        data[i] =
            (
                Math.random() * 2 -
                1
            )
            *
            envelope
            *
            0.18;

    }

}


// ============================================================
// GRAIN
// ============================================================

function spawnGrain() {

    if (!granularBuffer) {

        return;

    }

    const source =
        audioContext
            .createBufferSource();

    source.buffer =
        granularBuffer;

    source.playbackRate.value =
        0.55 +
        Math.random() *
        0.95;

    const filter =
        audioContext
            .createBiquadFilter();

    filter.type =
        "bandpass";

    filter.frequency.value =
        500 +
        Math.random() *
        1800;

    filter.Q.value =
        2.5 +
        Math.random() * 4;

    const gain =
        audioContext.createGain();

    gain.gain.value =
        0;

    source
        .connect(filter)
        .connect(gain)
        .connect(fxBus);

    const now =
        audioContext.currentTime;

    const amount =
        0.008 +
        field.turbulence *
        0.022;

    gain.gain
        .setValueAtTime(
            0,
            now
        );

    gain.gain
        .linearRampToValueAtTime(
            amount,
            now + 0.018
        );

    gain.gain
        .exponentialRampToValueAtTime(
            0.0001,
            now + 0.16 +
            Math.random() * 0.24
        );

    source.start(
        now,
        Math.random() * 1.7
    );

    source.stop(
        now + 0.45
    );

}


// ============================================================
// KICK
// ============================================================

function triggerKick() {

    const now =
        audioContext.currentTime;

    const osc =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    osc.type =
        "sine";

    osc.frequency
        .setValueAtTime(
            68,
            now
        );

    osc.frequency
        .exponentialRampToValueAtTime(
            38,
            now + 0.17
        );

    gain.gain
        .setValueAtTime(
            0.030,
            now
        );

    gain.gain
        .exponentialRampToValueAtTime(
            0.0001,
            now + 0.24
        );

    osc
        .connect(gain)
        .connect(kickBus);

    osc.start(now);

    osc.stop(
        now + 0.25
    );

}


// ============================================================
// BASS CRISP
//
// Petit accent harmònic.
// No white noise.
//
// ============================================================

function triggerBassCrisp() {

    const now =
        audioContext.currentTime;

    const osc =
        audioContext.createOscillator();

    const filter =
        audioContext
            .createBiquadFilter();

    const gain =
        audioContext.createGain();

    osc.type =
        "sawtooth";

    osc.frequency.value =
        HARMONY.Csharp4;

    filter.type =
        "bandpass";

    filter.frequency.value =
        1700 +
        field.flow * 700;

    filter.Q.value =
        3.5;

    gain.gain.setValueAtTime(
        0.0001,
        now
    );

    gain.gain.linearRampToValueAtTime(
        0.014 +
        field.velocity * 0.016,
        now + 0.012
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.085 +
        field.energy * 0.06
    );

    osc
        .connect(filter)
        .connect(gain)
        .connect(fxBus);

    osc.start(now);

    osc.stop(
        now + 0.14
    );

}


// ============================================================
// AUDIO UPDATE
// ============================================================

function updateAudio() {

    if (!audioStarted) {

        return;

    }

    const now =
        audioContext.currentTime;

    const chord =
        getCurrentChord();

    const target =
        Math.min(
            1,
            field.energy * 0.68 +
            field.velocity * 0.32
        );

    audioEnergy +=
        (
            target -
            audioEnergy
        )
        *
        0.025;


    // ========================================================
    // VOICE
    // ========================================================

    const voiceBreath =
        0.82 +
        Math.sin(
            time * 0.29
        ) *
        0.18;

    voiceGain.gain
        .setTargetAtTime(
            0.020 +
            audioEnergy * 0.015 +
            harmonicState.convergence * 0.018,
            now,
            0.30
        );

    voiceFormant.frequency
        .setTargetAtTime(
            245 +
            field.density * 85,
            now,
            0.25
        );

    voiceFormantHigh.frequency
        .setTargetAtTime(
            660 +
            field.flow * 170,
            now,
            0.30
        );

    voiceA2.frequency
        .setTargetAtTime(
            chord.root,
            now,
            0.65
        );

    /*
     * La veu superior segueix
     * la tercera/cinquena de l'acord.
     */

    const voiceTarget =
        chord.voice[
            Math.floor(
                time * 0.08
            ) %
            chord.voice.length
        ];

    voiceA3.frequency
        .setTargetAtTime(
            voiceTarget,
            now,
            0.75
        );

    voiceA3.detune
        .setTargetAtTime(
            Math.sin(
                time * 0.21
            )
            *
            3.5 *
            voiceBreath,
            now,
            0.35
        );

    voiceVibrato.frequency
        .setTargetAtTime(
            4.6 +
            field.flow,
            now,
            0.45
        );


    // ========================================================
    // BASS
    // ========================================================

    const bassBase =
        chord.bass;

    const bassMovement =
        Math.sin(
            time * 0.27
        ) *
        1.4;

    bassOsc.frequency
        .setTargetAtTime(
            bassBase +
            bassMovement,
            now,
            0.22
        );

    /*
     * Wobble:
     *
     * normalment discret,
     * ocasionalment obre el filtre.
     */

    const wobblePressure =
        Math.max(
            0,
            field.energy -
            0.46
        );

    const wobbleAmount =
        wobblePressure *
        360;

    bassLFOGain.gain
        .setTargetAtTime(
            30 +
            wobbleAmount,
            now,
            0.20
        );

    bassLFO.frequency
        .setTargetAtTime(
            0.11 +
            field.velocity * 0.34,
            now,
            0.25
        );

    bassFilter.frequency
        .setTargetAtTime(
            150 +
            field.energy * 250 +
            field.velocity * 170 +
            harmonicState.convergence * 160,
            now,
            0.18
        );

    bassGain.gain
        .setTargetAtTime(
            0.016 +
            audioEnergy * 0.030,
            now,
            0.18
        );


    // ========================================================
    // SUB
    // ========================================================

    subOsc.frequency
        .setTargetAtTime(
            bassBase / 2,
            now,
            0.28
        );

    subGain.gain
        .setTargetAtTime(
            0.008 +
            audioEnergy * 0.013,
            now,
            0.28
        );


    // ========================================================
    // DRONE
    // ========================================================

    droneVoices.forEach(
        (
            drone,
            index
        ) => {

            const breath =
                0.5 +
                Math.sin(
                    time * 0.12 +
                    drone.phase
                )
                *
                0.5;

            const chordNotes = [

                chord.root * 2,

                chord.voice[0],

                chord.voice[
                    1
                ]

            ];

            const targetFrequency =
                chordNotes[
                    index %
                    chordNotes.length
                ];

            drone.osc.frequency
                .setTargetAtTime(
                    targetFrequency,
                    now,
                    0.8
                );

            drone.gain.gain
                .setTargetAtTime(
                    0.004 +
                    audioEnergy *
                    (
                        0.007 +
                        breath * 0.005
                    ) +
                    harmonicState.convergence *
                    0.009,
                    now,
                    0.40
                );

            drone.filter.frequency
                .setTargetAtTime(
                    330 +
                    field.energy * 900 +
                    field.flow * 380,
                    now,
                    0.35
                );

        }
    );


    // ========================================================
    // GAS
    // ========================================================

    /*
     * Reduït dràsticament.
     */

    noiseFilter.frequency
        .setTargetAtTime(
            320 +
            field.velocity * 1500 +
            field.energy * 650,
            now,
            0.18
        );

    noiseGain.gain
        .setTargetAtTime(
            field.velocity * 0.0035 +
            field.turbulence * 0.0018,
            now,
            0.20
        );


    // ========================================================
    // KICK
    // ========================================================

    const kickInterval =
        1.30 -
        field.energy * 0.44;

    if (
        now -
        lastKick >
        kickInterval
        &&
        field.energy >
        0.28
    ) {

        triggerKick();

        lastKick =
            now;

    }


    // ========================================================
    // CRISP
    // ========================================================

    if (
        field.energy >
        0.58
        &&
        field.velocity >
        0.38
        &&
        now -
        lastBassCrisp >
        0.85
    ) {

        triggerBassCrisp();

        lastBassCrisp =
            now;

    }


    // ========================================================
    // GRANULAR
    // ========================================================

    const grainInterval =
        0.75 -
        field.turbulence * 0.25;

    if (
        field.turbulence >
        0.34
        &&
        now -
        lastGrain >
        grainInterval
    ) {

        spawnGrain();

        lastGrain =
            now;

    }


    // ========================================================
    // SPACE
    // ========================================================

    reverbGain.gain
        .setTargetAtTime(
            0.08 +
            field.energy * 0.15 +
            harmonicState.convergence * 0.08,
            now,
            0.40
        );

    delayGain.gain
        .setTargetAtTime(
            0.025 +
            field.flow * 0.045,
            now,
            0.35
        );


    // ========================================================
    // MASTER
    // ========================================================

    master.gain
        .setTargetAtTime(
            0.54 +
            audioEnergy * 0.07,
            now,
            0.30
        );

}


// ============================================================
// AUDIO → VISUAL
// ============================================================

function updateAudioVisualFeedback() {

    if (!audioStarted) {

        return;

    }

    const difference =
        Math.abs(
            audioEnergy -
            field.sonic
        );

    field.sonic +=
        (
            audioEnergy -
            field.sonic
        )
        *
        0.05;

    field.artifact +=
        (
            Math.min(
                1,
                difference * 28 +
                field.velocity * 0.28
            )
            -
            field.artifact
        )
        *
        0.08;

    field.feedback +=
        (
            field.sonic * 0.32 +
            field.energy * 0.28 -
            field.feedback
        )
        *
        0.018;

}


// ============================================================
// NODE POSITION
// ============================================================

function getNodePosition(
    node
) {

    const cx =
        width * 0.5;

    const cy =
        height * 0.5;

    const angle =
        node.angle +
        field.rotation * 0.4;

    const breathing =
        Math.sin(
            time * 0.10 +
            node.phase
        )
        *
        (
            8 +
            field.energy * 16
        );

    const distance =
        node.distance +
        breathing;

    return {

        x:
            cx +
            Math.cos(angle) *
            distance,

        y:
            cy +
            Math.sin(angle) *
            distance *
            0.64

    };

}


// ============================================================
// FIND NODE
// ============================================================

function findNodeAt(
    x,
    y
) {

    if (
        nodeVisibility <
        0.25
    ) {

        return null;

    }

    for (
        const node of nodes
    ) {

        const pos =
            getNodePosition(
                node
            );

        const dx =
            x - pos.x;

        const dy =
            y - pos.y;

        if (
            Math.sqrt(
                dx * dx +
                dy * dy
            ) < 48
        ) {

            return node;

        }

    }

    return null;

}


// ============================================================
// OPEN NODE
// ============================================================

function openNode(
    node
) {

    const target =
        node.path ||
        node.url ||
        `./${node.id}/`;

    window.location.href =
        target;

}


// ============================================================
// BACKGROUND
// ============================================================

function drawBackground() {

    ctx.fillStyle =
        "#020207";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

}


// ============================================================
// NEBULA
// ============================================================

function drawNebula() {

    const cx =
        width * 0.5;

    const cy =
        height * 0.5;

    for (
        let i = 0;
        i < 135;
        i++
    ) {

        const seed =
            i * 2.731;

        const angle =
            seed +
            field.rotation +
            Math.sin(
                time * 0.025 +
                i
            ) *
            0.20;

        const distance =
            20 +
            (
                (
                    i * 137
                )
                %
                Math.max(
                    width,
                    height
                )
            )
            *
            0.72;

        const deformation =
            Math.sin(
                time * 0.075 +
                i * 1.7
            )
            *
            (
                18 +
                field.energy * 75
            );

        const x =
            cx +
            Math.cos(angle) *
            (
                distance +
                deformation
            );

        const y =
            cy +
            Math.sin(angle) *
            (
                distance +
                deformation
            )
            *
            0.68;

        const radius =
            60 +
            Math.sin(
                i * 1.31 +
                time * 0.07
            )
            *
            22 +
            field.energy *
            100;

        const gradient =
            ctx.createRadialGradient(
                x,
                y,
                0,
                x,
                y,
                radius
            );

        gradient.addColorStop(
            0,
            `rgba(
                150,
                86,
                48,
                ${0.014 +
                field.energy * 0.030}
            )`
        );

        gradient.addColorStop(
            0.28,
            `rgba(
                105,
                64,
                76,
                ${0.012 +
                field.energy * 0.022}
            )`
        );

        gradient.addColorStop(
            0.58,
            `rgba(
                62,
                47,
                94,
                ${0.010 +
                field.energy * 0.018}
            )`
        );

        gradient.addColorStop(
            1,
            "rgba(0,0,0,0)"
        );

        ctx.fillStyle =
            gradient;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

}


// ============================================================
// ORGANIC STREAMS
// ============================================================

function drawStreams() {

    const cx =
        width * 0.5;

    const cy =
        height * 0.5;

    ctx.save();

    ctx.globalCompositeOperation =
        "screen";

    for (
        let i = 0;
        i < 42;
        i++
    ) {

        const base =
            i *
            Math.PI *
            2 /
            42;

        ctx.beginPath();

        for (
            let j = 0;
            j < 65;
            j++
        ) {

            const radius =
                35 +
                j *
                Math.max(
                    width,
                    height
                )
                *
                0.010;

            const organic =
                Math.sin(
                    j * 0.20 +
                    time * 0.16 +
                    i
                )
                *
                (
                    10 +
                    field.energy * 48
                );

            const fractal =
                Math.sin(
                    j * 0.61 -
                    time * 0.09 +
                    i * 3
                )
                *
                field.turbulence *
                12;

            const angle =
                base +
                field.rotation * 0.55 +
                organic * 0.002 +
                fractal * 0.001;

            const x =
                cx +
                Math.cos(angle) *
                (
                    radius +
                    organic +
                    fractal
                );

            const y =
                cy +
                Math.sin(angle) *
                (
                    radius +
                    organic +
                    fractal
                )
                *
                0.68;

            if (
                j === 0
            ) {

                ctx.moveTo(
                    x,
                    y
                );

            }
            else {

                ctx.lineTo(
                    x,
                    y
                );

            }

        }

        ctx.strokeStyle =
            `rgba(
                170,
                128,
                165,
                ${0.006 +
                field.energy * 0.014}
            )`;

        ctx.lineWidth =
            0.4 +
            field.energy * 0.8;

        ctx.stroke();

    }

    ctx.restore();

}


// ============================================================
// PARTICLES
// ============================================================

function drawParticles() {

    particles.forEach(
        particle => {

            const pulse =
                0.72 +
                Math.sin(
                    time * 0.65 +
                    particle.phase
                )
                *
                0.28;

            const alpha =
                particle.alpha *
                pulse *
                (
                    0.60 +
                    field.density * 0.9
                );

            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.size *
                (
                    0.7 +
                    field.energy * 0.75
                ),
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(
                    185,
                    154,
                    190,
                    ${alpha}
                )`;

            ctx.fill();

        }
    );

}


// ============================================================
// FRACTAL MASS
// ============================================================

function drawFractalMass() {

    const cx =
        width * 0.5;

    const cy =
        height * 0.5;

    ctx.save();

    ctx.globalCompositeOperation =
        "screen";

    for (
        let branch = 0;
        branch < 24;
        branch++
    ) {

        const seed =
            branch * 2.91;

        ctx.beginPath();

        for (
            let step = 0;
            step < 70;
            step++
        ) {

            const t =
                step / 70;

            const radius =
                30 +
                t *
                Math.max(
                    width,
                    height
                )
                *
                0.56;

            const waveA =
                Math.sin(
                    seed +
                    t * 16 +
                    time * 0.10
                )
                *
                22 *
                field.density;

            const waveB =
                Math.sin(
                    seed * 2 +
                    t * 43 -
                    time * 0.07
                )
                *
                5 *
                field.turbulence;

            const angle =
                seed +
                field.rotation * 0.35 +
                waveA * 0.002 +
                waveB * 0.002;

            const x =
                cx +
                Math.cos(angle) *
                (
                    radius +
                    waveA +
                    waveB
                );

            const y =
                cy +
                Math.sin(angle) *
                (
                    radius +
                    waveA +
                    waveB
                )
                *
                0.63;

            if (
                step === 0
            ) {

                ctx.moveTo(
                    x,
                    y
                );

            }
            else {

                ctx.lineTo(
                    x,
                    y
                );

            }

        }

        ctx.strokeStyle =
            `rgba(
                165,
                125,
                155,
                ${0.006 +
                field.turbulence * 0.018}
            )`;

        ctx.lineWidth =
            0.45 +
            field.density * 0.45;

        ctx.stroke();

    }

    ctx.restore();

}


// ============================================================
// FEEDBACK ARTIFACTS
// ============================================================

function drawArtifacts() {

    ctx.save();

    ctx.globalCompositeOperation =
        "screen";

    const amount =
        18 +
        Math.floor(
            field.artifact * 125
        );

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const artifact =
            artifacts[
                i %
                artifacts.length
            ];

        const wave =
            Math.sin(
                time * 0.42 +
                artifact.phase
            );

        const x =
            artifact.x * width +
            Math.sin(
                time * 0.28 +
                artifact.phase
            )
            *
            field.distortion *
            85;

        const y =
            artifact.y * height +
            Math.cos(
                time * 0.22 +
                artifact.phase
            )
            *
            field.distortion *
            65;

        const size =
            (
                1.5 +
                artifact.scale * 6
            )
            *
            (
                0.65 +
                Math.abs(wave) *
                field.energy
            );

        if (
            artifact.type === 0
        ) {

            ctx.fillStyle =
                `rgba(
                    210,
                    178,
                    150,
                    ${0.012 +
                    field.artifact * 0.06}
                )`;

            ctx.fillRect(
                x,
                y,
                size * 3,
                size
            );

        }

        else if (
            artifact.type === 1
        ) {

            ctx.strokeStyle =
                `rgba(
                    150,
                    135,
                    190,
                    ${0.012 +
                    field.artifact * 0.055}
                )`;

            ctx.beginPath();

            ctx.moveTo(
                x - size * 5,
                y
            );

            ctx.lineTo(
                x + size * 5,
                y
            );

            ctx.stroke();

        }

        else if (
            artifact.type === 2
        ) {

            ctx.strokeStyle =
                `rgba(
                    210,
                    170,
                    125,
                    ${0.010 +
                    field.artifact * 0.05}
                )`;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                size * 2,
                0,
                Math.PI * 2
            );

            ctx.stroke();

        }

        else {

            ctx.fillStyle =
                `rgba(
                    230,
                    210,
                    190,
                    ${0.008 +
                    field.artifact * 0.045}
                )`;

            ctx.fillRect(
                x,
                y,
                size,
                size
            );

        }

    }

    ctx.restore();

}


// ============================================================
// CENTRAL VOID
// ============================================================

function drawVoid() {

    const cx =
        width * 0.5;

    const cy =
        height * 0.5;

    const radius =
        24 +
        field.energy * 18;

    const gradient =
        ctx.createRadialGradient(
            cx,
            cy,
            0,
            cx,
            cy,
            radius * 5
        );

    gradient.addColorStop(
        0,
        `rgba(
            150,
            105,
            80,
            ${0.035 +
            field.energy * 0.045}
        )`
    );

    gradient.addColorStop(
        0.35,
        "rgba(75,50,80,0.018)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );

    ctx.fillStyle =
        gradient;

    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        radius * 5,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


// ============================================================
// NODES
// ============================================================

function drawNodes() {

    if (
        nodeVisibility <
        0.20
    ) {

        return;

    }

    nodes.forEach(
        node => {

            const pos =
                getNodePosition(
                    node
                );

            const influence =
                node.influence;

            const halo =
                16 +
                influence * 34;

            const gradient =
                ctx.createRadialGradient(
                    pos.x,
                    pos.y,
                    0,
                    pos.x,
                    pos.y,
                    halo
                );

            gradient.addColorStop(
                0,
                `rgba(
                    220,
                    200,
                    240,
                    ${nodeVisibility *
                    (
                        0.035 +
                        influence * 0.10
                    )}
                )`
            );

            gradient.addColorStop(
                1,
                "rgba(80,50,120,0)"
            );

            ctx.fillStyle =
                gradient;

            ctx.beginPath();

            ctx.arc(
                pos.x,
                pos.y,
                halo,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.beginPath();

            ctx.arc(
                pos.x,
                pos.y,
                2 +
                influence * 3.5,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(
                    230,
                    220,
                    250,
                    ${nodeVisibility *
                    (
                        0.42 +
                        influence * 0.40
                    )}
                )`;

            ctx.fill();

            if (
                influence > 0.08 ||
                nodeVisibility > 0.60
            ) {

                ctx.font =
                    "10px Arial";

                ctx.textAlign =
                    "center";

                ctx.fillStyle =
                    `rgba(
                        225,
                        215,
                        240,
                        ${nodeVisibility *
                        (
                            0.18 +
                            influence * 0.58
                        )}
                    )`;

                ctx.fillText(
                    node.id,
                    pos.x,
                    pos.y - 14
                );

            }

        }
    );

}


// ============================================================
// FORMULA
// ============================================================

function drawFormula() {

    if (
        field.energy <
        0.58
    ) {

        return;

    }

    const alpha =
        (
            0.5 +
            0.5 *
            Math.sin(
                time * 0.35
            )
        )
        *
        0.075;

    ctx.font =
        "9px monospace";

    ctx.textAlign =
        "left";

    ctx.fillStyle =
        `rgba(
            215,
            190,
            205,
            ${alpha}
        )`;

    const formulas = [

        "F# minor",

        "F# · A · C#",

        "D · A · E",

        "FIELD → HARMONY"

    ];

    const index =
        Math.floor(
            time / 5
        )
        %
        formulas.length;

    ctx.fillText(
        formulas[index],
        18,
        height - 22
    );

}


// ============================================================
// RENDER
// ============================================================

function render(
    milliseconds
) {

    time =
        milliseconds *
        0.001;

    pointer.vx *=
        0.88;

    pointer.vy *=
        0.88;

    pointer.speed *=
        0.91;

    updateField();

    updateHarmony();

    updateNodes();

    updateParticles();

    updateAudio();

    updateAudioVisualFeedback();

    drawBackground();

    drawNebula();

    drawStreams();

    drawParticles();

    drawFractalMass();

    drawArtifacts();

    drawVoid();

    drawNodes();

    drawFormula();

    requestAnimationFrame(
        render
    );

}


// ============================================================
// INIT
// ============================================================

resize();

requestAnimationFrame(
    render
);