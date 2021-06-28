console.log('这是 background');
var default_interval = 5000; // 每多少毫秒检测一遍
var base_url = 'https://fuwu.pinduoduo.com/service-market/decrypt';
var tab = null;

function auto_run() {
    
    setTimeout(async () => {
        try {
            tab = await getFirstTab(base_url);
            if (tab === undefined || tab === null) {
                log('当前没有打开[' + base_url + ']的页签');
            } else {
                log('获取tab ' + tab.url);
                await task(tab);
            }
        } catch (error) {
            log(111111);
            log(error);
        } finally {
            await sleep(3000);
            await reloadTab(tab.id, base_url);
            auto_run();
        }
    }, default_interval);

}

function task(tab) {
    return new Promise(async (resolve, reject) => {
        try {
            log('开始执行自动提额操作');
            // 获取配置
            var option = await get_option();

            // var option = {
            //     count: 1, // 执行次数
            //     qty: 1, // 申请提额量
            //     reason: '申请理由', // 申请理由
            //     debug: true, // debug 模式
            //     hour: 1,
            //     min: 1,
            // }

            var curr_date = new Date();
            var curr_year = curr_date.getFullYear();
            var curr_month = curr_date.getMonth();
            var curr_day = curr_date.getDate();

            var execute_times = await get_execute_times();
            var running = await get_running();

            // 是否启动
            if (!running) return;
            // 是否到达设置的时分
            var pre_date = new Date(curr_year, curr_month, curr_day, option.hour, option.min, 0);
            if (curr_date < pre_date) return;
            // 如果是第二天，不管运行次数是否已满，都讲运行次数清零
            var st = await get_satrt_time();
            var diff = Math.abs(curr_date.getTime() - st);
            var diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24)); // 向上取整 不超过1天 结果是1
            if (diffDays > 1) {
                log('清零执行次数');
                set_execute_times(0); // 清零执行次数
                set_start_time(curr_date.getTime()); // 更新开始执行时间
            }

            // 执行次数已满
            if (Number(execute_times) >= option.count) return;

            log('运行次数: ' + (Number(execute_times) + 1) + '/' + option.count);

            // 发送执行指令
            var fillCmd = {
                cmd: 'fill',
                option: option
            }
            var resp = await sendMsgToContentScript(tab.id, fillCmd);
            if (resp && resp.success) {
                log('执行指令成功');
                set_execute_times(++execute_times); // 执行成功才计数
            } else {
                log('执行指令失败');
            }

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

// 刷新tab
function reloadTab(tab, url) {
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.update(tab.id, {
                'url': url,
                'selected': true
            });
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

// 获取第一个tab
function getFirstTab(url) {
    return new Promise((resolve, reject) => {
        try {
            chrome.windows.getCurrent(function (currentWindow) {
                chrome.tabs.query({
                    active: true,
                    windowId: currentWindow.id,
                    lastFocusedWindow: true
                }, (tabs) => {
                    var tab = tabs.length > 0 ? tabs[0] : undefined;
                    resolve(tab);
                });

            });
        } catch (error) {
            resolve(null);
        }
    })
}

function sendMsgToContentScript(tabId, request) {
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.sendMessage(tabId, request, (response) => {
                resolve(response);
            })
        } catch (error) {
            resolve(null);
        }
    })
}


// 保存配置
function save_option(option) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.set({
                'option': option
            }, () => {});
            log('保存配置:' + JSON.stringify(option));
            resolve(true);
        } catch (error) {
            reject();
        }
    });
}

// 获取配置
function get_option() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get({
            option: null
        }, (obj) => {
            if (Object.values(obj)[0] != undefined) {
                // log('获取配置:' + JSON.stringify(obj.option));
                resolve(obj.option);
            } else {
                reject(error);
            }
        });
    })
}

// 获取运行状态
function get_running() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get({
            running: false
        }, (obj) => {
            if (Object.values(obj)[0] != undefined) {
                resolve(obj.running);
            } else {
                reject(error);
            }
        });
    })
}

// 设置运行状态
function set_running(flag) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.set({
                'running': flag
            }, () => {});
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

// 启动
function run() {
    return set_running(true);
}

// 停止
function stop() {
    log('手工停止');
    return set_running(false);
}

// 设置执行次数
function set_execute_times(t) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.set({
                'times': t
            }, () => {});
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

// 获取执行次数
function get_execute_times() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get({
            times: 0
        }, (obj) => {
            if (Object.values(obj)[0] != undefined) {
                resolve(obj.times);
            } else {
                reject(error);
            }
        });
    })
}


// 设置启动时间
function set_start_time(time) {
    log('启动时间: ' + time);
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.set({
                'start_time': time
            }, () => {});
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

// 获取启动时间
function get_satrt_time() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get({
            start_time: 0
        }, (obj) => {
            if (Object.values(obj)[0] != undefined) {
                resolve(obj.start_time);
            } else {
                reject(error);
            }
        });
    })
}


function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

auto_run();