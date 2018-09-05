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
  ...absAndRel('error-event-listeners'),
  ...absAndRel('error-notifier'),
  ...absAndRel('error-reporter'),
  ...absAndRel('to-plain-object'),
  ...absAndRel('error-types'),
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
      { file: './dist/esm/utils.js', format: 'esm' },
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
    input: inSrc('error-event-listeners.js'),
    output: [
      { file: './dist/cjs/error-event-listeners.js', format: 'cjs' },
      { file: './dist/esm/error-event-listeners.js', format: 'esm' },
      {
        file: './dist/umd/error-event-listeners.js',
        format: 'umd',
        name: 'Weer.errorEventListeners',
        globals,
      },
    ],
  },
  {
    plugins,
    external,
    input: inSrc('global-error-event-handlers.js'),
    output: [
      { file: './dist/cjs/global-error-event-handlers.js', format: 'cjs' },
      { file: './dist/esm/global-error-event-handlers.js', format: 'esm' },
      {
        file: './dist/umd/global-error-event-handlers.js',
        format: 'umd',
        name: 'Weer.globalErrorEventHandlers',
        globals,
      },
    ],
  },
  {
    plugins,
    external,
    input: inSrc('error-notifier.js'),
    output: [
      { file: './dist/cjs/error-notifier.js', format: 'cjs' },
      { file: './dist/esm/error-notifier.js', format: 'esm' },
      {
        file: './dist/umd/error-notifier.js',
        format: 'umd',
        name: 'Weer.errorNotifier',
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
      { file: './dist/esm/index.js', format: 'esm' },
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
