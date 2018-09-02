# Weer API Documentation

## `Weer.Utils`

File: `weer-repo/src/src/utils.js`  
Objectives:
1. Help in catching errors with weer.
2. Help to write more robust code.

### `Utils.mandatory()`

```js
const foo = function foo(one = 'one', two = Utils.mandatory()) {
  /*...*/
};
foo('one'); // Throws error.
foo('one', 'two'); // No error.
foo('one', null); // No error.
foo('one', undefined); // Throws error (surprise).
```

### `Utils.throwIfError(error)`

Throws first argument if it is `== true`.

```js
const foo = function foo(cb) {
  /*...*/
  const error = new Error('oops');
  cb(error, result);
};
foo(Utils.throwIfError); // Throws Error('oops').
```

### `Utils.checkChromeError()`

Checks `chrome.runtime.lastError` and returns `new Error(message)` or nothing.
```js
chrome.runtime.openOptionsPage(
  () => {
    const err = Utils.checkChromeError(); // Error if no options page in `manifest.json`.
    /*...*/
  }
);
```

### `Utils.timeouted((...args) => {/*...*/})`

Fixes context for thrown errors to that, which allows catching on global `window`.
```js
chrome.runtime.openOptionsPage(Utils.timeouted((/*arg1, arg2, ...*/) => {

  throw new Error('I am catchable!');

}))
```

### `Utils.chromified((error, ...args) => {/*...*/})`

Allows to use error-first callbacks with chrome apis. Also `Utils.timeout`s callback.
```js
chrome.runtime.openOptionsPage(Utils.chromified((err, res1, res2) => {

  if (err) {
    throw err;
  }
  throw new Error('I am catchable!');

}))
```

### `Utils.getOrDie((...args) => {/*...*/})`

Gets result of chrome API, throws error in case of error, passes result to callback otherwise.
```js
chrome.runtime.openOptionsPage(Utils.getOrDie((res1, res2) => {

  throw new Error('I am catchable!');

}))
```

### `Utils.assert(valueToTest, errorMessage)`

Poor man's assert.

## `Weer.ErrorCatchers`

### `installListenersOn(configs, cb)`

Installs error and unhandled rejections catchers on `hostWindow` object, in case of error calls `handleErrorMessage({ to: 'error-reporter', payload: plainErrorEventObject })`.

### Configs
```js
{
  hostWindow = window,
  nameForDebug = 'BG',
  handleErrorMessage,
};
```

### Returns

`uninstallListeners`

## `Weer.GetNotifiersSingleton(configs)`

### Configs

```js
{
 sendReports: {
    toEmail = 'homerjsimpson@example.com',
    // In what language to display example for the error reporting form.
    inLanguages = ['en'],
  },
  onNotificationClick = defaultClickHandler,
  // Icons:
  extErrorIconUrl = 'https://rebrand.ly/ext-error',
  pacErrorIconUrl = 'https://rebrand.ly/pac-error',
  maskIconUrl = false,
};
```
`onNotificationClick` is a function `(errorMessage, report) => {...}`.
Report looks like:
```js
{
  payload: {
    colno: 13,
    error: {
      message: "I'm a type error!",
      name: "TypeError",
      stack: "...",
    },
    filename: "chrome-extension://mddbgiefhigdgkeggceilkaoamkbnajl/pages/popup/dist/bundle.js",
    lineno: 373,
    message: "Uncaught TypeError: I'm a type error!",
    path: "[[object Window]]",
    type: "error",
  },
  errorType: "ext-error",
  extName: "PAC Kitchen",
  version: "0.0.0.1",
  userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36",
  platform: "Linux x86_64",
}
```

### Return Type

```js
const noty = Weer.GetNotifiersSingleton(configs);
noty.switch('off'); // Switches off notifications.
noty.switch('pac-error'); // Switches off notifications for pac-errors.
noty.isOn('pac-error');
// To get a Map of `{ error-type: "description" }`:
noty.getErrorTypeToLabelMap();
```
## Weer.install(configs)

`configs` are passed to `Weer.GetNotifiersSingleton`, see above.
