// This content script runs in the context of the web page and has access to the DOM
// It receives HTML from the background script, converts it to markdown, and sends it back

// Listen for the request to convert HTML to Markdown
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.request === 'convertHtmlToMarkdown') {
        // Showdown 已通过 manifest.json 预先加载，可以直接使用
        const markdown = convertHtmlToMarkdown(message.html);
        sendMarkdownToBackground(markdown);
    }
    // 返回true以保持消息通道开放，允许异步响应
    return true;
});

/**
 * Convert HTML to Markdown format
 * @param {string} html - The HTML content to convert
 * @return {string} The converted Markdown content
 */
function convertHtmlToMarkdown(html) {
    html = html.replace(/\s+/g, ' ');
    console.log('sanitized HTML: ', html);

    // 检查showdown是否已定义（作为安全检查）
    if (typeof showdown === 'undefined') {
        console.error('Showdown library is not loaded');
        return html; // 返回原始HTML作为后备
    }

    // 注意：不再需要使用 window.showdown，直接使用 showdown 即可
    const converter = new showdown.Converter();
    let markdown = converter.makeMarkdown(html);

    markdown = markdown.replace(/<!--.*?-->/g, '');

    return markdown;
}

/**
 * Send the converted markdown back to the background script
 * @param {string} markdown - The converted markdown content
 */
function sendMarkdownToBackground(markdown) {
    chrome.runtime.sendMessage({
        request: 'markdownConverted',
        markdown: markdown
    });
}