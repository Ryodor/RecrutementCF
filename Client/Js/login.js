$(document).ready(function(){
    $("#loginForm").on('submit', function(e){
        e.preventDefault();

        var settings = {
            "async": true,
            "crossDomain": true,
            "url":"http://localhost:3000/api/users/login",
            "method":"POST",
            "headers": {
                "Content-Type": "application/json",
                "cache-control": "no-cache"
            },
            "processData": false,
            "data": JSON.stringify({user:{email:$("#email").val(), password:$("#password").val()}}),
            "error": function (xhr, ajaxOptions, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
              }
        }

        $.ajax(settings).done(function(response) {
            if(response.response) {
                console.log( "Data Saved: ", response);
            }
            else {
                alert("Error : " + response.error);
            }
        });
    });
});