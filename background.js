var pageTitle = 'title';
var pageUrl = 'url';
var pageSelectionText = 'selected text';
var linkText = 'text';
var linkUrl = 'url';

var menuItems = {};

// Create a right-click menu item in Chrome browser
menuItems.root = chrome.contextMenus.create({
    title: 'Copy it as markdown',
    id: 'root',
    contexts: ['all'],
});

// When user selects text, show menu item: copy it as Markdown format
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

// When user selects text, show menu item: copy current page link with selected text as link text
menuItems.pageLinkSelectedText = chrome.contextMenus.create({
    parentId: 'root',
    title: 'Current page: [selected text](url)',
    type: 'normal',
    contexts: ['selection'],
    onclick: function (info, tab) {
        const text = info.selectionText;
        const url = info.pageUrl;
        const markdown = `[${text}](${url})`;
        window.ciam.copyToClipboard(markdown);
        window.ciam.notifyCopied(markdown);
    }
});

// When user selects a link, show menu item: copy the link in Markdown format
menuItems.hyperLink = chrome.contextMenus.create({
    parentId: 'root',
    title: 'This link: [text](link)',
    type: 'normal',
    contexts: ['link'],
    onclick: function (info, tab) {
        chrome.tabs.executeScript(null, {file: 'get-hyperlink-info.js'});
    }
});

// In normal cases, show menu item: copy current page link
menuItems.pageLinkTitle = chrome.contextMenus.create({
    parentId: 'root',
    title: 'Current page: [title](url)',
    type: 'normal',
    contexts: ['all'],
    onclick: function (info, tab) {
        const text = tab.title;
        const url = info.pageUrl;
        const markdown = `[${text}](${url})`;
        window.ciam.copyToClipboard(markdown);
        window.ciam.notifyCopied(markdown);
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
        pageTitle = window.ciam.compress(tab.title, 15);
        pageUrl = window.ciam.compress(tab.url, 30);
        updateMenuTitle();
    })
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // Handle selected HTML content sent from get-selected-html.js
    if (message.request === 'selectedHtml') {
        const html = message.selectedHtml;
        console.log('html: ', html);
        const markdown = window.ciam.htmlToMarkdown(html);
        console.log('markdown: ', markdown);
        window.ciam.copyToClipboard(markdown);
        window.ciam.notifyCopied(markdown);

    // Handle selected text content sent from content.js
    } else if (message.request === 'selectedText') {
        pageSelectionText = message.selectedText;
        updateMenuTitle();

    // Handle hyperlink information sent from get-hyperlink-info.js
    } else if (message.request === 'hyperlinkInfo') {
        linkText = message.text;
        linkUrl = message.href;
        const markdown = `[${linkText}](${linkUrl})`;
        window.ciam.copyToClipboard(markdown);
        window.ciam.notifyCopied(markdown);
    }
});
