import { context }
from "./context.js";

import { applyEnvelope }
from "./voices/envelope.js";


export class Pad {


    constructor(output){

        this.output =
        output;

        this.attack =
        0.18;

        this.release =
        1.4;

        this.volume =
        0.10;

        this.cutoff =
        1800;

    }


    setCutoff(value){

        this.cutoff =
        value;

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
        this.cutoff;


        filter.Q.value =
        0.7;


        gain.connect(filter);

        filter.connect(
            this.output
        );


        const oscillators = [];


        notes.forEach(
        (frequency,index)=>{

            const osc =
            context.createOscillator();


            osc.type =
            "sawtooth";


            osc.frequency.value =
            frequency;


            osc.detune.value =
            index * 4 - 6;


            osc.connect(gain);


            oscillators.push(
                osc
            );

        });


        applyEnvelope(
            gain,
            context,
            this.attack,
            this.release,
            velocity *
            this.volume
        );


        oscillators.forEach(
        osc=>{

            osc.start(now);

            osc.stop(
                now +
                this.attack +
                this.release +
                0.1
            );

        });

    }

}