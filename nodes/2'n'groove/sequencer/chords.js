// ============================================================
// CHORDS
// Harmonia simple per a 2'N'B Groove
// ============================================================

const NOTE_NAMES = {

    C: 0,
    Cs: 1,
    D: 2,
    Ds: 3,
    E: 4,
    F: 5,
    Fs: 6,
    G: 7,
    Gs: 8,
    A: 9,
    As: 10,
    B: 11

};


const CHORDS = {

    minor: [0, 3, 7],

    minor7: [0, 3, 7, 10],

    major: [0, 4, 7],

    major7: [0, 4, 7, 11],

    sus2: [0, 2, 7],

    sus4: [0, 5, 7]

};


export class ChordEngine {


    constructor(){

        this.root =
        45;

        this.type =
        "minor";

        this.progressions = {

            jungle: [
                0,
                3,
                5,
                2
            ],

            liquid: [
                0,
                5,
                3,
                4
            ],

            intelligentDnB: [
                0,
                3,
                6,
                5
            ],

            neuro: [
                0,
                1,
                3,
                2
            ],

            atmospheric: [
                0,
                5,
                3,
                7
            ]

        };

    }


    setRoot(note){

        this.root =
        note;

    }


    getChord(style, index){

        const progression =
        this.progressions[
            style
        ] ||
        this.progressions.jungle;


        const degree =
        progression[
            index %
            progression.length
        ];


        const root =
        this.root +
        degree;


        return CHORDS[this.type].map(
            interval =>
                root + interval
        );

    }


}