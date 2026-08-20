import { context } from "./context.js";
import { applyEnvelope } from "./voices/envelope.js";
import { createNoise } from "./voices/noise.js";


export class Snare {


    constructor(output){

        this.output = output;

        this.decay = 0.18;

        this.tone = 1800;

    }



    trigger(velocity = 1){


        const noise =
        createNoise();



        const filter =
        context.createBiquadFilter();



        const gain =
        context.createGain();



        filter.type =
        "bandpass";


        filter.frequency.value =
        this.tone;



        noise
        .connect(filter);


        filter.connect(gain);


        gain.connect(
            this.output
        );



        applyEnvelope(
            gain,
            context,
            0.002,
            this.decay,
            velocity
        );


        noise.start();


    }


}