var bg = chrome.extension.getBackgroundPage();


var defaultOption = {
    count: 10,
    qty:1,
    reason: "解密额度不够",
    debug:false,
    hour:0,
    min:0
}

document.addEventListener('DOMContentLoaded', async ()=> {
    let op = await bg.get_option();
    setHtml(op);
});

function setHtml(option){
    $('#count').val(option.count);
    $('#qty').val(option.qty);
    $('#reason').val(option.reason);
    $('#debug').prop('checked',option.debug);
    $('#hour').val(option.hour);
    $('#min').val(option.min);
}

// 保存
$('#save').click(async () => {
    let op = {
        count: Number($('#count').val()), // 执行次数
        qty: Number($('#qty').val()), // 申请提额量
        reason: $('#reason').val(), // 申请理由
        debug: $('#debug').is(':checked'), // debug 模式
        hour: Number($('#hour').val()),
        min: Number($('#min').val()),
    }
    let rs = await bg.save_option(op);
    if(rs){
        alert('保存成功');
        setHtml(op);
    }else{
        alert('保存失败');
        setHtml(defaultOption)
    }
});

// 重置
$('#restore').click(async () => {
    let rs = await bg.save_option(defaultOption);
    if(rs){
        alert('重置成功');
    }else{
        alert('重置失败');
    }
    setHtml(defaultOption)
});

// 运行
$('#run').click(async () => {
    let rs = await bg.run();
    if(rs){
        alert("运行成功");
    }
});

// 停止
$('#stop').click(async () => {
    let rs = await bg.stop();
    if(rs){
        alert("停止成功");
    }
    await bg.set_execute_times(0);
});