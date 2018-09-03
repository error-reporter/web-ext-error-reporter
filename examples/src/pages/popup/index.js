'use strict'; // eslint-disable-line

chrome.runtime.getBackgroundPage(
  (bgWindow) => bgWindow.Weer.ErrorCatchers.installListenersOn(
    { hostWindow: window, nameForDebug: 'PUP' },
    () => {

      document.getElementById('btn').onclick = () => {

        throw new Error('ONCLK!');

      };

      throw new Error('PUPERR THREW THIS');
    },
  ),
);
