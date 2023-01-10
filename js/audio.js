/* 
 * Mahjong Solitaire Classic
 *
 * By Rafael Odon (2022)
 * odon.rafael@gmail.com
 * 
 */

var SOUND_FX = {
    "vanish" : { src: "audio/vanish.wav", volume: 0.5 },
    "click" : { src: "audio/click.wav", volume: 0.5 },
    "horn" : { src: "audio/horn.wav", volume: 0.5 },
    "ah" : { src: "audio/ah.wav", volume: 0.5 },
    "victory" : { src: "audio/victory.mp3", volume: 1.0 },
    "death" : { src: "audio/death.mp3", volume: 0.5 },
    "collect" : { src: "audio/collect.wav", volume: 0.3 },
    "boom" : { src: "audio/boom.wav", volume: 0.5 },
}

var audioContext = new AudioContext();

// Load audio files
Object.keys(SOUND_FX).forEach(function (key){
    var soundFx = SOUND_FX[key];
    soundFx.audio = new Audio(soundFx.src);   
    soundFx.audio.volume = soundFx.volume;
    soundFx.audio.addEventListener("canplaythrough", function () {
        if(!soundFx.loaded){
            console.log("Sound FX",this.src,"loaded") 
            soundFx.loaded = true;
        }
    })
    soundFx.source = fetch(soundFx.src).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error, status = ${response.status}`);
        }
        return response.arrayBuffer();
    })
    .then((buffer) => audioContext.decodeAudioData(buffer));

    soundFx.play = (pitch=undefined) => {
        soundFx.audio.currentTime = 0;
        if(pitch){            
            soundFx.source.then((buffer)=>{
                const source = new AudioBufferSourceNode(audioContext);
                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.gain = soundFx.volume;
                source.detune.value = pitch;
                source.start(0);
            });
        }else{
            soundFx.audio.play();
        }
        
    }
});