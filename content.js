document.addEventListener('selectionchange', function () {
    let selection = document.getSelection();
    let selectionText = selection.toString().trim();
    chrome.runtime.sendMessage({
        request: 'selectedText',
        selectedText: selectionText,
    });
});
