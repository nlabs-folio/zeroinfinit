// ============================================================
// ZERO INFINIT — nodeN
//
// LENT → MATÈRIA → FRACTAL → MÚSICA
//
// La lent observa i altera el camp.
// El camp produeix operacions fractals.
// Les operacions determinen densitat, estabilitat i melodia.
// La música no és un loop: es regenera contínuament.
//
// Centres tonals mòbils:
// A minor → C major → E minor → D major → F# minor...
// ============================================================

const canvas = document.getElementById("cosmos");

const gl = canvas.getContext("webgl", {
    antialias: false,
    alpha: false,
    powerPreference: "high-performance"
});

if (!gl) throw new Error("WebGL no disponible");


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

uniform vec2 lens;
uniform float lensRadius;
uniform float lensEnergy;
uniform float memory;
uniform float fractalDepth;

float hash(vec2 p) {
    return fract(
        sin(dot(p, vec2(127.1,311.7))) *
        43758.5453
    );
}

float noise(vec2 p) {

    vec2 i = floor(p);
    vec2 f = fract(p);

    f = f*f*(3.0-2.0*f);

    float a = hash(i);
    float b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0));
    float d = hash(i + vec2(1.0,1.0));

    return mix(
        mix(a,b,f.x),
        mix(c,d,f.x),
        f.y
    );
}

float fbm(vec2 p) {

    float value = 0.0;
    float amp = 0.5;

    for (int i=0;i<6;i++) {
        value += amp * noise(p);
        p *= 2.0;
        amp *= 0.5;
    }

    return value;
}

vec2 flowField(vec2 p) {

    float e = 0.002;

    vec2 drift = vec2(
        time * 0.035,
        -time * 0.022
    );

    float n = fbm(p*2.3 + drift);
    float nx = fbm(p*2.3 + drift + vec2(e,0.0));
    float ny = fbm(p*2.3 + drift + vec2(0.0,e));

    vec2 g = vec2(
        nx-n,
        ny-n
    ) / e;

    return vec2(-g.y,g.x);
}

