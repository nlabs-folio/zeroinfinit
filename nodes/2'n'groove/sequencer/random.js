let seed = 1;


export function setSeed(value){

    seed = value;

}



export function random(){


    seed =
    (seed * 9301 + 49297)
    %
    233280;


    return seed / 233280;


}