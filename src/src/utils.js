/*

# Purpose

1. `timeouted` wrapper that makes error catching possible.
2. Convert error-first callbacks for use by chrome API: `chromified`.
3. Add utils for safer coding: `mandatory`, `throwIfError`.

*/
import Errio from 'errio';

const Utils = {

  mandatory() {

    throw new TypeError('Missing required argument. Be explicit if you swallow errors.');

  },

  throwIfError(err) {

    if (err) {
      throw err;
    }

  },

  checkChromeError() {

    // Chrome API calls your cb in a context different from the point of API
    // method invokation.
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

  },

  timeouted(cb = Utils.mandatory) {

    // setTimeout fixes error context, see https://crbug.com/357568
    return (...args) => { setTimeout(() => cb(...args), 0); };

  },

  chromified(cb = Utils.mandatory()) {

    // Take error first callback and convert it to chrome API callback.
    return function wrapper(...args) {

      const err = Utils.checkChromeError();
      Utils.timeouted(cb)(err, ...args);

    };

  },

  getOrDie(cb = Utils.mandatory()) {

    return Utils.chromified((err, ...args) => {

      if (err) {
        throw err;
      }
      cb(...args);

    });

  },

  assert(value, message) {

    if (!value) {
      throw new Error(message || `Assertion failed, value: ${value}`);
    }

  },

  errorToPlainObject(error) {

    return Errio.toObject(error, { stack: true, private: true });

  },

  errorEventToPlainObject(errorEvent) {

    const plainObj = [
      'message',
      'filename',
      'lineno',
      'colno',
      'type',
      'path',
    ].reduce((acc, prop) => {

      acc[prop] = errorEvent[prop];
      return acc;

    }, {});
    if (plainObj.path) {
      const pathStr = plainObj.path.map((o) => {

        let res = '';
        if (o.tagName) {
          res += `<${o.tagName.toLowerCase()}`;
          if (o.attributes) {
            res += Array.from(o.attributes).map((atr) => ` ${atr.name}="${atr.value}"`).join('');
          }
          res += '>';
        }
        if (!res) {
          res += `${o}`;
        }
        return res;

      }).join(', ');

      plainObj.path = `[${pathStr}]`;
    }

    if (errorEvent.error && typeof errorEvent === 'object') {
      plainObj.error = this.errorToPlainObject(errorEvent.error);
    } else {
      plainObj.error = errorEvent.error;
    }
    return plainObj;

  },

};

export default Utils;
