import { mandatory, assert } from './utils';

const manifest = chrome.runtime.getManifest();

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

// eslint-disable-next-line
export const openErrorReporter = ({
  toEmail = mandatory(),
  reportLangs = mandatory(),
  errorTitle = mandatory(),
  report = mandatory(),
} = {}) => {

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
      .replace('{{reportLangs}}', encodeURIComponent(reportLangs.join(',')))
  }#toEmail=${encodeURIComponent(toEmail)}`;

  chrome.tabs.create(
    { url },
    (tab) => chrome.windows.update(tab.windowId, { focused: true }),
  );
};
