/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');
const intern = require('intern').default;
const args = require('yargs').argv;
const firefoxProfile = require('./tools/firefox_profile');

// Tests
const testsMain = require('./functional');
const testsCircleCi = require('./functional_circle');
const testsPairing = require('./functional_pairing');
const testsServer = require('./tests_server');
const testsServerResources = require('./tests_server_resources');

const fxaAuthRoot = args.fxaAuthRoot || 'http://127.0.0.1:9000/v1';
const fxaContentRoot = args.fxaContentRoot || 'http://127.0.0.1:3030/';
const fxaOAuthRoot = args.fxaOAuthRoot || 'http://127.0.0.1:9010';
const fxaProfileRoot = args.fxaProfileRoot || 'http://127.0.0.1:1111';
const fxaTokenRoot = args.fxaTokenRoot || 'http://127.0.0.1:5000/token';
const fxaEmailRoot = args.fxaEmailRoot || 'http://127.0.0.1:9001';
const fxaOAuthApp = args.fxaOAuthApp || 'http://127.0.0.1:8080/';
const fxaUntrustedOauthApp =
  args.fxaUntrustedOauthApp || 'http://127.0.0.1:10139/';
const fxaPaymentsRoot = args.fxaPaymentsRoot || 'http://127.0.0.1:3031/';

// "fxaProduction" is a little overloaded in how it is used in the tests.
// Sometimes it means real "stage" or real production configuration, but
// sometimes it also means fxa-dev style boxes like "latest". Configuration
// parameter "fxaDevBox" can be used as a crude way to distinguish between
// two.
const fxaProduction = !!args.fxaProduction;
const fxaDevBox = !!args.fxaDevBox;

const fxaToken = args.fxaToken || 'http://';
const asyncTimeout = parseInt(args.asyncTimeout || 5000, 10);

// On Circle, we bail after the first failure.
// args.bailAfterFirstFailure comes in as a string.
const bailAfterFirstFailure = args.bailAfterFirstFailure === 'true';

const testProductId = '123doneProProduct';

// Intern specific options are here: https://theintern.io/docs.html#Intern/4/docs/docs%2Fconfiguration.md/properties
const config = {
  asyncTimeout: asyncTimeout,
  bail: bailAfterFirstFailure,
  defaultTimeout: 45000, // 30 seconds just isn't long enough for some tests.
  environments: {
    browserName: 'firefox',
  },
  filterErrorStack: true,
  functionalSuites: testsMain,

  fxaAuthRoot: fxaAuthRoot,
  fxaContentRoot: fxaContentRoot,
  fxaDevBox: fxaDevBox,
  fxaEmailRoot: fxaEmailRoot,
  fxaOAuthApp: fxaOAuthApp,
  fxaOAuthRoot: fxaOAuthRoot,
  fxaProduction: fxaProduction,
  fxaProfileRoot: fxaProfileRoot,
  fxaToken: fxaToken,
  fxaTokenRoot: fxaTokenRoot,
  fxaUntrustedOauthApp: fxaUntrustedOauthApp,
  fxaPaymentsRoot,

  pageLoadTimeout: 20000,
  reporters: 'runner',
  serverPort: 9090,
  serverUrl: 'http://127.0.0.1:9090',
  socketPort: 9077,
  tunnelOptions: {
    drivers: [
      {
        name: 'firefox',
        version: '0.26.0',
      },
    ],
  },

  testProductId,
};

if (args.grep) {
  config.grep = new RegExp(args.grep, 'i');
}

if (args.suites) {
  switch (args.suites) {
    case 'pairing':
      config.functionalSuites = testsPairing;
      config.isTestingPairing = true;
      break;
    case 'all':
      config.functionalSuites = testsMain;
      break;
    case 'circle':
      config.functionalSuites = testsCircleCi;
      console.log('Running tests:', config.functionalSuites);
      break;
    case 'server':
    case 'server-resources':
      config.functionalSuites = [];
      config.node = {
        suites: testsServer,
      };
      config.tunnelOptions = {};
      config.environments = {
        browserName: 'node',
      };
      config.reporters = 'pretty';
      if (args.suites === 'server-resources') {
        config.node.suites = testsServerResources;
      }
      break;
  }
}

if (args.useTeamCityReporter) {
  config.reporters = 'teamcity';
}

if (args.unit) {
  config.functionalSuites.unshift('tests/functional/mocha.js');
}

config.capabilities = {};
config.capabilities['moz:firefoxOptions'] = {};
// to create a profile, give it the `config` option.
config.capabilities['moz:firefoxOptions'].profile = firefoxProfile(config); //eslint-disable-line camelcase

// custom Firefox binary location, if specified then the default is ignored.
// ref: https://code.google.com/p/selenium/wiki/DesiredCapabilities#WebDriver
if (args.firefoxBinary) {
  config.capabilities['moz:firefoxOptions'].binary = args.firefoxBinary; //eslint-disable-line camelcase
}

const failed = [];

intern.on('testEnd', test => {
  if (test.error) {
    failed.push(test);
  }
});

intern.on('afterRun', () => {
  if (failed.length) {
    fs.writeFileSync('rerun.txt', failed.map(f => f.name).join('|'));
  }
});

intern.configure(config);
intern.run().catch(e => {
  // This might not throw, BUG filed: https://github.com/theintern/intern/issues/868
  console.log(e);
  process.exit(1);
});
