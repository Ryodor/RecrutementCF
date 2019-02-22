$(document).ready(function () {

    var $first_name = $('#first_name'),
        $last_name = $('#last_name'),
        $email = $("#email"),
        $email_confirm =$("#email_confirm")


    $("#registerForm").on('submit', function (e) {
        e.preventDefault();
        if(!checkEmail() || !checkFirstName() || !checkLastName()) return;

        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://localhost:3000/api/users/register",
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "cache-control": "no-cache"
            },
            "processData": false,
            "data": JSON.stringify({user:{lastName:$last_name.val(), firstName:$first_name.val(), email:$email.val(), birthdate:$("#birthDate").val()}}),
            "error": function(xhr, ajaxOptions, thrownError){
                console.log(xhr.status);
                console.log(thrownError);
            }
        }

        $.ajax(settings).done(function(response){
            if(response.response){
                console.log("Succeeded : ", response);
            }
            else {
                alert("Error : " + response.error);
            }
        })
    });

    $last_name.on("change", function(){
        checkLastName();
    });

    $first_name.on('change', function(){
         checkFirstName();
    });

    $email_confirm.on("change", function(){
        checkEmail();
    });

    fillFormationSelects();
    getLanguages();
});



checkEmail = function(){
    if($email_confirm.val() != $email.val()){ // si la chaîne de caractères est inférieure à 6
        $email_confirm.addClass("invalid-field");
        return false;
    }
    else{
        $email_confirm.removeClass("invalid-field");
        return true;
    }
}
checkLastName = function(){
    if ($last_name.val().length < 1) { // si la chaîne de caractères est inférieure à 6
        $last_name.addClass("invalid-field");
        return false;
    }
    else {
        $last_name.removeClass("invalid-field");
        return true;
    }
}
checkFirstName = function(){
    if ($first_name.val().length < 1) { // si la chaîne de caractères est inférieure à 6
        $first_name.addClass("invalid-field");
        return false;
    }
    else {
        $first_name.removeClass("invalid-field");
        return true;
    }
}


fillFormationSelects = function(){
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/api/users/formations",
        "method": "GET",
        "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache"
        },
        "error": function(xhr, ajaxOptions, thrownError){
            console.log(xhr.status);
            console.log(thrownError);
        }
    }

    $.ajax(settings).done(function(data){
        if(data.response){

            var content = '<option value="" disabled selected>---</option>';
            for(var i = 0; i<data.response.formations.length; i++){
                var name = data.response.formations[i].name == "Cdsm" ? "Concepteur Développeur de Solutions Mobiles" : data.response.formations[i].name;
                content += '<option value="'+data.response.formations[i].ID+'">'+name+'</option>';
            }
            $("#formationNameSelect").html(content);

            content = '<option value="" disabled selected>---</option>';
            for(var i = 0; i<data.response.cities.length; i++){
                content += '<option value="'+data.response.cities[i].ID+'">'+data.response.cities[i].name+'</option>';
            }
            $("#formationCitiesSelect").html(content);

            content = '<option value="" disabled selected>---</option>';
            for(var i = 0; i<data.response.types.length; i++){
                var name = data.response.types[i].name == "TP" ? "Temps Plein" : data.response.types[i].name;
                content += '<option value="'+data.response.types[i].ID+'">'+name+'</option>';
            }
            $("#formationTypesSelect").html(content);
        }
        else {
            alert("Error : " + data.error);
        }
    })
}

getLanguages = function(){
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/api/users/lang",
        "method": "GET",
        "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache"
        },
        "error": function(xhr, ajaxOptions, thrownError){
            console.log(xhr.status);
            console.log(thrownError);
        }
    }

    $.ajax(settings).done(function(data){
        if(data.response){

            for(var i = 0; i<data.response.languages.length; i++){
                var myLabel = document.createElement("label");
                var myCheckbox = document.createElement("input");
                $(myCheckbox).attr("type",'checkbox');
                $(myCheckbox).attr("value",data.response.languages[i].ID);
                $(myCheckbox).appendTo($(myLabel));      
                
                var mySpan = document.createElement("span")
                $(mySpan).text(data.response.languages[i].languageName);
                $(mySpan).appendTo($(myLabel));       

                $("#langContainer").append($(myLabel));
            }
            console.log(content);
            
            console.log(content);
        }
        else {
            alert("Error : " + data.error);
        }
    })
}
