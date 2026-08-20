import { context }
from "../context.js";


export class Filter {


    constructor(){

        this.node =
        context.createBiquadFilter();


        this.node.type =
        "lowpass";


        this.node.frequency.value =
        12000;


        this.node.Q.value =
        0.5;

    }


    setFrequency(value){

        this.node.frequency.setTargetAtTime(
            value,
            context.currentTime,
            0.01
        );

    }


    setResonance(value){

        this.node.Q.setTargetAtTime(
            value,
            context.currentTime,
            0.01
        );

    }


    connect(destination){

        this.node.connect(
            destination
        );

    }


}