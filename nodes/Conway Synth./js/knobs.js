export function createKnob(

    knob,

    input

) {


    if (!knob || !input)

        return;



    let dragging = false;

    let startY = 0;

    let startValue = 0;



    const min =

        Number(input.min || 0);



    const max =

        Number(input.max || 100);





    function update(value) {



        value = Math.max(

            min,

            Math.min(

                max,

                value

            )

        );



        input.value = value;



        input.dispatchEvent(

            new Event(

                "input",

                {

                    bubbles: true

                }

            )

        );





        const normalized =

            (value - min) /

            (max - min);





        const rotation =

            -135 +

            normalized * 270;



        knob.style.transform =

            `rotate(${rotation}deg)`;



    }









    knob.addEventListener(

        "pointerdown",

        e => {


            dragging = true;


            startY = e.clientY;


            startValue =

                Number(input.value);



            knob.setPointerCapture(

                e.pointerId

            );


        }

    );








    knob.addEventListener(

        "pointermove",

        e => {


            if (!dragging)

                return;



            const range =

                max - min;



            const sensitivity =

                range / 150;



            const delta =

                (startY - e.clientY)

                *

                sensitivity;



            update(

                startValue + delta

            );


        }

    );








    knob.addEventListener(

        "pointerup",

        e => {


            dragging = false;


            if (

                knob.hasPointerCapture(

                    e.pointerId

                )

            )

                knob.releasePointerCapture(

                    e.pointerId

                );


        }

    );








    knob.addEventListener(

        "dblclick",

        () => {


            update(

                (min + max) / 2

            );


        }

    );






    update(

        Number(input.value)

    );


}