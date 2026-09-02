const canvas = document.getElementById("cosmos");

const gl = canvas.getContext("webgl", {
antialias: false,
alpha: false,
powerPreference: "low-power"
});

if (!gl) throw new Error("WebGL no disponible");

// ============================================================
// SHADERS
// ============================================================

const vertexShaderSource = `attribute vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragmentShaderSource = `
precision mediump float;

uniform vec2 resolution;
uniform float time;

#define MAX_EVENTS 20

uniform vec2 eventPosition[MAX_EVENTS];
uniform float eventTime[MAX_EVENTS];
uniform float eventStrength[MAX_EVENTS];
uniform float eventSize[MAX_EVENTS];
uniform float eventSeed[MAX_EVENTS];

float hash(vec2 p) {
return fract(
sin(dot(p, vec2(127.1, 311.7))) *
43758.5453
);
}

float noise(vec2 p) {
vec2 i = floor(p);
vec2 f = fract(p);


f = f * f * (3.0 - 2.0 * f);

float a = hash(i);
float b = hash(i + vec2(1.0, 0.0));
float c = hash(i + vec2(0.0, 1.0));
float d = hash(i + vec2(1.0, 1.0));

return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);


}

float fbm(vec2 p) {
float value = 0.0;
float amplitude = 0.5;


for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
}

return value;


}

vec2 flowField(vec2 p) {
float e = 0.003;


vec2 drift = vec2(
    time * 0.018,
    -time * 0.013
);

float n = fbm(p * 2.4 + drift);
float nx = fbm(p * 2.4 + drift + vec2(e, 0.0));
float ny = fbm(p * 2.4 + drift + vec2(0.0, e));

vec2 gradient = vec2(nx - n, ny - n) / e;

return vec2(-gradient.y, gradient.x);


}

