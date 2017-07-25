/* eslint-disable */
let cache = [];
const errorJsonReplacer = function errorJsonReplacer(key, value) {

  if (typeof value === 'object' && value !== null) {
    if (cache.indexOf(value) !== -1) {
      return;
    }
    cache.push(value);
  }

  // fooWindow.ErrorEvent !== barWindow.ErrorEvent
  if (!(value && value.constructor
    && ['Error', 'Event'].some(
      (suff) => value.constructor.name.endsWith(suff),
    )
  )) {
    return value;
  }
  const alt = {};

  Object.getOwnPropertyNames(value).forEach((prop) => {

    alt[prop] = value[prop];

  }, value);

  for(const prop in value) {
    if (/^[A-Z]/.test(prop)) {
      // MOUSEMOVE, CLICK, KEYUP, NONE, etc.
      continue;
    }
    alt[prop] = value[prop];
  }

  if (value.constructor.name === 'ErrorEvent') {
    for(const circularProp of
      [  // First line are circular props.
        'target', 'srcElement', 'path', 'currentTarget',
        'bubbles', 'cancelBubble', 'cancelable', 'composed',
        'defaultPrevented', 'eventPhase', 'isTrusted', 'returnValue',
        'timeStamp']) {
      delete alt[circularProp];
    }
  }

  if (value.name) {
    alt.name = value.name;
  }

  return alt;

};

export default function packError(error) {

  const json = JSON.stringify(error, errorJsonReplacer, 2);
  cache = []; // GC
  return json;

};
