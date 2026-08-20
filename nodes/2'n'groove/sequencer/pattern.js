export const tracks = [

    "kick",
    "snare",
    "hat",
    "ride",
    "tom"

];



export const pattern = {


    kick:
    Array(16).fill(0),


    snare:
    Array(16).fill(0),


    hat:
    Array(16).fill(0),


    ride:
    Array(16).fill(0),


    tom:
    Array(16).fill(0)


};



export function clearPattern(){


    tracks.forEach(track=>{


        pattern[track] =
        Array(16).fill(0);


    });


}



export function randomPattern(style){


    tracks.forEach(track=>{

        pattern[track] =
        Array(16).fill(0);

    });



    // KICK

    for(let i=0;i<16;i++){


        if(
            Math.random()
            <
            style.kickDensity
        ){


            pattern.kick[i] =
            Math.random()>0.85
            ?
            2
            :
            1;


        }


    }




    // SNARE

    pattern.snare[4]=1;
    pattern.snare[12]=1;



    if(
        Math.random()
        <
        style.snareVariation
    ){

        pattern.snare[10]=1;

    }



    if(
        Math.random()
        <
        style.snareVariation
    ){

        pattern.snare[14]=1;

    }





    // HATS

    for(let i=0;i<16;i++){


        if(
            Math.random()
            <
            style.hatDensity
        ){


            pattern.hat[i] =
            Math.random()>0.8
            ?
            2
            :
            1;


        }


    }





    // RIDE

    if(
        Math.random()
        <
        style.rideChance
    ){


        pattern.ride[0]=1;

        pattern.ride[8]=1;


    }




    // TOM

    for(let i=0;i<16;i++){


        if(
            Math.random()
            <
            style.tomDensity
        ){

            pattern.tom[i]=1;

        }


    }


}