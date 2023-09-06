const hideAlerts =() => {
    const el = document.querySelector(".alert");
    if(el) el.parentElement.removeChild(el);
}

export const showAlerts =(type, msg) => {  
    hideAlerts();
    const htmlCode = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", htmlCode);
    window.setTimeout(hideAlerts, 4000)
}
