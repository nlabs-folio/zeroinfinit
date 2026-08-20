// ============================================================
// BASS SEQUENCER
// ============================================================

import { bassPatterns }
from "./bassPatterns.js";


export class BassSequencer {


    constructor(style = "jungle"){

        this.style =
        style;

        this.position =
        0;

    }


    setStyle(style){

        this.style =
        style;

    }


    next(step){

        const pattern =
        bassPatterns[
            this.style
        ] ||
        bassPatterns.jungle;


        return pattern.filter(
            event =>
                event.step === step
        );

    }


    reset(){

        this.position =
        0;

    }

}