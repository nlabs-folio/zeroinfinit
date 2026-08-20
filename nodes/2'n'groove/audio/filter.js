import { context }
from "./context.js";


export class Filter {


    constructor(){


        this.node =
        context.createBiquadFilter();


        this.node.type =
        "lowpass";


        this.node.frequency.value =
        18000;


        this.node.Q.value =
        0.8;


    }



    setCutoff(value){


        this.node.frequency.value =
        value;


    }



    setResonance(value){


        this.node.Q.value =
        value;


    }


}