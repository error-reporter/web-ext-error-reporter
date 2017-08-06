# Weer

![Weer screenshot](https://rebrand.ly/weer-screenshot)

[![Build Status](https://travis-ci.org/error-reporter/weer.svg?branch=master)](https://travis-ci.org/error-reporter/weer)

> Web Extensions Error Reporter catches global errors, shows notifications and opens error reporter in one click

Status: not ready yet :-(

## Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [Formats](#formats)
  - [Import](#import)
    - [With Bundler](#with-bundler)
    - [Without Bundler](#without-bundler)
  - [Install and Use](#install-and-use)
    - [One Rule to Know](#one-rule-to-know)
    - [Install in Background Script](#install-in-background-script)
    - [Install in Non-Background Script](#install-in-non-background-script)
  - [Debugging](#debugging)
  - [Examples of Setups](#examples-of-setups)
  - [Demo](#demo)
- [Supported Browsers](#supported-browsers)
- [API](#api)
- [Maintainer](#maintainer)
- [Contribute](#contribute)
- [Credits](#credits)
- [License](#license)

## Install

`npm install --save weer`

## Usage

### Formats

```console
tree ./node_modules/weer
weer/
├── cjs // Common JS format: `require(...)`
│   ├── error-catchers.js
│   ├── get-notifiers-singleton.js
│   ├── index.js
│   └── utils.js
├── esm // EcmaScript Modules format: `import ...`
│   ├── error-catchers.js
│   ├── get-notifiers-singleton.js
│   ├── index.js
│   └── utils.js
├── package.json
└── umd // Universal Module Definition format: `<script src=...></script>`
    ├── error-catchers.js // Requires `utils` bundle
    ├── get-notifiers-singleton.js // Requires `utils` bundle
    ├── index.js // All in one bundle, no dependencies
    └── utils.js
```
### Import

#### With Bundler

For webpack, rollup, etc.

```js
import Weer from 'weer';
window.Weer = Weer; // For usage from non-bg windows (popup, settings, etc).
```

If you need only a part of the API:

```js
import Utils from 'weer/esm/utils';
import ErrorCatchers from 'weer/esm/error-catchers';
import GetNotifiersSingleton from 'weer/esm/get-notifiers-singleton';
```

#### Without Bundler

```console
$ cp ./node_modules/weer/umd/index.js ./foo-extension/vendor/weer.js
$ cat foo-extension/manifest.json
...
"scripts": [
  "./vendor/optional-debug.js",
  "./vendor/weer.js",
  ...
],
...
```

### Install and Use

#### One Rule to Know

There is some mess in how you catch errors in a web-extension:

```js
'use strict';
/*
  bg-window — background window, main window of a web-extension.
  non-bg-windows — popup, settings and other pages windows of a web-extension, that are not bg-window.
*/


window.addEventListener('error', (errorEvent) => {/* ... */});

// Case 1
throw new Error('Root (caught only in bg-window, not caught in non-bg windows');

// Case 2
setTimeout(
  () => { throw new Error('Timeouted root (caught by handlers'); },
  0,
);

// Case 3
chrome.tabs.getCurrent(() => {

  throw new Error('Chrome API callback (not caught by handlers)');

});

// Case 4
chrome.tabs.getCurrent(() => setTimeout(() => {

  throw new Error('Timeouted Chrome API callback (caught by handlers)');

}, 0));
```
So if you want error catchers to work — your code must be wrapped in `setTimeout`.

This behavior may be a bug and is discussed in https://crbug.com/357568.

#### Install in Background Script

```js
Weer.install({
  // Optional:
  errorReportingUrl: 'https://example.com/foo?title={{message}}&json={{json}}',
  extErrorIconUrl: 'https://example.com/img/ext-error-128.png',
  pacErrorIconUrl: 'https://example.com/img/pac-error-128.png',
  maskIconUrl: 'https://example.com/img/mask-128.png',
});

throw new Error('This is caught by Weer, notification is shown, opens error reporter on click');
```

#### Install in Non-Background Script

```js
// In popup, settings and other pages.
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

### Debugging

1. Bundle [visionmedia/debug] for your environment and export global `debug`.
2. Enable it by `debug.enable('weer:*')` in extension background window and reload extension.

[visionmedia/debug]: https://github.com/visionmedia/debug


### Examples of Setups

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


## API

See [wiki](https://github.com/error-reporter/weer/wiki/API-Documentation).

## Maintainer

- [Ilya Ig. Petrov](https://gitbub.com/ilyaigpetrov)

## Contribute

You are welcome to propose [issues](https://github.com/error-reporter/weer/issues), pull requests or ask questions.

## Credits

For credits of used assets see https://github.com/error-reporter/error-reporter.github.io

## License

[GPL-3.0+](./LICENSE)
