'use strict';


const testTarget = process.env.TEST_TARGET;
const allowedTargets = [
  'index',
  'utils',
  'error-catchers',
  'get-notifiers-singleton',
];
if (!allowedTargets.includes(testTarget)) {
  console.error(
    'Please, provide TEST_TARGET environment variable. Allowed targets:',
    allowedTargets.join(', ') + '.',
  );
  process.exit(1);
}

const getUmd = (target) => `./dist/umd/${target}.js`;

const deps = ['utils', 'index'].includes(testTarget)
  ? [/* No deps. */]
  : [
      getUmd('utils'),
  ]
;

const targetedFiles = [
  ...deps,
  getUmd(testTarget),
  `./test/unit/${testTarget}/**/*.js`,
];

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai'],


    // list of files / patterns to load in the browser
    files: [
      './node_modules/sinon/pkg/sinon.js',
      './node_modules/sinon-chrome/bundle/sinon-chrome.min.js',
      './vendor/optional-debug.js',
      './test/lib.js',
      ...targetedFiles,
    ],


    // list of files to exclude
    exclude: [
      '**/*.swp'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },

    browserDisconnectTimeout: 5000,

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
      'ChromeHeadless',
      'Firefox',
//      'ChromeCanary',
    ],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
