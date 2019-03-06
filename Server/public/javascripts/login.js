$(document).ready(function () {
    $("#loginForm").on('submit', function (e) {
        e.preventDefault();

        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://"+window.location.host+"/api/users/login",
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "cache-control": "no-cache",
            },
            "processData": false,
            "data": JSON.stringify({ user: { email: $("#email").val(), password: $("#password").val() } }),
            "error": function (xhr, ajaxOptions, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
            }
        }



         $.ajax(settings).done(function (data) {
            if (data.response) {
                console.log("Succeeded : ", data);
                localStorage.setItem("debug", data.response);
                localStorage.setItem("codingLogin", data.response.login);
                localStorage.setItem("codingPassword","");
                localStorage.setItem("codingSessionId", data.response.sessionId)
                window.location = "/explanationScreen";
            }
            else {
                alert("Error : " + data.error);
            }
        });
    });
});