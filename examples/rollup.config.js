import NodeResolve from 'rollup-plugin-node-resolve';

const plugins = [
  NodeResolve({
    jsnext: true,
    browser: true,
  }),
];

export default [
  {
    plugins,
    input: './src/esm-for-bundlers/index.js',
    output: [
      {
        file: './dist/index.js',
        format: 'umd',
        name: 'Weer',
      },
    ],
  },
];
