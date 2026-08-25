// =========================================================
// CONWAY ORGANISM
// ZERO INFINIT
//
// MAIN
//
// Conway
//    ↓
// BioSignal
//    ↓
// TonalState
//    ↓
// PatchBay
//    ↓
// Synth
// =========================================================


import { Conway }
    from "./conway.js";


import { Synth }
    from "./synth.js";


import { Controls }
    from "./controls.js";


import { createKnob }
    from "./knobs.js";


import { Clock }
    from "./clock.js";


import { BioSignal }
    from "./biosignal.js";


import { PatchBay }
    from "./patchbay.js";


import { AudioReactive }
    from "./visual/audioReactive.js";


console.log(
    "ZERO INFINIT — MAIN CARREGAT"
);



// =========================================================
// INSTANCES
// =========================================================


const organism =
    new Conway();


const synth =
    new Synth();


const visualizer =
    new AudioReactive(
        synth
    );


const clock =
    new Clock();


const bio =
    new BioSignal();


const patch =
    new PatchBay();



// =========================================================
// BIOLOGICAL PATCH
// =========================================================


patch.connect(
    "energy",
    "setBioVolume",
    0.65
);


patch.connect(
    "density",
    "setBioCutoff",
    0.80
);


patch.connect(
    "movement",
    "setBioResonance",
    0.55
);



// =========================================================
// CLOCK
// =========================================================


clock.onTick(
    () => {

        step();

    }
);



// =========================================================
// CONTROLS
// =========================================================


new Controls(
    synth,
    organism,
    clock
);



// =========================================================
// CANVAS
// =========================================================


const canvas =
    document.getElementById(
        "grid"
    );


const ctx =
    canvas
    ?
    canvas.getContext("2d")
    :
    null;



// =========================================================
// KNOBS
// =========================================================


const knobMap = [

    [
        "tempo-knob",
        "tempo"
    ],

    [
        "oscA-knob",
        "oscA"
    ],

    [
        "oscB-knob",
        "oscB"
    ],

    [
        "cutoff-knob",
        "cutoff"
    ],

    [
        "attack-knob",
        "attack"
    ],

    [
        "release-knob",
        "release"
    ],

    [
        "volume-knob",
        "volume"
    ]

];


knobMap.forEach(
    ([knobId, inputId]) => {

        const knob =
            document.getElementById(
                knobId
            );


        const input =
            document.getElementById(
                inputId
            );


        if (
            knob &&
            input
        ) {

            createKnob(
                knob,
                input
            );

        }

    }
);



// =========================================================
// OSCILLATOR WAVEFORMS
// =========================================================


const oscAWave =
    document.getElementById(
        "oscA-wave"
    );


if (oscAWave) {

    oscAWave.addEventListener(
        "change",
        event => {

            synth.oscA.setWave(
                event.target.value
            );

        }
    );

}



const oscBWave =
    document.getElementById(
        "oscB-wave"
    );


if (oscBWave) {

    oscBWave.addEventListener(
        "change",
        event => {

            synth.oscB.setWave(
                event.target.value
            );

        }
    );

}



// =========================================================
// START
// =========================================================


const start =
    document.getElementById(
        "start"
    );


if (start) {

    start.addEventListener(
        "click",
        () => {

            synth.start();


            if (
                !organism.isAlive()
            ) {

                organism.seed();

            }


            clock.start();

        }
    );

}



// =========================================================
// STOP
// =========================================================


const stop =
    document.getElementById(
        "stop"
    );


if (stop) {

    stop.addEventListener(
        "click",
        () => {

            clock.stop();

        }
    );

}



// =========================================================
// RESET
// =========================================================


const reset =
    document.getElementById(
        "reset"
    );


if (reset) {

    reset.addEventListener(
        "click",
        () => {

            clock.stop();

            organism.reset();

            if (
                bio.reset
            ) {

                bio.reset();

            }


            updateMonitor({

                population: 0,

                energy: 0,

                density: 0,

                movement: 0

            });


            draw();

        }
    );

}



// =========================================================
// STEP
// =========================================================


