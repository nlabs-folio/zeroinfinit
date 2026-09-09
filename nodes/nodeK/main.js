// ============================================================
// ZERO INFINIT · nodeK · Carícies
//
// BASE
//
// MEDUSA DIGITAL
// HEXÀGON PROPIOCEPTIU
// TEIXIT NEURONAL BIOTECNOLÒGIC
//
// percepció
//      ↓
// anticipació
//      ↓
// contacte
//      ↓
// propagació
//      ↓
// adaptació
//      ↓
// recuperació
//
// La persona no controla directament la matèria.
// El pointer introdueix una pertorbació.
// L'organisme decideix com respondre.
//
// Memòria:
// local · lenta · imperfecta · efímera
//
// Àudio:
// deriva de l'estat de l'organisme.
// No és pointer → nota.
//
// WebGL 1
// Sense raymarching
// Sense textures de simulació pesades
// Sense postprocessos
// DPR limitat
// ============================================================


// ============================================================
// CONFIGURACIÓ INTERACTIVA
// ============================================================

const PARAMS = {

    // --------------------------------------------------------
    // POINTER
    // --------------------------------------------------------

    perceptionRadius: 1.15,

    anticipationRadius: 0.72,

    contactRadius: 0.30,

    anticipationGain: 0.34,

    contactGain: 1.00,

    pointerEnergy: 1.0,

    pointerSpeedInfluence: 0.42,

    approachInfluence: 0.72,


    // --------------------------------------------------------
    // PROPAGACIÓ
    // --------------------------------------------------------

    propagation: 0.23,

    propagationDistance: 0.55,

    neuralDecay: 0.965,

    recovery: 0.018,

    adaptation: 0.014,


    // --------------------------------------------------------
    // MEMÒRIA
    // --------------------------------------------------------

    memoryGain: 0.36,

    memoryRate: 0.006,

    memoryDecay: 0.0015,

    memoryInfluence: 0.28,


    // --------------------------------------------------------
    // ORGANISME
    // --------------------------------------------------------

    spontaneousActivity: 0.004,

    breathing: 0.018,

    organicMotion: 0.028,

    neuralMotion: 0.010,


    // --------------------------------------------------------
    // COS
    // --------------------------------------------------------

    bodyDeformation: 0.075,

    bodyBreathing: 0.025,

    bodySoftness: 0.72,


    // --------------------------------------------------------
    // VISUAL
    // --------------------------------------------------------

    shellFrontAlpha: 0.115,

    shellBackAlpha: 0.055,

    neuralAlpha: 0.72,

    neuralPointSize: 2.8,

    edgeAlpha: 0.42,


    // --------------------------------------------------------
    // RENDIMENT
    // --------------------------------------------------------

    maxDPR: 1.25,

    neuralNodes: 54,

    maxConnections: 150,


    // --------------------------------------------------------
    // ÀUDIO
    // --------------------------------------------------------

    audioMaster: 0.055,

    audioAttack: 0.08,

    audioRelease: 0.45,

    baseFrequency: 110,

    frequencyRange: 85,

    filterMin: 420,

    filterMax: 1900
};


// ============================================================
// CANVAS
// ============================================================

const canvas = document.getElementById("cosmos");

const gl =
    canvas.getContext(
        "webgl",
        {
            antialias: false,
            alpha: false,
            depth: true,
            powerPreference: "high-performance"
        }
    );

if (!gl) {
    throw new Error("WebGL no disponible.");
}


// ============================================================
// ESTAT GLOBAL
// ============================================================

let width = 1;
let height = 1;
let aspect = 1;
let dpr = 1;

let time = 0;
let lastTime = performance.now();


// ============================================================
// POINTER
// ============================================================

const pointer = {

    x: 0,
    y: 0,

    previousX: 0,
    previousY: 0,

    velocityX: 0,
    velocityY: 0,

    speed: 0,

    inside: false,
    down: false,

    energy: 0,

    lastTime: performance.now()
};


// ============================================================
// ORGANISME
// ============================================================

let organism = {

    activity: 0,
    coherence: 0.7,
    memory: 0,

    calm: 1,

    voltage: 0,

    touch: 0,
    anticipation: 0,
    perception: 0,

    localTouch: 0,

    previousActivity: 0
};


// ============================================================
// SHADERS
// ============================================================

const bodyVertex = `
precision mediump float;

attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

uniform float uTime;
uniform float uActivity;
uniform float uTouch;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vEnergy;

void main() {

    vec3 p = aPosition;

    float angular =
        atan(p.y, p.x);

    float organic =
        sin(
            angular * 3.0 +
            p.z * 4.0 +
            uTime * 0.42
        );

    organic +=
        sin(
            angular * 5.0 -
            p.z * 2.0 -
            uTime * 0.27
        ) * 0.35;

    float radial =
        smoothstep(
            0.0,
            1.0,
            length(p.xy)
        );

    float breathing =
        sin(uTime * 0.31) *
        0.5 +
        0.5;

    float deformation =
        organic *
        0.010 *
        (0.35 + uActivity * 1.8);

    deformation +=
        uTouch *
        0.055 *
        radial;

    p.xy +=
        normalize(
            p.xy +
            vec2(0.0001)
        ) *
        deformation;

    p.xy *=
        1.0 +
        breathing *
        0.010;

    vNormal =
        aNormal;

    vPosition =
        p;

    vEnergy =
        uActivity;

    gl_Position =
        uProjection *
        uView *
        uModel *
        vec4(p, 1.0);
}
`;


const bodyFragment = `
precision mediump float;

uniform float uActivity;
uniform float uMemory;
uniform float uCoherence;
uniform float uTime;
uniform float uAlpha;
uniform float uPass;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vEnergy;

void main() {

    vec3 n =
        normalize(vNormal);

    vec3 light =
        normalize(
            vec3(
                -0.35,
                0.55,
                0.80
            )
        );

    float diffuse =
        max(
            dot(n, light),
            0.0
        );

    float rim =
        pow(
            1.0 -
            abs(n.z),
            2.0
        );

    float internal =
        0.5 +
        0.5 *
        sin(
            uTime * 0.35 +
            vPosition.z * 3.0 +
            vPosition.x * 2.0
        );

    float voltage =
        clamp(
            uActivity * 1.8 +
            uMemory * 0.35,
            0.0,
            1.0
        );

    vec3 quiet =
        vec3(
            0.22,
            0.105,
            0.31
        );

    vec3 warm =
        vec3(
            0.58,
            0.20,
            0.43
        );

    vec3 lightMatter =
        vec3(
            0.78,
            0.55,
            0.82
        );

    vec3 color =
        mix(
            quiet,
            warm,
            voltage
        );

    color =
        mix(
            color,
            lightMatter,
            diffuse * 0.34 +
            rim * 0.16 +
            internal * 0.08
        );

    float alpha =
        uAlpha;

    alpha *=
        0.72 +
        diffuse * 0.28;

    alpha +=
        rim * 0.035;

    if (uPass < 0.5) {
        alpha *= 0.72;
    }

    gl_FragColor =
        vec4(
            color,
            alpha
        );
}
`;


