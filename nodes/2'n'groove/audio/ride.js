import { context } from "./context.js";
import { applyEnvelope } from "./voices/envelope.js";


export class Ride {


    constructor(output){

        this.output = output;

        this.decay = 0.5;

    }



    trigger(velocity = 1){


        const gain =
        context.createGain();


        const filter =
        context.createBiquadFilter();



        filter.type =
        "highpass";


        filter.frequency.value =
        5000;



        [
            600,
            840,
            1100,
            1500,
            2200

        ]
        .forEach(freq=>{


            const osc =
            context.createOscillator();


            osc.type =
            "square";


            osc.frequency.value =
            freq;


            osc.connect(
                filter
            );


            osc.start();


            osc.stop(
                context.currentTime + this.decay
            );


        });



        filter.connect(gain);


        gain.connect(
            this.output
        );



        applyEnvelope(
            gain,
            context,
            0.005,
            this.decay,
            velocity * 0.35
        );


    }


}