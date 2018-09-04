import { createErrorToObject } from './private/errio';
import { mandatory } from './utils';

const toObject = createErrorToObject();

export const errorToPlainObject = (error = mandatory()) =>
  toObject(error, { stack: true, private: true });

export const errorEventToPlainObject = (errorEvent = mandatory()) => {

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
    plainObj.error = errorToPlainObject(errorEvent.error);
  } else {
    plainObj.error = errorEvent.error;
  }
  return plainObj;
};