const neuralVertex = `
precision mediump float;

attribute vec3 aPosition;
attribute float aActivity;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

uniform float uTime;

varying float vActivity;

void main() {

    vec3 p =
        aPosition;

    p.x +=
        sin(
            uTime * 0.21 +
            p.z * 4.0 +
            p.y * 3.0
        ) *
        0.006;

    p.y +=
        cos(
            uTime * 0.17 +
            p.x * 3.0
        ) *
        0.005;

    vActivity =
        aActivity;

    gl_Position =
        uProjection *
        uView *
        uModel *
        vec4(
            p,
            1.0
        );

    float size =
        ${PARAMS.neuralPointSize.toFixed(2)}
        +
        aActivity * 5.0;

    gl_PointSize =
        size;
}
`;


const neuralFragment = `
precision mediump float;

varying float vActivity;

void main() {

    vec2 uv =
        gl_PointCoord.xy -
        0.5;

    float d =
        length(uv);

    if (d > 0.5) {
        discard;
    }

    float softness =
        smoothstep(
            0.5,
            0.05,
            d
        );

    vec3 quiet =
        vec3(
            0.48,
            0.24,
            0.55
        );

    vec3 active =
        vec3(
            0.92,
            0.54,
            0.72
        );

    vec3 color =
        mix(
            quiet,
            active,
            clamp(
                vActivity * 1.4,
                0.0,
                1.0
            )
        );

    float alpha =
        softness *
        (
            0.25 +
            vActivity * 0.72
        );

    gl_FragColor =
        vec4(
            color,
            alpha
        );
}
`;


const lineVertex = `
precision mediump float;

attribute vec3 aPosition;
attribute float aActivity;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

varying float vActivity;

void main() {

    vActivity =
        aActivity;

    gl_Position =
        uProjection *
        uView *
        uModel *
        vec4(
            aPosition,
            1.0
        );
}
`;


const lineFragment = `
precision mediump float;

varying float vActivity;

void main() {

    vec3 quiet =
        vec3(
            0.30,
            0.17,
            0.40
        );

    vec3 active =
        vec3(
            0.84,
            0.46,
            0.66
        );

    vec3 color =
        mix(
            quiet,
            active,
            clamp(
                vActivity * 1.5,
                0.0,
                1.0
            )
        );

    float alpha =
        0.045 +
        vActivity * 0.55;

    gl_FragColor =
        vec4(
            color,
            alpha
        );
}
`;


// ============================================================
// SHADER HELPERS
// ============================================================

function createShader(type, source) {

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

        const info =
            gl.getShaderInfoLog(
                shader
            );

        gl.deleteShader(shader);

        throw new Error(
            info
        );
    }

    return shader;
}


function createProgram(
    vertexSource,
    fragmentSource
) {

    const program =
        gl.createProgram();

    const vertex =
        createShader(
            gl.VERTEX_SHADER,
            vertexSource
        );

    const fragment =
        createShader(
            gl.FRAGMENT_SHADER,
            fragmentSource
        );

    gl.attachShader(
        program,
        vertex
    );

    gl.attachShader(
        program,
        fragment
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
            gl.getProgramInfoLog(
                program
            )
        );
    }

    return program;
}


// ============================================================
// PROGRAMS
// ============================================================

const bodyProgram =
    createProgram(
        bodyVertex,
        bodyFragment
    );

const neuralProgram =
    createProgram(
        neuralVertex,
        neuralFragment
    );

const lineProgram =
    createProgram(
        lineVertex,
        lineFragment
    );


// ============================================================
// UNIFORM / ATTRIBUTE LOCATIONS
// ============================================================

const bodyLocations = {

    position:
        gl.getAttribLocation(
            bodyProgram,
            "aPosition"
        ),

    normal:
        gl.getAttribLocation(
            bodyProgram,
            "aNormal"
        ),

    projection:
        gl.getUniformLocation(
            bodyProgram,
            "uProjection"
        ),

    view:
        gl.getUniformLocation(
            bodyProgram,
            "uView"
        ),

    model:
        gl.getUniformLocation(
            bodyProgram,
            "uModel"
        ),

    time:
        gl.getUniformLocation(
            bodyProgram,
            "uTime"
        ),

    activity:
        gl.getUniformLocation(
            bodyProgram,
            "uActivity"
        ),

    touch:
        gl.getUniformLocation(
            bodyProgram,
            "uTouch"
        ),

    memory:
        gl.getUniformLocation(
            bodyProgram,
            "uMemory"
        ),

    coherence:
        gl.getUniformLocation(
            bodyProgram,
            "uCoherence"
        ),

    alpha:
        gl.getUniformLocation(
            bodyProgram,
            "uAlpha"
        ),

    pass:
        gl.getUniformLocation(
            bodyProgram,
            "uPass"
        )
};


const neuralLocations = {

    position:
        gl.getAttribLocation(
            neuralProgram,
            "aPosition"
        ),

    activity:
        gl.getAttribLocation(
            neuralProgram,
            "aActivity"
        ),

    projection:
        gl.getUniformLocation(
            neuralProgram,
            "uProjection"
        ),

    view:
        gl.getUniformLocation(
            neuralProgram,
            "uView"
        ),

    model:
        gl.getUniformLocation(
            neuralProgram,
            "uModel"
        ),

    time:
        gl.getUniformLocation(
            neuralProgram,
            "uTime"
        )
};


const lineLocations = {

    position:
        gl.getAttribLocation(
            lineProgram,
            "aPosition"
        ),

    activity:
        gl.getAttribLocation(
            lineProgram,
            "aActivity"
        ),

    projection:
        gl.getUniformLocation(
            lineProgram,
            "uProjection"
        ),

    view:
        gl.getUniformLocation(
            lineProgram,
            "uView"
        ),

    model:
        gl.getUniformLocation(
            lineProgram,
            "uModel"
        )
};


