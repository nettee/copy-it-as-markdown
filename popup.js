// When the popup HTML has loaded
window.addEventListener('load', function (event) {
    // Get the event page
    chrome.runtime.getBackgroundPage(function (eventPage) {
        // Call the getPageInfo function in the event page.
        // This injects content.js into the current tab's HTML
        eventPage.getPageDetails(function (message) {
            alert(message.selectedHtml);
            document.getElementById('output').innerText = message.selectedHtml;
        });
    });
});
