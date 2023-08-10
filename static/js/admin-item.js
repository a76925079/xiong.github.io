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
let newItem = new mdui.Dialog("#newItem", {modal: true});
let Tb;
$(function() {
    var inst = new mdui.Drawer('#mdui-drawer');
    $('#menu').click(function(){
        inst.toggle();
    });

    Tb = $('#user-manager');
    let query = "/api/get-items";

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
                title: 'ID',
                width: 80,
            }, {
                field: 'Title',
                title: '名称'
            },  {
                field: 'Url',
                title: '网址',
                width: 200,
                formatter: function(row, data) {
                    return '<a href="'+data.Url+'" target="_blank" class="text-indigo text-decoration-none" title="'+data.Url+'"><div class="mdui-text-truncate" style="max-width: 200px;">'+data.Url+'</div></a>';
                }
            },{
                field: 'TypeName',
                title: "所属分组",
                width: 120,
                sortable:true,
            },{
                field: 'Note',
                title: "说明"
            },{
                field: 'Auth',
                title: "访问权限",
                formatter: function (row, data){
                    if (data.Auth == 0) {
                        return '<span class="badge badge-secondary">普通用户</span>';
                    } else if (data.Auth == 1) {
                        return '<span class="badge badge-success">高级会员</span>';
                    } else if (data.Auth == 2) {
                        return '<span class="badge badge-danger">超级管理员</span>';
                    }
                }
            },{
                field:'ID',
                title: '管理',
                width: 110,
                align: 'center',
                valign: 'middle',
                formatter: actionFormatter
            }]
    });

    $('#additemform').on('submit', function() {
        let json = $('#additemform').serializeArray();
        console.log(json);
        let sub_data = {};
        for (const k of json) {
            sub_data[k.name] = k.value;
        }
        sub_data["icon"] = $('#web-img')[0].src;
        if (sub_data.web == "" || sub_data.webname == "") {
            return;
        }
        sub_data["iconName"] = get_web_domain(sub_data.web);
        $.ajax({
            url: "/api/add-items",
            data: sub_data,
            type: "POST",
            dataType: "JSON",
            success: function (res) {
                if (res.code == 200) {
                    Toast.fire({
                        icon: 'success',
                        title: "OK"
                    });
                    Tb.bootstrapTable("refresh");
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
        console.log(sub_data);
        document.getElementById("additemform").reset();
        newItem.close();
        return false;
    });

});

function get_web_domain(url) {
    var urlReg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;
    var url = urlReg.exec(url);
    return url[0];
}

function get_web_ico(web) {
    //https://api.iowen.cn/favicon
    var urlReg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;
    var url;
    if(checkURL(web)) {
        url=urlReg.exec(web);
        // console.log(url[0]);
        let img = "https://api.iowen.cn/favicon/"+url[0]+".png";
        $('#web-img').attr('src', img);
    }

}



function checkURL(URL) {
    var str = URL;
    var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
    var objExp = new RegExp(Expression);
    if (objExp.test(str) == true) {
        return true;
    } else {
        return false;
    }
}



function actionFormatter(value, row) {

    var id = row.Id;
    var result = '<div class="btn-group" role="group" aria-label="Button group with nested dropdown">\n' +
        '  <button type="button" class="btn btn-warning btn-xs" onclick="moveType('+id+')" mdui-tooltip="{content: \'移动分组\'}"><i class="fa-solid fa-arrow-right-arrow-left"></i></button>\n' +
        '  <button type="button" class="btn btn-success btn-xs" onclick="edit('+id+',\''+row.Title+'\',\''+row.Note+'\',\''+row.Url+'\')" mdui-tooltip="{content: \'编辑\'}"><i class="fa-solid fa-pen-nib"></i></button>\n' +
        '  <button type="button" class="btn btn-danger btn-xs" onclick="deleteType('+id+',\''+row.Title+'\')" mdui-tooltip="{content: \'删除\'}">' +
        '<i class="fa-solid fa-trash"></i></button>\n' +
        '</div>';
    return result;
}

function addType() {
    newItem.open();
    // let type_data;
    // // 设置同步
    // $.ajaxSettings.async = false;
    // $.post("/api/parent-type",function(data){
    //     type_data = data;
    // },"json");
    // let option = '';
    // for (const k of type_data) {
    //     option += '<option value="'+k.Id+'">'+k.Name+'</option>\n';
    // }
    // const {value: formValues} = await Swal.fire({
    //     title: '新增分类',
    //     html:
    //         '<label for="name">分类名称</label>' +
    //         '<input id="name" class="swal2-input"><br>' +
    //         '<label for="icon">图标</label>' +
    //         '<input id="icon" class="swal2-input"><br>' +
    //         '<label for="par">父分类</label>' +
    //         '<select id="par" class="swal2-select">' +
    //         '<option value="0">无</option>'+option+
    //         '</select>' ,
    //     focusConfirm: false,
    //     preConfirm: () => {
    //         let ico = $('#icon').val().trim();
    //         let new_ico = "";
    //         if (ico != "") {
    //             new_ico = ico.replace('class="', 'class="mdui-list-item-icon mdui-icon ');
    //         }
    //         return {
    //             name: $('#name').val().trim(),
    //             icon: new_ico,
    //             pare: $('#par').val().trim()
    //         }
    //     }
    // })
    //
    // if (formValues) {
    //
    //     if (formValues.name == "") {
    //         Toast.fire({
    //             icon: 'error',
    //             title: "名称为空"
    //         });
    //         return;
    //     }
    //     // 设置异步
    //     $.ajaxSettings.async = true;
    //     $.ajax({
    //         url: "/api/add-type",
    //         data: formValues,
    //         type: "POST",
    //         dataType: "JSON",
    //         success: function (res) {
    //             if (res.code === 200) {
    //                 Toast.fire({
    //                     icon: 'success',
    //                     title: "新增分类成功"
    //                 });
    //                 Tb.bootstrapTable("refresh");
    //             } else {
    //                 Toast.fire({
    //                     icon: 'error',
    //                     title: res.cont
    //                 });
    //             }
    //         },
    //         error: function (e) {
    //             Toast.fire({
    //                 icon: 'error',
    //                 title: "网络错误"
    //             });
    //         }
    //     });
    //     console.log(formValues);
    // }
}

async function changeIcon(tid) {
    const {value: icon} = await Swal.fire({
        input: 'text',
        inputLabel: '更换新的图标',
        inputPlaceholder: '输入图标代码'
    })

    let new_ico = "";
    if (icon != "") {
        new_ico = icon.replace('class="', 'class="mdui-list-item-icon mdui-icon ');
    }
    // Swal.fire(`Entered URL: ${icon}`)
    $.ajax({
        url: "/api/change-icon",
        type: "POST",
        dataType: "JSON",
        data: {tid: tid, ico: new_ico},
        success: function (res) {
            if (res.code === 200) {
                Toast.fire({
                    icon: 'success',
                    title: "图标已修改"
                });
                Tb.bootstrapTable("refresh");
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

}

async function moveType(tid) {

    let type_data;
    // 设置同步
    $.ajaxSettings.async = false;
    $.post("/api/get-moveType",function(data){
        type_data = data;
    },"json");
    let option = {};
    for (const k of type_data) {
        option[k.Id] = k.Name;
        // option += '<option value="'+k.Id+'">'+k.Name+'</option>\n';
    }
    const {value: fruit} = await Swal.fire({
        title: '选择分组',
        input: 'select',
        confirmButtonText: "确认移动",
        cancelButtonText: "取消",
        inputOptions: option,
        inputPlaceholder: '选择分组',
        showCancelButton: true,
        inputValidator: (value) => {
            return new Promise((resolve) => {
                resolve()
            })
        }
    })

    if (fruit) {
        $.ajax({
            url: "/api/move-item",
            type: "POST",
            dataType: "JSON",
            data: {id: tid, tid: fruit},
            success: function (res) {
                if (res.code === 200) {
                    Toast.fire({
                        icon: 'success',
                        title: "移动分组成功"
                    });
                    Tb.bootstrapTable("refresh");
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
    }

}

function deleteType(tid, title) {


    const swalWithBootstrapButtons = Swal.mixin();
    swalWithBootstrapButtons.fire({
        title: '是否删除 ['+title+'] 项目?',
        text: "删除后不可恢复!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: "/api/delete-items",
                type: "POST",
                dataType: "JSON",
                data: {id: tid},
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

function edit(id, title, note, url) {
    const { value: formValues } = Swal.fire({
        title: "编辑项目："+id,
        html:
            '网站名称：<input id="sw-webname" class="swal2-input" type="text" value="'+title+'"><br>' +
            '网站地址：<input id="sw-url" class="swal2-input" type="text" value="'+url+'"><br>' +
            '网站说明：<input id="sw-note" class="swal2-input" type="text" value="'+note+'"><br>'+
            '访问权限：<select class="swal2-select" id="sw-auth" name="auth">\n' +
            '                  <option value="0" selected>普通用户</option>\n' +
            '                  <option value="1">高级会员</option>\n' +
            '                  <option value="2">超级管理员</option>\n' +
            '              </select>',
        focusConfirm: false,
        preConfirm: () => {
            var webname = $('#sw-webname').val().trim();
            var note = $('#sw-note').val().trim();
            var url = $('#sw-url').val().trim();
            var auth = $('#sw-auth').val();
            console.log(webname, note, url, auth);
            // return;
            // console.log(wids);
            $.ajax({
                url: "/api/change-item",
                type: "POST",
                dataType: "JSON",
                data: {webid: id, webname: webname, note: note, url: url, auth: auth},
                success: function(res){
                    console.log(res);
                    if(res.code == 200) {
                        Toast.fire({
                            icon: 'success',
                            title: "OK"
                        });
                        Tb.bootstrapTable("refresh");
                    }else {
                        Toast.fire({
                            icon: 'error',
                            title: res.cont
                        });
                    }

                },
                error: function(e){
                    console.log(e);
                    Toast.fire({
                        icon: 'error',
                        title: "无法请求"
                    });
                }
            });
            // console.log(money, date, uid);
            // return [
            //   document.getElementById('swal-input1').value,
            //   document.getElementById('swal-input2').value
            // ]
        }
    });

}