'use strict';

module.exports = {
  parserOptions: {
    sourceType: 'script',
  },
  env: {
    mocha: true,
  },
  globals: {
    assert: true,
    expect: true,
    sinon: true,
    Weer: true,
    // Helper functions:
    catchGlobal: true,
  },
  rules: {
    strict: ['error', 'global'],
    'no-unused-expressions': 'off', // Allow: expect(...).to.be.undefined
  },
};
