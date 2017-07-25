const ProxySettings = {

  /*
  * Possible values for levelOfControl:
  *
  * 1. "not_controllable"
  * 2. "controlled_by_other_extensions"
  * 3. "controllable_by_this_extension"
  * 4. "controlled_by_this_extension"
  *
  * See: https://developer.chrome.com/extensions/proxy
  * */

  areControllableFor(details) {

    return details.levelOfControl.endsWith('this_extension');

  },

  areControlledFor(details) {

    return details.levelOfControl.startsWith('controlled_by_this');

  },

  messages: {

    searchSettingsForAsUrl(niddle) {

      //  `niddle` may be: 'proxy'.
      const localedNiddle = chrome.i18n.getMessage(niddle) || niddle;
      return `chrome://settings/search#${localedNiddle}`;

    },

    whichExtensionAsHtml() {

      // Example: "Other extension controls proxy! <a...>Which?</a>"
      const otherMsg = chrome.i18n.getMessage('errreporter_noControl') || 'Other extension controls proxy!';
      return `
        ${otherMsg}
        <a href="${this.searchSettingsForAsUrl('proxy')}">
          ${chrome.i18n.getMessage('errreporter_which') || 'Which?'}
        </a>`;

    },

  },

};

export default ProxySettings;
