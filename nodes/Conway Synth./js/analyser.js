/*
=====================================

CONWAY ORGANISM MODULAR RACK

AUDIO ANALYZER

=====================================
*/


export class AudioAnalyzer {



    constructor(audio) {



        this.audio = audio;



        this.node =

            this.audio.createAnalyser();



        this.node.fftSize = 2048;



        this.buffer =

            new Uint8Array(

                this.node.frequencyBinCount

            );



    }






    connect(source) {



        source.connect(

            this.node

        );


    }






    draw(ctx, canvas) {



        requestAnimationFrame(

            () => this.draw(ctx, canvas)

        );



        this.node.getByteFrequencyData(

            this.buffer

        );





        ctx.clearRect(

            0,

            0,

            canvas.width,

            canvas.height

        );





        const barWidth =

            canvas.width /

            this.buffer.length;





        for (

            let i = 0;

            i < this.buffer.length;

            i++

        ) {



            const value =

                this.buffer[i];



            const height =

                (

                    value /

                    255

                )

                *

                canvas.height;





            ctx.fillStyle =

                "#ff9fd8";



            ctx.fillRect(

                i * barWidth,

                canvas.height - height,

                barWidth,

                height

            );



        }



    }



}