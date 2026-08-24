// =========================================================
// CONWAY ORGANISM
// BIOSIGNAL
//
// Traducció biològica de Conway.
//
// No genera música directament.
// Conserva memòria i estabilitza el comportament.
// =========================================================

import { TonalState }
    from "./tonalState.js";


export class BioSignal {

    constructor() {

        this.tonal =
            new TonalState();


        this.signal = {

            gate: 0,

            pitch: -24,

            energy: 0,

            density: 0,

            movement: 0,

            activity: 0,

            tonal:
                this.tonal.getState()
        };


        this.smooth = {

            energy: 0,

            density: 0,

            movement: 0,

            activity: 0
        };


        /*
         * Inèrcia biològica.
         *
         * No volem que cada generació
         * sigui una ordre musical completament nova.
         */

        this.response = 0.18;
    }


    lerp(current, target) {

        return current +
            (
                target - current
            ) *
            this.response;
    }


    normalize(value) {

        const n =
            Number(value);

        if (!Number.isFinite(n)) {
            return 0;
        }

        return Math.max(
            0,
            Math.min(n, 1)
        );
    }


    update(data) {

        if (!data) {
            return this.signal;
        }


        const energyTarget =
            this.normalize(
                data.energy
            );


        const densityTarget =
            this.normalize(
                data.density
            );


        const movementTarget =
            this.normalize(
                data.movement
            );


        const activityTarget =
            this.normalize(
                data.activity
            );


        /*
         * -------------------------------------------------
         * INÈRCIA
         * -------------------------------------------------
         */

        this.smooth.energy =
            this.lerp(
                this.smooth.energy,
                energyTarget
            );


        this.smooth.density =
            this.lerp(
                this.smooth.density,
                densityTarget
            );


        this.smooth.movement =
            this.lerp(
                this.smooth.movement,
                movementTarget
            );


        this.smooth.activity =
            this.lerp(
                this.smooth.activity,
                activityTarget
            );


        /*
         * -------------------------------------------------
         * TONAL STATE
         * -------------------------------------------------
         */

        this.tonal.update({

            ...data,

            energy:
                this.smooth.energy,

            density:
                this.smooth.density,

            movement:
                this.smooth.movement,

            activity:
                this.smooth.activity
        });


        /*
         * -------------------------------------------------
         * OUTPUT
         * -------------------------------------------------
         */

        this.signal.energy =
            this.smooth.energy;


        this.signal.density =
            this.smooth.density;


        this.signal.movement =
            this.smooth.movement;


        this.signal.activity =
            this.smooth.activity;


        /*
         * -------------------------------------------------
         * GATE
         * -------------------------------------------------
         */

        const population =
            Number(
                data.population
            );


        this.signal.gate =
            Number.isFinite(population) &&
            population > 0
                ? 1
                : 0;


        /*
         * -------------------------------------------------
         * PITCH
         * -------------------------------------------------
         */

        this.signal.pitch =
            this.tonal.noteFromData({
                ...data,

                energy:
                    this.smooth.energy,

                density:
                    this.smooth.density,

                movement:
                    this.smooth.movement,

                activity:
                    this.smooth.activity
            });


        /*
         * -------------------------------------------------
         * TONAL STATE
         * -------------------------------------------------
         */

        this.signal.tonal =
            this.tonal.getState();


        return this.signal;
    }


    get() {

        return this.signal;
    }
}