void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    float aspect =
        resolution.x / resolution.y;

    vec2 p = uv - 0.5;
    p.x *= aspect;

    vec2 flow = flowField(p);

    vec2 field =
        p +
        flow * (0.055 + fractalDepth*0.025);

    field += vec2(
        sin(time*0.22+p.y*2.8),
        cos(time*0.17+p.x*2.2)
    ) * 0.018;

    // --------------------------------------------------------
    // MATÈRIA
    // --------------------------------------------------------

    float cloudA = fbm(
        field*2.0 +
        vec2(time*0.08,-time*0.05)
    );

    float cloudB = fbm(
        field*4.5 -
        vec2(time*0.035,time*0.07)
    );

    float matter =
        cloudA*0.72 +
        cloudB*0.28;

    matter = smoothstep(
        0.29,
        0.78,
        matter
    );

    // --------------------------------------------------------
    // LENT
    // --------------------------------------------------------

    vec2 lv = p-lens;

    float dist = length(lv);

    float influence =
        smoothstep(
            lensRadius*1.15,
            0.0,
            dist
        );

    influence *= lensEnergy;

    vec2 direction =
        normalize(lv+vec2(0.0001));

    float pressure =
        influence *
        (1.0-smoothstep(
            0.0,
            lensRadius,
            dist
        ));

    field +=
        direction *
        pressure *
        0.11;

    // --------------------------------------------------------
    // REFRACT
    // --------------------------------------------------------

    vec2 refracted = p;

    refracted +=
        direction *
        influence *
        0.065;

    refracted +=
        flow *
        influence *
        0.04;

    float altered =
        fbm(
            refracted *
            (2.5+fractalDepth*1.8) +
            vec2(
                time*0.10,
                -time*0.06
            )
        );

    altered = smoothstep(
        0.32,
        0.76,
        altered
    );

    matter = mix(
        matter,
        altered,
        influence*0.78
    );

    // --------------------------------------------------------
    // MEMÒRIA
    // --------------------------------------------------------

    matter +=
        memory *
        influence *
        0.07;

    // --------------------------------------------------------
    // FRACTAL WAVES
    // --------------------------------------------------------

    float r = length(p);

    float fractalWave =
        sin(
            r *
            (18.0+fractalDepth*14.0)
            -
            time*0.42 +
            cloudA*4.0
        );

    fractalWave =
        0.5 +
        0.5*fractalWave;

    fractalWave =
        smoothstep(
            0.68,
            0.95,
            fractalWave
        );

    fractalWave *=
        0.10 +
        fractalDepth*0.14;

    // --------------------------------------------------------
    // LENT — LLUM
    // --------------------------------------------------------

    float glow =
        smoothstep(
            lensRadius*1.1,
            0.0,
            dist
        );

    glow *=
        0.25 +
        lensEnergy*0.7;

    // --------------------------------------------------------
    // PARTICLES
    // --------------------------------------------------------

    vec2 ps = refracted *
        (88.0+fractalDepth*35.0);

    vec2 cell = floor(ps);

    vec2 local =
        fract(ps)-0.5;

    float rnd = hash(cell);

    float particleShape =
        length(
            local-flow*0.018
        );

    float particle =
        smoothstep(
            0.065,
            0.0,
            particleShape
        );

    particle *=
        step(
            0.9955,
            rnd
        );

    particle *=
        0.25+
        0.75*
        (
            0.5+
            0.5*sin(
                time*0.8+
                rnd*30.0
            )
        );

    particle *=
        0.2+
        matter*1.4;

    particle +=
        particle*
        influence*
        1.8;

    // --------------------------------------------------------
    // VOID
    // --------------------------------------------------------

    float voidMask =
        smoothstep(
            0.105,
            0.018,
            r
        );

    matter *=
        1.0-voidMask;

    fractalWave *=
        1.0-voidMask;

    particle *=
        1.0-voidMask;

    // --------------------------------------------------------
    // COLOR
    // --------------------------------------------------------

    vec3 color =
        vec3(
            0.002,
            0.001,
            0.008
        );

    vec3 deep =
        vec3(
            0.075,
            0.018,
            0.17
        );

    vec3 body =
        vec3(
            0.25,
            0.055,
            0.46
        );

    vec3 light =
        vec3(
            0.67,
            0.42,
            0.96
        );

    vec3 lensLight =
        vec3(
            0.55,
            0.72,
            1.0
        );

    color +=
        deep *
        matter *
        1.45;

    color +=
        body *
        matter *
        matter *
        1.15;

    color +=
        light *
        fractalWave;

    color +=
        light *
        particle *
        0.95;

    color +=
        lensLight *
        glow *
        0.22;

    // --------------------------------------------------------
    // LENT CIRCULAR
    // --------------------------------------------------------

    float ring =
        abs(
            dist-lensRadius
        );

    float ringLight =
        smoothstep(
            0.018,
            0.0,
            ring
        );

    ringLight *=
        0.10+
        lensEnergy*0.30;

    color +=
        lensLight *
        ringLight;

    // --------------------------------------------------------
    // VIGNETTE
    // --------------------------------------------------------

    float vignette =
        smoothstep(
            1.48,
            0.20,
            r
        );

    color *= vignette;

    color =
        pow(
            color,
            vec3(0.94)
        );

    gl_FragColor =
        vec4(color,1.0);
}
`;


// ============================================================
// SHADER SETUP
// ============================================================

function compileShader(type, source) {

    const shader =
        gl.createShader(type);

    gl.shaderSource(shader,source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(
        shader,
        gl.COMPILE_STATUS
    )) {

        console.error(
            gl.getShaderInfoLog(shader)
        );

        throw new Error(
            "Threshold: shader compilation failed"
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

gl.linkProgram(program);

if (!gl.getProgramParameter(
    program,
    gl.LINK_STATUS
)) {

    throw new Error(
        "Threshold: WebGL link failed"
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
        -1,-1,
         1,-1,
        -1, 1,

        -1, 1,
         1,-1,
         1, 1
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

    lens:
        gl.getUniformLocation(
            program,
            "lens"
        ),

    lensRadius:
        gl.getUniformLocation(
            program,
            "lensRadius"
        ),

    lensEnergy:
        gl.getUniformLocation(
            program,
            "lensEnergy"
        ),

    memory:
        gl.getUniformLocation(
            program,
            "memory"
        ),

    fractalDepth:
        gl.getUniformLocation(
            program,
            "fractalDepth"
        )
};


// ============================================================
// STATE
// ============================================================

let targetLensX = 0;
let targetLensY = 0;

let currentLensX = 0;
let currentLensY = 0;

let previousX = 0;
let previousY = 0;

let pointerVelocity = 0;

let lensEnergyValue = 0;
let memoryValue = 0;

let exploration = 0;
let fractalDepth = 0;


// ============================================================
// FRACTAL MUSICAL SYSTEM
// ============================================================

const tonalCenters = [

    {
        name: "A minor",
        root: 220.00,
        scale: [0,2,3,5,7,8,10]
    },

    {
        name: "C major",
        root: 261.63,
        scale: [0,2,4,5,7,9,11]
    },

    {
        name: "E minor",
        root: 164.81,
        scale: [0,2,3,5,7,8,10]
    },

    {
        name: "D major",
        root: 293.66,
        scale: [0,2,4,5,7,9,11]
    },

    {
        name: "F# minor",
        root: 185.00,
        scale: [0,2,3,5,7,9,10]
    }
];

let tonalIndex = 0;

let tonalEnergy = 0;
let lastTonalChange = 0;


// ============================================================
// AUDIO
// ============================================================

let audio = null;
let audioStarted = false;

let master = null;
let compressor = null;
let filter = null;

let pan = null;

let drone = null;
let sub = null;
let harmonic = null;
let texture = null;

let droneGain = null;
let subGain = null;
let harmonicGain = null;
let textureGain = null;

let lfo = null;
let lfoGain = null;

let melodyTimer = null;


// ============================================================
// AUDIO START
// ============================================================

async function startAudio() {

    if (audioStarted && audio) {

        if (audio.state === "suspended") {
            await audio.resume();
        }

        return;
    }

    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContext) return;

    try {

        audio =
            new AudioContext();

        await audio.resume();

    } catch (error) {

        console.warn(
            "Threshold audio:",
            error
        );

        return;
    }

    audioStarted = true;

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
        -26;

    compressor.knee.value =
        20;

    compressor.ratio.value =
        2;

    compressor.attack.value =
        0.08;

    compressor.release.value =
        0.5;

    // --------------------------------------------------------
    // FILTER
    // --------------------------------------------------------

    filter =
        audio.createBiquadFilter();

    filter.type =
        "lowpass";

    filter.frequency.value =
        900;

    filter.Q.value =
        0.28;

    // --------------------------------------------------------
    // PAN
    // --------------------------------------------------------

    if (audio.createStereoPanner) {

        pan =
            audio.createStereoPanner();

    }

    filter.connect(compressor);

    compressor.connect(
        pan || master
    );

    if (pan) {
        pan.connect(master);
    }

    master.connect(
        audio.destination
    );

    // --------------------------------------------------------
    // DRONE
    // --------------------------------------------------------

    drone =
        audio.createOscillator();

    drone.type =
        "sine";

    drone.frequency.value =
        110; // A2

    droneGain =
        audio.createGain();

    droneGain.gain.value =
        0.045;

    drone
        .connect(droneGain)
        .connect(filter);

    // --------------------------------------------------------
    // SUBHARMONIC
    // --------------------------------------------------------

    sub =
        audio.createOscillator();

    sub.type =
        "sine";

    sub.frequency.value =
        55; // A1

    subGain =
        audio.createGain();

    subGain.gain.value =
        0.018;

    sub
        .connect(subGain)
        .connect(filter);

    // --------------------------------------------------------
    // HARMONIC
    // --------------------------------------------------------

    harmonic =
        audio.createOscillator();

    harmonic.type =
        "triangle";

    harmonic.frequency.value =
        220;

    harmonicGain =
        audio.createGain();

    harmonicGain.gain.value =
        0.006;

    harmonic
        .connect(harmonicGain)
        .connect(filter);

    // --------------------------------------------------------
    // AIR
    // --------------------------------------------------------

    texture =
        audio.createOscillator();

    texture.type =
        "sine";

    texture.frequency.value =
        440;

    textureGain =
        audio.createGain();

    textureGain.gain.value =
        0.0018;

    texture
        .connect(textureGain)
        .connect(filter);

    // --------------------------------------------------------
    // LFO
    // --------------------------------------------------------

    lfo =
        audio.createOscillator();

    lfo.frequency.value =
        0.055;

    lfoGain =
        audio.createGain();

    lfoGain.gain.value =
        140;

    lfo
        .connect(lfoGain)
        .connect(filter.frequency);

    // --------------------------------------------------------
    // START
    // --------------------------------------------------------

    const now =
        audio.currentTime;

    drone.start(now);
    sub.start(now);
    harmonic.start(now);
    texture.start(now);
    lfo.start(now);

    master.gain.setValueAtTime(
        0.0001,
        now
    );

    master.gain.exponentialRampToValueAtTime(
        0.045,
        now + 5
    );

    startMelodyEngine();
}


// ============================================================
// FRACTAL → NOTE
// ============================================================

function fractalNote() {

    const tonal =
        tonalCenters[tonalIndex];

    const scale =
        tonal.scale;

    const depth =
        Math.floor(
            fractalDepth * 5
        );

    const seed =
        Math.floor(
            Math.random() *
            scale.length
        );

    const degree =
        (
            seed +
            depth +
            Math.floor(
                exploration * 4
            )
        ) %
        scale.length;

    const octave =
        Math.random() > 0.72
            ? 2
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
// MELODY VOICE
// ============================================================

function playMelodyNote() {

    if (!audioStarted || !audio) return;

    const now =
        audio.currentTime;

    const osc =
        audio.createOscillator();

    const gain =
        audio.createGain();

    const notePan =
        audio.createStereoPanner
            ? audio.createStereoPanner()
            : null;

    osc.type =
        "sine";

    const frequency =
        fractalNote();

    osc.frequency.setValueAtTime(
        frequency,
        now
    );

    // Petit moviment expressiu
    osc.detune.setValueAtTime(
        (
            Math.random()-0.5
        ) *
        12,
        now
    );

    const intensity =
        0.010 +
        fractalDepth *
        0.018;

    const duration =
        1.3 +
        Math.random() *
        1.7;

    gain.gain.setValueAtTime(
        0.0001,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        intensity,
        now + 0.12
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + duration
    );

    if (notePan) {

        notePan.pan.value =
            Math.max(
                -0.75,
                Math.min(
                    0.75,
                    currentLensX +
                    (
                        Math.random()-0.5
                    )*0.35
                )
            );

        osc
            .connect(gain)
            .connect(notePan)
            .connect(filter);

    } else {

        osc
            .connect(gain)
            .connect(filter);
    }

    osc.start(now);

    osc.stop(
        now + duration + 0.1
    );
}


// ============================================================
// AUTOGENERATED MUSIC
// ============================================================

function startMelodyEngine() {

    if (melodyTimer) return;

    function tick() {

        if (!audioStarted) return;

        const activity =
            lensEnergyValue +
            fractalDepth +
            exploration;

        // La música existe fins i tot sense punter,
        // però l'exploració la fa més present.

        if (
            Math.random() <
            0.30 +
            Math.min(
                activity * 0.10,
                0.35
            )
        ) {

            playMelodyNote();
        }

        const next =
            1100 +
            Math.random()*1100 -
            fractalDepth*350;

        melodyTimer =
            setTimeout(
                tick,
                Math.max(
                    650,
                    next
                )
            );
    }

    tick();
}


// ============================================================
// TONAL MIGRATION
// ============================================================

function updateTonalCenter(elapsed) {

    const activity =
        lensEnergyValue *
        0.5 +
        exploration *
        0.3 +
        fractalDepth *
        0.2;

    tonalEnergy +=
        activity *
        0.002;

    tonalEnergy *=
        0.997;

    if (
        elapsed -
        lastTonalChange <
        18
    ) {
        return;
    }

    if (
        tonalEnergy >
        0.52
    ) {

        // Moviment tonal petit:
        // mai un salt arbitrari massa gran.

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

        tonalEnergy = 0;

        lastTonalChange =
            elapsed;
    }
}


// ============================================================
// AUDIO UPDATE
// ============================================================

function updateAudio() {

    if (!audioStarted || !audio) return;

    const now =
        audio.currentTime;

    const activity =
        Math.min(
            1,
            0.25 +
            lensEnergyValue*0.45 +
            fractalDepth*0.35
        );

    // --------------------------------------------------------
    // FILTER
    // --------------------------------------------------------

    filter.frequency.linearRampToValueAtTime(
        650 +
        activity*850,
        now+0.5
    );

    // --------------------------------------------------------
    // DRONE
    // --------------------------------------------------------

    const tonal =
        tonalCenters[tonalIndex];

    const root =
        tonal.root;

    drone.frequency.linearRampToValueAtTime(
        root*0.5,
        now+2.5
    );

    sub.frequency.linearRampToValueAtTime(
        root*0.25,
        now+2.8
    );

    harmonic.frequency.linearRampToValueAtTime(
        root,
        now+3.0
    );

    texture.frequency.linearRampToValueAtTime(
        root*2,
        now+3.5
    );

    // --------------------------------------------------------
    // VOICE LEVELS
    // --------------------------------------------------------

    droneGain.gain.linearRampToValueAtTime(
        0.042 +
        activity*0.025,
        now+0.5
    );

    subGain.gain.linearRampToValueAtTime(
        0.015 +
        activity*0.014,
        now+0.7
    );

    harmonicGain.gain.linearRampToValueAtTime(
        0.004 +
        fractalDepth*0.010,
        now+0.8
    );

    textureGain.gain.linearRampToValueAtTime(
        0.0015 +
        pointerVelocity*0.003,
        now+0.4
    );

    // --------------------------------------------------------
    // PAN
    // --------------------------------------------------------

    if (pan) {

        pan.pan.linearRampToValueAtTime(
            Math.max(
                -0.68,
                Math.min(
                    0.68,
                    currentLensX*1.15
                )
            ),
            now+0.6
        );
    }
}


// ============================================================
// POINTER
// ============================================================

window.addEventListener(
    "pointerdown",
    () => {
        startAudio();
    },
    { passive:true }
);

window.addEventListener(
    "pointermove",
    event => {

        const w =
            window.innerWidth;

        const h =
            window.innerHeight;

        const aspect =
            w/h;

        targetLensX =
            (
                event.clientX/w
            )-0.5;

        targetLensX *= aspect;

        targetLensY =
            0.5-
            (
                event.clientY/h
            );

        const dx =
            event.clientX-
            previousX;

        const dy =
            event.clientY-
            previousY;

        const velocity =
            Math.sqrt(
                dx*dx+
                dy*dy
            )/35;

        pointerVelocity =
            Math.min(
                velocity,
                1
            );

        previousX =
            event.clientX;

        previousY =
            event.clientY;

        // ----------------------------------------------------
        // ENERGIA
        // ----------------------------------------------------

        lensEnergyValue +=
            pointerVelocity*0.075;

        lensEnergyValue =
            Math.min(
                1,
                lensEnergyValue
            );

        // ----------------------------------------------------
        // EXPLORATION
        // ----------------------------------------------------

        exploration +=
            pointerVelocity*0.018;

        exploration =
            Math.min(
                1,
                exploration
            );

        // ----------------------------------------------------
        // FRACTAL DEPTH
        // ----------------------------------------------------

        fractalDepth +=
            pointerVelocity*0.012;

        fractalDepth =
            Math.min(
                1,
                fractalDepth
            );

        // ----------------------------------------------------
        // MEMORY
        // ----------------------------------------------------

        memoryValue +=
            pointerVelocity*0.008;

        memoryValue =
            Math.min(
                1,
                memoryValue
            );

        startAudio();
    },
    { passive:true }
);


// ============================================================
// POINTER LEAVE
// ============================================================

window.addEventListener(
    "pointerleave",
    () => {
        pointerVelocity *= 0.35;
    }
);


// ============================================================
// RESIZE
// ============================================================

function resize() {

    const dpr =
        Math.min(
            window.devicePixelRatio||1,
            2
        );

    canvas.width =
        Math.floor(
            window.innerWidth*dpr
        );

    canvas.height =
        Math.floor(
            window.innerHeight*dpr
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
        (now-start)/1000;

    // --------------------------------------------------------
    // LENT
    // --------------------------------------------------------

    currentLensX +=
        (
            targetLensX-
            currentLensX
        )*0.055;

    currentLensY +=
        (
            targetLensY-
            currentLensY
        )*0.055;

    // --------------------------------------------------------
    // DECAY
    // --------------------------------------------------------

    lensEnergyValue *=
        0.992;

    exploration *=
        0.9985;

    memoryValue *=
        0.9995;

    fractalDepth *=
        0.999;

    pointerVelocity *=
        0.94;

    // --------------------------------------------------------
    // TONALITY
    // --------------------------------------------------------

    updateTonalCenter(
        elapsed
    );

    // --------------------------------------------------------
    // AUDIO
    // --------------------------------------------------------

    updateAudio();

    // --------------------------------------------------------
    // UNIFORMS
    // --------------------------------------------------------

    gl.uniform1f(
        U.time,
        elapsed
    );

    gl.uniform2f(
        U.lens,
        currentLensX,
        currentLensY
    );

    gl.uniform1f(
        U.lensRadius,
        0.135
    );

    gl.uniform1f(
        U.lensEnergy,
        lensEnergyValue
    );

    gl.uniform1f(
        U.memory,
        memoryValue
    );

    gl.uniform1f(
        U.fractalDepth,
        fractalDepth
    );

    // --------------------------------------------------------
    // DRAW
    // --------------------------------------------------------

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