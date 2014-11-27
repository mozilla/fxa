/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define([
  'intern/lib/args',
  'intern/node_modules/dojo/has!host-node?intern/node_modules/dojo/topic',
  './tools/firefox_profile'
],
function (args, topic, firefoxProfile) {
  'use strict';

  var fxaAuthRoot = args.fxaAuthRoot || 'http://127.0.0.1:9000/v1';
  var fxaContentRoot = args.fxaContentRoot || 'http://127.0.0.1:3030/';
  var fxaEmailRoot = args.fxaEmailRoot || 'http://127.0.0.1:9001';
  var fxaOauthApp = args.fxaOauthApp || 'http://127.0.0.1:8080/';
  var fxaProduction = !!args.fxaProduction;
  var fxaToken = args.fxaToken || 'http://';

  if (topic) {
    topic.subscribe('/suite/start', function (suite) {
      console.log('Running: ' + suite.name);
    });
  }

  var config = {
    // The port on which the instrumenting proxy will listen
    proxyPort: 9090,

    // A fully qualified URL to the Intern proxy
    proxyUrl: 'http://127.0.0.1:9090/',

    asyncTimeout: 5000, // milliseconds

    fxaAuthRoot: fxaAuthRoot,
    fxaContentRoot: fxaContentRoot,
    fxaEmailRoot: fxaEmailRoot,
    fxaOauthApp: fxaOauthApp,
    fxaProduction: fxaProduction,
    fxaToken: fxaToken,

    // Default desired capabilities for all environments. Individual capabilities can be overridden by any of the
    // specified browser environments in the `environments` array below as well. See
    // https://code.google.com/p/selenium/wiki/DesiredCapabilities for standard Selenium capabilities and
    // https://saucelabs.com/docs/additional-config#desired-capabilities for Sauce Labs capabilities.
    // Note that the `build` capability will be filled in with the current commit ID from the Travis CI environment
    // automatically
    capabilities: { },

    // Browsers to run integration testing against. Note that version numbers must be strings if used with Sauce
    // OnDemand. Options that will be permutated are browserName, version, platform, and platformVersion; any other
    // capabilities options specified for an environment will be copied as-is
    environments: [
      { browserName: 'firefox' }
    ],

    // the default test timeout is 30 seconds
    // make it 28 seconds to see the timeout error stack
    pageLoadTimeout: 28000,

    // Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
    maxConcurrency: 3,

    // Functional test suite(s) to run in each browser once non-functional tests are completed
    functionalSuites: [ 'tests/functional/mocha', 'tests/functional' ],

    // A regular expression matching URLs to files that should not be included in code coverage analysis
    excludeInstrumentation: /./
  };

  //to create a profile, give it the `config` option.
  config.capabilities.firefox_profile = firefoxProfile(config);

  return config;
});
