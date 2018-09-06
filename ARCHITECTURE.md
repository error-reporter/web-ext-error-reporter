# Weer Architecture

This file may be hard to maintain, you may face some outdated info here.  
For more genuine API definition look into the sources.

```console
$ tree ./src/src
./src/src/
├── error-event-listeners.js
├── error-event-to-plain-object.js
├── error-notifier.js
├── error-reporter.js
├── error-types.js
├── global-error-event-handlers.js
├── index.js
├── private
│   └── ...
└── utils.js
```

[error-types]: /src/src/error-types.js
[error-event-listeners]: /src/src/error-event-listeners.js
[global-error-event-handlers]: /src/src/global-error-event-handlers.js
[utils]: /src/src/utils.js
[error-reporter]: /src/src/error-reporter.js
[error-notifier]: /src/src/error-notifier.js
[error-event-to-plain-object]: /src/src/error-event-to-plain-object.js
[index]: /src/src/index.js

## Variable Names

### `errorType`

May take values defined in [`error-types.js`][error-types] (e.g. enums `EXT_ERROR` and `PAC_ERROR`).

### `errorEvent`

Object passed to a native error listener.  
For `window.onerror` (`EXT_ERROR`) it's [ErrorEvent](https://developer.mozilla.org/en-US/docs/Web/API/ErrorEvent).  
For `chrome.proxy.onProxyError` (`PAC_ERROR`) it's:
```js
{
  details: "line: 7: Uncaught Error: This is error, man.",
  error: "net::ERR_PAC_SCRIPT_FAILED",
  fatal: false,
} 
```
__TODO__: Add FireFox's `browser.proxy.onError`.

### Components

## [`error-event-listeners.js`][error-event-listeners]

Objectives: For a given `window` object install one handler for all error events:
`error`, `unhandledrejection` and `chrome.proxy.onProxyError` (PAC script errors).  
Handler has a signature: `(errorType, errorEvent) => {...}`.

```js
// Definitions:
export const installTypedErrorEventListenersOn = ({
  hostWindow = mandatory(),
  nameForDebug = bgName, // Anything that shortly names hostWindow: 'BG' (background), 'PUP' (popup), 'STNGS' (settings).
  typedErrorEventListener = mandatory(),
} = {}, cb) => {...};
```
`nameForDebug` — Anything that shortly names `hostWindow`: `'BG'` (background), `'PUP'` (popup), `'SET'` (settings), etc.

You have to pass `typedErrorEventListener` on every call of this function.  
Wouldn't it be more convenient to install one global error handler for all windows?  
Take a look at `global-error-event-handlers.js` then.

## [`global-error-event-handlers.js`][global-error-event-handlers]

Objectives: Install error handlers that are triggered on errors of all registered `window` objects.  
Each handler has a signature: `(errorType, errorEvent) => {...}`.

```js
// Definitions:
export const addGlobalHandler = (handler = mandatory()) => {...};
export const installGlobalHandlersOn = (
  { hostWindow, nameForDebug },
  cb,
) => {...};
export const installGlobalHandlersOnAsync = (opts) => {...}; // Same as above but w/o cb and returns Promise.

// Example

// In the background script.
import {
  addGlobalHandler,
  installGlobalHandlersOn,
  installGlobalHandlersOnAsync,
} from './path/to/global-error-event-handlers';
import { EXT_ERROR } from './path/to/error-types';
import { timeouted } from './path/to/utils';

// Expose for non-bg windows.
window.Weer = {
  installGlobalHandlersOnAsync,
  Utils: { timeouted }, // Optional.
}

addGlobalHandler((errorType, errorEvent) => {
  if (errorType === EXT_ERROR) {
    Sentry.captureException(errorEvent.error); // TODO: not tested.
  } else { /* TODO: figure out how to use Sentry for custom data objects. */ }
}))
installGlobalHandlersOn(
  { hostWindow: window, nameForDebug: 'BG' },
);

// In the popup script.
chrome.runtime.getBackgroundPage(async (bgWindow) => {
  await bgWindow.Weer.installGlobalHandlersOnAsync(
    { hostWindow: window, nameForDebug: 'PUP' },
  );
  throw new TypeError('This error triggers all global triggers installed.');
  // Or:  
  chrome.tabs.getCurrent(Weer.Utils.timeouted(() => {

    throw new Error('Timeouted Chrome API callback (caught by Weer)');

  }));
}
```

## [`utils.js`][utils]

Objectives:

1. Help in catching errors with Weer (`timeouted`).
2. Help in handling errors of the WebExtensions API (`checkChromeError`, `chromified`, `getOrDie`).
3. Help in writing more robust code (`assert`, `mandatory`, `throwIfError`).

