'use strict';

module.exports = {
  parser: 'babel-eslint',
  env: {
    browser: true,
    webextensions: true,
  },
  globals: {
    chrome: true,
  },
  extends: [
//    'plugin:flowtype/recommended',
    'eslint:recommended',
    'airbnb',
  ],
  plugins: [
//    'flowtype',
  ],
  rules: {
    'arrow-parens': ['error', 'always'], // (arg) => thingy
    'padded-blocks': 'off', // (arg) => {\n\n_body_\n\n}
    'no-plusplus': 'off',
    'consistent-return': 'off',
    'implicit-arrow-linebreak': 'off',
  },
};
