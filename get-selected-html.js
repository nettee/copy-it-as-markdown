var selection = window.getSelection();
var range = selection.getRangeAt(0);
if (range) {
    let div = document.createElement('div');
    div.appendChild(range.cloneContents());
    selectedHtml = div.innerHTML;
}

chrome.runtime.sendMessage({
    request: 'selectedHtml',
    title: document.title,
    url: window.location.href,
    selectedHtml: selectedHtml,
});
