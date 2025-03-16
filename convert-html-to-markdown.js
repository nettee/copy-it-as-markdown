// This content script runs in the context of the web page and has access to the DOM
// It receives HTML from the background script, converts it to markdown, and sends it back

// Listen for the request to convert HTML to Markdown
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.request === 'convertHtmlToMarkdown') {
        // Showdown has been preloaded via manifest.json and can be used directly
        const markdown = convertHtmlToMarkdown(message.html);
        sendMarkdownToBackground(markdown);
        
        // Add response to indicate the message has been processed
        sendResponse({success: true});
    }
    // Since we have already called sendResponse synchronously, we don't need to return true
    // Only if the process is truly asynchronous, we need to return true
});

/**
 * Convert HTML to Markdown format
 * @param {string} html - The HTML content to convert
 * @return {string} The converted Markdown content
 */
function convertHtmlToMarkdown(html) {
    html = html.replace(/\s+/g, ' ');
    console.log('sanitized HTML: ', html);

    // Check if showdown is defined (as a safety check)
    if (typeof showdown === 'undefined') {
        console.error('Showdown library is not loaded');
        return html; // Return original HTML as fallback
    }

    // Note: No need to use window.showdown, just use showdown directly
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