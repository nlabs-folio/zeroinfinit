import { Mixer }
from "./mixer.js";

import { Filter }
from "./filter.js";

import { Master }
from "./master.js";


import { Kick }
from "./kick.js";

import { Snare }
from "./snare.js";

import { Hat }
from "./hat.js";

import { Ride }
from "./ride.js";

import { Tom }
from "./tom.js";



export class Engine {


    constructor(){


        this.master =
        new Master();



        this.filter =
        new Filter();



        this.mixer =
        new Mixer();



        /*
            AUDIO CHAIN

            voices
              |
            mixer
              |
            filter
              |
            master
              |
            speakers

        */


        this.mixer.input.connect(
            this.filter.node
        );


        this.filter.node.connect(
            this.master.output
        );




        this.kick =
        new Kick(
            this.mixer.input
        );


        this.snare =
        new Snare(
            this.mixer.input
        );


        this.hat =
        new Hat(
            this.mixer.input
        );


        this.ride =
        new Ride(
            this.mixer.input
        );


        this.tom =
        new Tom(
            this.mixer.input
        );



    }



    trigger(
        name,
        velocity = 1
    ){


        if(
            this[name]
        ){

            this[name].trigger(
                velocity
            );

        }


    }
        setCutoff(value){

        this.filter.setCutoff(
            value
        );

    }



    setResonance(value){

        this.filter.setResonance(
            value
        );

    }



    setVolume(value){

        this.mixer.setVolume(
            value
        );

    }


}