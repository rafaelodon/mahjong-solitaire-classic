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
}

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
    soundFx.play = () => {
        soundFx.audio.currentTime = 0;
        soundFx.audio.play();
    }
});