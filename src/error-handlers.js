import Utils from './utils';
import Versions from './versions';
import ProxySettings from './proxy-settings';
import CreateLocalStorage from './create-local-storage';

/*
  Loads icon by url or generates icon from text when offline.
  Returns blob url.
*/
const loadIconAsBlobUrlAsync = function loadIconAsBlobUrlAsync(iconUrl = Utils.mandatory()) {

  const img = new Image();

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  return new Promise((resolve) => {

    const dumpCanvas = (cb = Utils.mandatory()) =>
      canvas.toBlob((blob) =>
        resolve(URL.createObjectURL(blob))
      );

    img.onload = () => {

      ctx.drawImage(img, 0, 0, size, size);
      dumpCanvas();

    };
    img.onerror = () => {

      // I did my best centering it.
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, size, size);
      ctx.font = '50px arial';
      ctx.fillStyle = 'white';

      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      ctx.fillText('error', 64, 64, 128);
      dumpCanvas();

    }
    img.src = iconUrl;

  });

}


const openAndFocus = function openAndFocus(url) {

  chrome.tabs.create(
    { url },
    (tab) => chrome.windows.update(tab.windowId, { focused: true }),
  );

};

const notyPrefix = 'reporter-';
const ifPrefix = 'if-on-';
const extName = chrome.runtime.getManifest().name;
const extBuild = Versions.currentBuild;

/*
  Configs: {
    errorReportingUrl:
      'https://report.example.com?title={{message}}&body={{json}}',
    icons: {
      'ext-error': 'https://example.com/icons/ext-err-128.png',
      'pac-error': 'https://example.com/icons/pac-err-128.png',
      'mask': 'https://example.com/icons/mask-128.png',
    }
  }
*/
const createErrorHandlers = ({
    errorReportingUrl = 'https://rebrand.ly/view-error/title={{title}}&json={{json}}',
    // Icons:
    extErrorIconUrl = 'https://rebrand.ly/ext-error',
    pacErrorIconUrl = 'https://rebrand.ly/pac-error',
    maskIconUrl = false,
  } = {}) => {

  const errorTypeToIconUrl = {
    'ext-error': extErrorIconUrl,
    'pac-error': pacErrorIconUrl,
  }

  const errorHandlers = {

    state: CreateLocalStorage('error-handlers-'),

    viewError(typeMaybe) {

      const errors = typeMaybe
        ? { [typeMaybe]: this.typeToPlainError[typeMaybe] }
        : this.typeToPlainError;
      const versionedErrors = Object.assign({}, errors, {
        version: Versions.current,
        extName,
      });
      const json = JSON.stringify(versionedErrors, null, 2);
      const msg =
        errors[typeMaybe] && errors[typeMaybe].message
        || 'I Found a Bug';

      openAndFocus(
        Configs.errorReportingUrl
          .replace('{{message}}', encodeURIComponent(msg))
          .replace('{{json}}', encodeURIComponent(json)),
      );

    },

    getErrorTypeToLabelMap() {

      return new Map([
        ['pac-error', 'PAC script error'],
        ['ext-error', 'extension error'],
      ]);

    },

    switch(onOffStr = Utils.mandatory(), eventName) {

      if (!['on', 'off'].includes(onOffStr)) {
        throw new TypeError('First argument bust be "on" or "off".');
      }
      for(
        const name of (eventName ? [eventName] : this.getErrorTypeToLabelMap().keys() )
      ) {
        this.state( ifPrefix + name, onOffStr === 'on' ? 'on' : 'off' );
      }

    },

    isOn(eventName) {

      // 'On' by default.
      return this.state( ifPrefix + eventName ) !== 'off';

    },

    typeToPlainError: {},

    async mayNotify(
      errorType,
      title,
      plainErrorOrMessage,
      {
        icon = Utils.mandatory,
        context = `${extName} ${extBuild}`,
        ifSticky = true,
      }
    ) {

      if ( !this.isOn(errorType) ) {
        return;
      }
      this.typeToPlainError[errorType] = plainErrorOrMessage;
      const message = plainErrorOrMessage.message || plainErrorOrMessage.toString();

      const iconUrl = await loadIconAsBlobUrlAsync(
        errorTypeToIconUrl[errorType]
      );
      const opts = {
        title,
        message,
        contextMessage: context,
        requireInteraction: ifSticky,
        type: 'basic',
        iconUrl,
        isClickable: true,
      };
      if (maskIconUrl) {
        const url = await loadIconAsBlobUrlAsync(maskIconUrl);
        Object.assign(opts, {
          appIconMaskUrl: url,
        });
      }

      chrome.notifications.create(
        `${notyPrefix}${errorType}`,
        opts
      );

    },

    install() {

      chrome.runtime.onMessage.addListener((message) => {

        if (message.to !== 'error-reporter') {
          return;
        }
        const err = message.errorData;

        this.mayNotify('ext-error', 'Extension error', err,
          {icon: 'ext-error-128.png'});

      });

      chrome.notifications.onClicked.addListener( Utils.timeouted( (notyId) => {

        if (!notyId.startsWith(notyPrefix)) {
          return;
        }

        chrome.notifications.clear(notyId);
        const errorType = notyId.substr(notyPrefix);
        errorHandlers.viewError(errorType);

      }));

      if (!chrome.proxy) {
        return;
      }

      chrome.proxy.onProxyError.addListener( Utils.timeouted( async(details) => {

        const ifControlled = await ProxySettings.areControlledAsync();
        if (!ifControlled) {
          return;
        }
        /*
          Example:
            details: "line: 7: Uncaught Error: This is error, man.",
            error: "net::ERR_PAC_SCRIPT_FAILED",
            fatal: false,
        */
        const ifConFail = details.error === 'net::ERR_PROXY_CONNECTION_FAILED';
        if (ifConFail) {
          // Happens if you return neither prixies nor "DIRECT".
          // Ignore it.
          return;
        }
        console.warn('PAC ERROR', details);
        // TOOD: add "view pac script at this line" button.
        errorHandlers.mayNotify('pac-error', 'PAC Error!',
          details.error + '\n' + details.details,
          {icon: 'pac-error-128.png'}
        );

      }));

    },
  };
  return errorHandlers;

};

export default createErrorHandlers;
