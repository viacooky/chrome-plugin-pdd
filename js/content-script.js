console.log('这是content script!');
var curr_option = null;
var autoReflushTime = 5000;
var exe_count = 0;
var exe_running = false;
document.addEventListener('DOMContentLoaded', function () {

	chrome.storage.local.get({ exe_count: 0 }, function (result) {
		exe_count = Number(result.exe_count);
	});

	chrome.storage.local.get({ exe_running: false }, function (result) {
		exe_running = result.exe_running;
	});

	chrome.storage.local.get({ option: null }, function (result) {
		curr_option = result.option;
		console.log(curr_option);
	});

	console.log(curr_option);
	if (!curr_option) {
		console.log(new Date().toTimeString() + "无法找到配置，请对插件进行配置");

	} else {
		console.log(new Date().toTimeString() + "当前已执行次数为：" + exe_count);
		console.log(new Date().toTimeString() + "设置执行次数为" + curr_option.count);
		if (Number(curr_option.count) < Number(exe_count)) {
			console.log("取消执行");
			chrome.storage.local.set({ 'exe_running': false }, function () {
				console.log('exe_running ----> ' + false);
			});
			chrome.storage.local.set({ 'exe_count': 0 }, function () {
				console.log('exe_count ----> ' + 0);
			});
		}

		var currDate = new Date();
		var hours = currDate.getHours();
		var mins = currDate.getMinutes();
		let inTime = hours == curr_option.hour && mins == curr_option.min;

		if (exe_running) {
			taskFunc(curr_option);
		} else {
			if (inTime) {
				chrome.storage.local.set({ 'exe_running': true }, function () {
				});
			} else {
				console.log(new Date().toTimeString() + "未到达指定时间[" + curr_option.hour + ":" + curr_option.min + "]");
				chrome.storage.local.set({ 'exe_running': false }, function () {
				});
			}
		}
	}
	console.log("sleep");
	// sleep(autoReflushTime);
	// location.reload();
});


function taskFunc(option) {
	console.log(option);
	console.log(new Date().toTimeString() + "开始执行任务");
	try {
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
		numberDom.value = option.qty;
		numberDom.dispatchEvent(inputEvent); // 巨坑！！！必须发送事件，否则页面填充不成功

		// 填充【申请理由】
		var textDom = document.querySelector('textarea[data-testid="beast-core-textArea-htmlInput"]');
		textDom.value = option.reason;
		textDom.dispatchEvent(inputEvent);

		// 表单提交
		if (option.debug) {
			var cancelDom = document.querySelector('button[data-testid="beast-core-modal-close-button"]');
			// cancelDom.click();
			console.log(new Date().toTimeString() + 'debug 模式 不提交');
		} else {
			var submitDom = document.querySelector('button[data-testid="beast-core-modal-ok-button"]');
			submitDom.click();
			console.log(new Date().toTimeString() + '提交完成');
		}

		chrome.storage.local.set({ 'exe_count': ++exe_count }, function () {
			console.log('exe_count ----> ' + exe_count);
		});

	} catch (error) {
		console.log(error);
	}
}

const sleep = (time) => {
	return new Promise(resolve => setTimeout(resolve, time));
}