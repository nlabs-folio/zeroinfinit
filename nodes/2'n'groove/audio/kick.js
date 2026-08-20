import { context } from "./context.js";
import { applyEnvelope } from "./voices/envelope.js";


export class Kick {


    constructor(output){

        this.output = output;

        this.tone = 50;

        this.decay = 0.35;

    }



    trigger(velocity = 1){


        const osc =
        context.createOscillator();


        const gain =
        context.createGain();



        const now =
        context.currentTime;



        osc.type =
        "sine";



        osc.frequency.setValueAtTime(
            160,
            now
        );


        osc.frequency.exponentialRampToValueAtTime(
            this.tone,
            now + 0.12
        );



        osc.connect(gain);

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



        osc.start();

        osc.stop(
            now + 0.5
        );


    }


}