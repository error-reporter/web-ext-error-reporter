/* eslint-disable */
import Utils from './utils';
import Versions from './versions';
import ProxySettings from './proxy-settings';
import CreateLocalStorage from './create-local-storage';

const timeouted = Utils.timeouted;
const throwIfError = Utils.throwIfError;

const getUrl = (...args) => chrome.runtime.getURL(...args);

const openAndFocus = function openAndFocus(url) {

  chrome.tabs.create(
    { url },
    (tab) => chrome.windows.update(tab.windowId, { focused: true })
  );

};

const ifPrefix = 'if-on-';
const extName = chrome.runtime.getManifest().name;
const extBuild = Versions.currentBuild;

/*
  Configs: {
    errorReportingUrl:
      type: string, template,
      example: 'https://report.example.com?title={{message}}&body={{json}}'
  }
*/
const createErrorHandlers = (Configs) => {

  const errorHandlers = {

    state: CreateLocalStorage('handlers-'),

    viewError(type = Utils.mandatory(), err) {

      const errors = err ? {[type]: err} : this.typeToError;
      const versionedError = Object.assign({}, errors, {
        version: Versions.current,
        extName,
      });
      const json = JSON.stringify(versionedError, null, 2);
      const msg = err && err.message || errors[type] && errors[type].message || 'I Found a Bug';

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
        ['no-control', 'loss of proxy settings control'],
      ]);

    },

    switch(onOffStr, eventName) {

      if (!['on', 'off'].includes(onOffStr)) {
        throw new TypeError('First argument bust be "on" or "off".');
      }
      for(
        const name of (eventName ? [eventName] : this.getErrorTypeToLabelMap().keys() )
      ) {
        this.state( ifPrefix + name, onOffStr === 'on' ? 'on' : null );
      }

    },

    isOn(eventName) {

      return this.state( ifPrefix + eventName );

    },

    ifControlled: null,
    ifControllable: null,

    isControllable(details) {

      this.ifControllable = ProxySettings.areControllableFor(details);

      if (this.ifControllable) {
        this.ifControlled = ProxySettings.areControlledFor(details);
      } else {
        this.ifControlled = false;
      }

      if (this.ifControlled) {
        chrome.browserAction.setIcon( {path: getUrl('./icons/default-64.png')} );
      } else {
        chrome.browserAction.setIcon({
          path: getUrl('./icons/default-grayscale-128.png'),
        });
      }

      return this.ifControllable;

    },

    isControlled(details) {

      this.isControllable(details);
      return this.ifControlled;

    },

    updateControlState(cb = throwIfError) {

      chrome.proxy.settings.get(
        {},
        timeouted(
          (details) => {

            this.isControllable(details);
            cb();

          }
        )
      );

    },

    typeToError: {},

    mayNotify(
      errorType, title, errOrMessage,
      {
        icon = 'default-64.png',
        context = extName + ' ' + extBuild,
        ifSticky = true,
      } = {}
    ) {

      if ( !this.isOn(errorType) ) {
        return;
      }
      this.typeToError[errorType] = errOrMessage;
      const message = errOrMessage.message || errOrMessage.toString();
      chrome.notifications.create(
        errorType,
        {
          title: title,
          message: message,
          contextMessage: context,
          requireInteraction: ifSticky,
          type: 'basic',
          iconUrl: getUrl('./icons/' + icon),
          appIconMaskUrl: getUrl('./icons/default-mask-128.png'),
          isClickable: true,
        }
      );

    },

    install() {

      chrome.runtime.onMessage.addListener((message) => {

        if (!message.error) {
          return;
        }
        const err = JSON.parse(message.error);

        this.mayNotify('ext-error', 'Extension error', err,
          {icon: 'ext-error-128.png'});

      });

      chrome.notifications.onClicked.addListener( timeouted( (notId) => {

        chrome.notifications.clear(notId);
        if(notId === 'no-control') {
          return openAndFocus(
            ProxySettings.messages.searchSettingsForAsUrl('proxy')
          );
        }
        errorHandlers.viewError(notId);

      }));

      if (!chrome.proxy) {
        return;
      }

      errorHandlers.updateControlState();

      chrome.proxy.onProxyError.addListener( timeouted( (details) => {

        if (!errorHandlers.ifControlled) {
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

      chrome.proxy.settings.onChange.addListener( timeouted( (details) => {

        const noCon = 'no-control';
        const ifWasControllable = errorHandlers.ifControllable;
        if ( !errorHandlers.isControllable(details) && ifWasControllable ) {
          errorHandlers.mayNotify(
            noCon,
            chrome.i18n.getMessage('noControl'),
            chrome.i18n.getMessage('which'),
            {icon: 'no-control-128.png', ifSticky: false}
          );
        } else {
          chrome.notifications.clear( noCon );
        }

      }));

    },
  };
  return errorHandlers;

};

export default createErrorHandlers;
