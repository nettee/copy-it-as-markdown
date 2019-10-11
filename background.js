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
        iconUrl: 'img/icon100.png',
    });
}

function compress(s, len) {
    if (s.length <= len) {
        return s;
    } else {
        return s.substring(0, len-3) + '...';
    }
}

var pageTitle = 'title';
var pageUrl = 'url';
var pageSelectionText = 'selected text';
var linkText = 'text';
var linkUrl = 'url';

var menuItems = {};

menuItems.root = chrome.contextMenus.create({
    title: 'Copy it as markdown',
    id: 'root',
    contexts: ['all'],
});

menuItems.selectionToMarkdown = chrome.contextMenus.create({
    parentId: 'root',
    title: 'Selection as markdown',
    type: 'normal',
    contexts: ['selection'],
    onclick: function (info, tab) {
        // Inject the content script into the current page
        chrome.tabs.executeScript(null, {file: 'get-selected-html.js'});
    }
});

menuItems.pageLinkSelectedText = chrome.contextMenus.create({
    parentId: 'root',
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

menuItems.hyperLink = chrome.contextMenus.create({
    parentId: 'root',
    title: 'This link: [text](link)',
    type: 'normal',
    contexts: ['link'],
    onclick: function (info, tab) {
        chrome.tabs.executeScript(null, {file: 'get-hyperlink-info.js'});
    }
});

menuItems.pageLinkTitle = chrome.contextMenus.create({
    parentId: 'root',
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

function updateMenuTitle() {
    chrome.contextMenus.update(menuItems.pageLinkSelectedText, {
        title: `Current page: [${pageSelectionText}](${pageUrl})`,
    });
    chrome.contextMenus.update(menuItems.hyperLink, {
        title: `This link: [${linkText}](${linkUrl})`,
    });
}

chrome.tabs.onActivated.addListener(function(activeInfo) {
    const tabId = activeInfo.tabId;
    chrome.tabs.get(tabId, function (tab) {
        pageTitle = compress(tab.title, 15);
        pageUrl = compress(tab.url, 30);
        updateMenuTitle();
    })
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.request === 'selectedHtml') {
        const html = message.selectedHtml;
        console.log('html: ', html);
        const markdown = htmlToMarkdown(html);
        console.log('markdown: ', markdown);
        copyToClipboard(markdown);
        notifyCopied(markdown);

    } else if (message.request === 'selectedText') {
        pageSelectionText = message.selectedText;
        updateMenuTitle();

    } else if (message.request === 'hyperlinkInfo') {
        linkText = message.text;
        linkUrl = message.href;
        const markdown = `[${linkText}](${linkUrl})`;
        copyToClipboard(markdown);
        notifyCopied(markdown);
    }
});