// ============================================================
// MAT4
// COLUMN MAJOR
// ============================================================

function mat4Identity() {

    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}


function mat4Multiply(a, b) {

    const out =
        new Float32Array(16);

    for (let column = 0; column < 4; column++) {

        const b0 = b[column * 4 + 0];
        const b1 = b[column * 4 + 1];
        const b2 = b[column * 4 + 2];
        const b3 = b[column * 4 + 3];

        out[column * 4 + 0] =
            a[0] * b0 +
            a[4] * b1 +
            a[8] * b2 +
            a[12] * b3;

        out[column * 4 + 1] =
            a[1] * b0 +
            a[5] * b1 +
            a[9] * b2 +
            a[13] * b3;

        out[column * 4 + 2] =
            a[2] * b0 +
            a[6] * b1 +
            a[10] * b2 +
            a[14] * b3;

        out[column * 4 + 3] =
            a[3] * b0 +
            a[7] * b1 +
            a[11] * b2 +
            a[15] * b3;
    }

    return out;
}


function mat4Perspective(
    fov,
    aspect,
    near,
    far
) {

    const f =
        1 /
        Math.tan(
            fov / 2
        );

    const nf =
        1 /
        (near - far);

    const out =
        new Float32Array(16);

    out[0] =
        f / aspect;

    out[5] =
        f;

    out[10] =
        (far + near) * nf;

    out[11] =
        -1;

    out[14] =
        2 *
        far *
        near *
        nf;

    return out;
}


function mat4Translate(
    x,
    y,
    z
) {

    const out =
        mat4Identity();

    out[12] = x;
    out[13] = y;
    out[14] = z;

    return out;
}


function mat4RotateX(angle) {

    const c =
        Math.cos(angle);

    const s =
        Math.sin(angle);

    return new Float32Array([
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1
    ]);
}


function mat4RotateY(angle) {

    const c =
        Math.cos(angle);

    const s =
        Math.sin(angle);

    return new Float32Array([
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1
    ]);
}


function mat4RotateZ(angle) {

    const c =
        Math.cos(angle);

    const s =
        Math.sin(angle);

    return new Float32Array([
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}


// ============================================================
// GEOMETRIA HEXAGONAL
// ============================================================

const BODY_SIDES = 6;
const BODY_RINGS = 9;

const BODY_RADIUS = 1.0;
const BODY_DEPTH = 0.72;

const bodyPositions = [];
const bodyNormals = [];
const bodyIndices = [];


// ------------------------------------------------------------
// RINGS
// ------------------------------------------------------------

for (
    let ring = 0;
    ring < BODY_RINGS;
    ring++
) {

    const z =
        -BODY_DEPTH * 0.5 +
        BODY_DEPTH *
        (
            ring /
            (BODY_RINGS - 1)
        );

    const zNorm =
        ring /
        (BODY_RINGS - 1);

    for (
        let side = 0;
        side < BODY_SIDES;
        side++
    ) {

        const angle =
            side *
            Math.PI *
            2 /
            BODY_SIDES +
            Math.PI / 6;

        const corner =
            1.0 +
            Math.sin(
                side * 7.31
            ) *
            0.025;

        const radius =
            BODY_RADIUS *
            corner *
            (
                1.0 -
                Math.abs(
                    zNorm - 0.5
                ) *
                0.055
            );

        const x =
            Math.cos(angle) *
            radius;

        const y =
            Math.sin(angle) *
            radius;

        bodyPositions.push(
            x,
            y,
            z
        );

        const nx =
            Math.cos(angle);

        const ny =
            Math.sin(angle);

        bodyNormals.push(
            nx,
            ny,
            0
        );
    }
}


// ------------------------------------------------------------
// LATERALS
// ------------------------------------------------------------

for (
    let ring = 0;
    ring < BODY_RINGS - 1;
    ring++
) {

    for (
        let side = 0;
        side < BODY_SIDES;
        side++
    ) {

        const next =
            (side + 1) %
            BODY_SIDES;

        const a =
            ring *
            BODY_SIDES +
            side;

        const b =
            ring *
            BODY_SIDES +
            next;

        const c =
            (ring + 1) *
            BODY_SIDES +
            side;

        const d =
            (ring + 1) *
            BODY_SIDES +
            next;

        bodyIndices.push(
            a, c, b,
            b, c, d
        );
    }
}


// ------------------------------------------------------------
// CAPS
// ------------------------------------------------------------

const frontCenter =
    bodyPositions.length / 3;

bodyPositions.push(
    0,
    0,
    BODY_DEPTH * 0.5
);

bodyNormals.push(
    0,
    0,
    1
);


const backCenter =
    bodyPositions.length / 3;

bodyPositions.push(
    0,
    0,
    -BODY_DEPTH * 0.5
);

bodyNormals.push(
    0,
    0,
    -1
);


for (
    let side = 0;
    side < BODY_SIDES;
    side++
) {

    const next =
        (side + 1) %
        BODY_SIDES;

    const front =
        (BODY_RINGS - 1) *
        BODY_SIDES +
        side;

    const frontNext =
        (BODY_RINGS - 1) *
        BODY_SIDES +
        next;

    bodyIndices.push(
        frontCenter,
        front,
        frontNext
    );


    const back =
        side;

    const backNext =
        next;

    bodyIndices.push(
        backCenter,
        backNext,
        back
    );
}


// ============================================================
// BODY BUFFERS
// ============================================================

const bodyPositionBuffer =
    gl.createBuffer();

gl.bindBuffer(
    gl.ARRAY_BUFFER,
    bodyPositionBuffer
);

gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(
        bodyPositions
    ),
    gl.DYNAMIC_DRAW
);


const bodyNormalBuffer =
    gl.createBuffer();

gl.bindBuffer(
    gl.ARRAY_BUFFER,
    bodyNormalBuffer
);

gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(
        bodyNormals
    ),
    gl.STATIC_DRAW
);


const bodyIndexBuffer =
    gl.createBuffer();

gl.bindBuffer(
    gl.ELEMENT_ARRAY_BUFFER,
    bodyIndexBuffer
);

gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(
        bodyIndices
    ),
    gl.STATIC_DRAW
);


// ============================================================
// NEURAL TISSUE
// ============================================================

const NODE_COUNT =
    PARAMS.neuralNodes;

const neuralPositions =
    new Float32Array(
        NODE_COUNT * 3
    );

