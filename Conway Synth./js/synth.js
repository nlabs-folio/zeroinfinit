import { OscillatorModule }
    from "./modules/oscillator.js";


export class Synth {

    constructor() {

        this.audio =
            new AudioContext();


        // =================================================
        // OSCILLATORS
        // =================================================

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


        // =================================================
        // ORGANISM BUS
        // =================================================

        this.organismBus =
            this.audio.createGain();

        this.organismBus.gain.value =
            1;


        // =================================================
        // SOFT ANALOGUE VALVE
        // =================================================

        this.valve =
            this.audio.createWaveShaper();

        this.valve.curve =
            this.createValveCurve(
                1.07
            );

        this.valve.oversample =
            "4x";


        // =================================================
        // GLUE
        // =================================================

        this.compressor =
            this.audio.createDynamicsCompressor();

        this.compressor.threshold.value =
            -16;

        this.compressor.knee.value =
            30;

        this.compressor.ratio.value =
            1.6;

        this.compressor.attack.value =
            0.028;

        this.compressor.release.value =
            0.34;


        // =================================================
        // MICRO ROOM
        // =================================================

        this.room =
            this.audio.createConvolver();

        this.roomGain =
            this.audio.createGain();

        this.roomGain.gain.value =
            0.025;

        this.room.buffer =
            this.createRoomImpulse(
                0.46,
                0.30
            );


        // =================================================
        // ANALYSER
        // =================================================

        this.analyser =
            this.audio.createAnalyser();

        this.analyser.fftSize =
            2048;

        this.analyser.smoothingTimeConstant =
            0.84;

        this.frequencyData =
            new Uint8Array(
                this.analyser.frequencyBinCount
            );


        // =================================================
        // ROUTING
        // =================================================

        this.organismBus.connect(
            this.valve
        );

        this.organismBus.connect(
            this.room
        );

        this.valve.connect(
            this.compressor
        );

        this.room.connect(
            this.roomGain
        );

        this.compressor.connect(
            this.master
        );

        this.roomGain.connect(
            this.master
        );

        this.master.connect(
            this.analyser
        );

        this.analyser.connect(
            this.audio.destination
        );


        // =================================================
        // PARAMETERS
        // =================================================

        this.volume =
            0.45;

        this.bioVolume =
            1;

        this.cutoff =
            2300;

        this.bioCutoff =
            0;

        this.resonance =
            0.13;

        this.bioResonance =
            0;

        this.attack =
            0.615;

        this.release =
            1.37;

        this.currentFilter =
            null;


        // =================================================
        // ANALOGUE CHARACTER
        // =================================================

        this.voiceDrift =
            0.22;

        this.voicePan =
            0.018;


        // =================================================
        // ORGANISM MEMORY
        // =================================================

        this.organismEnergy =
            0;

        this.organismDensity =
            0;

        this.organismMotion =
            0;


        // =================================================
        // CULTURE
        // =================================================

        this.culture =
            null;

        this.createCulture();


        // =================================================
        // MUSICAL MEMORY
        // =================================================

        this.lastBassTime =
            -10;

        this.lastPadTime =
            -10;

        this.lastLeadTime =
            -10;

        this.bassCounter =
            0;

        this.padCounter =
            0;

        this.leadCounter =
            0;


        // =================================================
        // PAD MEMORY
        // =================================================

        this.padVoice =
            null;

        this.lastPadRoot =
            null;


        // =================================================
        // MASTER
        // =================================================

        this.updateMaster();
    }


    // =====================================================
    // VALVE
    // =====================================================

    createValveCurve(amount = 1.07) {

        const samples =
            44100;

        const curve =
            new Float32Array(
                samples
            );

        const normalization =
            Math.tanh(
                amount
            );

        for (
            let i = 0;
            i < samples;
            i++
        ) {

            const x =
                i * 2 /
                samples -
                1;

            curve[i] =
                Math.tanh(
                    x * amount
                ) /
                normalization;
        }

        return curve;
    }


    // =====================================================
    // MICRO ROOM
    // =====================================================

