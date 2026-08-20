import { context }
from "./context.js";

import { applyEnvelope }
from "./voices/envelope.js";


export class Lead {


    constructor(output){

        this.output =
        output;

        this.attack =
        0.01;

        this.release =
        0.18;

        this.volume =
        0.22;

    }


    trigger(
        note = 220,
        velocity = 1
    ){

        const now =
        context.currentTime;


        const gain =
        context.createGain();


        const filter =
        context.createBiquadFilter();


        filter.type =
        "lowpass";


        filter.frequency.value =
        3200;


        filter.Q.value =
        1.2;


        gain.connect(
            filter
        );


        filter.connect(
            this.output
        );


        // ====================================================
        // SAW
        // ====================================================

        const saw =
        context.createOscillator();


        saw.type =
        "sawtooth";


        saw.frequency.value =
        note;


        saw.detune.value =
        -4;


        // ====================================================
        // TRIANGLE
        // ====================================================

        const triangle =
        context.createOscillator();


        triangle.type =
        "triangle";


        triangle.frequency.value =
        note;


        triangle.detune.value =
        4;


        // ====================================================
        // VIBRATO
        // ====================================================

        const lfo =
        context.createOscillator();


        const lfoGain =
        context.createGain();


        lfo.frequency.value =
        5.5;


        lfoGain.gain.value =
        7;


        lfo.connect(
            lfoGain
        );


        lfoGain.connect(
            saw.detune
        );


        lfoGain.connect(
            triangle.detune
        );


        // ====================================================
        // ROUTING
        // ====================================================

        saw.connect(
            gain
        );

        triangle.connect(
            gain
        );


        // ====================================================
        // ENVELOPE
        // ====================================================

        applyEnvelope(
            gain,
            context,
            this.attack,
            this.release,
            velocity * this.volume
        );


        // ====================================================
        // START
        // ====================================================

        saw.start(
            now
        );

        triangle.start(
            now
        );

        lfo.start(
            now
        );


        const stopTime =
        now +
        this.attack +
        this.release +
        0.1;


        saw.stop(
            stopTime
        );

        triangle.stop(
            stopTime
        );

        lfo.stop(
            stopTime
        );

    }

}