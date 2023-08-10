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
let parentId = [];
$(function() {
    var inst = new mdui.Drawer('#mdui-drawer');
    $('#menu').click(function(){
        inst.toggle();
    });
    Tb = $('#user-manager');
    let query = "/api/get-type";

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
                width: 100,
            }, {
                field: 'TypeName',
                title: '分类名称'
            },  {
                field: 'Item',
                title: '项目数量',
                width: 120,
                formatter: function(row, data) {
                    let item = data.Items;
                    console.log(item);
                    if (item == undefined) {
                        item = 0;
                        return item;
                    } else {
                        return '<a href="/admin-item?tid='+data.Id+'" class="font-weight-bold text-indigo text-decoration-none">'+item+'</a>';
                    }

                }
            },{
                field: 'Icon',
                title: "图标",
                width: 120,
            }, {
                field: 'Parent',
                title: "父分类",
                sortable:true,
                formatter: function(row, data) {
                    if (data.Parent === 0) {
                        return '<span class="badge badge-secondary">无</span>';
                    } else {
                        return '<span class="badge badge-success">'+data.ParentName+'</span>';
                    }
                }
            },{
                field:'ID',
                title: '管理',
                width: 150,
                align: 'center',
                valign: 'middle',
                formatter: actionFormatter
            }]
    });
});

function actionFormatter(value, row) {

    var pid = row.Parent;
    var id = row.Id;
    parentId.push(pid);
    var result = '<div class="btn-group" role="group" aria-label="Button group with nested dropdown">\n' +
        '  <button type="button" class="btn btn-primary btn-xs" onclick="changeIcon('+id+')" mdui-tooltip="{content: \'更改图标\'}"><i class="fa-solid fa-icons"></i></button>\n' +
        '  <button type="button" class="btn btn-warning btn-xs" onclick="moveType('+id+','+pid+')" mdui-tooltip="{content: \'移动分组\'}"><i class="fa-solid fa-arrow-right-arrow-left"></i></button>\n' +
        '  <button type="button" class="btn btn-success btn-xs" onclick="rename('+id+')" mdui-tooltip="{content: \'重命名\'}"><i class="fa-solid fa-pen-nib"></i></button>\n' +
        '  <button type="button" class="btn btn-danger btn-xs" onclick="deleteType('+id+','+pid+',\''+row.TypeName+'\')" mdui-tooltip="{content: \'删除\'}">' +
        '<i class="fa-solid fa-trash"></i></button>\n' +
        '</div>';
    return result;
}

async function addType() {
    let type_data;
    // 设置同步
    $.ajaxSettings.async = false;
    $.post("/api/parent-type",function(data){
        type_data = data;
    },"json");
    let option = '';
    if (type_data != null){
        for (const k of type_data) {
            option += '<option value="'+k.Id+'">'+k.Name+'</option>\n';
        }
    }

    const {value: formValues} = await Swal.fire({
        title: '新增分类',
        html:
            '<label for="name">分类名称</label>' +
            '<input id="name" class="swal2-input"><br>' +
            '<label for="icon">图标</label>' +
            '<input id="icon" class="swal2-input"><br>' +
            '<label for="par">父分类</label>' +
            '<select id="par" class="swal2-select">' +
            '<option value="0">无</option>'+option+
            '</select>' ,
        focusConfirm: false,
        preConfirm: () => {
            let ico = $('#icon').val().trim();
            let new_ico = "";
            if (ico != "") {
                new_ico = ico.replace('class="', 'class="mdui-list-item-icon mdui-icon ');
            }
            return {
                name: $('#name').val().trim(),
                icon: new_ico,
                pare: $('#par').val().trim()
            }
        }
    })

    if (formValues) {

        if (formValues.name == "") {
            Toast.fire({
                icon: 'error',
                title: "名称为空"
            });
            return;
        }
        // 设置异步
        $.ajaxSettings.async = true;
        $.ajax({
            url: "/api/add-type",
            data: formValues,
            type: "POST",
            dataType: "JSON",
            success: function (res) {
                if (res.code === 200) {
                    Toast.fire({
                        icon: 'success',
                        title: "新增分类成功"
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
        console.log(formValues);
    }
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

async function moveType(tid, pid) {
    if (pid === 0) {
        if (parentId.includes(tid)) {
            Toast.fire({
                icon: 'error',
                title: "该分类下有子类，无法移动分组"
            });
            return;
        }
    }

    let type_data;
    // 设置同步
    $.ajaxSettings.async = false;
    $.post("/api/parent-type",function(data){
        type_data = data;
    },"json");
    let option = {"0":"退出父分组"};
    for (const k of type_data) {
        option[k.Id] = k.Name;
        // option += '<option value="'+k.Id+'">'+k.Name+'</option>\n';
    }
    const {value: fruit} = await Swal.fire({
        title: '选择父分类',
        input: 'select',
        confirmButtonText: "确认移动",
        cancelButtonText: "取消",
        inputOptions: option,
        inputPlaceholder: '选择父分组',
        showCancelButton: true,
        inputValidator: (value) => {
            return new Promise((resolve) => {
                resolve()
            })
        }
    })

    if (fruit) {
        if (tid == fruit) {
            Toast.fire({
                icon: 'error',
                title: "不能移动到自己！"
            });
            return;
        }
        $.ajax({
            url: "/api/move-type",
            type: "POST",
            dataType: "JSON",
            data: {tid: tid, pid: fruit},
            success: function (res) {
                if (res.code === 200) {
                    Toast.fire({
                        icon: 'success',
                        title: "移动分组成功"
                    });
                    location.reload();
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

function deleteType(tid, pid, title) {
    if (pid === 0) {
        if (parentId.includes(tid)) {
            Toast.fire({
                icon: 'error',
                title: "该分类下有子类，无法删除分组"
            });
            return;
        }
    }

    const swalWithBootstrapButtons = Swal.mixin();
    swalWithBootstrapButtons.fire({
        title: '是否删除 ['+title+'] 分组?',
        text: "删除后该分组下的所有子项目都将被删除!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: "/api/delete-type",
                type: "POST",
                dataType: "JSON",
                data: {tid: tid},
                success: function (res) {
                    if (res.code === 200) {
                        Toast.fire({
                            icon: 'success',
                            title: "删除成功"
                        });
                        location.reload();
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

async function rename(tid) {
    const {value: title} = await Swal.fire({
        input: 'text',
        inputLabel: '新的名称',
        inputPlaceholder: '输入分类名称'
    })

    if (title) {
        $.ajax({
            url: "/api/rename-type",
            type: "POST",
            dataType: "JSON",
            data: {tid: tid, title: title},
            success: function (res) {
                if (res.code === 200) {
                    Toast.fire({
                        icon: 'success',
                        title: "重命名成功"
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