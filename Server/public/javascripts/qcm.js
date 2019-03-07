$(function(){
    var loading = $('#loadbar').hide();
    $('#finish').hide();
    $(document)
    .ajaxStart(function () {
        loading.show();
    }).ajaxStop(function () {
    	loading.hide();
    });
    
    $("#SubmitBtn").on('click',function () {
        //var choice = $(this).find('input:radio').val();
        let choices = [];
        for(let i = 0;i<$("#quiz").find("input:checked").length;i++){
            let valueChoice = parseInt($("#quiz").find("input:checked")[i].value);
            if(!choices.includes(valueChoice)){
                choices.push(valueChoice)
            }
        }
        dataSend = {
            "response":{
                "sessionId":  localStorage.getItem("codingSessionId"),
                "categoryId": parseInt(localStorage.getItem("qcmCategoryId")),
                "questionId":  parseInt($("#quiz").find("button").val())-1,
                "choiceIds": choices,
            },
            "nextQuestion":{
                "nextQuestionId": parseInt($("#quiz").find("button").val()),
                "nextCategoriId": parseInt(localStorage.getItem("qcmCategoryId"))
            }
        }
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://"+window.location.host+"/api/qcm/question",
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
            if(data.response){
                if(!data.response.finish){
                    localStorage.setItem("qcmCategoryId",data.response.question.categoryId)
                    localStorage.setItem("qcmQuestionId",data.response.questionId)
                    localStorage.setItem("qcmCurrentQuestion", data.response.question)
                    $("h3").text(data.response.question.questionText)
                    for(let i = 0;i<$("#quiz").find("input").length;i++){
                        $("#quiz").find("label span[id=textLabel]")[i].innerHTML = data.response.choice[i].textResponse
                    }
                    $("#quiz").find("button").val(parseInt(data.response.questionId)+1)
                }else{
                    $('#questionnaire').hide();
                    $("#finish").show();
                    countdown(2)
                }
            }else{
                alert(data.error)
            }
        });
    	$('#loadbar').show();
    	$('#quiz').fadeOut();
    	setTimeout(function(){
            $( "#answer" ).html($(this).checking(choices) );      
            $('#quiz').show();
            $('#loadbar').fadeOut();
        }, 1500);
        $("label.btn").addClass("btn-light");
        $("label.btn").removeClass("btn-red");
        choices = [];
        $("#quiz").find("input:checked").prop( "checked", false );
    });

    $("label.btn").on('mouseup',function () {
        if($(this).hasClass("btn-light")){
            $(this).removeClass("btn-light");
            $(this).addClass("btn-danger");
        }
        else {
            $(this).addClass("btn-light");
            $(this).removeClass("btn-red");
        }
    	
    });


    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://"+window.location.host+"/api/qcm/start",
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
        if(data.response){
            if(!data.response.finish){
                localStorage.setItem("qcmCategoryId",data.response.question.categoryId)
                localStorage.setItem("qcmQuestionId",data.response.questionId)
                localStorage.setItem("qcmCurrentQuestion", data.response.question)
                $("h3").text(data.response.question.questionText)
                console.log("before for")
                for(let i = 0;i<$("#quiz").find("input").length;i++){
                    $("#quiz").find("label span[id=textLabel]")[i].innerHTML = data.response.choice[i].textResponse
                }
                $("#quiz").find("button").val(parseInt(data.response.questionId)+1)
                countdown(1, data.response.timer)
            }else{
                $('#questionnaire').hide();
                $("#finish").show();
            }
        }else{
            alert(data.error)
        }
    });

    $ans = 3;

    $.fn.checking = function(ck) {
        if (ck != $ans)
            return 'INCORRECT';
        else 
            return 'CORRECT';
    };
    function countdown(action, timer){
        console.log(timer)
        var x
        let minutes = parseInt(timer.minutes)
        let seconds = parseInt(timer.seconds)
        // 1 st;art - 2 modify - 3 stop
        if(action == 1){
            x = setInterval(function() {
                console.log(minutes)
                console.log(seconds)
                if(minutes == undefined){
                    minutes = 30
                }
                if(seconds == undefined){
                    seconds = 60
                }
                if(minutes != undefined && seconds!= undefined){
                    if(minutes == 0){
                        clearInterval(x)
                        $('#questionnaire').hide();
                        $("#finish").show();
                        dataSend= {
                            response: localStorage.getItem("qcmCurrentQuestion"),
                            timer:{
                                minute: minutes,
                                second: seconds
                            }
                        }
                        var settings = {
                            "async": true,
                            "crossDomain": true,
                            "url": "http://"+window.location.host+"/api/qcm/finish",
                            "method": "POST",
                            "headers": {
                                "Content-Type": "application/json",
                                "cache-control": "no-cache",
                            },
                            "processData": false,
                            "data": ""
                        }

                        $.ajax(settings).done(function (data) {
                            console.log(data);
                            if(data.response){
                                if(!data.response.finish){

                                }else{

                                }
                            }else{
                                alert(data.error)
                            }
                        });
                    }
                    if(seconds == 0 && minutes > 0){
                        minutes-= 1
                        seconds = 60
                    }
                }
                seconds -= 1;
                // Display the result in the element with id="demo"
                document.getElementById("timer").innerHTML =
                    minutes + "m " + seconds + "s ";

                // If the count down is finished, write some text
                if(seconds == 10 || seconds ==  20 || seconds == 30 || seconds == 40 || seconds == 50 || seconds == 60){
                    $.ajax({async:true,crossDomain: true,url: "http://"+window.location.host+"/"})
                        .done(function (data) {

                        })
                        .fail(function() {
                            clearInterval(x)
                            $("#questionnaire").before("<h1> Erreur la connexion avec le serveur a était intérompue</h1>")
                            $("#questionnaire").remove()
                            $("#finish").remove()
                            //window.location.reload()
                        })
                }

            }, 1000);
        }else if(action == 2){
            clearInterval(x)
        }else{

        }
    }

});	