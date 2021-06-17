console.log('这是 background');
var default_interval = 10000;
var base_url = 'https://fuwu.pinduoduo.com/service-market/decrypt';

function auto_run() {
    setInterval(async () => {
        var running = await get_running();
        if (!running) {
            return;
        }

        var execute_times = await get_execute_times();

        // 获取配置
        var option = await get_option();
        // log('获取配置' + JSON.stringify(option));

        var curr_date = new Date();
        var curr_hour = curr_date.getHours();
        var curr_min = curr_date.getMinutes();
        if (curr_hour != option.hour || curr_min != option.min) {
            log('设置的时间不匹配[' + option.hour + ':' + option.min + ']');
            return;
        }

        if (execute_times >= option.count) {
            log('运行次数已满');
            set_running(false);
            set_execute_times(0);
            return;
        }

        log('运行次数: ' + (Number(execute_times) + 1) + '/' + option.count);

        // 开始执行自动点击
        var resp = await task(option);
        if (resp.success) {
            set_execute_times(++execute_times); // 执行成功才计数
        }


    }, default_interval);
}

function task(option) {
    return new Promise(async (resolve, reject) => {
        try {
            let tab = await getFirstTab(base_url);
            if (tab === undefined) {
                log('当前没有打开[' + base_url + ']的页签');
                return;
            }
            // log('获取tab' + tab.id);
            await reloadTab(tab.id, base_url);
            // log('刷新tab');

            // log('发送指令');
            var fillCmd = {
                cmd: 'fill',
                option: option
            }
            var resp = await sendMsgToContentScript(tab.id, fillCmd);
            if (resp.success) {
                log('执行指令成功');
            } else {
                log('执行指令失败');
            }
            if (option.debug) {
                log(JSON.stringify(resp))
            }
            resolve(resp);
        } catch (error) {
            reject();
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
            reject();
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
                    windowId: currentWindow.id
                }, (tabs) => {
                    var tab = tabs.find(tab => tab.url === url);
                    resolve(tab);
                });
            });
        } catch (error) {
            reject();
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
            reject();
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
                reject();
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
                reject();
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
            reject();
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
            reject();
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
                reject();
            }
        });
    })
}


const sleep = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
}

auto_run();