var inst = new mdui.Drawer('#mdui-drawer');
$(function(){
    $('#menu').click(function(){
        inst.toggle();
    });
})