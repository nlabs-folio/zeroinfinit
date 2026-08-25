import { OscillatorModule }
    from "./modules/oscillator.js";


export class Synth {

    constructor() {

        this.audio =
            new AudioContext();


        // =================================================
        // OSCILLATORS — MAIN CONWAY VOICE
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
        // VALVE
        // =================================================

        this.valve =
            this.audio.createWaveShaper();

        this.valve.curve =
            this.createValveCurve(1.35);

        this.valve.oversample =
            "4x";


        // =================================================
        // GLUE COMPRESSOR
        // =================================================

        this.compressor =
            this.audio.createDynamicsCompressor();

        this.compressor.threshold.value =
            -12;

        this.compressor.knee.value =
            20;

        this.compressor.ratio.value =
            2.2;

        this.compressor.attack.value =
            0.012;

        this.compressor.release.value =
            0.24;


        // =================================================
        // MICRO ROOM
        // =================================================

        this.room =
            this.audio.createConvolver();

        this.roomGain =
            this.audio.createGain();

        this.roomGain.gain.value =
            0.045;

        this.room.buffer =
            this.createRoomImpulse(
                0.42,
                0.20
            );


        // =================================================
        // ANALYSER
        // =================================================

        this.analyser =
            this.audio.createAnalyser();

        this.analyser.fftSize =
            2048;

        this.analyser.smoothingTimeConstant =
            0.78;

        this.frequencyData =
            new Uint8Array(
                this.analyser.frequencyBinCount
            );


        // =================================================
        // ROUTING
        //
        // MAIN / BASS / PAD / LEAD
        //             ↓
        //        ORGANISM BUS
        //             ↓
        //           VALVE
        //             ↓
        //        COMPRESSOR
        //             ↓
        //           MASTER
        //             ↓
        //         ANALYSER
        //             ↓
        //          OUTPUT
        //
        // ROOM = PARALLEL
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

        this.compressor.connect(
            this.master
        );

        this.room.connect(
            this.roomGain
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
            3500;

        this.bioCutoff =
            0;

        this.resonance =
            0.2;

        this.bioResonance =
            0;

        this.attack =
            0.615;

        this.release =
            1.37;


        // =================================================
        // ANALOGUE CHARACTER
        // =================================================

        this.voiceDrift =
            0.30;

        this.voicePan =
            0.025;


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
        // BASS MEMORY
        // =================================================

        this.lastBassMidi =
            null;

        this.lastBassTime =
            0;

        this.bassStep =
            0;


        // =================================================
        // PAD MEMORY
        // =================================================

        this.lastPadTime =
            0;

        this.padStep =
            0;


        // =================================================
        // LEAD MEMORY
        // =================================================

        this.lastLeadTime =
            0;

        this.leadStep =
            0;


        // =================================================
        // CULTURE
        // =================================================

        this.culture =
            null;

        this.createCulture();


        // =================================================
        // MASTER
        // =================================================

        this.updateMaster();
    }


    // =====================================================
    // VALVE
    // =====================================================

    createValveCurve(amount = 1.35) {

        const samples =
            44100;

        const curve =
            new Float32Array(
                samples
            );

        const normalization =
            Math.tanh(amount);

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
        duration = 0.42,
        decay = 0.20
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
                    0.16;
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
             7,
             12
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
                0.85 +
                Math.random() *
                0.30,

            breath:
                0.80 +
                Math.random() *
                0.35,

            character:
                0.90 +
                Math.random() *
                0.20
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

        this.lastBassMidi =
            null;

        this.lastBassTime =
            0;

        this.bassStep =
            0;

        this.lastPadTime =
            0;

        this.lastLeadTime =
            0;
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
            6500;

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
                9000,
                this.cutoff +
                this.bioCutoff *
                3000
            );

        this.currentFilter.Q.value =
            Math.min(
                9,
                this.resonance *
                4 +
                this.bioResonance *
                3
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
            ) *
            1.2;
    }


