// AUDIO

import { context }
from "./audio/context.js";

import { Engine }
from "./audio/engine.js";


// SEQUENCER

import { 
    pattern,
    clearPattern,
    randomPattern
}
from "./sequencer/pattern.js";

import { Sequencer }
from "./sequencer/sequencer.js";

import { Clock }
from "./sequencer/clock.js";

import { styles }
from "./sequencer/styles.js";

import {
    setSeed
}
from "./sequencer/random.js";


// UI

import { 
    createDrumGrid,
    highlightStep,
    refreshGrid
}
from "./ui/drumGrid.js";



// ENGINE

const engine =
new Engine();


window.engine = engine;



const sequencer =
new Sequencer(
    pattern
);



const clock =
new Clock(174);




// UI ELEMENTS

const bpmSlider =
document.querySelector("#bpm");


const bpmValue =
document.querySelector("#bpm-value");


const tap =
document.querySelector("#tap");


const grid =
document.querySelector("#drum-grid");


const start =
document.querySelector("#start");


const clear =
document.querySelector("#clear");


const random =
document.querySelector("#random");


// STYLE

const styleSelect =
document.querySelector("#style");


const seedInput =
document.querySelector("#seed");


const applySeed =
document.querySelector("#apply-seed");


// DNA PANEL

const dnaStyle =
document.querySelector("#dna-style");


const dnaSeed =
document.querySelector("#dna-seed");


const dnaEnergy =
document.querySelector("#dna-energy");




// CURRENT STYLE

let currentStyle =
styles.jungle;



// INITIAL DNA

if(dnaStyle){

    dnaStyle.textContent =
    currentStyle.name;

}


if(dnaEnergy){

    dnaEnergy.textContent =
    currentStyle.energy;

}




// STYLE SELECTOR

if(styleSelect){


    styleSelect.onchange = ()=>{


        currentStyle =
        styles[
            styleSelect.value
        ];



        if(dnaStyle){

            dnaStyle.textContent =
            currentStyle.name;

        }



        if(dnaEnergy){

            dnaEnergy.textContent =
            currentStyle.energy;

        }



        console.log(
            "STYLE:",
            currentStyle.name
        );


    };


}





// SEED

if(applySeed){


    applySeed.onclick = ()=>{


        const value =
        Number(
            seedInput.value
        );



        setSeed(
            value
        );



        if(dnaSeed){

            dnaSeed.textContent =
            value;

        }



        console.log(
            "SEED:",
            value
        );


    };


}




// TAP TEMPO

let taps = [];



if(tap){


tap.onclick = ()=>{


    const now =
    performance.now();


    taps.push(now);



    if(taps.length > 5){

        taps.shift();

    }



    if(taps.length >= 2){


        let total = 0;



        for(
            let i = 1;
            i < taps.length;
            i++
        ){

            total +=
            taps[i] - taps[i-1];

        }



        const average =
        total /
        (taps.length - 1);



        const bpm =
        Math.round(
            60000 / average
        );



        if(
            bpm >=40 &&
            bpm <=240
        ){


            clock.setBpm(
                bpm
            );



            if(bpmSlider)
                bpmSlider.value = bpm;


            if(bpmValue)
                bpmValue.textContent = bpm;


        }


    }


};


}





// BPM

if(bpmSlider){


bpmSlider.oninput = ()=>{


    const value =
    Number(
        bpmSlider.value
    );


    clock.setBpm(
        value
    );


    if(bpmValue){

        bpmValue.textContent =
        value;

    }


};


}





// GRID

createDrumGrid(
    grid,
    pattern
);






// PLAY / PAUSE

let playing = false;



if(start){


start.onclick = ()=>{


    if(
        context.state === "suspended"
    ){

        context.resume();

    }



    if(!playing){


        clock.start(()=>{


            const result =
            sequencer.next();



            if(!result){

                return;

            }



            highlightStep(
                result.step
            );



            result.events.forEach(
            event=>{


                if(!event){

                    return;

                }


                engine.trigger(
                    event.track,
                    event.velocity
                );


            });


        });



        playing = true;


        start.textContent =
        "PAUSE";


    }
    else{


        clock.stop();


        playing = false;


        start.textContent =
        "START";


    }


};


}





// CLEAR

if(clear){


clear.onclick = ()=>{


    clearPattern();


    refreshGrid(
        pattern
    );


};


}




// RANDOM

if(random){


random.onclick = ()=>{


    randomPattern(
        currentStyle
    );


    refreshGrid(
        pattern
    );


    console.log(
        "NEW GROOVE",
        currentStyle.name
    );


};


}






// KEYBOARD

document.addEventListener(
"keydown",
event=>{


    if(event.key==="1")
        engine.trigger("kick");


    if(event.key==="2")
        engine.trigger("snare");


    if(event.key==="3")
        engine.trigger("hat");


    if(event.key==="4")
        engine.trigger("ride");


    if(event.key==="5")
        engine.trigger("tom");


});