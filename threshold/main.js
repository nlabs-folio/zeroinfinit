const canvas = document.getElementById("cosmos");

const gl = canvas.getContext("webgl", {
    antialias: false,
    alpha: false,
    powerPreference: "high-performance"
});

if (!gl) {
    throw new Error("WebGL no disponible");
}


// =====================================================
// SHADERS
// =====================================================

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

uniform vec2 mouse;
uniform float interaction;


// =====================================================
// HASH
// =====================================================

float hash(vec2 p) {

    return fract(
        sin(
            dot(
                p,
                vec2(127.1, 311.7)
            )
        ) * 43758.5453
    );
}


// =====================================================
// NOISE
// =====================================================

float noise(vec2 p) {

    vec2 i = floor(p);
    vec2 f = fract(p);

    f = f * f * (3.0 - 2.0 * f);

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


// =====================================================
// FRACTAL NOISE
// =====================================================

float fbm(vec2 p) {

    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 6; i++) {

        value += amplitude * noise(p);

        p *= 2.0;
        amplitude *= 0.5;
    }

    return value;
}


// =====================================================
// CURL-LIKE FLOW
// =====================================================

vec2 flowField(vec2 p) {

    float e = 0.002;

    float n1 =
        fbm(
            p * 2.4 +
            vec2(
                time * 0.045,
                -time * 0.025
            )
        );

    float nx =
        fbm(
            p * 2.4 +
            vec2(e, 0.0) +
            vec2(
                time * 0.045,
                -time * 0.025
            )
        );

    float ny =
        fbm(
            p * 2.4 +
            vec2(0.0, e) +
            vec2(
                time * 0.045,
                -time * 0.025
            )
        );

    vec2 gradient =
        vec2(
            nx - n1,
            ny - n1
        ) / e;

    return vec2(
        -gradient.y,
        gradient.x
    );
}


// =====================================================
// MAIN
// =====================================================

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


    float t =
        time * 0.10;


    // -------------------------------------------------
    // INTERACTION POINT
    // -------------------------------------------------

    vec2 interactionPoint =
        mouse;

    float mouseDistance =
        length(
            p - interactionPoint
        );


    // -------------------------------------------------
    // LOCAL INTERACTION
    // -------------------------------------------------

    float localInteraction =
        smoothstep(
            0.55,
            0.0,
            mouseDistance
        );


    localInteraction *=
        interaction;


    // -------------------------------------------------
    // FLOW
    // -------------------------------------------------

    vec2 flow =
        flowField(p);


    // El moviment humà desvia lleugerament
    // el flux natural del camp.

    flow +=
        (interactionPoint - p)
        * localInteraction
        * 0.12;


    vec2 warped =
        p +
        flow * 0.055;


    warped +=
        vec2(
            sin(
                t * 1.7 +
                p.y * 3.0
            ),

            cos(
                t * 1.3 +
                p.x * 2.0
            )
        )
        * 0.025;


    // -------------------------------------------------
    // GAS
    // -------------------------------------------------

    float gasA =
        fbm(
            warped * 2.0 +
            vec2(
                t * 0.30,
                -t * 0.18
            )
        );


    float gasB =
        fbm(
            warped * 4.0 -
            vec2(
                t * 0.13,
                t * 0.22
            )
        );


    float gas =
        gasA * 0.72 +
        gasB * 0.28;


    gas =
        smoothstep(
            0.30,
            0.78,
            gas
        );


    // -------------------------------------------------
    // LOCAL DENSITY RESPONSE
    // -------------------------------------------------

    gas +=
        localInteraction *
        0.12 *
        (
            1.0 -
            smoothstep(
                0.0,
                0.55,
                mouseDistance
            )
        );


    // -------------------------------------------------
    // LARGE COSMIC CLOUD
    // -------------------------------------------------

    float radius =
        length(p);


    float cloudMask =
        smoothstep(
            1.25,
            0.08,
            radius
        );


    gas *= cloudMask;


    // -------------------------------------------------
    // SLOW BREATH
    // -------------------------------------------------

    float breath =
        0.5 +
        0.5 *
        sin(
            time * 0.55
        );


    gas *=
        0.62 +
        breath * 0.38;


    // -------------------------------------------------
    // RADIAL WAVES
    // -------------------------------------------------

    float wavePhase =
        radius * 18.0 -
        time * 0.85 +
        gasA * 4.0;


    float waves =
        0.5 +
        0.5 *
        sin(
            wavePhase
        );


    waves =
        smoothstep(
            0.62,
            0.92,
            waves
        );


    waves *=
        cloudMask *
        0.18;


    // -------------------------------------------------
    // INTERACTION RIPPLE
    // -------------------------------------------------

    float interactionWave =
        sin(
            mouseDistance * 24.0 -
            time * 1.8
        );


    interactionWave =
        0.5 +
        0.5 *
        interactionWave;


    interactionWave =
        smoothstep(
            0.72,
            0.98,
            interactionWave
        );


    interactionWave *=
        localInteraction *
        0.16;


    // -------------------------------------------------
    // PARTICLE FIELD
    // -------------------------------------------------

    vec2 particleSpace =
        warped * 105.0;


    vec2 cell =
        floor(
            particleSpace
        );


    vec2 local =
        fract(
            particleSpace
        ) - 0.5;


    float random =
        hash(cell);


    float particleShape =
        length(
            local -
            flow * 0.025
        );


    float particle =
        smoothstep(
            0.075,
            0.0,
            particleShape
        );


    particle *=
        step(
            0.965,
            random
        );


    particle *=
        0.35 +
        0.65 *
        (
            0.5 +
            0.5 *
            sin(
                time * 1.2 +
                random * 40.0
            )
        );


    particle *=
        0.35 +
        gas * 1.2;


    // Interaction makes nearby particles
    // slightly more visible.

    particle +=
        particle *
        localInteraction *
        0.7;


    // -------------------------------------------------
    // CENTRAL VOID
    // -------------------------------------------------

    float voidMask =
        smoothstep(
            0.10,
            0.018,
            radius
        );


    gas *=
        1.0 - voidMask;


    waves *=
        1.0 - voidMask;


    particle *=
        1.0 - voidMask;


    // -------------------------------------------------
    // COLOUR
    // -------------------------------------------------

    vec3 background =
        vec3(
            0.002,
            0.001,
            0.009
        );


    vec3 deepViolet =
        vec3(
            0.12,
            0.025,
            0.26
        );


    vec3 violet =
        vec3(
            0.36,
            0.08,
            0.62
        );


    vec3 luminous =
        vec3(
            0.72,
            0.42,
            1.0
        );


    vec3 color =
        background;


    color +=
        deepViolet *
        gas *
        1.5;


    color +=
        violet *
        gas *
        gas *
        1.25;


    color +=
        luminous *
        waves;


    color +=
        luminous *
        interactionWave;


    color +=
        luminous *
        particle *
        0.95;


    // -------------------------------------------------
    // VIGNETTE
    // -------------------------------------------------

    float vignette =
        smoothstep(
            1.45,
            0.18,
            radius
        );


    color *=
        vignette;


    // -------------------------------------------------
    // GAMMA
    // -------------------------------------------------

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