const neuralActivity =
    new Float32Array(
        NODE_COUNT
    );

const neuralMemory =
    new Float32Array(
        NODE_COUNT
    );

const neuralNext =
    new Float32Array(
        NODE_COUNT
    );

const neuralMemoryNext =
    new Float32Array(
        NODE_COUNT
    );


// ------------------------------------------------------------
// RANDOM DETERMINISTIC
// ------------------------------------------------------------

let randomSeed =
    712367;

function random() {

    randomSeed =
        (
            randomSeed *
            1664525 +
            1013904223
        ) >>> 0;

    return (
        randomSeed /
        4294967296
    );
}


// ------------------------------------------------------------
// HEXAGON CONTAINMENT
// ------------------------------------------------------------

function insideHexagon(
    x,
    y,
    radius
) {

    const apothem =
        radius *
        Math.cos(
            Math.PI / 6
        );

    const ax =
        Math.abs(x);

    const ay =
        Math.abs(y);

    if (
        ax > radius ||
        ay > apothem
    ) {
        return false;
    }

    return (
        Math.sqrt(3) * ax +
        ay <=
        Math.sqrt(3) *
        radius
    );
}


// ------------------------------------------------------------
// NODE POSITIONS
// ------------------------------------------------------------

for (
    let i = 0;
    i < NODE_COUNT;
    i++
) {

    let x = 0;
    let y = 0;

    do {

        x =
            (
                random() *
                2 -
                1
            ) *
            0.78;

        y =
            (
                random() *
                2 -
                1
            ) *
            0.68;

    } while (
        !insideHexagon(
            x,
            y,
            0.82
        )
    );

    const layer =
        i % 3;

    const z =
        (
            layer - 1
        ) *
        0.24 +
        (
            random() *
            2 -
            1
        ) *
        0.10;

    neuralPositions[
        i * 3
    ] = x;

    neuralPositions[
        i * 3 + 1
    ] = y;

    neuralPositions[
        i * 3 + 2
    ] = z;

    neuralActivity[i] =
        random() *
        0.025;

    neuralMemory[i] =
        random() *
        0.02;
}


// ============================================================
// CONNECTIONS
// ============================================================

const connections = [];

for (
    let i = 0;
    i < NODE_COUNT;
    i++
) {

    const neighbours = [];

    const ix =
        neuralPositions[
            i * 3
        ];

    const iy =
        neuralPositions[
            i * 3 + 1
        ];

    const iz =
        neuralPositions[
            i * 3 + 2
        ];

    for (
        let j = 0;
        j < NODE_COUNT;
        j++
    ) {

        if (i === j) {
            continue;
        }

        const dx =
            neuralPositions[
                j * 3
            ] - ix;

        const dy =
            neuralPositions[
                j * 3 + 1
            ] - iy;

        const dz =
            neuralPositions[
                j * 3 + 2
            ] - iz;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy +
                dz * dz
            );

        neighbours.push({
            index: j,
            distance
        });
    }

    neighbours.sort(
        (
            a,
            b
        ) =>
            a.distance -
            b.distance
    );

    const amount =
        Math.min(
            4,
            neighbours.length
        );

    for (
        let k = 0;
        k < amount;
        k++
    ) {

        const j =
            neighbours[k].index;

        const key =
            i < j
                ? i + ":" + j
                : j + ":" + i;

        let exists = false;

        for (
            let n = 0;
            n < connections.length;
            n++
        ) {

            if (
                connections[n].key ===
                key
            ) {

                exists = true;
                break;
            }
        }

        if (!exists) {

            connections.push({
                a: i,
                b: j,
                distance:
                    neighbours[k].distance,
                key
            });
        }

        if (
            connections.length >=
            PARAMS.maxConnections
        ) {
            break;
        }
    }

    if (
        connections.length >=
        PARAMS.maxConnections
    ) {
        break;
    }
}


// ============================================================
// NEURAL LINE DATA
// ============================================================

const linePositions =
    new Float32Array(
        connections.length *
        2 *
        3
    );

const lineActivities =
    new Float32Array(
        connections.length *
        2
    );


function updateLineGeometry() {

    for (
        let i = 0;
        i < connections.length;
        i++
    ) {

        const connection =
            connections[i];

        const a =
            connection.a;

        const b =
            connection.b;

        const offset =
            i * 6;

        linePositions[offset] =
            neuralPositions[a * 3];

        linePositions[offset + 1] =
            neuralPositions[a * 3 + 1];

        linePositions[offset + 2] =
            neuralPositions[a * 3 + 2];


        linePositions[offset + 3] =
            neuralPositions[b * 3];

        linePositions[offset + 4] =
            neuralPositions[b * 3 + 1];

        linePositions[offset + 5] =
            neuralPositions[b * 3 + 2];


        const activity =
            (
                neuralActivity[a] +
                neuralActivity[b]
            ) *
            0.5;

        const memory =
            (
                neuralMemory[a] +
                neuralMemory[b]
            ) *
            0.5;

        const value =
            Math.min(
                1,
                activity +
                memory *
                PARAMS.memoryInfluence
            );

        lineActivities[i * 2] =
            value;

        lineActivities[i * 2 + 1] =
            value;
    }
}


updateLineGeometry();


// ============================================================
// NEURAL BUFFERS
// ============================================================

const neuralPositionBuffer =
    gl.createBuffer();

gl.bindBuffer(
    gl.ARRAY_BUFFER,
    neuralPositionBuffer
);

gl.bufferData(
    gl.ARRAY_BUFFER,
    neuralPositions,
    gl.STATIC_DRAW
);


const neuralActivityBuffer =
    gl.createBuffer();

gl.bindBuffer(
    gl.ARRAY_BUFFER,
    neuralActivityBuffer
);

gl.bufferData(
    gl.ARRAY_BUFFER,
    neuralActivity,
    gl.DYNAMIC_DRAW
);


const linePositionBuffer =
    gl.createBuffer();

gl.bindBuffer(
    gl.ARRAY_BUFFER,
    linePositionBuffer
);

gl.bufferData(
    gl.ARRAY_BUFFER,
    linePositions,
    gl.STATIC_DRAW
);


const lineActivityBuffer =
    gl.createBuffer();

gl.bindBuffer(
    gl.ARRAY_BUFFER,
    lineActivityBuffer
);

gl.bufferData(
    gl.ARRAY_BUFFER,
    lineActivities,
    gl.DYNAMIC_DRAW
);


// ============================================================
// MATRICES
// ============================================================

