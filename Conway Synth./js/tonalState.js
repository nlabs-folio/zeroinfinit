// =========================================================
// CONWAY ORGANISM
// TONAL STATE
//
// Identitat musical de l'organisme.
//
// Conway no tria notes a l'atzar.
// La seva activitat determina:
//   - moviment
//   - tensió
//   - registre
//   - salts
//   - respiració
//
// No hi ha C privilegiat.
// Dòric té menys presència.
// =========================================================


export class TonalState {

    constructor() {

        // =================================================
        // ROOTS
        // =================================================

        this.roots = [

            { name: "C",  midi: 60 },
            { name: "C#", midi: 61 },
            { name: "D",  midi: 62 },
            { name: "D#", midi: 63 },
            { name: "E",  midi: 64 },
            { name: "F",  midi: 65 },
            { name: "F#", midi: 66 },
            { name: "G",  midi: 67 },
            { name: "G#", midi: 68 },
            { name: "A",  midi: 69 },
            { name: "A#", midi: 70 },
            { name: "B",  midi: 71 }

        ];


        // =================================================
        // MODES
        // =================================================

        this.modes = [

            {
                name: "major",
                weight: 1.35,
                intervals:
                    [0, 2, 4, 5, 7, 9, 11]
            },

            {
                name: "minor",
                weight: 1.35,
                intervals:
                    [0, 2, 3, 5, 7, 8, 10]
            },

            {
                name: "mixolydian",
                weight: 1.20,
                intervals:
                    [0, 2, 4, 5, 7, 9, 10]
            },

            {
                name: "lydian",
                weight: 1.00,
                intervals:
                    [0, 2, 4, 6, 7, 9, 11]
            },

            {
                name: "phrygian",
                weight: 0.90,
                intervals:
                    [0, 1, 3, 5, 7, 8, 10]
            },

            {
                name: "pentatonicMajor",
                weight: 1.10,
                intervals:
                    [0, 2, 4, 7, 9]
            },

            {
                name: "pentatonicMinor",
                weight: 1.10,
                intervals:
                    [0, 3, 5, 7, 10]
            },

            {
                name: "dorian",
                weight: 0.55,
                intervals:
                    [0, 2, 3, 5, 7, 9, 10]
            },

            {
                name: "locrian",
                weight: 0.35,
                intervals:
                    [0, 1, 3, 5, 6, 8, 10]
            }

        ];


        // =================================================
        // IDENTITAT
        // =================================================

        const root =
            this.randomRoot();

        const mode =
            this.randomMode();


        this.current = {

            root:
                root.name,

            rootMidi:
                root.midi,

            mode:
                mode.name,

            scale:
                [...mode.intervals]
        };


        this.previous = {

            ...this.current,

            scale:
                [...this.current.scale]
        };


        // =================================================
        // MEMÒRIA MELÒDICA
        // =================================================

        this.lastNoteIndex =
            undefined;

        this.lastMidi =
            this.current.rootMidi + 12;

        this.previousMidi =
            this.lastMidi;


        /*
         * Direcció melòdica.
         *
         * -1 = baixant
         *  1 = pujant
         */

        this.direction =
            Math.random() < 0.5
                ? -1
                : 1;


        /*
         * Fraseig.
         *
         * Després d'un salt gran,
         * l'organisme tendeix a respirar
         * i tornar cap al centre.
         */

        this.phraseEnergy = 0;


        // =================================================
        // INÈRCIA TONAL
        // =================================================

        this.stability = 1;

        this.tension = 0;

        this.changePressure = 0;

        this.cooldown = 0;

        this.minChangeInterval = 8;
    }


    // =====================================================
    // RANDOM ROOT
    // =====================================================

    randomRoot() {

        return this.roots[
            Math.floor(
                Math.random() *
                this.roots.length
            )
        ];
    }


    // =====================================================
    // RANDOM MODE
    // =====================================================

    randomMode() {

        const total =
            this.modes.reduce(
                (sum, mode) =>
                    sum + mode.weight,
                0
            );


        let random =
            Math.random() * total;


        for (const mode of this.modes) {

            random -= mode.weight;

            if (random <= 0) {
                return mode;
            }
        }

        return this.modes[0];
    }


    randomDifferentMode() {

        const available =
            this.modes.filter(
                mode =>
                    mode.name !==
                    this.current.mode
            );


        const total =
            available.reduce(
                (sum, mode) =>
                    sum + mode.weight,
                0
            );


        let random =
            Math.random() * total;


        for (const mode of available) {

            random -= mode.weight;

            if (random <= 0) {
                return mode;
            }
        }

        return available[0];
    }


    // =====================================================
    // UPDATE
    // =====================================================

