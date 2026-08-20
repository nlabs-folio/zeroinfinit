import { tracks }
from "../sequencer/pattern.js";


let stepButtons = [];



export function createDrumGrid(
    container,
    pattern
){


    container.innerHTML = "";

    stepButtons = [];



    tracks.forEach(track=>{


        const row =
        document.createElement(
            "div"
        );


        row.className =
        "drum-row";



        const label =
        document.createElement(
            "span"
        );


        label.textContent =
        track;


        row.appendChild(label);



        const buttons = [];



        pattern[track].forEach(
        (active,index)=>{


            const step =
            document.createElement(
                "button"
            );


            step.className =
            "step";



            if(active === 1){

                step.classList.add(
                    "active"
                );

            }


            if(active === 2){

                step.classList.add(
                    "accent"
                );

            }



            step.onclick = ()=>{


                let value =
                pattern[track][index];



                let next =
                value + 1;



                if(next > 2){

                    next = 0;

                }



                pattern[track][index] =
                next;



                step.classList.remove(
                    "active",
                    "accent"
                );



                if(next === 1){

                    step.classList.add(
                        "active"
                    );

                }



                if(next === 2){

                    step.classList.add(
                        "accent"
                    );

                }


            };



            row.appendChild(step);

            buttons.push(step);


        });



        stepButtons.push(buttons);


        container.appendChild(row);


    });


}



export function highlightStep(index){


    stepButtons.forEach(row=>{


        row.forEach(
        (button,step)=>{


            button.classList.toggle(
                "playing",
                step === index
            );


        });


    });


}



export function refreshGrid(
    pattern
){


    stepButtons.forEach(
    (row,rowIndex)=>{


        const track =
        tracks[rowIndex];



        row.forEach(
        (button,index)=>{


            button.classList.remove(
                "active",
                "accent"
            );



            if(pattern[track][index] === 1){

                button.classList.add(
                    "active"
                );

            }



            if(pattern[track][index] === 2){

                button.classList.add(
                    "accent"
                );

            }


        });


    });


}