// ============================================================
// 2'N'B GROOVE
// MAIN
// ============================================================


// ============================================================
// AUDIO
// ============================================================

import { context }
from "./audio/context.js";

import { Engine }
from "./audio/engine.js";


// ============================================================
// SEQUENCER
// ============================================================

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

import { BassSequencer }
from "./sequencer/bass/bassSequencer.js";

import { ChordEngine }
from "./sequencer/chords.js";

import { Arpeggiator }
from "./sequencer/arpeggiator.js";


// ============================================================
// UI
// ============================================================

import {
    createDrumGrid,
    highlightStep,
    refreshGrid
}
from "./ui/drumGrid.js";

import {
    createTouchPad,
    setTouchMode
}
from "./ui/touchPad.js";


// ============================================================
// ENGINE
// ============================================================

const engine =
new Engine();

window.engine =
engine;


// ============================================================
// SEQUENCERS
// ============================================================

const sequencer =
new Sequencer(
    pattern
);


const bassSequencer =
new BassSequencer(
    "jungle"
);


const chordEngine =
new ChordEngine();


const arpeggiator =
new Arpeggiator();


const clock =
new Clock(174);


// ============================================================
// UI ELEMENTS
// ============================================================

const bpmSlider =
document.querySelector("#bpm");


const bpmValue =
document.querySelector("#bpm-value");


const tap =
document.querySelector("#tap");


const grid =
document.querySelector("#drum-grid");


const startButton =
document.querySelector("#start");


const clearButton =
document.querySelector("#clear");


const randomButton =
document.querySelector("#random");


const styleSelect =
document.querySelector("#style");


const dnaStyle =
document.querySelector("#dna-style");


const dnaEnergy =
document.querySelector("#dna-energy");


const touchPad =
document.querySelector("#dfield");


const touchModes =
document.querySelectorAll(
    ".touch-mode-button"
);


// ============================================================
// CURRENT STYLE
// ============================================================

let currentStyle =
styles.jungle;


// ============================================================
// STYLE
// ============================================================

function updateStyle(){

    if(dnaStyle){

        dnaStyle.textContent =
        currentStyle.name;

    }


    if(dnaEnergy){

        dnaEnergy.textContent =
        currentStyle.energy;

    }


    // Compatible amb BassSequencer
    // amb o sense setStyle().

    if(
        bassSequencer &&
        typeof bassSequencer.setStyle ===
        "function"
    ){

        bassSequencer.setStyle(
            styleSelect
                ? styleSelect.value
                : "jungle"
        );

    }

}


updateStyle();


if(styleSelect){

    styleSelect.onchange = ()=>{

        currentStyle =
        styles[
            styleSelect.value
        ] ||
        styles.jungle;


        updateStyle();


        console.log(
            "STYLE:",
            currentStyle.name
        );

    };

}


// ============================================================
// DRUM GRID
// ============================================================

if(grid){

    createDrumGrid(
        grid,
        pattern
    );

}


// ============================================================
// TOUCH PAD
// ============================================================

if(touchPad){

    createTouchPad(
        touchPad,
        gesture=>{

            const x =
            gesture.x;


            const y =
            gesture.y;


            // ------------------------------------------------
            // FILTER
            // ------------------------------------------------

            if(
                gesture.mode ===
                "filter"
            ){

                const cutoff =
                200 +
                x * 10000;


                const resonance =
                y * 18;


                if(engine.filter){

                    engine.filter.setFrequency(
                        cutoff
                    );


                    engine.filter.setResonance(
                        resonance
                    );

                }


                if(engine.pad){

                    engine.pad.setCutoff(
                        cutoff
                    );

                }


                if(engine.lead){

                    engine.lead.setCutoff(
                        cutoff
                    );

                }

            }


            // ------------------------------------------------
            // DELAY
            // ------------------------------------------------

            if(
                gesture.mode ===
                "delay"
            ){

                if(engine.delay){

                    engine.delay.setTime(
                        0.05 +
                        x * 0.45
                    );


                    engine.delay.setFeedback(
                        y * 0.7
                    );

                }

            }


            // ------------------------------------------------
            // ARPEGGIATOR
            // ------------------------------------------------

            if(
                gesture.mode ===
                "arp"
            ){

                const rates = [
                    1,
                    2,
                    4
                ];


                const rateIndex =
                Math.min(
                    2,
                    Math.floor(
                        x * 3
                    )
                );


                arpeggiator.setRate(
                    rates[rateIndex]
                );


                const octave =
                Math.floor(
                    y * 3
                );


                arpeggiator.setOctave(
                    octave
                );

            }

        }
    );

}


// ============================================================
// TOUCH MODES
// ============================================================

touchModes.forEach(
button=>{

    button.onclick = ()=>{

        touchModes.forEach(
        item=>{

            item.classList.remove(
                "active"
            );

        });


        button.classList.add(
            "active"
        );


        setTouchMode(
            button.dataset.mode
        );

    };

});


