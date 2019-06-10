/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This is a port to TypeScript of this fxa-content-server library:
// https://github.com/mozilla/fxa/blob/master/packages/fxa-content-server/app/scripts/lib/screen-info.js

// module to calculate screen dimentions given a window.

enum ScreenInfoOther {
  NOT_REPORTED_VALUE = 'none',
}

class ScreenInfo {
  clientHeight: number | ScreenInfoOther;
  clientWidth: number | ScreenInfoOther;
  devicePixelRatio: number | ScreenInfoOther;
  screenHeight: number | ScreenInfoOther;
  screenWidth: number | ScreenInfoOther;

  constructor(win: Window) {
    var documentElement = win.document.documentElement || {};
    var screen = win.screen || {};
  
    // for more information:
    // http://quirksmode.org/mobile/viewports.html and
    // http://quirksmode.org/mobile/viewports2.html
    this.clientHeight = documentElement.clientHeight || ScreenInfoOther.NOT_REPORTED_VALUE;
    this.clientWidth = documentElement.clientWidth || ScreenInfoOther.NOT_REPORTED_VALUE;
    this.devicePixelRatio = win.devicePixelRatio || ScreenInfoOther.NOT_REPORTED_VALUE;
    this.screenHeight = screen.height || ScreenInfoOther.NOT_REPORTED_VALUE;
    this.screenWidth = screen.width || ScreenInfoOther.NOT_REPORTED_VALUE;
  }  
}

export default ScreenInfo;
