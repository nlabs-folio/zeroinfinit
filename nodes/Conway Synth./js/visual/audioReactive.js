export class AudioReactive {


    constructor(synth){

        this.synth = synth;

    }



    connect(ctx, canvas){

        this.ctx = ctx;
        this.canvas = canvas;

        this.loop();

    }




    loop(){

        requestAnimationFrame(
            () => this.loop()
        );


        const data =
            this.synth.getSpectrum();


        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        const barWidth =
            this.canvas.width /
            data.length;


        for(
            let i = 0;
            i < data.length;
            i++
        ){

            const value =
                data[i] / 255;


            const height =
                value *
                this.canvas.height;


            this.ctx.fillStyle =
                "#ff9fd8";


            this.ctx.fillRect(
                i * barWidth,
                this.canvas.height - height,
                barWidth,
                height
            );

        }


    }


}