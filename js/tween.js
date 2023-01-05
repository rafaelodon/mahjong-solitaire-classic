var TweenType = {
    EASE_IN : "log", // get slow until stop
    EASE_OUT : "exp", // start slow, get fast
    EASE_IN_OUT : "sin", // start slow, get fast, slow until stop    
    EASE_LINEAR : "linear"    
}

function Tween({obj, key, initialValue, endValue, unit=undefined, durationMs, type=EASE_LINEAR, onFinishCallback=undefined}={}){     
    
    this.isRunning = false;
    this.hasFinished = false;
    this.startTime = undefined;  
    this.duration = durationMs / Loop.fps;

    this.start = function (){        
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
            
            var percent = (Loop.lastTime - this.startTime) / this.duration / Loop.fps;                        
            percent = percent > 1.0 ? 1.0 : percent;

            if (type == TweenType.EASE_IN) {
                percent = Math.sin(percent/2 * Math.PI);
            } else if (type == TweenType.EASE_OUT) {
                percent = 1-Math.cos((percent/2) * Math.PI);
            } else if (type == TweenType.EASE_IN_OUT) {                 
               percent = (Math.tanh(((percent*2)-0.5)*2*Math.PI)+1)*0.5;               
            }
            
            if(percent < 0 || percent > 0.9999){
                this.isRunning = false;
                this.hasFinished = true;
                obj[key] = unit ? endValue + unit : endValue;
                if(onFinishCallback){
                    onFinishCallback(this);
                }
            }else{
                var finalValue = initialValue + ((endValue - initialValue) * percent);
                obj[key] = unit ? finalValue + unit : finalValue;
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