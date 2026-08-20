import { context }
from "./context.js";

import { applyEnvelope }
from "./voices/envelope.js";


export class Hat {


    constructor(output){

        this.output =
        output;

        // Durada molt curta
        this.decay =
        0.045;

        // Zona alta
        this.brightness =
        7500;

    }


    trigger(velocity = 1){

        const noise =
        context.createBufferSource();


        const filter =
        context.createBiquadFilter();


        const gain =
        context.createGain();


        // ====================================================
        // NOISE
        // ====================================================

        const buffer =
        context.createBuffer(
            1,
            context.sampleRate * 0.1,
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
        // FILTER
        // ====================================================

        filter.type =
        "highpass";


        filter.frequency.value =
        this.brightness;


        filter.Q.value =
        0.7;


        // ====================================================
        // ROUTING
        // ====================================================

        noise.connect(
            filter
        );


        filter.connect(
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
            velocity * 0.22
        );


        // ====================================================
        // START
        // ====================================================

        noise.start();


        noise.stop(
            context.currentTime + 0.1
        );

    }

}