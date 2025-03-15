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
    id: 'selectionToMarkdown',
    contexts: ['selection']
});

// When user selects text, show menu item: copy current page link with selected text as link text
menuItems.pageLinkSelectedText = chrome.contextMenus.create({
    parentId: 'root',
    title: 'Current page: [selected text](url)',
    type: 'normal',
    id: 'pageLinkSelectedText',
    contexts: ['selection']
});

// When user selects a link, show menu item: copy the link in Markdown format
menuItems.hyperLink = chrome.contextMenus.create({
    parentId: 'root',
    title: 'This link: [text](link)',
    type: 'normal',
    id: 'hyperLink',
    contexts: ['link']
});

// In normal cases, show menu item: copy current page link
menuItems.pageLinkTitle = chrome.contextMenus.create({
    parentId: 'root',
    title: 'Current page: [title](url)',
    type: 'normal',
    id: 'pageLinkTitle',
    contexts: ['all']
});

// 使用onClicked事件监听器处理菜单项点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case 'selectionToMarkdown':
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                files: ['get-selected-html.js']
            });
            break;
        case 'pageLinkSelectedText':
            const selectedText = info.selectionText;
            const pageUrl = info.pageUrl;
            const selectedMarkdown = `[${selectedText}](${pageUrl})`;
            self.ciam.copyToClipboard(selectedMarkdown);
            self.ciam.notifyCopied(selectedMarkdown);
            break;
        case 'hyperLink':
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                files: ['get-hyperlink-info.js']
            });
            break;
        case 'pageLinkTitle':
            const titleText = tab.title;
            const titleUrl = info.pageUrl;
            const titleMarkdown = `[${titleText}](${titleUrl})`;
            self.ciam.copyToClipboard(titleMarkdown);
            self.ciam.notifyCopied(titleMarkdown);
            break;
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
        pageTitle = self.ciam.compress(tab.title, 15);
        pageUrl = self.ciam.compress(tab.url, 30);
        updateMenuTitle();
    })
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // Handle converted markdown from convert-html-to-markdown.js
    if (message.request === 'markdownConverted') {
        const markdown = message.markdown;
        console.log('markdown: ', markdown);
        self.ciam.copyToClipboard(markdown);
        self.ciam.notifyCopied(markdown);
    }
    // Handle selected HTML content sent from get-selected-html.js
    else if (message.request === 'selectedHtml') {
        const html = message.selectedHtml;
        console.log('html: ', html);
        
        // Instead of converting in the background script, inject a content script to do the conversion
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs || tabs.length === 0) {
                console.error('No active tab found');
                return;
            }
            
            const tabId = tabs[0].id;
            chrome.scripting.executeScript({
                target: {tabId: tabId},
                files: ['convert-html-to-markdown.js']
            }, () => {
                // After the script is injected, send the HTML for conversion
                chrome.tabs.sendMessage(tabId, {
                    request: 'convertHtmlToMarkdown',
                    html: html
                });
            });
        });

    // Handle selected text content sent from content.js
    } else if (message.request === 'selectedText') {
        pageSelectionText = message.selectedText;
        updateMenuTitle();

    // Handle hyperlink information sent from get-hyperlink-info.js
    } else if (message.request === 'hyperlinkInfo') {
        linkText = message.text;
        linkUrl = message.href;
        const markdown = `[${linkText}](${linkUrl})`;
        self.ciam.copyToClipboard(markdown);
        self.ciam.notifyCopied(markdown);
    }
});
