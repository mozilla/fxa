/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define(['intern/lib/args'], function (args) {

  // define a server to run against
  var server;

  // if 'auth_server' in the Intern args
  if (args.auth_server) {
    server = args.auth_server;
    if (server === 'LOCAL') {
      server = 'http://127.0.0.1:9000';
    }

    if (server === 'DEV') {
      server = 'https://api-accounts.dev.lcip.org';
    }

    if (server === 'LATEST') {
      server = 'https://api-accounts-latest.dev.lcip.org';
    }
    console.log('Running against ' + server);
  } else {
    console.log('Running with mocks...');
  }

  return {
    loader: {
    // Packages that should be registered with the loader in each testing environment
      packages: [ { name: 'fxa-js-client', location: 'client' } ],
      map: {
        '*': {
          sjcl: 'components/sjcl/sjcl',
          p: 'components/p/p'
        }
      }
    },

    suites: [ 'tests/all' ],
    functionalSuites: [ ],
    AUTH_SERVER_URL: server,

    excludeInstrumentation: /./

  };

});
