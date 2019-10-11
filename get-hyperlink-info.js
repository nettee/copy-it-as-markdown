let element = document.activeElement;
if (element.tagName.toLowerCase() === 'a') {
    chrome.runtime.sendMessage({
        request: 'hyperlinkInfo',
        text: element.innerText,
        href: element.href,
    });
}