// =====================================================
// COMPILE SHADER
// =====================================================

function compileShader(type, source) {

    const shader =
        gl.createShader(type);

    gl.shaderSource(
        shader,
        source
    );

    gl.compileShader(shader);

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
        "WebGL program link failed"
    );
}


gl.useProgram(program);


// =====================================================
// FULL SCREEN GEOMETRY
// =====================================================

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


// =====================================================
// UNIFORMS
// =====================================================

const resolution =
    gl.getUniformLocation(
        program,
        "resolution"
    );


const time =
    gl.getUniformLocation(
        program,
        "time"
    );


const mouse =
    gl.getUniformLocation(
        program,
        "mouse"
    );


const interaction =
    gl.getUniformLocation(
        program,
        "interaction"
    );


// =====================================================
// INTERACTION STATE
// =====================================================

let targetMouseX = 0;
let targetMouseY = 0;

let currentMouseX = 0;
let currentMouseY = 0;

let targetInteraction = 0;
let currentInteraction = 0;

let lastPointerTime =
    performance.now();

let lastPointerX = 0;
let lastPointerY = 0;


// -----------------------------------------------------
// POINTER
// -----------------------------------------------------

window.addEventListener(
    "pointermove",
    (event) => {

        const width =
            window.innerWidth;

        const height =
            window.innerHeight;


        const aspect =
            width / height;


        targetMouseX =
            (
                event.clientX / width
            ) - 0.5;


        targetMouseY =
            0.5 -
            (
                event.clientY / height
            );


        targetMouseX *= aspect;


        // ---------------------------------------------
        // VELOCITAT
        // ---------------------------------------------

        const now =
            performance.now();


        const dt =
            Math.max(
                now - lastPointerTime,
                1
            );


        const dx =
            event.clientX -
            lastPointerX;


        const dy =
            event.clientY -
            lastPointerY;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        const velocity =
            distance / dt;


        targetInteraction =
            Math.min(
                velocity * 3.0,
                1.0
            );


        lastPointerTime =
            now;


        lastPointerX =
            event.clientX;


        lastPointerY =
            event.clientY;


        // -------------------------------------------------
        // AUDIO
        // -------------------------------------------------

        updateAudioInteraction(
            targetInteraction,
            targetMouseX,
            targetMouseY
        );

    }
);


// -----------------------------------------------------
// POINTER LEAVE
// -----------------------------------------------------

window.addEventListener(
    "pointerleave",
    () => {

        targetInteraction = 0;

    }
);


// =====================================================
// RESIZE
// =====================================================

function resize() {

    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    canvas.width =
        Math.floor(
            window.innerWidth * dpr
        );


    canvas.height =
        Math.floor(
            window.innerHeight * dpr
        );


    gl.viewport(
        0,
        0,
        canvas.width,
        canvas.height
    );


    gl.uniform2f(
        resolution,
        canvas.width,
        canvas.height
    );
}


