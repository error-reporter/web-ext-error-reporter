import { mandatory } from '@weer/utils';
import errorStackParser from 'error-stack-parser';
import StackTraceGps from 'stacktrace-gps';
import StackFrame from 'stackframe';
import { toObject } from './private/errio';

const privateGetSourceMappedErrorStackAsync = (
  error = mandatory(),
  gps = mandatory(),
) => {

  const stackFrames = errorStackParser.parse(error);
  return Promise.all(
    stackFrames.map(
      (sf) => gps.pinpoint(sf).catch(() => ({ ...sf, failedToMap: true })),
    ),
  );
};

export const getSourceMappedErrorEventAsync = async (
  errorEvent = mandatory(),
) => {

  // Reuse the same gps for better caching.
  const gps = new StackTraceGps();
  // eslint-disable-next-line no-param-reassign
  errorEvent.error.mappedStack = await privateGetSourceMappedErrorStackAsync(
    errorEvent.error,
    gps,
  );
  const eeMappedStack = await gps.pinpoint(new StackFrame({
    fileName: errorEvent.filename,
    lineNumber: errorEvent.lineno,
    columnNumber: errorEvent.colno,
  })).catch(() => false);
  if (eeMappedStack) {
    // eslint-disable-next-line no-param-reassign
    errorEvent.mappedStack = eeMappedStack;
  }
  return errorEvent;
};

export const getSourceMappedErrorStackAsync = (error = mandatory()) =>
  privateGetSourceMappedErrorStackAsync(error, new StackTraceGps());

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
