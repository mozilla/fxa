/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const UAParser = require('ua-parser-js');

  module.exports = function (userAgent) {
    const uap = UAParser(userAgent);

    _.extend(uap, {
      /**
       * Check if the OS is Android.
       *
       * @returns {Boolean}
       */
      isAndroid () {
        return this.os.name === 'Android';
      },

      /**
       * Check if the OS is iOS.
       *
       * @returns {Boolean}
       */
      isIos () {
        return this.os.name === 'iOS';
      },

      /**
       * Check if the browser is Mobile Safari.
       *
       * @returns {Boolean}
       */
      isMobileSafari () {
        return this.browser.name === 'Mobile Safari';
      },

      /**
       * Check if the browser is Firefox
       *
       * @returns {Boolean}
       */
      isFirefox () {
        return this.browser.name === 'Firefox';
      }
    });

    return uap;
  };

});
