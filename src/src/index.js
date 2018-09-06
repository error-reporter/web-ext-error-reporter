import {
  installGlobalHandlersOn,
  installGlobalHandlersOnAsync,
  addGlobalHandler,
} from './global-error-event-handlers';
import { installErrorNotifier } from './error-notifier';
import { openErrorReporter, makeReport } from './error-reporter';
import { errorEventToPlainObject } from './error-event-to-plain-object';
import { EXT_ERROR } from './error-types';
import * as Utils from './utils';

const { mandatory } = Utils;

export {
  Utils,
  installGlobalHandlersOn,
  installGlobalHandlersOnAsync,
  addGlobalHandler,
};

const toPlainObject = (errorType = mandatory(), errorEvent = mandatory()) =>
  (errorType === EXT_ERROR
    ? errorEventToPlainObject(errorEvent)
    : errorEvent
  );

installGlobalHandlersOn({
  hostWindow: window,
  nameForDebug: 'BG',
});

export const installErrorReporter = ({
  toEmail = mandatory(),
  sendReportsInLanguages = ['en'],
  ifToNotifyAboutAsync = (/* errorType, errorEvent */) => true,
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
      clickHandler: () =>
        openErrorReporter({
          toEmail,
          sendReportsInLanguages,
          errorTitle: errorEvent.message || errorEvent.error,
          report: makeReport({
            errorType,
            serializablePayload: toPlainObject(errorType, errorEvent),
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