let projection =
    mat4Identity();

let view =
    mat4Identity();

let model =
    mat4Identity();


function updateMatrices() {

    projection =
        mat4Perspective(
            0.78,
            aspect,
            0.05,
            20
        );

    view =
        mat4Translate(
            0,
            0,
            -3.25
        );

    const rx =
        mat4RotateX(
            Math.sin(time * 0.17) *
            0.055
        );

    const ry =
        mat4RotateY(
            time * 0.055
        );

    const rz =
        mat4RotateZ(
            Math.sin(time * 0.11) *
            0.025
        );

    model =
        mat4Multiply(
            ry,
            mat4Multiply(
                rx,
                rz
            )
        );
}


// ============================================================
// POINTER COORDINATES
// ============================================================

function updatePointer(
    clientX,
    clientY
) {

    const rect =
        canvas.getBoundingClientRect();

    const x =
        (
            clientX -
            rect.left
        ) /
        rect.width;

    const y =
        (
            clientY -
            rect.top
        ) /
        rect.height;

    const nx =
        x * 2 -
        1;

    const ny =
        1 -
        y * 2;


    const now =
        performance.now();

    const dt =
        Math.max(
            8,
            now -
            pointer.lastTime
        ) /
        1000;


    pointer.previousX =
        pointer.x;

    pointer.previousY =
        pointer.y;

    pointer.x =
        nx;

    pointer.y =
        ny;


    pointer.velocityX =
        (
            pointer.x -
            pointer.previousX
        ) /
        dt;

    pointer.velocityY =
        (
            pointer.y -
            pointer.previousY
        ) /
        dt;


    pointer.speed =
        Math.min(
            1,
            Math.sqrt(
                pointer.velocityX *
                pointer.velocityX +
                pointer.velocityY *
                pointer.velocityY
            ) *
            0.12
        );


    pointer.lastTime =
        now;

    pointer.inside =
        true;
}


canvas.addEventListener(
    "pointermove",
    event => {

        updatePointer(
            event.clientX,
            event.clientY
        );

    },
    {
        passive: true
    }
);


canvas.addEventListener(
    "pointerenter",
    event => {

        pointer.inside =
            true;

        updatePointer(
            event.clientX,
            event.clientY
        );

    }
);


canvas.addEventListener(
    "pointerleave",
    () => {

        pointer.inside =
            false;

    }
);


canvas.addEventListener(
    "pointerdown",
    async event => {

        pointer.down =
            true;

        updatePointer(
            event.clientX,
            event.clientY
        );

        await startAudio();

    },
    {
        passive: true
    }
);


window.addEventListener(
    "pointerup",
    () => {

        pointer.down =
            false;

    }
);


// ============================================================
// PERCEPCIÓ
// ============================================================

function updatePerception() {

    if (!pointer.inside) {

        organism.perception *=
            0.94;

        organism.anticipation *=
            0.92;

        organism.touch *=
            0.90;

        return;
    }


    const distance =
        Math.sqrt(
            pointer.x *
            pointer.x +
            pointer.y *
            pointer.y
        );


    organism.perception =
        smoothDecay(
            organism.perception,
            smoothStep(
                PARAMS.perceptionRadius,
                0,
                distance
            ),
            0.12
        );


    const anticipationField =
        smoothStep(
            PARAMS.anticipationRadius,
            0,
            distance
        );


    let approach =
        0;


    if (
        pointer.speed >
        0.001
    ) {

        const length =
            Math.sqrt(
                pointer.x *
                pointer.x +
                pointer.y *
                pointer.y
            );


        if (
            length >
            0.001
        ) {

            const radialX =
                -pointer.x /
                length;

            const radialY =
                -pointer.y /
                length;

            const velocityLength =
                Math.sqrt(
                    pointer.velocityX *
                    pointer.velocityX +
                    pointer.velocityY *
                    pointer.velocityY
                );


            const vx =
                pointer.velocityX /
                Math.max(
                    velocityLength,
                    0.0001
                );

            const vy =
                pointer.velocityY /
                Math.max(
                    velocityLength,
                    0.0001
                );


            approach =
                Math.max(
                    0,
                    radialX * vx +
                    radialY * vy
                );
        }
    }


    organism.anticipation =
        smoothDecay(
            organism.anticipation,
            anticipationField *
            (
                0.35 +
                approach *
                PARAMS.approachInfluence
            ),
            0.10
        );


    let targetTouch = 0;


    if (
        pointer.down
    ) {

        targetTouch =
            smoothStep(
                PARAMS.contactRadius,
                0,
                distance
            );
    }


    organism.touch =
        smoothDecay(
            organism.touch,
            targetTouch,
            targetTouch > organism.touch
                ? 0.25
                : 0.08
        );
}


// ============================================================
// UTILITATS
// ============================================================

function smoothStep(
    edge0,
    edge1,
    value
) {

    const t =
        Math.max(
            0,
            Math.min(
                1,
                (
                    value -
                    edge0
                ) /
                (
                    edge1 -
                    edge0
                )
            )
        );

    return (
        t * t *
        (
            3 -
            2 * t
        )
    );
}


function smoothDecay(
    current,
    target,
    amount
) {

    return (
        current +
        (
            target -
            current
        ) *
        amount
    );
}


function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );
}


// ============================================================
// NEURAL SIMULATION
// ============================================================

