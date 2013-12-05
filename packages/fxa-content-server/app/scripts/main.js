'use strict';

require.config({
  paths: {
    jquery: '../bower_components/jquery/jquery',
    backbone: '../bower_components/backbone/backbone',
    underscore: '../bower_components/underscore/underscore',
    hgn: '../bower_components/requirejs-hogan-plugin/hgn',
    text: '../bower_components/requirejs-hogan-plugin/text',
    hogan: '../bower_components/requirejs-hogan-plugin/hogan',
    gherkin: '../bower_components/fxa-js-client-old/web/bundle'
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
    gherkin: {
      exports: 'gherkin'
    }
  },
});

require([
  'backbone',
  'router',
  'lib/translator'
],
function (Backbone, Router, Translator) {
  // A few globals
  window.router = new Router();
  window.translator = new Translator(window.navigator.language);

  // Don't start backbone until we have our translations
  translator.fetch(function() {
    // Get the party started
    Backbone.history.start({ pushState: true });
  });
});
