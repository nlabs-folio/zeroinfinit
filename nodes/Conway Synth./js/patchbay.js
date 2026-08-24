/*
=====================================

CONWAY ORGANISM MODULAR RACK

PATCHBAY v1.0

Virtual CV routing

=====================================
*/


export class PatchBay {


    constructor() {


        this.routes = [];


    }





    connect(
        source,
        target,
        amount = 1
    ) {


        this.routes.push({

            source,

            target,

            amount


        });


    }






    process(signal, synth) {



        this.routes.forEach(
            route => {



                const value =

                    signal[route.source]

                    *

                    route.amount;



                if (
                    synth[route.target]
                ) {


                    synth[route.target](
                        value

                    );


                }



            }
        );


    }



}