For a full API see [API.md](./API.md).

## [`error-reporter.js`][error-reporter]

Objectives: Given a serializable object describing an error (variable `report`), open new tab with an error reporter. Error reporter shows the error report to the user and allows to submit it to develoeprs via email. [Error reporter demo](https://error-reporter.github.io/v0/error/view/?title=Err%20in%20BG&json=%7B%22payload%22%3A%7B%22message%22%3A%22Uncaught%20Error%3A%20Err%20in%20BG%22%2C%22filename%22%3A%22chrome-extension%3A%2F%2Fnjhjpcpfmgloiakfbipnjghcanjllmec%2Findex.js%22%2C%22lineno%22%3A10%2C%22colno%22%3A3%2C%22type%22%3A%22error%22%2C%22error%22%3A%7B%22name%22%3A%22Error%22%2C%22message%22%3A%22Err%20in%20BG%22%2C%22stack%22%3A%22Error%3A%20Err%20in%20BG%5Cn%20%20%20%20at%20foo%20%28chrome-extension%3A%2F%2Fnjhjpcpfmgloiakfbipnjghcanjllmec%2Findex.js%3A10%3A9%29%5Cn%20%20%20%20at%20chrome-extension%3A%2F%2Fnjhjpcpfmgloiakfbipnjghcanjllmec%2Findex.js%3A14%3A1%22%7D%7D%2C%22errorType%22%3A%22ext-error%22%2C%22extName%22%3A%22Weer%20Test%22%2C%22version%22%3A%220.0.0.1%22%2C%22userAgent%22%3A%22Mozilla%2F5.0%20%28X11%3B%20Linux%20x86_64%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F60.0.3112.90%20Safari%2F537.36%22%2C%22platform%22%3A%22Linux%20x86_64%22%7D#toEmail=DONT_REPORT_PLEASE).

```js
export const openErrorReporter = ({
  toEmail = mandatory(),
  sendReportsInLanguages = mandatory(),
  errorTitle = mandatory(),
  report = mandatory(),
} = {}) => {...};
```
`toEmail` — To which email report must be sent after pressing "Send".  
`sendReportsInLanguages` — E.g. `['ru', 'en']`. In what language to show message template to the user (based on `navigator.language`).  
`errorTitle` — Name of the error showed to the user, e.g. `Error "TypeError: FOOBAR" occurred...`. Don't confuse with `error.name` (e.g. `'TypeError'`).  
`report` — Serializable object with required properties: `extName`, `version` and `payload` (error or errorEvent as plain object).

```js
export const makeReport = ({
  errorType,
  serializablePayload = mandatory(),
}) => ({...});
```

## [`error-notifier.js`][error-notifier]

Objectives: Given errorEvent-like object (`{ message: String }`, `{ error: String }`) and `clickHandler` return function `notifyAboutError` to notify about errors.

__TODO__: Think about other paths for icons, they are not related to the error reporter directly which may be used without notifications at all.

```js
export const installErrorNotifier = ({
  extErrorIconUrl = 'https://error-reporter.github.io/v0/icons/ext-error-128.png',
  pacErrorIconUrl = 'https://error-reporter.github.io/v0/icons/pac-error-128.png',
  maskIconUrl = false,
} = {}) => {
  ...
  const notifyAboutError = async ({
    clickHandler = mandatory(), // Takes no arguments.
    errorEventLike = mandatory(),
    errorType = ErrorTypes.EXT_ERROR,
    notyTitle = 'Extension error',
    context = `${manifest.name} ${manifest.version}`,
    ifSticky = true,
  }) => {...}
  ...
  return { notifyAboutError, ... };
}
```

## [`error-event-to-plain-object.js`][error-event-to-plain-object]

Objectives: Covert Error or ErrorEvent object into a plain object which is serializable so it may be passed over a network.

```js
export const errorToPlainObject = (error = mandatory()) => {...}
export const errorEventToPlainObject = (errorEvent = mandatory()) => {...}
```

Now you have all the parts to combine `addGlobalHandler` → `notifyAboutError` → `errorEventToPlainObject` → `openErrorReporter` into an error reporting soluition like Weer defined in the `index.js`.

## [`index.js`][index]

Objectives: Provide minimal high-level API for installing a solution that:

1. Catches all errors.
2. Shows notifications.
3. Opens error reporter when clicked.

```js
export {
  Utils,
  installGlobalHandlersOn,
  installGlobalHandlersOnAsync,
  addGlobalHandler,
};

```js
export const installErrorReporter = ({
  toEmail = mandatory(),
  sendReportsInLanguages = ['en'],
  ifToNotifyAboutAsync = (/* errorType, errorEvent */) => true,
} = {}) => {
```
