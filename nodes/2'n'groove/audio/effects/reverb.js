import { context }
from "../context.js";


export class Reverb {


    constructor(){

        this.input =
        context.createGain();


        this.output =
        context.createGain();


        this.delayA =
        context.createDelay(1);


        this.delayB =
        context.createDelay(1);


        this.feedback =
        context.createGain();


        this.mix =
        context.createGain();


        this.delayA.delayTime.value =
        0.19;


        this.delayB.delayTime.value =
        0.31;


        this.feedback.gain.value =
        0.32;


        this.mix.gain.value =
        0.18;


        this.input.connect(
            this.output
        );


        this.input.connect(
            this.delayA
        );


        this.input.connect(
            this.delayB
        );


        this.delayA.connect(
            this.feedback
        );


        this.delayB.connect(
            this.feedback
        );


        this.feedback.connect(
            this.delayA
        );


        this.feedback.connect(
            this.delayB
        );


        this.delayA.connect(
            this.mix
        );


        this.delayB.connect(
            this.mix
        );


        this.mix.connect(
            this.output
        );

    }


    setMix(value){

        this.mix.gain.setTargetAtTime(
            value,
            context.currentTime,
            0.02
        );

    }


    connect(destination){

        this.output.connect(
            destination
        );

    }

}