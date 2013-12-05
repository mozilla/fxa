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
  'router'
],
function (Backbone, Router) {
  // This is kind of weak but solves circular dependency issues
  window.router = new Router();

  // Get the party started
  Backbone.history.start({ pushState: true });
});