    setRelease(v) {

        this.release =
            0.12 +
            (
                v / 100
            ) *
            2.5;
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
        // BASS
        // =================================================

        this.processBass(
            signal,
            energy,
            density,
            motion
        );


        // =================================================
        // PAD
        // =================================================

        this.processPad(
            signal,
            energy,
            density,
            motion
        );


        // =================================================
        // LEAD
        // =================================================

        this.processLead(
            signal,
            energy,
            density,
            motion
        );
    }


    // =====================================================
    // BASS
    //
    // Conway NO toca el bass directament.
    //
    // Decideix:
    //
    // density → probabilitat
    // energy  → intensitat
    // motion  → ritme
    //
    // Això permet:
    //
    // nota
    // silenci
    // nota
    // nota
    // silenci
    // treset
    // ...
    // =====================================================

    processBass(
        signal,
        energy,
        density,
        motion
    ) {

        const now =
            this.audio.currentTime;


        // -------------------------------------------------
        // COOLDOWN
        // -------------------------------------------------

        if (
            now -
            this.lastBassTime
            <
            0.075
        ) {

            return;
        }


        // -------------------------------------------------
        // SILENCE PROBABILITY
        //
        // El bass no ha de cantar sempre.
        // -------------------------------------------------

        let probability =

            0.22 +

            density *
            0.34 +

            energy *
            0.18;


        // moviment = més activitat rítmica

        probability +=
            motion *
            0.16;


        // -------------------------------------------------
        // SILENCES
        // -------------------------------------------------

        if (
            Math.random() >
            probability
        ) {

            this.lastBassTime =
                now;

            return;
        }


        // -------------------------------------------------
        // RHYTHMIC BEHAVIOUR
        // -------------------------------------------------

        const rhythmicRoll =
            Math.random();


        let duration =
            0.42;


        let rhythmOffset =
            0;


        // treset

        if (
            motion > 0.62 &&
            rhythmicRoll < 0.22
        ) {

            duration =
                0.24;

            rhythmOffset =
                0.0;
        }


        // nota curta

        else if (
            rhythmicRoll < 0.42
        ) {

            duration =
                0.22;
        }


        // nota mitjana

        else if (
            rhythmicRoll < 0.72
        ) {

            duration =
                0.38;
        }


        // nota llarga

        else {

            duration =
                0.62;
        }


        // -------------------------------------------------
        // PITCH
        //
        // Bass clarament per sota
        // de la veu principal.
        // -------------------------------------------------

        let midi =
            Number.isFinite(
                signal.pitch
            )
            ? signal.pitch
            : 48;


        midi -= 24;


        // registre addicional

        midi +=
            this.culture
                ? this.culture.pitchOffset
                : 0;


        // mantenim el bass en zona sub/low

        midi =
            Math.max(
                28,
                Math.min(
                    midi,
                    55
                )
            );


        // -------------------------------------------------
        // OCCASIONAL OCTAVE DROP
        // -------------------------------------------------

        if (
            energy > 0.68 &&
            Math.random() < 0.18
        ) {

            midi -=
                12;
        }


        midi =
            Math.max(
                24,
                midi
            );


        // -------------------------------------------------
        // REPETICIÓ / MOVIMENT
        // -------------------------------------------------

        if (
            this.lastBassMidi !== null &&
            motion < 0.25 &&
            Math.random() < 0.42
        ) {

            midi =
                this.lastBassMidi;
        }


        this.lastBassMidi =
            midi;


        this.lastBassTime =
            now;


        this.playBass(
            midi,
            duration,
            energy,
            density
        );
    }


    // =====================================================
    // PLAY BASS
    // =====================================================

