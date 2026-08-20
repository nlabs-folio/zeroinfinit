import { context }
from "../context.js";


export function createNoise(){


    const buffer =
    context.createBuffer(
        1,
        context.sampleRate,
        context.sampleRate
    );


    const data =
    buffer.getChannelData(0);



    for(
        let i = 0;
        i < data.length;
        i++
    ){

        data[i] =
        Math.random() * 2 - 1;

    }



    const noise =
    context.createBufferSource();


    noise.buffer =
    buffer;


    return noise;

}