// ============================================================
// TAP TEMPO
// ============================================================

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
                taps[i] -
                taps[i - 1];

            }


            const average =
            total /
            (taps.length - 1);


            const bpm =
            Math.round(
                60000 /
                average
            );


            if(
                bpm >= 40 &&
                bpm <= 240
            ){

                clock.setBpm(
                    bpm
                );


                if(bpmSlider){

                    bpmSlider.value =
                    bpm;

                }


                if(bpmValue){

                    bpmValue.textContent =
                    bpm;

                }

            }

        }

    };

}


// ============================================================
// BPM
// ============================================================

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


// ============================================================
// PLAY / PAUSE
// ============================================================

let playing =
false;


if(startButton){

    startButton.onclick = async ()=>{

        // Web Audio necessita una interacció
        // de l'usuari per activar el context.

        if(
            context.state ===
            "suspended"
        ){

            await context.resume();

        }


        // ----------------------------------------------------
        // PLAY
        // ----------------------------------------------------

        if(!playing){

            clock.start(()=>{

                const result =
                sequencer.next();


                if(!result){

                    return;

                }


                // --------------------------------------------
                // VISUAL STEP
                // --------------------------------------------

                highlightStep(
                    result.step
                );


                // --------------------------------------------
                // DRUMS
                // --------------------------------------------

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


                // --------------------------------------------
                // BASS
                // --------------------------------------------

                const bassEvents =
                bassSequencer.next(
                    result.step
                );


                bassEvents.forEach(
                event=>{

                    if(
                        engine.bass
                    ){

                        engine.bass.trigger(
                            event.velocity,
                            event.note
                        );

                    }

                });


                // --------------------------------------------
                // HARMONY
                // --------------------------------------------

                if(
                    result.step %
                    16 ===
                    0
                ){

                    const style =
                    styleSelect
                        ? styleSelect.value
                        : "jungle";


                    const chord =
                    chordEngine.getChord(
                        style,
                        Math.floor(
                            result.step / 16
                        )
                    );


                    // PAD

                    if(engine.pad){

                        engine.pad.trigger(
                            chord,
                            1
                        );

                    }


                    // ARPEGGIATOR

                    arpeggiator.setNotes(
                        chord
                    );


                    arpeggiator.reset();

                }


                // --------------------------------------------
                // ARPEGGIATOR / LEAD
                // --------------------------------------------

                if(
                    result.step %
                    2 ===
                    0
                ){

                    const note =
                    arpeggiator.next();


                    if(
                        note &&
                        engine.lead
                    ){

                        engine.lead.trigger(
                            note,
                            0.7
                        );

                    }

                }

            });


            playing =
            true;


            startButton.textContent =
            "PAUSE";

        }


        // ----------------------------------------------------
        // PAUSE
        // ----------------------------------------------------

        else{

            clock.stop();


            playing =
            false;


            startButton.textContent =
            "START";

        }

    };

}


// ============================================================
// CLEAR
// ============================================================

if(clearButton){

    clearButton.onclick = ()=>{

        clearPattern();


        refreshGrid(
            pattern
        );

    };

}


// ============================================================
// RANDOM
// ============================================================

if(randomButton){

    randomButton.onclick = ()=>{

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


// ============================================================
// KEYBOARD
// ============================================================

document.addEventListener(
    "keydown",
    event=>{

        if(event.repeat){

            return;

        }


        // ----------------------------------------------------
        // DRUMS
        // ----------------------------------------------------

        if(event.key === "1"){

            engine.trigger(
                "kick"
            );

        }


        if(event.key === "2"){

            engine.trigger(
                "snare"
            );

        }


        if(event.key === "3"){

            engine.trigger(
                "hat"
            );

        }


        if(event.key === "4"){

            engine.trigger(
                "ride"
            );

        }


        if(event.key === "5"){

            engine.trigger(
                "tom"
            );

        }


        // ----------------------------------------------------
        // BASS
        // ----------------------------------------------------

        if(event.key === "6"){

            if(engine.bass){

                engine.bass.trigger(
                    0.8,
                    43
                );

            }

        }


        // ----------------------------------------------------
        // PAD
        // ----------------------------------------------------

        if(event.key === "7"){

            if(engine.pad){

                engine.pad.trigger();

            }

        }


        // ----------------------------------------------------
        // LEAD
        // ----------------------------------------------------

        if(event.key === "8"){

            if(engine.lead){

                engine.lead.trigger(
                    220
                );

            }

        }

    }
);


// ============================================================
// NODE API
// ============================================================

export function start(){

    console.log(
        "Node2 iniciat"
    );

}


export function stop(){

    if(playing){

        clock.stop();


        playing =
        false;


        if(startButton){

            startButton.textContent =
            "START";

        }

    }


    console.log(
        "Node2 finalitzat"
    );

}