const canvas =
    document.getElementById("canvas");

const ctx =
    canvas.getContext("2d");



let width = 0;
let height = 0;
let dpr = 1;

let time = 0;



// ==================================================
// NODES
// ==================================================

let nodes = [];



// ==================================================
// POINTER
// ==================================================

const pointer = {

    x: -1000,

    y: -1000,

    active: false

};



// ==================================================
// RESIZE
// ==================================================

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

}


window.addEventListener(
    "resize",
    resize
);


resize();



// ==================================================
// LOAD JSON
// ==================================================

async function loadNodes() {

    try {

        const response =
            await fetch("./index.json");


        if (!response.ok) {

            throw new Error(
                "index.json no disponible"
            );

        }


        const registry =
            await response.json();


        nodes =
            registry.nodes.map(
                (node, index) => {

                    return {

                        ...node,

                        angle:
                            index * 2.1,

                        distance:
                            110 +
                            index * 65,

                        size:
                            2.5,

                        phase:
                            index * 1.7,

                        hover: 0

                    };

                }
            );


        console.log(
            "Índex carregat:",
            nodes
        );


    } catch (error) {

        console.error(
            "No s'ha pogut carregar index.json:",
            error
        );


        nodes = [

            {
                id: "node2",
                angle: 0,
                distance: 120,
                size: 2.5,
                phase: 0,
                hover: 0
            },

            {
                id: "node3",
                angle: 2.1,
                distance: 160,
                size: 2.5,
                phase: 1.7,
                hover: 0
            },

            {
                id: "nodeN",
                angle: 4.2,
                distance: 200,
                size: 2.5,
                phase: 3.4,
                hover: 0
            }

        ];

    }

}


await loadNodes();



// ==================================================
// POINTER
// ==================================================

