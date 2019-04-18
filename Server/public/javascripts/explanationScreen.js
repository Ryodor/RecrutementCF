$(document).ready(function () {
    
    $("#EmailInfo").html('Email : '+localStorage.getItem('codingLogin'));
    $("#PasswordInfo").html('Password : '+localStorage.getItem('codingPassword'));
    
    $("#startQcm").on('click', function(e){
        e.preventDefault()
        localStorage.removeItem("codingPassword")
        window.location.assign("/qcm")
    })

});