function simulateNeural() {

    let total =
        0;

    let totalSquared =
        0;

    let localTouch =
        0;


    for (
        let i = 0;
        i < NODE_COUNT;
        i++
    ) {

        const x =
            neuralPositions[
                i * 3
            ];

        const y =
            neuralPositions[
                i * 3 + 1
            ];

        const z =
            neuralPositions[
                i * 3 + 2
            ];


        const px =
            pointer.x *
            0.90;

        const py =
            pointer.y *
            0.90;


        const dx =
            x -
            px;

        const dy =
            y -
            py;

        const dz =
            z;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy +
                dz * dz *
                0.5
            );


        const localPerception =
            smoothStep(
                PARAMS.perceptionRadius,
                0,
                distance
            );


        const localAnticipation =
            smoothStep(
                PARAMS.anticipationRadius,
                0,
                distance
            );


        const localContact =
            smoothStep(
                PARAMS.contactRadius,
                0,
                distance
            );


        let approach =
            organism.anticipation;


        let input =
            localPerception *
            0.05;


        input +=
            localAnticipation *
            PARAMS.anticipationGain *
            approach *
            0.055;


        input +=
            localContact *
            organism.touch *
            PARAMS.contactGain *
            0.11;


        input *=
            PARAMS.pointerEnergy;


        input *=
            0.72 +
            pointer.speed *
            PARAMS.pointerSpeedInfluence;


        const previous =
            neuralActivity[i];


        neuralNext[i] =
            previous *
            PARAMS.neuralDecay;


        neuralNext[i] +=
            input;


        neuralNext[i] +=
            (
                neuralMemory[i] *
                PARAMS.memoryInfluence
            );


        neuralNext[i] +=
            (
                random() -
                0.5
            ) *
            PARAMS.spontaneousActivity;


        if (
            localContact >
            0.15
        ) {

            localTouch +=
                localContact *
                neuralNext[i];
        }
    }


    // --------------------------------------------------------
    // PROPAGACIÓ
    // --------------------------------------------------------

    for (
        let i = 0;
        i < connections.length;
        i++
    ) {

        const connection =
            connections[i];

        const a =
            connection.a;

        const b =
            connection.b;

        const valueA =
            neuralActivity[a];

        const valueB =
            neuralActivity[b];


        const distanceFactor =
            clamp(
                1 -
                connection.distance /
                PARAMS.propagationDistance,
                0,
                1
            );


        const transfer =
            PARAMS.propagation *
            distanceFactor;


        neuralNext[a] +=
            valueB *
            transfer *
            0.10;

        neuralNext[b] +=
            valueA *
            transfer *
            0.10;
    }


    // --------------------------------------------------------
    // RECUPERACIÓ + MEMÒRIA
    // --------------------------------------------------------

    for (
        let i = 0;
        i < NODE_COUNT;
        i++
    ) {

        let value =
            neuralNext[i];


        value =
            clamp(
                value,
                0,
                1
            );


        value =
            value *
            (
                1 -
                PARAMS.recovery
            );


        neuralNext[i] =
            value;


        const difference =
            Math.abs(
                value -
                neuralActivity[i]
            );


        neuralMemoryNext[i] =
            neuralMemory[i] *
            (
                1 -
                PARAMS.memoryRate -
                PARAMS.memoryDecay
            );


        neuralMemoryNext[i] +=
            difference *
            PARAMS.memoryGain *
            PARAMS.memoryRate;


        neuralMemoryNext[i] =
            clamp(
                neuralMemoryNext[i],
                0,
                1
            );


        total +=
            value;

        totalSquared +=
            value *
            value;
    }


    // --------------------------------------------------------
    // SWAP
    // --------------------------------------------------------

    for (
        let i = 0;
        i < NODE_COUNT;
        i++
    ) {

        neuralActivity[i] =
            neuralNext[i];

        neuralMemory[i] =
            neuralMemoryNext[i];
    }


    const mean =
        total /
        NODE_COUNT;


    const variance =
        Math.max(
            0,
            totalSquared /
            NODE_COUNT -
            mean * mean
        );


    const coherence =
        clamp(
            1 -
            variance * 18,
            0,
            1
        );


    organism.previousActivity =
        organism.activity;


    organism.activity =
        smoothDecay(
            organism.activity,
            mean,
            0.16
        );


    organism.coherence =
        smoothDecay(
            organism.coherence,
            coherence,
            0.035
        );


    organism.memory =
        smoothDecay(
            organism.memory,
            mean *
            0.45 +
            averageMemory() *
            0.55,
            0.025
        );


    organism.calm =
        clamp(
            1 -
            organism.activity * 2.2,
            0,
            1
        );


    organism.voltage =
        clamp(
            organism.activity * 2.2 +
            organism.touch * 0.35 +
            organism.memory * 0.25,
            0,
            1
        );


    organism.localTouch =
        clamp(
            localTouch /
            NODE_COUNT *
            8,
            0,
            1
        );
}


function averageMemory() {

    let total =
        0;

    for (
        let i = 0;
        i < NODE_COUNT;
        i++
    ) {

        total +=
            neuralMemory[i];
    }

    return (
        total /
        NODE_COUNT
    );
}


// ============================================================
// BODY UPDATE
// ============================================================

function updateBodyGeometry() {

    const energy =
        organism.activity;

    const memory =
        organism.memory;

    const touch =
        organism.localTouch;


    for (
        let i = 0;
        i < bodyPositions.length / 3;
        i++
    ) {

        let x =
            bodyPositions[i * 3];

        let y =
            bodyPositions[i * 3 + 1];

        let z =
            bodyPositions[i * 3 + 2];


        const angle =
            Math.atan2(
                y,
                x
            );


        const organic =
            Math.sin(
                angle * 3.0 +
                z * 4.0 +
                time * 0.42
            );


        const organic2 =
            Math.sin(
                angle * 5.0 -
                z * 2.0 -
                time * 0.27
            );


        const radius =
            Math.sqrt(
                x * x +
                y * y
            );


        const breath =
            Math.sin(
                time * 0.31
            ) *
            PARAMS.bodyBreathing;


        const tissue =
            (
                organic +
                organic2 * 0.35
            ) *
            PARAMS.bodyDeformation *
            (
                0.12 +
                energy
            );


        const local =
            smoothStep(
                1.2,
                0,
                Math.sqrt(
                    (
                        x -
                        pointer.x *
                        0.72
                    ) ** 2 +
                    (
                        y -
                        pointer.y *
                        0.72
                    ) ** 2
                )
            );


        const response =
            local *
            touch *
            0.035;


        const scale =
            1 +
            breath +
            tissue +
            response +
            memory *
            0.008;


        bodyPositions[i * 3] =
            x *
            scale;

        bodyPositions[i * 3 + 1] =
            y *
            scale;

        bodyPositions[i * 3 + 2] =
            z +
            Math.sin(
                angle * 2.0 +
                time * 0.22
            ) *
            energy *
            0.012;
    }


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        bodyPositionBuffer
    );

    gl.bufferSubData(
        gl.ARRAY_BUFFER,
        0,
        new Float32Array(
            bodyPositions
        )
    );
}


// ============================================================
// AUDIO
// ============================================================

let audio = null;
let audioStarting = false;


