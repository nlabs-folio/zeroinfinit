export class Clock {


    constructor(
        bpm = 174
    ){

        this.bpm = bpm;

        this.interval = null;

        this.callback = null;

        this.stepTime = null;

        this.swing = 0;
        
        this.tick = 0;

    }

start(callback){


    if(this.interval){
        return;
    }


    this.callback =
    callback;

const run = ()=>{


    if(this.callback){

        this.callback();

    }


    this.tick++;


    this.interval =
    setTimeout(
        run,
        this.getCurrentStepTime()
    );


};


run();

    


}

setSwing(value){

    this.swing = value;

}

getStepTime(){


    return (
        (60 / this.bpm) / 4
    ) * 1000;


}
getCurrentStepTime(){

    const base =
    this.getStepTime();


    if(this.tick % 2 === 1){

        return (
            base +
            (base * this.swing)
        );

    }


    return base;

}

   



stop(){


    if(this.interval){


        clearInterval(
            this.interval
        );


    }


    this.interval = null;
    
    this.tick = 0;


}
setBpm(value){


    this.bpm =
    value;



    if(this.interval){


        clearInterval(
            this.interval
        );


        this.interval =
        setInterval(()=>{


            if(this.callback){

                this.callback();

            }


        },
        this.getStepTime()
        );


     }
   } 

}