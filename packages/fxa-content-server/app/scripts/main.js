'use strict';

require.config({
  paths: {
    jquery: '../bower_components/jquery/jquery',
    backbone: '../bower_components/backbone/backbone',
    underscore: '../bower_components/underscore/underscore',
    hgn: '../bower_components/requirejs-hogan-plugin/hgn',
    text: '../bower_components/requirejs-hogan-plugin/text',
    hogan: '../bower_components/requirejs-hogan-plugin/hogan'
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
    }
  },
});

require([
  'backbone',
  'router'
  ],
  function (Backbone, Router) {
    Backbone.history.start();
  }
);
