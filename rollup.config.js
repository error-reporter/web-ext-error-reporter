import Path from 'path';
import NodeResolve from 'rollup-plugin-node-resolve';
import CommonJs from 'rollup-plugin-commonjs';

const srcPath = Path.join('.', 'src', 'src');
const inSrc = (relPath) => Path.join(srcPath, relPath);

const plugins = [
  NodeResolve({
    browser: true,
  }),
  CommonJs({
    include: [
      './src/node_modules/**',
    ],
  }),
];

const absAndRel = (filePath) => [

  // './utils'

  `.${Path.sep}${filePath}`, // `Path.join` won't work here.

  // Absolute. Required.

  Path.resolve(
    inSrc(filePath),
  ),
];

const external = [
  ...absAndRel('utils'),
  '../utils',
  'debug',
];

const externalAll = [
  ...external,
  ...absAndRel('error-catchers'),
  ...absAndRel('get-notifiers-singleton'),
];

const utilsFullPath = Path.resolve(inSrc('utils'));

const globals = {
  [utilsFullPath]: 'Weer.Utils',
};

export default [
  {
    plugins,
    input: inSrc('utils.js'),
    output: [
      { file: './dist/cjs/utils.js', format: 'cjs' },
      { file: './dist/esm/utils.js', format: 'es' },
      {
        file: './dist/umd/utils.js',
        format: 'umd',
        name: 'Weer.Utils',
        globals,
      },
    ],
  },
  {
    plugins,
    external,
    input: inSrc('error-catchers.js'),
    output: [
      { file: './dist/cjs/error-catchers.js', format: 'cjs' },
      { file: './dist/esm/error-catchers.js', format: 'es' },
      {
        file: './dist/umd/error-catchers.js',
        format: 'umd',
        name: 'Weer.ErrorCatchers',
        globals,
      },
    ],
  },
  {
    plugins,
    external,
    input: inSrc('get-notifiers-singleton.js'),
    output: [
      { file: './dist/cjs/get-notifiers-singleton.js', format: 'cjs' },
      { file: './dist/esm/get-notifiers-singleton.js', format: 'es' },
      {
        file: './dist/umd/get-notifiers-singleton.js',
        format: 'umd',
        name: 'Weer.GetNotifiersSingleton',
        globals,
      },
    ],
  },
  {
    plugins,
    external: externalAll,
    input: inSrc('index.js'),
    output: [
      { file: './dist/cjs/index.js', format: 'cjs' },
      { file: './dist/esm/index.js', format: 'es' },
    ],
  },
  {
    plugins,
    input: inSrc('index.js'),
    output: [
      {
        file: './dist/umd/index.js',
        format: 'umd',
        name: 'Weer',
        globals,
      },
    ],
  },
];
