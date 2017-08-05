# WEER: Web Extensions Error Reporter

![Weer screenshot](https://rebrand.ly/weer-screenshot)

## Status [![Build Status](https://travis-ci.org/error-reporter/web-ext-error-reporter.svg?branch=master)](https://travis-ci.org/error-reporter/web-ext-error-reporter)

Needs review

## Install

`npm install --save weer`

## Usage

1. In background script of your extension
```js
import Weer from 'weer';
Weer.install({
  // Optional:
  errorReportingUrl: 'https://example.com/foo?title={{message}}&json={{json}}',
  extErrorIconUrl: 'https://example.com/img/ext-error-128.png',
  pacErrorIconUrl: 'https://example.com/img/pac-error-128.png',
  maskIconUrl: 'https://example.com/img/mask-128.png',
});
window.Weer = Weer; // For useage from other windows (popup, settings, etc).

throw new Error('This is caught by Weer, notification is shown, opens error reporter on click');
```

If you need only a part of API:

```js
import Utils from 'weer/esm/utils';
import ErrorCatchers from 'weer/esm/error-catchers';
import GetNotifiersSingleton from 'weer/esm/get-notifiers-singleton';

```
2. In non-bg window of your extension (popup, e.g.)
```js
'use strict';

chrome.runtime.getBackgroundPage((bgWindow) =>
  bgWindow.Weer.ErrorCatchers.installListenersOn({ hostWindow: window, nameForDebug: 'PUP' }, () => {

    // Put all your code inside this arrow body (it is timeouted).

    // Case 1:
    throw new Error('PUPERR (caught by Weer)');

    // Case 2:
    document.getElementById('btn').onclick = () => {

      throw new Error('ONCLCK! (caught by Weer)');

    };

    // Case 3:
    chrome.tabs.getCurrent(Weer.Utils.timeouted(() => {

      throw new Error('Timeouted Chrome API callback (caught by Weer)');

    }));


  })
);

// Case 4:
chrome.tabs.getCurrent(Weer.Utils.timeouted(() => {

  throw new Error('Timeouted Chrome API callback (caught by Weer)');

}));

```
3. Follow previous rule or face https://crbug.com/357568:
```js
// In non-bg window of extension:
'use strict';

// Case 1
throw new Error('Root (not caught by Weer');

// Case 2
setTimeout(
  () => { throw new Error('Timeouted root (caught by Weer'); },
  0,
);

// Case 3
chrome.tabs.getCurrent(() => {

  throw new Error('Chrome API callback (not caught by Weer)');

});

// Case 4
chrome.tabs.getCurrent(() => setTimeout(() => {

  throw new Error('Timeouted Chrome API callback (caught by Weer)');

}, 0));
```

### Setup Examples

See [examples](./examples) of setups for webpack, rollup or without bundlers.

### Demo

```
clone this repo
npm install
cd examples
npm start
ls dist <- Load as unpacked extension and play (tested on Chrome).
```

## Supported Browsers

Chrome: yes  
Firefox: yes, but notifications are not sticky, unhandled proimise rejections are [never] caught.

[never]: https://developer.mozilla.org/en-US/docs/Web/Events/unhandledrejection#Browser_compatibility

## Debugging

1. Bundle [visionmedia/debug] for your environment and export global `debug`.
2. Enable it by `debug.enable('weer:*')` in extension background window and reload extension.

[visionmedia/debug]: https://github.com/visionmedia/debug

## Credits

For credits of used assets see https://github.com/error-reporter/error-reporter.github.io
