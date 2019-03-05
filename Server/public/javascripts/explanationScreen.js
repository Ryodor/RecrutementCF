$(document).ready(function () {
    
    $("#EmailInfo").html('<p>Email : '+localStorage.getItem('codingLogin')+'</p>');
    $("#PasswordInfo").html('<p>Password : '+localStorage.getItem('codingPassword')+'</p>');
    
    $("#startQcm").on('click', function(e){
        e.preventDefault()
        localStorage.removeItem("codingPassword")
        window.location.assign("/qcm")
    })

});