/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require.config({
  baseUrl: '/scripts',
  paths: {
    jquery: '/bower_components/jquery/dist/jquery',
    backbone: '/bower_components/backbone/backbone',
    underscore: '/bower_components/underscore/underscore',
    fxaClient: '/bower_components/fxa-js-client/fxa-client',
    text: '/bower_components/requirejs-text/text',
    mustache: '/bower_components/mustache/mustache',
    stache: '/bower_components/requirejs-mustache/stache',
    chai: '/bower_components/chai/chai',
    'p-promise': '/bower_components/p/p',
    sinon: '/bower_components/sinon/index',
    speedTrap: '/bower_components/speed-trap/dist/speed-trap'
  },
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    },
    sinon: {
      exports: 'sinon'
    }
  },
  stache: {
    extension: '.mustache'
  }
});

require([
  'lib/translator',
  'lib/session',
  'lib/fxa-client',
  '../tests/setup'
],
function (Translator, Session, FxaClientWrapper) {
  'use strict';

  var tests = [
    '../tests/spec/lib/channels/web',
    '../tests/spec/lib/channels/fx-desktop',
    '../tests/spec/lib/xss',
    '../tests/spec/lib/url',
    '../tests/spec/lib/session',
    '../tests/spec/lib/fxa-client',
    '../tests/spec/lib/oauth-client',
    '../tests/spec/lib/assertion',
    '../tests/spec/lib/translator',
    '../tests/spec/lib/router',
    '../tests/spec/lib/strings',
    '../tests/spec/lib/auth-errors',
    '../tests/spec/lib/app-start',
    '../tests/spec/lib/validate',
    '../tests/spec/lib/service-name',
    '../tests/spec/lib/metrics',
    '../tests/spec/lib/null-metrics',
    '../tests/spec/views/base',
    '../tests/spec/views/tooltip',
    '../tests/spec/views/form',
    '../tests/spec/views/sign_up',
    '../tests/spec/views/complete_sign_up',
    '../tests/spec/views/sign_in',
    // TODO Renable these (issue #1141)
    //'../tests/spec/views/oauth_sign_in',
    //'../tests/spec/views/oauth_sign_up',
    '../tests/spec/views/force_auth',
    '../tests/spec/views/settings',
    '../tests/spec/views/change_password',
    '../tests/spec/views/delete_account',
    '../tests/spec/views/confirm',
    '../tests/spec/views/tos',
    '../tests/spec/views/pp',
    '../tests/spec/views/reset_password',
    '../tests/spec/views/confirm_reset_password',
    '../tests/spec/views/complete_reset_password',
    '../tests/spec/views/ready',
    '../tests/spec/views/cookies_disabled',
    '../tests/spec/views/clear_storage',
    '../tests/spec/views/button_progress_indicator',
    '../tests/spec/views/mixins/floating-placeholder-mixin',
    '../tests/spec/views/mixins/timer-mixin'
  ];

  /*global mocha */

  // The translator is expected to be on the window object.
  window.translator = new Translator('en-US', ['en-US']);

  // Make sure to tests are loaded in proper order using Require.JS
  var index = 0;
  var loadTests = function () {
    var test = tests[index];
    index += 1;
    if (index === tests.length) {
      // run the tests after all of them have loaded
      require([test], runTests);
    } else {
      require([test], loadTests);
    }
  };

  var runTests = function () {
    /**
     * Ensure session state does not pollute other tests
     */
    beforeEach(function () {
      Session.testClear();
      FxaClientWrapper.testClear();
    });

    afterEach(function () {
      Session.testClear();
      FxaClientWrapper.testClear();
    });

    var runner = mocha.run();

    runner.on('end', function () {
      // This is our hook to the Selenium tests that run
      // the mocha tests as part of the CI build.
      // The selenium test will wait until the #total-failures element exists
      // and check for "0"
      var failureEl = document.createElement('div');
      failureEl.setAttribute('id', 'total-failures');
      failureEl.innerHTML = runner.failures || '0';
      document.body.appendChild(failureEl);
    });
  };

  loadTests();

});
