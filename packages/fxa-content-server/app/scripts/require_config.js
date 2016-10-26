/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*eslint-disable strict*/

var STATIC_RESOURCE_HOST = '';

if (typeof window !== 'undefined') {
  var bodyEl = document.querySelector('body');
  STATIC_RESOURCE_HOST = bodyEl.getAttribute('data-static-resource-host') || '';
} else if (typeof global !== 'undefined') {
  // being run in node for the build step. Mock in require, and
  // export the config
  require = {
    config: function (cfg) {
      module.exports = cfg;
    }
  };
}

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
  requireOnDemand: [
    'fxaClient',
    'jwcrypto',
    'passwordcheck'
  ],
  // the sriify task will replace sriConfig for production
  // DO NOT EDIT BELOW HERE
  sriConfig: {},
  // DO NOT EDIT ABOVE HERE
  onNodeCreated: function (node, config, module, path) {
    // Add the resource prefix to the node's source. This will
    // force any JS to be loaded from the CDN in production mode.
    // This hacktastic approach is taken instead of writing the full
    // URL directly into the JS so that the exact same resources can
    // be used on both stage and prod. They both use different CDN
    // hostnames, so a method is needed to fetch the CDN hostname
    // at runtime.
    node.src = STATIC_RESOURCE_HOST + path;

    // If the module has an SRI hash specified,
    // force it to be used when loading.
    var integrityForModule = config.sriConfig[module];
    if (integrityForModule) {
      node.setAttribute('integrity', integrityForModule);
      node.setAttribute('crossorigin', 'anonymous');
    }
  },
  paths: {
    backbone: '../bower_components/backbone/backbone',
    canvasToBlob: '../bower_components/blueimp-canvas-to-blob/js/canvas-to-blob',
    chai: '../bower_components/chai/chai',
    cocktail: '../bower_components/cocktail/Cocktail',
    duration: '../bower_components/Duration.js/duration',
    fxaCheckbox: '../bower_components/fxa-checkbox/checkbox',
    fxaClient: '../bower_components/fxa-js-client/fxa-client',
    jquery: '../bower_components/jquery/dist/jquery',
    'jquery-simulate': '../bower_components/jquery-simulate/jquery.simulate',
    // jwcrypto is used by the main app and only contains DSA
    // jwcrypto.rs is used by the unit tests to unbundle and verify
    // assertions, which require RSA.
    jwcrypto: 'vendor/jwcrypto/jwcrypto.ds',
    'jwcrypto.rs': 'vendor/jwcrypto/jwcrypto.rs',
    mailcheck: '../bower_components/mailcheck/src/mailcheck',
    md5: '../bower_components/JavaScript-MD5/js/md5',
    modal: '../bower_components/jquery-modal/jquery.modal',
    moment: '../bower_components/moment/moment',
    mustache: '../bower_components/mustache/mustache',
    passwordcheck: '../bower_components/fxa-password-strength-checker/build/fxa-password-strength-checker',
    'p-promise': '../bower_components/p/p',
    raven: '../bower_components/raven-js/dist/raven',
    sinon: '../bower_components/sinon/lib/sinon',
    speedTrap: '../bower_components/speed-trap/dist/speed-trap',
    stache: '../bower_components/requirejs-mustache/stache',
    text: '../bower_components/requirejs-text/text',
    underscore: '../bower_components/underscore/underscore',
    uuid: '../bower_components/node-uuid/uuid',
    vat: '../bower_components/vat/vat',
    webrtc: '../bower_components/webrtc-adapter/adapter'
  },
  shim: {
    backbone: {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
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
/*eslint-enable strict*/

