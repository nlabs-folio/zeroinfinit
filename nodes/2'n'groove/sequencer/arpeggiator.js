// ============================================================
// ARPEGGIATOR
// ============================================================

export class Arpeggiator {


    constructor(){

        this.notes =
        [];

        this.mode =
        "up";

        this.rate =
        1;

        this.octave =
        0;

        this.position =
        0;

    }


    setNotes(notes){

        this.notes =
        [...notes];

        this.position =
        0;

    }


    setMode(mode){

        this.mode =
        mode;

    }


    setRate(rate){

        this.rate =
        rate;

    }


    setOctave(octave){

        this.octave =
        octave;

    }


    next(){

        if(!this.notes.length){

            return null;

        }


        let index;


        if(this.mode === "random"){

            index =
            Math.floor(
                Math.random() *
                this.notes.length
            );

        }
        else{

            index =
            this.position %
            this.notes.length;

        }


        let note =
        this.notes[index];


        if(this.mode === "down"){

            index =
            this.notes.length -
            1 -
            (
                this.position %
                this.notes.length
            );

            note =
            this.notes[index];

        }


        if(this.mode === "updown"){

            const length =
            this.notes.length;

            const cycle =
            length * 2 - 2;


            let p =
            this.position %
            cycle;


            if(p >= length){

                p =
                cycle - p;

            }


            note =
            this.notes[p];

        }


        note +=
        this.octave * 12;


        this.position++;


        return note;

    }


    reset(){

        this.position =
        0;

    }

}