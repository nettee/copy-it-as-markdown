function copyToClipboard(text) {
    // Use <textarea> element instead of <input>, because
    // textareas can hold newlines
    const input = document.createElement('textarea');
    input.style.position = 'fixed';
    input.style.opacity = 0;
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Copy');
    document.body.removeChild(input);
}

function htmlToMarkdown(html) {
    html = html.replace(/\s+/g, ' ');
    console.log('sanitized HTML: ', html);

    const converter = new showdown.Converter();
    let markdown = converter.makeMarkdown(html);

    markdown = markdown.replace(/<!--.*?-->/g, '');

    return markdown;
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
            const html = message.selectedHtml;
            console.log('html: ', html);
            const markdown = htmlToMarkdown(html);
            console.log('markdown: ', markdown);
            copyToClipboard(markdown);
            chrome.notifications.create({
                type: 'basic',
                title: 'Content copied to clipboard',
                message: markdown,
                iconUrl: 'img/icon128.png',
            });
        });
    }
});



