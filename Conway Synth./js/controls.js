export class Controls {


    constructor(
        synth,
        organism,
        clock
    ) {


        this.synth = synth;

        this.organism = organism;

        this.clock = clock;


        this.bind();


    }





    bind() {



        this.control(
            "volume",
            v => this.synth.setVolume(v)
        );



        this.control(
            "cutoff",
            v => this.synth.setCutoff(v)
        );



        this.control(
            "attack",
            v => this.synth.setAttack(v)
        );



        this.control(
            "release",
            v => this.synth.setRelease(v)
        );





        this.control(
            "oscA",
            v => this.synth.oscA.setLevel(v)
        );




        this.control(
            "oscB",
            v => this.synth.oscB.setLevel(v)
        );






        this.control(
            "oscA-wave",
            v => this.synth.oscA.setWave(v)
        );



        this.control(
            "oscB-wave",
            v => this.synth.oscB.setWave(v)
        );







        const tempo =
            document.getElementById(
                "tempo"
            );



        if (tempo) {


            tempo.addEventListener(
                "input",
                e => {


                    const bpm =
                        Number(
                            e.target.value
                        );



                    this.clock.setBpm(bpm)



                }

            );



        }




    }









    control(id, callback) {



        const el =
            document.getElementById(id);



        if (!el)
            return;



        el.addEventListener(
            "input",
            e => {


                callback(
                    Number(e.target.value)
                );


            }
        );



        el.addEventListener(
            "change",
            e => {


                callback(
                    e.target.value
                );


            }
        );



    }



}