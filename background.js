chrome.contextMenus.create({
    title: 'Copy it as markdown',
    type: 'normal',
    contexts: ["selection"],
    onclick: function(info, tab) {
        // Inject the content script into the current page
        chrome.tabs.executeScript(null, {file: 'content.js'});

        // Perform the callback when a message is received from the content script
        chrome.runtime.onMessage.addListener(function (message) {
            alert(message.selectedHtml);
        });
    }
});
