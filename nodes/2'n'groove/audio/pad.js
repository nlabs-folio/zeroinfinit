import { context }
from "./context.js";

import { applyEnvelope }
from "./voices/envelope.js";


export class Pad {


    constructor(output){

        this.output =
        output;

        this.attack =
        0.35;

        this.release =
        1.2;

        this.volume =
        0.12;

    }


    trigger(
        notes = [110, 138.59, 164.81],
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
        2200;

        filter.Q.value =
        0.5;


        gain.connect(
            filter
        );

        filter.connect(
            this.output
        );


        const oscillators = [];


        notes.forEach(
        (frequency, index)=>{

            const osc =
            context.createOscillator();


            osc.type =
            "sawtooth";


            osc.frequency.value =
            frequency;


            // Petit desfasament entre veus
            osc.detune.value =
            index * 3 - 3;


            osc.connect(
                gain
            );


            oscillators.push(
                osc
            );


        });


        applyEnvelope(
            gain,
            context,
            this.attack,
            this.release,
            velocity * this.volume
        );


        oscillators.forEach(
        osc=>{

            osc.start(
                now
            );

            osc.stop(
                now +
                this.attack +
                this.release +
                0.1
            );

        });

    }

}