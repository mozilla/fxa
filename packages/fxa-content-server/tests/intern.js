/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const intern = require('intern').default;
const args = require('yargs').argv;
const firefoxProfile = require('./tools/firefox_profile');

// Tests
const testsServer = require('./tests_server');
const testsServerResources = require('./tests_server_resources');

const fxaAuthRoot = args.fxaAuthRoot || 'http://localhost:9000/v1';
const fxaContentRoot = args.fxaContentRoot || 'http://localhost:3030/';
const fxaOAuthRoot = args.fxaOAuthRoot || 'http://localhost:9000';
const fxaProfileRoot = args.fxaProfileRoot || 'http://localhost:1111';
const fxaTokenRoot = args.fxaTokenRoot || 'http://localhost:8000/token';
const fxaEmailRoot = args.fxaEmailRoot || 'http://localhost:9001';
const fxaOAuthApp = args.fxaOAuthApp || 'http://localhost:8080/';
const fxaUntrustedOauthApp =
  args.fxaUntrustedOauthApp || 'http://localhost:10139/';
const fxaPaymentsRoot = args.fxaPaymentsRoot || 'http://localhost:3031/';
const output = args.output || 'test-results.xml';
const fxaSettingsV2Root = args.fxaSettingsV2Root || `${fxaContentRoot}settings`;

// "fxaProduction" is a little overloaded in how it is used in the tests.
// Sometimes it means real "stage" or real production configuration, but
// sometimes it also means fxa-dev style boxes like "latest". Configuration
// parameter "fxaDevBox" can be used as a crude way to distinguish between
// two.
const fxaProduction = !!args.fxaProduction;
const fxaDevBox = !!args.fxaDevBox;

const fxaToken = args.fxaToken || 'http://';
const asyncTimeout = parseInt(args.asyncTimeout || 10000, 10);

// On Circle, we bail after the first failure.
// args.bailAfterFirstFailure comes in as a string.
const bailAfterFirstFailure = args.bailAfterFirstFailure === 'true';

// Intern specific options are here: https://theintern.io/docs.html#Intern/4/docs/docs%2Fconfiguration.md/properties
const config = {
  asyncTimeout: asyncTimeout,
  bail: bailAfterFirstFailure,
  defaultTimeout: 45000, // 30 seconds just isn't long enough for some tests.
  environments: {
    browserName: 'firefox',
    fixSessionCapabilities: 'no-detect',
    usesHandleParameter: true,
  },
  filterErrorStack: true,

  fxaAuthRoot: fxaAuthRoot,
  fxaContentRoot: fxaContentRoot,
  fxaSettingsV2Root: fxaSettingsV2Root,
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

  pageLoadTimeout: 30000,
  reporters: [
    {
      name: 'junit',
      options: {
        filename: output,
      },
    },
    'runner',
  ],
  serverPort: 9091,
  serverUrl: 'http://localhost:9091',
  socketPort: 9077,
  tunnelOptions: {
    drivers: [
      {
        name: 'firefox',
      },
    ],
  },
};

if (args.grep) {
  config.grep = new RegExp(args.grep, 'i');
}

if (args.suites) {
  switch (args.suites) {
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

config.capabilities = {};
config.capabilities['moz:firefoxOptions'] = {};
// to create a profile, give it the `config` option.
config.capabilities['moz:firefoxOptions'].profile = firefoxProfile(config); //eslint-disable-line camelcase
// uncomment to show devtools on launch
// config.capabilities['moz:firefoxOptions'].args = ['-devtools'];

// custom Firefox binary location, if specified then the default is ignored.
// ref: https://code.google.com/p/selenium/wiki/DesiredCapabilities#WebDriver

const failed = [];

intern.on('suiteEnd', (test) => {
  if (test.error) {
    failed.push(test);
  }
});

intern.on('testEnd', (test) => {
  if (test.error) {
    failed.push(test);
  }
});

intern.configure(config);
intern.run().catch((e) => {
  // This might not throw, BUG filed: https://github.com/theintern/intern/issues/868
  console.log(e);
  process.exit(1);
});
