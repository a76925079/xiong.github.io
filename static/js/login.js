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
const key1 = "Sm7M,z9to'Z@~=SB";

$(function() {
    refresh_code();
    $('#code-img').on('click', function(){
        refresh_code();
    });


    $('#login').on('click', function() {
        let user = $('#user').val().trim();
        let pwd = $('#pwd').val().trim();
        let code = $('#code').val().trim();
        if (user == "" || pwd == "" || code == ""){
            Toast.fire({
                icon: 'error',
                title: "内容不能为空！"
            });
            return;
        }

        let time = new Date().getTime();
        let str_data ={
            user: user,
            pwd: pwd,
            time: time.toString()
        };
        let data = encodeAes(JSON.stringify(str_data));
        console.log(data);

        $.ajax({
            url: "/api/login",
            type: "POST",
            dataType: "JSON",
            data: {"user": data, "code": code},
            success: function(res) {
                if (res.code === 200) {
                    Toast.fire({
                        icon: 'success',
                        title: "登录成功"
                    });
                    setInterval(function() {
                        window.location.href = "/";
                    }, 2000);
                } else {
                    Toast.fire({
                        icon: 'error',
                        title: res.cont
                    });
                    refresh_code();
                    $('#code').val("");
                }
            },
            error: function(e) {
                Toast.fire({
                    icon: 'error',
                    title: "网络错误！"
                });
                refresh_code();
                $('#code').val("");
            }
        });

    });

    $("#code").keydown(function(e) {
        if (e.keyCode == 13) {
            $('#login').click();
        }
    });
})

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


function encodeAes(plaintText) {
    var key = CryptoJS.enc.Utf8.parse(key1);

    var encryptedData = CryptoJS.AES.encrypt(plaintText, key, {
        iv: key,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    // console.log("加密前：" + plaintText);
    // console.log("加密后：" + encryptedData);    //Pkcs7:   WoCzvm6eZiM4/bx5o/CzGw==

    // console.log("加密后 base64：" + encryptedData.ciphertext.toString(CryptoJS.enc.Base64));
    encryptedData = encryptedData.ciphertext.toString();
    //console.log("加密后-no-hex：" + encryptedData);
    return encryptedData
}
