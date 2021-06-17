
document.addEventListener('DOMContentLoaded', function () {
    console.log('我被执行了！');
    try {
        chrome.storage.local.get({ option: null }, async function (result) {
            console.log(result.option);
            $('#count').val(result.option.count);
            $('#interval').val(result.option.interval);
            $('#qty').val(result.option.qty);
            $('#reason').val(result.option.reason);
            $('#hour').val(result.option.hour);
            $('#min').val(result.option.min);
            $('#debug').attr("checked", result.option.debug);
        });
    } catch (error) {

    }
});


// 执行
$('#excute').click(e => {
    let input_count = $('#count').val();
    let input_interval = $('#interval').val();
    let input_qty = $('#qty').val();
    let input_reason = $('#reason').val();
    let input_debug = $('#debug').is(':checked');
    let input_hour = $('#hour').val();
    let input_min = $('#min').val();

    let msg = {
        count: Number(input_count), // 执行次数
        interval: Number(input_interval), // 执行间隔
        qty: Number(input_qty), // 申请提额量
        reason: input_reason, // 申请理由
        debug: input_debug, // debug 模式
        hour: Number(input_hour),
        min: Number(input_min),
        excuteCount: Number(0)
    }
    chrome.storage.local.set({ 'option': msg }, function () {
        console.log('option ----> ' + msg);
    });

});

$('#clear').click(e => {
    chrome.storage.local.remove('option', function () {
        console.log('remove option');
        $('#count').val(10);
        $('#interval').val(10000);
        $('#qty').val("1");
        $('#reason').val("解密额度不够");
        $('#hour').val(0);
        $('#min').val(0);
        $('#debug').attr("checked", result.option.debug);
    });
});