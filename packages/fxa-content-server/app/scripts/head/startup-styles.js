/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Adds styles on app startup. Used to eliminate startup screen flicker
// by adding classes to the HTML element before any content is rendered.
// Run from the HEAD element of the page.

// NOTE: This file must run in IE8+, so no ES5/ES6 features!

import Environment from '../lib/environment';

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

function StartupStyles(options) {
  this.window = options.window || window;
  this.environment = options.environment || new Environment(this.window);
}

StartupStyles.prototype = {
  _addClass: function (className) {
    this.window.document.documentElement.className += ' ' + className;
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
    this.addJSStyle();
    this.addTouchEventStyles();
    this.addPasswordRevealerStyles();
    this.addFxiOSSyncStyles();
    this.addGetUserMediaStyles();
    this.addDarkModeStyles();
  },

  addJSStyle: function () {
    this._addClass('js');
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
  },

  addDarkModeStyles: function () {
    // Read theme preference from localStorage (shared with fxa-settings)
    var themePreference = null;
    try {
      themePreference = this.window.localStorage.getItem('theme_preference');
    } catch (e) {
      // localStorage may be disabled
    }

    var prefersDark = false;
    if (themePreference === 'dark') {
      prefersDark = true;
    } else if (themePreference === 'light') {
      prefersDark = false;
    } else {
      // Default to system preference
      if (this.window.matchMedia && this.window.matchMedia('(prefers-color-scheme: dark)').matches) {
        prefersDark = true;
      }
    }

    if (prefersDark) {
      this._addClass('dark');
    }
  },
};

export default StartupStyles;
