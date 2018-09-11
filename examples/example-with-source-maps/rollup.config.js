import { terser } from 'rollup-plugin-terser';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonJs from 'rollup-plugin-commonjs';

const plugins = [
  nodeResolve(),
  commonJs(),
  terser(),
];

const popupIndex = './dist/pages/popup/index.js';

export default [
  {
    plugins,
    input: './src/index.js',
    output: {
      file: './dist/index.js',
      format: 'esm',
      sourcemap: true,
    },
  },
  {
    plugins,
    input: popupIndex,
    output: {
      file: popupIndex,
      format: 'esm',
      sourcemap: true,
    },
  },
  {
    plugins,
    input: './node_modules/@weer/weer/expose-to-window.js',
    output: {
      file: './dist/vendor/weer/expose-to-window.js',
      format: 'esm',
      sourcemap: true,
    },
  },
];
