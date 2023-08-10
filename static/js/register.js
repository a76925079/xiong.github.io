const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});
$(function() {

    refresh_code();
    $('#code-img').on('click', function(){
        refresh_code();
    });

    $('#register').on('click', function() {
        let user = $('#user').val().trim();
        let email = $('#email').val().trim();
        let pwd = $('#pwd').val().trim();
        let code = $('#code').val().trim();
        if (user == "" || email == "" || pwd == "" || code == "") {
            Toast.fire({
                icon: 'error',
                title: "内容不能为空！"
            });
            return;
        }
        $.ajax({
            url: "/api/register",
            type: "POST",
            dataType: "JSON",
            data: {user: user, email: email, pwd: pwd, code: code},
            success: function (res) {
                if (res.code == 200) {
                    Toast.fire({
                        icon: 'success',
                        title: "注册成功"
                    });
                    setInterval(function() {
                        window.location.href = "/login";
                    }, 2000);
                } else {
                    Toast.fire({
                        icon: 'error',
                        title: res.cont
                    });
                }
            },
            error: function (e) {
                Toast.fire({
                    icon: 'error',
                    title: "网络错误！"
                })
            }
        });

    });

    $("#code").keydown(function(e) {
        if (e.keyCode == 13) {
            $('#register').click();
        }
    });
});

function refresh_code() {
    $.ajax({
        url: "/code-img",
        type: "GET",
        dataType: "JSON",
        success: function(res){
            //console.log(res);
            $('#code-img').attr("src", res.cont);
        }
    });
}