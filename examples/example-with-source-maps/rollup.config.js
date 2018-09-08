import { terser } from "rollup-plugin-terser";

const popupIndex = './dist/pages/popup/index.js';

export default [
  {
    plugins: [terser()],
    input: popupIndex,
    output: {
      file: popupIndex,
      format: 'umd',
      sourcemap: true,
    },
  },
];
