$(function() {
    $('#nav-menu').on('click', 'a', function(){
        $('#nav-menu li, #nav-menu a').removeClass('mdui-list-item-active');
        if ($(this).parent().get(0).tagName == 'LI') {
            $(this).parent().addClass('mdui-list-item-active');
        } else {
            $(this).addClass('mdui-list-item-active');
        }
    });


    $('#nav-zhuse input[type="radio"]').on('click', function(){
        var primary = $('body').attr('class');
        var arr = primary.split(' ');
        // console.log(arr);
        for (var i = 0; i < arr.length ; i++) {
            // console.log(arr[i].indexOf("mdui-theme-primary"));
            if (arr[i].indexOf("mdui-theme-primary") == 0) {
                $('body').removeClass(arr[i]);
                break;
            }
        }
        $('body').addClass('mdui-theme-primary-'+$(this).val());
    });

    $('#nav-zhuti input[type="radio"]').on('click', function(){
        if ($(this).val() == 'dark') {
            $('body').addClass('mdui-theme-layout-dark');
            $('body').removeClass('mdui-theme-layout-auto');
        } else if($(this).val() == 'light') {
            $('body').removeClass('mdui-theme-layout-dark');
            $('body').removeClass('mdui-theme-layout-auto');
        } else if($(this).val() == 'auto') {
            $('body').removeClass('mdui-theme-layout-dark');
            $('body').addClass('mdui-theme-layout-auto');
        }
        // $('body').removeClass();
        // $('body').addClass('mdui-theme-layout-auto mdui-theme-primary-'+$(this).val()+' mdui-drawer-body-left mdui-appbar-with-toolbar');
        // console.log($(this).val());
    });
});