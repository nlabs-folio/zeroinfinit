import { context }
from "./context.js";

import { applyEnvelope }
from "./voices/envelope.js";


export class Ride {


    constructor(output){

        this.output =
        output;

        this.decay =
        0.28;

        this.brightness =
        5000;

    }


    trigger(velocity = 1){

        const noise =
        context.createBufferSource();


        const highpass =
        context.createBiquadFilter();


        const bandpass =
        context.createBiquadFilter();


        const gain =
        context.createGain();


        // ====================================================
        // NOISE
        // ====================================================

        const buffer =
        context.createBuffer(
            1,
            context.sampleRate * 0.4,
            context.sampleRate
        );


        const data =
        buffer.getChannelData(0);


        for(
            let i = 0;
            i < data.length;
            i++
        ){

            data[i] =
            Math.random() * 2 - 1;

        }


        noise.buffer =
        buffer;


        // ====================================================
        // HIGH PASS
        // ====================================================

        highpass.type =
        "highpass";

        highpass.frequency.value =
        this.brightness;

        highpass.Q.value =
        0.5;


        // ====================================================
        // METALLIC RESONANCE
        // ====================================================

        bandpass.type =
        "bandpass";

        bandpass.frequency.value =
        6500;

        bandpass.Q.value =
        1.4;


        // ====================================================
        // ROUTING
        // ====================================================

        noise.connect(
            highpass
        );

        highpass.connect(
            bandpass
        );

        bandpass.connect(
            gain
        );

        gain.connect(
            this.output
        );


        // ====================================================
        // ENVELOPE
        // ====================================================

        applyEnvelope(
            gain,
            context,
            0.001,
            this.decay,
            velocity * 0.24
        );


        // ====================================================
        // START
        // ====================================================

        noise.start();

        noise.stop(
            context.currentTime + 0.4
        );

    }

}