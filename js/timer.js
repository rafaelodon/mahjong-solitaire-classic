function Timer(){
    this.ellapsedMilliseconds = 0;
    this.running = false;        

    this.startOrResume = function(givenEllapsedMilliseconds=undefined){              
        if(givenEllapsedMilliseconds){
            this.ellapsedMilliseconds = givenEllapsedMilliseconds;
        }
        this.running = true;
    }

    this.pause = function(){        
        this.running = false;
    }

    this.stop = function(){        
        this.running = false;
        this.ellapsedMilliseconds = 0;
    }

    this.reset = function(){        
        this.stop();        
        this.startOrResume();
    }


    this.getEllapsedMillliseconds = function() {
        return this.ellapsedMilliseconds;
    }

    this.isRunning = function(){
        return this.running;
    }

    setInterval(() => {
        if(this.running){
            this.ellapsedMilliseconds += 1000;
        }        
    },1000);    
}