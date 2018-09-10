import { terser } from "rollup-plugin-terser";

const popupIndex = './dist/pages/popup/index.js';

const plugins = [terser()];

export default [
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
