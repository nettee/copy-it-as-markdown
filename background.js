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

function notifyCopied(content) {
    chrome.notifications.create({
        type: 'basic',
        title: 'Content copied to clipboard',
        message: content,
        iconUrl: 'img/icon128.png',
    });
}

chrome.contextMenus.create({
    title: 'Selected text',
    type: 'normal',
    contexts: ['selection'],
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
            notifyCopied(markdown);
        });
    }
});

chrome.contextMenus.create({
    title: 'Current page: [title](url)',
    type: 'normal',
    contexts: ['all'],
    onclick: function (info, tab) {
        const text = tab.title;
        const url = info.pageUrl;
        const markdown = `[${text}](${url})`;
        copyToClipboard(markdown);
        notifyCopied(markdown);
    }
});

//// It's not easy to get hyperlink text
//// See https://stackoverflow.com/questions/7427357/getting-hyperlink-text-on-chrome-right-click
// chrome.contextMenus.create({
//     title: 'Current link: [text](url)',
//     type: 'normal',
//     contexts: ['link'],
//     onclick: function (info, tab) {
//         const text = 'text';
//         const url = info.linkUrl;
//         const markdown = `[${text}](${url})`;
//         alert(markdown);
//     }
// });

chrome.contextMenus.create({
    title: 'Current page: [selected text](url)',
    type: 'normal',
    contexts: ['selection'],
    onclick: function (info, tab) {
        const text = info.selectionText;
        const url = info.pageUrl;
        const markdown = `[${text}](${url})`;
        copyToClipboard(markdown);
        notifyCopied(markdown);
    }
});

