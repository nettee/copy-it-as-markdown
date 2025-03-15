/**
 * Convert HTML to Markdown format
 * @param {string} html - The HTML content to convert
 * @return {string} The converted Markdown content
 */
function htmlToMarkdown(html) {
    html = html.replace(/\s+/g, ' ');
    console.log('sanitized HTML: ', html);

    const converter = new showdown.Converter();
    let markdown = converter.makeMarkdown(html);

    markdown = markdown.replace(/<!--.*?-->/g, '');

    return markdown;
}

/**
 * Copy text to clipboard
 * @param {string} text - The text to copy
 */
function copyToClipboard(text) {
    // In MV3, we can't directly manipulate the clipboard from a service worker
    // We'll use the Clipboard API through an injected content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs || tabs.length === 0) {
            console.error('No active tab found');
            return;
        }
        
        const tabId = tabs[0].id;
        
        // Define the function to be executed in the content script
        function copyTextInPage(textToCopy) {
            const input = document.createElement('textarea');
            input.style.position = 'fixed';
            input.style.opacity = 0;
            input.value = textToCopy;
            document.body.appendChild(input);
            input.select();
            const success = document.execCommand('Copy');
            document.body.removeChild(input);
            return success;
        }
        
        // Execute the script in the active tab
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            func: copyTextInPage,
            args: [text]
        }).catch(error => {
            console.error('Failed to copy text to clipboard:', error);
        });
    });
}

/**
 * Show notification when content is copied
 * @param {string} content - The copied content
 */
function notifyCopied(content) {
    chrome.notifications.create({
        type: 'basic',
        title: 'Content copied to clipboard',
        message: content,
        iconUrl: 'img/icon100.png',
    });
}

/**
 * Compress string to specified length
 * @param {string} s - The string to compress
 * @param {number} len - The maximum length
 * @return {string} The compressed string
 */
function compress(s, len) {
    if (s.length <= len) {
        return s;
    } else {
        return s.substring(0, len-3) + '...';
    }
}

// Export the functions to make them available to other files
// In Service Worker context, use self instead of window
const ciam = {
    htmlToMarkdown: htmlToMarkdown,
    copyToClipboard: copyToClipboard,
    notifyCopied: notifyCopied,
    compress: compress
};

// For compatibility with existing code
self.ciam = ciam;