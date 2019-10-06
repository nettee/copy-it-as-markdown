const selection = window.getSelection();
const range = selection.getRangeAt(0);
if (range) {
    let div = document.createElement('div');
    div.appendChild(range.cloneContents());
    selectedHtml = div.innerHTML;
}

chrome.runtime.sendMessage({
    'title': document.title,
    'url': window.location.href,
    'selectedHtml': selectedHtml,
});