    playBass(
        midi,
        duration,
        energy,
        density
    ) {

        const osc =
            this.audio.createOscillator();


        const sub =
            this.audio.createOscillator();


        const gain =
            this.audio.createGain();


        const subGain =
            this.audio.createGain();


        const filter =
            this.audio.createBiquadFilter();


        const now =
            this.audio.currentTime;


        osc.type =
            "triangle";


        sub.type =
            "sine";


        const frequency =
            this.midiToFrequency(
                midi
            );


        osc.frequency.value =
            frequency;


        sub.frequency.value =
            frequency / 2;


        // -------------------------------------------------
        // BASS BODY
        // -------------------------------------------------

        gain.gain.value =
            0.20 +
            energy *
            0.12;


        subGain.gain.value =
            0.15 +
            density *
            0.12;


        // -------------------------------------------------
        // FILTER
        // -------------------------------------------------

        filter.type =
            "lowpass";


        filter.frequency.value =
            520 +
            energy *
            480;


        filter.Q.value =
            0.7;


        // -------------------------------------------------
        // ENVELOPE
        // -------------------------------------------------

        const attack =
            0.018;


        const decay =
            Math.max(
                0.18,
                duration *
                0.72
            );


        const release =
            Math.max(
                0.16,
                duration *
                0.48
            );


        gain.gain.setValueAtTime(
            0.0001,
            now
        );


        gain.gain.exponentialRampToValueAtTime(
            0.20 +
            energy *
            0.12,
            now + attack
        );


        gain.gain.exponentialRampToValueAtTime(
            0.075 +
            energy *
            0.04,
            now + decay
        );


        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now +
            duration +
            release
        );


        // -------------------------------------------------
        // SUB ENVELOPE
        // -------------------------------------------------

        subGain.gain.setValueAtTime(
            0.0001,
            now
        );


        subGain.gain.exponentialRampToValueAtTime(
            0.15 +
            density *
            0.12,
            now + 0.025
        );


        subGain.gain.exponentialRampToValueAtTime(
            0.001,
            now +
            duration +
            release
        );


        // -------------------------------------------------
        // ROUTING
        // -------------------------------------------------

        osc.connect(
            gain
        );

        sub.connect(
            subGain
        );

        gain.connect(
            filter
        );

        subGain.connect(
            filter
        );

        filter.connect(
            this.organismBus
        );


        osc.start(
            now
        );

        sub.start(
            now
        );


        const stop =
            now +
            duration +
            release +
            0.08;


        osc.stop(
            stop
        );

