export class OscillatorModule {


    constructor(audio) {


        this.audio = audio;


        this.waveform = "triangle";


        this.level = 0.5;


    }





    setWave(type) {


        this.waveform = type;


    }







    setLevel(value) {


        this.level =
            value / 100;


    }







    create(freq) {


        const osc =
            this.audio.createOscillator();



        const gain =
            this.audio.createGain();



        osc.type =
            this.waveform;



        osc.frequency.value =
            freq;



        gain.gain.value =
            this.level;



        osc.connect(gain);



        return {

            osc,
            gain

        };


    }



}