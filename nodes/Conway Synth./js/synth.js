import { OscillatorModule }
    from "./modules/oscillator.js";


export class Synth {

    constructor() {

        this.audio =
            new AudioContext();


        this.oscA =
            new OscillatorModule(
                this.audio
            );


        this.oscB =
            new OscillatorModule(
                this.audio
            );


        // =================================================
        // MASTER
        // =================================================

        this.master =
            this.audio.createGain();


        this.drive =
            this.audio.createWaveShaper();


        this.drive.curve =
            this.createDriveCurve(18);


        this.drive.oversample =
            "4x";


        // =================================================
        // ANALYSER
        // =================================================

        this.analyser =
            this.audio.createAnalyser();


        this.analyser.fftSize =
            1024;


        this.analyser.smoothingTimeConstant =
            0.82;


        this.frequencyData =
            new Uint8Array(
                this.analyser.frequencyBinCount
            );


        // =================================================
        // FLOW
        // =================================================

        this.master.connect(
            this.drive
        );


        this.drive.connect(
            this.analyser
        );


        this.analyser.connect(
            this.audio.destination
        );


        // =================================================
        // PARAMETERS
        // =================================================

        this.volume =
            0.7;


        this.bioVolume =
            1;


        this.cutoff =
            3000;


        this.bioCutoff =
            0;


        this.currentFilter =
            null;


        this.resonance =
            0.2;


        this.bioResonance =
            0;


        this.attack =
            0.05;


        this.release =
            1;


        this.master.gain.value =
            this.volume;
    }


    // =====================================================
    // DRIVE
    // =====================================================

    createDriveCurve(amount = 18) {

        const samples =
            44100;


        const curve =
            new Float32Array(
                samples
            );


        for (
            let i = 0;
            i < samples;
            i++
        ) {

            const x =
                i * 2 /
                samples - 1;


            curve[i] =
                Math.tanh(
                    x * amount
                );
        }


        return curve;
    }


    // =====================================================
    // START
    // =====================================================

    start() {

        if (
            this.audio.state ===
            "suspended"
        ) {

            this.audio.resume();
        }
    }


    // =====================================================
    // MIDI
    // =====================================================

    midiToFrequency(midi) {

        return (

            440 *

            Math.pow(
                2,
                (midi - 69) / 12
            )
        );
    }


    // =====================================================
    // SPECTRUM
    // =====================================================

    getSpectrum() {

        this.analyser.getByteFrequencyData(
            this.frequencyData
        );


        return this.frequencyData;
    }


    getBands() {

        const data =
            this.getSpectrum();


        const size =
            data.length;


        const third =
            Math.floor(
                size / 3
            );


        let bass = 0;
        let mids = 0;
        let highs = 0;


        for (
            let i = 0;
            i < third;
            i++
        ) {

            bass += data[i];
        }


        for (
            let i = third;
            i < third * 2;
            i++
        ) {

            mids += data[i];
        }


        for (
            let i = third * 2;
            i < size;
            i++
        ) {

            highs += data[i];
        }


        return {

            bass:
                bass /
                third /
                255,

            mids:
                mids /
                third /
                255,

            highs:
                highs /
                (
                    size -
                    third * 2
                ) /
                255
        };
    }


    // =====================================================
    // VOLUME
    // =====================================================

    setVolume(v) {

        this.volume =
            (v / 100) * 0.9;


        this.updateMaster();
    }


    setBioVolume(value) {

        this.bioVolume =
            Math.max(
                0,
                Math.min(
                    value,
                    1
                )
            );


        this.updateMaster();
    }


    updateMaster() {

        this.master.gain.value =

            this.volume *

            (
                0.5 +
                this.bioVolume * 0.5
            );
    }


    // =====================================================
    // FILTER
    // =====================================================

    setCutoff(v) {

        this.cutoff =

            250 +

            (
                v / 100
            ) *

            6500;


        this.updateFilter();
    }


    setResonance(v) {

        this.resonance =
            v / 100;


        this.updateFilter();
    }