function step() {


    // Conway
    organism.next();


    // Biologia
    const data =
        organism.analyse();


    // Música
    const signal =
        bio.update(
            data
        );


    // Modulació
    patch.process(
        signal,
        synth
    );


    // Veu
    synth.processBioSignal(
        signal
    );


    // Visual
    draw();


    // Monitor
    updateMonitor(
        data,
        signal
    );

}



// =========================================================
// DRAW
// =========================================================


function draw() {

    if (
        !canvas ||
        !ctx
    )

        return;


    const width =
        canvas.width;


    const height =
        canvas.height;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    // =====================================================
    // MARGE INTERN
    // =====================================================

    const margin =
        Math.min(
            width,
            height
        ) * 0.055;


    const availableWidth =
        Math.max(
            1,
            width -
            margin * 2
        );


    const availableHeight =
        Math.max(
            1,
            height -
            margin * 2
        );


    // =====================================================
    // GRID PROPORCIONAL
    // =====================================================

    const cellWidth =
        availableWidth /
        organism.cols;


    const cellHeight =
        availableHeight /
        organism.rows;


    const cellSize =
        Math.min(
            cellWidth,
            cellHeight
        );


    const gridWidth =
        cellSize *
        organism.cols;


    const gridHeight =
        cellSize *
        organism.rows;


    const offsetX =
        (
            width -
            gridWidth
        ) / 2;


    const offsetY =
        (
            height -
            gridHeight
        ) / 2;


    // =====================================================
    // CEL·LES
    // =====================================================

    for (
        let y = 0;
        y < organism.rows;
        y++
    ) {

        for (
            let x = 0;
            x < organism.cols;
            x++
        ) {

            if (
                !organism.grid[y][x]
            )

                continue;


            const px =
                offsetX +
                x * cellSize;


            const py =
                offsetY +
                y * cellSize;


            const gap =
                Math.max(
                    1,
                    cellSize * 0.08
                );


            ctx.fillStyle =
                "#70ffd0";


            ctx.fillRect(

                px +
                gap / 2,

                py +
                gap / 2,

                Math.max(
                    1,
                    cellSize -
                    gap
                ),

                Math.max(
                    1,
                    cellSize -
                    gap
                )

            );

        }

    }

}



// =========================================================
// MONITOR
// =========================================================


function updateMonitor(
    data,
    signal = null
) {


    const generation =
        document.getElementById(
            "generation"
        );


    const population =
        document.getElementById(
            "population"
        );


    const state =
        document.getElementById(
            "state"
        );


    const energy =
        document.getElementById(
            "energy"
        );


    const density =
        document.getElementById(
            "bio-density"
        );


    const movement =
        document.getElementById(
            "movement"
        );


    if (energy) {

        energy.textContent =

            Math.round(
                (
                    data.energy ||
                    0
                ) * 100
            )
            +
            "%";

    }


    if (density) {

        density.textContent =

            Math.round(
                (
                    data.density ||
                    0
                ) * 100
            )
            +
            "%";

    }


    if (movement) {

        movement.textContent =

            Math.round(
                (
                    data.movement ||
                    0
                ) * 100
            )
            +
            "%";

    }


    if (generation) {

        generation.textContent =

            String(
                organism.generation
            )
            .padStart(
                4,
                "0"
            );

    }


    if (population) {

        population.textContent =

            String(
                data.population ||
                0
            )
            .padStart(
                3,
                "0"
            );

    }


    if (state) {

        if (
            !data.population
        ) {

            state.textContent =
                "WAITING";

        }

        else if (
            signal &&
            signal.noteTrigger
        ) {

            state.textContent =
                "ACTIVE";

        }

        else {

            state.textContent =
                "REST";

        }

    }

}



// =========================================================
// INITIAL DRAW
// =========================================================


draw();



// =========================================================
// SPECTRUM
// =========================================================


const spectrum =
    document.getElementById(
        "spectrum"
    );


if (spectrum) {

    const spectrumCtx =
        spectrum.getContext(
            "2d"
        );


    visualizer.connect(
        spectrumCtx,
        spectrum
    );

}