    update(data) {

        if (!data) {
            return this.current;
        }


        if (this.cooldown > 0) {
            this.cooldown--;
        }


        const movement =
            this.clamp(
                data.movement
            );


        const activity =
            this.clamp(
                data.activity
            );


        const density =
            this.clamp(
                data.density
            );


        /*
         * -------------------------------------------------
         * PRESSIÓ DE CANVI
         * -------------------------------------------------
         */

        const instability =

            movement * 0.55 +

            activity * 0.35 +

            Math.abs(
                density - 0.5
            ) * 0.10;


        this.changePressure =

            this.changePressure * 0.82 +

            instability * 0.18;


        this.stability =
            Math.max(
                0,
                1 - this.changePressure
            );


        this.tension =
            this.changePressure;


        /*
         * -------------------------------------------------
         * MUTACIÓ TONAL
         * -------------------------------------------------
         */

        if (
            this.cooldown === 0 &&
            this.changePressure > 0.48
        ) {

            this.mutate();
        }


        /*
         * -------------------------------------------------
         * FRASEIG
         * -------------------------------------------------
         */

        this.phraseEnergy *= 0.82;


        return this.current;
    }


    // =====================================================
    // MUTATION
    // =====================================================

    mutate() {

        this.previous = {

            ...this.current,

            scale:
                [...this.current.scale]
        };


        const roll =
            Math.random();


        if (roll < 0.56) {

            const mode =
                this.randomDifferentMode();


            this.current.mode =
                mode.name;

            this.current.scale =
                [...mode.intervals];

        }

        else if (roll < 0.85) {

            let root =
                this.randomRoot();


            while (
                root.name ===
                this.current.root
            ) {

                root =
                    this.randomRoot();
            }


            this.current.root =
                root.name;

            this.current.rootMidi =
                root.midi;

        }

        else {

            const root =
                this.randomRoot();

            const mode =
                this.randomDifferentMode();


            this.current.root =
                root.name;

            this.current.rootMidi =
                root.midi;

            this.current.mode =
                mode.name;

            this.current.scale =
                [...mode.intervals];
        }


        this.lastNoteIndex =
            undefined;


        this.cooldown =
            this.minChangeInterval;


        this.changePressure *=
            0.35;
    }


    // =====================================================
    // NOTE FROM DATA
    //
    // Aquí es construeix realment la frase.
    // =====================================================

