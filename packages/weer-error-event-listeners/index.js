import Debug from '@weer/commons/debug';
import { mandatory, assert, timeouted } from '@weer/utils';
import { EXT_ERROR, PAC_ERROR } from '@weer/commons/error-types';
import { areProxySettingsControlledAsync } from './private/proxy-settings';

const debug = Debug('weer:catcher');

const bgName = 'BG';
const generateNameForDebug = (hostWindow) => {

  if (hostWindow === window) {
    return bgName;
  }
  return hostWindow.location.href
    .replace(/^.+\//, '')
    .replace(/.html$/, '')
    .toUpperCase();
};

// eslint-disable-next-line
export const installTypedErrorEventListenersOn = ({
  hostWindow = mandatory(),
  typedErrorEventListener = mandatory(),
  nameForDebug = generateNameForDebug(hostWindow),
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
    chrome.proxy.onProxyError.addListener(async (details) => {

      // TODO: This handler is not timeouted.
      // TODO: Test throwing error here and catching it.
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
    });
  }

  if (cb) {
    timeouted(cb)();
  }

  return function uninstallListeners() {

    hostWindow.removeEventListener('error', listener, ifUseCapture);
    hostWindow.removeEventListener('unhandledrejection', rejHandler, ifUseCapture);
  };
};
