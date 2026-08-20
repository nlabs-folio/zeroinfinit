import { context }
from "../context.js";


export function createOsc(
    type,
    frequency
){

    const osc =
    context.createOscillator();


    osc.type =
    type;


    osc.frequency.value =
    frequency;


    return osc;

}