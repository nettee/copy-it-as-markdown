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
window.ciam = {
    htmlToMarkdown: htmlToMarkdown,
    copyToClipboard: copyToClipboard,
    notifyCopied: notifyCopied,
    compress: compress
};