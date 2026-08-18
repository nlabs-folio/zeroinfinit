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
            vec2(time * 0.045, -time * 0.025)
        );

    float nx =
        fbm(
            p * 2.4 +
            vec2(e, 0.0) +
            vec2(time * 0.045, -time * 0.025)
        );

    float ny =
        fbm(
            p * 2.4 +
            vec2(0.0, e) +
            vec2(time * 0.045, -time * 0.025)
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


    float radius =
        length(p);


    // -------------------------------------------------
    // TURBULENT COORDINATES
    // -------------------------------------------------

    vec2 flow =
        flowField(p);

    vec2 warped =
        p +
        flow * 0.055;


    warped +=
        vec2(
            sin(t * 1.7 + p.y * 3.0),
            cos(t * 1.3 + p.x * 2.0)
        ) * 0.025;


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
    // LARGE COSMIC CLOUD
    // -------------------------------------------------

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


    // Particles are stretched along flow.

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


    // Sparse cosmic population.

    particle *=
        step(
            0.965,
            random
        );


    // Slow individual breathing.

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


    // Particles inherit gas density.

    particle *=
        0.35 +
        gas * 1.2;


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


    // Deep gas.

    color +=
        deepViolet *
        gas *
        1.5;


    // Dense gas.

    color +=
        violet *
        gas *
        gas *
        1.25;


    // Very subtle wave structure.

    color +=
        luminous *
        waves;


    // Particles.

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
// SHADER COMPILER
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
// RENDER
// =====================================================

const start =
    performance.now();


function render(now) {

    const elapsed =
        (now - start) / 1000;

    gl.uniform1f(
        time,
        elapsed
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


// =====================================================
// AUDIO
// =====================================================

let audioStarted = false;


function startAudio() {

    if (audioStarted) {
        return;
    }

    audioStarted = true;

    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContext) {
        return;
    }

    const audio =
        new AudioContext();


    // -------------------------------------------------
    // MASTER
    // -------------------------------------------------

    const master =
        audio.createGain();

    master.gain.value =
        0.0001;

    master.connect(
        audio.destination
    );


    // -------------------------------------------------
    // 432 Hz
    // -------------------------------------------------

    const fundamental =
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
        .connect(master);


    // -------------------------------------------------
    // OCTAVE
    // -------------------------------------------------

    const octave =
        audio.createOscillator();

    octave.type =
        "sine";

    octave.frequency.value =
        864;


    const octaveGain =
        audio.createGain();

    octaveGain.gain.value =
        0.025;


    octave
        .connect(octaveGain)
        .connect(master);


    // -------------------------------------------------
    // FILTER
    // -------------------------------------------------

    const filter =
        audio.createBiquadFilter();

    filter.type =
        "lowpass";

    filter.frequency.value =
        1100;

    filter.Q.value =
        0.35;


    // Rewire master path through filter.

    fundamentalGain.disconnect();

    octaveGain.disconnect();

    fundamentalGain.connect(filter);

    octaveGain.connect(filter);

    filter.connect(master);


    // -------------------------------------------------
    // ALPHA-RANGE MODULATION
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

    octave.start(now);

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


window.addEventListener(
    "click",
    startAudio,
    {
        once: true
    }
);