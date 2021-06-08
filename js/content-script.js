console.log('这是content script!');

// 接收来自后台的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log('接收参数：', request);
	console.log('执行次数', request.count);
	console.log('执行间隔', request.interval);
	console.log('申请提额量', request.qty);
	console.log('申请理由', request.reason);
	console.log('debug 模式', request.debug);
	console.log('==============================================')
	sendResponse('开始执行');
 
	doTask(request)

});

const sleep = (time) => {
	return new Promise(resolve => setTimeout(resolve, time));
}

const doTask = async (request) => {
	for (let i = 0; i < request.count; i++) {
		await sleep(request.interval);
		// 开始
		$('span:contains(申请提额)').click();

		setTimeout(() => {
			// console.log('填写表单开始');
			// 自定义输入事件
			var inputEvent = document.createEvent("HTMLEvents");
			inputEvent.initEvent("input", true, false);

			// 填充【申请提额量】
			var numberDom = document.querySelector('input[data-testid="beast-core-inputNumber-htmlInput"]');
			numberDom.value = request.qty;
			numberDom.dispatchEvent(inputEvent); // 巨坑！！！必须发送事件，否则页面填充不成功

			// 填充【申请理由】
			var textDom = document.querySelector('textarea[data-testid="beast-core-textArea-htmlInput"]');
			textDom.value = request.reason;
			textDom.dispatchEvent(inputEvent);

			// 表单提交
			var submitDom = document.querySelector('button[data-testid="beast-core-modal-ok-button"]');
			if(request.debug){
				console.log('debug 模式 不提交');
			}else{
				// submitDom.click();
			}
			console.log('第' + i + '次执行结束');
		}, 2000);
		
	}
}