window.addEventListener(
    "resize",
    resize
);


resize();


// =====================================================
// AUDIO
// =====================================================

let audio = null;
let audioStarted = false;

let master = null;
let filter = null;
let fundamental = null;
let harmonic = null;


// -----------------------------------------------------
// START AUDIO
// -----------------------------------------------------

function startAudio() {

    if (audioStarted) {
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


    audioStarted = true;


    // -------------------------------------------------
    // MASTER
    // -------------------------------------------------

    master =
        audio.createGain();


    master.gain.value =
        0.0001;


    master.connect(
        audio.destination
    );


    // -------------------------------------------------
    // FILTER
    // -------------------------------------------------

    filter =
        audio.createBiquadFilter();


    filter.type =
        "lowpass";


    filter.frequency.value =
        1100;


    filter.Q.value =
        0.35;


    filter.connect(
        master
    );


    // -------------------------------------------------
    // 432 Hz
    // -------------------------------------------------

    fundamental =
        audio.createOscillator();


    fundamental.type =
        "sine";


    fundamental.frequency.value =
        432;


    const fundamentalGain =
        audio.createGain();


    fundamentalGain.gain.value =
        0.22;


    fundamental
        .connect(fundamentalGain)
        .connect(filter);


    // -------------------------------------------------
    // HARMONIC
    // -------------------------------------------------

    harmonic =
        audio.createOscillator();


    harmonic.type =
        "sine";


    harmonic.frequency.value =
        864;


    const harmonicGain =
        audio.createGain();


    harmonicGain.gain.value =
        0.025;


    harmonic
        .connect(harmonicGain)
        .connect(filter);


    // -------------------------------------------------
    // LFO — 10 Hz
    // -------------------------------------------------

    const lfo =
        audio.createOscillator();


    lfo.type =
        "sine";


    lfo.frequency.value =
        10;


    const lfoGain =
        audio.createGain();


    lfoGain.gain.value =
        0.012;


    lfo
        .connect(lfoGain)
        .connect(master.gain);


    // -------------------------------------------------
    // START
    // -------------------------------------------------

    const now =
        audio.currentTime;


    fundamental.start(now);

    harmonic.start(now);

    lfo.start(now);


    // -------------------------------------------------
    // FADE IN
    // -------------------------------------------------

    master.gain.setValueAtTime(
        0.0001,
        now
    );


    master.gain.exponentialRampToValueAtTime(
        0.032,
        now + 3.5
    );
}


// =====================================================
// AUDIO INTERACTION
// =====================================================

function updateAudioInteraction(
    velocity,
    x,
    y
) {

    if (!audioStarted) {
        startAudio();
    }


    if (!audio) {
        return;
    }


    const now =
        audio.currentTime;


    // -------------------------------------------------
    // DISTÀNCIA AL CENTRE
    // -------------------------------------------------

    const distance =
        Math.sqrt(
            x * x +
            y * y
        );


    const normalizedDistance =
        Math.min(
            distance / 0.7,
            1
        );


    // -------------------------------------------------
    // FILTER
    // -------------------------------------------------

    const targetFilter =
        700 +
        velocity * 2200 +
        (1.0 - normalizedDistance) * 900;


    filter.frequency.cancelScheduledValues(
        now
    );


    filter.frequency.linearRampToValueAtTime(
        targetFilter,
        now + 0.12
    );


    // -------------------------------------------------
    // VOLUME
    // -------------------------------------------------

    const targetGain =
        0.028 +
        velocity * 0.035;


    master.gain.cancelScheduledValues(
        now
    );


    master.gain.linearRampToValueAtTime(
        targetGain,
        now + 0.12
    );


    // -------------------------------------------------
    // 432 Hz — petita desviació expressiva
    // -------------------------------------------------

    const pitchOffset =
        (
            x * 7.0
        ) +
        (
            y * 4.0
        );


    fundamental.frequency.linearRampToValueAtTime(
        432 + pitchOffset,
        now + 0.18
    );


    harmonic.frequency.linearRampToValueAtTime(
        (432 + pitchOffset) * 2,
        now + 0.18
    );
}


// =====================================================
// RENDER
// =====================================================

const start =
    performance.now();


function render(now) {

    const elapsed =
        (now - start) / 1000;


    // -------------------------------------------------
    // SMOOTH INTERACTION
    // -------------------------------------------------

    currentMouseX +=
        (
            targetMouseX -
            currentMouseX
        ) * 0.045;


    currentMouseY +=
        (
            targetMouseY -
            currentMouseY
        ) * 0.045;


    currentInteraction +=
        (
            targetInteraction -
            currentInteraction
        ) * 0.06;


    // -------------------------------------------------
    // DECAY
    // -------------------------------------------------

    targetInteraction *= 0.94;


    gl.uniform1f(
        time,
        elapsed
    );


    gl.uniform2f(
        mouse,
        currentMouseX,
        currentMouseY
    );


    gl.uniform1f(
        interaction,
        currentInteraction
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