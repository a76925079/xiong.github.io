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
let Tb;

$(function (){
    var inst = new mdui.Drawer('#mdui-drawer');
    $('#menu').click(function(){
        inst.toggle();
    });

    let userDialog = new mdui.Dialog("#newUser", {modal: true});
    Tb = $('#user-manager');
    let query = "/api/user-data";

    Tb.bootstrapTable({
        url: query,
        pagination: true,
        sidePagination:"client",
        pageNumber:1,
        pageSize: 100,
        pageList: [10, 25, 50, 100],
        search: true,
        sortable: true,
        showRefresh: true,
        toolbar: "#toolbar",
        // clickToSelect: true,
        // showToggle: true,
        columns: [
            {
                field: 'Id',
                title: 'ID'
            }, {
                field: 'Name',
                title: '用户名'
            }, {
                field: 'Email',
                title: "邮箱"
            }, {
                field: 'Auth',
                title: "权限",
                formatter: function(row, data) {
                    if (data.Auth === 0) {
                        return '<span class="badge badge-secondary">普通用户</span>';
                    } else if (data.Auth === 1){
                        return '<span class="badge badge-success">高级会员</span>';
                    } else if (data.Auth === 2){
                        return '<span class="badge badge-danger">超级管理员</span>';
                    }
                }
            }, {
                field: 'JoinDate',
                title: '注册时间'
            }, {
                field:'ID',
                title: '管理',
                width: 150,
                align: 'center',
                valign: 'middle',
                formatter: actionFormatter
            }]
    });

    $('#useradd').on('click', function() {
        userDialog.open();
    });

    mdui.$('#newUser').on('confirm.mdui.dialog', function () {
        let user = $('#username');
        let pwd = $('#pwd');
        let pwd1 = $('#check-pwd');
        let email = $('#email');
        let auth = $('#auth');
        if (user.val().trim() == "" || pwd.val().trim() == "" || pwd1.val().trim() == "" || email.val().trim() == "") {
            Toast.fire({
                icon: 'error',
                title: "不能为空"
            });
            user.val("");
            pwd.val("");
            pwd1.val("");
            email.val("");
            return
        }

        if (pwd.val() !== pwd1.val()) {
            Toast.fire({
                icon: 'error',
                title: "密码不一致，请重新输入"
            });
            user.val("");
            pwd.val("");
            pwd1.val("");
            email.val("");
            return
        }
        // /add-user
        $.ajax({
            url: "/api/add-user",
            dataType: "JSON",
            type: "POST",
            data: {user: user.val().trim(), pwd: pwd.val().trim(), email: email.val().trim(), auth: auth.val()},
            success: function(res) {
                if (res.code === 200) {
                    Toast.fire({
                        icon: 'success',
                        title: "新增成功"
                    });
                    Tb.bootstrapTable("refresh");
                } else {
                    Toast.fire({
                        icon: 'error',
                        title: res.cont
                    });
                }
            },
            error: function(e) {
                Toast.fire({
                    icon: 'error',
                    title: "网络错误"
                });
            }
        });
        user.val("");
        pwd.val("");
        pwd1.val("");
        email.val("");
    });

});

function actionFormatter(value, row) {
    var auth = row.Auth;
    var id = row.Id
    if (auth === 2) {
        return "无法操作";
    }
    var result = '<div class="btn-group" role="group" aria-label="Button group with nested dropdown">\n' +
        '  <button type="button" class="btn btn-primary btn-xs" onclick="changeAuth('+id+')">权限</button>\n' +
        '  <button type="button" class="btn btn-warning btn-xs" onclick="changePwd('+id+',\''+row.Name+'\')">改密</button>\n' +
        '  <button type="button" class="btn btn-danger btn-xs" onclick="deleteUser('+id+',\''+row.Name+'\')">删除</button>\n' +
        '</div>';
    return result;
}

function changeAuth(uid) {
    const { value: fruit } = Swal.fire({
        title: '修改用户权限',
        input: 'select',
        inputOptions: {
            "general": '普通用户',
            "vip": '高级会员'
        },
        inputPlaceholder: '选择权限',
        showCancelButton: true,
        confirmButtonText: "修改",
        cancelButtonText: "取消",
        inputValidator: (value) => {
            return new Promise((resolve) => {
                let auth = 0;
                if (value === "general") {
                    auth = 0;
                } else if (value === "vip") {
                    auth = 1;
                } else {
                    Toast.fire({
                        icon: 'error',
                        title: "请选择权限"
                    });
                    return;
                }
                $.ajax({
                    url: "/api/change-auth",
                    type: "POST",
                    dataType: "JSON",
                    data: {uid: uid, auth: auth},
                    success: function (res) {
                        if (res.code === 200) {
                            Toast.fire({
                                icon: 'success',
                                title: "修改成功"
                            });
                            Tb.bootstrapTable("refresh");
                        } else {
                            Toast.fire({
                                icon: 'error',
                                title: res.cont
                            });
                        }
                    },
                    error: function () {
                        Toast.fire({
                            icon: 'error',
                            title: "网络错误"
                        });
                    }
                });
            })
        }
    })

}

async function changePwd(uid, user) {
    const {value: password} = await Swal.fire({
        title: '修改用户密码：' + user,
        input: 'password',
        // inputLabel: '输入新密码',
        inputPlaceholder: '输入新密码',
        confirmButtonText: "确认修改",
        inputAttributes: {
            maxlength: 18,
            autocapitalize: 'off',
            autocorrect: 'off'
        }
    })

    if (password == undefined) {
        return;
    }

    $.ajax({
        url: "/api/change-pwd",
        type: "POST",
        dataType: "JSON",
        data: {uid: uid, pwd: password},
        success: function (res) {
            if (res.code === 200) {
                Toast.fire({
                    icon: 'success',
                    title: "修改成功"
                });
                // Tb.bootstrapTable("refresh");
            } else {
                Toast.fire({
                    icon: 'error',
                    title: res.cont
                });
            }
        },
        error: function () {
            Toast.fire({
                icon: 'error',
                title: "网络错误"
            });
        }
    });



}

function deleteUser(uid, user) {
    const swalWithBootstrapButtons = Swal.mixin();
    swalWithBootstrapButtons.fire({
        title: '是否删除用户：'+user+'?',
        text: "删除后无法恢复!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: "/api/delete-user",
                type: "POST",
                dataType: "JSON",
                data: {uid: uid},
                success: function (res) {
                    if (res.code === 200) {
                        Toast.fire({
                            icon: 'success',
                            title: "删除成功"
                        });
                        Tb.bootstrapTable("refresh");
                    } else {
                        Toast.fire({
                            icon: 'error',
                            title: res.cont
                        });
                    }
                },
                error: function () {
                    Toast.fire({
                        icon: 'error',
                        title: "网络错误"
                    });
                }
            });
        }
    })
}
