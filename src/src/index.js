import Utils from './utils';
import ErrorCatchers from './error-catchers';
import GetNotifiersSingleton from './get-notifiers-singleton';

const Install = (configs) => {

  const { handleErrorMessage } = GetNotifiersSingleton(configs);
  ErrorCatchers.installListenersOn({ handleErrorMessage });

};

export default {
  Utils,
  ErrorCatchers,
  GetNotifiersSingleton,
  Install,
};

