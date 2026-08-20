import { context } from "./context.js";
import { applyEnvelope } from "./voices/envelope.js";


export class Hat {


    constructor(output){

        this.output = output;

        this.decay = 0.06;

        this.brightness = 8000;

    }



    trigger(velocity = 1){


        const filter =
        context.createBiquadFilter();


        const gain =
        context.createGain();



        filter.type =
        "highpass";


        filter.frequency.value =
        this.brightness;



        const oscillators = [];



        [
            400,
            520,
            650,
            780,
            920,
            1200

        ]
        .forEach(freq=>{


            const osc =
            context.createOscillator();



            osc.type =
            "square";


            osc.frequency.value =
            freq;



            osc.connect(filter);


            oscillators.push(
                osc
            );


        });



        filter.connect(gain);


        gain.connect(
            this.output
        );



        applyEnvelope(
            gain,
            context,
            0.001,
            this.decay,
            velocity * 0.4
        );



        oscillators.forEach(
            osc=>{

                osc.start();

                osc.stop(
                    context.currentTime + 0.1
                );

            }
        );


    }


}