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
  'lib/constants',
  'lib/translator',
  'lib/session',
  'lib/url',
  'lib/channels/web',
  'lib/channels/fx-desktop'
],
function (
  Backbone,
  Router,
  Constants,
  Translator,
  Session,
  Url,
  WebChannel,
  FxDesktopChannel
) {
  function getChannel() {
    var context = Url.searchParam('context');
    var channel;

    if (context === Constants.FX_DESKTOP_CONTEXT) {
      // Firefox for desktop native=>FxA glue code.
      channel = new FxDesktopChannel();
    } else {
      // default to the web channel that doesn't do anything yet.
      channel = new WebChannel();
    }

    channel.init();
    return channel;
  }

  function setSessionValueFromUrl(name) {
    var value = Url.searchParam(name);
    if (value) {
      Session.set(name, value);
    } else {
      Session.clear(name);
    }
  }

  function initSessionFromUrl() {
    setSessionValueFromUrl('service');
    setSessionValueFromUrl('redirectTo');
    setSessionValueFromUrl('context');
  }

  window.router = new Router();

  initSessionFromUrl();

  // Don't start backbone until we have our config and translations
  $.getJSON('/config', function (config) {

    Session.set('config', config);

    // IE uses navigator.browserLanguage, all others user navigator.language.
    var language = window.navigator.browserLanguage || window.navigator.language || 'en-US';

    window.translator = new Translator(language,
                                       config.i18n.supportedLanguages,
                                       config.i18n.defaultLang);

    translator.fetch(function () {
      // Get the party started
      Backbone.history.start({ pushState: true });

      // The channel must be initialized after Backbone.history so that the
      // Backbone does not override the page the channel sets.
      Session.set('channel', getChannel());
    });
  });
});


