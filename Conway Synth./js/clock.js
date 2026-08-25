export class Clock {


    constructor() {


        this.bpm = 90;

        this.timer = null;

        this.callback = null;


    }




    start() {


        if (this.timer)
            return;



        const interval =
            60000 / this.bpm;



        this.timer =
            setInterval(() => {


                if (this.callback)

                    this.callback();


            }, interval);



    }





    stop() {


        clearInterval(
            this.timer
        );


        this.timer = null;


    }





    setBpm(value) {


        this.bpm = value;


        if (this.timer) {


            this.stop();

            this.start();


        }


    }





    onTick(callback) {


        this.callback = callback;


    }



}