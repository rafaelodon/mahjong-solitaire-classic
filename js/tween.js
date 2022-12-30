var TweenType = {
    EASE_LOG : "log",
    EASE_EXP : "exp",
    EASE_LINEAR : "linear"
}

function Tween({obj, key, initialValue, endValue, durationMs, type=EASE_LINEAR, onFinishCallback=undefined}={}){     
    
    this.isRunning = false;
    this.hasFinished = false;
    this.startTime = undefined;     

    this.start = function (){
        //console.log(obj.id);
        this.startTime = Loop.lastTime;    
        obj[key] = initialValue;
        this.isRunning = true;
        this.hasFinished = false;
        return this;
    }

    this.stop = function(){
        this.isRunning = false;
        return this;
    }

    this.resume = function(){
        this.isRunning = true;
        return this;
    }

    this.update = function (){        
        if(this.isRunning){            

            var percent = 1.0;
            var loopCount = (Loop.lastTime - this.startTime) / (durationMs / Loop.fps)
            if (type == TweenType.EASE_LOG) {
                percent = Math.log10(1 + (loopCount / Loop.fps) * (9))
            } else if (type == TweenType.EASE_EXP) {
                percent = Math.exp(loopCount * Math.E / Loop.fps - 1) / (Math.E - 1)
            } else {                     
                percent = loopCount / Loop.fps;
            }
            
            if(percent < 0 || percent > 0.999){
                this.isRunning = false;
                this.hasFinished = true;
                obj[key] = endValue;
                if(onFinishCallback){
                    onFinishCallback(this);
                }
            }else{
                obj[key] = initialValue + ((endValue - initialValue) * percent);
            }
        }
    }    
}

var TweenManager = {

    tweens:[],

    /**
     * Add a Tween to be managed
     * 
     * @param {Tween} tween 
     */
    addTween : function (tween){
        TweenManager.tweens.push(tween);
    },

    update : function (){
        TweenManager.tweens.forEach((tween)=>{               
            tween.update();            
        });        
        //TweenManager.tweens = TweenManager.tweens.filter((t) => !t.hasFinished);        
    }
};