async function startAudio() {

    if (audio) {

        if (
            audio.context.state ===
            "suspended"
        ) {

            try {
                await audio.context.resume();
            }
            catch (_) {}
        }

        return;
    }


    if (audioStarting) {
        return;
    }


    audioStarting =
        true;


    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) {
            audioStarting = false;
            return;
        }


        const context =
            new AudioContext();


        const oscillator =
            context.createOscillator();


        const filter =
            context.createBiquadFilter();


        const compressor =
            context.createDynamicsCompressor();


        const master =
            context.createGain();


        oscillator.type =
            "sine";


        oscillator.frequency.value =
            PARAMS.baseFrequency;


        filter.type =
            "lowpass";


        filter.frequency.value =
            PARAMS.filterMin;


        filter.Q.value =
            0.35;


        compressor.threshold.value =
            -18;

        compressor.knee.value =
            16;

        compressor.ratio.value =
            3;

        compressor.attack.value =
            0.015;

        compressor.release.value =
            0.18;


        master.gain.value =
            0;


        oscillator.connect(
            filter
        );

        filter.connect(
            compressor
        );

        compressor.connect(
            master
        );

        master.connect(
            context.destination
        );


        oscillator.start();


        audio = {

            context,

            oscillator,

            filter,

            compressor,

            master
        };


        if (
            context.state ===
            "suspended"
        ) {

            await context.resume();
        }


        audioStarting =
            false;

    }
    catch (_) {

        audioStarting =
            false;
    }
}


function updateAudio() {

    if (!audio) {
        return;
    }


    const now =
        audio.context.currentTime;


    const activity =
        organism.activity;

    const coherence =
        organism.coherence;

    const memory =
        organism.memory;

    const touch =
        organism.touch;


    // --------------------------------------------------------
    // LA FREQÜÈNCIA NEIX DE L'ESTAT
    // --------------------------------------------------------

    const frequency =
        PARAMS.baseFrequency +
        coherence *
        PARAMS.frequencyRange * 0.38 +
        activity *
        PARAMS.frequencyRange * 0.62 +
        memory *
        18;


    const filterFrequency =
        PARAMS.filterMin +
        (
            PARAMS.filterMax -
            PARAMS.filterMin
        ) *
        (
            activity * 0.55 +
            coherence * 0.25 +
            touch * 0.20
        );


    const targetGain =
        PARAMS.audioMaster *
        (
            0.12 +
            activity * 0.75 +
            touch * 0.22
        );


    audio.oscillator.frequency
        .setTargetAtTime(
            frequency,
            now,
            PARAMS.audioAttack
        );


    audio.filter.frequency
        .setTargetAtTime(
            filterFrequency,
            now,
            0.16
        );


    audio.master.gain
        .setTargetAtTime(
            targetGain,
            now,
            PARAMS.audioRelease
        );
}


// ============================================================
// RENDER BODY
// ============================================================

function prepareBody() {

    gl.useProgram(
        bodyProgram
    );


    gl.uniformMatrix4fv(
        bodyLocations.projection,
        false,
        projection
    );

    gl.uniformMatrix4fv(
        bodyLocations.view,
        false,
        view
    );

    gl.uniformMatrix4fv(
        bodyLocations.model,
        false,
        model
    );


    gl.uniform1f(
        bodyLocations.time,
        time
    );

    gl.uniform1f(
        bodyLocations.activity,
        organism.activity
    );

    gl.uniform1f(
        bodyLocations.touch,
        organism.localTouch
    );

    gl.uniform1f(
        bodyLocations.memory,
        organism.memory
    );

    gl.uniform1f(
        bodyLocations.coherence,
        organism.coherence
    );


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        bodyPositionBuffer
    );

    gl.enableVertexAttribArray(
        bodyLocations.position
    );

    gl.vertexAttribPointer(
        bodyLocations.position,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        bodyNormalBuffer
    );

    gl.enableVertexAttribArray(
        bodyLocations.normal
    );

    gl.vertexAttribPointer(
        bodyLocations.normal,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );


    gl.bindBuffer(
        gl.ELEMENT_ARRAY_BUFFER,
        bodyIndexBuffer
    );
}


function drawBodyPass(
    backPass
) {

    if (backPass) {

        gl.enable(
            gl.CULL_FACE
        );

        gl.cullFace(
            gl.FRONT
        );

        gl.uniform1f(
            bodyLocations.alpha,
            PARAMS.shellBackAlpha
        );

        gl.uniform1f(
            bodyLocations.pass,
            0
        );

    }
    else {

        gl.enable(
            gl.CULL_FACE
        );

        gl.cullFace(
            gl.BACK
        );

        gl.uniform1f(
            bodyLocations.alpha,
            PARAMS.shellFrontAlpha
        );

        gl.uniform1f(
            bodyLocations.pass,
            1
        );
    }


    gl.drawElements(
        gl.TRIANGLES,
        bodyIndices.length,
        gl.UNSIGNED_SHORT,
        0
    );
}


// ============================================================
// RENDER NEURAL TISSUE
// ============================================================

function drawNeuralTissue() {

    // --------------------------------------------------------
    // LÍNIES
    // --------------------------------------------------------

    updateLineGeometry();


    gl.useProgram(
        lineProgram
    );


    gl.uniformMatrix4fv(
        lineLocations.projection,
        false,
        projection
    );

    gl.uniformMatrix4fv(
        lineLocations.view,
        false,
        view
    );

    gl.uniformMatrix4fv(
        lineLocations.model,
        false,
        model
    );


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        linePositionBuffer
    );

    gl.enableVertexAttribArray(
        lineLocations.position
    );

    gl.vertexAttribPointer(
        lineLocations.position,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        lineActivityBuffer
    );

    gl.bufferSubData(
        gl.ARRAY_BUFFER,
        0,
        lineActivities
    );


    gl.enableVertexAttribArray(
        lineLocations.activity
    );

    gl.vertexAttribPointer(
        lineLocations.activity,
        1,
        gl.FLOAT,
        false,
        0,
        0
    );


    gl.drawArrays(
        gl.LINES,
        0,
        connections.length * 2
    );


    // --------------------------------------------------------
    // PUNTS
    // --------------------------------------------------------

    gl.useProgram(
        neuralProgram
    );


    gl.uniformMatrix4fv(
        neuralLocations.projection,
        false,
        projection
    );

    gl.uniformMatrix4fv(
        neuralLocations.view,
        false,
        view
    );

    gl.uniformMatrix4fv(
        neuralLocations.model,
        false,
        model
    );


    gl.uniform1f(
        neuralLocations.time,
        time
    );


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        neuralPositionBuffer
    );

    gl.enableVertexAttribArray(
        neuralLocations.position
    );

    gl.vertexAttribPointer(
        neuralLocations.position,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        neuralActivityBuffer
    );

    gl.bufferSubData(
        gl.ARRAY_BUFFER,
        0,
        neuralActivity
    );


    gl.enableVertexAttribArray(
        neuralLocations.activity
    );

    gl.vertexAttribPointer(
        neuralLocations.activity,
        1,
        gl.FLOAT,
        false,
        0,
        0
    );


    gl.drawArrays(
        gl.POINTS,
        0,
        NODE_COUNT
    );
}