window.addEventListener(
    "pointermove",
    event => {

        pointer.x =
            event.clientX;

        pointer.y =
            event.clientY;

        pointer.active =
            true;

        updateAudioFromPointer();

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
    startAudio,
    {
        once: true
    }
);



// ==================================================
// AUDIO
//
// Centre tonal:
// 432 Hz
//
// Estructures temporals:
//
// DELTA  = 2 Hz
// THETA  = 6 Hz
// ALPHA  = 10 Hz
// BETA   = 20 Hz
//
// Les freqüències temporals no són
// les freqüències audibles.
//
// Actuen com a moduladors.
// ==================================================

const AUDIO = {

    fundamental: 432,

    delta: 2,

    theta: 6,

    alpha: 10,

    beta: 20

};


let audioStarted = false;

let audioContext = null;

let masterGain = null;

let spatialGain = null;

let stereoPanner = null;

let compressor = null;

let voices = [];

let audioTime = 0;



// ==================================================
// AUDIO — START
// ==================================================

function startAudio() {

    if (audioStarted) {
        return;
    }


    audioStarted = true;


    audioContext =
        new AudioContext();


    createAudioSystem();


    if (
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();

    }


    console.log(
        "Zero Infinit audio iniciat"
    );

}



// ==================================================
// AUDIO SYSTEM
// ==================================================

function createAudioSystem() {

    /*
     * Master
     */

    masterGain =
        audioContext.createGain();

    masterGain.gain.value =
        0.12;


    /*
     * Espai
     */

    spatialGain =
        audioContext.createGain();

    spatialGain.gain.value =
        0.8;


    /*
     * Panning lent
     */

    stereoPanner =
        audioContext.createStereoPanner();

    stereoPanner.pan.value =
        0;


    /*
     * Compressió molt lleugera.
     *
     * Només evita pics.
     */

    compressor =
        audioContext.createDynamicsCompressor();

    compressor.threshold.value =
        -30;

    compressor.knee.value =
        20;

    compressor.ratio.value =
        2;

    compressor.attack.value =
        0.03;

    compressor.release.value =
        0.3;


    spatialGain
        .connect(
            stereoPanner
        );


    stereoPanner
        .connect(
            masterGain
        );


    masterGain
        .connect(
            compressor
        );


    compressor
        .connect(
            audioContext.destination
        );


    /*
     * Crear les quatre capes.
     */

    createBinauralLayer(
        "delta",
        AUDIO.delta,
        0.32
    );


    createBinauralLayer(
        "theta",
        AUDIO.theta,
        0.24
    );


    createBinauralLayer(
        "alpha",
        AUDIO.alpha,
        0.18
    );


    createBinauralLayer(
        "beta",
        AUDIO.beta,
        0.10
    );

}



// ==================================================
// BINAURAL LAYER
// ==================================================

function createBinauralLayer(
    name,
    modulationHz,
    amplitude
) {

    /*
     * Esquerra:
     *
     * 432 Hz
     *
     * Dreta:
     *
     * 432 + freqüència temporal
     *
     * Això produeix una diferència
     * exacta entre els dos canals.
     */

    const left =
        audioContext.createOscillator();

    const right =
        audioContext.createOscillator();


    left.type =
        "sine";

    right.type =
        "sine";


    left.frequency.value =
        AUDIO.fundamental;

    right.frequency.value =
        AUDIO.fundamental +
        modulationHz;


    /*
     * Amplitud independent.
     */

    const leftGain =
        audioContext.createGain();

    const rightGain =
        audioContext.createGain();


    leftGain.gain.value =
        amplitude;

    rightGain.gain.value =
        amplitude;


    /*
     * Filtres molt oberts.
     *
     * No volem destruir
     * l'harmònic pur.
     */

    const leftFilter =
        audioContext.createBiquadFilter();

    const rightFilter =
        audioContext.createBiquadFilter();


    leftFilter.type =
        "lowpass";

    rightFilter.type =
        "lowpass";


    leftFilter.frequency.value =
        1800;

    rightFilter.frequency.value =
        1800;


    leftFilter.Q.value =
        0.25;

    rightFilter.Q.value =
        0.25;


    /*
     * Cada oscil·lador va al seu
     * canal del merger.
     */

    const merger =
        audioContext.createChannelMerger(2);


    left
        .connect(leftFilter)
        .connect(leftGain)
        .connect(
            merger,
            0,
            0
        );


    right
        .connect(rightFilter)
        .connect(rightGain)
        .connect(
            merger,
            0,
            1
        );


    /*
     * La capa entra a l'espai global.
     */

    merger
        .connect(
            spatialGain
        );


    /*
     * Guardem tota la informació
     * per poder modular-la.
     */

    const voice = {

        name,

        modulationHz,

        amplitude,

        left,

        right,

        leftGain,

        rightGain,

        leftFilter,

        rightFilter,

        phase:
            Math.random()
            *
            Math.PI
            *
            2

    };


    voices.push(
        voice
    );


    left.start();

    right.start();

}



// ==================================================
// AUDIO — POINTER
// ==================================================

function updateAudioFromPointer() {

    if (!audioStarted) {
        return;
    }


    const x =
        pointer.x /
        Math.max(width, 1);


    const y =
        pointer.y /
        Math.max(height, 1);


    const now =
        audioContext.currentTime;


    /*
     * X:
     *
     * desplaçament espacial
     *
     * -1 ← centre → +1
     */

    const pan =
        (
            x - 0.5
        )
        *
        1.4;


    stereoPanner.pan
        .setTargetAtTime(
            Math.max(
                -1,
                Math.min(
                    1,
                    pan
                )
            ),
            now,
            0.08
        );


    /*
     * Y:
     *
     * profunditat / amplitud.
     *
     * No és lineal perquè volem
     * una resposta subtil.
     */

    const depth =
        1 -
        Math.abs(
            y - 0.5
        )
        *
        1.6;


    const volume =
        0.55 +
        Math.max(
            0,
            depth
        )
        *
        0.55;


    masterGain.gain
        .setTargetAtTime(
            0.12 * volume,
            now,
            0.12
        );


    /*
     * El cursor també modifica
     * lleugerament la brillantor.
     */

    const filterValue =
        1000 +
        (
            1 - y
        )
        *
        2600;


    voices.forEach(
        voice => {

            voice.leftFilter.frequency
                .setTargetAtTime(
                    filterValue,
                    now,
                    0.15
                );


            voice.rightFilter.frequency
                .setTargetAtTime(
                    filterValue,
                    now,
                    0.15
                );

        }
    );

}



// ==================================================
// TEMPORAL MODULATION
// ==================================================

function updateTemporalAudio() {

    if (!audioStarted) {
        return;
    }


    /*
     * Temps real del context.
     *
     * Això és important:
     *
     * no fem servir frames visuals
     * per definir els cicles sonors.
     *
     * Web Audio treballa en segons.
     */

    audioTime =
        audioContext.currentTime;


    voices.forEach(
        voice => {

            const f =
                voice.modulationHz;


            const phase =
                (
                    audioTime * f
                    +
                    voice.phase
                )
                *
                Math.PI
                *
                2;


            /*
             * Amplitud temporal.
             *
             * La profunditat és petita
             * per evitar un tremolo agressiu.
             */

            let modulation =
                0.78
                +
                Math.sin(phase)
                *
                0.22;


            /*
             * Petita assimetria entre canals.
             *
             * Manté la sensació espacial
             * sense destruir la relació
             * binaural principal.
             */

            const leftLevel =
                voice.amplitude
                *
                modulation;


            const rightLevel =
                voice.amplitude
                *
                (
                    0.78
                    +
                    Math.sin(
                        phase
                        +
                        0.35
                    )
                    *
                    0.22
                );


            voice.leftGain.gain
                .setTargetAtTime(
                    leftLevel,
                    audioTime,
                    0.015
                );


            voice.rightGain.gain
                .setTargetAtTime(
                    rightLevel,
                    audioTime,
                    0.015
                );

        }
    );


    /*
     * Tornem a actualitzar
     * aproximadament cada frame.
     */

    requestAnimationFrame(
        updateTemporalAudio
    );

}



// ==================================================
// BACKGROUND
// ==================================================

function drawBackground() {

    ctx.fillStyle =
        "#010108";


    ctx.fillRect(
        0,
        0,
        width,
        height
    );

}



// ==================================================
// NEBULA
// ==================================================

function drawNebula() {

    const cx =
        width * 0.5;

    const cy =
        height * 0.5;


    for (
        let i = 0;
        i < 70;
        i++
    ) {

        const angle =
            i * 2.399
            +
            time * 0.012;


        const distance =
            40
            +
            (
                i * 31
            )
            %
            Math.max(
                width,
                height
            );


        const breathing =
            Math.sin(
                time * 0.15
                +
                i
            )
            *
            20;


        const x =
            cx
            +
            Math.cos(angle)
            *
            (
                distance +
                breathing
            );


        const y =
            cy
            +
            Math.sin(angle)
            *
            (
                distance +
                breathing
            )
            *
            0.55;


        const radius =
            30
            +
            Math.sin(
                time * 0.1
                +
                i
            )
            *
            10;


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
            "rgba(80,50,160,0.045)"
        );


        gradient.addColorStop(
            1,
            "rgba(10,5,40,0)"
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



// ==================================================
// CENTRAL VOID
// ==================================================

function drawVoid() {

    const cx =
        width * 0.5;

    const cy =
        height * 0.5;


    const pulse =
        1
        +
        Math.sin(
            time * 0.22
        )
        *
        0.08;


    const radius =
        32 * pulse;


    const glow =
        ctx.createRadialGradient(

            cx,
            cy,
            0,

            cx,
            cy,
            radius * 3

        );


    glow.addColorStop(
        0,
        "rgba(100,60,180,0.12)"
    );


    glow.addColorStop(
        0.5,
        "rgba(60,30,120,0.04)"
    );


    glow.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.fillStyle =
        glow;


    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        radius * 3,
        0,
        Math.PI * 2
    );

    ctx.fill();

}



// ==================================================
// NODES
// ==================================================

function drawNodes() {

    const cx =
        width * 0.5;

    const cy =
        height * 0.5;


    nodes.forEach(
        node => {


            const angle =
                node.angle
                +
                time * 0.018;


            const breathing =
                Math.sin(
                    time * 0.16
                    +
                    node.phase
                )
                *
                16;


            const distance =
                node.distance
                +
                breathing;


            let x =
                cx
                +
                Math.cos(angle)
                *
                distance;


            let y =
                cy
                +
                Math.sin(angle)
                *
                distance
                *
                0.60;



            const dx =
                pointer.x - x;

            const dy =
                pointer.y - y;


            const distanceToPointer =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            const targetHover =
                pointer.active &&
                distanceToPointer < 90
                    ? 1
                    : 0;


            node.hover +=
                (
                    targetHover -
                    node.hover
                )
                *
                0.08;


            x +=
                dx
                *
                node.hover
                *
                0.05;


            y +=
                dy
                *
                node.hover
                *
                0.05;



            // --------------------------------------
            // HALO
            // --------------------------------------

            if (
                node.hover > 0.01
            ) {

                const halo =
                    ctx.createRadialGradient(

                        x,
                        y,
                        0,

                        x,
                        y,
                        35

                    );


                halo.addColorStop(
                    0,
                    "rgba(180,130,255,0.25)"
                );


                halo.addColorStop(
                    1,
                    "rgba(100,70,220,0)"
                );


                ctx.fillStyle =
                    halo;


                ctx.beginPath();

                ctx.arc(
                    x,
                    y,
                    35,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

            }



            // --------------------------------------
            // NODE
            // --------------------------------------

            const pulse =
                1
                +
                Math.sin(
                    time * 0.7
                    +
                    node.phase
                )
                *
                0.15;


            const radius =
                node.size
                *
                pulse
                *
                (
                    1
                    +
                    node.hover * 2
                );


            ctx.beginPath();

            ctx.arc(
                x,
                y,
                radius,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                node.hover > 0.01

                    ? "rgba(220,190,255,0.95)"

                    : "rgba(160,130,230,0.70)";


            ctx.fill();



            // --------------------------------------
            // LABEL
            // --------------------------------------

            if (
                node.hover > 0.4
            ) {

                ctx.font =
                    "9px Arial";


                ctx.textAlign =
                    "center";


                ctx.fillStyle =
                    `rgba(
                        230,
                        220,
                        255,
                        ${node.hover * 0.8}
                    )`;


                ctx.fillText(
                    node.id,
                    x,
                    y - 14
                );

            }

        }
    );

}



// ==================================================
// RENDER
// ==================================================

function render(milliseconds) {

    time =
        milliseconds * 0.001;


    drawBackground();

    drawNebula();

    drawVoid();

    drawNodes();


    requestAnimationFrame(
        render
    );

}


requestAnimationFrame(
    render
);



// ==================================================
// START TEMPORAL AUDIO LOOP
// ==================================================

requestAnimationFrame(
    updateTemporalAudio
);