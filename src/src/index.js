// import Debug from './private/debug';
import { installTypedErrorEventListenersOn } from './error-event-listeners';
import { installErrorNotifier } from './error-notifier';
import { openErrorReporter, makeReport } from './error-reporter';
import { errorEventToPlainObject } from './to-plain-object';
import { EXT_ERROR } from './error-types';
import * as Utils from './utils';

const { mandatory } = Utils;

export { Utils as utils };

const toPlainObject = (errorType = mandatory(), errorEvent = mandatory()) =>
  (errorType === EXT_ERROR
    ? errorEventToPlainObject(errorEvent)
    : errorEvent
  );

// const debug = Debug('weer:main');

/*
 In this file we will be using term handler instead of listener.
 Listener term is already used in error-event-listners module.
 I hope it will make it easier to distinct methods of one API from another.
*/

let globalTypedErrorEventHandlers = [];

export const addGlobalHandler = (handler) => {

  globalTypedErrorEventHandlers.push(handler);
  const removeHandler = () => {

    globalTypedErrorEventHandlers = globalTypedErrorEventHandlers.filter(
      (otherHandler) => otherHandler !== handler,
    );
  };
  return removeHandler;
};

const triggerGlobalHandlers = (errorType, errorEvent) =>
  globalTypedErrorEventHandlers.forEach((handler) => handler(errorType, errorEvent));

export const installGlobalHandlersOn = ({ hostWindow, nameForDebug }, cb) => {
  const uninstall = installTypedErrorEventListenersOn({
    hostWindow,
    nameForDebug,
    typedErrorEventListener: triggerGlobalHandlers,
  }, cb);
  return uninstall;
};

installGlobalHandlersOn({
  hostWindow: window,
  nameForDebug: 'BG',
});

export const installErrorReporter = ({
  toEmail = mandatory(),
  reportLangs = ['en'],
  ifToNotifyAboutTypedErrorEvent = (/* errorType, errorEvent */) => true,
} = {}) => {

  const {
    notifyAboutError,
    uninstallErrorNotifier,
  } = installErrorNotifier();

  const anotherGlobalHandler = (errorType, errorEvent) => {
    if (!ifToNotifyAboutTypedErrorEvent(errorType, errorEvent)) {
      return;
    }
    notifyAboutError({
      errorType,
      errorLikeOrMessage: errorEvent,
      clickHandler: () =>
        openErrorReporter({
          toEmail,
          reportLangs,
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
