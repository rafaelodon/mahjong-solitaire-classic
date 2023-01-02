/**
 * A modal window with header, body, ok and cancel buttons.
 * 
 */
function Modal({
    modalId="modal",
    modalHeaderClass="modalHeader",
    modalBodyClass="modalBody",
    modalOkButtonClass="modalOkButton",
    modalCancelButtonClass="modalCancelButton",
    visibleClass="animatedVisible",
    hiddenClass="animatedHidden",    
}={}){ 
    this.modal = document.getElementById(modalId);    
    this.modalHeader = modal.getElementsByClassName(modalHeaderClass)[0];
    this.modalBody = modal.getElementsByClassName(modalBodyClass)[0];
    this.modalOkButton = modal.getElementsByClassName(modalOkButtonClass)[0];
    this.modalCancelButton = modal.getElementsByClassName(modalCancelButtonClass)[0];
    this.visibleClass = visibleClass;
    this.hiddenClass = hiddenClass;

    this.innerOkCallback = undefined;
    this.innerCancelCallback = undefined;       

    this.modalOkButton.addEventListener('click', () => {
        if(this.innerOkCallback){
            this.innerOkCallback(this);
        }else{
            this.hide();
        }
    });    

    this.modalCancelButton.addEventListener('click', () => {
        if(this.innerCancelCallback){
            this.innerCancelCallback(this);
        }else{
            this.hide();
        }
    }); 
}       
    
Modal.prototype.show = function({
        headerContent="",
        bodyContent="",        
        okButtonText="Ok",
        cancelButtonText="Cancel",
        okCallback=undefined,
        cancelCallback=undefined
    }={}){
    this.innerOkCallback = okCallback;
    this.innerCancelCallback = cancelCallback;

    // hides Ok Button if its text is undefined
    if(okButtonText){
        this.modalOkButton.style.display = "visible"; 
        this.modalOkButton.innerHTML = okButtonText;
    }else{
        this.modalOkButton.style.display = "none"; 
    }

    // hides Cancel Button if its text is undefined
    if(cancelButtonText){
        this.modalCancelButton.style.display = "visible"; 
        this.modalCancelButton.innerHTML = cancelButtonText;
    }else{        
        this.modalCancelButton.style.display = "none"; 
    }        


    this.modalHeader.innerHTML = headerContent;
    this.modalBody.innerHTML = bodyContent;        
    this.modal.className = this.visibleClass;    
}    

Modal.prototype.hide = function(callBack=undefined){
    if(callBack){
        callBack();
    }
    this.modal.className = this.hiddenClass;
}