// ============================================================
// ENGINE
// 2'N'B GROOVE
// ============================================================

import { Mixer }
from "./mixer.js";

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

import { Pad }
from "./pad.js";

import { Lead }
from "./lead.js";

import { Filter }
from "./effects/filter.js";

import { Delay }
from "./effects/delay.js";

import { Reverb }
from "./effects/reverb.js";


// ============================================================
// ENGINE
// ============================================================

export class Engine {


    constructor(){


        // ----------------------------------------------------
        // MASTER
        // ----------------------------------------------------

        this.master =
        new Master();


        // ----------------------------------------------------
        // MIXER
        // ----------------------------------------------------

        this.mixer =
        new Mixer();


        // ----------------------------------------------------
        // EFFECTS
        // ----------------------------------------------------

        this.filter =
        new Filter();


        this.delay =
        new Delay();


        this.reverb =
        new Reverb();


        // ----------------------------------------------------
        // AUDIO CHAIN
        //
        // voices
        //    ↓
        // mixer
        //    ↓
        // filter
        //    ↓
        // delay
        //    ↓
        // reverb
        //    ↓
        // master
        //    ↓
        // speakers
        // ----------------------------------------------------

        this.mixer.input.connect(
            this.filter.node
        );


        this.filter.connect(
            this.delay.input
        );


        this.delay.connect(
            this.reverb.input
        );


        this.reverb.connect(
            this.master.output
        );


        // ----------------------------------------------------
        // DRUMS
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // MUSICAL VOICES
        // ----------------------------------------------------

        this.pad =
        new Pad(
            this.mixer.input
        );


        this.lead =
        new Lead(
            this.mixer.input
        );

    }



    // ========================================================
    // GENERIC TRIGGER
    // ========================================================

    trigger(
        name,
        velocity = 1
    ){

        if(
            this[name] &&
            typeof this[name].trigger ===
            "function"
        ){

            this[name].trigger(
                velocity
            );

        }

    }



    // ========================================================
    // FILTER
    // ========================================================

    setCutoff(value){

        this.filter.setFrequency(
            value
        );

    }


    setResonance(value){

        this.filter.setResonance(
            value
        );

    }



    // ========================================================
    // DELAY
    // ========================================================

    setDelayTime(value){

        this.delay.setTime(
            value
        );

    }


    setDelayFeedback(value){

        this.delay.setFeedback(
            value
        );

    }


    setDelayMix(value){

        this.delay.setMix(
            value
        );

    }



    // ========================================================
    // REVERB
    // ========================================================

    setReverbMix(value){

        this.reverb.setMix(
            value
        );

    }



    // ========================================================
    // VOLUME
    // ========================================================

    setVolume(value){

        this.mixer.setVolume(
            value
        );

    }

}