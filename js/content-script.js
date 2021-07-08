console.log('这是content script!');
var default_sleep = 1000;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('11111');
    dd(request).then((request) => sendResponse(request));
    return true;
})


async function dd(request){
    try {
        if (request.cmd === 'fill') {
            var option = request.option;
            var remainQtyDom = document.querySelector("#root > div > div.layout_children__1-Fmi > div > div.side-menu-layout_main_wrapper__8ZwBv > div > div:nth-child(2) > div.decrypt_card_container__2cJRK > div:nth-child(3) > p.statistic-card_row2__M5M0M > span.statistic-card_value__2nDAT");
            var remainQty = Number(remainQtyDom.innerHTML);
            // 今日临时订单解密余额
            if (remainQty > 1000) {
                throw new Error('今日临时订单解密余额[' + remainQty + "]大于1000,跳过");
            }
    
            var modalDom = document.querySelector('div[data-testid="beast-core-modal-mask"]');
            if (modalDom == null) {
                // 如果没有表单，则打开表单
                document.querySelector("#root > div > div.layout_children__1-Fmi > div > div.side-menu-layout_main_wrapper__8ZwBv > div > div:nth-child(2) > div.decrypt_card_container__2cJRK > div:nth-child(2) > p:nth-child(1) > span.statistic-card_extra__3a7a1 > a > span").click();
            }
    
            await sleep(default_sleep);
    
            // 自定义输入事件
            var inputEvent = document.createEvent("HTMLEvents");
            inputEvent.initEvent("input", true, false);
    
            // 填充【申请提额量】
            var numberDom = document.querySelector('input[data-testid="beast-core-inputNumber-htmlInput"]');
            numberDom.value = option.qty;
            numberDom.dispatchEvent(inputEvent); // 巨坑！！！必须发送事件，否则页面填充不成功
    
            await sleep(default_sleep);
            // 填充【申请理由】
            var textDom = document.querySelector('textarea[data-testid="beast-core-textArea-htmlInput"]');
            textDom.value = option.reason;
            textDom.dispatchEvent(inputEvent);
    
            await sleep(default_sleep);
            // 表单提交
            if (option.debug) {
                var cancelDom = document.querySelector('button[data-testid="beast-core-modal-close-button"]');
                cancelDom.click();
            } else {
                var submitDom = document.querySelector('button[data-testid="beast-core-modal-ok-button"]');
                submitDom.click();
            }
    
            request.success = true;
            request.msg = '';
        }
    } catch (error) {
        console.log(error);
        request.success = false;
        request.msg = error.message;
    }
    return request;
}

const sleep = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
}