import { tracks }
from "./pattern.js";

import { styles }
from "./styles.js";

export class Sequencer {


    constructor(pattern){

        this.pattern = pattern;

        this.index = 0;


        this.probability = {

            kick:1,
            snare:1,
            hat:0.85,
            ride:0.75,
            tom:0.65

        };

    }



    reset(){

        this.index = 0;

    }



    next(){


        const events = [];



        tracks.forEach(track=>{


            const value =
            this.pattern[track][this.index];



            if(value){


                const chance =
                this.probability[track] ?? 1;



                if(
                    Math.random() <= chance
                ){


                    events.push({

                        track,

                        velocity:
                        value === 2
                        ?
                        1
                        :
                        0.45,


                        accent:
                        value === 2

                    });


                }


            }


        });



        const step =
        this.index;



        this.index++;



        if(
            this.index >= 16
        ){

            this.index = 0;

        }



        return {

            step,

            events

        };


    }


}