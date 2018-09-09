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

const { mandatory } = Utils;

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
