console.log('这是 background');
$('#log').scrollTop($('#log').scrollHeight);

var default_interval = 5000; // 每多少毫秒检测一遍
var base_url = 'https://fuwu.pinduoduo.com/service-market/decrypt';

function auto_run() {
    setTimeout(async () => {
        try {
            log(111);
            await task();
        } catch (error) {
            log(error)
        } finally {
            await sleep(3000);
            auto_run();
        }
    }, default_interval);
}

function task() {
    return new Promise(async (resolve, reject) => {
        try {
            var tab = await create_tab(base_url);
            if (tab === null) return;
            log('开始执行自动提额操作');

            // 获取配置
            var option = await get_option();
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
            await sleep(5000);
            var resp = await sendMsgToContentScript(tab.id, fillCmd);
            if (resp && resp.success) {
                log('执行指令成功');
                set_execute_times(++execute_times); // 执行成功才计数
            } else {
                log('执行指令失败');
            }

            resolve();
        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
}

function sendMsgToContentScript(tabId, request) {
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.sendMessage(tabId, request, (response) => {
                resolve(response);
            })
        } catch (error) {
            log(error);
            resolve(error);
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


$('#test_open').click(async () => {
    let tab = await create_tab(base_url);
    log(tab);
});

$('#test_send').click(async () => {

    await chrome.windows.getCurrent(async (currentWindow) => {
        await chrome.tabs.query({
            windowId: currentWindow.id
        }, async (tabs) => {
            var ids = tabs.flatMap(tab => tab.id);
            log('all tabIds' + ids);
        });
    });


    var tabid = parseInt($('#test_tabid').val());
    alert(tabid);

    var option = {
        count: 1, // 执行次数
        qty: 1, // 申请提额量
        reason: '申请理由', // 申请理由
        debug: true, // debug 模式
        hour: 1,
        min: 1,
    }

    // 发送执行指令
    var fillCmd = {
        cmd: 'fill',
        option: option
    }
    try {
        var resp = await sendMsgToContentScript(tabid, fillCmd);
        if (resp && resp.success) {
            log('执行指令成功');
            set_execute_times(++execute_times); // 执行成功才计数
        } else {
            log('执行指令失败');
        }
    } catch (error) {
        log(error);
    }
});



function create_tab(url) {
    return new Promise(async (resolve,reject)=>{
        try {
            await chrome.windows.getCurrent(async (currentWindow) => {
                await chrome.tabs.query({
                    windowId: currentWindow.id
                }, async (tabs) => {
                    if (tabs.some(tab => tab.url.includes('background.html'))) {
                        var ids = tabs.filter(tab => !tab.url.includes('background.html')).flatMap(tab => tab.id);
                        await chrome.tabs.remove(ids, async () => {
                            log('remove tab ' + ids);
                            await chrome.tabs.create({
                                url: url,
                                active: false
                            }, (t) => {
                                log('create tab ' + t.id);
                                resolve(t);
                            });
                        });
                    } else {
                        reject(null);
                    }
                });
            });
        } catch (error) {
            log(error);
        }
    })
}


var defaultOption = {
    count: 10,
    qty: 1,
    reason: "解密额度不够",
    debug: false,
    hour: 0,
    min: 0
}

document.addEventListener('DOMContentLoaded', async () => {
    let op = await get_option();
    setHtml(op);
});

function setHtml(option) {
    $('#count').val(option.count);
    $('#qty').val(option.qty);
    $('#reason').val(option.reason);
    $('#debug').prop('checked', option.debug);
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
    let rs = await save_option(op);
    if (rs) {
        alert('保存成功');
        setHtml(op);
    } else {
        alert('保存失败');
        setHtml(defaultOption)
    }
});

// 重置
$('#restore').click(async () => {
    let rs = await save_option(defaultOption);
    if (rs) {
        alert('重置成功');
    } else {
        alert('重置失败');
    }
    setHtml(defaultOption)
});

// 运行
$('#run').click(async () => {
    let rs = await run();
    await set_start_time(new Date().getTime());
    if (rs) {
        alert("运行成功");
    }
});

// 停止
$('#stop').click(async () => {
    let rs = await stop();
    if (rs) {
        alert("停止成功");
    }
    await set_execute_times(0);
});