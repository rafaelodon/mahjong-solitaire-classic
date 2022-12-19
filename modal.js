function Modal(title, body, okCallBack, cancelCallBack){    
    var modal = document.getElementById("modal");    
    var modalHeader = document.getElementById("modalHeader");
    var modalBody = document.getElementById("modalBody");
    var modalOkButton = document.getElementById("modalOkButton");
    var modalCancelButton = document.getElementById("modalCancelButton");
    var onClickOk = () => {};
    var onCancel = () => {};

    modalOkButton.addEventListener('click', () => {
        onClickOk();
        this.hide(); 
    });

    modalCancelButton.addEventListener('click', () => {
        onCancel()
        this.hide();
    });        

    this.hide = function(callBack){
        if(callBack){
            callBack();
        }
        modal.className = "modalHidden";
    }    

    modalHeader.textContent = title;
    modalBody.textContent = body;        
    modal.className = "modalVisible";
    
    onClickOk = okCallBack ? okCallBack : () => {};        
    onCancel = cancelCallBack ? cancelCallBack : () => {};                
}