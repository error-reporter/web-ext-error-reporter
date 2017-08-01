import NodeResolve from 'rollup-plugin-node-resolve';

const plugins = [
  NodeResolve({
    jsnext: true,
    browser: true
  })
];

export default [
  {
    plugins,
    entry: './src/esm-for-bundlers/index.js',
    targets: [
      { dest: './dist/index.js', format: 'umd',
        moduleName: 'Weer',
      }
    ]
  }
];
