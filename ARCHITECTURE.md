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

## Variable Names

### `errorType`

May take values defined in `error-types.js` (e.g. enums `EXT_ERROR` and `PAC_ERROR`).

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

## `error-event-listeners.js`

Objective: For a given `window` object install one handler for events:
`error`, `unhandledrejection` and `chrome.proxy.onProxyError` (PAC script errors).  
Handler has a signature: `(errorType, errorEvent) => {...}`.

```js
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

## `global-error-event-handlers.js`

Objective: Install error handlers that are triggered on errors of all registered `window` objects.  
Each handler has a signature: `(errorType, errorEvent) => {...}`.

```js
export const addGlobalHandler = (handler = mandatory()) => {...};
export const installGlobalHandlersOn = (
  { hostWindow, nameForDebug },
  cb,
) => {...};
export const installGlobalHandlersOnAsync = (opts) => {...}; // Without cb and returns Promise.

// Example

// In the background script.
import { EXT_ERROR } from './path/to/error-types'
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
  await bgWindow.installGlobalHandlersOnAsync(
    { hostWindow: window, nameForDebug: 'PUP' },
  );
  throw new TypeError('This error triggers all global triggers installed.');
}
```
