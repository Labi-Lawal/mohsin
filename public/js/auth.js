$(document).ready(function(){
    $('button.signin').click(function(){
        $.ajax({
            type: 'POST',
            url: '/auth',
            dataType: 'json',
            data: {username: $('input.username').val(), password: $('input.password').val()},
            success: (data)=>{
                console.log();
            },
            error: (data)=>{
                console.log(data);
            }
        });
    });
}); 