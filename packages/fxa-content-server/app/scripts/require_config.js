/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require.config({
  baseUrl: '/scripts',
  config: {
    moment: {
      noGlobal: true
    }
  },
  packages: [
    {
      location: '../bower_components/jquery-ui/ui',
      main: 'draggable',
      name: 'draggable'
    },
    {
      location: '../bower_components/jquery-ui-touch-punch',
      main: 'jquery.ui.touch-punch',
      name: 'touch-punch'
    }
  ],
  paths: {
    backbone: '../bower_components/backbone/backbone',
    canvasToBlob: '../bower_components/blueimp-canvas-to-blob/js/canvas-to-blob',
    chai: '../bower_components/chai/chai',
    cocktail: '../bower_components/cocktail/Cocktail',
    crosstab: 'vendor/crosstab',
    fxaCheckbox: '../bower_components/fxa-checkbox/checkbox',
    fxaClient: '../bower_components/fxa-js-client/fxa-client',
    jquery: '../bower_components/jquery/dist/jquery',
    'jquery-simulate': '../bower_components/jquery-simulate/jquery.simulate',
    mailcheck: '../bower_components/mailcheck/src/mailcheck',
    md5: '../bower_components/JavaScript-MD5/js/md5',
    modal: '../bower_components/jquery-modal/jquery.modal',
    moment: '../bower_components/moment/moment',
    mustache: '../bower_components/mustache/mustache',
    nocache: 'lib/requirejs-plugin-nocache',
    passwordcheck: '../bower_components/fxa-password-strength-checker/build/fxa-password-strength-checker',
    'p-promise': '../bower_components/p/p',
    raven: '../bower_components/raven-js/dist/raven',
    sinon: '../bower_components/sinon/index',
    sjcl: '../bower_components/sjcl/sjcl',
    speedTrap: '../bower_components/speed-trap/dist/speed-trap',
    stache: '../bower_components/requirejs-mustache/stache',
    text: '../bower_components/requirejs-text/text',
    underscore: '../bower_components/underscore/underscore',
    uuid: '../bower_components/node-uuid/uuid'
  },
  shim: {
    backbone: {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    },
    crosstab: {
      exports: 'crosstab'
    },
    mailcheck: {
      deps: ['jquery'],
      exports: 'mailcheck'
    },
    modal: {
      deps: ['jquery'],
      exports: 'modal'
    },
    sinon: {
      exports: 'sinon'
    },
    sjcl: {
      exports: 'sjcl'
    },
    underscore: {
      exports: '_'
    }
  },
  stache: {
    extension: '.mustache'
  }
});
