import { context }
from "./context.js";

import { applyEnvelope }
from "./voices/envelope.js";


export class Lead {


    constructor(output){

        this.output =
        output;

        this.attack =
        0.005;

        this.release =
        0.16;

        this.volume =
        0.18;

        this.cutoff =
        3200;

    }


    setCutoff(value){

        this.cutoff =
        value;

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
        this.cutoff;


        filter.Q.value =
        1.5;


        gain.connect(filter);

        filter.connect(
            this.output
        );


        const osc =
        context.createOscillator();


        osc.type =
        "sawtooth";


        osc.frequency.value =
        note;


        const sub =
        context.createOscillator();


        sub.type =
        "triangle";


        sub.frequency.value =
        note / 2;


        osc.connect(gain);

        sub.connect(gain);


        applyEnvelope(
            gain,
            context,
            this.attack,
            this.release,
            velocity *
            this.volume
        );


        osc.start(now);

        sub.start(now);


        const stop =
        now +
        this.attack +
        this.release +
        0.1;


        osc.stop(stop);

        sub.stop(stop);

    }

}