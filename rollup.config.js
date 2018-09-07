import Path from 'path';
import shell from 'shelljs';
const { LERNA_PACKAGE_NAME, LERNA_ROOT_PATH } = process.env;
const PACKAGE_ROOT_PATH = process.cwd();

/*
console.log('PKG ROOT PATH', PACKAGE_ROOT_PATH);
console.log('LERNA ROOT PATH', LERNA_ROOT_PATH);
console.log('LERNA PKG NAME', LERNA_PACKAGE_NAME);
*/

const PKG = require(Path.join(PACKAGE_ROOT_PATH, 'package.json'));

/*
  @weer/utils -> utils.js
  @weer/commons/error-types -> error-types.js
**/
const pkgNameToFilename = (name) => {

  if (name.startsWith('@weer')) {
    /*
      @weer/index -> index.js
      @weer/common -> common.js
      @weer/common/error-type -> error-type.js
      @weer/common/private/debug -> private/debug.js
    **/
    return name.replace(/^@weer\/(?:.+?\/)?(.+)$/, '$1') + '.js';
  }
  return name;
}

const filename = pkgNameToFilename(PKG.name);
const allInOnePath = Path.join(LERNA_ROOT_PATH, 'packages', 'weer-weer');

const output = (outputFilePath) => [
  {
    file: Path.join(allInOnePath, outputFilePath),
    format: 'esm',
    paths: (pkgName) => {

      console.log('PATH CHANGE FOR', pkgName);
      return `./${pkgNameToFilename(pkgName)}`;
    },
    banner: `// Generated from package ${PKG.name} v${PKG.version}`,
  },
];

export default PKG.module ?
[
  {
    input: PKG.module,
    output: output(filename),
  },
] :
shell.ls('*.js', '**/*.js').map((jsFilePath) => ({
  input: Path.join(PACKAGE_ROOT_PATH, jsFilePath),
  output: output(jsFilePath),
}));
