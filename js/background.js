console.log('这是 background');
const default_interval = 5000; // 每多少毫秒检测一遍
const base_url = 'https://fuwu.pinduoduo.com/service-market/decrypt';
const defaultOption = {
    count: 10,
    qty: 1,
    reason: "解密额度不够",
    debug: false,
    hour: 0,
    min: 0
}



const init = () => {

    document.addEventListener('DOMContentLoaded', async () => {
        let op = await get_option();
        setHtml(op);
    });

    // 测试_打开
    $('#test_open').click(async () => {
        var remove_ids = await remove_tab();
        console.log('关闭标签 ' + remove_ids);
        var curr_tab = await create_tab(base_url);
        console.log('打开标签 ' + curr_tab.id);

        var request = {
            cmd: 'fill',
            option: {
                count: 1, // 执行次数
                qty: 1, // 申请提额量
                reason: '申请理由', // 申请理由
                debug: true, // debug 模式
                hour: 1,
                min: 1,
            }
        }
        await sleep(2000);
        var resp = await sendMsgToContentScript(curr_tab.id, request);
        console.log(resp);
    });

    // 启动
    $('#run').click(async () => {
        var rs = await set_running(true);
        if (rs) alert('启动成功');
    });

    // 停止
    $('#stop').click(async () => {
        var rs = await set_running(false) && await set_execute_times(0);
        if (rs) alert('停止成功，清零执行次数');
    });

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
            console.log('保存配置');
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
            console.log('重置配置');
            alert('重置成功');
            setHtml(defaultOption);
        } else {
            alert('重置失败');
        }
    });

    $('#clear_log').click(()=>{
        $('#log').val('');
    });
}

const auto_run = () => {
    setTimeout(async () => {
        try {
            var t = await task();
            // console.log(t);
        } catch (error) {
            console.log(error);
        } finally {
            await sleep(3000);
            auto_run();
        }

    }, default_interval);
}

init();
auto_run();

// #region 工具方法

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

console.logCopy = console.log.bind(console);

console.log = function (data) {
    var currentDate = '[' + new Date().format("yyyy-MM-dd hh:mm:ss") + '] ';
    this.logCopy(currentDate, data);
    var cc = $('#log').val();
    $('#log').val(cc + '\r\n' + currentDate + JSON.stringify(data));
    $('#log').scrollTop($('#log')[0].scrollHeight);
};

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}





// #endregion

// #region 本地配置相关


function setHtml(option) {
    $('#count').val(option.count);
    $('#qty').val(option.qty);
    $('#reason').val(option.reason);
    $('#debug').prop('checked', option.debug);
    $('#hour').val(option.hour);
    $('#min').val(option.min);
}

// 保存配置
function save_option(option) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.set({
                'option': option
            }, () => {});
            console.log(option);
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

// 获取配置
function get_option() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get({
                option: null
            }, (obj) => {
                if (Object.values(obj)[0] != undefined) {
                    resolve(obj.option);
                } else {
                    resolve(null);
                }
            });
        } catch (error) {
            reject(error);
        }
    })
}

// 获取执行次数
function get_execute_times() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get({
                times: 0
            }, (obj) => {
                if (Object.values(obj)[0] != undefined) {
                    resolve(obj.times);
                } else {
                    resolve(0);
                }
            });
        } catch (error) {
            reject(error);
        }
    })
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

// 获取运行状态
function get_running() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get({
                running: false
            }, (obj) => {
                if (Object.values(obj)[0] != undefined) {
                    resolve(obj.running);
                } else {
                    resolve(false);
                }
            });
        } catch (error) {
            reject(error);
        }
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
        try {
            chrome.storage.local.get({
                start_time: 0
            }, (obj) => {
                if (Object.values(obj)[0] != undefined) {
                    resolve(obj.start_time);
                } else {
                    resolve(0);
                }
            });
        } catch (error) {
            reject(error);
        }
    })
}

// #endregion

// #region 业务操作

function create_tab(url) {
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.create({
                url: url,
                active: false
            }, (tab) => {
                resolve(tab);
            })
        } catch (error) {
            reject(error);
        }
    })
}

function remove_tab() {
    return new Promise((resolve, reject) => {
        try {
            chrome.windows.getCurrent((w) => {
                chrome.tabs.query({
                    windowId: w.id
                }, (tabs) => {
                    if (tabs.some(tab => tab.url.includes('background.html'))) {
                        var remove_ids = tabs.filter(tab => !tab.url.includes('background.html')).flatMap(tab => tab.id);
                        chrome.tabs.remove(remove_ids, () => {
                            resolve(remove_ids);
                        })
                    } else {
                        console.log('当前没有打开后台');
                        resolve(null);
                    }
                })
            });
        } catch (error) {
            reject(error);
        }
    });
}

function sendMsgToContentScript(tab_id, request) {
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.sendMessage(tab_id, request, (response) => {
                resolve(response);
            })
        } catch (error) {
            reject(error);
        }
    });
}

// #endregion

function task() {
    return new Promise(async (resolve, reject) => {
        try {
            var running = await get_running();
            // 是否启动
            if (!running) return;

            // 获取配置
            var option = await get_option();
            console.log('获取配置');
            console.log(option);

            var curr_date = new Date();
            var curr_year = curr_date.getFullYear();
            var curr_month = curr_date.getMonth();
            var curr_day = curr_date.getDate();

            var execute_times = await get_execute_times();

            // 是否到达设置的时分
            var pre_date = new Date(curr_year, curr_month, curr_day, option.hour, option.min, 0);
            if (curr_date < pre_date) {
                console.log('未到达设置的时分');
                return;
            }

            // 如果是第二天，不管运行次数是否已满，都讲运行次数清零
            var st = await get_satrt_time();
            var diff = Math.abs(curr_date.getTime() - st);
            var diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24)); // 向上取整 不超过1天 结果是1
            if (diffDays > 1) {
                console.log('清零执行次数');
                set_execute_times(0); // 清零执行次数
                set_start_time(curr_date.getTime()); // 更新开始执行时间
            }

            // 执行次数已满
            if (Number(execute_times) >= option.count) {
                console.log('执行次数已满');
                return;
            }
            console.log('运行次数: ' + (Number(execute_times) + 1) + '/' + option.count);

            console.log('开始执行操作');
            var remove_ids = await remove_tab();
            console.log('关闭标签 ' + remove_ids);
            var curr_tab = await create_tab(base_url);
            console.log('打开标签 ' + curr_tab.id);
            await sleep(2000);

            var request = {
                cmd: 'fill',
                option: option
            }
            var resp = await sendMsgToContentScript(curr_tab.id, request);
            if (resp && resp.success) {
                console.log('执行指令成功');
                set_execute_times(++execute_times); // 执行成功才计数
            } else {
                console.log('执行指令失败');
            }

        } catch (error) {
            console.log(error);
        } finally {
            resolve(true);
        }
    });
}