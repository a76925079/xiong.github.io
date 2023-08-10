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
})
$(function(){
    var inst = new mdui.Drawer('#mdui-drawer');
    $('#menu').click(function(){
        inst.toggle();
    });
});
function saveSet() {
    let title = $('#webTitle').val().trim();
    let beian = $('#beian').val().trim();
    let isreg = $('#isreg').prop("checked");
    let auth = $("input[name='group1']");

    $.ajax({
        url: "/api/change-set",
        type: "POST",
        dataType: "JSON",
        data: {title: title, isreg: isreg, auth: auth[0].checked, beian: beian},
        success: function (res) {
            if (res.code == 200) {
                Toast.fire({
                    icon: 'success',
                    title: "保存成功"
                });
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
                title: "网络错误"
            });
        }
    });
    console.log(title, isreg, auth[0].checked );
}