import { context }
from "./context.js";


export class Mixer {


    constructor(){


        this.input =
        context.createGain();


        this.input.gain.value =
        1;


    }



    setVolume(value){


        this.input.gain.value =
        value;


    }


}