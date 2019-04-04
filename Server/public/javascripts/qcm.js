$(function () {
    var loading = $('#loadbar').hide();
    $("#quiz").hide();
    $('#finish').hide();
    /*   $(document)
       .ajaxStart(function () {
           loading.show();
       }).ajaxStop(function () {
           loading.hide();
       });*/
    loading.show();

    $("#SubmitBtn").on('click', function () {
        //var choice = $(this).find('input:radio').val();
        $("#quiz").hide();
        loading.show();
        let choices = [];
        for (let i = 0; i < $("#quiz").find("input:checked").length; i++) {
            let valueChoice = parseInt($("#quiz").find("input:checked")[i].value);
            if (!choices.includes(valueChoice)) {
                choices.push(valueChoice)
            }
        }
        dataSend = {
            "response": {
                "sessionId": localStorage.getItem("codingSessionId"),
                "categoryId": parseInt(localStorage.getItem("qcmCategoryId")),
                "questionId": parseInt($("#quiz").find("button").val()) - 1,
                "choiceIds": choices,
            },
            "nextQuestion": {
                "nextQuestionId": parseInt($("#quiz").find("button").val()),
                "nextCategoriId": parseInt(localStorage.getItem("qcmCategoryId"))
            }
        }
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://" + window.location.host + "/api/qcm/question",
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "cache-control": "no-cache",
                "Postman-Token": "3ce2f32c-ca2e-447d-848e-929f69914edc"
            },
            "processData": false,
            "data": JSON.stringify(dataSend)
        }

        $.ajax(settings).done(function (data) {
            console.log(data)
            if (data.response) {
                if (data.response.finish) {
                    console.log("vous avez fini")
                    stopCuntdown()
                    window.location.assign("/finish")
                } else {
                    localStorage.setItem("qcmCategoryId", data.response.question.categoryId)
                    localStorage.setItem("qcmQuestionId", data.response.questionId)
                    localStorage.setItem("qcmCurrentQuestion", data.response.question)
                    $("h3").text(data.response.question.questionText)
                    for (let i = 0; i < $("#quiz").find("input").length; i++) {
                        $("#quiz").find("label span[id=textLabel]")[i].innerHTML = data.response.choice[i].textResponse
                    }
                    $("#quiz").find("button").val(parseInt(data.response.questionId) + 1)
                    loading.hide();
                    $("#quiz").show();
                }
            } else {
                alert(data.error)
            }
        });
        $('#loadbar').show();
        $('#quiz').fadeOut();
        setTimeout(function () {
            $("#answer").html($(this).checking(choices));
            $('#quiz').show();
            $('#loadbar').fadeOut();
        }, 1500);
        $("label.btn").addClass("btn-light");
        $("label.btn").removeClass("btn-red");
        choices = [];
        $("#quiz").find("input:checked").prop("checked", false);
    });

    $("label.btn").on('mouseup', function () {
        if ($(this).hasClass("btn-light")) {
            $(this).removeClass("btn-light");
            $(this).addClass("btn-danger");
        } else {
            $(this).addClass("btn-light");
            $(this).removeClass("btn-red");
        }

    });


    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://" + window.location.host + "/api/qcm/start",
        "method": "GET",
        "headers": {
            "Content-Type": "application/json",
            "cache-control": "no-cache",
        },
        "processData": false,
        "data": ""
    }

    $.ajax(settings).done(function (data) {
        console.log(data)
        if (data.response) {
            if (!data.response.finish) {
                localStorage.setItem("qcmCategoryId", data.response.question.categoryId)
                localStorage.setItem("qcmQuestionId", data.response.questionId)
                localStorage.setItem("qcmCurrentQuestion", data.response.question)
                $("h3").text(data.response.question.questionText)
                console.log("before for")
                for (let i = 0; i < $("#quiz").find("input").length; i++) {
                    $("#quiz").find("label span[id=textLabel]")[i].innerHTML = data.response.choice[i].textResponse
                }
                $("#quiz").find("button").val(parseInt(data.response.questionId) + 1)
                startCountdown(data.response.timer)
                $("#quiz").show();
                loading.hide();
            } else {
                stopCuntdown()
                window.location.assign("/finish")
                console.log("vous avez fini")
            }
        } else {
            alert(data.error)
        }
    });

    $ans = 3;

    $.fn.checking = function (ck) {
        if (ck != $ans)
            return 'INCORRECT';
        else
            return 'CORRECT';
    };
    let x;

    let minutes;
    let seconds;
    function startCountdown(timer){
         minutes = parseInt(timer.minutes)
         seconds = parseInt(timer.seconds)
        x = setInterval(countdown, 1000);
    }
    function countdown() {
        if (minutes == undefined) {
            minutes = 30
        }
        if (seconds == undefined) {
            seconds = 60
        }
        if (minutes != undefined && seconds != undefined) {
            if (minutes == 0 && seconds == 0) {
                $('#questionnaire').hide();
                $("#finish").show();
                dataSend = {
                    response: localStorage.getItem("qcmCurrentQuestion"),
                    timer: {
                        minute: minutes,
                        second: seconds
                    }
                }
                var settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": "http://" + window.location.host + "/api/qcm/finish",
                    "method": "POST",
                    "headers": {
                        "Content-Type": "application/json",
                        "cache-control": "no-cache",
                    },
                    "processData": false,
                    "data": JSON.stringify(dataSend)
                }
                clearInterval(x)
                $.ajax(settings).done(function (data) {
                    console.log(data);
                    if (data.response) {
                        if (!data.response.finish) {

                        } else {

                        }
                    } else {
                        alert(data.error)
                    }
                });
            }
            if (seconds == 0) {
                minutes -= 1
                seconds = 60
            }
        }
        seconds -= 1;
        // Display the result in the element with id="demo"
        document.getElementById("timer").innerHTML =
            minutes + "m " + seconds + "s ";

    }
    function stopCuntdown(){
        clearInterval(x)
    }

});	