console.log('这是content script!');

// 接收来自后台的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log('接收参数：', request);
	console.log('debug 模式', request.debug);
	console.log('==========================')
	sendResponse(new Date().toTimeString() + '开始启动');
	checkTime(request.hour, request.min, request);
});

const checkTime = async (hour, min, request) => {
	var flag = setInterval(() => {
		var currDate = new Date();
		var hours = currDate.getHours();
		var mins = currDate.getMinutes();
		if (hours == hour && mins == min) {
			console.log(new Date().toTimeString() + "定时任务启动");
			clearInterval(flag);
			taskFunc(request);
		} else {
			console.log(new Date().toTimeString() + "未到达指定时间[" + hour + ":" + min + "]");
		}

	}, 5000);
}

async function taskFunc(request) {
	console.log(new Date().toTimeString() + "开始执行任务");
	for (let i = 0; i < request.count; i++) {
		var modalDom = document.querySelector('div[data-testid="beast-core-modal-mask"]');
		if (modalDom == null) {
			// 如果没有表单，则打开表单
			$('span:contains(申请提额)').click();
		}
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
		if (request.debug) {
			console.log(new Date().toTimeString() + 'debug 模式 不提交');
		} else {
			submitDom.click();
		}
		console.log(new Date().toTimeString() + '第' + i + '次提交完成');


		await sleep(request.interval);
	}
	console.log(new Date().toTimeString() + "所有任务完成 [" + request.count + "]");
}

const sleep = (time) => {
	return new Promise(resolve => setTimeout(resolve, time));
}


// const doTask = async (request) => {

// 	setInterval(() => {
// 		var currDate = new Date();
// 		var hours = currDate.getHours();
// 		var mins = currDate.getMinutes();

// 		if (hours == '18' && mins == '10') {
// 			console.log('开始执行');

// 			// for (let i = 0; i < request.count; i++) {
// 			// 	var modalDom = document.querySelector('div[data-testid="beast-core-modal-mask"]');
// 			// 	if (modalDom == null) {
// 			// 		// 如果没有表单，则打开表单
// 			// 		$('span:contains(申请提额)').click();
// 			// 	}
// 			// 	// console.log('填写表单开始');
// 			// 	// 自定义输入事件
// 			// 	var inputEvent = document.createEvent("HTMLEvents");
// 			// 	inputEvent.initEvent("input", true, false);

// 			// 	// 填充【申请提额量】
// 			// 	var numberDom = document.querySelector('input[data-testid="beast-core-inputNumber-htmlInput"]');
// 			// 	numberDom.value = request.qty;
// 			// 	numberDom.dispatchEvent(inputEvent); // 巨坑！！！必须发送事件，否则页面填充不成功

// 			// 	// 填充【申请理由】
// 			// 	var textDom = document.querySelector('textarea[data-testid="beast-core-textArea-htmlInput"]');
// 			// 	textDom.value = request.reason;
// 			// 	textDom.dispatchEvent(inputEvent);

// 			// 	// 表单提交
// 			// 	var submitDom = document.querySelector('button[data-testid="beast-core-modal-ok-button"]');
// 			// 	if (request.debug) {
// 			// 		console.log('debug 模式 不提交');
// 			// 	} else {
// 			// 		submitDom.click();
// 			// 	}
// 			// 	console.log('第' + i + '次执行结束 ' + new Date().toTimeString());

// 			// 	await sleep(request.interval);
// 			// }
// 		} else {
// 			console.log('未到达时间不执行');
// 		}

// 	}, 2000);
// }