    createRoomImpulse(
        duration = 0.46,
        decay = 0.30
    ) {

        const length =
            Math.floor(
                this.audio.sampleRate *
                duration
            );

        const impulse =
            this.audio.createBuffer(
                2,
                length,
                this.audio.sampleRate
            );

        for (
            let channel = 0;
            channel < 2;
            channel++
        ) {

            const data =
                impulse.getChannelData(
                    channel
                );

            for (
                let i = 0;
                i < length;
                i++
            ) {

                const envelope =
                    Math.pow(
                        1 -
                        i / length,
                        decay
                    );

                data[i] =
                    (
                        Math.random() *
                        2 -
                        1
                    ) *
                    envelope *
                    0.085;
            }
        }

        return impulse;
    }


    // =====================================================
    // CULTURE
    // =====================================================

    createCulture() {

        const pitchOffsets = [
            -2,
            -1,
             0,
             1,
             2
        ];

        const registers = [
            -12,
            -7,
             0,
             5,
             7
        ];

        this.culture = {

            pitchOffset:
                pitchOffsets[
                    Math.floor(
                        Math.random() *
                        pitchOffsets.length
                    )
                ],

            register:
                registers[
                    Math.floor(
                        Math.random() *
                        registers.length
                    )
                ],

            warmth:
                0.97 +
                Math.random() *
                0.08,

            character:
                0.97 +
                Math.random() *
                0.06
        };
    }


    // =====================================================
    // NEW CULTURE
    // =====================================================

