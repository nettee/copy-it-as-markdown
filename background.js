function copyToClipboard(text) {
    const input = document.createElement('input');
    input.style.position = 'fixed';
    input.style.opacity = 0;
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Copy');
    document.body.removeChild(input);
}

chrome.contextMenus.create({
    title: 'Copy it as markdown',
    type: 'normal',
    contexts: ["selection"],
    onclick: function (info, tab) {
        // Inject the content script into the current page
        chrome.tabs.executeScript(null, {file: 'content.js'});

        // Perform the callback when a message is received from the content script
        chrome.runtime.onMessage.addListener(function (message) {
            const content = message.selectedHtml;
            console.log('Content:', content);
            copyToClipboard(content);
            chrome.notifications.create({
                type: 'basic',
                title: 'Content copied to clipboard',
                message: content,
                iconUrl: 'img/icon128.png',
            });
        });
    }
});



