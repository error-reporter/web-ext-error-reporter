import Debug from 'debug';
import Errio from 'errio';
import Utils from './utils';

const debug = Debug(`error-tools:${__filename}`);

const errorEventToPlainObject = (errEv) => {

  const plainObj = [
    'message',
    'filename',
    'lineno',
    'colno',
    'type',
  ].reduce((acc, prop) => {

    acc[prop] = errEv[prop];
    return acc;

  }, {});

  if (errEv.error && typeof errEv === 'object') {
    plainObj.error =
      Errio.toObject(errEv.error, { stack: true, private: true });
  } else {
    plainObj.error = errEv.error;
  }
  return plainObj;

};

export default {

  installListenersOn(win = Utils.mandatory(), nameForDebug = Utils.mandatory(), cb) {

    const ifUseCapture = true;
    win.addEventListener('error', (errEvent) => {

      debug(`${nameForDebug}:GLOBAL ERROR`, errEvent);
      const plainObj = errorEventToPlainObject(errEvent);
      chrome.runtime.sendMessage({ to: 'error-reporter', errorData: plainObj });

      errEvent.preventDefault();
      errEvent.stopPropagation();

      return false;

    }, ifUseCapture);

    win.addEventListener('unhandledrejection', (event) => {

      debug(`${nameForDebug}: Unhandled rejection. Throwing error.`);
      event.preventDefault();
      throw event.reason;

    });

    if (cb) {
      Utils.timeouted(cb)();
    }

  },

};
