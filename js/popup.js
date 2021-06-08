// 执行
$('#excute').click(e => {
    let input_count = $('#count').val();
    let input_interval = $('#interval').val();
    let input_qty = $('#qty').val();
    let input_reason = $('#reason').val();
    let input_debug = $('#debug').is(':checked');

    let msg = {
        count: input_count, // 执行次数
        interval: input_interval, // 执行间隔
        qty: input_qty, // 申请提额量
        reason: input_reason, // 申请理由
        debug: input_debug // debug 模式
    }
    console.log(msg);
    sendMessageToContentScript(msg, (response) => {
        // if (response) alert(response); // content-script的回复消息
    });

});

// 向content-script主动发送消息
function sendMessageToContentScript(message, callback) {
    getCurrentTabId((tabId) => {
        chrome.tabs.sendMessage(tabId, message, function (response) {
            if (callback) callback(response);
        });
    });
}

// 获取当前选项卡ID
function getCurrentTabId(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (callback) callback(tabs.length ? tabs[0].id : null);
    });
}