        sub.stop(
            stop
        );
    }


    // =====================================================
    // PAD
    //
    // No és un acord constant.
    //
    // Apareix quan Conway té densitat.
    // =====================================================

    processPad(
        signal,
        energy,
        density,
        motion
    ) {

        const now =
            this.audio.currentTime;


        if (
            now -
            this.lastPadTime
            <
            0.55
        ) {

            return;
        }


        // -------------------------------------------------
        // PAD = ESTABILITAT
        // -------------------------------------------------

        const probability =

            density *
            0.48 +
            energy *
            0.16;


        if (
            Math.random() >
            probability
        ) {

            return;
        }


        this.lastPadTime =
            now;


        let root =
            Number.isFinite(
                signal.pitch
            )
            ? signal.pitch
            : 60;


        root +=
            this.culture
                ? this.culture.pitchOffset
                : 0;


        // -------------------------------------------------
        // PAD ABOVE BASS
        // -------------------------------------------------

        root +=
            12;


        root =
            Math.max(
                48,
                Math.min(
                    root,
                    72
                )
            );


        const intervals = [
            0,
            4,
            7
        ];


        // moviment pot obrir la geometria

        if (
            motion > 0.62
        ) {

            intervals[1] =
                3;
        }


        intervals.forEach(
            interval => {

                this.playPadVoice(
                    root + interval,
                    energy,
                    density
                );

            }
        );
    }


    // =====================================================
    // PAD VOICE
    // =====================================================

    playPadVoice(
        midi,
        energy,
        density
    ) {

        const osc =
            this.audio.createOscillator();


        const gain =
            this.audio.createGain();


        const filter =
            this.audio.createBiquadFilter();


        const now =
            this.audio.currentTime;


        osc.type =
            "triangle";


        osc.frequency.value =
            this.midiToFrequency(
                midi
            );


        filter.type =
            "lowpass";


        filter.frequency.value =
            1400 +
            density *
            1200;


        filter.Q.value =
            0.45;


        const level =
            0.018 +
            density *
            0.018;


        const attack =
            0.45;


        const sustain =
            1.4;


        const release =
            1.7;


        gain.gain.setValueAtTime(
            0.0001,
            now
        );


        gain.gain.exponentialRampToValueAtTime(
            level,
            now + attack
        );


        gain.gain.exponentialRampToValueAtTime(
            level * 0.72,
            now + attack + sustain
        );


        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now +
            attack +
            sustain +
            release
        );


        osc.connect(
            gain
        );

        gain.connect(
            filter
        );

        filter.connect(
            this.organismBus
        );


        osc.start(
            now
        );


        osc.stop(
            now +
            attack +
            sustain +
            release +
            0.1
        );
    }


    // =====================================================
    // LEAD
    //
    // Molt menys freqüent.
    //
    // Movement = possibilitat
    // Energy   = intensitat
    // =====================================================

    processLead(
        signal,
        energy,
        density,
        motion
    ) {

        const now =
            this.audio.currentTime;


        if (
            now -
            this.lastLeadTime
            <
            0.30
        ) {

            return;
        }


        const probability =

            motion *
            0.38 +

            energy *
            0.12;


        if (
            Math.random() >
            probability
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


        midi +=
            this.culture
                ? this.culture.pitchOffset
                : 0;


        // -------------------------------------------------
        // LEAD REGISTER
        // -------------------------------------------------

        midi +=
            24;


        // petits salts derivats del moviment

        const gestures = [
            0,
            2,
            3,
            5,
            7,
            10,
            12
        ];


        const gesture =
            gestures[
                Math.floor(
                    Math.random() *
                    gestures.length
                )
            ];


        midi +=
            gesture;


        midi =
            Math.max(
                72,
                Math.min(
                    midi,
                    100
                )
            );


        this.playLead(
            midi,
            energy,
            motion
        );
    }


    // =====================================================
    // LEAD VOICE
    // =====================================================

    playLead(
        midi,
        energy,
        motion
    ) {

        const osc =
            this.audio.createOscillator();


        const gain =
            this.audio.createGain();


        const filter =
            this.audio.createBiquadFilter();


        const panner =
            this.audio.createStereoPanner();


        const now =
            this.audio.currentTime;


        osc.type =
            "sine";


        osc.frequency.value =
            this.midiToFrequency(
                midi
            );


        osc.detune.value =
            (
                Math.random() *
                2 -
                1
            ) *
            2;


        filter.type =
            "lowpass";


        filter.frequency.value =
            2400 +
            motion *
            1800;


        filter.Q.value =
            0.7;


        panner.pan.value =
            (
                Math.random() *
                2 -
                1
            ) *
            0.12;


        const level =
            0.025 +
            energy *
            0.025;


        const attack =
            0.025;


        const release =
            0.45 +
            motion *
            0.35;


        gain.gain.setValueAtTime(
            0.0001,
            now
        );


        gain.gain.exponentialRampToValueAtTime(
            level,
            now + attack
        );


        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now +
            attack +
            release
        );


        osc.connect(
            gain
        );

        gain.connect(
            filter
        );

        filter.connect(
            panner
        );

        panner.connect(
            this.organismBus
        );


        osc.start(
            now
        );


        osc.stop(
            now +
            attack +
            release +
            0.08
        );
    }


    // =====================================================
    // MAIN CONWAY VOICE
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

        const amp =
            this.audio.createGain();

        const panner =
            this.audio.createStereoPanner();


        this.currentFilter =
            filter;


        // -------------------------------------------------
        // WAVEFORMS
        // -------------------------------------------------

        oscA.type =
            this.oscA.waveform;

        oscB.type =
            this.oscB.waveform;


        // -------------------------------------------------
        // PITCH
        // -------------------------------------------------

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
                    96
                )
            );


        const frequency =
            this.midiToFrequency(
                midi
            );


        // -------------------------------------------------
        // DETUNE
        // -------------------------------------------------

        const character =
            this.culture
                ? this.culture.character
                : 1;


        const driftA =
            (
                Math.random() *
                2 -
                1
            ) *
            this.voiceDrift *
            character;


        const driftB =
            (
                Math.random() *
                2 -
                1
            ) *
            this.voiceDrift *
            character;


        oscA.detune.value =
            -0.7 +
            driftA;

        oscB.detune.value =
            0.7 +
            driftB;


        oscA.frequency.value =
            frequency;

        oscB.frequency.value =
            frequency;


        // -------------------------------------------------
        // BALANCE
        // -------------------------------------------------

        const waveform =
            this.oscA.waveform;


        let bodyLevel =
            0.72;


        if (
            waveform ===
            "sawtooth"
        ) {

            bodyLevel =
                0.78;
        }


        if (
            waveform ===
            "square"
        ) {

            bodyLevel =
                0.68;
        }


        if (
            waveform ===
            "triangle"
        ) {

            bodyLevel =
                0.60;
        }


        if (
            waveform ===
            "sine"
        ) {

            bodyLevel =
                0.46;
        }


        gainA.gain.value =
            this.oscA.level;

        gainB.gain.value =
            this.oscB.level *
            bodyLevel;


        // -------------------------------------------------
        // FILTER
        // -------------------------------------------------

        filter.type =
            "lowpass";


        const livingCutoff =

            this.cutoff +

            this.organismEnergy *
            700 +

            this.organismDensity *
            350;


        filter.frequency.value =
            Math.min(
                9000,
                livingCutoff
            );


        filter.Q.value =
            Math.min(
                8,
                this.resonance *
                4 +
                this.bioResonance *
                3
            );


        // -------------------------------------------------
        // TIME
        // -------------------------------------------------

        const now =
            this.audio.currentTime;


        const attack =
            Math.max(
                0.008,
                this.attack *
                (
                    1 -
                    this.organismMotion *
                    0.18
                )
            );


        const release =
            Math.max(
                0.08,
                this.release *
                (
                    0.92 +
                    (
                        1 -
                        this.organismEnergy
                    ) *
                    0.16
                )
            );


        // -------------------------------------------------
        // LEVEL
        // -------------------------------------------------

        const breathing =
            0.92 +
            this.organismEnergy *
            0.12;


        const cultureWarmth =
            this.culture
                ? this.culture.warmth
                : 1;


        const peak =

            (
                0.09 +
                energy *
                0.10
            ) *
            breathing *
            cultureWarmth;


        amp.gain.setValueAtTime(
            0.0001,
            now
        );


        amp.gain.exponentialRampToValueAtTime(
            peak,
            now + attack
        );


        amp.gain.exponentialRampToValueAtTime(
            0.001,
            now +
            attack +
            release
        );


        // -------------------------------------------------
        // STEREO
        // -------------------------------------------------

        const panAmount =

            this.voicePan +

            this.organismMotion *
            0.025;


        panner.pan.value =

            (
                Math.random() *
                2 -
                1
            ) *
            panAmount;


        // -------------------------------------------------
        // ROUTING
        // -------------------------------------------------

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
            panner
        );

        panner.connect(
            this.organismBus
        );


        // -------------------------------------------------
        // START
        // -------------------------------------------------

        oscA.start(
            now
        );

        oscB.start(
            now
        );


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