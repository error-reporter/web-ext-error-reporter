'use strict';

chrome.runtime.getManifest.callsFake(function fakeFn() {

  return { version: '0.0.0.0' };

});