// ============================================================
// HEXAGON EDGES
// ============================================================

function drawHexagonalEdges() {

    gl.useProgram(
        lineProgram
    );


    const edgePositions =
        [];


    // --------------------------------------------------------
    // FRONT / BACK
    // --------------------------------------------------------

    for (
        let ringIndex of [
            0,
            BODY_RINGS - 1
        ]
    ) {

        for (
            let side = 0;
            side < BODY_SIDES;
            side++
        ) {

            const next =
                (
                    side + 1
                ) %
                BODY_SIDES;


            const a =
                ringIndex *
                BODY_SIDES +
                side;

            const b =
                ringIndex *
                BODY_SIDES +
                next;


            edgePositions.push(
                bodyPositions[a * 3],
                bodyPositions[a * 3 + 1],
                bodyPositions[a * 3 + 2],

                bodyPositions[b * 3],
                bodyPositions[b * 3 + 1],
                bodyPositions[b * 3 + 2]
            );
        }
    }


    // --------------------------------------------------------
    // LONGITUDINALS
    // --------------------------------------------------------

    for (
        let side = 0;
        side < BODY_SIDES;
        side++
    ) {

        const a =
            side;

        const b =
            (
                BODY_RINGS - 1
            ) *
            BODY_SIDES +
            side;


        edgePositions.push(
            bodyPositions[a * 3],
            bodyPositions[a * 3 + 1],
            bodyPositions[a * 3 + 2],

            bodyPositions[b * 3],
            bodyPositions[b * 3 + 1],
            bodyPositions[b * 3 + 2]
        );
    }


    const edgeActivity =
        new Float32Array(
            edgePositions.length /
            3
        );


    for (
        let i = 0;
        i < edgeActivity.length;
        i++
    ) {

        edgeActivity[i] =
            0.16 +
            organism.activity *
            0.42 +
            organism.memory *
            0.12;
    }


    const positionBuffer =
        gl.createBuffer();

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        positionBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(
            edgePositions
        ),
        gl.DYNAMIC_DRAW
    );


    gl.enableVertexAttribArray(
        lineLocations.position
    );

    gl.vertexAttribPointer(
        lineLocations.position,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );


    const activityBuffer =
        gl.createBuffer();

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        activityBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        edgeActivity,
        gl.DYNAMIC_DRAW
    );


    gl.enableVertexAttribArray(
        lineLocations.activity
    );

    gl.vertexAttribPointer(
        lineLocations.activity,
        1,
        gl.FLOAT,
        false,
        0,
        0
    );


    gl.uniformMatrix4fv(
        lineLocations.projection,
        false,
        projection
    );

    gl.uniformMatrix4fv(
        lineLocations.view,
        false,
        view
    );

    gl.uniformMatrix4fv(
        lineLocations.model,
        false,
        model
    );


    gl.drawArrays(
        gl.LINES,
        0,
        edgePositions.length / 3
    );


    gl.deleteBuffer(
        positionBuffer
    );

    gl.deleteBuffer(
        activityBuffer
    );
}


// ============================================================
// RESIZE
// ============================================================

function resize() {

    const rect =
        canvas.getBoundingClientRect();


    width =
        Math.max(
            1,
            rect.width
        );

    height =
        Math.max(
            1,
            rect.height
        );


    aspect =
        width /
        height;


    dpr =
        Math.min(
            window.devicePixelRatio ||
            1,
            PARAMS.maxDPR
        );


    canvas.width =
        Math.floor(
            width *
            dpr
        );

    canvas.height =
        Math.floor(
            height *
            dpr
        );


    gl.viewport(
        0,
        0,
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
// WEBGL ESTAT
// ============================================================

gl.enable(
    gl.DEPTH_TEST
);

gl.depthFunc(
    gl.LEQUAL
);

gl.enable(
    gl.BLEND
);

gl.blendFunc(
    gl.SRC_ALPHA,
    gl.ONE_MINUS_SRC_ALPHA
);

gl.disable(
    gl.CULL_FACE
);


// ============================================================
// RENDER
// ============================================================

function render(now) {

    const delta =
        Math.min(
            0.05,
            (
                now -
                lastTime
            ) /
            1000
        );


    lastTime =
        now;

    time +=
        delta;


    // --------------------------------------------------------
    // POINTER
    // --------------------------------------------------------

    updatePerception();


    // --------------------------------------------------------
    // ORGANISME
    // --------------------------------------------------------

    simulateNeural();

    updateBodyGeometry();

    updateMatrices();

    updateAudio();


    // --------------------------------------------------------
    // CLEAR
    // --------------------------------------------------------

    gl.clearColor(
        0.018,
        0.012,
        0.022,
        1
    );


    gl.clear(
        gl.COLOR_BUFFER_BIT |
        gl.DEPTH_BUFFER_BIT
    );


    // --------------------------------------------------------
    // INTERIOR
    //
    // El teixit existeix abans que la carcassa.
    // --------------------------------------------------------

    gl.depthMask(
        true
    );

    gl.enable(
        gl.BLEND
    );

    gl.blendFunc(
        gl.SRC_ALPHA,
        gl.ONE_MINUS_SRC_ALPHA
    );


    drawNeuralTissue();


    // --------------------------------------------------------
    // CARCASSA POSTERIOR
    // --------------------------------------------------------

    gl.depthMask(
        false
    );

    prepareBody();

    drawBodyPass(
        true
    );


    // --------------------------------------------------------
    // CARCASSA DAVANTERA
    // --------------------------------------------------------

    drawBodyPass(
        false
    );


    // --------------------------------------------------------
    // ARESTES
    // --------------------------------------------------------

    gl.depthMask(
        false
    );

    drawHexagonalEdges();


    gl.depthMask(
        true
    );


    requestAnimationFrame(
        render
    );
}


requestAnimationFrame(
    render
);


// ============================================================
// SEGURETAT
// ============================================================

window.addEventListener(
    "blur",
    () => {

        pointer.down =
            false;

        pointer.inside =
            false;
    }
);


// ============================================================
// FI
// ============================================================