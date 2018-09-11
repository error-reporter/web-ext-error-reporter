import Path from 'path';
import shell from 'shelljs';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonJs from 'rollup-plugin-commonjs';

const plugins = [
  // nodeResolve(),
  // commonJs(),
];

const { LERNA_ROOT_PATH } = process.env;
const PACKAGE_ROOT_PATH = process.cwd();

// eslint-disable-next-line
const PKG = require(Path.join(PACKAGE_ROOT_PATH, 'package.json'));

/*
  @weer/utils -> utils.js
  @weer/commons/error-types -> error-types.js
*/
const pkgNameToFilename = (name) => {

  if (name.startsWith('@weer')) {
    /*
      @weer/index -> index.js
      @weer/common -> common.js
      @weer/common/error-type -> error-type.js
      @weer/common/private/debug -> private/debug.js
    */
    return `./${name.replace(/^@weer\/(?:.+?\/)?(.+)$/, '$1')}.js`;
  }
  return name;
};

const external = (name) => {

  return name.startsWith('@weer');
};

const filename = pkgNameToFilename(PKG.name);
const allInOnePath = Path.join(LERNA_ROOT_PATH, 'packages', 'weer-weer');

const output = (outputFilePath) => [
  {
    file: Path.join(allInOnePath, outputFilePath),
    format: 'esm',
    paths: pkgNameToFilename,
    banner: `// Generated from package ${PKG.name} v${PKG.version}`,
  },
];

export default PKG.module
  ? [
    {
      input: PKG.module,
      output: output(filename),
      external,
      plugins,
    },
  ]
  : shell.ls('*.js', '**/*.js').map((jsFilePath) => ({
    input: Path.join(PACKAGE_ROOT_PATH, jsFilePath),
    output: output(jsFilePath),
    external,
    plugins,
  }));
