import Errio from 'errio';
import Debug from './private/debug';
import Utils from './utils';

const debug = Debug('weer:catcher');

const errorEventToPlainObject = (errorEvent) => {

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
    plainObj.error =
      Errio.toObject(errorEvent.error, { stack: true, private: true });
  } else {
    plainObj.error = errorEvent.error;
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

    const listener = (errorEventent) => {

      debug(nameForDebug, errorEventent);
      const plainObj = errorEventToPlainObject(errorEventent);

      const msg = {
        to: 'error-reporter',
        payload: plainObj,
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
