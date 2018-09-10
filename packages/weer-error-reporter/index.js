import { mandatory, assert, timeouted } from '@weer/utils';

const manifest = chrome.runtime.getManifest();

export const installErrorSubmissionHandler = (handler) =>
  chrome.runtime.onMessage.addListener(
    timeouted({
      /*
Returned value matters, see
https://developer.chrome.com/extensions/runtime#event-onMessage

> This function becomes invalid when the event listener returns,
> unless you return true from the event listener to indicate
> you wish to send a response asynchronously
      */
      returnValue: true,
      // Don't make cb async, because FireFox doesn't catch promise rejections.
      cb: (request, sender, sendResponse) => {

        if (request.action !== 'SEND_REPORT') {
          return;
        }
        try {
          const res = handler(request);
          Promise.resolve(res).then(
            (result) => sendResponse({ ok: true, result }),
            (error) => { throw error; },
          );
        } catch (error) {
          sendResponse({ error });
          // Global handlers must handle it, don't suppress this error.
          throw error;
        }
      },
    }),
  );

export const makeReport = ({
  errorType,
  serializablePayload = mandatory(),
}) => ({
  payload: serializablePayload,
  extName: manifest.name,
  version: manifest.version,
  errorType,
  userAgent: navigator.userAgent,
  platform: navigator.platform,
});

export const openErrorReporter = ({
  ifSubmissionHandlerInstalled,
  sendReportsToEmail,
  sendReportsInLanguages = ['en'],
  errorTitle = mandatory(),
  report = mandatory(),
} = {}) => {

  assert(
    !(ifSubmissionHandlerInstalled && sendReportsToEmail),
    'Either you handle submission via providing an email or you install a handler, but never both.',
  );

  assert(
    report.extName && report.version && report.payload,
    'Report must include .extName (extension name), .version and .payload!'
    + ` You supplied report: ${JSON.stringify(report, null, 2)}.`,
  );

  const json = JSON.stringify(report);
  const url = `${
    'https://error-reporter.github.io/v0/error/view/?title={{errorTitle}}&json={{json}}&reportLangs={{reportLangs}}'
      .replace('{{errorTitle}}', encodeURIComponent(errorTitle))
      .replace('{{json}}', encodeURIComponent(json))
      .replace(
        '{{reportLangs}}',
        encodeURIComponent(sendReportsInLanguages.join(',')),
      )
  }${
    sendReportsToEmail
      ? `#toEmail=${encodeURIComponent(sendReportsToEmail)}`
      : ''
  }`;

  chrome.tabs.create(
    { url },
    (tab) => chrome.windows.update(tab.windowId, { focused: true }),
  );
};
