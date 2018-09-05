import { installTypedErrorEventListenersOn } from './error-event-listeners';
import { mandatory } from './utils';

/*
 In this file we will be using term handler instead of listener.
 Listener term is already used in error-event-listners module.
 I hope it will make it easier to distinct methods of one API from another.
*/

let globalTypedErrorEventHandlers = [];

export const addGlobalHandler = (handler = mandatory()) => {

  globalTypedErrorEventHandlers.push(handler);
  const removeHandler = () => {

    globalTypedErrorEventHandlers = globalTypedErrorEventHandlers.filter(
      (otherHandler) => otherHandler !== handler,
    );
  };
  return removeHandler;
};

const triggerGlobalHandlers = (
  errorType = mandatory(),
  errorEvent = mandatory(),
) =>
  globalTypedErrorEventHandlers.forEach((handler) => handler(errorType, errorEvent));

export const installGlobalHandlersOn = function installGlobalHandlersOn(
  { hostWindow, nameForDebug },
  cb,
) {
  const uninstallGlobalHandlers = installTypedErrorEventListenersOn(
    {
      hostWindow,
      nameForDebug,
      typedErrorEventListener: triggerGlobalHandlers,
    },
    // cb is not invoked immediately, but timeouted,
    // that's why uninstallGlobalHandlers will be defined.
    () => cb && cb({ uninstallGlobalHandlers }),
  );
  return uninstallGlobalHandlers;
};

export const installGlobalHandlersOnAsync = function installGlobalHandlersOnAsync(opts) {
  return new Promise((resolve) =>
    installGlobalHandlersOn(
      opts,
      resolve,
    ));
};
