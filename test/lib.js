'use strict';

if (window.debug) {
  window.debug.enable('weer:*');
}

chrome.runtime.getManifest.callsFake(() => ({ version: '0.0.0.0' }));

window.catchGlobal = (errHandler) => {

  const originalOnError = window.onerror;
  expect(originalOnError).to.be.ok;
  window.onerror = () => {};
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
