// Import dependencies
importScripts('showdown.min.js', 'ciam.js', 'background.js');

// Service workers cannot use window object
// This ensures compatibility with the existing code
self.window = self; 