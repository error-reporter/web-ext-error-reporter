// import * as Weer from './vendor/weer/index.js'
import { mapErrorAsync } from './lib/map-stack-frames.js';

console.log('CONTENT SCRIPT STARTED', chrome.runtime);
// const port = chrome.runtime.connect();

window.addEventListener('message', function(event) {

    console.log('CS RECEIVED:', event);
    if (event.source != window) {
        console.log('EVENT.SOURCE IS:', event.source);
        return;
    }

    if (event.data.action === 'SEND_REPORT') {
        console.log('Content script received SEND_DATA:', event.data);
        chrome.runtime.sendMessage(event.data, {}, (...args) => console.log('YES', ...args));
    }
});
