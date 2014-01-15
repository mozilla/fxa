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
    gherkin: '../bower_components/fxa-js-client-old/web/bundle',
    text: '../bower_components/requirejs-text/text',
    mustache: '../bower_components/mustache/mustache',
    stache: '../bower_components/requirejs-mustache/stache',
    transit: '../bower_components/jquery.transit/jquery.transit',
    modernizr: '../bower_components/modernizr/modernizr',
    mocha: '../bower_components/mocha/mocha',
    chai: '../bower_components/chai/chai'
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
  '../tests/spec/lib/channels/fx-desktop',
  '../tests/spec/lib/xss',
  '../tests/spec/lib/url'
],
function (Mocha) {
  var runner = Mocha.run();

  runner.on('end', function() {

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