void main() {
vec2 uv = gl_FragCoord.xy / resolution.xy;
float aspect = resolution.x / resolution.y;


vec2 p = uv - 0.5;
p.x *= aspect;

vec2 flow = flowField(p);

vec2 field = p + flow * 0.075;

field += vec2(
    sin(time * 0.17 + p.y * 3.0),
    cos(time * 0.13 + p.x * 2.4)
) * 0.014;

float cloudA = fbm(
    field * 2.1 +
    vec2(time * 0.035, -time * 0.022)
);

float cloudB = fbm(
    field * 5.0 -
    vec2(time * 0.018, time * 0.027)
);

float matter = cloudA * 0.72 + cloudB * 0.28;

matter = smoothstep(0.25, 0.74, matter);

float waveField = 0.0;
float eventMatter = 0.0;
float eventScatter = 0.0;
float eventGlow = 0.0;

for (int i = 0; i < MAX_EVENTS; i++) {
    float age = time - eventTime[i];

    if (age > 0.0 && age < 9.0) {
        vec2 delta = p - eventPosition[i];
        float distance = length(delta);

        float strength = eventStrength[i];
        float size = eventSize[i];

        float radius = age * (0.10 + size * 0.075);
        float width = 0.010 + size * 0.014;

        float wave = 1.0 - smoothstep(
            0.0,
            width,
            abs(distance - radius)
        );

        float fade = exp(-age * 0.62);
        wave *= strength * fade;

        waveField += wave;

        float centre = 1.0 - smoothstep(
            size * 0.16,
            size,
            distance
        );

        eventMatter += centre *
            strength *
            exp(-age * 1.35);

        float scatter = smoothstep(
            size * 1.9,
            0.0,
            distance
        );

        scatter *= strength * exp(-age * 0.82);
        eventScatter += scatter;

        eventGlow += centre *
            strength *
            exp(-age * 0.72);
    }
}

float multiplication =
    eventMatter * (0.22 + 0.78 * waveField);

matter += multiplication * 0.42;
matter = clamp(matter, 0.0, 1.0);

float fractal = fbm(
    (field + flow * eventScatter * 0.16) *
    (2.8 + eventScatter * 3.0) +
    vec2(time * 0.05, -time * 0.031)
);

fractal = smoothstep(0.34, 0.76, fractal);

vec2 particleSpace =
    field * (100.0 + eventScatter * 38.0);

vec2 cell = floor(particleSpace);
vec2 local = fract(particleSpace) - 0.5;

float randomCell = hash(cell);

float particleRadius =
    0.025 + randomCell * 0.038;

float particle = smoothstep(
    particleRadius,
    0.0,
    length(local)
);

particle *= step(0.9945, randomCell);

particle *= 0.25 + 0.75 * (
    0.5 +
    0.5 * sin(time * 0.65 + randomCell * 31.0)
);

particle *= 0.15 + matter * 1.75;

float eventParticles =
    eventScatter * (0.25 + 0.75 * fractal);

particle += eventParticles *
    step(
        0.9965,
        hash(cell + vec2(eventScatter * 7.0))
    ) * 0.90;

float filament = sin(
    length(p) * (22.0 + eventScatter * 42.0) -
    time * 0.62
);

filament = 0.5 + 0.5 * filament;
filament = smoothstep(0.78, 0.97, filament);
filament *= eventScatter * 0.34;

float r = length(p);

float voidMask = smoothstep(0.105, 0.020, r);

matter *= 1.0 - voidMask * 0.82;
particle *= 1.0 - voidMask * 0.75;

vec3 color = vec3(0.0015, 0.002, 0.009);

vec3 deepBlue = vec3(0.030, 0.045, 0.19);
vec3 violet = vec3(0.25, 0.065, 0.50);
vec3 lilac = vec3(0.58, 0.34, 0.88);
vec3 pink = vec3(0.95, 0.32, 0.72);
vec3 cyan = vec3(0.46, 0.80, 1.0);
vec3 whiteBlue = vec3(0.78, 0.90, 1.0);

color += deepBlue * matter * 1.70;
color += violet * matter * matter * 1.30;
color += lilac * fractal * 0.28;

color += cyan * waveField * 0.54;
color += pink * eventMatter * 0.34;
color += lilac * particle * 1.15;
color += cyan * filament * 0.48;

color += pink * eventGlow * 0.12;
color += whiteBlue * eventGlow * eventGlow * 0.08;

float centralGlow = exp(-r * 12.0);

color += vec3(0.12, 0.16, 0.34) *
    centralGlow * 0.055;

float bloom = smoothstep(1.65, 0.12, r);
color *= bloom;

float outerGlow = smoothstep(1.35, 0.42, r);
color += deepBlue * outerGlow * 0.045;

color = pow(color, vec3(0.90));

gl_FragColor = vec4(color, 1.0);


}
`;

// ============================================================
// SHADER COMPILATION
// ============================================================

function compileShader(type, source) {
const shader = gl.createShader(type);


gl.shaderSource(shader, source);
gl.compileShader(shader);

if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error("Zero Infinit: shader compilation failed");
}

return shader;


}

const vertexShader =
compileShader(gl.VERTEX_SHADER, vertexShaderSource);

const fragmentShader =
compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
throw new Error("Zero Infinit: WebGL link failed");
}

gl.useProgram(program);

// ============================================================
// GEOMETRY
// ============================================================

const buffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

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
gl.getAttribLocation(program, "position");

gl.enableVertexAttribArray(position);

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
resolution: gl.getUniformLocation(program, "resolution"),
time: gl.getUniformLocation(program, "time"),
eventPosition: gl.getUniformLocation(program, "eventPosition"),
eventTime: gl.getUniformLocation(program, "eventTime"),
eventStrength: gl.getUniformLocation(program, "eventStrength"),
eventSize: gl.getUniformLocation(program, "eventSize"),
eventSeed: gl.getUniformLocation(program, "eventSeed")
};

// ============================================================
// EVENT SYSTEM
// ============================================================

const MAX_EVENTS = 20;
const events = new Array(MAX_EVENTS);
let eventCursor = 0;

function createEvent(x, y, strength, size) {
const event = {
x,
y,
time: 0,
strength,
size,
seed: Math.random()
};


events[eventCursor] = event;

eventCursor =
    (eventCursor + 1) % MAX_EVENTS;

return event;


}

function eventPositionFromPointer(event) {
const rect = canvas.getBoundingClientRect();


const x =
    (event.clientX - rect.left) / rect.width;

const y =
    (event.clientY - rect.top) / rect.height;

const aspect = rect.width / rect.height;

return {
    x: (x - 0.5) * aspect,
    y: 0.5 - y
};


}

// ============================================================
// POINTER
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
// AUDIO
// ============================================================

let audio = null;
let audioStarted = false;

let master = null;
let compressor = null;

let ambienceFilter = null;
let ambienceGain = null;

let droneOsc = null;
let droneGain = null;

let ambienceOsc = null;
let ambienceOscGain = null;

let harmonicOsc = null;
let harmonicGain = null;

let eventBus = null;
let melodyGain = null;
let chordGain = null;

let reverb = null;
let reverbGain = null;

// New: a gentle ducking bus for the lower bed.
let bedBus = null;
let sidechainGain = null;

let audioEventCooldown = 0;
let audioActivity = 0;
let lastAudioEventAt = -10;

// ============================================================
// F# MINOR — SINGLE TONAL WORLD
// ============================================================

const tonal = {
name: "F# minor",
root: 185.00,
scale: [
0, 2, 3, 5, 7, 8, 10
]
};

let tonalPressure = 0;


// ============================================================
// EMERGENT HARMONY
// ============================================================

const harmony = {
    current: 0,
    target: 0,
    pressure: 0,

    chords: [
        {
            name: "F#m",
            root: 185.00,
            notes: [185.00, 220.00, 277.18]
        },
        {
            name: "A",
            root: 220.00,
            notes: [220.00, 277.18, 329.63]
        },
        {
            name: "D",
            root: 146.83,
            notes: [146.83, 185.00, 220.00]
        },
        {
            name: "Bm",
            root: 246.94,
            notes: [246.94, 293.66, 369.99]
        },
        {
            name: "E",
            root: 164.81,
            notes: [164.81, 207.65, 246.94]
        }
    ]
};

function getFractalFrequency(intensity = 0.5) {
    const chord =
        harmony.chords[
            Math.round(harmony.current)
        ];

    const notes = chord.notes;

    let index;

    if (intensity > 0.72) {
        index =
            Math.floor(
                Math.random() * notes.length
            );
    } else {
        index =
            Math.floor(
                Math.random() * Math.min(2, notes.length)
            );
    }

    let frequency = notes[index];

    // Occasionally lift the event one octave.
    if (
        intensity > 0.62 &&
        Math.random() < 0.34
    ) {
        frequency *= 2;
    }

    return frequency;
}


function getScaleFrequency(degree, octave = 1) {
const index =
((degree % tonal.scale.length) +
tonal.scale.length) %
tonal.scale.length;


const semitone =
    tonal.scale[index] + octave * 12;

return tonal.root *
    Math.pow(2, semitone / 12);


}

// ============================================================
// REVERB IMPULSE
// ============================================================

function createReverbImpulse(
context,
duration = 4.2,
decay = 2.8
) {
const length =
Math.floor(context.sampleRate * duration);


const impulse =
    context.createBuffer(
        2,
        length,
        context.sampleRate
    );

for (let channel = 0; channel < 2; channel++) {
    const data =
        impulse.getChannelData(channel);

    for (let i = 0; i < length; i++) {
        const t = i / length;

        data[i] =
            (Math.random() * 2 - 1) *
            Math.pow(1 - t, decay);
    }
}

return impulse;


}

// ============================================================
// AUDIO INITIALISATION
// ============================================================

function startAudio() {
if (audioStarted && audio) {
if (audio.state === "suspended") {
audio.resume().catch(() => {
audioStarted = false;
});
}
return;
}


const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;

if (!AudioContext) return;

try {
    audio = new AudioContext({
        latencyHint: "interactive"
    });

    master = audio.createGain();
    master.gain.value = 0.0001;

    compressor = audio.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 18;
    compressor.ratio.value = 1.8;
    compressor.attack.value = 0.030;
    compressor.release.value = 0.55;

    ambienceFilter = audio.createBiquadFilter();
    ambienceFilter.type = "lowpass";
    ambienceFilter.frequency.value = 1250;
    ambienceFilter.Q.value = 0.28;

    ambienceGain = audio.createGain();
    ambienceGain.gain.value = 0.050;

    bedBus = audio.createGain();
    bedBus.gain.value = 0.95;

    sidechainGain = audio.createGain();
    sidechainGain.gain.value = 1.0;

    droneOsc = audio.createOscillator();
    droneOsc.type = "sine";
    droneOsc.frequency.value = tonal.root / 2;

    droneGain = audio.createGain();
    droneGain.gain.value = 0.0;

    ambienceOsc = audio.createOscillator();
    ambienceOsc.type = "triangle";
    ambienceOsc.frequency.value = tonal.root;

    ambienceOscGain = audio.createGain();
    ambienceOscGain.gain.value = 0.009;

    harmonicOsc = audio.createOscillator();
    harmonicOsc.type = "sine";
    harmonicOsc.frequency.value = tonal.root * 2;

    harmonicGain = audio.createGain();
    harmonicGain.gain.value = 0.004;

    droneOsc.connect(droneGain).connect(bedBus);
    ambienceOsc.connect(ambienceOscGain).connect(bedBus);
    harmonicOsc.connect(harmonicGain).connect(bedBus);

    bedBus.connect(sidechainGain).connect(ambienceFilter);
    ambienceFilter.connect(ambienceGain).connect(compressor);

    eventBus = audio.createGain();
    eventBus.gain.value = 1.0;

    melodyGain = audio.createGain();
    melodyGain.gain.value = 0.88;

    chordGain = audio.createGain();
    chordGain.gain.value = 0.52;

    eventBus.connect(melodyGain).connect(compressor);
    eventBus.connect(chordGain).connect(compressor);

    reverb = audio.createConvolver();
    reverb.buffer = createReverbImpulse(audio, 3.2, 3.0);

    reverbGain = audio.createGain();
    reverbGain.gain.value = 0.14;

    eventBus.connect(reverb).connect(reverbGain).connect(compressor);

    compressor.connect(master);
    master.connect(audio.destination);

    const now = audio.currentTime;

    droneOsc.start(now);
    ambienceOsc.start(now);
    harmonicOsc.start(now);

    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.90, now + 1.2);

    // A very short, quiet unlock pulse. It is inside the pointer gesture,
    // so Safari/iOS has an actual audible source to authorize.
    const unlockOsc = audio.createOscillator();
    const unlockGain = audio.createGain();
    unlockOsc.type = "sine";
    unlockOsc.frequency.setValueAtTime(185, now);
    unlockGain.gain.setValueAtTime(0.0001, now);
    unlockGain.gain.exponentialRampToValueAtTime(0.025, now + 0.012);
    unlockGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    unlockOsc.connect(unlockGain).connect(eventBus);
    unlockOsc.start(now);
    unlockOsc.stop(now + 0.18);

    audioStarted = true;

    const resume = audio.resume();
    if (resume && typeof resume.catch === "function") {
        resume.catch(() => {
            audioStarted = false;
        });
    }
} catch (error) {
    audioStarted = false;
    audio = null;
}


}

// ============================================================
// BED BREATHING / SOFT SIDECHAIN
// ============================================================

function duckBedForEvent(strength) {
if (!audioStarted || !audio) return;


const now = audio.currentTime;

const duck =
    0.82 -
    Math.min(0.30, strength * 0.24);

sidechainGain.gain.cancelScheduledValues(now);

sidechainGain.gain.setValueAtTime(
    sidechainGain.gain.value,
    now
);

sidechainGain.gain.exponentialRampToValueAtTime(
    Math.max(0.48, duck),
    now + 0.035
);

sidechainGain.gain.exponentialRampToValueAtTime(
    0.82,
    now + 0.75 + strength * 1.15
);


}

// ============================================================
// PLAY SINGLE NOTE
// ============================================================

function playNote(
frequency,
intensity,
panValue = 0
) {
if (!audioStarted || !audio) return;


const now = audio.currentTime;

const osc = audio.createOscillator();
const gain = audio.createGain();

const notePan =
    audio.createStereoPanner
        ? audio.createStereoPanner()
        : null;

osc.type =
    intensity > 0.72
        ? "triangle"
        : "sine";

osc.frequency.setValueAtTime(
    frequency,
    now
);

osc.detune.setValueAtTime(
    (Math.random() - 0.5) * 5,
    now
);

const attack =
    0.035 + Math.random() * 0.055;

const duration =
    1.1 +
    intensity * 1.8 +
    Math.random() * 0.8;

// Slightly lower event level for more headroom.
const level =
    0.018 +
    intensity * 0.035;

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

if (notePan) {
    notePan.pan.value =
        Math.max(
            -0.68,
            Math.min(0.68, panValue)
        );

    osc
        .connect(gain)
        .connect(notePan)
        .connect(eventBus);
} else {
    osc
        .connect(gain)
        .connect(eventBus);
}

osc.start(now);
osc.stop(now + duration + 0.1);


}

// ============================================================
// PLAY CHORD
// ============================================================

function playChord(intensity, panValue) {
    if (!audioStarted || !audio) return;

    const chord =
        harmony.chords[
            Math.round(harmony.current)
        ];

    const notes = chord.notes;

    const order = [
        0,
        1,
        2
    ];

    // Higher activity produces a wider chord.
    const count =
        intensity > 0.72
            ? 3
            : 2;

    for (let i = 0; i < count; i++) {
        const index =
            order[i];

        const frequency =
            notes[index];

        const delay =
            i * 0.065;

        window.setTimeout(() => {
            if (!audioStarted) return;

            playNote(
                frequency,
                intensity *
                    (0.52 + i * 0.08),
                panValue +
                    (i - 1) * 0.08
            );
        }, delay * 1000);
    }
}

// ============================================================
// AUDIO EVENT
// ============================================================

function triggerAudioEvent(strength, speed) {
if (!audioStarted || !audio) return;

    // Activity pushes the harmonic field toward another state.
    harmony.pressure +=
        strength * 0.18 +
        speed * 0.08;

    harmony.pressure *= 0.94;

    if (
        harmony.pressure > 0.72 &&
        Math.random() < 0.28
    ) {
        const direction =
            Math.random() < 0.58
                ? 1
                : -1;

        harmony.target =
            Math.max(
                0,
                Math.min(
                    harmony.chords.length - 1,
                    Math.round(harmony.current) + direction
                )
            );

        harmony.pressure = 0;
    }

    // Slow harmonic movement.
    harmony.current +=
        (harmony.target - harmony.current) * 0.035;
const frequency =
    getFractalFrequency(strength);

const panValue =
    (pointerX / canvas.clientWidth) * 2 - 1;

playNote(
    frequency,
    strength,
    panValue
);

if (
    strength > 0.48 &&
    Math.random() < 0.30
) {
    playChord(
        strength,
        panValue
    );
}

duckBedForEvent(strength);

const now = audio.currentTime;

const reverbAmount =
    0.075 + strength * 0.17;

reverbGain.gain.cancelScheduledValues(now);

reverbGain.gain.linearRampToValueAtTime(
    reverbAmount,
    now + 0.05
);

reverbGain.gain.exponentialRampToValueAtTime(
    0.105,
    now + 1.9 + strength * 1.7
);

lastAudioEventAt = performance.now() / 1000;


}

// ============================================================
// TONAL PRESSURE
// Kept as a future expressive parameter, but F# minor remains
// the only tonal world of node∅.
// ============================================================

function updateTonalCenter() {
tonalPressure += pointerSpeed * 0.0015;
tonalPressure *= 0.996;
}

// ============================================================
// AUDIO ENVIRONMENT
// ============================================================

function updateAudio() {
if (!audioStarted || !audio) return;


const now = audio.currentTime;

const eventEnergy =
    Math.min(
        1,
        events.filter(Boolean).reduce(
            (sum, event) =>
                sum + event.strength * 0.015,
            0
        )
    );

audioActivity =
    Math.max(
        pointerSpeed * 0.65,
        eventEnergy
    );

// Very slow breathing. Not a repetitive obvious LFO.
const elapsed = performance.now() / 1000;

const breath =
    0.5 +
    0.5 *
    Math.sin(
        elapsed * 0.075 +
        Math.sin(elapsed * 0.019) * 1.7
    );

const eventPause =
    Math.min(
        1,
        Math.max(
            0,
            1 -
            (elapsed - lastAudioEventAt) * 0.95
        )
    );

const earth =
    0.045 +
    breath * 0.030 +
    audioActivity * 0.012;

// Event activity momentarily makes the earth retreat.
const breathingEarth =
    earth *
    (1 - eventPause * 0.26);

droneGain.gain.linearRampToValueAtTime(
    breathingEarth,
    now + 1.8
);

ambienceOscGain.gain.linearRampToValueAtTime(
    0.008 +
    breath * 0.006 +
    audioActivity * 0.003,
    now + 2.0
);

harmonicGain.gain.linearRampToValueAtTime(
    0.003 +
    breath * 0.003 +
    audioActivity * 0.002,
    now + 2.4
);

ambienceFilter.frequency.linearRampToValueAtTime(
    950 +
    audioActivity * 1100 +
    breath * 260,
    now + 1.2
);

ambienceGain.gain.linearRampToValueAtTime(
    0.045 +
    audioActivity * 0.024 +
    breath * 0.010,
    now + 1.0
);


}

// ============================================================
// POINTER DOWN
// ============================================================

canvas.addEventListener(
"pointerdown",
event => {
startAudio();


    pointerInside = true;
    pointerActive = true;

    pointerX = event.clientX;
    pointerY = event.clientY;

    previousPointerX = pointerX;
    previousPointerY = pointerY;

    const point =
        eventPositionFromPointer(event);

    const initial =
        createEvent(
            point.x,
            point.y,
            0.70,
            0.78
        );

    initial.time =
        performance.now() / 1000;

    triggerAudioEvent(0.70, 0.30);

    canvas.setPointerCapture?.(
        event.pointerId
    );
},
{ passive: true }


);

// ============================================================
// POINTER MOVE
// ============================================================

canvas.addEventListener(
"pointermove",
event => {
if (!pointerInside) return;


    const dx =
        event.clientX - previousPointerX;

    const dy =
        event.clientY - previousPointerY;

    const distance =
        Math.sqrt(dx * dx + dy * dy);

    pointerSpeed =
        Math.min(1, distance / 32);

    pointerX = event.clientX;
    pointerY = event.clientY;

    previousPointerX = event.clientX;
    previousPointerY = event.clientY;

    movementAccumulator += distance;

    const now =
        performance.now() / 1000;

    const threshold =
        24 - pointerSpeed * 10;

    if (
        movementAccumulator > threshold &&
        now - lastEventTime > 0.055
    ) {
        const point =
            eventPositionFromPointer(event);

        const strength =
            Math.min(
                1,
                0.17 +
                pointerSpeed * 0.70 +
                Math.random() * 0.16
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

        created.time = now;

        movementAccumulator = 0;
        lastEventTime = now;

        if (now > audioEventCooldown) {
            triggerAudioEvent(
                strength,
                pointerSpeed
            );

            audioEventCooldown =
                now +
                0.16 +
                Math.random() * 0.20;
        }
    }
},
{ passive: true }


);

// ============================================================
// POINTER ENTER / LEAVE / CANCEL
// ============================================================

canvas.addEventListener(
"pointerenter",
event => {
pointerInside = true;
pointerActive = true;


    pointerX = event.clientX;
    pointerY = event.clientY;

    previousPointerX = event.clientX;
    previousPointerY = event.clientY;
},
{ passive: true }


);

canvas.addEventListener(
"pointerleave",
() => {
pointerInside = false;
pointerActive = false;
pointerSpeed = 0;
movementAccumulator = 0;
},
{ passive: true }
);

canvas.addEventListener(
"pointercancel",
() => {
pointerInside = false;
pointerActive = false;
pointerSpeed = 0;
},
{ passive: true }
);

// ============================================================
// RESIZE
// ============================================================

function resize() {
const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
const dpr =
Math.min(
window.devicePixelRatio || 1,
mobile ? 1.2 : 1.5
);


const width = window.innerWidth;
const height = window.innerHeight;

canvas.width =
    Math.floor(width * dpr);

canvas.height =
    Math.floor(height * dpr);

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
window.addEventListener("resize", resize);
resize();

// ============================================================
// RENDER
// ============================================================

const start = performance.now();

function render(now) {
const elapsed =
(now - start) / 1000;


pointerSpeed *= 0.91;

updateTonalCenter();
updateAudio();

const positionData =
    new Float32Array(MAX_EVENTS * 2);

const timeData =
    new Float32Array(MAX_EVENTS);

const strengthData =
    new Float32Array(MAX_EVENTS);

const sizeData =
    new Float32Array(MAX_EVENTS);

const seedData =
    new Float32Array(MAX_EVENTS);

for (let i = 0; i < MAX_EVENTS; i++) {
    const event = events[i];

    if (event) {
        positionData[i * 2] = event.x;
        positionData[i * 2 + 1] = event.y;

        timeData[i] = event.time;
        strengthData[i] = event.strength;
        sizeData[i] = event.size;
        seedData[i] = event.seed;
    } else {
        positionData[i * 2] = 0;
        positionData[i * 2 + 1] = 0;

        timeData[i] = -100;
        strengthData[i] = 0;
        sizeData[i] = 0;
        seedData[i] = 0;
    }
}

gl.uniform1f(U.time, elapsed);
gl.uniform2fv(U.eventPosition, positionData);
gl.uniform1fv(U.eventTime, timeData);
gl.uniform1fv(U.eventStrength, strengthData);
gl.uniform1fv(U.eventSize, sizeData);
gl.uniform1fv(U.eventSeed, seedData);

gl.drawArrays(
    gl.TRIANGLES,
    0,
    6
);

requestAnimationFrame(render);


}

requestAnimationFrame(render);