    noteFromData(data) {

        if (!data) {
            return this.lastMidi;
        }


        const population =
            Math.max(
                0,
                Number(data.population) || 0
            );


        const movement =
            this.clamp(
                data.movement
            );


        const activity =
            this.clamp(
                data.activity
            );


        const density =
            this.clamp(
                data.density
            );


        const scale =
            this.current.scale;


        if (!scale.length) {
            return this.current.rootMidi + 12;
        }


        // =================================================
        // PRIMERA NOTA
        // =================================================

        if (
            this.lastNoteIndex ===
            undefined
        ) {

            /*
             * No comencem obligatòriament
             * en la tònica.
             *
             * Però evitem també sortir
             * disparats a l'extrem.
             */

            const safeMax =
                Math.max(
                    0,
                    scale.length - 1
                );


            this.lastNoteIndex =
                Math.floor(
                    Math.random() *
                    (safeMax + 1)
                );


            const octave =
                1;


            this.lastMidi =

                this.current.rootMidi +

                scale[
                    this.lastNoteIndex
                ] +

                octave * 12;


            return this.lastMidi;
        }


        // =================================================
        // CENTRE MELÒDIC
        // =================================================

        const populationPhase =

            (
                Math.sin(
                    population * 0.37
                ) + 1
            ) * 0.5;


        const centre =

            populationPhase *
            (scale.length - 1);


        // =================================================
        // MOVIMENT
        // =================================================

        const range =

            movement < 0.20
                ? 1
                : movement < 0.45
                    ? 2
                    : movement < 0.70
                        ? 3
                        : scale.length - 1;


        /*
         * Activitat baixa:
         * moviment conjunt i petit.
         *
         * Activitat alta:
         * permet més llibertat.
         */

        let maxStep =

            Math.max(
                1,
                Math.round(
                    range *
                    (
                        0.55 +
                        activity * 0.45
                    )
                )
            );


        maxStep =
            Math.min(
                maxStep,
                scale.length - 1
            );


        // =================================================
        // DIRECCIÓ
        // =================================================

        /*
         * Canviar de direcció no és completament aleatori.
         * Quan arribem lluny del centre, tendim a tornar.
         */

        const distanceFromCentre =

            this.lastNoteIndex -
            centre;


        if (
            Math.abs(distanceFromCentre) >
            scale.length * 0.32
        ) {

            this.direction =
                distanceFromCentre > 0
                    ? -1
                    : 1;

        }

        else if (
            Math.random() <
            0.20 + movement * 0.20
        ) {

            this.direction *= -1;
        }


        // =================================================
        // SALT GRAN
        // =================================================

        /*
         * Només apareix amb activitat real.
         */

        const extremeJump =

            activity > 0.78 &&

            movement > 0.55 &&

            Math.random() < 0.08;


        let targetIndex;


        if (extremeJump) {

            targetIndex =
                Math.floor(
                    Math.random() *
                    scale.length
                );


            this.phraseEnergy = 1;
        }

        else {

            /*
             * Moviment melòdic proper.
             */

            let step =
                1 +
                Math.floor(
                    Math.random() *
                    maxStep
                );


            /*
             * Amb activitat baixa,
             * preferim graus conjunts.
             */

            if (
                activity < 0.35 &&
                Math.random() < 0.65
            ) {

                step = 1;
            }


            targetIndex =

                this.lastNoteIndex +

                this.direction *
                step;
        }


        // =================================================
        // TORNAR CAP AL CENTRE
        // =================================================

        /*
         * Si ens allunyem massa,
         * la probabilitat de tornar augmenta.
         */

        if (!extremeJump) {

            const newDistance =

                targetIndex -
                centre;


            if (
                Math.abs(newDistance) >
                scale.length * 0.42
            ) {

                targetIndex =

                    Math.round(
                        (
                            targetIndex +
                            centre
                        ) * 0.5
                    );
            }
        }


        // =================================================
        // WRAP
        // =================================================

        targetIndex =

            (
                targetIndex %
                scale.length +
                scale.length
            ) %
            scale.length;


        // =================================================
        // EVITAR REPETICIÓ
        // =================================================

        if (
            targetIndex ===
            this.lastNoteIndex
        ) {

            targetIndex =

                (
                    targetIndex +
                    this.direction +
                    scale.length
                ) %
                scale.length;
        }


        this.lastNoteIndex =
            targetIndex;


        // =================================================
        // REGISTRE
        // =================================================

        /*
         * El registre és principalment mitjà.
         *
         * 0 → greu
         * 1 → centre
         * 2 → centre/agud
         * 3 → agut
         *
         * Els extrems necessiten activitat.
         */

        let octave;


        if (activity < 0.30) {

            octave =
                density < 0.30
                    ? 0
                    : 1;

        }

        else if (activity < 0.60) {

            octave =
                movement > 0.55
                    ? 2
                    : 1;

        }

        else {

            octave =

                movement > 0.65
                    ? 2 +
                      (
                        Math.random() < 0.14
                            ? 1
                            : 0
                      )
                    : 1;
        }


        /*
         * Un organisme dens però poc mòbil
         * tendeix a quedar-se al cos greu/mitjà.
         */

        if (
            density > 0.72 &&
            movement < 0.30
        ) {

            octave =
                Math.min(
                    octave,
                    1
                );
        }


        // =================================================
        // REGISTRE FINAL
        // =================================================

        let midi =

            this.current.rootMidi +

            scale[targetIndex] +

            octave * 12;


        // =================================================
        // LIMIT MUSICAL
        // =================================================

        /*
         * Evitem els aguts estridents
         * com a estat normal.
         *
         * Però no els prohibim completament.
         */

        const softLow =
            this.current.rootMidi - 12;


        const softHigh =
            this.current.rootMidi + 36;


        const hardHigh =
            this.current.rootMidi + 48;


        if (
            midi < softLow
        ) {

            midi += 12;
        }


        if (
            midi > softHigh &&
            activity < 0.72
        ) {

            midi -= 12;
        }


        if (
            midi > hardHigh
        ) {

            midi =
                hardHigh;
        }


        // =================================================
        // RESPIRACIÓ
        // =================================================

        /*
         * Després d'un salt important,
         * evitem repetir immediatament
         * la mateixa zona extrema.
         */

        if (
            this.phraseEnergy > 0.55
        ) {

            if (
                midi >
                this.current.rootMidi + 24
            ) {

                midi -= 12;
            }

            this.phraseEnergy *= 0.45;
        }


        // =================================================
        // MEMÒRIA MIDI
        // =================================================

        this.previousMidi =
            this.lastMidi;

        this.lastMidi =
            midi;


        return midi;
    }


    // =====================================================
    // UTILS
    // =====================================================

    clamp(value) {

        const n =
            Number(value);


        if (!Number.isFinite(n)) {
            return 0;
        }


        return Math.max(
            0,
            Math.min(1, n)
        );
    }


    // =====================================================
    // STATE
    // =====================================================

    getState() {

        return {

            root:
                this.current.root,

            rootMidi:
                this.current.rootMidi,

            mode:
                this.current.mode,

            scale:
                [...this.current.scale],

            stability:
                this.stability,

            tension:
                this.tension,

            changePressure:
                this.changePressure
        };
    }
}