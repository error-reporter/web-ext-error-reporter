import Debug from './private/debug';
import { areProxySettingsControlledAsync } from './private/proxy-settings';
import { mandatory, assert, timeouted } from './utils';
import { EXT_ERROR, PAC_ERROR } from './error-types';

const debug = Debug('weer:catcher');

const bgName = 'BG';

// eslint-disable-next-line
export const installTypedErrorEventListenersOn = ({
  hostWindow = mandatory(),
  nameForDebug = bgName,
  typedErrorEventListener = mandatory(),
} = {}, cb) => {

  const ifInBg = hostWindow === window;
  if (ifInBg) {
    assert(
      nameForDebug === 'BG',
      `Background window can't have name other than "${bgName}" (default value).`,
    );
  } else {
    assert(nameForDebug !== 'BG', 'nameForDebug "BG" is already assigned to the background window, choose something different.');
  }
  debug(ifInBg ? 'Installing handlers in BG.' : `Installing handlers in ${nameForDebug}.`);

  const listener = (errorEvent) => {

    debug(nameForDebug, 'caught:', errorEvent);
    typedErrorEventListener(EXT_ERROR, errorEvent);
  };

  const ifUseCapture = true;
  hostWindow.addEventListener('error', listener, ifUseCapture);

  const rejHandler = (event) => {

    event.preventDefault();
    debug(nameForDebug, 'rethrowing promise...');
    throw event.reason;

  };

  hostWindow.addEventListener('unhandledrejection', rejHandler, ifUseCapture);

  if (chrome.proxy && ifInBg) {
    chrome.proxy.onProxyError.addListener(timeouted(async (details) => {

      const ifControlled = await areProxySettingsControlledAsync();
      if (!ifControlled) {
        // PAC script is not controlled by this extension,
        // so its errors are caused by other extensoin.
        return;
      }
      /*
        Example: {
          details: "line: 7: Uncaught Error: This is error, man.",
          error: "net::ERR_PAC_SCRIPT_FAILED",
          fatal: false,
        }
      */
      typedErrorEventListener(PAC_ERROR, details);
    }));
  }

  if (cb) {
    timeouted(cb)();
  }

  return function uninstallListeners() {

    hostWindow.removeEventListener('error', listener, ifUseCapture);
    hostWindow.removeEventListener('unhandledrejection', rejHandler, ifUseCapture);
  };
};
