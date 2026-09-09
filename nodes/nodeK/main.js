/* ============================================================
   ZERO INFINIT · nodeK · Carícies
   MEDUSA BIOTECNOLÒGICA · ORGANITZACIÓ · TEMPERATURA · FLUX
   AUDIO: Bb / jazz orgànic

   El sistema no anima posicions amb una seqüència tancada.
   Manté energia, temperatura, activitat, memòria, coherència,
   flux i dissipació. La forma visual és una conseqüència d'aquests
   camps interns.
   ============================================================ */

(() => {
    "use strict";

    const canvas = document.getElementById("cosmos");

    const gl = canvas.getContext("webgl", {
        antialias: false,
        alpha: false,
        depth: true,
        powerPreference: "high-performance"
    });

    if (!gl) {
        document.body.textContent = "WebGL no disponible.";
        return;
    }

    // ------------------------------------------------------------
    // PARÀMETRES
    // ------------------------------------------------------------

    const P = {
        maxDpr: 1.25,

        bodySides: 6,
        bodyRings: 14,
        bodyRadius: 1.28,
        bodyDepth: 0.92,
        bodyBreath: 0.055,
        bodyDeform: 0.105,

        neuralCount: 86,
        maxLinks: 220,
        neuralRadius: 1.05,
        neuralDepth: 0.72,

        energyBase: 0.105,
        energyInjection: 1.75,
        energyDiffusion: 0.72,
        energyDissipation: 0.21,

        temperatureBase: 0.28,
        heating: 0.22,
        cooling: 0.075,
        temperatureDiffusion: 0.22,

        memoryGain: 0.105,
        memoryDecay: 0.011,

        flowStrength: 0.46,
        flowDamping: 0.74,
        flowTemperature: 0.58,

        luminescenceGain: 1.65,
        luminescenceDecay: 0.42,

        organizationGain: 0.36,
        variationGain: 0.18,

        pointerPerceptionRadius: 0.95,
        pointerContactRadius: 0.30,
        pointerEnergy: 1.8,
        pointerContinuity: 0.22,

        cameraOutside: 4.0,
        cameraInside: 0.70,
        cameraResponse: 0.55,
        cameraDepthGain: 0.34,

        bassHz: 58.27, // Bb1

        audioMaster: 0.075,
        audioBass: 0.050,
        audioPad: 0.022,
        audioTexture: 0.008,
        audioEvent: 0.030
    };

    // ------------------------------------------------------------
    // MATEMÀTICA
    // ------------------------------------------------------------

    const TAU = Math.PI * 2;

    const clamp = (
        v,
        a = 0,
        b = 1
    ) => Math.max(a, Math.min(b, v));

    const lerp = (
        a,
        b,
        t
    ) => a + (b - a) * t;

    const smooth = (
        a,
        b,
        x
    ) => {
        const t = clamp(
            (x - a) / (b - a)
        );

        return t * t * (3 - 2 * t);
    };

    const rand = (
        a = 0,
        b = 1
    ) => a + Math.random() * (b - a);

    const dist2 = (
        ax,
        ay,
        bx,
        by
    ) => {
        const dx = ax - bx;
        const dy = ay - by;

        return dx * dx + dy * dy;
    };

    function dist3(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;

        return Math.sqrt(
            dx * dx +
            dy * dy +
            dz * dz
        );
    }

    function mat4Identity() {
        return new Float32Array([
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1
        ]);
    }

    function mat4Multiply(a, b) {
        const out = new Float32Array(16);

        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 4; r++) {

                out[c * 4 + r] =
                    a[0 * 4 + r] * b[c * 4 + 0] +
                    a[1 * 4 + r] * b[c * 4 + 1] +
                    a[2 * 4 + r] * b[c * 4 + 2] +
                    a[3 * 4 + r] * b[c * 4 + 3];
            }
        }

        return out;
    }

    function perspective(
        fov,
        aspect,
        near,
        far
    ) {
        const f =
            1 / Math.tan(fov / 2);

        const nf =
            1 / (near - far);

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
            2 * far * near * nf;

        return out;
    }

    function translate(
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

    function rotateX(a) {
        const c = Math.cos(a);
        const s = Math.sin(a);

        return new Float32Array([
            1,0,0,0,
            0,c,s,0,
            0,-s,c,0,
            0,0,0,1
        ]);
    }

    function rotateY(a) {
        const c = Math.cos(a);
        const s = Math.sin(a);

        return new Float32Array([
            c,0,-s,0,
            0,1,0,0,
            s,0,c,0,
            0,0,0,1
        ]);
    }

    function rotateZ(a) {
        const c = Math.cos(a);
        const s = Math.sin(a);

        return new Float32Array([
            c,s,0,0,
            -s,c,0,0,
            0,0,1,0,
            0,0,0,1
        ]);
    }

    // ------------------------------------------------------------
    // SHADERS
    // ------------------------------------------------------------

    const bodyVS = `
        precision mediump float;

        attribute vec3 aPosition;
        attribute float aDepth;

        uniform mat4 uMVP;
        uniform float uTime;
        uniform float uBreath;
        uniform float uEnergy;
        uniform float uTemperature;
        uniform float uVariation;

        varying float vDepth;
        varying float vTemp;
        varying float vEnergy;

        void main() {

            vec3 p = aPosition;

            float r = length(p.xy);
            float a = atan(p.y, p.x);

            float wave =
                sin(
                    a * 3.0 +
                    uTime * 0.23 +
                    p.z * 4.0
                );

            float micro =
                sin(
                    a * 11.0 -
                    uTime * 0.31 +
                    p.z * 7.0
                ) * 0.5;

            float organic =
                wave * 0.45 +
                micro * 0.55;

            float scale =
                1.0 +
                uBreath *
                sin(uTime * 0.19) +
                organic *
                0.025 *
                (0.4 + uVariation);

            p.xy *= scale;

            p.xy *=
                1.0 +
                organic *
                0.035 *
                uEnergy;

            p.z +=
                sin(
                    a * 2.0 +
                    uTime * 0.17
                ) *
                0.035 *
                uTemperature;

            vDepth = aDepth;
            vTemp = uTemperature;
            vEnergy = uEnergy;

            gl_Position =
                uMVP *
                vec4(p, 1.0);
        }
    `;

    const bodyFS = `
        precision mediump float;

        varying float vDepth;
        varying float vTemp;
        varying float vEnergy;

        void main() {

            float edge =
                smoothstep(
                    0.15,
                    1.0,
                    abs(vDepth)
                );

            vec3 deep =
                vec3(
                    0.025,
                    0.055,
                    0.075
                );

            vec3 tissue =
                vec3(
                    0.18,
                    0.34,
                    0.38
                );

            vec3 warm =
                vec3(
                    0.63,
                    0.40,
                    0.18
                );

            vec3 c =
                mix(
                    deep,
                    tissue,
                    0.38 +
                    vEnergy * 0.42
                );

            c =
                mix(
                    c,
                    warm,
                    smoothstep(
                        0.62,
                        1.0,
                        vTemp
                    ) * 0.20
                );

            float alpha =
                0.045 +
                vEnergy * 0.055 +
                edge * 0.045;

            gl_FragColor =
                vec4(
                    c,
                    alpha
                );
        }
    `;

    const neuralVS = `
        precision mediump float;

        attribute vec3 aPosition;
        attribute float aEnergy;
        attribute float aTemp;
        attribute float aLum;

        uniform mat4 uMVP;
        uniform float uTime;
        uniform float uPointSize;

        varying float vEnergy;
        varying float vTemp;
        varying float vLum;

        void main() {

            vec3 p =
                aPosition;

            float n =
                sin(
                    p.x * 8.1 +
                    p.y * 5.7 +
                    p.z * 11.3 +
                    uTime * 0.19
                );

            p += vec3(
                sin(
                    uTime * 0.13 +
                    p.z * 5.0
                ),
                cos(
                    uTime * 0.11 +
                    p.x * 4.0
                ),
                sin(
                    uTime * 0.17 +
                    p.y * 6.0
                )
            ) *
            (
                0.010 +
                0.018 * aTemp
            );

            p +=
                normalize(
                    vec3(
                        p.xy,
                        0.25
                    )
                ) *
                n *
                0.010 *
                aEnergy;

            gl_Position =
                uMVP *
                vec4(p, 1.0);

            gl_PointSize =
                uPointSize *
                (
                    0.65 +
                    aEnergy * 1.4 +
                    aLum * 1.1
                );

            vEnergy = aEnergy;
            vTemp = aTemp;
            vLum = aLum;
        }
    `;

    const neuralFS = `
        precision mediump float;

        varying float vEnergy;
        varying float vTemp;
        varying float vLum;

        void main() {

            vec2 p =
                gl_PointCoord -
                0.5;

            float d =
                length(p) * 2.0;

            float soft =
                1.0 -
                smoothstep(
                    0.15,
                    1.0,
                    d
                );

            vec3 cold =
                vec3(
                    0.23,
                    0.72,
                    0.72
                );

            vec3 hot =
                vec3(
                    1.0,
                    0.54,
                    0.22
                );

            vec3 c =
                mix(
                    cold,
                    hot,
                    smoothstep(
                        0.45,
                        0.95,
                        vTemp
                    )
                );

            c +=
                vec3(
                    0.20,
                    0.34,
                    0.34
                ) *
                vEnergy;

            float alpha =
                soft *
                (
                    0.18 +
                    vLum * 0.72
                );

            gl_FragColor =
                vec4(
                    c,
                    alpha
                );
        }
    `;

    const lineVS = `
        precision mediump float;

        attribute vec3 aPosition;
        attribute float aEnergy;
        attribute float aTemp;

        uniform mat4 uMVP;

        varying float vEnergy;
        varying float vTemp;

        void main() {

            gl_Position =
                uMVP *
                vec4(
                    aPosition,
                    1.0
                );

            vEnergy = aEnergy;
            vTemp = aTemp;
        }
    `;

    const lineFS = `
        precision mediump float;

        varying float vEnergy;
        varying float vTemp;

        void main() {

            vec3 c0 =
                vec3(
                    0.07,
                    0.26,
                    0.29
                );

            vec3 c1 =
                vec3(
                    0.42,
                    0.90,
                    0.77
                );

            vec3 c2 =
                vec3(
                    1.0,
                    0.48,
                    0.18
                );

            vec3 c =
                mix(
                    c0,
                    c1,
                    clamp(
                        vEnergy * 1.25,
                        0.0,
                        1.0
                    )
                );

            c =
                mix(
                    c,
                    c2,
                    smoothstep(
                        0.68,
                        1.0,
                        vTemp
                    ) *
                    0.55
                );

            gl_FragColor =
                vec4(
                    c,
                    0.10 +
                    vEnergy * 0.32
                );
        }
    `;

    const pointVS = `
        precision mediump float;

        attribute vec3 aPosition;
        attribute float aIntensity;

        uniform mat4 uMVP;
        uniform float uSize;

        varying float vIntensity;

        void main() {

            gl_Position =
                uMVP *
                vec4(
                    aPosition,
                    1.0
                );

            gl_PointSize =
                uSize *
                (
                    0.5 +
                    aIntensity * 2.0
                );

            vIntensity =
                aIntensity;
        }
    `;

    const pointFS = `
        precision mediump float;

        varying float vIntensity;

        void main() {

            vec2 p =
                gl_PointCoord -
                0.5;

            float d =
                length(p) * 2.0;

            float a =
                (
                    1.0 -
                    smoothstep(
                        0.0,
                        1.0,
                        d
                    )
                ) *
                vIntensity;

            gl_FragColor =
                vec4(
                    0.60,
                    0.86,
                    0.72,
                    a * 0.26
                );
        }
    `;

    function compile(
        type,
        source
    ) {
        const s =
            gl.createShader(type);

        gl.shaderSource(
            s,
            source
        );

        gl.compileShader(s);

        if (
            !gl.getShaderParameter(
                s,
                gl.COMPILE_STATUS
            )
        ) {
            const log =
                gl.getShaderInfoLog(s);

            gl.deleteShader(s);

            throw new Error(log);
        }

        return s;
    }

    function program(
        vs,
        fs
    ) {
        const p =
            gl.createProgram();

        gl.attachShader(
            p,
            compile(
                gl.VERTEX_SHADER,
                vs
            )
        );

        gl.attachShader(
            p,
            compile(
                gl.FRAGMENT_SHADER,
                fs
            )
        );

        gl.linkProgram(p);

        if (
            !gl.getProgramParameter(
                p,
                gl.LINK_STATUS
            )
        ) {
            throw new Error(
                gl.getProgramInfoLog(p)
            );
        }

        return p;
    }

    const bodyProgram =
        program(
            bodyVS,
            bodyFS
        );

    const neuralProgram =
        program(
            neuralVS,
            neuralFS
        );

    const lineProgram =
        program(
            lineVS,
            lineFS
        );

    const pointProgram =
        program(
            pointVS,
            pointFS
        );

    function attrs(
        p,
        names
    ) {
        const o = {};

        names.forEach(
            n => {
                o[n] =
                    gl.getAttribLocation(
                        p,
                        n
                    );
            }
        );

        return o;
    }

    function uniforms(
        p,
        names
    ) {
        const o = {};

        names.forEach(
            n => {
                o[n] =
                    gl.getUniformLocation(
                        p,
                        n
                    );
            }
        );

        return o;
    }

    const bodyA =
        attrs(
            bodyProgram,
            [
                "aPosition",
                "aDepth"
            ]
        );

    const bodyU =
        uniforms(
            bodyProgram,
            [
                "uMVP",
                "uTime",
                "uBreath",
                "uEnergy",
                "uTemperature",
                "uVariation"
            ]
        );

    const neuralA =
        attrs(
            neuralProgram,
            [
                "aPosition",
                "aEnergy",
                "aTemp",
                "aLum"
            ]
        );

    const neuralU =
        uniforms(
            neuralProgram,
            [
                "uMVP",
                "uTime",
                "uPointSize"
            ]
        );

    const lineA =
        attrs(
            lineProgram,
            [
                "aPosition",
                "aEnergy",
                "aTemp"
            ]
        );

    const lineU =
        uniforms(
            lineProgram,
            [
                "uMVP"
            ]
        );

    const pointA =
        attrs(
            pointProgram,
            [
                "aPosition",
                "aIntensity"
            ]
        );

    const pointU =
        uniforms(
            pointProgram,
            [
                "uMVP",
                "uSize"
            ]
        );

    // ------------------------------------------------------------
    // COS HEXAGONAL
    // ------------------------------------------------------------

    const bodyPositions = [];
    const bodyDepths = [];
    const bodyIndices = [];

    for (
        let r = 0;
        r < P.bodyRings;
        r++
    ) {
        const z =
            lerp(
                -P.bodyDepth / 2,
                P.bodyDepth / 2,
                r /
                (P.bodyRings - 1)
            );

        const depthNorm =
            Math.abs(z) /
            (P.bodyDepth / 2);

        for (
            let s = 0;
            s < P.bodySides;
            s++
        ) {
            const a =
                (
                    s /
                    P.bodySides
                ) *
                TAU +
                Math.PI / 6;

            const ca =
                Math.cos(a);

            const sa =
                Math.sin(a);

            const radius =
                P.bodyRadius *
                (
                    1.0 -
                    depthNorm * 0.10
                );

            bodyPositions.push(
                ca * radius,
                sa * radius,
                z
            );

            bodyDepths.push(
                z /
                P.bodyDepth
            );
        }
    }

    for (
        let r = 0;
        r < P.bodyRings - 1;
        r++
    ) {
        for (
            let s = 0;
            s < P.bodySides;
            s++
        ) {
            const n =
                (s + 1) %
                P.bodySides;

            const a =
                r *
                P.bodySides +
                s;

            const b =
                r *
                P.bodySides +
                n;

            const c =
                (r + 1) *
                P.bodySides +
                n;

            const d =
                (r + 1) *
                P.bodySides +
                s;

            bodyIndices.push(
                a,
                b,
                c,
                a,
                c,
                d
            );
        }
    }

    const bodyPosBuffer =
        gl.createBuffer();

    const bodyDepthBuffer =
        gl.createBuffer();

    const bodyIndexBuffer =
        gl.createBuffer();

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        bodyPosBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(
            bodyPositions
        ),
        gl.STATIC_DRAW
    );

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        bodyDepthBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(
            bodyDepths
        ),
        gl.STATIC_DRAW
    );

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

    // ------------------------------------------------------------
    // TEIXIT NEURONAL
    // ------------------------------------------------------------

    const neural = [];

    for (
        let i = 0;
        i < P.neuralCount;
        i++
    ) {
        const a =
            rand(
                0,
                TAU
            );

        const r =
            Math.sqrt(
                Math.random()
            ) *
            P.neuralRadius;

        const hex =
            0.90 -
            0.10 *
            Math.abs(
                Math.cos(
                    3 * a
                )
            );

        neural.push({
            x:
                Math.cos(a) *
                r *
                hex,

            y:
                Math.sin(a) *
                r *
                hex,

            z:
                rand(
                    -P.neuralDepth,
                    P.neuralDepth
                ) *
                0.5,

            vx: 0,
            vy: 0,
            vz: 0,

            energy:
                rand(
                    0.045,
                    0.16
                ),

            temperature:
                rand(
                    0.20,
                    0.38
                ),

            memory:
                rand(
                    0.0,
                    0.08
                ),

            activity: 0,
            lum: 0,

            flowX:
                rand(
                    -0.1,
                    0.1
                ),

            flowY:
                rand(
                    -0.1,
                    0.1
                ),

            flowZ:
                rand(
                    -0.06,
                    0.06
                ),

            phase:
                rand(
                    0,
                    TAU
                )
        });
    }

    const links = [];

    for (
        let i = 0;
        i < neural.length;
        i++
    ) {
        const candidates = [];

        for (
            let j = 0;
            j < neural.length;
            j++
        ) {
            if (i === j) {
                continue;
            }

            const d =
                dist3(
                    neural[i],
                    neural[j]
                );

            candidates.push({
                j,
                d
            });
        }

        candidates.sort(
            (a, b) =>
                a.d - b.d
        );

        const count =
            2 +
            Math.floor(
                rand(
                    0,
                    3
                )
            );

        for (
            let k = 0;
            k < count;
            k++
        ) {
            const j =
                candidates[k].j;

            const exists =
                links.some(
                    l =>
                        (
                            l.a === i &&
                            l.b === j
                        ) ||
                        (
                            l.a === j &&
                            l.b === i
                        )
                );

            if (
                !exists &&
                links.length <
                    P.maxLinks
            ) {
                links.push({
                    a: i,
                    b: j
                });
            }
        }
    }

    const neuralPositionData =
        new Float32Array(
            P.neuralCount * 3
        );

    const neuralEnergyData =
        new Float32Array(
            P.neuralCount
        );

    const neuralTempData =
        new Float32Array(
            P.neuralCount
        );

    const neuralLumData =
        new Float32Array(
            P.neuralCount
        );

    const linePositionData =
        new Float32Array(
            links.length *
            2 *
            3
        );

    const lineEnergyData =
        new Float32Array(
            links.length *
            2
        );

    const lineTempData =
        new Float32Array(
            links.length *
            2
        );

    const neuralPosBuffer =
        gl.createBuffer();

    const neuralEnergyBuffer =
        gl.createBuffer();

    const neuralTempBuffer =
        gl.createBuffer();

    const neuralLumBuffer =
        gl.createBuffer();

    const linePosBuffer =
        gl.createBuffer();

    const lineEnergyBuffer =
        gl.createBuffer();

    const lineTempBuffer =
        gl.createBuffer();

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        neuralPosBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        neuralPositionData.byteLength,
        gl.DYNAMIC_DRAW
    );

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        neuralEnergyBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        neuralEnergyData.byteLength,
        gl.DYNAMIC_DRAW
    );

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        neuralTempBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        neuralTempData.byteLength,
        gl.DYNAMIC_DRAW
    );

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        neuralLumBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        neuralLumData.byteLength,
        gl.DYNAMIC_DRAW
    );

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        linePosBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        linePositionData.byteLength,
        gl.DYNAMIC_DRAW
    );

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        lineEnergyBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        lineEnergyData.byteLength,
        gl.DYNAMIC_DRAW
    );

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        lineTempBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        lineTempData.byteLength,
        gl.DYNAMIC_DRAW
    );

    // ------------------------------------------------------------
    // CAMPS INTERNS
    // ------------------------------------------------------------

    const organism = {
        energy: 0.18,
        temperature: 0.30,
        activity: 0.12,
        memory: 0.08,
        coherence: 0.68,
        variation: 0.12,
        flow: 0.12,
        luminescence: 0.08,
        organization: 0.68,
        permeability: 0.18,
        cameraDepth: 0,
        cameraTarget: 0,
        bassPressure: 0,
        eventPressure: 0
    };

    const pointer = {
        inside: false,

        x: 0.5,
        y: 0.5,

        prevX: 0.5,
        prevY: 0.5,

        vx: 0,
        vy: 0,

        speed: 0,
        distance: 1,
        proximity: 0,
        anticipation: 0,
        contact: 0,
        contactTime: 0,
        continuity: 0,

        lastMove: 0,
        down: false
    };

    function pointerWorld() {
        return {
            x:
                (
                    pointer.x -
                    0.5
                ) *
                3.0,

            y:
                (
                    0.5 -
                    pointer.y
                ) *
                2.2,

            z: 0
        };
    }

    function updatePointer(
        now,
        dt
    ) {
        const dx =
            pointer.x -
            pointer.prevX;

        const dy =
            pointer.y -
            pointer.prevY;

        pointer.vx =
            dx /
            Math.max(
                dt,
                0.001
            );

        pointer.vy =
            dy /
            Math.max(
                dt,
                0.001
            );

        pointer.speed =
            clamp(
                Math.hypot(
                    dx,
                    dy
                ) *
                34,
                0,
                1
            );

        pointer.prevX =
            pointer.x;

        pointer.prevY =
            pointer.y;

        const cx = 0.5;
        const cy = 0.5;

        pointer.distance =
            clamp(
                Math.hypot(
                    pointer.x - cx,
                    pointer.y - cy
                ) /
                0.55,
                0,
                1
            );

        pointer.proximity =
            pointer.inside
                ? 1 -
                  pointer.distance
                : 0;

        const approach =
            clamp(
                (
                    -pointer.vx *
                    (
                        pointer.x -
                        cx
                    ) -

                    pointer.vy *
                    (
                        pointer.y -
                        cy
                    )
                ) *
                3.0,
                0,
                1
            );

        pointer.anticipation =
            pointer.proximity *
            (
                0.30 +
                approach *
                0.70
            );

        if (pointer.down) {

            pointer.contact =
                lerp(
                    pointer.contact,
                    1,
                    1 -
                    Math.exp(
                        -dt * 11
                    )
                );

            pointer.contactTime +=
                dt;

        } else {

            pointer.contact =
                lerp(
                    pointer.contact,
                    0,
                    1 -
                    Math.exp(
                        -dt * 7
                    )
                );

            pointer.contactTime =
                0;
        }

        if (
            now -
            pointer.lastMove <
            0.20
        ) {
            pointer.continuity =
                lerp(
                    pointer.continuity,
                    1,
                    1 -
                    Math.exp(
                        -dt * 4
                    )
                );
        } else {
            pointer.continuity =
                lerp(
                    pointer.continuity,
                    0,
                    1 -
                    Math.exp(
                        -dt * 1.2
                    )
                );
        }
    }

    function injectStimulus(
        dt
    ) {
        const pw =
            pointerWorld();

        for (
            let i = 0;
            i < neural.length;
            i++
        ) {
            const n =
                neural[i];

            const d =
                Math.sqrt(
                    (
                        n.x -
                        pw.x
                    ) *
                    (
                        n.x -
                        pw.x
                    ) +

                    (
                        n.y -
                        pw.y
                    ) *
                    (
                        n.y -
                        pw.y
                    ) +

                    (
                        n.z -
                        pw.z
                    ) *
                    (
                        n.z -
                        pw.z
                    ) *
                    0.7
                );

            const influence =
                Math.exp(
                    -d * d * 2.8
                ) *
                pointer.proximity;

            const touch =
                influence *
                (
                    0.35 +
                    pointer.contact *
                    1.7 +
                    pointer.anticipation *
                    0.38
                );

            n.energy +=
                touch *
                P.pointerEnergy *
                dt;

            n.memory +=
                touch *
                0.09 *
                dt;
        }
    }

    // ------------------------------------------------------------
    // SIMULACIÓ
    // ------------------------------------------------------------

    function simulate(
        dt,
        time
    ) {
        injectStimulus(dt);

        /*
         * Activitat basal no periòdica.
         * La variació depèn de l'estat intern actual.
         */
        const globalVariation =
            Math.sin(
                time * 0.071 +
                organism.memory * 5.1
            ) *
            0.5 +

            Math.sin(
                time * 0.037 +
                organism.temperature * 7.3
            ) *
            0.5;

        const energyDelta =
            new Float32Array(
                neural.length
            );

        const tempDelta =
            new Float32Array(
                neural.length
            );

        /*
         * Energia basal + dissipació.
         */
        for (
            let i = 0;
            i < neural.length;
            i++
        ) {
            const n =
                neural[i];

            const basal =
                P.energyBase *
                (
                    0.55 +
                    0.45 *
                    (
                        0.5 +
                        globalVariation *
                        0.5
                    )
                );

            energyDelta[i] +=
                basal *
                dt;

            energyDelta[i] -=
                P.energyDissipation *
                n.energy *
                dt;

            /*
             * Una mica d'impuls quan
             * l'organització és alta.
             */
            energyDelta[i] +=
                (
                    organism.coherence -
                    0.5
                ) *
                0.018 *
                dt;
        }

        /*
         * Difusió d'energia i temperatura
         * pel graf neuronal.
         */
        for (
            let k = 0;
            k < links.length;
            k++
        ) {
            const a =
                neural[
                    links[k].a
                ];

            const b =
                neural[
                    links[k].b
                ];

            const e =
                (
                    b.energy -
                    a.energy
                ) *
                P.energyDiffusion *
                dt;

            energyDelta[
                links[k].a
            ] += e;

            energyDelta[
                links[k].b
            ] -= e;

            const t =
                (
                    b.temperature -
                    a.temperature
                ) *
                P.temperatureDiffusion *
                dt;

            tempDelta[
                links[k].a
            ] += t;

            tempDelta[
                links[k].b
            ] -= t;
        }

        let totalEnergy = 0;
        let totalActivity = 0;
        let totalTemp = 0;
        let totalMemory = 0;
        let totalLum = 0;

        let alignment = 0;

        /*
         * Evolució individual del teixit.
         */
        for (
            let i = 0;
            i < neural.length;
            i++
        ) {
            const n =
                neural[i];

            /*
             * Energia.
             */
            n.energy =
                clamp(
                    n.energy +
                    energyDelta[i],
                    0,
                    1.6
                );

            /*
             * Activitat derivada de l'energia
             * i de la temperatura.
             */
            const targetActivity =
                smooth(
                    0.10,
                    0.72,
                    n.energy
                ) *
                (
                    0.55 +
                    n.temperature *
                    0.65
                );

            n.activity =
                lerp(
                    n.activity,
                    targetActivity,
                    1 -
                    Math.exp(
                        -dt * 3.2
                    )
                );

            /*
             * Temperatura:
             *
             * activitat → escalfor
             * dissipació → refredament
             */
            const heating =
                P.heating *
                n.activity *
                dt;

            const cooling =
                P.cooling *
                (
                    n.temperature -
                    P.temperatureBase
                ) *
                dt;

            n.temperature =
                clamp(
                    n.temperature +
                    heating -
                    cooling +
                    tempDelta[i],
                    0.05,
                    1.0
                );

            /*
             * Memòria lenta.
             *
             * No és un historial.
             * És una alteració persistent
             * de la sensibilitat local.
             */
            n.memory =
                clamp(
                    n.memory +
                    (
                        P.memoryGain *
                        n.activity -

                        P.memoryDecay *
                        n.memory
                    ) *
                    dt,
                    0,
                    1
                );

            /*
             * Flux intern.
             *
             * No és una trajectòria fixa:
             * temperatura i estat alteren
             * la seva intensitat.
             */
            const fx =
                -n.y * 0.12 +
                Math.sin(
                    time * 0.047 +
                    n.z * 4.0 +
                    n.phase
                ) *
                0.08;

            const fy =
                n.x * 0.12 +
                Math.cos(
                    time * 0.053 +
                    n.x * 3.0
                ) *
                0.08;

            const fz =
                Math.sin(
                    time * 0.061 +
                    n.x * 2.0 -
                    n.y * 2.0
                ) *
                0.045;

            const tempSpeed =
                0.55 +
                n.temperature *
                P.flowTemperature;

            n.flowX =
                lerp(
                    n.flowX,
                    fx * tempSpeed,
                    1 -
                    Math.exp(
                        -dt * 1.6
                    )
                );

            n.flowY =
                lerp(
                    n.flowY,
                    fy * tempSpeed,
                    1 -
                    Math.exp(
                        -dt * 1.6
                    )
                );

            n.flowZ =
                lerp(
                    n.flowZ,
                    fz * tempSpeed,
                    1 -
                    Math.exp(
                        -dt * 1.6
                    )
                );

            /*
             * Lluminescència amb retard.
             *
             * Activitat no significa llum immediata.
             */
            const lumTarget =
                n.activity *
                (
                    0.35 +
                    n.memory * 0.65
                ) *
                P.luminescenceGain;

            n.lum =
                clamp(
                    n.lum +
                    (
                        lumTarget -
                        n.lum
                    ) *
                    (
                        1 -
                        Math.exp(
                            -dt *
                            P.luminescenceDecay
                        )
                    ),
                    0,
                    1
                );

            /*
             * Moviment físic mínim.
             *
             * La posició és conseqüència
             * del camp intern.
             */
            n.vx +=
                n.flowX *
                P.flowStrength *
                dt;

            n.vy +=
                n.flowY *
                P.flowStrength *
                dt;

            n.vz +=
                n.flowZ *
                P.flowStrength *
                dt;

            n.vx *=
                Math.pow(
                    P.flowDamping,
                    dt
                );

            n.vy *=
                Math.pow(
                    P.flowDamping,
                    dt
                );

            n.vz *=
                Math.pow(
                    P.flowDamping,
                    dt
                );

            n.x +=
                n.vx *
                dt *
                0.20;

            n.y +=
                n.vy *
                dt *
                0.20;

            n.z +=
                n.vz *
                dt *
                0.16;

            /*
             * Restauració cap a l'estructura hexagonal.
             *
             * Conserva organització sense fer reset.
             */
            const rr =
                Math.hypot(
                    n.x,
                    n.y
                );

            const maxR =
                P.neuralRadius *
                (
                    0.84 -
                    Math.abs(n.z) *
                    0.12
                );

            if (
                rr >
                maxR
            ) {
                const q =
                    (
                        rr -
                        maxR
                    ) /
                    Math.max(
                        rr,
                        0.001
                    );

                n.vx -=
                    n.x *
                    q *
                    0.8 *
                    dt;

                n.vy -=
                    n.y *
                    q *
                    0.8 *
                    dt;
            }

            n.z =
                clamp(
                    n.z,
                    -P.neuralDepth *
                        0.52,
                    P.neuralDepth *
                        0.52
                );

            totalEnergy +=
                n.energy;

            totalActivity +=
                n.activity;

            totalTemp +=
                n.temperature;

            totalMemory +=
                n.memory;

            totalLum +=
                n.lum;
        }

        /*
         * Coherència:
         *
         * mesura la similitud local
         * d'energia entre connexions.
         */
        let localVariance = 0;

        for (
            let k = 0;
            k < links.length;
            k++
        ) {
            const a =
                neural[
                    links[k].a
                ];

            const b =
                neural[
                    links[k].b
                ];

            localVariance +=
                Math.abs(
                    a.energy -
                    b.energy
                );
        }

        localVariance /=
            Math.max(
                links.length,
                1
            );

        alignment =
            clamp(
                1 -
                localVariance *
                2.3,
                0,
                1
            );

        /*
         * Estat global de l'organisme.
         */
        organism.energy =
            lerp(
                organism.energy,
                clamp(
                    totalEnergy /
                    neural.length *
                    0.95,
                    0,
                    1
                ),
                1 -
                Math.exp(
                    -dt * 2
                )
            );

        organism.activity =
            lerp(
                organism.activity,
                clamp(
                    totalActivity /
                    neural.length,
                    0,
                    1
                ),
                1 -
                Math.exp(
                    -dt * 2.5
                )
            );

        organism.temperature =
            lerp(
                organism.temperature,
                totalTemp /
                neural.length,
                1 -
                Math.exp(
                    -dt * 1.2
                )
            );

        organism.memory =
            lerp(
                organism.memory,
                totalMemory /
                neural.length,
                1 -
                Math.exp(
                    -dt * 0.75
                )
            );

        organism.luminescence =
            lerp(
                organism.luminescence,
                totalLum /
                neural.length,
                1 -
                Math.exp(
                    -dt * 3
                )
            );

        organism.coherence =
            lerp(
                organism.coherence,
                alignment,
                1 -
                Math.exp(
                    -dt * 1.5
                )
            );

        /*
         * Organització:
         *
         * coherència +
         * temperatura +
         * memòria
         */
        organism.organization =
            clamp(
                organism.coherence *
                    0.62 +

                (
                    1 -
                    organism.temperature
                ) *
                    0.18 +

                organism.memory *
                    0.20,

                0,
                1
            );

        /*
         * Variació:
         *
         * activitat +
         * pèrdua de coherència +
         * fluctuació.
         */
        organism.variation =
            clamp(
                0.08 +
                organism.activity *
                    0.30 +

                (
                    1 -
                    organism.coherence
                ) *
                    0.42 +

                Math.abs(
                    globalVariation
                ) *
                    0.12,

                0,
                1
            );

        /*
         * Flux global.
         */
        organism.flow =
            clamp(
                organism.activity *
                    0.52 +

                organism.temperature *
                    0.30 +

                (
                    1 -
                    organism.coherence
                ) *
                    0.18,

                0,
                1
            );

        /*
         * Permeabilitat.
         *
         * No és "confiança".
         * És una propietat física computacional
         * derivada de l'estat del sistema.
         */
        organism.permeability =
            clamp(
                0.08 +
                organism.organization *
                    0.36 +

                organism.memory *
                    0.18 +

                pointer.anticipation *
                    0.22,

                0,
                1
            );

        /*
         * La càmera és una sortida del sistema.
         */
        organism.cameraTarget =
            clamp(
                organism.permeability *
                    0.72 +

                pointer.anticipation *
                    0.16 +

                organism.activity *
                    0.12,

                0,
                1
            );

        organism.cameraDepth =
            lerp(
                organism.cameraDepth,
                organism.cameraTarget,
                1 -
                Math.exp(
                    -dt *
                    P.cameraResponse
                )
            );

        /*
         * Pressió del baix.
         */
        organism.bassPressure =
            lerp(
                organism.bassPressure,
                clamp(
                    0.28 +
                    organism.energy *
                        0.65 +
                    organism.memory *
                        0.22,
                    0,
                    1
                ),
                1 -
                Math.exp(
                    -dt * 1.8
                )
            );

        /*
         * Pressió d'esdeveniments sonors.
         */
        organism.eventPressure =
            clamp(
                organism.activity *
                    0.58 +

                organism.luminescence *
                    0.25 +

                pointer.contact *
                    0.38,

                0,
                1
            );
    }

    // ------------------------------------------------------------
    // BUFFERS DE DADES
    // ------------------------------------------------------------

    function updateBuffers() {

        for (
            let i = 0;
            i < neural.length;
            i++
        ) {
            const n =
                neural[i];

            const o =
                i * 3;

            neuralPositionData[o] =
                n.x;

            neuralPositionData[o + 1] =
                n.y;

            neuralPositionData[o + 2] =
                n.z;

            neuralEnergyData[i] =
                clamp(
                    n.energy *
                        0.82,
                    0,
                    1
                );

            neuralTempData[i] =
                n.temperature;

            neuralLumData[i] =
                n.lum;
        }

        for (
            let k = 0;
            k < links.length;
            k++
        ) {
            const a =
                neural[
                    links[k].a
                ];

            const b =
                neural[
                    links[k].b
                ];

            const o =
                k * 6;

            linePositionData[o] =
                a.x;

            linePositionData[o + 1] =
                a.y;

            linePositionData[o + 2] =
                a.z;

            linePositionData[o + 3] =
                b.x;

            linePositionData[o + 4] =
                b.y;

            linePositionData[o + 5] =
                b.z;

            lineEnergyData[k * 2] =
                clamp(
                    a.energy * 0.72 +
                    a.lum * 0.28,
                    0,
                    1
                );

            lineEnergyData[
                k * 2 + 1
            ] =
                clamp(
                    b.energy * 0.72 +
                    b.lum * 0.28,
                    0,
                    1
                );

            lineTempData[k * 2] =
                a.temperature;

            lineTempData[
                k * 2 + 1
            ] =
                b.temperature;
        }

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            neuralPosBuffer
        );

        gl.bufferSubData(
            gl.ARRAY_BUFFER,
            0,
            neuralPositionData
        );

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            neuralEnergyBuffer
        );

        gl.bufferSubData(
            gl.ARRAY_BUFFER,
            0,
            neuralEnergyData
        );

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            neuralTempBuffer
        );

        gl.bufferSubData(
            gl.ARRAY_BUFFER,
            0,
            neuralTempData
        );

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            neuralLumBuffer
        );

        gl.bufferSubData(
            gl.ARRAY_BUFFER,
            0,
            neuralLumData
        );

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            linePosBuffer
        );

        gl.bufferSubData(
            gl.ARRAY_BUFFER,
            0,
            linePositionData
        );

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            lineEnergyBuffer
        );

        gl.bufferSubData(
            gl.ARRAY_BUFFER,
            0,
            lineEnergyData
        );

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            lineTempBuffer
        );

        gl.bufferSubData(
            gl.ARRAY_BUFFER,
            0,
            lineTempData
        );
    }

    // ------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------

    let projection =
        mat4Identity();

    function resize() {

        const dpr =
            Math.min(
                window.devicePixelRatio || 1,
                P.maxDpr
            );

        const w =
            Math.max(
                1,
                Math.floor(
                    innerWidth *
                    dpr
                )
            );

        const h =
            Math.max(
                1,
                Math.floor(
                    innerHeight *
                    dpr
                )
            );

        if (
            canvas.width !== w ||
            canvas.height !== h
        ) {
            canvas.width = w;
            canvas.height = h;
        }

        gl.viewport(
            0,
            0,
            canvas.width,
            canvas.height
        );

        projection =
            perspective(
                Math.PI / 3.1,
                canvas.width /
                    canvas.height,
                0.05,
                30
            );
    }

    window.addEventListener(
        "resize",
        resize,
        {
            passive: true
        }
    );

    resize();

    function modelView(
        time
    ) {
        /*
         * Exterior ↔ interior.
         */
        const d =
            lerp(
                P.cameraOutside,
                P.cameraInside,
                organism.cameraDepth
            );

        /*
         * Petita deriva perceptiva.
         */
        const yaw =
            Math.sin(
                time * 0.071
            ) *
            0.17 +

            (
                pointer.x -
                0.5
            ) *
            0.10;

        const pitch =
            Math.cos(
                time * 0.053
            ) *
            0.09 +

            (
                0.5 -
                pointer.y
            ) *
            0.06;

        const roll =
            Math.sin(
                time * 0.031
            ) *
            0.035;

        const objectRotation =
            mat4Multiply(
                rotateZ(roll),
                mat4Multiply(
                    rotateY(yaw),
                    rotateX(pitch)
                )
            );

        const camera =
            translate(
                0,
                0,
                -d
            );

        return mat4Multiply(
            camera,
            objectRotation
        );
    }

    function drawBody(
        mvp,
        time
    ) {
        gl.useProgram(
            bodyProgram
        );

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            bodyPosBuffer
        );

        gl.enableVertexAttribArray(
            bodyA.aPosition
        );

        gl.vertexAttribPointer(
            bodyA.aPosition,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            bodyDepthBuffer
        );

        gl.enableVertexAttribArray(
            bodyA.aDepth
        );

        gl.vertexAttribPointer(
            bodyA.aDepth,
            1,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            bodyIndexBuffer
        );

        gl.uniformMatrix4fv(
            bodyU.uMVP,
            false,
            mvp
        );

        gl.uniform1f(
            bodyU.uTime,
            time
        );

        gl.uniform1f(
            bodyU.uBreath,
            P.bodyBreath *
            (
                0.65 +
                organism.energy *
                    0.8
            )
        );

        gl.uniform1f(
            bodyU.uEnergy,
            organism.energy
        );

        gl.uniform1f(
            bodyU.uTemperature,
            organism.temperature
        );

        gl.uniform1f(
            bodyU.uVariation,
            organism.variation
        );

        gl.enable(
            gl.BLEND
        );

        gl.blendFunc(
            gl.SRC_ALPHA,
            gl.ONE_MINUS_SRC_ALPHA
        );

        /*
         * La carcassa no escriu profunditat,
         * perquè volem poder veure el teixit intern.
         */
        gl.depthMask(false);

        gl.drawElements(
            gl.TRIANGLES,
            bodyIndices.length,
            gl.UNSIGNED_SHORT,
            0
        );

        gl.depthMask(true);
    }

    function bindAttrib(
        buffer,
        location,
        size
    ) {
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            buffer
        );

        gl.enableVertexAttribArray(
            location
        );

        gl.vertexAttribPointer(
            location,
            size,
            gl.FLOAT,
            false,
            0,
            0
        );
    }

    function drawNeural(
        mvp,
        time
    ) {
        gl.useProgram(
            neuralProgram
        );

        bindAttrib(
            neuralPosBuffer,
            neuralA.aPosition,
            3
        );

        bindAttrib(
            neuralEnergyBuffer,
            neuralA.aEnergy,
            1
        );

        bindAttrib(
            neuralTempBuffer,
            neuralA.aTemp,
            1
        );

        bindAttrib(
            neuralLumBuffer,
            neuralA.aLum,
            1
        );

        gl.uniformMatrix4fv(
            neuralU.uMVP,
            false,
            mvp
        );

        gl.uniform1f(
            neuralU.uTime,
            time
        );

        gl.uniform1f(
            neuralU.uPointSize,
            Math.min(
                canvas.width,
                canvas.height
            ) *
            0.0072
        );

        gl.enable(
            gl.BLEND
        );

        gl.blendFunc(
            gl.SRC_ALPHA,
            gl.ONE
        );

        gl.drawArrays(
            gl.POINTS,
            0,
            neural.length
        );
    }

    function drawLines(
        mvp
    ) {
        gl.useProgram(
            lineProgram
        );

        bindAttrib(
            linePosBuffer,
            lineA.aPosition,
            3
        );

        bindAttrib(
            lineEnergyBuffer,
            lineA.aEnergy,
            1
        );

        bindAttrib(
            lineTempBuffer,
            lineA.aTemp,
            1
        );

        gl.uniformMatrix4fv(
            lineU.uMVP,
            false,
            mvp
        );

        gl.lineWidth(1);

        gl.enable(
            gl.BLEND
        );

        gl.blendFunc(
            gl.SRC_ALPHA,
            gl.ONE
        );

        gl.drawArrays(
            gl.LINES,
            0,
            links.length * 2
        );
    }

    function drawAmbientParticles(
        mvp,
        time
    ) {
        const count = 34;

        const data =
            new Float32Array(
                count * 4
            );

        for (
            let i = 0;
            i < count;
            i++
        ) {
            const a =
                i * 1.73;

            const r =
                1.35 +
                Math.sin(
                    a * 2.1
                ) *
                0.32;

            data[i * 4] =
                Math.cos(
                    a +
                    time * 0.018
                ) *
                r;

            data[i * 4 + 1] =
                Math.sin(
                    a * 0.91 +
                    time * 0.014
                ) *
                r *
                0.72;

            data[i * 4 + 2] =
                Math.sin(
                    a * 1.31 +
                    time * 0.011
                );

            data[i * 4 + 3] =
                0.15 +
                0.25 *
                (
                    0.5 +
                    0.5 *
                    Math.sin(
                        a +
                        time * 0.08
                    )
                );
        }

        const buf =
            drawAmbientParticles.buffer ||
            (
                drawAmbientParticles.buffer =
                    gl.createBuffer()
            );

        gl.useProgram(
            pointProgram
        );

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            buf
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            data,
            gl.DYNAMIC_DRAW
        );

        gl.enableVertexAttribArray(
            pointA.aPosition
        );

        gl.vertexAttribPointer(
            pointA.aPosition,
            3,
            gl.FLOAT,
            false,
            16,
            0
        );

        gl.enableVertexAttribArray(
            pointA.aIntensity
        );

        gl.vertexAttribPointer(
            pointA.aIntensity,
            1,
            gl.FLOAT,
            false,
            16,
            12
        );

        gl.uniformMatrix4fv(
            pointU.uMVP,
            false,
            mvp
        );

        gl.uniform1f(
            pointU.uSize,
            Math.min(
                canvas.width,
                canvas.height
            ) *
            0.0045
        );

        gl.enable(
            gl.BLEND
        );

        gl.blendFunc(
            gl.SRC_ALPHA,
            gl.ONE
        );

        gl.drawArrays(
            gl.POINTS,
            0,
            count
        );
    }

    function render(
        time
    ) {
        const mvp =
            mat4Multiply(
                projection,
                modelView(time)
            );

        gl.clearColor(
            0.008,
            0.011,
            0.014,
            1
        );

        gl.clear(
            gl.COLOR_BUFFER_BIT |
            gl.DEPTH_BUFFER_BIT
        );

        gl.enable(
            gl.DEPTH_TEST
        );

        gl.depthFunc(
            gl.LEQUAL
        );

        /*
         * Teixit primer:
         * volem que sigui perceptible
         * a través del cos translúcid.
         */
        drawNeural(
            mvp,
            time
        );

        drawLines(
            mvp
        );

        /*
         * Carcassa translúcida.
         */
        drawBody(
            mvp,
            time
        );

        /*
         * Atmosfera microscòpica.
         */
        drawAmbientParticles(
            mvp,
            time
        );

        /*
         * Segona passada molt fina
         * per recuperar la silueta.
         */
        gl.depthMask(false);

        drawBody(
            mvp,
            time
        );

        gl.depthMask(true);
    }

    // ------------------------------------------------------------
    // AUDIO · Bb JAZZ ORGÀNIC
    // ------------------------------------------------------------

    let audio = null;

    function midiToHz(m) {
        return 440 *
            Math.pow(
                2,
                (m - 69) / 12
            );
    }

    function createAudio() {

        if (audio) {
            return audio;
        }

        const AC =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AC) {
            return null;
        }

        const ctx =
            new AC();

        const master =
            ctx.createGain();

        const compressor =
            ctx.createDynamicsCompressor();

        compressor.threshold.value =
            -22;

        compressor.knee.value =
            18;

        compressor.ratio.value =
            3.5;

        compressor.attack.value =
            0.012;

        compressor.release.value =
            0.22;

        master.gain.value =
            P.audioMaster;

        compressor
            .connect(master)
            .connect(ctx.destination);

        /*
         * BAIX
         *
         * Bb1 ≈ 58.27 Hz.
         *
         * És el cos de la criatura.
         */
        const bass =
            ctx.createOscillator();

        const bassFilter =
            ctx.createBiquadFilter();

        const bassGain =
            ctx.createGain();

        bass.type =
            "sine";

        bass.frequency.value =
            P.bassHz;

        bassFilter.type =
            "lowpass";

        bassFilter.frequency.value =
            240;

        bassFilter.Q.value =
            0.55;

        bassGain.gain.value =
            0.0001;

        bass
            .connect(bassFilter)
            .connect(bassGain)
            .connect(compressor);

        bass.start();

        /*
         * SUBHARMÒNIC
         */
        const sub =
            ctx.createOscillator();

        const subGain =
            ctx.createGain();

        sub.type =
            "triangle";

        sub.frequency.value =
            P.bassHz / 2;

        subGain.gain.value =
            0.0001;

        sub
            .connect(subGain)
            .connect(compressor);

        sub.start();

        /*
         * PAD FM
         *
         * Bb4 com a centre harmònic.
         */
        const padCarrier =
            ctx.createOscillator();

        const padMod =
            ctx.createOscillator();

        const padModGain =
            ctx.createGain();

        const padFilter =
            ctx.createBiquadFilter();

        const padGain =
            ctx.createGain();

        padCarrier.type =
            "sine";

        padMod.type =
            "sine";

        padCarrier.frequency.value =
            midiToHz(70);

        padMod.frequency.value =
            0.21;

        padModGain.gain.value =
            4.5;

        padFilter.type =
            "lowpass";

        padFilter.frequency.value =
            900;

        padFilter.Q.value =
            0.5;

        padGain.gain.value =
            0.0001;

        padMod
            .connect(padModGain)
            .connect(padCarrier.frequency);

        padCarrier
            .connect(padFilter)
            .connect(padGain)
            .connect(compressor);

        padCarrier.start();
        padMod.start();

        /*
         * AIRE / TEXTURA
         */
        const noiseBuffer =
            ctx.createBuffer(
                1,
                ctx.sampleRate * 2,
                ctx.sampleRate
            );

        const noise =
            noiseBuffer.getChannelData(0);

        for (
            let i = 0;
            i < noise.length;
            i++
        ) {
            const fade =
                1 -
                i /
                noise.length;

            noise[i] =
                (
                    Math.random() *
                    2 -
                    1
                ) *
                fade;
        }

        const noiseSource =
            ctx.createBufferSource();

        const noiseFilter =
            ctx.createBiquadFilter();

        const noiseGain =
            ctx.createGain();

        noiseSource.buffer =
            noiseBuffer;

        noiseSource.loop =
            true;

        noiseFilter.type =
            "bandpass";

        noiseFilter.frequency.value =
            850;

        noiseFilter.Q.value =
            0.45;

        noiseGain.gain.value =
            P.audioTexture *
            0.15;

        noiseSource
            .connect(noiseFilter)
            .connect(noiseGain)
            .connect(compressor);

        noiseSource.start();

        audio = {
            ctx,

            master,
            compressor,

            bass,
            bassGain,
            bassFilter,

            sub,
            subGain,

            padCarrier,
            padMod,
            padGain,
            padFilter,

            noiseGain,

            lastEvent: 0,
            nextEvent: 0.8
        };

        return audio;
    }

    async function startAudio() {

        const a =
            createAudio();

        if (!a) {
            return;
        }

        if (
            a.ctx.state ===
            "suspended"
        ) {
            try {
                await a.ctx.resume();
            }
            catch (_) {}
        }
    }

    function audioEvent(
        now
    ) {
        if (
            !audio ||
            audio.ctx.state !==
                "running"
        ) {
            return;
        }

        const t =
            audio.ctx.currentTime;

        const energy =
            organism.energy;

        const temp =
            organism.temperature;

        const memory =
            organism.memory;

        const coherence =
            organism.coherence;

        /*
         * Material harmònic al voltant
         * de Bb:
         *
         * 1
         * 3
         * 5
         * b7
         * 9
         * 11
         * 13
         */
        const scale = [
            58,
            62,
            65,
            68,
            72,
            75,
            79,
            82
        ];

        const base =
            scale[
                Math.floor(
                    rand(
                        0,
                        scale.length
                    )
                )
            ];

        const octave =
            energy > 0.62
                ? 12
                : (
                    energy < 0.28
                        ? -12
                        : 0
                );

        const midi =
            base +
            octave;

        const hz =
            midiToHz(
                midi
            );

        const osc =
            audio.ctx.createOscillator();

        const g =
            audio.ctx.createGain();

        const f =
            audio.ctx.createBiquadFilter();

        const pan =
            audio.ctx.createStereoPanner
                ? audio.ctx.createStereoPanner()
                : null;

        /*
         * Quan la coherència és alta,
         * el so és més pur.
         */
        osc.type =
            coherence > 0.66
                ? "sine"
                : "triangle";

        osc.frequency.setValueAtTime(
            hz,
            t
        );

        osc.detune.setValueAtTime(
            (
                temp -
                0.45
            ) *
            32,
            t
        );

        f.type =
            "lowpass";

        f.frequency.setValueAtTime(
            420 +
            temp *
            1500,
            t
        );

        f.Q.value =
            0.45 +
            memory *
            1.2;

        const velocity =
            P.audioEvent *
            (
                0.35 +
                energy *
                0.8
            ) *
            (
                0.55 +
                organism.luminescence *
                0.65
            );

        const attack =
            0.025 +
            (
                1 -
                coherence
            ) *
            0.045;

        const release =
            0.42 +
            memory *
            0.9;

        g.gain.setValueAtTime(
            0.0001,
            t
        );

        g.gain.exponentialRampToValueAtTime(
            Math.max(
                0.001,
                velocity
            ),
            t +
            attack
        );

        g.gain.exponentialRampToValueAtTime(
            0.0001,
            t +
            attack +
            release
        );

        osc
            .connect(f)
            .connect(g);

        if (pan) {

            pan.pan.value =
                clamp(
                    Math.sin(
                        now * 0.37 +
                        midi
                    ) *
                    0.34,
                    -0.6,
                    0.6
                );

            g
                .connect(pan)
                .connect(
                    audio.compressor
                );

        } else {

            g.connect(
                audio.compressor
            );
        }

        osc.start(t);

        osc.stop(
            t +
            attack +
            release +
            0.05
        );

        audio.lastEvent =
            now;
    }

    function updateAudio(
        time,
        dt
    ) {
        if (
            !audio ||
            audio.ctx.state !==
                "running"
        ) {
            return;
        }

        const t =
            audio.ctx.currentTime;

        const energy =
            organism.energy;

        const temp =
            organism.temperature;

        const memory =
            organism.memory;

        const activity =
            organism.activity;

        const coherence =
            organism.coherence;

        /*
         * BAIX:
         * l'energia i la memòria
         * en modifiquen la presència.
         */
        const bassTarget =
            P.audioBass *
            (
                0.35 +
                organism.bassPressure *
                0.85
            );

        audio.bassGain.gain.setTargetAtTime(
            bassTarget,
            t,
            0.14
        );

        audio.subGain.gain.setTargetAtTime(
            P.audioBass *
            0.12 *
            (
                0.4 +
                energy
            ),
            t,
            0.22
        );

        /*
         * Temperatura → microdesafinació.
         */
        audio.bass.frequency.setTargetAtTime(
            P.bassHz *
            (
                1 +
                (
                    temp -
                    0.32
                ) *
                0.035 +

                (
                    coherence -
                    0.6
                ) *
                0.012
            ),
            t,
            0.18
        );

        audio.sub.frequency.setTargetAtTime(
            P.bassHz /
            2 *
            (
                1 +
                (
                    temp -
                    0.32
                ) *
                0.018
            ),
            t,
            0.22
        );

        audio.bassFilter.frequency.setTargetAtTime(
            170 +
            energy * 260 +
            activity * 180,
            t,
            0.25
        );

        /*
         * PAD:
         *
         * la memòria pot desplaçar
         * el centre cap a una octava superior.
         */
        const padRoot =
            midiToHz(
                70 +
                (
                    memory >
                    0.42
                        ? 12
                        : 0
                )
            );

        audio.padCarrier.frequency.setTargetAtTime(
            padRoot,
            t,
            0.45
        );

        audio.padMod.frequency.setTargetAtTime(
            0.13 +
            activity * 0.24 +
            temp * 0.10,
            t,
            0.4
        );

        audio.padGain.gain.setTargetAtTime(
            P.audioPad *
            (
                0.25 +
                coherence * 0.7
            ),
            t,
            0.55
        );

        audio.padFilter.frequency.setTargetAtTime(
            650 +
            temp * 1500 +
            activity * 700,
            t,
            0.4
        );

        /*
         * Textura.
         */
        audio.noiseGain.gain.setTargetAtTime(
            P.audioTexture *
            (
                0.15 +
                temp * 0.6 +
                activity * 0.55
            ),
            t,
            0.28
        );

        /*
         * Esdeveniments harmònics.
         *
         * No hi ha un loop musical tancat.
         * Els esdeveniments apareixen segons
         * l'estat intern.
         */
        const eventProbability =
            0.13 +
            activity * 0.24 +
            organism.luminescence *
            0.16;

        if (
            time >
                audio.nextEvent &&
            Math.random() <
                eventProbability *
                dt *
                4.0
        ) {
            audioEvent(time);

            audio.nextEvent =
                time +
                0.38 +
                Math.random() *
                1.5 +
                (
                    1 -
                    coherence
                ) *
                0.7;
        }
    }

    // ------------------------------------------------------------
    // INPUT
    // ------------------------------------------------------------

    function setPointer(
        clientX,
        clientY
    ) {
        pointer.x =
            clamp(
                clientX /
                Math.max(
                    innerWidth,
                    1
                ),
                0,
                1
            );

        pointer.y =
            clamp(
                clientY /
                Math.max(
                    innerHeight,
                    1
                ),
                0,
                1
            );

        pointer.lastMove =
            performance.now() /
            1000;
    }

    canvas.addEventListener(
        "pointerenter",
        e => {
            pointer.inside =
                true;

            setPointer(
                e.clientX,
                e.clientY
            );
        },
        {
            passive: true
        }
    );

    canvas.addEventListener(
        "pointermove",
        e => {
            pointer.inside =
                true;

            setPointer(
                e.clientX,
                e.clientY
            );
        },
        {
            passive: true
        }
    );

    canvas.addEventListener(
        "pointerleave",
        () => {
            pointer.inside =
                false;
        },
        {
            passive: true
        }
    );

    /*
     * El primer contacte també
     * desperta el graph d'àudio.
     */
    canvas.addEventListener(
        "pointerdown",
        async e => {

            pointer.down =
                true;

            pointer.inside =
                true;

            setPointer(
                e.clientX,
                e.clientY
            );

            await startAudio();

            if (audio) {
                audioEvent(
                    performance.now() /
                    1000
                );
            }
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
        },
        {
            passive: true
        }
    );

    /*
     * Un doble toc no ordena una acció
     * visual directa: només augmenta
     * lleugerament la permeabilitat.
     *
     * La resposta posterior continua
     * sent calculada per l'organisme.
     */
    let lastTap = 0;

    canvas.addEventListener(
        "pointerup",
        () => {

            const now =
                performance.now() /
                1000;

            if (
                now -
                lastTap <
                0.34
            ) {
                organism.permeability =
                    clamp(
                        organism.permeability +
                        0.18,
                        0,
                        1
                    );
            }

            lastTap =
                now;
        },
        {
            passive: true
        }
    );

    // ------------------------------------------------------------
    // BUCLE
    // ------------------------------------------------------------

    let last =
        performance.now();

    let accumulator = 0;

    const fixed =
        1 / 60;

    function frame(
        nowMs
    ) {
        const now =
            nowMs / 1000;

        let dt =
            Math.min(
                (
                    nowMs -
                    last
                ) /
                1000,
                0.05
            );

        last =
            nowMs;

        accumulator +=
            dt;

        /*
         * Simulació fixa:
         * evita que la dinàmica canviï
         * massa segons la velocitat
         * de renderització.
         */
        while (
            accumulator >=
            fixed
        ) {
            updatePointer(
                now,
                fixed
            );

            simulate(
                fixed,
                now
            );

            accumulator -=
                fixed;
        }

        updateBuffers();

        updateAudio(
            now,
            dt
        );

        render(
            now
        );

        requestAnimationFrame(
            frame
        );
    }

    /*
     * Estat inicial:
     * la medusa existeix abans
     * que aparegui l'observador.
     */
    for (
        let i = 0;
        i < neural.length;
        i++
    ) {
        neural[i].energy +=
            Math.sin(
                i * 2.17
            ) *
            0.012 +
            0.018;
    }

    requestAnimationFrame(
        frame
    );

})();