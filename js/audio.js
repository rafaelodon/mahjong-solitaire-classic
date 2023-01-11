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
    "blub" : { src: "audio/blub.wav", volume: 0.5 },
    "horn" : { src: "audio/horn.wav", volume: 0.5 },
    "ah" : { src: "audio/ah.wav", volume: 0.5 },
    "victory" : { src: "audio/victory.mp3", volume: 1.0 },
    "death" : { src: "audio/death.mp3", volume: 0.5 },
    "piano" : { src: "audio/piano.wav", volume: 0.4 },
    "boom" : { src: "audio/boom.wav", volume: 0.7 },
    "wood" : { src: "audio/wood.wav", volume: 0.5 },
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
    
    loadBuffer(soundFx);
    
    soundFx.play = (pitch=undefined) => {
        soundFx.audio.currentTime = 0;
        if(pitch){                        
            var source = new AudioBufferSourceNode(audioContext);
            source.buffer = soundFx.buffer;
            source.detune.value = pitch;

            var gainNode = new GainNode(audioContext);
            gainNode.gain.value = soundFx.volume;
            
            source.connect(gainNode).connect(audioContext.destination);
                        
            source.start(0);            
        }else{
            soundFx.audio.play();
        }
        
    }
});

function loadBuffer(soundFx) {
    fetch(soundFx.src)
        .then((response) => response.arrayBuffer())
        .then((buffer) => audioContext.decodeAudioData(buffer))
        .then((audioData) => {
            console.log(audioData);
            soundFx.buffer = audioData;
            console.log(soundFx.buffer);
        });        
}