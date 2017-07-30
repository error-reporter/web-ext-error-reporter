import Errio from 'errio';
import Debug from './private/debug';
import Utils from './utils';

const debug = Debug('weer:catcher');

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

  installListenersOn(
    win,
    nameForDebug = Utils.mandatory(),
    notifyFromBg,
    cb,
  ) {

    const ifUseCapture = true;
    win.addEventListener('error', (errEvent) => {

      debug(nameForDebug, errEvent);
      const plainObj = errorEventToPlainObject(errEvent);

      const msg = {
        to: 'error-reporter',
        errorData: plainObj,
      };

      // console.log(errEvent);
      // console.log('WW?', window === win);
      // console.log('WW2?', window === errEvent.target);

      if (win === window) {
        notifyFromBg(msg);
      } else {
        chrome.runtime.sendMessage(msg);
      }

      // errEvent.preventDefault();
      // return false;

    }, ifUseCapture);

    win.addEventListener('unhandledrejection', (event) => {

      event.preventDefault();
      throw event.reason;

    });

    if (cb) {
      Utils.timeouted(cb)();
    }

  },

};
