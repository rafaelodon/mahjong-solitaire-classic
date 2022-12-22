function Modal(title, body, okCallBack, cancelCallBack){    
    var modal = document.getElementById("modal");    
    var modalHeader = document.getElementById("modalHeader");
    var modalBody = document.getElementById("modalBody");
    var modalOkButton = document.getElementById("modalOkButton");
    var modalCancelButton = document.getElementById("modalCancelButton");
    var onClickOk = () => {};
    var onCancel = () => {};

    modalOkButton.addEventListener('click', () => {
        onClickOk(this);
        this.hide(); 
    });

    modalCancelButton.addEventListener('click', () => {
        onCancel(this)
        this.hide();
    });        

    this.hide = function(callBack){
        if(callBack){
            callBack();
        }
        modal.className = "animatedHidden";
    }    

    modalHeader.textContent = title;
    modalBody.textContent = body;        
    modal.className = "animatedVisible";
    
    onClickOk = okCallBack ? okCallBack : () => {};        
    onCancel = cancelCallBack ? cancelCallBack : () => {};                
}