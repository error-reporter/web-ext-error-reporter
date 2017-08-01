'use strict';

chrome.runtime.getBackgroundPage((bgWindow) =>
  bgWindow.Weer.ErrorCatchers.installListenersOn({ hostWindow: window, nameForDebug: 'PUP' }, () => {

    //console.log('WW3?', bgWindow === window);
    //throw new Error('BOOPUP');
    document.getElementById('btn').onclick = () => {

      throw new Error('FIRE!');

    };

    //throw new Error('PUPERR');

    chrome.tabs.getCurrent(() => {

      throw new Error('Chrome API callback (not caught by Weer)');

    });

  })
);

