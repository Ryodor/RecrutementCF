$(function(){
    var loading = $('#loadbar').hide();
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
            console.log(valueChoice)
            if(!choices.includes(valueChoice)){
                choices.push(valueChoice)
            }
        }
        console.log(choices);
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
        console.log("dataSend", dataSend)
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://localhost:3000/api/qcm/question",
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
            console.log(data);
            localStorage.setItem("qcmCategoryId",data.response.question.categoryId)
            localStorage.setItem("qcmQuestionId",data.response.questionId)
            $("h3").text(data.response.question.questionText)
            console.log("before for")
            for(let i = 0;i<$("#quiz").find("input").length;i++){
                $("#quiz").find("label span[id=textLabel]")[i].innerHTML = data.response.choice[i].textResponse
                console.log($("#quiz").find("label span[id=textLabel]")[i].innerHTML)
            }
            console.log(data.response.questionId+1)
            $("#quiz").find("button").val(parseInt(data.response.questionId)+1)
            console.log("after for")
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
        "url": "http://localhost:3000/api/qcm/start",
        "method": "GET",
        "headers": {
          "Content-Type": "application/json",
          "cache-control": "no-cache",
        },
        "processData": false,
        "data": ""
      }

    $.ajax(settings).done(function (data) {
        console.log(data);
        localStorage.setItem("qcmCategoryId",data.response.question.categoryId)
        localStorage.setItem("qcmQuestionId",data.response.questionId)
        $("h3").text(data.response.question.questionText)
        console.log("before for")
        for(let i = 0;i<$("#quiz").find("input").length;i++){
            $("#quiz").find("label span[id=textLabel]")[i].innerHTML = data.response.choice[i].textResponse
            console.log($("#quiz").find("label span[id=textLabel]")[i].innerHTML)
        }
        console.log(data.response.questionId+1)
        $("#quiz").find("button").val(data.response.questionId+1)
        console.log("after for")
    });

    $ans = 3;

    $.fn.checking = function(ck) {
        if (ck != $ans)
            return 'INCORRECT';
        else 
            return 'CORRECT';
    }; 

});	