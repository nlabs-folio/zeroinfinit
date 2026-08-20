let pad = null;

let active = false;

let mode = "filter";

let callback = null;


export function createTouchPad(
    container,
    onGesture
){

    pad =
    container;

    callback =
    onGesture;


    if(!pad){

        return;

    }


    const point =
    pad.querySelector(
        ".touch-point"
    );


    const update =
    event=>{

        const rect =
        pad.getBoundingClientRect();


        const x =
        Math.max(
            0,
            Math.min(
                1,
                (event.clientX - rect.left)
                / rect.width
            )
        );


        const y =
        Math.max(
            0,
            Math.min(
                1,
                (event.clientY - rect.top)
                / rect.height
            )
        );


        if(point){

            point.style.left =
            `${x * 100}%`;

            point.style.top =
            `${y * 100}%`;

        }


        if(callback){

            callback({

                x,
                y,
                mode

            });

        }

    };


    pad.addEventListener(
        "pointerdown",
        event=>{

            active =
            true;

            pad.setPointerCapture(
                event.pointerId
            );

            update(event);

        }
    );


    pad.addEventListener(
        "pointermove",
        event=>{

            if(active){

                update(event);

            }

        }
    );


    pad.addEventListener(
        "pointerup",
        ()=>{

            active =
            false;

        }
    );


    pad.addEventListener(
        "pointercancel",
        ()=>{

            active =
            false;

        }
    );

}


export function setTouchMode(
    newMode
){

    mode =
    newMode;

}