    newCulture() {

        this.createCulture();

        this.organismEnergy =
            0;

        this.organismDensity =
            0;

        this.organismMotion =
            0;

        this.bassCounter =
            0;

        this.padCounter =
            0;

        this.leadCounter =
            0;

        this.lastBassTime =
            -10;

        this.lastPadTime =
            -10;

        this.lastLeadTime =
            -10;

        this.lastPadRoot =
            null;
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
    // MIDI → 432 Hz
    // =====================================================

    midiToFrequency(midi) {

        return (

            432 *

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

            bass +=
                data[i];
        }

        for (
            let i = third;
            i < third * 2;
            i++
        ) {

            mids +=
                data[i];
        }

        for (
            let i = third * 2;
            i < size;
            i++
        ) {

            highs +=
                data[i];
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
            (
                Math.max(
                    0,
                    Math.min(
                        v,
                        100
                    )
                ) /
                100
            ) *
            0.9;

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
                this.bioVolume *
                0.5
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
            5600;

        this.updateFilter();
    }


    setResonance(v) {

        this.resonance =
            Math.max(
                0,
                Math.min(
                    v / 90,
                    1
                )
            );

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

        if (
            !this.currentFilter
        ) {

            return;
        }

        this.currentFilter.frequency.value =
            Math.min(
                7200,
                this.cutoff +
                this.bioCutoff *
                2100
            );

        this.currentFilter.Q.value =
            Math.min(
                6,
                this.resonance * 3.2 +
                this.bioResonance * 2.4
            );
    }


    // =====================================================
    // ENVELOPE
    // =====================================================

    setAttack(v) {

        this.attack =
            0.025 +
            (
                v / 100
            ) *
            1.15;
    }


    setRelease(v) {

        this.release =
            0.16 +
            (
                v / 100
            ) *
            2.35;
    }


    // =====================================================
    // BIO SIGNAL
    // =====================================================

    processBioSignal(signal) {

        if (!signal) {

            return;
        }

        if (
            signal.gate === 0
        ) {

            return;
        }


        const energy =
            Number.isFinite(
                signal.energy
            )
            ? Math.max(
                0,
                Math.min(
                    signal.energy,
                    1
                )
            )
            : 0;


        const density =
            Number.isFinite(
                signal.density
            )
            ? Math.max(
                0,
                Math.min(
                    signal.density,
                    1
                )
            )
            : energy;


        const motion =
            Number.isFinite(
                signal.motion
            )
            ? Math.max(
                0,
                Math.min(
                    signal.motion,
                    1
                )
            )
            : 0;


        // =================================================
        // ORGANISM MEMORY
        // =================================================

        this.organismEnergy +=
            (
                energy -
                this.organismEnergy
            ) *
            0.08;


        this.organismDensity +=
            (
                density -
                this.organismDensity
            ) *
            0.06;


        this.organismMotion +=
            (
                motion -
                this.organismMotion
            ) *
            0.10;


        // =================================================
        // MAIN VOICE
        // =================================================

        this.voice(
            signal,
            energy
        );


        // =================================================
        // SUPPORTING LAYERS
        // =================================================

        this.processBass(
            signal,
            energy,
            density,
            motion
        );


        this.processPad(
            signal,
            energy,
            density,
            motion
        );


        this.processLead(
            signal,
            energy,
            density,
            motion
        );
    }


    // =====================================================
    // MAIN VOICE
    //
    // MÉS FUSTA / MENYS DIGITAL
    // =====================================================

    voice(
        signal,
        energy
    ) {

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

        const warmthFilter =
            this.audio.createBiquadFilter();

        const amp =
            this.audio.createGain();

        const panner =
            this.audio.createStereoPanner();


        this.currentFilter =
            filter;


        // =================================================
        // WAVEFORMS
        // =================================================

        /*
         * Si l'usuari ha triat una forma,
         * la respectem, però la tractem suaument.
         */

        oscA.type =
            this.oscA.waveform;

        oscB.type =
            this.oscB.waveform;


        // =================================================
        // PITCH
        // =================================================

        let midi =
            Number.isFinite(
                signal.pitch
            )
            ? signal.pitch
            : 60;


        if (
            this.culture
        ) {

            midi +=
                this.culture.pitchOffset;

            midi +=
                this.culture.register;
        }


        midi =
            Math.max(
                36,
                Math.min(
                    midi,
                    84
                )
            );


        const frequency =
            this.midiToFrequency(
                midi
            );


        // =================================================
        // MICRO DETUNE
        // =================================================

        const character =
            this.culture
                ? this.culture.character
                : 1;


        oscA.detune.value =
            -0.28 +
            (
                Math.random() *
                2 -
                1
            ) *
            this.voiceDrift *
            character;


        oscB.detune.value =
             0.28 +
            (
                Math.random() *
                2 -
                1
            ) *
            this.voiceDrift *
            character;


        oscA.frequency.value =
            frequency;

        oscB.frequency.value =
            frequency;


        // =================================================
        // BODY
        // =================================================

        let bodyLevel =
            0.58;


        if (
            this.oscA.waveform ===
            "sawtooth"
        ) {

            bodyLevel =
                0.48;
        }

        if (
            this.oscA.waveform ===
            "square"
        ) {

            bodyLevel =
                0.38;
        }

        if (
            this.oscA.waveform ===
            "triangle"
        ) {

            bodyLevel =
                0.52;
        }

        if (
            this.oscA.waveform ===
            "sine"
        ) {

            bodyLevel =
                0.42;
        }


        gainA.gain.value =
            this.oscA.level;

        gainB.gain.value =
            this.oscB.level *
            bodyLevel;


        // =================================================
        // WARMTH FILTER
        // =================================================

        filter.type =
            "lowpass";


        filter.frequency.value =
            Math.min(
                7000,
                this.cutoff +
                this.organismEnergy * 380 +
                this.organismDensity * 180
            );


        filter.Q.value =
            Math.min(
                5.5,
                this.resonance * 3 +
                this.bioResonance * 2
            );


        /*
         * Segon filtre molt suau.
         *
         * És el que treu aquella sensació
         * de "plàstic digital".
         */

        warmthFilter.type =
            "lowpass";

        warmthFilter.frequency.value =
            3900 +
            this.organismEnergy * 500;

        warmthFilter.Q.value =
            0.35;


        // =================================================
        // ENVELOPE
        // =================================================

        const now =
            this.audio.currentTime;


        const attack =
            Math.max(
                0.018,
                this.attack *
                (
                    1 -
                    this.organismMotion *
                    0.10
                )
            );


        const release =
            Math.max(
                0.10,
                this.release *
                (
                    0.96 +
                    (
                        1 -
                        this.organismEnergy
                    ) *
                    0.12
                )
            );


        const warmth =
            this.culture
                ? this.culture.warmth
                : 1;


        const peak =
            (
                0.065 +
                energy * 0.065
            ) *
            warmth;


        amp.gain.setValueAtTime(
            0.0001,
            now
        );

        amp.gain.exponentialRampToValueAtTime(
            peak,
            now + attack
        );

        amp.gain.exponentialRampToValueAtTime(
            peak * 0.72,
            now +
            attack +
            release * 0.35
        );

        amp.gain.exponentialRampToValueAtTime(
            0.001,
            now +
            attack +
            release
        );


        // =================================================
        // PAN
        // =================================================

        panner.pan.value =
            (
                Math.random() *
                2 -
                1
            ) *
            (
                this.voicePan +
                this.organismMotion * 0.012
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
            warmthFilter
        );

        warmthFilter.connect(
            amp
        );

        amp.connect(
            panner
        );

        panner.connect(
            this.organismBus
        );


        // =================================================
        // START / STOP
        // =================================================

        oscA.start(
            now
        );

        oscB.start(
            now
        );


        const stop =
            now +
            attack +
            release +
            0.35;


        oscA.stop(
            stop
        );

        oscB.stop(
            stop
        );
    }


    // =====================================================
    // BASS
    //
    // PROFUND
    // MÉS FUSTA
    // SILENCIS
    // VARIACIONS HARMÒNIQUES
    // =====================================================

    processBass(
        signal,
        energy,
        density,
        motion
    ) {

        this.bassCounter++;


        const now =
            this.audio.currentTime;


        // =================================================
        // SILENCIS
        // =================================================

        let silence =
            0.46 -
            density * 0.12;


        /*
         * Cada tercer esdeveniment:
         * més possibilitat de deixar respirar.
         */

        if (
            this.bassCounter % 3 === 0
        ) {

            silence +=
                0.15;
        }


        /*
         * Amb poca energia el baix desapareix
         * més sovint.
         */

        if (
            energy < 0.22
        ) {

            silence +=
                0.10;
        }


        if (
            Math.random() <
            silence
        ) {

            return;
        }


        // =================================================
        // DISTÀNCIA MÍNIMA
        // =================================================

        if (
            now -
            this.lastBassTime <
            0.23
        ) {

            return;
        }


        this.lastBassTime =
            now;


        // =================================================
        // ROOT
        // =================================================

        let midi =
            Number.isFinite(
                signal.pitch
            )
            ? signal.pitch
            : 48;


        if (
            this.culture
        ) {

            midi +=
                this.culture.pitchOffset;
        }


        // =================================================
        // HARMONIA
        // =================================================

        const choice =
            Math.random();


        if (
            choice < 0.55
        ) {

            // fonamental

        }

        else if (
            choice < 0.76
        ) {

            // quinta
            midi -=
                7;

        }

        else if (
            choice < 0.90
        ) {

            // tercera menor
            midi -=
                3;

        }

        else {

            // octava
            midi -=
                12;
        }


        // =================================================
        // REGISTRE
        // =================================================

        midi -=
            12;


        midi =
            Math.max(
                24,
                Math.min(
                    midi,
                    48
                )
            );


        const frequency =
            this.midiToFrequency(
                midi
            );


        // =================================================
        // OSCILLATORS
        // =================================================

        const body =
            this.audio.createOscillator();

        const sub =
            this.audio.createOscillator();


        const bodyGain =
            this.audio.createGain();

        const subGain =
            this.audio.createGain();


        const filter =
            this.audio.createBiquadFilter();


        const amp =
            this.audio.createGain();


        /*
         * Triangle = fusta.
         * Sine = pes.
         */

        body.type =
            "triangle";

        sub.type =
            "sine";


        body.frequency.value =
            frequency;

        sub.frequency.value =
            frequency / 2;


        /*
         * Una mica d'imperfecció.
         */

        body.detune.value =
            (
                Math.random() *
                2 -
                1
            ) *
            0.7;


        // =================================================
        // FILTER
        // =================================================

        filter.type =
            "lowpass";

        filter.frequency.value =
            520 +
            energy * 420 +
            density * 180;

        filter.Q.value =
            0.55;


        // =================================================
        // ENVELOPE
        // =================================================

        const attack =
            0.045;


        const decay =
            0.48 +
            energy * 0.38;


        const sustain =
            0.27 +
            energy * 0.08;


        const peak =
            0.085 +
            energy * 0.055;


        amp.gain.setValueAtTime(
            0.0001,
            now
        );

        amp.gain.exponentialRampToValueAtTime(
            peak,
            now + attack
        );

        amp.gain.exponentialRampToValueAtTime(
            peak * sustain,
            now +
            attack +
            decay * 0.52
        );

        amp.gain.exponentialRampToValueAtTime(
            0.001,
            now +
            attack +
            decay
        );


        // =================================================
        // BALANCE
        // =================================================

        bodyGain.gain.value =
            0.72;

        subGain.gain.value =
            0.48;


        body.connect(
            bodyGain
        );

        sub.connect(
            subGain
        );

        bodyGain.connect(
            filter
        );

        subGain.connect(
            filter
        );

        filter.connect(
            amp
        );

        amp.connect(
            this.organismBus
        );


        body.start(
            now
        );

        sub.start(
            now
        );


        const stop =
            now +
            attack +
            decay +
            0.08;


        body.stop(
            stop
        );

        sub.stop(
            stop
        );
    }


    // =====================================================
    // PAD
    //
    // AIRE + FUSTA
    //
    // NO ÉS UNA TUBA.
    //
    // EL PAD CANVIA D'INTERVAL
    // SEGONS L'ORGANISME.
    // =====================================================

    processPad(
        signal,
        energy,
        density,
        motion
    ) {

        this.padCounter++;


        // =================================================
        // PROBABILITAT
        // =================================================

        const chance =
            0.22 +
            density * 0.10 +
            energy * 0.04;


        if (
            Math.random() >
            chance
        ) {

            return;
        }


        const now =
            this.audio.currentTime;


        if (
            now -
            this.lastPadTime <
            1.20
        ) {

            return;
        }


        this.lastPadTime =
            now;


        // =================================================
        // ROOT
        // =================================================

        let root =
            Number.isFinite(
                signal.pitch
            )
            ? signal.pitch
            : 60;


        if (
            this.culture
        ) {

            root +=
                this.culture.pitchOffset +
                this.culture.register;
        }


        root =
            Math.max(
                48,
                Math.min(
                    root,
                    67
                )
            );


        // =================================================
        // MODULACIÓ HARMÒNICA
        // =================================================

        /*
         * No sempre fem root + quinta.
         *
         * L'organisme pot escollir:
         *
         * 0 + 7
         * 0 + 3
         * 0 + 5
         * 0 + 10
         *
         * però sempre amb una relació petita
         * i musical.
         */

        const choices = [

            [0, 7],

            [0, 3],

            [0, 5],

            [0, 10]

        ];


        let choice =
            choices[
                Math.floor(
                    Math.random() *
                    choices.length
                )
            ];


        /*
         * Evitem repetir exactament
         * el mateix color.
         */

        if (
            this.lastPadRoot ===
            root
        ) {

            const alternative =
                choices.filter(
                    item =>
                        item !== choice
                );


            if (
                alternative.length
            ) {

                choice =
                    alternative[
                        Math.floor(
                            Math.random() *
                            alternative.length
                        )
                    ];
            }
        }


        this.lastPadRoot =
            root;


        // =================================================
        // FADE OUT DEL PAD ANTERIOR
        // =================================================

        if (
            this.padVoice
        ) {

            try {

                this.padVoice.gain.cancelScheduledValues(
                    now
                );

                this.padVoice.gain.setTargetAtTime(
                    0.001,
                    now,
                    0.35
                );

            }

            catch {}
        }


        // =================================================
        // PAD BUS
        // =================================================

        const bus =
            this.audio.createGain();


        const filter =
            this.audio.createBiquadFilter();


        filter.type =
            "lowpass";


        filter.frequency.value =
            1150 +
            energy * 550 +
            motion * 250;


        filter.Q.value =
            0.38;


        bus.gain.value =
            1;


        filter.connect(
            bus
        );

        bus.connect(
            this.organismBus
        );


        this.padVoice =
            bus;


        // =================================================
        // DUES VEUS
        // =================================================

        choice.forEach(
            (
                interval,
                index
            ) => {

                const osc =
                    this.audio.createOscillator();


                const gain =
                    this.audio.createGain();


                /*
                 * Triangle principal.
                 * Sine secundària.
                 */

                osc.type =
                    index === 0
                    ? "triangle"
                    : "sine";


                osc.frequency.value =
                    this.midiToFrequency(
                        root +
                        interval
                    );


                /*
                 * Aire microscòpic.
                 */

                osc.detune.value =
                    (
                        Math.random() *
                        2 -
                        1
                    ) *
                    (
                        index === 0
                        ? 1.2
                        : 1.8
                    );


                const attack =
                    0.65;


                const hold =
                    1.25 +
                    density * 0.85;


                const release =
                    1.7 +
                    motion * 0.45;


                /*
                 * El pad és més baix
                 * del que sembla.
                 */

                const level =
                    index === 0
                    ? 0.075
                    : 0.035;


                gain.gain.setValueAtTime(
                    0.0001,
                    now
                );

                gain.gain.exponentialRampToValueAtTime(
                    level,
                    now + attack
                );

                gain.gain.setValueAtTime(
                    level,
                    now +
                    attack +
                    hold
                );

                gain.gain.exponentialRampToValueAtTime(
                    0.001,
                    now +
                    attack +
                    hold +
                    release
                );


                osc.connect(
                    gain
                );

                gain.connect(
                    filter
                );


                osc.start(
                    now
                );

                osc.stop(
                    now +
                    attack +
                    hold +
                    release +
                    0.15
                );

            }
        );
    }


    // =====================================================
    // LEAD
    //
    // PETIT FLAIX HUMÀ
    // =====================================================

    processLead(
        signal,
        energy,
        density,
        motion
    ) {

        this.leadCounter++;


        const chance =
            0.035 +
            motion * 0.075 +
            energy * 0.018;


        if (
            Math.random() >
            chance
        ) {

            return;
        }


        const now =
            this.audio.currentTime;


        if (
            now -
            this.lastLeadTime <
            0.48
        ) {

            return;
        }


        this.lastLeadTime =
            now;


        let midi =
            Number.isFinite(
                signal.pitch
            )
            ? signal.pitch
            : 60;


        if (
            this.culture
        ) {

            midi +=
                this.culture.pitchOffset +
                this.culture.register;
        }


        midi +=
            12;


        midi =
            Math.max(
                62,
                Math.min(
                    midi,
                    79
                )
            );


        // =================================================
        // LEAD
        // =================================================

        const osc =
            this.audio.createOscillator();


        const harmonic =
            this.audio.createOscillator();


        const gain =
            this.audio.createGain();


        const harmonicGain =
            this.audio.createGain();


        const filter =
            this.audio.createBiquadFilter();


        const amp =
            this.audio.createGain();


        const pan =
            this.audio.createStereoPanner();


        /*
         * Triangle en lloc de sine pur:
         * una mica més de cos.
         */

        osc.type =
            "triangle";


        harmonic.type =
            "sine";


        osc.frequency.value =
            this.midiToFrequency(
                midi
            );


        harmonic.frequency.value =
            this.midiToFrequency(
                midi + 12
            );


        harmonic.detune.value =
            -1.2 +
            Math.random() * 2.4;


        // =================================================
        // FILTER
        // =================================================

        filter.type =
            "lowpass";


        filter.frequency.value =
            1750 +
            motion * 650;


        filter.Q.value =
            0.32;


        // =================================================
        // LEVEL
        // =================================================

        gain.gain.value =
            0.80;


        harmonicGain.gain.value =
            0.08;


        // =================================================
        // ENVELOPE
        // =================================================

        const attack =
            0.16;


        const release =
            0.82 +
            energy * 0.50;


        const peak =
            0.012 +
            energy * 0.014;


        amp.gain.setValueAtTime(
            0.0001,
            now
        );

        amp.gain.exponentialRampToValueAtTime(
            peak,
            now + attack
        );

        amp.gain.exponentialRampToValueAtTime(
            peak * 0.55,
            now +
            attack +
            release * 0.35
        );

        amp.gain.exponentialRampToValueAtTime(
            0.001,
            now +
            attack +
            release
        );


        // =================================================
        // PAN
        // =================================================

        pan.pan.value =
            (
                Math.random() *
                2 -
                1
            ) *
            0.045;


        // =================================================
        // ROUTING
        // =================================================

        osc.connect(
            gain
        );

        harmonic.connect(
            harmonicGain
        );

        gain.connect(
            filter
        );

        harmonicGain.connect(
            filter
        );

        filter.connect(
            amp
        );

        amp.connect(
            pan
        );

        pan.connect(
            this.organismBus
        );


        osc.start(
            now
        );

        harmonic.start(
            now
        );


        const stop =
            now +
            attack +
            release +
            0.12;


        osc.stop(
            stop
        );

        harmonic.stop(
            stop
        );
    }
}