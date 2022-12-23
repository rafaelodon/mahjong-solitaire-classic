function Modal(visibleClass="animatedVisible", hiddenClass="animatedHidden"){ 
    var modal = document.getElementById("modal");    
    var modalHeader = document.getElementById("modalHeader");
    var modalBody = document.getElementById("modalBody");
    var modalOkButton = document.getElementById("modalOkButton");
    var modalCancelButton = document.getElementById("modalCancelButton");
    var visibleClass = visibleClass;
    var hiddenClass = hiddenClass;

    var _okCallback = undefined;
    var _cancelCallback = undefined;   

    modalOkButton.addEventListener('click', () => {
        if(_okCallback){
            _okCallback(this);
        }
        this.hide();
    });    

    modalCancelButton.addEventListener('click', () => {
        if(_cancelCallback){
            _cancelCallback(this);
        }
        this.hide();
    });        

    
    this.show = function(title,body,okCallback=undefined,cancelCallback=undefined,okButtonText="Ok",cancelButtonText="Cancel"){
        _okCallback = okCallback;
        _cancelCallback = cancelCallback;

        modalHeader.textContent = title;
        modalBody.textContent = body;        
        modal.className = visibleClass;    
    }    

    this.hide = function(callBack=undefined){
        if(callBack){
            callBack();
        }
        modal.className = hiddenClass;
    }    

                    
}