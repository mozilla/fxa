/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

require.config({
  baseUrl: '../scripts',
  paths: {
    jquery: '../bower_components/jquery/jquery',
    backbone: '../bower_components/backbone/backbone',
    underscore: '../bower_components/underscore/underscore',
    fxaClient: '../bower_components/fxa-js-client/fxa-client',
    text: '../bower_components/requirejs-text/text',
    mustache: '../bower_components/mustache/mustache',
    stache: '../bower_components/requirejs-mustache/stache',
    transit: '../bower_components/jquery.transit/jquery.transit',
    modernizr: '../bower_components/modernizr/modernizr',
    mocha: '../bower_components/mocha/mocha',
    chai: '../bower_components/chai/chai',
    p: '../bower_components/p/p'
  },
  shim: {
    underscore: {
      exports: '_'
    },
    mocha: {
      exports: 'mocha'
    },
    backbone: {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    },
    transit: {
      deps: [
        'jquery'
      ],
      exports: 'jQuery.fn.transition'
    }
  },
  stache: {
    extension: '.mustache'
  }
});

require([
  'mocha',
  '../tests/setup',
  '../tests/spec/lib/channels/web',
  '../tests/spec/lib/channels/fx-desktop',
  '../tests/spec/lib/xss',
  '../tests/spec/lib/url',
  '../tests/spec/lib/session',
  '../tests/spec/lib/fxa-client',
  '../tests/spec/lib/translator',
  '../tests/spec/lib/router',
  '../tests/spec/views/base',
  '../tests/spec/views/sign_up',
  '../tests/spec/views/sign_in',
  '../tests/spec/views/complete_reset_password',
  '../tests/spec/views/settings',
  '../tests/spec/views/change_password',
  '../tests/spec/views/delete_account',
  '../tests/spec/views/confirm',
  '../tests/spec/views/confirm_reset_password',
  '../tests/spec/views/tos',
  '../tests/spec/views/pp'
],
function (Mocha) {
  // Use a mock for the translator
  window.translator = {
    get: function (key) {
      return key;
    }
  };

  var runner = Mocha.run();

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
});


