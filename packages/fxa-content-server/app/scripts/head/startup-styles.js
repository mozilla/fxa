/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Adds styles on app startup. Used to eliminate startup screen flicker
// by adding classes to the HTML element before any content is rendered.
// Run from the HEAD element of the page.

// NOTE: This file must run in IE8+, so no ES5/ES6 features!

// This is loaded in the HEAD of the doc & uses a modified version of
// https://github.com/umdjs/umd/blob/master/amdWeb.js
(function (root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['lib/environment'], factory);
  } else {
    // Browser globals
    root.FxaHead.StartupStyles = factory(root.FxaHead.Environment);
  }
}(this, function (Environment) {
  'use strict';

  function parseQueryParams(queryParams) {
    var search = queryParams.replace(/^\?/, '');
    var paramPairs = search.split('&');
    var params = {};

    // Use old school for instead of Array.prototype.forEach because
    // this still has to run in IE8 even if the rest of the
    // app doesn't.
    for (var i = 0; i < paramPairs.length; ++i) {
      var paramPair = paramPairs[i].split('=');
      params[paramPair[0]] = paramPair[1] || 'undefined';
    }

    return params;
  }

  function isStyleAllowed(style, queryParams) {
    var service = queryParams.service;
    var context = queryParams.context;

    // The 'chromeless' style is only opened up
    // to Sync when using an iframe.
    if (style === 'chromeless') {
      return (service === 'sync' && context === 'iframe');
    }

    return false;
  }

  function StartupStyles(options) {
    this.window = options.window || window;
    this.environment = options.environment || new Environment(this.window);
  }

  StartupStyles.prototype = {
    _addClass: function (className) {
      this.window.document.documentElement.className += (' ' + className);
    },

    getClassName: function () {
      return this.window.document.documentElement.className;
    },

    _getQueryParams: function () {
      return parseQueryParams(this.window.location.search);
    },

    _getQueryParam: function (paramName) {
      return this._getQueryParams()[paramName];
    },

    initialize: function () {
      this.addTouchEventStyles();
      this.addPasswordRevealerStyles();
      this.addIframeStyles();
      this.addSearchParamStyles();
      this.addFxiOSSyncStyles();
      this.addGetUserMediaStyles();
    },

    addTouchEventStyles: function () {
      if (this.environment.hasTouchEvents()) {
        this._addClass('touch');
      } else {
        this._addClass('no-touch');
      }
    },

    addPasswordRevealerStyles: function () {
      if (this.environment.hasPasswordRevealer()) {
        this._addClass('reveal-pw');
      } else {
        this._addClass('no-reveal-pw');
      }
    },

    addIframeStyles: function () {
      /**
       * The iframe'd OAuth flow needs special styling applied to it as
       * soon as possible so that it doesn't look terrible.
       */
      if (this.environment.isFramed()) {
        this._addClass('iframe');
      }
    },

    addSearchParamStyles: function () {
      /**
       * A relier can add the `style=x` query parameter to indicate
       * an alternative styling should be used.
       * Allowed styles:
       *   * chromeless
       */
      var style = this._getQueryParam('style');
      var queryParams = this._getQueryParams();
      if (isStyleAllowed(style, queryParams)) {
        this._addClass(style);
      }
    },

    addFxiOSSyncStyles: function () {
      var isSync = this._getQueryParam('service') === 'sync';
      if (this.environment.isFxiOS() && isSync) {
        this._addClass('fx-ios-sync');
      }
    },

    addGetUserMediaStyles: function () {
      if (this.environment.hasGetUserMedia()) {
        this._addClass('getusermedia');
      } else {
        this._addClass('no-getusermedia');
      }
    }
  };

  return StartupStyles;
}));
