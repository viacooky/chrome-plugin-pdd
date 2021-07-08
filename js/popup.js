// 后台
$('#open_background').click(() => {
    window.open(chrome.extension.getURL('background.html'));
});