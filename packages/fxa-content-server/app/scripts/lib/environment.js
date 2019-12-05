/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Check the operating environment.
 */

// NOTE: This is run in the HEAD of the document, and must support IE8+.
// No ES5/ES6 features!

// This is loaded in the HEAD of the doc & uses a modified version of
// https://github.com/umdjs/umd/blob/master/amdWeb.js
(function(root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else {
    // Browser globals
    root.FxaHead.Environment = factory();
  }
})(window, function() {
  'use strict';

  function Environment(win) {
    this.window = win;
  }

  Environment.prototype = {
    hasGetUserMedia: function() {
      var nav = this.window.navigator;

      return !!(
        nav.mediaDevices ||
        nav.getUserMedia ||
        nav.webkitGetUserMedia ||
        nav.mozGetUserMedia ||
        nav.msGetUserMedia
      );
    },

    hasPasswordRevealer: function() {
      var document = this.window.document;

      // dirty hack and check IE >= 10 directly.
      return !!(document.documentMode && document.documentMode >= 10);
    },

    hasTouchEvents: function() {
      var win = this.window;
      var document = win.document;

      // BEGIN MODERNIZR BASED CODE
      /*!
       * This code comes from Modernizr v2.7.1
       * www.modernizr.com
       *
       * Copyright (c) Faruk Ates, Paul Irish, Alex Sexton
       * Available under the BSD and MIT licenses: www.modernizr.com/license/
       */

      // touch event check.
      return !!(
        'ontouchstart' in win ||
        (win.DocumentTouch && document instanceof win.DocumentTouch)
      );
      // END MODERNIZR BASED CODE
    },

    isFxiOS: function() {
      // User agent sniffing. Gross.
      return /FxiOS/.test(this.window.navigator.userAgent);
    },

    hasSendBeacon: function() {
      return typeof this.window.navigator.sendBeacon === 'function';
    },
  };

  return Environment;
});
