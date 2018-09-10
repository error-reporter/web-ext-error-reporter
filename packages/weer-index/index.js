import {
  installGlobalHandlersOn,
  installGlobalHandlersOnAsync,
  addGlobalHandler,
} from '@weer/global-error-event-handlers';
import { installErrorNotifier } from '@weer/error-notifier';
import { openErrorReporter, makeReport } from '@weer/error-reporter';
import {
  errorEventToPlainObject,
  getSourceMappedErrorEventAsync,
} from '@weer/error-transformer';
import { EXT_ERROR } from '@weer/commons/error-types';
import * as Utils from '@weer/utils';

const { mandatory, timeouted } = Utils;

export {
  Utils,
  installGlobalHandlersOn,
  installGlobalHandlersOnAsync,
  addGlobalHandler,
};

const toPlainObjectAsync = async (
  errorType = mandatory(),
  errorEvent = mandatory(),
  ifUseSourceMaps = true,
) => {

  if (errorType !== EXT_ERROR) {
    return errorEvent;
  }
  let plainErrorEvent = errorEventToPlainObject(errorEvent);
  if (ifUseSourceMaps) {
    plainErrorEvent = await getSourceMappedErrorEventAsync(plainErrorEvent);
  }
  return plainErrorEvent;
};

installGlobalHandlersOn({
  hostWindow: window,
  nameForDebug: 'BG',
});

export const installErrorSubmissionHandler = (handler) =>
  chrome.runtime.onMessage.addListener(
    timeouted({
      /*
Returned value matters, see
https://developer.chrome.com/extensions/runtime#event-onMessage

> This function becomes invalid when the event listener returns,
> unless you return true from the event listener to indicate
> you wish to send a response asynchronously
      */
      returnValue: true,
      // Don't make cb async, because FireFox doesn't catch promise rejections.
      cb: (request, sender, sendResponse) => {

        if (request.action !== 'SEND_REPORT') {
          return;
        }
        try {
          const res = handler(request);
          Promise.resolve(res).then(
            (result) => sendResponse({ ok: true, result }),
            (error) => { throw error; },
          );
        } catch (error) {
          sendResponse({ error });
          // Global handlers must handle it, don't suppress this error.
          throw error;
        }
      },
    }),
  );

export const installErrorReporter = ({
  toEmail = mandatory(),
  sendReportsInLanguages = ['en'],
  ifToNotifyAboutAsync = (/* errorType, errorEvent */) => true,
  ifUseSourceMaps = true,
} = {}) => {

  const {
    notifyAboutError,
    uninstallErrorNotifier,
  } = installErrorNotifier();

  const anotherGlobalHandler = async (errorType, errorEvent) => {

    const ifToNotify = await ifToNotifyAboutAsync(
      errorType,
      errorEvent,
    );
    if (!ifToNotify) {
      return;
    }
    notifyAboutError({
      errorType,
      errorEventLike: errorEvent,
      clickHandler: async () =>
        openErrorReporter({
          toEmail,
          sendReportsInLanguages,
          errorTitle: errorEvent.message || errorEvent.error,
          report: makeReport({
            errorType,
            serializablePayload:
              await toPlainObjectAsync(errorType, errorEvent, ifUseSourceMaps),
          }),
        }),
    });
  };

  const removeHandler = addGlobalHandler(anotherGlobalHandler);
  const uninstallErrorReporter = () => {

    uninstallErrorNotifier();
    removeHandler();
  };
  return uninstallErrorReporter;
};
