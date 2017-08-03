'use strict';

chrome.runtime.getManifest.callsFake(function fakeFn() {

  return { version: '0.0.0.0' };

});

const catchGlobal = (errHandler) => {

  const originalOnError = window.onerror;
  expect(originalOnError).to.be.ok;
  window.onerror = (ev) => {};
  window.addEventListener('error', (errEvent) => {

    window.onerror = originalOnError;
    setTimeout(() => {
      errHandler(errEvent.error);
    }, 0);

  }, {
    capture: true,
    once: true,
  });

};
