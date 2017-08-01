import Path from 'path';
import NodeResolve from 'rollup-plugin-node-resolve';
import CommonJs from 'rollup-plugin-commonjs';

const srcPath = Path.join('.', 'src', 'src');
const inSrc = (relPath) => Path.join(srcPath, relPath);

const plugins = [
  NodeResolve({
    jsnext: true,
    browser: true
  }),
  CommonJs({
    include: [
      './src/node_modules/**'
    ]
  })
];

const absAndRel = (filePath) => [

  // './utils'

  `.${Path.sep}${filePath}`, // `Path.join` won't work here.

  // Absolute. Required.

  Path.resolve(
    inSrc(filePath)
  )
];

const external = [
  ...absAndRel('utils'),
  '../utils',
  'debug'
];

const externalAll = [
  ...external,
  ...absAndRel('error-catchers'),
  ...absAndRel('get-notifiers-singleton')
];

const utilsFullPath =  Path.resolve(inSrc('utils'));

const globals = {
  [utilsFullPath]: 'Weer.Utils'
};

export default [
  {
    plugins,
    entry: inSrc('utils.js'),
    targets: [
      { dest: './dist/cjs/utils.js', format: 'cjs' },
      { dest: './dist/esm/utils.js', format: 'es' },
      { dest: './dist/umd/utils.js', format: 'umd',
        moduleName: 'Weer.Utils',
        globals
      }
    ]
  },
  {
    plugins,
    external,
    entry: inSrc('error-catchers.js'),
    targets: [
      { dest: './dist/cjs/error-catchers.js', format: 'cjs' },
      { dest: './dist/esm/error-catchers.js', format: 'es' },
      { dest: './dist/umd/error-catchers.js', format: 'umd',
        moduleName: 'Weer.ErrorCatchers',
        globals
      }
    ]
  },
  {
    plugins,
    external,
    entry: inSrc('get-notifiers-singleton.js'),
    targets: [
      { dest: './dist/cjs/get-notifiers-singleton.js', format: 'cjs' },
      { dest: './dist/esm/get-notifiers-singleton.js', format: 'es' },
      { dest: './dist/umd/get-notifiers-singleton.js', format: 'umd',
        moduleName: 'Weer.GetNotifiersSingleton',
        globals
      }
    ]
  },
  {
    plugins,
    external: externalAll,
    entry: inSrc('index.js'),
    targets: [
      { dest: './dist/cjs/index.js', format: 'cjs' },
      { dest: './dist/esm/index.js', format: 'es' }
    ]
  },
  {
    plugins,
    entry: inSrc('index.js'),
    targets: [
      { dest: './dist/umd/index.js', format: 'umd',
        moduleName: 'Weer',
        globals
      }
    ]
  }
];
