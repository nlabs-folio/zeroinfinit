// ============================================================
// ZERO INFINIT
// NODES / CONSTELLATION
//
// Entrada audiovisual a l'univers Zero Infinit.
//
// PRINCIPI:
//
//              CONSTEL·LACIÓ
//                    │
//          ┌─────────┴─────────┐
//          │                   │
//       MATÈRIA             NODES
//          │                   │
//   partícules / gasos    experiències
//   fórmules / energia          │
//          │                   │
//          └──── composició ────┘
//
// Els nodes no són una llista.
// Són cossos dins d'un espai exploratori.
//
// El cursor excita el camp.
// Els nodes responen.
// L'espai genera comportament.
// El clic obre el node.
//
// Aquest fitxer NO modifica index.json.
// ============================================================


// ============================================================
// CONFIGURACIÓ
// ============================================================

const CONFIG = {

    registry: "./index.json",

    nodeBase: "./",

    minNodes: 1,

    orbitScale: 0.34,

    interactionRadius: 280,

    attraction: 0.0007,

    damping: 0.985,

    ambientSpeed: 0.00035,

    particleCount: 900,

    formulaProbability: 0.003,

    audioEnabled: true

};


// ============================================================
// DOM
// ============================================================

const canvas =
    document.querySelector("#canvas") ||
    createCanvas();

const ctx =
    canvas.getContext("2d", {
        alpha: false
    });


function createCanvas() {

    const element =
        document.createElement("canvas");

    element.id = "canvas";

    document.body.appendChild(element);

    return element;

}


// ============================================================
// VIEWPORT
// ============================================================

let width = 0;
let height = 0;
let dpr = 1;

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
        `${width}px`;

    canvas.style.height =
        `${height}px`;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    buildParticles();

    if (nodes.length) {

        arrangeNodes();

    }

}


window.addEventListener(
    "resize",
    resize
);


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

    down: false

};


window.addEventListener(
    "pointermove",
    event => {

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
            Math.hypot(
                pointer.vx,
                pointer.vy
            );

        pointer.active =
            true;

    }
);


window.addEventListener(
    "pointerleave",
    () => {

        pointer.active =
            false;

    }
);


