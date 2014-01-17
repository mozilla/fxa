/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

require.config({
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
    p: '../bower_components/p/p'
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
  'backbone',
  'router',
  'lib/translator',
  'lib/session',
  'lib/channels/fx-desktop'
],
function (Backbone, Router, Translator, Session, FxDesktopChannel) {
  window.router = new Router();

  // IE8 does not support window.navigator.language. Set a default of English.
  window.translator = new Translator(window.navigator.language || 'en');

  // Don't start backbone until we have our translations
  translator.fetch(function () {
    // Get the party started
    Backbone.history.start({ pushState: true });

    // Firefox for desktop native=>FxA glue code.
    // this must be initialized after Backbone.history so that the
    // Backbone does not override the page the channel sets.
    var desktopChannel = new FxDesktopChannel();
    desktopChannel.init();

    Session.channel = desktopChannel;

  });
});


