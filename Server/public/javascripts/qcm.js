$(function () {

    let categoriMax = 0;
    let categoriMin = 0;
    let questionMax = 0;
    let questionMin = 0;

    // load Page
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
    let choices = [];
    $("#SubmitBtn").on('click', function () {
        //var choice = $(this).find('input:radio').val();
        $("#quiz").hide();
        loading.show();

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
                    localStorage.removeItem("qcmCategoryId");
                    localStorage.removeItem("qcmQuestionId");
                    localStorage.removeItem("qcmCurrentQuestion");
                    localStorage.setItem("qcmCategoryId", data.response.question.categoryId);
                    localStorage.setItem("qcmQuestionId", data.response.questionId);
                    localStorage.setItem("qcmCurrentQuestion", data.response.question);
                    changePaginationPosition('#categoriePagination',data.response.question.categoryId,categoriMax,categoriMin);
                    changePaginationPosition('#questionPagination',data.response.questionId+1,questionMax,questionMin);
                    $("h3").text(data.response.question.questionText);
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
            $(this).removeClass("btn-danger");
        }
        if($(this).children("input").val() == 5){
            $(".known-choice").addClass("btn-light")
            $(".known-choice").removeClass("btn-danger")
            $(".known-choice").find("input:checked").prop("checked", false);
            console.log($("#quiz").children("label").last())

        }else{
            $(".unknown-choice").removeClass("btn-danger")
            $(".unknown-choice").addClass("btn-light")
            $(".unknown-choice").find("input:checked").prop("checked", false);
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
                categoriMin = data.response.categories[0].ID
                categoriMax = data.response.categories[data.response.categories.length-1].ID
                questionMin = questionMin+1
                questionMax = data.response.nbQuestions
                localStorage.clear()
                localStorage.setItem("qcmCategoryId", data.response.question.categoryId)
                localStorage.setItem("qcmQuestionId", data.response.questionId)
                localStorage.setItem("qcmCurrentQuestion", data.response.question)
                restoreCategoryPagiation(data.response.categories)
                restoreQuestionPagination(data.response.nbQuestions)
                clickOnButtonPagination()
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

    function restoreCategoryPagiation(categories){
        if(Array.isArray(categories)){
            let categoryIdNow = localStorage.getItem('qcmCategoryId')
            if(categoryIdNow > 1){
                $('#categoriePagination')
                    .append("<li class='page-item'><a class='page-link' value='"+(parseInt(categoryIdNow)-1)+"' href='#'>Previous</a></li>")
            }else{
                $('#categoriePagination')
                    .append("<li class='page-item disabled'><a class='page-link' href='#' tabindex='-1' aria-disabled='true'>Previous</a></li>")
            }

            categories.forEach(element=>{
                console.log(categoryIdNow)
                if(categoryIdNow == element.ID){
                    $('#categoriePagination')
                        .append("<li class='page-item disabled'><a class='page-link'  tabindex='-1' aria-disabled='true' href='#' value='"+element.ID+"'>"+element.categoryName+"</a></li>")
                }else{
                    $('#categoriePagination')
                        .append("<li class='page-item'><a class='page-link' value='"+element.ID+"' href='#'>"+element.categoryName+"</a></li>")
                }
            })
            if(categoryIdNow < 5) {
                $('#categoriePagination')
                    .append("<li class='page-item'><a class='page-link' value='" + (parseInt(categoryIdNow)+1) + "' href='#'>Next</a></li>")
            }else{
                $('#categoriePagination')
                    .append("<li class='page-item disabled'><a class='page-link' href='#' tabindex='-1' aria-disabled='true'>Next</a></li>")
            }
        }else
            return ;
    }

    function restoreQuestionPagination(nbQuestion){
        if(Number.isInteger(nbQuestion)){
            let questionIdNow = localStorage.getItem('qcmQuestionId')
            console.log("test")
            if(questionIdNow > 1){
                $('#questionPagination')
                    .append("<li class='page-item'><a class='page-link' value='"+(parseInt(questionIdNow)-1)+"' href='#'>Previous</a></li>")
            }else{
                $('#questionPagination')
                    .append("<li class='page-item disabled'><a class='page-link' href='#' tabindex='-1' aria-disabled='true'>Previous</a></li>")
            }
            for(let i = 0;i<=nbQuestion-1;i++){
                if(questionIdNow == i){
                    $('#questionPagination')
                        .append("<li class='page-item disabled'><a class='page-link'  tabindex='-1' aria-disabled='true' href='#' value='"+(i+1)+"'>"+(i+1)+"</a></li>")
                }else{
                    $('#questionPagination')
                        .append("<li class='page-item'><a class='page-link' value='"+(i+1)+"' href='#'>"+(i+1)+"</a></li>")
                }
            }
            if(questionIdNow < 5) {
                $('#questionPagination')
                    .append("<li class='page-item'><a class='page-link' value='" + (parseInt(questionIdNow)+1) + "' href='#'>Next</a></li>")
            }else{
                $('#questionPagination')
                    .append("<li class='page-item disabled'><a class='page-link' href='#' tabindex='-1'  aria-disabled='true'>Next</a></li>")
            }
        }else
            return ;
    }

    /**
     * @param modifField
     * @param idField
     * @param maxField
     * @param minField
     */
    function changePaginationPosition(modifField,idField, maxField, minField){
        console.log("CatMax :",maxField)
        console.log("CatMin :",minField)
        console.log("CatNow :",idField)
        if(idField > minField && idField < maxField){
            $(modifField).find('li.disabled').removeClass('disabled')
            $($(modifField).find('a')[idField]).parent().addClass('disabled')
            $($(modifField).find('a')[maxField+1]).attr('value',idField+1)
            $($(modifField).find('a')[minField-1]).attr('value',idField-1)
        }else if(idField == minField){
            $(modifField).find('li.disabled').removeClass('disabled')
            $(modifField).find('a[value='+idField+']').parent().addClass('disabled')
            console.log($($(modifField).find('li')[0]).addClass('disabled'))
            $($(modifField).find('a')[maxField+1]).attr('value',idField+1)
        }else if(idField == maxField){
            $(modifField).find('li.disabled').removeClass('disabled')
            $(modifField).find('a[value='+idField+']').parent().addClass('disabled')
            console.log("test :",($(modifField).find('li')[$(modifField).find('li').length-1]))
            $($(modifField).find('li')[$(modifField).find('li').length-1]).addClass('disabled')
            $($(modifField).find('a')[minField-1]).attr('value',idField-1)
        }
    }
    function clickOnButtonPagination(){

        // Catgeorie Partie
        $('#categoriePagination li a').click(e=>{
            e.preventDefault()
            $("#quiz").hide();
            choices = [];
            loading.show();
            console.log(e.target.innerHTML)
            console.log($(e.target).attr('value'))
            dataSend = {
                "nextQuestionId": parseInt($("#quiz").find("button").val()),
                "nextCategoriId": parseInt(localStorage.getItem("qcmCategoryId"))
            }
            var settings = {
                "async": true,
                "crossDomain": true,
                "url": "http://" + window.location.host + "/api/qcm/question",
                "method": "GET",
                "headers": {
                    "Content-Type": "application/json",
                    "cache-control": "no-cache",
                },
                "processData": false,
                "data": nextQuestionId= parseInt($(e.target).attr('value'))
            }
            $.get("http://" + window.location.host + "/api/qcm/question",{nextQuestionId: 0, nextCategoriId: parseInt($(e.target).attr('value'))
            }).done(function (data) {
                console.log(data)
                if (data.response) {
                    if (data.response.finish) {
                        console.log("vous avez fini")
                        stopCuntdown()
                        window.location.assign("/finish")
                    } else {
                        localStorage.clear()
                        localStorage.setItem("qcmCategoryId", data.response.question.categoryId)
                        localStorage.setItem("qcmQuestionId", data.response.questionId)
                        localStorage.setItem("qcmCurrentQuestion", data.response.question)
                        $("h3").text(data.response.question.questionText)
                        changePaginationPosition('#categoriePagination',data.response.question.categoryId,categoriMax,categoriMin);
                        changePaginationPosition('#questionPagination',data.response.questionId+1,questionMax,questionMin);
                        for (let i = 0; i < $("#quiz").find("input").length; i++) {
                            $("#quiz").find("label span[id=textLabel]")[i].innerHTML = data.response.choice[i].textResponse
                        }
                        $("#quiz").find("button").val(parseInt(data.response.questionId) + 1)
                        loading.hide();
                        $("#quiz").show();
                    }
                } else {
                    alert(data.error)
                    $('#categoriePagination').empty()
                }
            })
            $('#loadbar').show();
            $('#quiz').fadeOut();
            //changePaginationPosition('#categoriePagination',parseInt($(e.target).attr('value')),categoriMax,categoriMin)
        });

        // Question parti

        $('#questionPagination li a').click(e=>{
            e.preventDefault()
            $("#quiz").hide();
            choices = [];
            loading.show();
            console.log(e.target.innerHTML)
            console.log($(e.target).attr('value'))
            console.log("CatId : ", parseInt(localStorage.getItem("qcmCategoryId")))
            $.get("http://" + window.location.host + "/api/qcm/question",{nextQuestionId: parseInt($(e.target).attr('value'))-1, nextCategoriId: parseInt(localStorage.getItem("qcmCategoryId"))
            }).done(function (data) {
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
                    $('#questionPagination').empty()
                }
            })
            $('#loadbar').show();
            $('#quiz').fadeOut();
            changePaginationPosition('#questionPagination',parseInt($(e.target).attr('value')),questionMax,questionMin)
        });

    }


});	