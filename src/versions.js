/*

# Documentation

1.  https://developer.chrome.com/extensions/manifest/version
2.  https://www.chromium.org/developers/version-numbers

*/
const versionLimit = 2 ** 16;

const versionToArray = (vStr) => [...vStr.split('.'), 0, 0, 0].slice(0, 4);

const versionToInteger = (vStr) =>
  versionToArray(vStr)
    .reverse()
    .reduce(
      (acc, value, i) =>
        acc + (parseInt(value, 10) * (versionLimit ** i)),
      0,
    );

const currentVersion = chrome.runtime.getManifest().version;

const Versions = {

  current: currentVersion,
  currentBuild: versionToArray(currentVersion).slice(-2).join('.'),

  compare: (a, b) => versionToInteger(a) - versionToInteger(b),

};

export default Versions;
