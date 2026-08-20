import { context } from "./context.js";
import { applyEnvelope } from "./voices/envelope.js";


export class Tom {


    constructor(output){

        this.output = output;

        this.pitch = 160;

        this.cutoff = 900;

        this.decay = 0.35;

    }



    trigger(velocity = 1){


        const osc =
        context.createOscillator();


        const filter =
        context.createBiquadFilter();


        const gain =
        context.createGain();



        const now =
        context.currentTime;



        osc.type =
        "sine";



        osc.frequency.setValueAtTime(
            this.pitch,
            now
        );


        osc.frequency.exponentialRampToValueAtTime(
            70,
            now + 0.2
        );



        filter.type =
        "lowpass";


        filter.frequency.value =
        this.cutoff;



        osc.connect(filter);

        filter.connect(gain);

        gain.connect(
            this.output
        );



        applyEnvelope(
            gain,
            context,
            0.005,
            this.decay,
            velocity
        );



        osc.start();

        osc.stop(
            now + 0.5
        );


    }


}