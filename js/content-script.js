console.log('这是content script!');
var option = null;
var autoReflushTime = 30000;
document.addEventListener('DOMContentLoaded', function () {
	var currDate = new Date();
	var hours = currDate.getHours();
	var mins = currDate.getMinutes();

	chrome.storage.local.get({ option: null }, async function (result) {

		var test = document.querySelector("div div.layout_children__1-Fmi div div.side-menu-layout_main_wrapper__8ZwBv div div:nth-child(2) div.decrypt_card_container__2cJRK div:nth-child(3) p.statistic-card_row2__M5M0M span.statistic-card_value__2nDAT");
		console.log(test);
	

		console.log(result.option);
		if(result.option == null){
			console.log(new Date().toTimeString() + "无法找到配置，请对插件进行配置");
			await sleep(autoReflushTime);
			location.reload();
		}

		if (hours == result.option.hour && mins == result.option.min) {
			console.log(new Date().toTimeString() + "定时任务启动");
			await taskFunc(result.option);
		} else {
			console.log(new Date().toTimeString() + "未到达指定时间[" + result.option.hour + ":" + result.option.min + "]");
		}
		await sleep(autoReflushTime);
		location.reload();
	});
});

async function taskFunc(option) {
	console.log(option);
	console.log(new Date().toTimeString() + "开始执行任务");
	for (let i = 0; i < option.count; i++) {

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
			var submitDom = document.querySelector('button[data-testid="beast-core-modal-ok-button"]');
			if (option.debug) {
				console.log(new Date().toTimeString() + 'debug 模式 不提交');
			} else {
				submitDom.click();
			}
			console.log(new Date().toTimeString() + '第' + i + '次提交完成');
		} catch (error) {
			console.log("执行出现异常");
		}


		await sleep(option.interval);
	}
	console.log(new Date().toTimeString() + "所有任务完成 [" + option.count + "]");
}

const sleep = (time) => {
	return new Promise(resolve => setTimeout(resolve, time));
}