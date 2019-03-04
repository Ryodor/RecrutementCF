$(function(){
    var loading = $('#loadbar').hide();
    $(document)
    .ajaxStart(function () {
        loading.show();
    }).ajaxStop(function () {
    	loading.hide();
    });
    
    $("#SubmitBtn").on('click',function () {
    	var choice = $(this).find('input:radio').val();
    	$('#loadbar').show();
    	$('#quiz').fadeOut();
    	setTimeout(function(){
            $( "#answer" ).html(  $(this).checking(choice) );      
            $('#quiz').show();
            $('#loadbar').fadeOut();
        }, 1500);
        $("label.btn").addClass("btn-light");
        $("label.btn").removeClass("btn-red");
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

    $ans = 3;

    $.fn.checking = function(ck) {
        if (ck != $ans)
            return 'INCORRECT';
        else 
            return 'CORRECT';
    }; 
});	