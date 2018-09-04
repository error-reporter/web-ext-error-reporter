/*

# Purpose

1. `timeouted` wrapper that makes error catching possible.
2. Convert error-first callbacks for use by chrome API: `chromified`.
3. Add utils for safer coding: `mandatory`, `throwIfError`.

*/
export const mandatory = () => {

  throw new TypeError(
    'Missing required argument. Be explicit if you swallow errors.',
  );
};

export const assert = (value, message) => {

  if (!value) {
    throw new Error(message || `Assertion failed, value: ${value}`);
  }
};

export const throwIfError = (...args) => {

  assert(args.length === 1, 'Only one argument (error) must be passed.');
  const err = args[0];
  if (err) {
    throw err;
  }
};

export const checkChromeError = () => {

  const err = chrome.runtime.lastError || chrome.extension.lastError;
  if (!err) {
    return;
  }
  /*
    Example of lastError:
      `chrome.runtime.openOptionsPage(() => console.log(chrome.runtime.lastError))`
      {message: "Could not create an options page."}
  */
  return new Error(err.message); // Add stack.
};

// setTimeout fixes error context, see https://crbug.com/357568
export const timeouted = (cb = mandatory()) =>
  (...args) => { setTimeout(() => cb(...args), 0); };

// Take error first callback and convert it to chrome API callback.
export const chromified = (cb = mandatory()) =>
  function wrapper(...args) {

    const err = checkChromeError();
    timeouted(cb)(err, ...args);
  };

export const getOrDie = (cb = mandatory()) =>
  chromified((err, ...args) => {

    if (err) {
      throw err;
    }
    cb(...args);
  });
