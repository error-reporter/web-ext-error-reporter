import { assert, mandatory, timeouted } from './utils';
import * as ErrorTypes from './error-types';

const manifest = chrome.runtime.getManifest();

/*
  Loads icon by url or generates icon from text when offline.
  Returns blob url.
*/
const loadIconAsBlobUrlAsync = (iconUrl = mandatory()) => {

  const img = new Image();
  img.crossOrigin = 'anonymous';

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  return new Promise((resolve) => {

    const dumpCanvas = () =>
      canvas.toBlob(
        (blob) => resolve(URL.createObjectURL(blob)),
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

// eslint-disable-next-line
export const installErrorNotifier = ({
  extErrorIconUrl = 'https://error-reporter.github.io/v0/icons/ext-error-128.png',
  pacErrorIconUrl = 'https://error-reporter.github.io/v0/icons/pac-error-128.png',
  maskIconUrl = false,
} = {}) => {

  const errorTypeToIconUrl = {
    [ErrorTypes.EXT_ERROR]: extErrorIconUrl,
    [ErrorTypes.PAC_ERROR]: pacErrorIconUrl,
  };

  const notyIdToClickHandler = {};
  const notyClickedListener = timeouted(
    (notyId) =>
      (notyIdToClickHandler[notyId] || (() => {}))(),
  );
  chrome.notifications.onClicked.addListener(notyClickedListener);

  const notyClosedListener = timeouted(
    (notyId) => { delete notyIdToClickHandler[notyId]; },
  );
  chrome.notifications.onClosed.addListener(notyClosedListener);

  const notifyWithHandler = ({
    notyOptions = mandatory(),
    clickHandler = mandatory(),
  }) => chrome.notifications.create(
    notyOptions,
    (notyId) => {
      notyIdToClickHandler[notyId] = clickHandler;
    },
  );

  const notifyAboutError = async ({
    clickHandler = mandatory(),
    // ErrorEvent (EXT_ERROR, PAC_ERROR), Error, { message: '...' } or String
    errorEventLike = mandatory(),
    errorType = ErrorTypes.EXT_ERROR,
    notyTitle = 'Extension error',
    context = `${manifest.name} ${manifest.version}`,
    ifSticky = true,
  }) => {

    const allowedTypes = Object.values(ErrorTypes);
    assert(
      allowedTypes.includes(errorType),
      `Type ${errorType} is among allowed types which are ${allowedTypes}.`,
    );

    const errMessage = (
      errorType === ErrorTypes.PAC_ERROR
        ? errorEventLike.error
        : errorEventLike.message
    ) || errorEventLike.toString();
    const iconUrl = await loadIconAsBlobUrlAsync(
      errorTypeToIconUrl[errorType],
    );

    const notyOptions = {
      title: notyTitle,
      message: errMessage,
      contextMessage: context,
      type: 'basic',
      iconUrl,
      isClickable: true,
    };
    if (maskIconUrl) {
      const url = await loadIconAsBlobUrlAsync(maskIconUrl);
      Object.assign(notyOptions, {
        appIconMaskUrl: url,
      });
    }
    if (!/Firefox/.test(navigator.userAgent)) {
      Object.assign(notyOptions, {
        requireInteraction: ifSticky, // Does it have any effect?
      });
    }

    notifyWithHandler({
      notyOptions,
      clickHandler,
    });
  };

  let ifUninstalled = false;
  return {
    notifyAboutError: (...args) => {
      if (ifUninstalled) {
        throw new Error(
          'Error Notifier of this function was uninstalled.',
        );
      }
      notifyAboutError(...args);
    },
    uninstallErrorNotifier: () => {

      chrome.notifications.onClicked.removeListener(notyClickedListener);
      chrome.notifications.onClosed.removeListener(notyClosedListener);
      ifUninstalled = true;
    },
  };
};
