import { context }
from "../context.js";


export class Delay {


    constructor(){

        this.input =
        context.createGain();


        this.output =
        context.createGain();


        this.delay =
        context.createDelay(2);


        this.feedback =
        context.createGain();


        this.mix =
        context.createGain();


        this.delay.delayTime.value =
        0.22;


        this.feedback.gain.value =
        0.28;


        this.mix.gain.value =
        0.25;


        this.input.connect(
            this.output
        );


        this.input.connect(
            this.delay
        );


        this.delay.connect(
            this.feedback
        );


        this.feedback.connect(
            this.delay
        );


        this.delay.connect(
            this.mix
        );


        this.mix.connect(
            this.output
        );

    }


    setTime(value){

        this.delay.delayTime.setTargetAtTime(
            value,
            context.currentTime,
            0.01
        );

    }


    setFeedback(value){

        this.feedback.gain.setTargetAtTime(
            value,
            context.currentTime,
            0.01
        );

    }


    setMix(value){

        this.mix.gain.setTargetAtTime(
            value,
            context.currentTime,
            0.01
        );

    }


    connect(destination){

        this.output.connect(
            destination
        );

    }

}