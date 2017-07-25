/* eslint-disable */
import stringifyError from './stringify-error';

export default {

  installListenersOn(win, name, cb) {

    win.addEventListener('error', (errEvent) => {

      console.warn(name + ':GLOBAL ERROR', errEvent);
      const json = stringifyError(errEvent);
      chrome.runtime.sendMessage({ error: json });

      errEvent.preventDefault();
      errEvent.stopPropagation();

      return false;

    }, true);

    win.addEventListener('unhandledrejection', (event) => {

      console.warn(name + ': Unhandled rejection. Throwing error.');
      event.preventDefault();
      throw event.reason;

    });

    if (cb) {
      // In most cases getBackgroundPage( (bg) => installListenersOn
      // Without setTimeout errors are swallowed, bug #357568
      setTimeout(cb, 0);
    }

  },

};
