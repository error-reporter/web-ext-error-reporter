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

const bgName = 'BG';

export default {

  installListenersOn({
    hostWindow = window,
    nameForDebug = bgName,
    handleErrorMessage,
  } = {}, cb) {

    const ifInBg = hostWindow === window;
    const bgIsBg = `Background window can't have name other than "${bgName}". ` +
      `Default value is "${bgName}".`;
    if (ifInBg) {
      Utils.assert(
        typeof handleErrorMessage === 'function',
        'Messaging from BG window to itself is not allowed,' +
        ' provide message handler for such cases.',
      );
      Utils.assert(nameForDebug === 'BG', bgIsBg);
    } else {
      Utils.assert(nameForDebug !== 'BG', bgIsBg);
    }

    const listener = (errEvent) => {

      debug(nameForDebug, errEvent);
      const plainObj = errorEventToPlainObject(errEvent);

      const msg = {
        to: 'error-reporter',
        errorData: plainObj,
      };

      if (ifInBg) {
        // Because self messaging is not allowed.
        handleErrorMessage(msg);
      } else {
        hostWindow.chrome.runtime.sendMessage(msg);
      }

    };

    const ifUseCapture = true;
    hostWindow.addEventListener('error', listener, ifUseCapture);

    const rejHandler = (event) => {

      event.preventDefault();
      debug(nameForDebug, 'rethrowing promise...');
      throw event.reason;

    };

    hostWindow.addEventListener('unhandledrejection', rejHandler, ifUseCapture);

    if (cb) {
      Utils.timeouted(cb)();
    }

    return function uninstallListeners() {

      hostWindow.removeEventListener('error', listener, ifUseCapture);
      hostWindow.removeEventListener('unhandledrejection', rejHandler, ifUseCapture);

    };

  },

};
