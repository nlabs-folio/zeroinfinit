import { context }
from "./context.js";


export class Master{

    constructor(){

        this.output =
        context.createGain();

        this.output.gain.value = 0.9;

        this.output.connect(
            context.destination
        );

    }

}