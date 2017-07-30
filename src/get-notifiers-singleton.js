import Utils from './utils';
import Versions from './private/versions';
import ProxySettings from './private/proxy-settings';
import CreateLocalStorage from './private/create-local-storage';
import Debug from './private/debug';

const debug = Debug('weer:notifier');

/*
  Loads icon by url or generates icon from text when offline.
  Returns blob url.
*/
const loadIconAsBlobUrlAsync = function loadIconAsBlobUrlAsync(iconUrl = Utils.mandatory()) {

  const img = new Image();
  img.crossOrigin = 'anonymous';

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  return new Promise((resolve) => {

    const dumpCanvas = () =>
      canvas.toBlob((blob) =>
        resolve(URL.createObjectURL(blob)),
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

      const half = size / 2;
      ctx.fillText('error', half, half, size);
      dumpCanvas();

    };
    img.src = iconUrl;

  });

};

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
const CreateErrorNotifiers = (
  {
    errorReportingUrl = 'https://rebrand.ly/view-error/?title={{message}}&json={{json}}',
    // Icons:
    extErrorIconUrl = 'https://rebrand.ly/ext-error',
    pacErrorIconUrl = 'https://rebrand.ly/pac-error',
    maskIconUrl = false,
  } = {}) => {

  const errorTypeToIconUrl = {
    'ext-error': extErrorIconUrl,
    'pac-error': pacErrorIconUrl,
  };

  const errorNotifiers = {

    state: CreateLocalStorage('error-handlers-'),
    typeToPlainError: {},

    viewError(typeMaybe) {

      const errors = typeMaybe
        ? { [typeMaybe]: this.typeToPlainError[typeMaybe] }
        : this.typeToPlainError;
      console.log('TYPE', typeMaybe);
      console.log('ERRS', errors);
      const versionedErrors = Object.assign({}, errors, {
        version: Versions.current,
        extName,
      });
      const json = JSON.stringify(versionedErrors, null, 2);
      const msg =
        (errors[typeMaybe] && errors[typeMaybe].message)
        || 'I Found a Bug';

      openAndFocus(
        errorReportingUrl
          .replace('{{message}}', encodeURIComponent(msg))
          .replace('{{json}}', encodeURIComponent(json)),
      );

    },

    isOn(eventName) {

      // 'On' by default.
      return this.state(ifPrefix + eventName) !== 'off';

    },

    async mayNotify(
      errorType,
      title,
      plainErrorOrMessage,
      {
        context = `${extName} ${extBuild}`,
        ifSticky = true,
      } = {},
    ) {

      if (!this.isOn(errorType)) {
        return;
      }
      this.typeToPlainError[errorType] = plainErrorOrMessage;
      const message = plainErrorOrMessage.message || plainErrorOrMessage.toString();

      const iconUrl = await loadIconAsBlobUrlAsync(
        errorTypeToIconUrl[errorType],
      );
      const opts = {
        title,
        message,
        contextMessage: context,
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
      if (!/Firefox/.test(navigator.userAgent)) {
        Object.assign(opts, {
          requireInteraction: ifSticky,
        });
      }

      chrome.notifications.create(
        `${notyPrefix}${errorType}`,
        opts,
      );

    },

    install() {

      /*
        You can't send message from bg to itself, call this function
        instead when caught error in BG window.
        See: https://stackoverflow.com/questions/17899769
      */
      const handleErrorMessage = (message) => {

        const err = message.errorData;
        this.mayNotify('ext-error', 'Extension error', err);

      };

      chrome.runtime.onMessage.addListener((message) => {

        debug('Received:', message);
        if (message.to !== 'error-reporter') {
          return;
        }
        handleErrorMessage(message);

      });

      chrome.notifications.onClicked.addListener(Utils.timeouted((notyId) => {

        if (!notyId.startsWith(notyPrefix)) {
          return;
        }

        chrome.notifications.clear(notyId);
        const errorType = notyId.substr(notyPrefix.length);
        errorNotifiers.viewError(errorType);

      }));

      if (chrome.proxy) {
        chrome.proxy.onProxyError.addListener(Utils.timeouted(async (details) => {

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
          // TOOD: add "view pac script at this line" button.
          errorNotifiers.mayNotify('pac-error', 'PAC Error!',
            `${details.error}\n${details.details}`,
          );

        }));
      }

      return handleErrorMessage;

    },
  };
  return errorNotifiers;

};

let singleton = false;

export default function getNotifiersSingleton(configs) {

  if (singleton) {
    return singleton;
  }
  const notifiers = CreateErrorNotifiers(configs);
  const handleErrorMessage = notifiers.install();

  singleton = {
    // Public API.

    handleErrorMessage,

    getErrorTypeToLabelMap() {

      return new Map([
        ['pac-error', 'PAC script error'],
        ['ext-error', 'extension error'],
      ]);

    },

    switch(onOffStr = Utils.mandatory(), eventName) {

      Utils.assert(
        ['on', 'off'].includes(onOffStr),
        'First argument bust be "on" or "off".',
      );
      const eventNames = eventName
        ? [eventName]
        : this.getErrorTypeToLabelMap().keys();
      eventNames.forEach((name) =>
        notifiers.state(ifPrefix + name, onOffStr === 'on' ? 'on' : 'off'),
      );

    },

    isOn(eventName) {

      return notifiers.isOn(eventName);

    }
  };
  return singleton;

};