window.addEventListener(
    "pointerdown",
    () => {

        pointer.down =
            true;

        startAudio();

        field.pulse =
            1;

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
// FIELD
// ============================================================

const field = {

    energy: 0,

    targetEnergy: 0,

    rotation: 0,

    turbulence: 0,

    density: 0.35,

    pulse: 0,

    sonic: 0,

    attraction: 0,

    distortion: 0

};


// ============================================================
// TIME
// ============================================================

let time = 0;


// ============================================================
// NODES
// ============================================================

const nodes = [];


// ============================================================
// PARTICLES
// ============================================================

const particles = [];

function buildParticles() {

    particles.length = 0;

    const scale =
        Math.max(
            width,
            height
        );

    for (
        let i = 0;
        i < CONFIG.particleCount;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI *
            2;

        const radius =
            Math.pow(
                Math.random(),
                0.65
            ) *
            scale *
            0.85;

        particles.push({

            x:
                width * 0.5 +
                Math.cos(angle) *
                radius,

            y:
                height * 0.5 +
                Math.sin(angle) *
                radius *
                0.62,

            vx: 0,
            vy: 0,

            size:
                0.3 +
                Math.random() * 1.8,

            alpha:
                0.025 +
                Math.random() * 0.11,

            phase:
                Math.random() *
                Math.PI *
                2,

            seed:
                Math.random()

        });

    }

}


// ============================================================
// FORMULAE
// ============================================================

const formulae = [

    "E = mc²",

    "A = 440 Hz",

    "Δt → ∞",

    "d = vt",

    "f = 1 / T",

    "∂E / ∂t",

    "∇ · F",

    "A + A → ∞",

    "x(t) = sin(t)",

    "φ = 1.618…",

    "lim t→∞",

    "R = Δx / Δt",

    "A₀ → A₁",

    "Σ n → ∞",

    "space / time",

    "matter / motion"

];


const activeFormulae = [];


// ============================================================
// SPAWN FORMULA
// ============================================================

function spawnFormula() {

    if (
        Math.random() >
        CONFIG.formulaProbability
    ) {

        return;

    }

    activeFormulae.push({

        text:
            formulae[
                Math.floor(
                    Math.random() *
                    formulae.length
                )
            ],

        x:
            Math.random() *
            width,

        y:
            Math.random() *
            height,

        life: 0,

        maxLife:
            2 +
            Math.random() * 4,

        scale:
            0.7 +
            Math.random() * 0.7

    });

}


// ============================================================
// LOAD REGISTRY
// ============================================================

async function loadRegistry() {

    const response =
        await fetch(
            CONFIG.registry,
            {
                cache: "no-store"
            }
        );

    if (!response.ok) {

        throw new Error(
            `No s'ha pogut carregar ${CONFIG.registry}`
        );

    }

    const data =
        await response.json();

    return extractNodes(data);

}


// ============================================================
// EXTRACT NODES
//
// Accepta diverses formes de registre
// sense obligar-nos a modificar index.json.
// ============================================================

function extractNodes(data) {

    if (Array.isArray(data)) {

        return data;

    }

    if (
        Array.isArray(
            data.nodes
        )
    ) {

        return data.nodes;

    }

    if (
        Array.isArray(
            data.entities
        )
    ) {

        return data.entities;

    }

    if (
        Array.isArray(
            data.items
        )
    ) {

        return data.items;

    }

    return [];

}


// ============================================================
// NORMALITZE NODE
// ============================================================

function normalizeNode(
    entry,
    index
) {

    const id =
        entry.id ||
        entry.name ||
        `node-${index + 1}`;

    /*
     * IMPORTANT:
     *
     * No afegim "nodes/" davant.
     *
     * Aquest index.js ja viu dins /nodes/.
     *
     * Si el registre diu:
     *
     * node2/main.js
     *
     * el resultat és:
     *
     * /nodes/node2/main.js
     *
     * i mai:
     *
     * /nodes/nodes/node2/main.js
     */

    const rawPath =
        entry.path ||
        entry.entry ||
        entry.url ||
        entry.main ||
        `${id}/main.js`;

    const path =
        normalizePath(
            rawPath
        );

    return {

        id,

        title:
            entry.title ||
            entry.name ||
            id,

        path,

        source:
            entry,

        angle:
            0,

        radius:
            0,

        baseRadius:
            0,

        x: 0,
        y: 0,

        vx:
            0,

        vy:
            0,

        phase:
            Math.random() *
            Math.PI *
            2,

        size:
            22 +
            Math.random() * 13,

        energy: 0,

        hovered: false,

        active: false

    };

}


// ============================================================
// PATH NORMALIZATION
// ============================================================

function normalizePath(
    path
) {

    let value =
        String(path)
            .trim();

    /*
     * Elimina qualsevol prefix accidental.
     */

    value =
        value.replace(
            /^\.?\//,
            ""
        );

    value =
        value.replace(
            /^nodes\//,
            ""
        );

    return value;

}


// ============================================================
// BUILD NODES
// ============================================================

function buildNodes(
    entries
) {

    nodes.length = 0;

    entries.forEach(
        (entry, index) => {

            nodes.push(
                normalizeNode(
                    entry,
                    index
                )
            );

        }
    );

    arrangeNodes();

}


// ============================================================
// CONSTELLATION
// ============================================================

function arrangeNodes() {

    if (!nodes.length) {

        return;

    }

    const cx =
        width * 0.5;

    const cy =
        height * 0.5;

    const scale =
        Math.min(
            width,
            height
        );

    const count =
        nodes.length;

    nodes.forEach(
        (node, index) => {

            const angle =
                (
                    index /
                    count
                )
                *
                Math.PI *
                2
                -
                Math.PI / 2;

            const radius =
                scale *
                CONFIG.orbitScale
                *
                (
                    0.72 +
                    (
                        index %
                        3
                    ) *
                    0.17
                );

            node.angle =
                angle;

            node.radius =
                radius;

            node.baseRadius =
                radius;

            node.x =
                cx +
                Math.cos(angle) *
                radius;

            node.y =
                cy +
                Math.sin(angle) *
                radius *
                0.62;

        }
    );

}


// ============================================================
// FIELD UPDATE
// ============================================================

function updateField() {

    const cx =
        width * 0.5;

    const cy =
        height * 0.5;

    const distance =
        Math.hypot(
            pointer.x - cx,
            pointer.y - cy
        );

    const maxDistance =
        Math.hypot(
            cx,
            cy
        );

    const radial =
        Math.min(
            distance /
            maxDistance,
            1
        );

    const movement =
        Math.min(
            pointer.speed / 25,
            1
        );

    field.targetEnergy =
        Math.min(
            1,
            0.08 +
            radial * 0.22 +
            movement * 0.7 +
            field.pulse * 0.5
        );

    field.energy +=
        (
            field.targetEnergy -
            field.energy
        )
        *
        0.035;

    field.turbulence =
        0.15 +
        field.energy *
        1.3;

    field.density +=
        (
            (
                0.25 +
                field.energy *
                0.8
            )
            -
            field.density
        )
        *
        0.025;

    field.rotation +=
        CONFIG.ambientSpeed +
        field.energy *
        0.002;

    field.distortion =
        field.energy *
        (
            0.4 +
            movement
        );

    field.pulse *=
        0.94;

}


// ============================================================
// UPDATE NODES
// ============================================================

function updateNodes() {

    const cx =
        width * 0.5;

    const cy =
        height * 0.5;

    nodes.forEach(
        (node, index) => {

            /*
             * Òrbita autònoma.
             */

            node.angle +=
                0.0005 +
                field.energy *
                0.0012 +
                index *
                0.00001;

            /*
             * Respiració.
             */

            const breathing =
                Math.sin(
                    time * 0.55 +
                    node.phase
                )
                *
                (
                    8 +
                    field.energy * 22
                );

            const targetRadius =
                node.baseRadius +
                breathing;

            const targetX =
                cx +
                Math.cos(
                    node.angle +
                    field.rotation
                )
                *
                targetRadius;

            const targetY =
                cy +
                Math.sin(
                    node.angle +
                    field.rotation
                )
                *
                targetRadius *
                0.62;

            /*
             * El node no segueix
             * directament el cursor.
             *
             * El camp el modifica.
             */

            node.vx +=
                (
                    targetX -
                    node.x
                )
                *
                0.0009;

            node.vy +=
                (
                    targetY -
                    node.y
                )
                *
                0.0009;

            /*
             * Interacció amb el cursor.
             */

            if (
                pointer.active
            ) {

                const dx =
                    pointer.x -
                    node.x;

                const dy =
                    pointer.y -
                    node.y;

                const distance =
                    Math.hypot(
                        dx,
                        dy
                    );

                const influence =
                    Math.max(
                        0,
                        1 -
                        distance /
                        CONFIG.interactionRadius
                    );

                node.energy +=
                    (
                        influence *
                        (
                            0.15 +
                            pointer.speed *
                            0.03
                        )
                        -
                        node.energy
                    )
                    *
                    0.12;

                /*
                 * Força orbital,
                 * no moviment lineal.
                 */

                const force =
                    influence *
                    field.energy *
                    0.06;

                node.vx +=
                    -dy /
                    Math.max(
                        distance,
                        1
                    )
                    *
                    force;

                node.vy +=
                    dx /
                    Math.max(
                        distance,
                        1
                    )
                    *
                    force;

            }

            node.energy *=
                0.97;

            node.vx *=
                CONFIG.damping;

            node.vy *=
                CONFIG.damping;

            node.x +=
                node.vx;

            node.y +=
                node.vy;

            node.hovered =
                Math.hypot(
                    pointer.x -
                    node.x,
                    pointer.y -
                    node.y
                )
                <
                node.size *
                1.8;

        }
    );

}


// ============================================================
// NODE RELATIONS
//
// Crea línies molt subtils entre nodes
// propers o energitzats.
// ============================================================

function drawNodeRelations() {

    ctx.save();

    ctx.globalCompositeOperation =
        "screen";

    for (
        let i = 0;
        i < nodes.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < nodes.length;
            j++
        ) {

            const a =
                nodes[i];

            const b =
                nodes[j];

            const distance =
                Math.hypot(
                    a.x - b.x,
                    a.y - b.y
                );

            if (
                distance >
                330
            ) {

                continue;

            }

            const energy =
                Math.max(
                    a.energy,
                    b.energy
                );

            const alpha =
                0.008 +
                energy *
                0.06;

            ctx.strokeStyle =
                `rgba(
                    165,
                    135,
                    190,
                    ${alpha}
                )`;

            ctx.lineWidth =
                0.5;

            ctx.beginPath();

            ctx.moveTo(
                a.x,
                a.y
            );

            ctx.lineTo(
                b.x,
                b.y
            );

            ctx.stroke();

        }

    }

    ctx.restore();

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
                Math.hypot(
                    dx,
                    dy
                );

            const angle =
                Math.atan2(
                    dy,
                    dx
                );

            const noise =
                Math.sin(
                    radius * 0.007 +
                    angle * 4 +
                    time * 0.32 +
                    particle.phase
                );

            const noise2 =
                Math.cos(
                    radius * 0.012 -
                    angle * 3 -
                    time * 0.2
                );

            const swirl =
                (
                    0.00025 +
                    field.energy *
                    0.0012
                )
                *
                (
                    1 +
                    noise *
                    0.7
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
                noise *
                field.turbulence *
                0.009;

            particle.vy +=
                noise2 *
                field.turbulence *
                0.009;

            /*
             * Cursor com a perturbació
             * d'un fluid.
             */

            if (
                pointer.active
            ) {

                const dxp =
                    particle.x -
                    pointer.x;

                const dyp =
                    particle.y -
                    pointer.y;

                const distance =
                    Math.hypot(
                        dxp,
                        dyp
                    );

                const influence =
                    Math.max(
                        0,
                        1 -
                        distance / 400
                    );

                const force =
                    influence *
                    field.energy *
                    0.055;

                particle.vx +=
                    -dyp /
                    Math.max(
                        distance,
                        1
                    )
                    *
                    force;

                particle.vy +=
                    dxp /
                    Math.max(
                        distance,
                        1
                    )
                    *
                    force;

            }

            particle.vx *=
                0.985;

            particle.vy *=
                0.985;

            particle.x +=
                particle.vx;

            particle.y +=
                particle.vy;

            const margin =
                150;

            if (
                particle.x <
                -margin ||
                particle.x >
                width + margin ||
                particle.y <
                -margin ||
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
            0.3 +
            Math.random() *
            0.6
        );

    particle.x =
        width * 0.5 +
        Math.cos(angle) *
        radius;

    particle.y =
        height * 0.5 +
        Math.sin(angle) *
        radius *
        0.62;

    particle.vx = 0;
    particle.vy = 0;

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
        i < 90;
        i++
    ) {

        const seed =
            i * 2.731;

        const angle =
            seed +
            time * 0.008;

        const radius =
            40 +
            (
                i *
                137
            )
            %
            Math.max(
                width,
                height
            )
            *
            0.72;

        const x =
            cx +
            Math.cos(angle) *
            radius;

        const y =
            cy +
            Math.sin(angle) *
            radius *
            0.68;

        const size =
            80 +
            field.energy *
            100;

        const gradient =
            ctx.createRadialGradient(
                x,
                y,
                0,
                x,
                y,
                size
            );

        gradient.addColorStop(
            0,
            `rgba(
                150,
                90,
                110,
                ${0.012 +
                field.energy * 0.025}
            )`
        );

        gradient.addColorStop(
            0.45,
            `rgba(
                80,
                65,
                115,
                ${0.009 +
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
            size,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

}


// ============================================================
// PARTICLES DRAW
// ============================================================

function drawParticles() {

    particles.forEach(
        particle => {

            const alpha =
                particle.alpha *
                (
                    0.65 +
                    field.density
                );

            ctx.fillStyle =
                `rgba(
                    190,
                    165,
                    195,
                    ${alpha}
                )`;

            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.size *
                (
                    0.8 +
                    field.energy *
                    0.8
                ),
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
    );

}


// ============================================================
// NODE RENDER
// ============================================================

function drawNodes() {

    nodes.forEach(
        node => {

            const pulse =
                Math.sin(
                    time * 1.2 +
                    node.phase
                );

            const radius =
                node.size +
                node.energy * 10 +
                pulse * 1.5;

            /*
             * Halo.
             */

            const halo =
                ctx.createRadialGradient(
                    node.x,
                    node.y,
                    0,
                    node.x,
                    node.y,
                    radius * 4
                );

            halo.addColorStop(
                0,
                `rgba(
                    205,
                    145,
                    185,
                    ${0.035 +
                    node.energy * 0.12}
                )`
            );

            halo.addColorStop(
                0.35,
                `rgba(
                    120,
                    95,
                    170,
                    ${0.018 +
                    node.energy * 0.05}
                )`
            );

            halo.addColorStop(
                1,
                "rgba(0,0,0,0)"
            );

            ctx.fillStyle =
                halo;

            ctx.beginPath();

            ctx.arc(
                node.x,
                node.y,
                radius * 4,
                0,
                Math.PI * 2
            );

            ctx.fill();

            /*
             * Nucli.
             */

            ctx.beginPath();

            ctx.arc(
                node.x,
                node.y,
                radius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                node.hovered
                    ? "rgba(225,190,220,0.85)"
                    : "rgba(150,120,165,0.42)";

            ctx.fill();

            /*
             * Anell.
             */

            ctx.strokeStyle =
                `rgba(
                    220,
                    195,
                    220,
                    ${node.hovered
                        ? 0.55
                        : 0.16}
                )`;

            ctx.lineWidth =
                node.hovered
                    ? 1.4
                    : 0.7;

            ctx.beginPath();

            ctx.arc(
                node.x,
                node.y,
                radius *
                (
                    1.25 +
                    node.energy * 0.2
                ),
                0,
                Math.PI * 2
            );

            ctx.stroke();

            /*
             * Identificador discret.
             */

            ctx.font =
                "10px monospace";

            ctx.textAlign =
                "center";

            ctx.fillStyle =
                `rgba(
                    210,
                    195,
                    215,
                    ${node.hovered
                        ? 0.75
                        : 0.25}
                )`;

            ctx.fillText(
                node.title,
                node.x,
                node.y +
                radius +
                17
            );

        }
    );

}


// ============================================================
// CENTRAL FIELD
// ============================================================

function drawCentralField() {

    const cx =
        width * 0.5;

    const cy =
        height * 0.5;

    const radius =
        18 +
        field.energy * 30;

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
            180,
            110,
            90,
            ${0.04 +
            field.energy * 0.06}
        )`
    );

    gradient.addColorStop(
        0.35,
        `rgba(
            100,
            70,
            120,
            ${0.025 +
            field.energy * 0.035}
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
        cx,
        cy,
        radius * 5,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


// ============================================================
// FORMULAE DRAW
// ============================================================

function drawFormulae() {

    activeFormulae.forEach(
        formula => {

            formula.life +=
                0.016;

            const fade =
                Math.sin(
                    Math.min(
                        formula.life /
                        formula.maxLife,
                        1
                    )
                    *
                    Math.PI
                );

            ctx.save();

            ctx.globalAlpha =
                fade * 0.24;

            ctx.font =
                `${12 * formula.scale}px monospace`;

            ctx.fillStyle =
                "#c9bacb";

            ctx.fillText(
                formula.text,
                formula.x,
                formula.y
            );

            ctx.restore();

        }
    );

    for (
        let i =
            activeFormulae.length - 1;
        i >= 0;
        i--
    ) {

        if (
            activeFormulae[i].life >
            activeFormulae[i].maxLife
        ) {

            activeFormulae.splice(
                i,
                1
            );

        }

    }

}


// ============================================================
// POINTER FIELD
// ============================================================

function drawPointerField() {

    if (
        !pointer.active
    ) {

        return;

    }

    const radius =
        35 +
        field.energy * 130;

    const gradient =
        ctx.createRadialGradient(
            pointer.x,
            pointer.y,
            0,
            pointer.x,
            pointer.y,
            radius
        );

    gradient.addColorStop(
        0,
        "rgba(220,190,215,0.025)"
    );

    gradient.addColorStop(
        0.5,
        "rgba(150,120,180,0.012)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );

    ctx.fillStyle =
        gradient;

    ctx.beginPath();

    ctx.arc(
        pointer.x,
        pointer.y,
        radius,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


// ============================================================
// AUDIO
//
// Minimal i coherent.
// L'espai no ha de ser una "veu molesta".
// ============================================================

let audioStarted = false;
let audioContext = null;

let master = null;

let droneA = null;
let droneB = null;
let droneGain = null;

let reverb = null;
let reverbGain = null;


// ============================================================
// START AUDIO
// ============================================================

function startAudio() {

    if (
        !CONFIG.audioEnabled
    ) {

        return;

    }

    if (
        audioStarted
    ) {

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

    audioStarted =
        true;

    createAudio();

}


// ============================================================
// AUDIO GRAPH
// ============================================================

function createAudio() {

    master =
        audioContext.createGain();

    master.gain.value =
        0.035;

    master.connect(
        audioContext.destination
    );


    /*
     * Reverb sintètica.
     */

    reverb =
        audioContext.createConvolver();

    const length =
        audioContext.sampleRate *
        3.5;

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
                    3
                );

        }

    }

    reverb.buffer =
        impulse;

    reverbGain =
        audioContext.createGain();

    reverbGain.gain.value =
        0.12;

    reverb.connect(
        reverbGain
    );

    reverbGain.connect(
        master
    );


    /*
     * A3 / A2.
     *
     * 220 Hz = A3
     * 110 Hz = A2
     */

    droneA =
        audioContext.createOscillator();

    droneB =
        audioContext.createOscillator();

    droneA.type =
        "sine";

    droneB.type =
        "triangle";

    droneA.frequency.value =
        220;

    droneB.frequency.value =
        110;


    droneGain =
        audioContext.createGain();

    droneGain.gain.value =
        0;


    droneA
        .connect(
            droneGain
        );

    droneB
        .connect(
            droneGain
        );

    droneGain.connect(
        master
    );

    droneGain.connect(
        reverb
    );


    droneA.start();

    droneB.start();

}


// ============================================================
// AUDIO UPDATE
// ============================================================

function updateAudio() {

    if (
        !audioStarted
    ) {

        return;

    }

    const now =
        audioContext.currentTime;

    const energy =
        field.energy;

    /*
     * Petita deriva tonal.
     *
     * Sempre conserva A com a
     * funció de centre.
     */

    const drift =
        Math.sin(
            time * 0.17
        )
        *
        2.2;

    droneA.frequency
        .setTargetAtTime(
            220 +
            drift +
            energy * 3,
            now,
            0.4
        );

    droneB.frequency
        .setTargetAtTime(
            110 +
            drift * 0.5 +
            energy * 1.5,
            now,
            0.5
        );

    droneGain.gain
        .setTargetAtTime(
            0.008 +
            energy * 0.028,
            now,
            0.35
        );

    reverbGain.gain
        .setTargetAtTime(
            0.1 +
            energy * 0.2,
            now,
            0.4
        );

}


// ============================================================
// NODE CLICK
// ============================================================

function openNode(
    node
) {

    if (
        !node ||
        !node.path
    ) {

        return;

    }

    /*
     * IMPORTANT:
     *
     * node.path ja és relatiu a /nodes/.
     *
     * Exemple:
     *
     * node2/main.js
     *
     * No hi afegim /nodes/.
     */

    const url =
        new URL(
            node.path,
            window.location.href
        );

    /*
     * Si main.js és un mòdul d'entrada,
     * l'obertura directa pot no ser la
     * manera adequada segons l'arquitectura.
     *
     * Primer intentem el protocol establert
     * per l'artefacte.
     */

    window.dispatchEvent(
        new CustomEvent(
            "zero-infinit:open-node",
            {
                detail: {
                    node,
                    url:
                        url.href
                }
            }
        )
    );

    /*
     * Fallback:
     *
     * Si ningú captura l'esdeveniment,
     * obrim el node.
     */

    setTimeout(
        () => {

            if (
                !window.__zeroInfinitNodeHandled
            ) {

                window.location.href =
                    url.href;

            }

        },
        60
    );

}


// ============================================================
// CLICK / TOUCH
// ============================================================

canvas.addEventListener(
    "click",
    event => {

        const x =
            event.clientX;

        const y =
            event.clientY;

        let selected =
            null;

        let distance =
            Infinity;

        nodes.forEach(
            node => {

                const d =
                    Math.hypot(
                        x - node.x,
                        y - node.y
                    );

                if (
                    d <
                    node.size * 2 &&
                    d <
                    distance
                ) {

                    selected =
                        node;

                    distance =
                        d;

                }

            }
        );

        if (
            selected
        ) {

            selected.active =
                true;

            selected.energy =
                1;

            field.pulse =
                1;

            openNode(
                selected
            );

        }

    }
);


// ============================================================
// HOVER
// ============================================================

canvas.addEventListener(
    "pointermove",
    () => {

        nodes.forEach(
            node => {

                if (
                    node.hovered
                ) {

                    node.energy =
                        Math.min(
                            1,
                            node.energy +
                            0.018
                        );

                }

            }
        );

    }
);


// ============================================================
// RENDER
// ============================================================

function render(
    milliseconds
) {

    time =
        milliseconds *
        0.001;

    pointer.speed *=
        0.92;

    updateField();

    updateNodes();

    updateParticles();

    updateAudio();

    spawnFormula();


    drawBackground();

    drawNebula();

    drawNodeRelations();

    drawParticles();

    drawCentralField();

    drawNodes();

    drawPointerField();

    drawFormulae();


    requestAnimationFrame(
        render
    );

}


// ============================================================
// BOOT
// ============================================================

async function boot() {

    resize();

    try {

        const entries =
            await loadRegistry();

        if (
            entries.length <
            CONFIG.minNodes
        ) {

            console.warn(
                "Zero Infinit: no s'han trobat nodes."
            );

        }

        buildNodes(
            entries
        );

    }
    catch (error) {

        console.error(
            "Zero Infinit — error carregant nodes:",
            error
        );

    }

    requestAnimationFrame(
        render
    );

}


boot();


// ============================================================
// API EXPERIMENTAL
//
// Permet que altres peces de Zero Infinit
// puguin excitar la constel·lació.
// ============================================================

window.ZeroInfinitNodes = {

    getNodes() {

        return nodes;

    },

    pulse(
        amount = 1
    ) {

        field.pulse =
            Math.min(
                1,
                amount
            );

        field.energy =
            Math.min(
                1,
                field.energy +
                amount * 0.25
            );

    },

    open(
        id
    ) {

        const node =
            nodes.find(
                item =>
                    item.id === id
            );

        if (
            node
        ) {

            node.energy =
                1;

            openNode(
                node
            );

        }

    }

};