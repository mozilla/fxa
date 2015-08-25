/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require.config({
  baseUrl: '/scripts',
  paths: {
    jquery: '../bower_components/jquery/dist/jquery',
    backbone: '../bower_components/backbone/backbone',
    underscore: '../bower_components/underscore/underscore',
    fxaClient: '../bower_components/fxa-js-client/fxa-client',
    text: '../bower_components/requirejs-text/text',
    mustache: '../bower_components/mustache/mustache',
    stache: '../bower_components/requirejs-mustache/stache',
    nocache: 'lib/requirejs-plugin-nocache',
    chai: '../bower_components/chai/chai',
    cocktail: '../bower_components/cocktail/Cocktail',
    'p-promise': '../bower_components/p/p',
    sjcl: '../bower_components/sjcl/sjcl',
    sinon: '../bower_components/sinon/index',
    speedTrap: '../bower_components/speed-trap/dist/speed-trap',
    md5: '../bower_components/JavaScript-MD5/js/md5',
    canvasToBlob: '../bower_components/blueimp-canvas-to-blob/js/canvas-to-blob',
    moment: '../bower_components/moment/moment',
    mailcheck: '../bower_components/mailcheck/src/mailcheck',
    crosstab: 'vendor/crosstab',
    uuid: '../bower_components/node-uuid/uuid',
    'jquery-simulate': '../bower_components/jquery-simulate/jquery.simulate',
    modal: '../bower_components/jquery-modal/jquery.modal',
    raven: '../bower_components/raven-js/dist/raven',
    passwordcheck: '../bower_components/fxa-password-strength-checker/build/fxa-password-strength-checker'
  },
  config: {
    moment: {
      noGlobal: true
    }
  },
  packages: [
    { name: 'draggable',
      location: '../bower_components/jquery-ui/ui',
      main: 'draggable'
    },
    { name: 'touch-punch',
      location: '../bower_components/jquery-ui-touch-punch',
      main: 'jquery.ui.touch-punch'
    }
  ],
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
    },
    crosstab: {
      exports: 'crosstab'
    },
    sjcl: {
      exports: 'sjcl'
    },
    modal: {
      deps: ['jquery'],
      exports: 'modal'
    },
    mailcheck: {
      deps: ['jquery'],
      exports: 'mailcheck'
    }
  },
  stache: {
    extension: '.mustache'
  }
});
