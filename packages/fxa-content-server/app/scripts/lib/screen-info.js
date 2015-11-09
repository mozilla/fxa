/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// module to calculate screen dimentions given a window.

define(function (require, exports, module) {
  'use strict';


  var NOT_REPORTED_VALUE = 'none';

  function ScreenInfo(win) {
    var documentElement = win.document.documentElement || {};
    var screen = win.screen || {};

    // for more information:
    // http://quirksmode.org/mobile/viewports.html and
    // http://quirksmode.org/mobile/viewports2.html
    this.clientHeight = documentElement.clientHeight || NOT_REPORTED_VALUE;
    this.clientWidth = documentElement.clientWidth || NOT_REPORTED_VALUE;
    this.devicePixelRatio = win.devicePixelRatio || NOT_REPORTED_VALUE;
    this.screenHeight = screen.height || NOT_REPORTED_VALUE;
    this.screenWidth = screen.width || NOT_REPORTED_VALUE;
  }

  module.exports = ScreenInfo;
});

