/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define([
  'intern',
  'intern/node_modules/dojo/has!host-node?intern/node_modules/dojo/topic',
  './tools/firefox_profile'
],
function (intern, topic, firefoxProfile) {
  var args = intern.args;
  var fxaAuthRoot = args.fxaAuthRoot || 'http://127.0.0.1:9000/v1';
  var fxaContentRoot = args.fxaContentRoot || 'http://127.0.0.1:3030/';
  var fxaEmailRoot = args.fxaEmailRoot || 'http://127.0.0.1:9001';
  var fxaOauthApp = args.fxaOauthApp || 'http://127.0.0.1:8080/';
  var fxaUntrustedOauthApp = args.fxaUntrustedOauthApp || 'http://127.0.0.1:10139/';
  var fxaIframeOauthApp = args.fxaIframeOauthApp || 'http://127.0.0.1:8080/iframe';

  // "fxaProduction" is a little overloaded in how it is used in the tests.
  // Sometimes it means real "stage" or real production configuration, but
  // sometimes it also means fxa-dev style boxes like "latest". Configuration
  // parameter "fxaDevBox" can be used as a crude way to distinguish between
  // two.
  var fxaProduction = !! args.fxaProduction;
  var fxaDevBox = !! args.fxaDevBox;

  var fxaToken = args.fxaToken || 'http://';
  var asyncTimeout = parseInt(args.asyncTimeout || 5000, 10);

  if (topic) {
    topic.subscribe('/suite/start', function (suite) {
      console.log('Running: ' + suite.name);
    });
  }

  var config = {
    asyncTimeout: asyncTimeout,
    capabilities: {},
    environments: [{ browserName: 'firefox' }],
    excludeInstrumentation: true,
    fixSessionCapabilities: false,
    functionalSuites: [
      'tests/functional/mocha',
      'tests/functional'
    ],
    fxaAuthRoot: fxaAuthRoot,
    fxaContentRoot: fxaContentRoot,
    fxaDevBox: fxaDevBox,
    fxaEmailRoot: fxaEmailRoot,
    fxaIframeOauthApp: fxaIframeOauthApp,
    fxaOauthApp: fxaOauthApp,
    fxaProduction: fxaProduction,
    fxaToken: fxaToken,
    fxaUntrustedOauthApp: fxaUntrustedOauthApp,
    maxConcurrency: 3,
    pageLoadTimeout: 28000,
    proxyPort: 9090,
    proxyUrl: 'http://127.0.0.1:9090/'
  };

  // to create a profile, give it the `config` option.
  config.capabilities.firefox_profile = firefoxProfile(config); //eslint-disable-line camelcase

  // custom Firefox binary location, if specified then the default is ignored.
  // ref: https://code.google.com/p/selenium/wiki/DesiredCapabilities#WebDriver
  if (args.firefoxBinary) {
    config.capabilities.firefox_binary = args.firefoxBinary; //eslint-disable-line camelcase
  }

  return config;
});