    setBioCutoff(value) {

        this.bioCutoff =
            Math.max(
                0,
                Math.min(
                    value,
                    1
                )
            );


        this.updateFilter();
    }


    setBioResonance(value) {

        this.bioResonance =
            Math.max(
                0,
                Math.min(
                    value,
                    1
                )
            );


        this.updateFilter();
    }


    updateFilter() {

        if (!this.currentFilter) {
            return;
        }


        this.currentFilter.frequency.value =

            Math.min(

                9000,

                this.cutoff +

                this.bioCutoff *
                3500
            );


        this.currentFilter.Q.value =

            Math.min(

                12,

                this.resonance * 5 +

                this.bioResonance * 5
            );
    }


    // =====================================================
    // ENVELOPE
    // =====================================================

    setAttack(v) {

        this.attack =

            0.015 +

            (
                v / 100
            ) * 1.2;
    }


    setRelease(v) {

        this.release =

            0.12 +

            (
                v / 100
            ) * 2.5;
    }


    // =====================================================
    // BIO SIGNAL
    // =====================================================

    processBioSignal(signal) {

        if (!signal) {
            return;
        }


        if (signal.gate === 0) {
            return;
        }


        this.voice(signal);
    }


    // =====================================================
    // VOICE
    // =====================================================

    voice(signal) {

        const oscA =
            this.audio.createOscillator();


        const oscB =
            this.audio.createOscillator();


        const gainA =
            this.audio.createGain();


        const gainB =
            this.audio.createGain();


        const filter =
            this.audio.createBiquadFilter();


        const amp =
            this.audio.createGain();


        this.currentFilter =
            filter;


        // =================================================
        // WAVEFORMS
        // =================================================

        oscA.type =
            this.oscA.waveform;


        oscB.type =
            this.oscB.waveform;


        // =================================================
        // PITCH
        // =================================================

        const midi =

            Number.isFinite(
                signal.pitch
            )

            ? signal.pitch
            : 60;


        const frequency =
            this.midiToFrequency(
                midi
            );


        /*
         * Oscil·lador A:
         * centre tonal.
         */

        oscA.frequency.value =
            frequency;


        /*
         * Oscil·lador B:
         * lleugerament més greu.
         *
         * Això dona cos en lloc
         * d'una còpia aguda.
         */

        oscB.frequency.value =
            frequency * 0.997;


        // =================================================
        // LEVELS
        // =================================================

        gainA.gain.value =
            this.oscA.level;


        gainB.gain.value =
            this.oscB.level * 0.72;


        // =================================================
        // FILTER
        // =================================================

        filter.type =
            "lowpass";


        filter.frequency.value =
            this.cutoff;


        filter.Q.value =
            this.resonance * 5;


        this.updateFilter();


        // =================================================
        // AMPLITUDE
        // =================================================

        const now =
            this.audio.currentTime;


        const attack =
            Math.max(
                0.008,
                this.attack
            );


        const release =
            Math.max(
                0.08,
                this.release
            );


        /*
         * Petita variació d'intensitat
         * segons l'organisme.
         */

        const biologicalLevel =

            0.035 +

            (
                signal.energy *
                0.045
            );


        amp.gain.setValueAtTime(
            0.0001,
            now
        );


        amp.gain.exponentialRampToValueAtTime(

            biologicalLevel,

            now + attack
        );


        amp.gain.exponentialRampToValueAtTime(

            0.001,

            now +
            attack +
            release
        );


        // =================================================
        // ROUTING
        // =================================================

        oscA.connect(
            gainA
        );


        oscB.connect(
            gainB
        );


        gainA.connect(
            filter
        );


        gainB.connect(
            filter
        );


        filter.connect(
            amp
        );


        amp.connect(
            this.master
        );


        // =================================================
        // START
        // =================================================

        oscA.start();
        oscB.start();


        const stopTime =

            now +
            attack +
            release +
            0.25;


        oscA.stop(
            stopTime
        );


        oscB.stop(
            stopTime
        );
    }
}