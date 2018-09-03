import Utils from './utils';
import ErrorCatchers from './error-catchers';
import GetNotifiersSingleton from './get-notifiers-singleton';

const install = (configs) => {

  const { handleErrorMessage } = GetNotifiersSingleton(configs);
  const uninstall = ErrorCatchers.installListenersOn({ handleErrorMessage });
  return uninstall;

};

export default {
  Utils,
  ErrorCatchers,
  GetNotifiersSingleton,
  install,
};
